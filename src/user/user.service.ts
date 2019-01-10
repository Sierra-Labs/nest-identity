import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { Repository, UpdateResult } from 'typeorm';

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  Logger,
  Inject,
  Optional,
  NotImplementedException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@sierralabs/nest-utils';

import { AuthService } from '../auth/auth.service';
import { JwtToken } from '../auth/jwt-token.interface';
import { User } from '../entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { MailerProvider } from '@nest-modules/mailer';
import { RegisterDto } from './user.dto';
import { JwtPayload } from '../auth/jwt-payload.interface';
const defaultConfig = require('../../config/config.json');

@Injectable()
export class UserService implements OnModuleInit {
  protected authService: AuthService;
  private logger = new Logger('UserService');
  private LIKE_OPERATOR: string = 'LIKE';

  constructor(
    @InjectRepository(User) protected readonly userRepository: Repository<User>,
    protected readonly configService: ConfigService,
    protected readonly rolesService: RolesService,
    protected readonly moduleRef: ModuleRef,
    @Optional()
    @Inject('MailerProvider') protected readonly mailerProvider?: MailerProvider,
  ) {
    if (this.userRepository.manager.connection.options.type === 'postgres') {
      this.LIKE_OPERATOR = 'ILIKE'; // postgres case insensitive LIKE
    }
  }

  /**
   * Implement circular dependency for UserService.
   */
  onModuleInit() {
    // Prevents circular dependency issue since AuthService also requires UserService
    this.authService = this.moduleRef.get<AuthService>('AuthService');
    this.initialize();
  }

  public async initialize(superAdmin?: User) {
    let saConfig: any;
    try {
      saConfig = await this.configService.get('superadmin');
    } catch (error) {
      saConfig = { autoCreate: false };
    }
    if (saConfig && saConfig.autoCreate) {
      await this.rolesService.initializeRoles(saConfig.defaultRole); // ensure the roles are initialized first
      this.logger.log('Initializing Users...');
      const count = await this.userRepository.count();
      if (count <= 0) {
        this.logger.log('No users defined yet, creating superadmin user...');
        const role = await this.rolesService.findByName(
          saConfig.defaultRole || 'Admin',
        );
        const defaultAdmin = {
          id: 1,
          email: saConfig.defaultEmail || 'super@admin.com',
          password: saConfig.defaultPassword || 'superadmin',
          firstName: 'Super',
          lastName: 'Admin',
          verified: true,
          roles: [role],
          deleted: false,
          created: new Date(),
          createdBy: 1,
          modified: new Date(),
          modifiedBy: 1,
        };
        if (superAdmin) {
          Object.assign(defaultAdmin, superAdmin);
        }
        const root = await this.create(defaultAdmin);
        this.logger.log('Super Admin user created:' + JSON.stringify(root));
      } else {
        this.logger.log('Skipping super admin creation, users already exist.');
      }
    }
  }

  public async findById(id: number): Promise<User> {
    if (!id) throw new BadRequestException('id not provided');
    return this.userRepository.findOne({
      where: { id },
    });
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
    includeDeleted?: boolean,
  ): Promise<[User[], number]> {
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
    query.where(
      `((user.id)::text ${this.LIKE_OPERATOR} :filter OR
        first_name ${this.LIKE_OPERATOR} :filter OR
        last_name ${this.LIKE_OPERATOR} :filter OR
        user.email ${this.LIKE_OPERATOR} :filter)`,
      { filter },
    );

    if (!includeDeleted) {
      query.andWhere('user.deleted = false');
    }
    query
      .orderBy(order)
      .limit(limit)
      .offset(offset);
    const count = await query.getCount();
    const users = await query.getMany();
    return new Promise<[User[], number]>(resolve => resolve([users, count]));
  }

  public async countWithFilter(
    filter: string,
    includeDeleted?: boolean,
  ): Promise<number> {
    const query = this.userRepository.createQueryBuilder('user').where(
      `((user.id)::text ${this.LIKE_OPERATOR} :filter OR
        first_name ${this.LIKE_OPERATOR} :filter OR
        last_name ${this.LIKE_OPERATOR} :filter OR
        user.email ${this.LIKE_OPERATOR} :filter)`,
      { filter },
    );
    if (!includeDeleted) {
      query.andWhere('user.deleted = false');
    }
    return query.getCount();
  }

  /** Note: this is misleading, should be renamed to encryptPassword */
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
      const jwtToken = this.authService.createToken(user.id, email);
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

  public async register(userDto: RegisterDto): Promise<User> {
    let user = this.userRepository.create(userDto);
    delete user.id; // remove id to ensure that no existing user gets overwritten
    user.verified = false;
    if (user.password) {
      user = await this.changePassword(user, user.password);
    }
    const newUser: Promise<User> = this.userRepository.save(user);
    const self = this;
    const config = this.getEmailConfig();
    newUser.then((result: User) => {
      if (!self.mailerProvider) {
        self.logger.warn('No mailer provider injected, skipping email sending. Please add a mailer provider in your app module.')
      } else {
        self.mailerProvider.sendMail({
          to: user.email,
          from: config.from,
          subject: config.registration.subject,
          template: config.registration.template,
          context: {
            user,
            url: config.clientBaseUrl
          }
        });
        self.logger.log(`Registration email sent to ${user.email}`);
      }
    }, err => {
      self.logger.error(err);
    });
    return newUser;
  }

  private getEmailConfig(): any {
    const defaultEmailConfig = _.clone(defaultConfig.email);
    const emailConfig = this.configService.get('email');
    if (emailConfig) {
      return _.assign(defaultEmailConfig, emailConfig);
    }
    return defaultEmailConfig;
  }

  public async update(user: User): Promise<User> {
    user.id = Number(user.id); // force id to be a number
    delete user.createdBy; // don't save the createdBy field
    return this.userRepository.save(user);
  }

  public async remove(id: number, modifiedBy: number): Promise<UpdateResult> {
    return this.userRepository.update({ id }, { deleted: true, modifiedBy });
  }

  public async recoverPassword(emailorId: string | number): Promise<boolean> {
    if (!this.mailerProvider) {
      this.logger.warn('No mailer provider injected, skipping email sending. Please add a mailer provider in your app module');
      throw new NotImplementedException('No mailer provider configured!');
    }
    const user: User = (typeof emailorId === 'number') ? await this.findById(emailorId as number) : await this.findByEmail(emailorId as string);
    if (user && user.email) {
      const config = this.getEmailConfig();
      const tokenExpiration = config.passwordRecovery.tokenExpiration;
      const payload: JwtPayload = { userId: user.id, email: user.email };
      const token: JwtToken = this.authService.createToken(payload, tokenExpiration.value);
      const resetUrl = this.generatePasswordResetUrl(token.accessToken, config);
      try {
        await this.mailerProvider.sendMail({
          to: user.email,
          from: config.from,
          subject: config.passwordRecovery.subject,
          template: config.passwordRecovery.template,
          context: {
            tokenExpiration: tokenExpiration.description,
            user,
            resetUrl
          }
        });
      } catch (error) {
        this.logger.error(error);
      }

    } else {
      await this.delay(1000); // prevent brute force attacks
    }
    return true; // always resolve to true to prevent brute force attacks
  }

  private generatePasswordResetUrl(token: string, config: any) {
    const baseUrl: string = config.passwordRecovery.clientBaseUrl || 'http://localhost:4200';
    const path: string = config.passwordRecovery.path || '/password/reset';
    return (path && path.indexOf('?') > 0) ? `${baseUrl}${path}&token=${token}` : `${baseUrl}${path}?token=${token}`;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async resetPassword(password: string, token: string): Promise<boolean> {
    const { userId } = this.authService.verifyToken(token);
    if (userId) {
      let user: User = await this.findById(userId);
      user = await this.changePassword(user, password);
      await this.update(user);
      return true;
    }
    return false;
  }

  public async verifyResetToken(token: string): Promise<User> {
    try {
      const { userId } = this.authService.verifyToken(token);
      if (userId) {
        return this.findById(userId);
      }
    } catch (error) {
      throw new UnauthorizedException();
    }
    return null;
  }
}
