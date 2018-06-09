import { Injectable } from '@nestjs/common';
import { Role } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {

  constructor(
    @InjectRepository(Role)
    protected readonly roleRepository: Repository<Role>
  ) {}

  public async create(role: Role): Promise<Role> {
    delete role.id; // make sure no existing id exists when saving user
    return this.roleRepository.save(role);
  }
}
