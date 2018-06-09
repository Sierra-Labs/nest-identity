import { Module, forwardRef } from '@nestjs/common';
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
    AuthModule.forRoot(TestValidateStrategy),
    RolesModule,
    UserModule
  ],
  controllers: [],
  providers: [ ],
})
export class AppModule {}
