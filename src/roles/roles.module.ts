import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../roles/roles.guard';
import { Role } from '../entities/role.entity';
import { RolesController } from './roles.controller';
import { Connection, Repository } from 'typeorm';
import { RoleService } from './roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role])
  ],
  providers: [RoleService, RolesGuard],
  controllers: [RolesController],
  exports: [RoleService, RolesGuard]
})
export class RolesModule {}
