import * as _ from 'lodash';

import { TestingModule } from '@nestjs/testing';

import { Role } from '../../src/entities/role.entity';
import { User } from '../../src/entities/user.entity';
import { RolesService } from '../../src/roles/roles.service';
import { UserService } from '../../src/user/user.service';

export const MOCK_ADMIN_EMAILS = ['admin_e2e@isbx.com'];
export const MOCK_USER_DATA = [
  {
    email: MOCK_ADMIN_EMAILS[0],
    firstName: 'Admin (e2e)',
    lastName: 'User',
    password: 'password',
  },
  {
    email: 'user_e2e@isbx.com',
    firstName: 'Normal (e2e)',
    lastName: 'User',
    password: 'password',
  },
];

export class UserMock {
  private rolesService: RolesService;
  private userService: UserService;

  constructor(private readonly module: TestingModule) {
    this.userService = module.get<UserService>(UserService);
    this.rolesService = module.get<RolesService>(RolesService);
  }

  async generate() {
    const adminRole = await this.setupRole('Admin');
    for (const user of MOCK_USER_DATA) {
      if (MOCK_ADMIN_EMAILS.includes(user.email)) {
        await this.setupUser(user, adminRole);
      } else {
        await this.setupUser(user);
      }
    }
  }

  async setupRole(roleName: string): Promise<Role> {
    // Make sure Admin role exists
    let role = await this.rolesService.findByName(roleName);
    if (!role) {
      // Create Admin role if it doesn't exist
      role = new Role();
      role.name = roleName;
      role = await this.rolesService.create(role);
    }
    return new Promise<Role>(resolve => resolve(role as Role));
  }

  async setupUser(userInfo: any, role?: Role): Promise<User> {
    // Make sure test admin e2e user exists
    let user = await this.userService.findByEmail(userInfo.email);
    if (!user) {
      user = {
        ...new User(),
        ...userInfo,
      };
      if (role) user.roles = [role];
      user = await this.userService.create(user);
    }
    expect(user).toHaveProperty('id');
    return new Promise<User>(resolve => resolve(user as User));
  }
}
