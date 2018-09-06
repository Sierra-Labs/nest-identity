import * as bcrypt from 'bcryptjs';
import _ from 'lodash';
import { Repository, UpdateResult } from 'typeorm';

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@sierralabs/nest-utils';

import { AuthService } from '../auth/auth.service';
import { JwtToken } from '../auth/jwt-token.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  protected authService: AuthService;

  constructor(
    @InjectRepository(User) protected readonly userRepository: Repository<User>,
    protected readonly configService: ConfigService,
    // protected readonly authService: AuthService,
    protected readonly moduleRef: ModuleRef,
  ) {}

  /**
   * Implement circular dependency for UserService.
   */
  onModuleInit() {
    // Prevents circular dependency issue since AuthService also requires UserService
    this.authService = this.moduleRef.get<AuthService>('AuthService');
  }

  public async findById(id: number): Promise<User> {
    if (!id) throw new BadRequestException('id not provided');
    return this.userRepository.findOne(id);
  }

  /**
   * Look up a `User` record by `email` address. Additional configuration can be provided
   * through the `options` parameter.
   * @param email The email address to look up.
   * @param options The options configuration.
   * @param options.selectPassword Set this flag to enable the password field to be returned.
   * @param options.fields An array of strings for custom field selection.
   */
  public async findByEmail(
    email: string,
    options?: { selectPassword?: boolean; fields?: string[] },
  ): Promise<User> {
    const query = this.userRepository.createQueryBuilder('user');

    if (options) {
      if (options.selectPassword) {
        query.addSelect('user.password');
      }
      if (options.fields) {
        query.select('user.id', 'id');
        for (const field of options.fields) {
          if (_.isArray(field) && field.length === 2) {
            query.addSelect(field[0], field[1]);
          } else {
            query.addSelect(field);
          }
        }
      }
    }
    query
      // .leftJoinAndSelect('user.profileMedia', 'media')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.email = :email')
      .setParameters({ email });
    if (options && options.fields) {
      return query.getRawOne();
    } else {
      return query.getOne();
    }
  }

  public async findWithFilter(
    order: any,
    limit: number = 100,
    offset: number = 0,
    filter: string,
    fields?: string[],
  ): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');
    // if (fields) {
    //   query.select(fields);
    // }
    // query.addSelect('user.id', 'id');
    // query.addSelect('user.email', 'email');
    // query.addSelect('user.first_name', 'firstName');
    // query.addSelect('user.last_name', 'lastName');
    // query.addSelect('user.verified', 'verified');
    // query.addSelect('user.deleted', 'deleted');
    query
      .where(
        `(user.id)::text LIKE :filter OR
              first_name LIKE :filter OR
              last_name LIKE :filter OR
              user.email LIKE :filter`,
        { filter },
      )
      .orderBy(order)
      .limit(limit)
      .offset(offset);
    return query.getMany();
  }

  public async countWithFilter(filter: string): Promise<number> {
    return this.userRepository
      .createQueryBuilder('user')
      .where(
        `(user.id)::text LIKE :filter OR
        first_name LIKE :filter OR
        last_name LIKE :filter OR
        user.email LIKE :filter`,
        { filter },
      )
      .getCount();
  }

  public async changePassword(user: User, password: string): Promise<User> {
    const rounds = await this.configService.get('password.rounds');
    // tslint:disable-next-line
    if (password.indexOf('$2a$') === 0 && password.length === 60) {
      // assume already a hash, maybe copied from another record
      user.password = password;
    } else {
      user.password = await bcrypt.hash(password, rounds);
    }
    return user;
  }

  public async login(email: string, password: string): Promise<JwtToken> {
    const user = await this.findByEmail(email, { selectPassword: true });

    if (!user || user.deleted /*|| !user.verified*/) {
      // TODO: check if user is email verified

      // arbitrary bcrypt.compare to prevent(?) timing attacks. Both good/bad paths take
      // roughly the same amount of time
      await bcrypt.compare(
        '1234567890',
        '$2a$14$x.V6i0bmERvdde/UJ/Fk3u41fIqDVMrn0VDP6JDIzbAShOFQqZ9PW',
      );

      throw new UnauthorizedException();
    }
    if (await bcrypt.compare(password, user.password)) {
      const jwtToken = await this.authService.createToken(user.id, email);
      jwtToken.user = user;
      delete jwtToken.user.password; // remove token password
      return jwtToken;
    }
    throw new UnauthorizedException();
  }

  public async logout() {
    // TODO: invalidate the the JWT access token through a blacklist
  }

  public async create(user: User): Promise<User> {
    user.verified = true;
    if (user.password) {
      user = await this.changePassword(user, user.password);
    }
    delete user.id; // make sure no existing id exists when saving user
    return this.userRepository.save(user);
  }

  public async register(user: User): Promise<User> {
    // new account created by the public should not have an id yet, nor should they be verified
    delete user.id;
    user.verified = false;
    if (user.password) {
      user = await this.changePassword(user, user.password);
    }
    const newUser = this.userRepository.save(user);

    // TODO: Impelement email delivery
    // const fromEmail = await this.configService.get('email.from');
    // await this.emailService.sendTemplate(
    //   fromEmail,
    //   newUser.email,
    //   'Welcome Subject',
    //   'welcome',
    //   { name: newUser.username }
    // );
    return newUser;
  }

  public async update(user: User): Promise<User> {
    user.id = Number(user.id); // force id to be a number
    delete user.createdBy; // don't save the createdBy field
    return this.userRepository.save(user);
  }

  public async remove(id: number, modifiedBy: number): Promise<UpdateResult> {
    return this.userRepository.update({ id }, { deleted: true, modifiedBy });
  }
}
