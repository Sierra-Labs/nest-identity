import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class ValidateStrategy {
  async validate(payload: JwtPayload): Promise<any> {
    throw new UnauthorizedException('Unimplemented Validation Strategy');
  }
}
