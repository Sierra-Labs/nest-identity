import {
  Controller,
  Body,
  Post, Get,
  Query, UseGuards,
  Param,
  Put,
  ParseIntPipe,
  NotFoundException,
  HttpCode
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { Roles } from '../roles';
import { AuthGuard } from '@nestjs/passport';
import { JwtToken } from '../auth/jwt-token.interface';
import { ApiImplicitBody, ApiImplicitQuery } from '@nestjs/swagger';
import { RolesGuard } from '../roles/roles.guard';
import {
  ConfigService,
  RequiredPipe,
  RequestProperty,
  ParseEntityPipe
} from '@sierralabs/nest-utils';

@Controller('users')
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  // @ApiImplicitBody({ name: 'email', required: true, type: String })
  // @ApiImplicitBody({ name: 'password', required: true, type: String })
  @Post('login')
  public async login(
    @Body('email', new RequiredPipe())
    email: string,
    @Body('password', new RequiredPipe())
    password: string
  ): Promise<JwtToken> {
    return this.userService.login(email, password);
  }

  // @Roles('$authenticated')
  // @Post('logout')
  // @HttpCode(204)
  // public async logout(
  //   @RequestProperty('accessToken') accessToken: AccessToken
  // ) {
  //   this.accessTokenRepository.removeById(accessToken.id);
  // }

  @Roles('Admin')
  @Post()
  public async create(
    @Body(new RequiredPipe())
    user: User
  ): Promise<User> {
    delete user.id; // make sure no existing id exists when saving user
    user = await this.userService.changePassword(user, user.password);
    const newUser = await this.userRepository.save(user);
    return newUser;
  }

  @Roles('$everyone')
  @Post('register')
  public async register(
    @Body(new RequiredPipe())
    user: User
  ) {
    // new account created by the public should not have an id yet, nor should they be verified
    delete user.id;
    user.verified = false;

    if (user.password) {
      user = await this.userService.changePassword(user, user.password);
    }

    // try/catch to catch unique key failure, etc
    const newUser = await this.userRepository.save(user);

    // TODO: Imeplement email delivery
    // const fromEmail = await this.configService.get('email.from');
    // await this.emailService.sendTemplate(
    //   fromEmail,
    //   newUser.email,
    //   'Welcome Subject',
    //   'welcome',
    //   { name: newUser.username }
    // );

    return newUser;
  }

  @Roles('Admin', '$userOwner')
  @Put(':id([0-9]+)')
  public async update(
    @Param('id', new ParseIntPipe())
    id: number,
    @Body(
      new RequiredPipe(),
      new ParseEntityPipe({ validate: { skipMissingProperties: true } })
    )
    user: User
  ) {
    user.id = id;

    // determine if sensitive data is changed
    const oldUser = await this.userRepository.findOne(id);
    if (user.email && user.email !== oldUser.email) {
      user.verified = false;
    }
    if (user.password) {
      user = await this.userService.changePassword(user, user.password);
    }

    // create media if necessary
    // const media = user.profileMedia;
    // if (media && !media.id) {
    //   await this.mediaRepository.save(media);
    // }

    const newUser = await this.userRepository.save(user);

    return newUser;
  }

  @Roles('Admin', '$userOwner')
  @Get(':id([0-9]+|me)')
  public async getOne(
    @Param('id', new ParseIntPipe())
    id: number
  ) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Get()
  @Roles('Admin')
  // @ApiImplicitQuery({ name: 'search', required: false, type:  })
  // @ApiImplicitQuery({ name: 'page', required: false })
  // @ApiImplicitQuery({ name: 'page', required: false })
  // @ApiImplicitQuery({ name: 'limit', required: false })
  // @ApiImplicitQuery({ name: 'order', required: false })
  public async getAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('order') order?: string,
    @Query('search') search?: string
  ) {
    const maxSize = this.configService.get('pagination.maxPageSize') || 200;
    const defaultSize = this.configService.get('pagination.defaultPageSize') || 100;
    limit = Math.min(maxSize, limit || defaultSize);
    const offset = (page || 0) * limit;

    const orderOptions = [
      'id asc',
      'id desc',
      'first_name asc',
      'last_name asc',
      'username desc',
      'email asc',
      'email desc',
      'created asc',
      'created desc'
    ];

    if (orderOptions.indexOf(order) === -1) {
      order = 'id asc';
    }
    const orderParts = order.split(' ');
    const orderConfig = {};
    orderConfig[orderParts[0]] = orderParts[1].toUpperCase();

    return this.userRepository.findWithFilter(
      orderConfig,
      limit,
      offset,
      '%' + (search || '') + '%'
    );
  }

}
