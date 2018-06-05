import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository, UserRepositoryProvider } from './user.repository';
import { ConfigModule } from '@sierralabs/nest-utils';
import { User } from '../entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { RolesGuard } from '../roles/roles.guard';

@Module({
  imports: [
    // TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule)
  ],
  providers: [UserService, UserRepositoryProvider, RolesGuard],
  controllers: [UserController],
  exports: [UserService, UserRepositoryProvider]
})
export class UserModule {}
