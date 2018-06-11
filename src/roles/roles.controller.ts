import { Controller, Post, Body } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { RequiredPipe } from '@sierralabs/nest-utils';
import { Roles } from './roles.decorator';
import { RoleService } from './roles.service';
import { ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(
    protected readonly roleService: RoleService,
  ) {}

  @Roles('Admin')
  @Post()
  create(@Body(new RequiredPipe()) role: Role): Promise<Role> {
    return this.roleService.create(role);
  }

}
