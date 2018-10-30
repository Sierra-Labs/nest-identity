import { Injectable } from '@nestjs/common';
import { Role } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  private logger = console;
  constructor(
    @InjectRepository(Role) protected readonly roleRepository: Repository<Role>,
  ) {}

  public async create(role: Role): Promise<Role> {
    delete role.id; // make sure no existing id exists when saving user
    return this.roleRepository.save(role);
  }

  public async findByName(name: string): Promise<Role> {
    return this.roleRepository
      .createQueryBuilder('role')
      .where('role.name = :name')
      .setParameters({ name })
      .getOne();
  }

  public async initializeRoles(defaultRole: string = 'superadmin') {
    this.logger.log('Initializing Roles...');
    const roleCount = await this.roleRepository.count();
    if (roleCount <= 0) {
      this.logger.log('No roles defined yet, creating default role...');
      const role: Role = await this.roleRepository.save({
        id: 1,
        name: defaultRole,
        users: [],
      });
      this.logger.log('Super Admin role created', role);
    } else {
      this.logger.log('Existing role found.');
    }
  }
}
