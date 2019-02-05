import { UpdateResult } from 'typeorm';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiImplicitBody,
  ApiImplicitQuery,
  ApiOperation,
  ApiUseTags,
} from '@nestjs/swagger';
import {
  ConfigService,
  ParseBooleanPipe,
  ParseEntityPipe,
  RequiredPipe,
} from '@sierralabs/nest-utils';

import { JwtToken } from '../auth/jwt-token.interface';
import { User } from '../entities/user.entity';
import { Roles, RolesGuard } from '../roles';
import { OwnerInterceptor } from './owner.interceptor';
import {
  LoginDto,
  PasswordRecoveryDto,
  PasswordResetDto,
  RegisterDto,
} from './user.dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiUseTags('Users')
@Controller('users')
export class UserController {
  constructor(
    protected readonly userService: UserService,
    protected readonly configService: ConfigService,
  ) {}

  @Post('login')
  @ApiOperation({ title: 'User Login' })
  public async login(@Body() body: LoginDto): Promise<JwtToken> {
    return this.userService.login(body.email, body.password);
  }

  @Roles('$authenticated')
  @Post('logout')
  @HttpCode(204)
  public async logout() {
    this.userService.logout();
  }

  @Roles('Admin')
  @Post()
  @UseInterceptors(new OwnerInterceptor(['createdBy', 'modifiedBy']))
  public async create(
    @Body(new RequiredPipe())
    user: User,
  ): Promise<User> {
    return await this.userService.create(user);
  }

  @Post('register')
  @ApiOperation({ title: 'New User Registration' })
  public async register(@Body() user: RegisterDto): Promise<User> {
    // try/catch to catch unique key failure, etc
    return await this.userService.register(user);
  }

  @Roles('Admin', '$userOwner')
  @Put(':id([0-9]+|me)')
  @UseInterceptors(new OwnerInterceptor(['modifiedBy']))
  public async update(
    @Param('id') id: number | string,
    @Body(
      new RequiredPipe(),
      new ParseEntityPipe({ validate: { skipMissingProperties: true } }),
    )
    user: User,
    @Req() request,
  ): Promise<User> {
    if (!id || id === 'me') {
      id = +request.user.id;
    }
    user.id = id as number;

    // $userOwner cannot update verified status
    if (request.user.id === id) {
      delete user.verified;
    }

    // determine if sensitive data is changed
    const oldUser = await this.userService.findById(id as number);
    if (user.email && user.email !== oldUser.email) {
      user.verified = false;
    }
    if (user.password && user.password.length > 1) {
      user = await this.userService.changePassword(user, user.password);
    } else {
      delete user.password;
    }

    // create media if necessary
    // const media = user.profileMedia;
    // if (media && !media.id) {
    //   await this.mediaRepository.save(media);
    // }

    const newUser = await this.userService.update(user);

    return newUser;
  }

  @Roles('Admin')
  @Delete(':id([0-9]+)')
  public async remove(
    @Param('id') id: number,
    @Req() request,
  ): Promise<UpdateResult> {
    return this.userService.remove(id, request.user.id);
  }

  @Roles('Admin', '$userOwner')
  @Get(':id([0-9]+|me)')
  public async getOne(@Param('id') id: number | string, @Req() request) {
    if (!id || id === 'me') {
      id = request.user.id; // return current user info
    }
    const user = await this.userService.findById(id as number);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Get()
  @Roles('Admin')
  @ApiImplicitQuery({ name: 'search', required: false })
  @ApiImplicitQuery({ name: 'page', required: false })
  @ApiImplicitQuery({ name: 'limit', required: false })
  @ApiImplicitQuery({ name: 'order', required: false })
  @ApiImplicitQuery({ name: 'includeDeleted', required: false })
  public async getAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('order') order?: string,
    @Query('search') search?: string,
    @Query('includeDeleted', new ParseBooleanPipe())
    includeDeleted?: boolean,
  ) {
    const maxSize = this.configService.get('pagination.maxPageSize') || 200;
    const defaultSize =
      this.configService.get('pagination.defaultPageSize') || 100;
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
      'created desc',
    ];

    if (orderOptions.indexOf(order) === -1) {
      order = 'id asc';
    }
    const orderParts = order.split(' ');
    const orderConfig = {};
    orderConfig[orderParts[0]] = orderParts[1].toUpperCase();

    // const fields = ['user.id as id', 'email', 'first_name', 'last_name', 'verified', 'deleted'],
    const fields = null;

    return this.userService.findWithFilter(
      orderConfig,
      limit,
      offset,
      '%' + (search || '') + '%',
      fields,
      includeDeleted,
    );
  }

  @Get('count')
  @Roles('Admin')
  public async getCount(
    @Query('search') search?: string,
    @Query('includeDeleted', new ParseBooleanPipe())
    includeDeleted?: boolean,
  ): Promise<number> {
    return this.userService.countWithFilter(search, includeDeleted);
  }

  @Post('password/recover')
  @ApiOperation({ title: 'Request Password Recovery Email' })
  public async passwordRecovery(
    @Body() param: PasswordRecoveryDto,
  ): Promise<boolean> {
    return this.userService.recoverPassword(param.email);
  }

  @Put('password/reset')
  @ApiOperation({ title: 'Reset User Password' })
  public async passwordReset(@Body() body: PasswordResetDto): Promise<boolean> {
    return this.userService.resetPassword(body.password, body.token);
  }

  @Get('password/verify/reset-token')
  @ApiOperation({ title: 'Verify Password Reset Token' })
  public async verifyResetToken(@Query('token') token: string): Promise<User> {
    return this.userService.verifyResetToken(token);
  }

  @Get('verify/email')
  @ApiOperation({ title: 'Verify E-mail Token' })
  public async verifyEmail(@Query('token') token: string): Promise<JwtToken> {
    return this.userService.verifyEmail(token);
  }
}
