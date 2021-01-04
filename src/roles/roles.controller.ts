import { Controller, Post, Body } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { RequiredPipe } from '@sierralabs/nest-utils';
import { Roles } from './roles.decorator';
import { RolesService } from './roles.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(protected readonly rolesService: RolesService) {}

  // @Roles('Admin')
  // @Post()
  // create(@Body(new RequiredPipe()) role: Role): Promise<Role> {
  //   return this.rolesService.create(role);
  // }
}
