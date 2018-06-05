import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RolesGuard } from './roles/roles.guard';
import { AuthModule } from './auth/auth.module';
import {
  PostgresNamingStrategy,
  ConfigModule,
  ConfigService
} from '@sierralabs/nest-utils';

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
      synchronize: false,
      // logging: 'all',
      namingStrategy: new PostgresNamingStrategy(),
    }),
    AuthModule,
    UserModule
  ],
  controllers: [],
  providers: [ RolesGuard ],
})
export class AppModule {}
