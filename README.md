# nest-identity

## Description

Contains cross-project commonly used NestJS user management, roles, authentication, and ACL handling.

## Requirements

Make sure to have the following installed

- `NodeJS / NPM` for application
* `NestJS` for application framework

## Installation

To use the `nest-identity` node module:

```bash
$ npm install --save @sierralabs/nest-identity
```

or with yarn

```bash
$ yarn add @sierralabs/nest-identity
```

## Configuration

The following are configuration parameters to be used as environment variables or in `config/config.json` or environment specific config json (`config/config.[NODE_ENV].json`)

- `jwt.expiresIn` (Environment: `JWT_EXPIRES_IN`) - expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms). Eg: `60`, `"2 days"`, `"10h"`, `"7d"`. A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default (`"120"` is equal to `"120ms"`).
- `jwt.secret` (Environment: `JWT_SECRET`) - is a string, buffer, or object containing either the secret for HMAC algorithms or the PEM encoded private key for RSA and ECDSA.
- `pagination.maxPageSize` - when querying a list of records limit the number of records returned (defaults to 200).
- `pagination.defaultPageSize` - when querying a list of records limit the number of records returned by default (defaults to 100).
- `password.rounds` - Number of bcrypt rounds to use, defaults to 10 if omitted.
- `superadmin.autoCreate` - Set to true if you want a superadmin user created during module initialization. Super admin role and user will only be created if both Roles and User tables are empty. Default is `false`.
- `superadmin.defaultEmail` - Override the default email address of the superadmin account. Defaults to `super@admin.com`.
- `superadmin.defaultPassword` - Override the default super admin password. Defaults to `superadmin`.
- `superadmin.defaultRole` - Override the super admin role name. Defaults to `superadmin`.

## Setup

Follow the instructions below to get started using the `nest-identitiy` module in your NestJS application.

## Folder Structure

The following is the recommended folder structure for your source files:

- `entities/` - place your NestJS entities here
  - `user.entity.ts` - extends nest-identity's user.entity.ts
  - `user-address.entity.ts` - extends nest-identity's user-address.entity.ts (optional)
  - `user-phone.entity.ts` - extends nest-identity's user-phone.entity.ts (optional)
  - `roles.entity.ts` - extends nest-identity's role.entity.ts
  - `state.entity.ts` - US address state code reference (optional)
  - `organization.ts`
  - ...
- `user/`
  - `user.module.ts` - your custom user module override
  - `user.service.ts` - user service that extends the nest-identity user.service
  - `user.controller.ts` - user controller that extends the nest-identity user.controller
  - `user-validate.strategy.ts` - JWT validate strategy that extends the nest-identity validate.strategy
- `roles/`
  - `roles.module.ts` - your custom roles module override
  - `roles.controller.ts` - roles controller that extends the nest-identity roles.controller

### User and Role Entities

The first step is to make sure you have your `User` and `Role` entities models defined and have them extend `nest-identity` built in entities where applicable. You can then extend and add additional properties as needed.

```typescript
// entities/user.entity.ts
import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ReplaceRelationType } from '@sierralabs/nest-utils';
import { User as BaseUser } from '@sierralabs/nest-identity';
import { Role } from './role.entity';

@Entity()
export class User extends BaseUser {
  /**
   * Patient medical ID number.
   */
  @ApiProperty()
  @Column('text', { name: 'patient_number', nullable: true })
  public patientNumber: string;

  /**
   * Need to redeclare roles relationship to replace base class reference
   */
  @ReplaceRelationType(type => Role)
  public roles: Role[];
}
```

```typescript
// entities/role.entity.ts
import { Entity } from 'typeorm';
import { User } from './user.entity';
import { Role as BaseRole } from '@sierralabs/nest-identity';
import { ReplaceRelationType } from '@sierralabs/nest-utils';

@Entity()
export class Role extends BaseRole {
  @ReplaceRelationType(type => User)
  public users: User[];
}
```

### UserModule, UserService, UserController, and Validate Strategy

Next, setup your `UserService`, `UserController`, and `ValidateStrategy` overrides of base classes in `nest-identity`:

- `user.service.ts` - service class to interface between the NestJS repository and your controller classes.
- `user.controller.ts` - NestJS controller for exposing API endpoints, role permissions, and authentication.
- `user-validate.strategy.ts` - Used by the JWT authentication strategy for validating a decrypted JWT payload.
- `user.module.ts` - The user module containing references to the above classes. Also, make sure you reference the AuthModule (see below for example)

```javascript
// user/user.service.ts
import { Injectable, HttpException, OnModuleInit } from '@nestjs/common';
import { UserService as BaseUserService } from '@sierralabs/nest-identity';
@Injectable()
export class UserService extends BaseUserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    protected readonly userRepository: Repository<User>,
    protected readonly configService: ConfigService,
    protected readonly rolesService: RolesService,
    protected readonly moduleRef: ModuleRef,
    @Optional()
    protected readonly mailerProvider?: MailerService,
  ) {
    super(userRepository, configService, moduleRef, rolesService);
  }
  // only necessary if you're user entity has additional required fields
  onModuleInit() {
    const user: User = this.userRepository.create({
      mobileNumber: '8004561111',
    });
    super.initialize(user);
  }
}

// user/user.controller.ts
import { UserController as BaseUserController } from '@sierralabs/nest-identity';
@Controller('users')
export class UserController extends BaseUserController {
  constructor(
    protected readonly userService: UserService,
    protected readonly configService: ConfigService
  ) {
    super(userService, configService);
  }
}

// user/user-validate.strategy.ts
import { ValidateStrategy, JwtPayload, User } from '@sierralabs/nest-identity';
export class UserValidateStrategy extends ValidateStrategy implements ValidateStrategy {

  constructor(@Inject(UserService) private readonly userService: UserService) {
    super();
  }

  async validate(payload: JwtPayload): Promise<User> {
    // Add your custom validation logic here
    return this.userService.findById(payload.userId);
  }
}

// user/user.module.ts
import { Module } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { RolesModule } from './../roles/roles.module';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserValidateStrategy } from './user-validate.strategy';
import {
  AuthModule,
  RolesGuard,
  AuthService,
  ValidateStrategy
} from '@sierralabs/nest-identity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule.forRoot(UserValidateStrategy), // Important for handling ACLs on REST APIs
    RolesModule
  ],
  providers: [AuthService, UserService, RolesGuard], // RolesGuard needed for @Roles decorator for ACLs
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
```

### AppModule

Modify your `app.module.ts` to include references to the `AuthModule` and `RolesGuard` if you want to use `@Roles()` decorator for ACL permissions in your own custom NestJS controllers.

Example AppModule:

```javascript
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      entities: ['src/**/**.entity{.ts,.js}'],
      extra: {
        idleTimeoutMillis: config.poolIdleTimeout || undefined,
        max: config.poolMax,
        ssl: config.ssl,
      },
      synchronize: false,
      logging: 'all',
      namingStrategy: new PostgresNamingStrategy(),
    }),
    MailerModule.forRootAsync({
      useClass: MailerConfigService,
    }),
    AuthModule.forRoot(UserValidateStrategy),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule {}
```

## RolesGuard

The roles guard decorator `@Roles(...string)` bundled in `nest-identiity` allows you to define ACL permissions on exposed REST API endpoints. You can pass a list of role names into the decorator for validation.

The following are special keywords:

- `$everyone` - same as not using `@Roles()`; allows everyone to call the endpoint.
- `$authenticated` - only allows an authenticated user; a user supplying a valid JWT access token.
- `$userOwner` - When using this keyword make sure to define an `:id` in the path that represents the `user_id`. They keyword will validate the user id in the JWT access token matches the `:id` passed into the URL path.

```javascript
  @Roles('Admin', '$userOwner')
  @Get(':id([0-9]+|me)')
  public async getOne(
    @Param('id', new ParseIntPipe())
    id: number
  ) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
```

## OwnerInterceptor

The `OwnerInterceptor` is used to assign the requester's user id to any property in a model usually when used with a `POST` or `PUT` API request. For example, if you wanted to set the `createdBy` and/or `modifiedBy` fields when saving the user profile.

```typescript
  @Roles('Admin')
  @Post()
  @UseInterceptors(new OwnerInterceptor(['createdBy', 'modifiedBy']))
  public async create(
    @Body(new RequiredPipe())
    user: User,
  ): Promise<User> {
    return await this.userService.create(user);
  }
```

> `QwnerInterceptor` will throw an error if `request.user` is empty.

## Registration and Password Recovery

If you would like to enable email sending for new user registration and password recovery features, You will need to import the MailerModule and provide a MailerConfigService as shown in example below. You can either provide a custom MailerConfigService or use the default provided by this module.

```javascript
...
import { MailerModule } from '@nest-modules/mailer';
import { AuthModule, MailerConfigService } from '@sierralabs/nest-identity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({...}),
    MailerModule.forRootAsync({
      useClass: MailerConfigService,
    }),
    AuthModule.forRoot(UserValidateStrategy),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule {}
```

If you are using a subclassed UserService, make sure to inject a MailerService in your constructor, see UserService.ts in this module.

This module provides default configurations for email sending that you can override in your own config, please config schema and samples in the config directory.

Finally, you also need create the email templates in the directory you specified in your config file. The default template directory is `public/templates`. You can copy the default templates provided by this module and customize it according to your needs.


## Contributing

To contribute to the `nest-identity` project please make sure to have the following configured in your development environment. Submit pull request to master after making sure all unit tests run successful.

- `docker` for postgres database
- `eslint` for Javascript/TypeScript linting (tslint in VSCode to automate linting)
- `prettier` for code formatting and standardization
- `jest` for unit testing

```bash
$ npm install
```

### Development environment setup

Make sure to have the following installed:

- `Node 12+ / NPM 6.1+` for application
- `docker` for postgres database
- `jest` for unit testing
- `eslint` for TypeScript linting (tslint in VSCode to automate linting)
- `prettier` for auto formatting in VSCode

Install all node module dependencies:

```bash
$ npm install
```

If you would like to develop/debug `nest-identity` in your source project you can npm link to symlink cross-dependency:

```bash
# Build the project first
$ npm run build

# Run npm link on this project
$ npm link

# Run npm link on your project
$ npm link @sierralabs/nest-identity
```

> Important Note: Ensure that the version of `nest-utils` inside `nest-identity` and in your host application are the same to avoid incompatible types error.

## Database Setup

Setup the Postgres database instance.

```bash
# Rebuilds the database with a new Docker container.
$ npm run db

# Load initial mock data via tests.
$ npm run mocks
```

## Recreating Database Schema

When making changes to the database schema you can create a sql dump to replace `db/initial-db-schema.sql` by running:

```bash
docker exec -t nest-identity_db_1 pg_dump -U root identity > db/initial-db-schema.sql
```

> Development: `nest-identity_db_1` - is the name of the docker container on your machine (development).

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Test

All code changes should have supported unit tests.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
