import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { ConfigService } from '@sierralabs/nest-utils';
import { UserService } from '../user/user.service';
import { JwtToken } from './jwt-token.interface';
import { ModuleRef } from '@nestjs/core';

/**
 * Provides an authentication service for validating a user's JWT access code.
 */
@Injectable()
export class AuthService {

  private userService: UserService;

  constructor(
    private readonly configService: ConfigService,
    private readonly moduleRef: ModuleRef
  ) {}

  /**
   * Implement circular dependency for UserService.
   */
  onModuleInit() {
    // Prevents circular dependency issue since UserService also requires AuthService
    this.userService = this.moduleRef.get<UserService>(UserService);
  }

  /**
   * Create a JWT access code.
   * @param userId The unique user ID of the current logged in user.
   * @param email The email address of the current logged in user.
   */
  async createToken(userId: number, email: string): Promise<JwtToken> {
    const user: JwtPayload = { userId, email };
    const expiresIn = this.configService.get('jwt.expiresIn') || process.env.JWT_EXPIRES_IN;
    const secret = this.configService.get('jwt.secret') || process.env.JWT_SECRET;
    const accessToken = jwt.sign(user, secret, { expiresIn });
    return {
      expiresIn,
      accessToken,
    };
  }

  /**
   * Validates the JWT access token.
   * @param payload Decrypted JWT payload containing userId.
   */
  async validateUser(payload: JwtPayload): Promise<any> {
    return await this.userService.findById(payload.userId);
  }
}
