# nest-identity

## Description

Standard NestJS user management, roles, authentication, and ACL handling.

## Requirements

Make sure to have the following installed

- `NodeJS / NPM` for application

## Installation

To use the `nest-identity` node module:

```bash
$ npm login #make sure you request access to @sierralabs
$ npm install --save @sierralabs/nest-identity
```

## Configuration

The following are configuration parameters to be used as environment variables or in `config/config.json` or environment specific config json (`config/config.[NODE_ENV].json`)

- `jwt.expiresIn` (Environment: `JWT_EXPIRES_IN`) - expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms). Eg: `60`, `"2 days"`, `"10h"`, `"7d"`. A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default (`"120"` is equal to `"120ms"`).
- `jwt.secret` (Environment: `JWT_SECRET`) - is a string, buffer, or object containing either the secret for HMAC algorithms or the PEM encoded private key for RSA and ECDSA.
- `pagination.maxPageSize` - when querying a list of records limit the number of records returned (defaults to 200).
- `pagination.defaultPageSize` - when querying a list of records limit the number of records returned by default (defaults to 100).
- `password.rounds` - Number of bcrypt rounds to use, defaults to 10 if omitted.
- `superadmin.autoCreate` - Set to false to prevent a superadmin role to be created during start up. Defaults to true.
- `superadmin.defaultEmail` - Override the default email address of the superadmin account. Defaults to `super@admin.com`.
- `superadmin.defaultPassword` - Override the default super admin password. Defaults to `superadmin`.
- `superadmin.defaultRole` - Override the super admin role name. Defaults to `superadmin`.

## Setup

Follow the instructions below to get started using the `nest-identitiy` module in your NestJS application.

## Folder Structure

The following is the recommended folder structure for your source files:

- `entities/` - place your NestJS entities here
  - `user.entity.ts` - extends nest-identity's user.entity.ts
  - `user-address.entity.ts` - extends nest-identity's user-address.entity.ts
  - `user-phone.entity.ts` - extends nest-identity's user-phone.entity.ts
  - `roles.entity.ts` - extends nest-identity's role.entity.ts
  - `state.entity.ts` - US address state code reference
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
import { ApiModelProperty } from '@nestjs/swagger';
import { ReplaceRelationType } from '@sierralabs/nest-utils';
import { User as BaseUser } from '@sierralabs/nest-identity';
import { Role } from './role.entity';

@Entity()
export class User extends BaseUser {
  /**
   * Patient medical ID number.
   */
  @ApiModelProperty()
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
import { UserService as BaseUserService } from '@sierralabs/nest-identity';
@Injectable()
export class UserService extends BaseUserService {
  constructor(
    @InjectRepository(User)
    protected readonly userRepository: Repository<User>,
    protected readonly configService: ConfigService,
    protected readonly moduleRef: ModuleRef,
    protected readonly rolesService: RolesService
  ) {
    super(userRepository, configService, moduleRef, rolesService);
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

  constructor(private readonly userService: UserService) {
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

## User Controller

> TODO: Document all REST API endpoints as part of the UserController base class.

## Roles Controller

> TODO: Document all REST API endpoints as part of the RolesController base class.

## Contributing

To contribute to the `nest-identity` project please make sure to have the following configured in your development environment. Submit pull request to master after making sure all unit tests run successful.

- `docker` for postgres database
- `tslint` for TypeScript linting (tslint in VSCode to automate linting)
- `jest` for unit testing

```bash
$ npm install
```

### Development environment setup

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
$ docker-compose up
```

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
