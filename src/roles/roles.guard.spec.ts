import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { RolesGuard } from '.';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule]
      }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
  });

  it('should allow $everyone', () => {

  });
});
