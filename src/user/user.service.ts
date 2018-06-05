import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { ConfigService } from '@sierralabs/nest-utils';
import * as bcrypt from 'bcryptjs';
import { JwtToken } from '../auth/jwt-token.interface';
import { AuthService } from '../auth/auth.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class UserService {

  private authService: AuthService;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly moduleRef: ModuleRef
  ) {}

  /**
   * Implement circular dependency for UserService.
   */
  onModuleInit() {
    // Prevents circular dependency issue since AuthService also requires UserService
    this.authService = this.moduleRef.get<AuthService>(AuthService);
  }

  public async findById(id: number): Promise<User> {
    return await this.userRepository.findOne(id);
  }

  public async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findByEmail(email);
  }

  public async changePassword(user: User, password: string): Promise<User> {
    const rounds = await this.configService.get('password.rounds');
    // tslint:disable-next-line
    if (password.indexOf('$2a$') === 0 && password.length === 60) {
      // assume already a hash, maybe copied from another record
      user.password = password;
    } else {
      user.password = await bcrypt.hash(password, rounds);
    }
    return user;
  }

  public async login(email: string, password: string): Promise<JwtToken> {
    const user = await this.userRepository.findByEmail(email);
    if (!user /*|| !user.verified*/) {
      // TODO: verify user

      // arbitrary bcrypt.compare to prevent(?) timing attacks. Both good/bad paths take
      // roughly the same amount of time
      await bcrypt.compare(
        '1234567890',
        '$2a$14$x.V6i0bmERvdde/UJ/Fk3u41fIqDVMrn0VDP6JDIzbAShOFQqZ9PW'
      );

      throw new UnauthorizedException();
    }
    if (await bcrypt.compare(password, user.password)) {
      return this.authService.createToken(user.id, email);
    }
    throw new UnauthorizedException();
  }
}
