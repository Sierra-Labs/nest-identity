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
  private defaultExpiration: string;
  private secret: string;

  constructor(
    private readonly configService: ConfigService
  ) {
    this.defaultExpiration = this.configService.get('jwt.expiresIn') || process.env.JWT_EXPIRES_IN;
    this.secret = this.configService.get('jwt.secret') || process.env.JWT_SECRET;
  }

  /**
   * Create a JWT access token.
   * @param userId The unique user ID of the current logged in user.
   * @param email The email address of the current logged in user.
   */
  public createToken(userId: number, email: string): JwtToken;
  public createToken(payload: JwtPayload, expiresIn?: string): JwtToken;
  public createToken(payloadOrUserId: JwtPayload | number, expiresInOrEmail: string, expiresInOptional?: string): JwtToken {
    let payload: JwtPayload;
    let expiresIn = this.defaultExpiration;
    if (payloadOrUserId instanceof Object) { // payload
      payload = payloadOrUserId;
      if (expiresInOrEmail) expiresIn = expiresInOrEmail;
    } else { // userId
      let email = expiresInOrEmail;
      if (expiresInOptional) expiresIn = expiresInOptional;
      payload = { userId: payloadOrUserId, email };
    }

    const accessToken = jwt.sign(payload, this.secret, { expiresIn });
    return {
      expiresIn,
      accessToken,
    };
  }

  public verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}
