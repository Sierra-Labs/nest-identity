import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { RolesService } from '../roles/roles.service';
import { RolesModule } from '../roles/roles.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]), RolesModule],
  providers: [UserService, AuthService, RolesService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
