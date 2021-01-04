import * as _ from 'lodash';
import * as supertest from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { JwtToken } from '../src/auth/jwt-token.interface';
import { RolesService } from '../src/roles/roles.service';
import { UserService } from '../src/user/user.service';
import { UserMock } from './mocks/user.mock';
import { User } from '../src/entities';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let server: supertest.SuperTest<supertest.Test>;
  let jwtToken: JwtToken<User>;

  let userService: UserService;
  let rolesService: RolesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userService = module.get<UserService>(UserService);
    rolesService = module.get<RolesService>(RolesService);

    app = module.createNestApplication();
    await app.init();

    server = supertest(app.getHttpServer());

    const userMock = new UserMock(module);
    await userMock.generate();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Admin User', () => {
    it('/POST /users/login', async () => {
      const response = await server
        .post('/users/login')
        .send({
          email: 'admin_e2e@isbx.com',
          password: 'password',
        })
        .expect(201);

      // response.body.should.include('accessToken');
      jwtToken = response.body;
    });

    xit('/POST /users/login', async () => {
      const response = await server
        .post('/users/login')
        .send({
          email: 'test@gmail.com',
          password: 'password2',
        })
        .expect(401);
    });

    it('/GET /users', async () => {
      const response = await server
        .get('/users')
        .set('Authorization', 'bearer ' + jwtToken.accessToken)
        .expect(200);
    });

    xit('should fail to create user with duplicate email', async () => {});
  });

  describe('Normal User', () => {
    it('/POST /users/login', async () => {
      const response = await server
        .post('/users/login')
        .send({
          email: 'user_e2e@isbx.com',
          password: 'password',
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
    });
  });
});
