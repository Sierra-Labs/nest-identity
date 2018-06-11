import { Module, forwardRef, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RolesGuard } from './roles/roles.guard';
import { AuthModule } from './auth/auth.module';
import { TestValidateStrategy } from './auth/test-validate.strategy';
import {
  PostgresNamingStrategy,
  ConfigModule,
  ConfigService
} from '@sierralabs/nest-utils';
import { RolesModule } from 'roles';
import helmet = require('helmet');
import { UserService } from 'user';
import { User } from 'entities';

const configService = new ConfigService();
const config = configService.get('database') || {};

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      entities: ['src/**/**.entity{.ts,.js}'],
      extra: {
        idleTimeoutMillis: config.poolIdleTimeout,
        max: config.poolMax,
        ssl: config.ssl,
      },
      // synchronize: true,
      logging: 'all',
      namingStrategy: new PostgresNamingStrategy(),
    }),
    AuthModule.forRoot(TestValidateStrategy, [UserModule]),
    RolesModule,
    UserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply([
        // versionHeaderMiddleware,
        // cookieParser(cookieConfig.secret),
        helmet(),
      ])
      .forRoutes('*');
  }
}
