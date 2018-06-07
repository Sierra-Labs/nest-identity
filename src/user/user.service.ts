import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@sierralabs/nest-utils';
import * as bcrypt from 'bcryptjs';
import { JwtToken } from '../auth/jwt-token.interface';
import { AuthService } from '../auth/auth.service';
import { ModuleRef } from '@nestjs/core';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

  private authService: AuthService;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly moduleRef: ModuleRef
  ) {}

  /**
   * Implement circular dependency for UserService.
   */
  onModuleInit() {
    // Prevents circular dependency issue since AuthService also requires UserService
    this.authService = this.moduleRef.get<AuthService>(AuthService);
  }

  public async findById(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }

  public async findByEmail(email: string, fields?: string[]): Promise<User> {
    const query = this.userRepository.createQueryBuilder('user');

    if (fields) {
      query.select('user.id');
      for (const field of fields) {
        query.addSelect(field);
      }
    }
    query
      // .leftJoinAndSelect('user.profileMedia', 'media')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.email = :email')
      .setParameters({ email });
    if (fields) {
      return query.getRawOne();
    } else {
      return query.getOne();
    }
  }

  public async findWithFilter(
    order: any,
    limit: number,
    offset: number,
    filter: string
  ): Promise<User[]> {
    return this.userRepository.createQueryBuilder('user')
      .where(
        `(user.id)::text LIKE :filter OR
              first_name LIKE :filter OR
              last_name LIKE :filter OR
              user.email LIKE :filter`,
        { filter }
      )
      .orderBy(order)
      .limit(limit)
      .offset(offset)
      .getMany();
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
    const user = await this.findByEmail(email);
    if (!user /*|| !user.verified*/) {
      // TODO: verify user

      // arbitrary bcrypt.compare to prevent(?) timing attacks. Both good/bad paths take
      // roughly the same amount of time
      await bcrypt.compare(
        '1234567890',
        '$2a$14$x.V6i0bmERvdde/UJ/Fk3u41fIqDVMrn0VDP6JDIzbAShOFQqZ9PW'
      );

      throw new UnauthorizedException();
    }
    if (await bcrypt.compare(password, user.password)) {
      return this.authService.createToken(user.id, email);
    }
    throw new UnauthorizedException();
  }

  public async create(user: User): Promise<User> {
    delete user.id; // make sure no existing id exists when saving user
    return this.userRepository.save(user);
  }

  public async update(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
