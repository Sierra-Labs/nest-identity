import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@sierralabs/nest-utils';
import { JwtPayload, ValidateStrategy } from '.';

// Jest has an ExtractJwt reference error for some reason
const fromAuthHeaderAsBearerToken = ExtractJwt.fromAuthHeaderAsBearerToken;

/**
 * A custom JWT Passport Strategy for handling authorization JWT Payloads.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject('ValidateStrategy')
    private readonly validateStrategy: ValidateStrategy
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
    const validated = await this.validateStrategy.validate(payload);
    if (!validated) {
      return callback(new UnauthorizedException(), false);
    }
    return callback(null, validated);
  }
}
