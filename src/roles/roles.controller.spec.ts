import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { UserModule } from '../user/user.module';
import { RolesModule } from '../roles/roles.module';
import { RolesController } from './roles.controller';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';

describe('RoleController', () => {
  let rolesRepository: Repository<Role>;
  let rolesController: RolesController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, UserModule, RolesModule],
    }).compile();

    rolesController = module.get<RolesController>(RolesController);
    rolesRepository = module.get<Repository<Role>>('RoleRepository');
  });

  xdescribe('create', () => {
    it('should create a new role', async () => {
      const role = new Role();
      role.id = 1;
      role.name = 'Admin';
      jest.spyOn(rolesRepository, 'save').mockImplementation((entity: Role) => {
        expect(entity.id).not.toHaveProperty('id');
        entity.id = 1001;
        return entity;
      });
      const newRole = rolesController.create(role);
      expect(newRole).toHaveProperty('id', 1001);
    });
  });

});
