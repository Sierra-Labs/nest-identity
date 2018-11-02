import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, Role } from '../entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { RolesService } from '../roles/roles.service';
import { RolesModule } from '../roles/roles.module';
@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), RolesModule],
  providers: [UserService, AuthService, RolesService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
