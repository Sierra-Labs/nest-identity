import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthModule } from '../src/auth/auth.module';
import { UserModule } from '../src/user/user.module';
import { RolesGuard } from '../src/roles/roles.guard';
import supertest from 'supertest';
import { JwtToken } from '../src/auth/jwt-token.interface';
import { User } from '../src/entities/user.entity';
import { UserController } from '../src/user/user.controller';
import { UserService } from '../src/user/user.service';
import { RolesModule } from '../src/roles/roles.module';
import { Repository, Connection } from 'typeorm';
import { Role } from '../src/entities/role.entity';
import { RolesController } from '../src/roles/roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import _ from 'lodash';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let server: supertest.SuperTest<supertest.Test>;
  let jwtToken: JwtToken;

  let userController: UserController;
  let userRepository: UserRepository;
  let rolesController: RolesController;
  let rolesRepository: Repository<Role>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([User]), AppModule, AuthModule, UserModule, RolesModule],
      providers: [RolesGuard, {
        provide: 'UserRepository',
        useFactory: (connection: Connection) => connection.getCustomRepository(UserRepository),
        inject: [Connection]
      }]
    }).compile();

    userController = module.get<UserController>(UserController);
    userRepository = module.get<UserRepository>('UserRepository');
    rolesController = module.get<RolesController>(RolesController);
    rolesRepository = module.get<Repository<Role>>('RoleRepository');

    app = module.createNestApplication();
    await app.init();

    server = supertest(app.getHttpServer());

    // Make sure Admin role exists
    let role = await rolesRepository.createQueryBuilder('role')
      .where('role.name = :name')
      .setParameters({ name: 'Admin' })
      .getOne();
    if (!role) {
      // Create Admin role if it doesn't exist
      role = new Role();
      role.name = 'Admin';
      const newRole = await rolesController.create(role);
    }

    // Make sure test admin e2e user exists
    // await userRepository.delete({ email: 'admin_e2e@isbx.com' });
    let user = await userRepository.findByEmail('admin_e2e@isbx.com');
    if (!user) {
      user = new User();
      user.email = 'admin_e2e@isbx.com';
      user.firstName = 'Admin (e2e)';
      user.lastName = 'User';
      user.password = 'password';
      user.roles = [role];
      user = await userController.create(user);
    }
    expect(user).toHaveProperty('id');
    expect(_.filter(user.roles, {name: 'Admin'})).toHaveLength(1);

    user = await userRepository.findByEmail('user_e2e@isbx.com');
    if (!user) {
      user = new User();
      user.email = 'user_e2e@isbx.com';
      user.firstName = 'Normal (e2e)';
      user.lastName = 'User';
      user.password = 'password';
      user = await userController.create(user);
    }
    expect(user).toHaveProperty('id');

  });

  describe('Admin User', () => {
    it('/POST /users/login', async () => {
      const response = await server
        .post('/users/login')
        .send({
          email: 'admin_e2e@isbx.com',
          password: 'password'
        })
        .expect(201);

      // response.body.should.include('accessToken');
      jwtToken = response.body;
    });

    // it('/POST /users/login', async () => {
    //   const response = await server
    //     .post('/users/login')
    //     .send({
    //       email: 'test@gmail.com',
    //       password: 'password2'
    //     })
    //     .expect(401);
    // });

    it('/GET /users', async () => {
      // jwtToken = {accessToken: ''};
      const response = await server
        .get('/users')
        .set('Authorization', 'bearer ' + jwtToken.accessToken)
        .expect(200);

      // console.log('response', response.body);
    });

    it('should fail to create user with duplicate email', async () => {

    });
  });

  describe('Normal User', () => {
    it('/POST /users/login', async () => {
      const response = await server
        .post('/users/login')
        .send({
          email: 'user_e2e@isbx.com',
          password: 'password'
        })
        .expect(201);

      // response.body.should.include('accessToken');
      jwtToken = response.body;
    });

    it('/GET /users', async () => {
      // jwtToken = {accessToken: ''};
      const response = await server
        .get('/users')
        .set('Authorization', 'bearer ' + jwtToken.accessToken)
        .expect(403);

      // console.log('response', response.body);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
