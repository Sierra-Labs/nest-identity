import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@sierralabs/nest-utils';
import { User } from '../entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { RolesGuard } from '../roles/roles.guard';
import { Connection } from 'typeorm';

const UserRepositoryProvider = {
  provide: 'UserRepository',
  useFactory: (connection: Connection) => connection.getRepository(User),
  inject: [Connection]
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule)
  ],
  providers: [UserService, RolesGuard, UserRepositoryProvider],
  controllers: [UserController],
  exports: [UserService, UserRepositoryProvider]
})
export class UserModule {}
