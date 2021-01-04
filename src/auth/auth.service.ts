import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@sierralabs/nest-utils';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { JwtPayload, JwtToken } from '.';
import {
  LoginTicket,
  TokenPayload,
} from 'google-auth-library/build/src/auth/loginticket';

/**
 * Provides an authentication service for creating JWT access token.
 */
@Injectable()
export class AuthService<T> {
  private logger = new Logger('AuthService');
  private defaultExpiration: string;
  private secret: string;
  private googleAuthClientID: string;
  private googleClient: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    this.defaultExpiration =
      this.configService.get('jwt.expiresIn') || process.env.JWT_EXPIRES_IN;
    this.secret =
      this.configService.get('jwt.secret') || process.env.JWT_SECRET;
    this.googleAuthClientID =
      this.configService.get('google.auth.clientId') ||
      process.env.GOOGLE_AUTH_CLIENT_ID;
    this.googleClient = new OAuth2Client(this.googleAuthClientID);
  }

  /**
   * Create a JWT access token.
   * @param userId The unique user ID of the current logged in user.
   * @param email The email address of the current logged in user.
   */
  public createToken(userId: number, email: string): JwtToken<T>;
  public createToken(payload: JwtPayload, expiresIn?: string): JwtToken<T>;
  public createToken(
    payloadOrUserId: JwtPayload | number,
    expiresInOrEmail: string,
    expiresInOptional?: string,
  ): JwtToken<T> {
    let payload: JwtPayload;
    let expiresIn = this.defaultExpiration;
    if (payloadOrUserId instanceof Object) {
      // payload
      payload = payloadOrUserId as JwtPayload;
      if (expiresInOrEmail) expiresIn = expiresInOrEmail;
    } else {
      // userId
      const email = expiresInOrEmail;
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

  public async verifyGoogleAuthToken(token: string): Promise<TokenPayload> {
    // this.logger.log('verifying token...');
    try {
      const ticket: LoginTicket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.googleAuthClientID,
      });
      // this.logger.log(`ticket: ${ticket}`);
      return ticket.getPayload();
    } catch (error) {
      throw new UnauthorizedException('Invalid Google Authentication ID Token');
    }
  }
}
