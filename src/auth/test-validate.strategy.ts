import { ValidateStrategy, JwtPayload } from '.';
import { UserService } from '../user';
import { User } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestValidateStrategy extends ValidateStrategy implements ValidateStrategy {

  constructor(private readonly userService: UserService) {
    super();
  }

  async validate(payload: JwtPayload): Promise<User> {
    return this.userService.findById(payload.userId);
  }
}
