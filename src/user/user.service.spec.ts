import { Test } from '@nestjs/testing';
import { UserService } from '.';
import { Repository, Connection, SelectQueryBuilder } from 'typeorm';
import { User } from '../entities/user.entity';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';

function getUser() {
  const user = new User();
  user.id = 1;
  user.email = 'test@gmail.com';
  user.firstName = 'Jonny';
  user.lastName = 'Appleseed';
  user.password = 'password';
  return user;
}

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userService = module.get<UserService>(UserService);
    userService.onModuleInit();
  });

  describe('findById', () => {
    it('should call userRepository.findOne', async () => {
      const spy = jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(async (id: number) => {
          return getUser();
        });
      userService.findById(1001);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should find user record by email', async () => {
      const result = getUser();
      delete result.password;
      userRepository.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValueOnce(result),
      }));
      const user = await userService.findByEmail('test@gmail.com');
      expect(user).toBe(result);
      expect(user).not.toHaveProperty('password');
    });
    it('should find user record by email with limited fields', async () => {
      const result = { id: 1001, email: 'test@gmail.com' };
      userRepository.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockReturnValueOnce(result),
      }));
      const user = await userService.findByEmail('test@gmail.com', {
        fields: ['user.email'],
      });
      expect(user).toBe(result);
    });
  });

  describe('findWithFilter', () => {
    it('should find user records', async () => {
      const results = [getUser()];
      userRepository.createQueryBuilder = jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockReturnValueOnce(results),
        getCount: jest.fn().mockReturnValueOnce(results.length),
      }));
      const users = await userService.findWithFilter(
        { id: 'ASC' },
        100,
        0,
        'test@gmail.com',
      );
      expect(users).toEqual([results, 1]);
    });
  });

  describe('countWithFilter', () => {
    it('should get total count based on filter criteria', async () => {
      userRepository.createQueryBuilder = jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockReturnValueOnce(1),
      }));
      const count = await userService.countWithFilter('test@gmail.com');
      expect(count).toBe(1);
    });
  });

  describe('changePassword', () => {
    it('should encode password string in User object', async () => {
      let user = getUser();
      user = await userService.changePassword(user, 'newpassword');
      expect(user.password).not.toBe(getUser().password);
    });
    it('should not encode password string in User object when already encoded', async () => {
      let user = getUser();
      user.password =
        '$2a$14$8C7tR88kaNCzYN5CzH0N3.iGzdbjvGulCLy4vpisLssrOth3vH4aO';
      user = await userService.changePassword(user, user.password);
      expect(user.password).toBe(
        '$2a$14$8C7tR88kaNCzYN5CzH0N3.iGzdbjvGulCLy4vpisLssrOth3vH4aO',
      );
    });
  });

  describe('login', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should login the user', async () => {
      userRepository.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockImplementationOnce(async (email: string) => {
          let user = getUser();
          user = await userService.changePassword(user, 'password');
          return user;
        }),
      }));
      const jwtPayload = await userService.login('test@gmail.com', 'password');
      expect(jwtPayload).toHaveProperty('accessToken');
      expect(jwtPayload.user).not.toHaveProperty('password');
    });
    it('should fail to login the user when bad password', async () => {
      userRepository.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockImplementationOnce(async (email: string) => {
          let user = getUser();
          user = await userService.changePassword(user, 'password');
          return user;
        }),
      }));
      try {
        await userService.login('test@gmail.com', 'wrong-password');
        throw new Error('failed to fail login');
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
    it('should fail to login the user when bad email', async () => {
      userRepository.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockImplementationOnce(async (email: string) => {
          return null;
        }),
      }));
      try {
        await userService.login('test-bad@gmail.com', 'password');
        throw new Error('failed to fail login');
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
    it('should fail to login the user when not verified', async () => {
      jest
        .spyOn(userService, 'findByEmail')
        .mockImplementation(async (email: string) => {
          const user = getUser();
          user.verified = false;
          return user;
        });
      try {
        await userService.login('test@gmail.com', 'wrong-password');
        throw new Error('failed to fail login');
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('create', () => {
    let newUser: User;
    it('should create a user', async () => {
      const user = getUser();
      jest
        .spyOn(userRepository, 'save')
        .mockImplementation(async (entity: User) => {
          expect(entity).not.toHaveProperty('id');
          entity.id = 1001;
          return entity;
        });
      newUser = await userService.create(user);
      expect(newUser).toHaveProperty('verified', true);
      expect(newUser).toHaveProperty('id', 1001);
    });
    it('should return encrypted password for new user', () => {
      expect(newUser.password.indexOf('$2')).toBe(0);
      expect(newUser.password).toHaveLength(60);
    });
  });

  describe('register', () => {
    let newUser: User;
    it('should register (create) an unverified user', async () => {
      const user = getUser();
      jest
        .spyOn(userRepository, 'save')
        .mockImplementation(async (entity: User) => {
          expect(entity).not.toHaveProperty('id');
          entity.id = 1001;
          entity.verified = false;
          return entity;
        });
      newUser = await userService.create(user);
      expect(newUser).toHaveProperty('verified', false);
      expect(newUser).toHaveProperty('id', 1001);
    });
    it('should return encrypted password for new user', () => {
      expect(newUser.password.indexOf('$2')).toBe(0);
      expect(newUser.password).toHaveLength(60);
    });
  });

  describe('update', () => {
    it('should call userRepository.save', async () => {
      const user = getUser();
      const spy = jest
        .spyOn(userRepository, 'save')
        .mockImplementation(async (entity: User) => user);
      userService.update(user);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should call userRepository.update', async () => {
      const user = getUser();
      const spy = jest
        .spyOn(userRepository, 'update')
        .mockImplementation(async (criteria, attributes) => user);
      userService.remove(1001, 9);
      expect(spy).toHaveBeenCalled();
    });
  });
});
