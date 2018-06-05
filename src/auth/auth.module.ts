import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [],
  providers: [AuthService, JwtStrategy, UserService],
  exports: [AuthService]
})
export class AuthModule {}
