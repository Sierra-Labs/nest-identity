import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../roles/roles.guard';
import { Role } from '../entities/role.entity';
import { RolesController } from './roles.controller';
import { Connection, Repository } from 'typeorm';

const RoleRepositoryProvider = {
  provide: 'RoleRepository',
  useFactory: (connection: Connection) => connection.getRepository(Role),
  inject: [Connection]
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Role])
  ],
  providers: [RolesGuard, RoleRepositoryProvider],
  controllers: [RolesController]
})
export class RolesModule {}
