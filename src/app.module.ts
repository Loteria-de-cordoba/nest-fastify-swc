import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join, resolve } from 'path';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(__dirname, '..', '..', 'docker', '.env'),
        resolve(process.cwd(), 'docker', '.env'),
        resolve(process.cwd(), '.env'),
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'admin',
      password: process.env.DB_PASS || 'admin123',
      database: process.env.DB_NAME || 'postgres',
      autoLoadEntities: true,
      synchronize: false, // true ⚠️ solo en desarrollo
    }),
    HealthModule,
  ],
})
export class AppModule {}
