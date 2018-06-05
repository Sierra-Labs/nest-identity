import { Test } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserRepository, UserRepositoryProvider } from './user.repository';
import { UserModule } from './user.module';
import { AppModule } from '../app.module';
import { INestApplication } from '@nestjs/common';
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
  let userRepository: UserRepository;

  const configService = new ConfigService();
  const config = configService.get('database') || {};

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule]
      }).compile();

    userController = module.get<UserController>(UserController);
    userRepository = module.get<UserRepository>(UserRepository);
    userService = module.get<UserService>(UserService);

  });

  describe('create', () => {
    let newUser: User;

    it('should create a user', async () => {
      const user = new User();
      user.id = 1;
      user.email = 'test@gmail.com';
      user.firstName = 'Jonny';
      user.lastName = 'Appleseed';
      user.password = 'password';
      user.mobileNumber = '3105551234';

      jest.spyOn(userRepository, 'save').mockImplementation(async (entity: User) => {
        expect(entity).not.toHaveProperty('id');
        entity.id = 1001;
        return entity;
      });

      newUser = await userController.create(user);
      expect(newUser).toHaveProperty('id', 1001);
    });

    it('should return encrypted password for new user', () => {
      expect(newUser.password.indexOf('$2a$')).toBe(0);
      expect(newUser.password).toHaveLength(60);
    });

    it('should fail if creating a user with the same email address', async () => {
      const user = new User();
      user.email = 'test@gmail.com';
      user.firstName = 'Jonny';
      user.lastName = 'Appleseed2';
      user.password = 'password';
      user.mobileNumber = '3105551234';

      jest.spyOn(userRepository, 'save').mockImplementation(async (entity: User) => {
        // throw new QueryFailedError();
        return {};
      });

      expect(userController.create(user)).rejects.toBeInstanceOf(QueryFailedError);
    });

    // it('should remove user', async () => {
    //   const deletedUserInfo = await userRepository.delete(newUser.id);
    //   expect(deletedUserInfo).toBeDefined();
    // });
  });

  describe('getAll', () => {
    it('should return an array of users', async () => {
      const result = ['test'];
      // jest.spyOn(userRepository, 'findWithFilter').mockImplementation(() => result);
      // const data = await userRepository.findWithFilter('id asc', 100, 0, '');

      jest.spyOn(userRepository, 'findWithFilter').mockImplementation(() => result);
      const data = await userController.getAll();

      expect(data).toBe(result);
    });
  });

});
