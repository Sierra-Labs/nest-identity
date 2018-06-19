import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../roles/roles.guard';
import { Role } from '../entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role])
  ],
  providers: [RolesService, RolesGuard],
  controllers: [RolesController],
  exports: [RolesService, RolesGuard]
})
export class RolesModule {}
