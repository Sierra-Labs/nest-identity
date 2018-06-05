import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { ConfigService } from '@sierralabs/nest-utils';

// Jest has an ExtractJwt reference error for some reason
const fromAuthHeaderAsBearerToken = ExtractJwt.fromAuthHeaderAsBearerToken;

/**
 * A custom JWT Passport Strategy for handling authorization JWT Payloads.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.secret') || process.env.JWT_SECRET
    });
  }

  /**
   * Validates the decrypted JWT Payload.
   * @param payload The decrypted JWT Payload.
   * @param callback The callback function.
   */
  async validate(payload: JwtPayload, callback) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      return callback(new UnauthorizedException(), false);
    }
    return callback(null, user);
  }
}
