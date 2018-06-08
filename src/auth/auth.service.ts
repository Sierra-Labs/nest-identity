import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@sierralabs/nest-utils';

import { ModuleRef } from '@nestjs/core';
import { JwtPayload, JwtToken } from '.';

/**
 * Provides an authentication service for creating JWT access token.
 */
@Injectable()
export class AuthService {

  constructor(
    private readonly configService: ConfigService
  ) {}

  /**
   * Create a JWT access token.
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

}
