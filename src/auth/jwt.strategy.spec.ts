import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt-payload.interface';
import { UnauthorizedException } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { ConfigModule, ConfigService, PostgresNamingStrategy } from '@sierralabs/nest-utils';
import { UserRepositoryProvider, UserRepository } from '../user/user.repository';
import { Connection } from 'typeorm';

const configService = new ConfigService();
const config = configService.get('database') || {};

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let authService: AuthService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);

  });

  describe('validate', () => {
    it('should validate JWT payload', async () => {
      const result = { userId: 1001, email: 'test@sierralabs.com' };
      jest.spyOn(authService, 'validateUser').mockImplementation((payload: JwtPayload) => result);
      await jwtStrategy.validate(result, (error, user) => {
        expect(user).toBe(result);
      });
    });
    it('should fail validation of unidentifiable userId in JWT payload', async () => {
      const result = undefined;
      jest.spyOn(authService, 'validateUser').mockImplementation((payload: JwtPayload) => result);
      await jwtStrategy.validate(result, (error, user) => {
        expect(error).toEqual(jasmine.any(UnauthorizedException));
      });
    });
  });
});
