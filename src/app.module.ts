import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), 'docker', '.env'),
        resolve(process.cwd(), '.env'),
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('NODE_ENV') === 'production';
        const sslEnabled = config.get('DB_SSL', isProduction ? 'true' : 'false') === 'true';
        if (isProduction && !sslEnabled) {
          throw new Error('DB_SSL=true is required in production');
        }

        const caBase64 = config.get<string>('DB_SSL_CA_BASE64');
        const ssl = sslEnabled
          ? {
              rejectUnauthorized: true,
              ...(caBase64 ? { ca: Buffer.from(caBase64, 'base64') } : {}),
            }
          : false;

        const port = Number(config.get('DB_PORT', '5432'));
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
          throw new Error('DB_PORT must be an integer between 1 and 65535');
        }

        return {
          type: 'postgres' as const,
          host: config.getOrThrow<string>('DB_HOST'),
          port,
          username: config.getOrThrow<string>('DB_USER'),
          password: config.getOrThrow<string>('DB_PASS'),
          database: config.getOrThrow<string>('DB_NAME'),
          ssl,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    HealthModule,
  ],
})
export class AppModule {}
