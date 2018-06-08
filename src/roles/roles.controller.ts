import { Controller, Post, Body } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RequiredPipe } from '@sierralabs/nest-utils';
import { Roles } from './roles.decorator';

@Controller('users/roles')
export class RolesController {
  constructor(
    @InjectRepository(Role)
    protected readonly roleRepository: Repository<Role>,
  ) {}

  @Roles('Admin')
  @Post()
  create(@Body(new RequiredPipe()) role: Role): Promise<Role> {
    delete role.id; // make sure no existing id exists when saving user
    return this.roleRepository.save(role);
  }

}
