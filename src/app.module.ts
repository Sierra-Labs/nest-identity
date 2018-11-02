import * as convict from 'convict';
import * as dotenv from 'dotenv';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConfigModule,
  ConfigService,
  PostgresNamingStrategy,
} from '@sierralabs/nest-utils';

import * as configSchema from '../config/config-schema.json';
import { AuthModule } from './auth/auth.module';
import { TestValidateStrategy } from './auth/test-validate.strategy';
import { RolesModule } from './roles';
import { UserModule } from './user/user.module';

dotenv.config();

const schema = convict(configSchema).validate();
const configService = new ConfigService(schema);

const config = configService.get('database') || ({} as any);

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
      // logging: 'all',
      namingStrategy: new PostgresNamingStrategy(),
    }),
    AuthModule.forRoot(TestValidateStrategy, [UserModule]),
    RolesModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
