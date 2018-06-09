import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { UserModule } from '../user/user.module';
import { RolesModule } from '../roles/roles.module';
import { RolesController } from './roles.controller';
import { Role } from '../entities/role.entity';
import { RoleService } from '.';
import { UnauthorizedException } from '@nestjs/common';

function getRole(): Role {
  const role = new Role();
  role.id = 1;
  role.name = 'Admin';
  return role;
}

describe('RoleController', () => {
  let roleService: RoleService;
  let rolesController: RolesController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    rolesController = module.get<RolesController>(RolesController);
    roleService = module.get<RoleService>(RoleService);
  });

  describe('create', () => {
    it('should call roleService.create', async () => {
      const role = getRole();
      const spy = jest.spyOn(roleService, 'create').mockImplementation(
        async (entity: Role) => {
        return new UnauthorizedException();
      });
      rolesController.create(role);
      expect(spy).toHaveBeenCalled();
    });

  });

});
