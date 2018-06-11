import { Module, forwardRef, DynamicModule, Provider } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ValidateStrategy } from './validate.strategy';

@Module({})
export class AuthModule {
  // TODO: figure out how to define the type for validateStrategy.
  // Do something like forRoot(validateStrategy: typeof ValidateStrategy); however, need a way to pass in a parent
  // (extended class) to forRoot()
  static forRoot(validateStrategyRef, imports?: any[], providers?: Provider[]): DynamicModule {
    const moduleDef = {
      module: AuthModule,
      imports: [],
      controllers: [],
      providers: [
        {provide: 'ValidateStrategy', useClass: validateStrategyRef},
        AuthService,
        JwtStrategy
      ],
      exports: [AuthService]
    };
    if (imports) {
      Array.prototype.push.apply(moduleDef.imports, imports);
    }
    if (providers) {
      Array.prototype.push.apply(moduleDef.providers, providers);
    }
    return moduleDef;
  }
}
