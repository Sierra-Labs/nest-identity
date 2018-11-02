import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@sierralabs/nest-utils';

import { AppModule } from '../app.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from './auth.module';
import { JwtPayload } from './jwt-payload.interface';
import { JwtStrategy } from './jwt.strategy';
import { TestValidateStrategy } from './test-validate.strategy';
import { ValidateStrategy } from './validate.strategy';

const configService = new ConfigService();
const config = configService.get('database') || {};

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let testValidateStrategy: ValidateStrategy;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        AppModule,
        AuthModule.forRoot(TestValidateStrategy, [UserModule]),
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    testValidateStrategy = module.get<ValidateStrategy>(ValidateStrategy);
  });

  describe('validate', () => {
    it('should validate JWT payload', async () => {
      const result = { userId: 1001, email: 'test@sierralabs.com' };
      jest
        .spyOn(testValidateStrategy, 'validate')
        .mockImplementation((payload: JwtPayload) => result);
      await jwtStrategy.validate(result, (error, user) => {
        expect(user).toBe(result);
      });
    });
    it('should fail validation of unidentifiable userId in JWT payload', async () => {
      const result = undefined;
      jest
        .spyOn(testValidateStrategy, 'validate')
        .mockImplementation((payload: JwtPayload) => result);
      await jwtStrategy.validate(result, (error, user) => {
        expect(error).toEqual(jasmine.any(UnauthorizedException));
      });
    });
  });
});
