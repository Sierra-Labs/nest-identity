import { Module, forwardRef, DynamicModule, Provider } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload, ValidateStrategy } from '.';

@Module({})
export class AuthModule {
  // TODO: figure out how to define the type for validateStrategy.
  // Do something like forRoot(validateStrategy: typeof ValidateStrategy); however, need a way to pass in a parent
  // (extended class) to forRoot()
  static forRoot<T extends ValidateStrategy>(validateStrategyRef): DynamicModule {

    return {
      module: AuthModule,
      controllers: [],
      providers: [
        {provide: 'ValidateStrategy', useClass: validateStrategyRef},
        AuthService,
        JwtStrategy
      ],
      exports: [AuthService]
    };
  }
}
