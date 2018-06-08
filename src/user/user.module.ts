import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@sierralabs/nest-utils';
import { User } from '../entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { RolesGuard } from '../roles/roles.guard';
import { Connection } from 'typeorm';
import { TestValidateStrategy } from '../auth/test-validate.strategy';

const UserRepositoryProvider = {
  provide: 'UserRepository',
  useFactory: (connection: Connection) => connection.getRepository(User),
  inject: [Connection]
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule.forRoot(TestValidateStrategy)
  ],
  providers: [UserService, RolesGuard, UserRepositoryProvider],
  controllers: [UserController],
  exports: [UserService, UserRepositoryProvider]
})
export class UserModule {}
