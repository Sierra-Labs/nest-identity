import { Test } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserModule } from './user.module';
import { AppModule } from '../app.module';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { Repository, Connection, QueryFailedError } from 'typeorm';
import { Role } from '../entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

import {
  PostgresNamingStrategy,
  ConfigModule,
  ConfigService
} from '@sierralabs/nest-utils';
import { AuthService } from '../auth/auth.service';

describe('UserControler', () => {
  // let app: INestApplication;
  let userController: UserController;
  let userService: UserService;

  const configService = new ConfigService();
  const config = configService.get('database') || {};

  // Test User
  const user = new User();
  user.id = 1;
  user.email = 'test@gmail.com';
  user.firstName = 'Jonny';
  user.lastName = 'Appleseed';
  user.password = 'password';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule]
      }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call userService.login', async () => {
      const spy = jest.spyOn(userService, 'login').mockImplementation(async (email: string, password: string) => {
        return new UnauthorizedException();
      });
      userController.login('test@gmail.com', 'password');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call userService.logout', async () => {
      const spy = jest.spyOn(userService, 'logout').mockImplementation(async (email: string, password: string) => {});
      userController.logout();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    let newUser: User;

    it('should create a verified user', async () => {
      jest.spyOn(userService, 'create').mockImplementation(async (entity: User) => {
        newUser = Object.assign({}, entity);
        newUser.id = 1001;
        return newUser;
      });
      newUser = await userController.create(user);
      expect(newUser).toHaveProperty('verified', true);
      expect(newUser).toHaveProperty('id', 1001);
    });

    it('should return encrypted password for new user', () => {
      expect(newUser.password.indexOf('$2a$')).toBe(0);
      expect(newUser.password).toHaveLength(60);
    });

    it('should fail if creating a user with the same email address', async () => {
      jest.spyOn(userService, 'create').mockImplementation(async (entity: User) => {
        throw new  QueryFailedError('mock query', undefined, Error('duplicate key value violates unique constraint "user__email__uq"'));
      });
      try {
        await userController.register(user);
        throw new Error('create failed to fail');
      } catch (e) {
        expect(e.message).toMatch('duplicate key value violates unique constraint "user__email__uq"');
      }
    });
  });

  describe('register', () => {
    let newUser: User;

    it('should register (create) an unverified user', async () => {
      jest.spyOn(userService, 'create').mockImplementation(async (entity: User) => {
        newUser = Object.assign({}, entity);
        newUser.id = 1001;
        return newUser;
      });
      newUser = await userController.register(user);
      expect(newUser).toHaveProperty('verified', false);
      expect(newUser).toHaveProperty('id', 1001);
    });

    it('should return encrypted password for new user', () => {
      expect(newUser.password.indexOf('$2a$')).toBe(0);
      expect(newUser.password).toHaveLength(60);
    });

    it('should fail if creating a user with the same email address', async () => {
      jest.spyOn(userService, 'create').mockImplementation(async (entity: User) => {
        throw new  QueryFailedError('mock query', undefined, Error('duplicate key value violates unique constraint "user__email__uq"'));
      });
      try {
        await userController.register(user);
        throw new Error('registration failed to fail');
      } catch (e) {
        expect(e.message).toMatch('duplicate key value violates unique constraint "user__email__uq"');
      }
    });
  });

  describe('update', () => {
    it('should update user record', async () => {
      const spyChangePassword = jest.spyOn(userService, 'changePassword');
      jest.spyOn(userService, 'findById').mockImplementation(async (id: number) => {
        const oldUser = Object.assign({}, user);
        oldUser.verified = true;
        return oldUser;
      });
      jest.spyOn(userService, 'update').mockImplementation((entity: User) => {
        expect(entity).toHaveProperty('id', 1001);
        expect(entity).not.toHaveProperty('verified');
      });
      await userController.update(1001, user, {user: { id: 1001 }});
      expect(spyChangePassword).toHaveBeenCalled();
    });

    it('should unverify user if email is changed', async () => {
      const userData = Object.assign({}, user);
      userData.email = 'newemail@gmail.com';
      jest.spyOn(userService, 'findById').mockImplementation(async (id: number) => {
        return user;
      });
      jest.spyOn(userService, 'update').mockImplementation((entity: User) => {
        expect(entity).toHaveProperty('verified', false);
      });
      await userController.update(1001, userData, {user: { id: 1001 }});

    });
  });

  describe('remove', () => {
    it('should call userService.remove', async () => {
      const spy = jest.spyOn(userService, 'remove').mockImplementation(async (id: number, modifiedBy: number) => {
        return new UnauthorizedException();
      });
      const request = { user: { id: 1 } };
      userController.remove(1001, request);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getOne', () => {
    it('should call userService.findById', async () => {
      const spy = jest.spyOn(userService, 'findById').mockImplementation(async (id: number) => {
        return new UnauthorizedException();
      });
      userController.getOne(1001);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return an array of users', async () => {
      const result = ['test'];
      // jest.spyOn(userRepository, 'findWithFilter').mockImplementation(() => result);
      // const data = await userRepository.findWithFilter('id asc', 100, 0, '');

      jest.spyOn(userService, 'findWithFilter').mockImplementation(() => result);
      const data = await userController.getAll();

      expect(data).toBe(result);
    });
  });

  describe('getCount', () => {
    it('should return the total number of users', async () => {
      const result = 2;
      jest.spyOn(userService, 'countWithFilter').mockImplementation(() => result);
      const count = await userController.getCount();
    });
  });

});
