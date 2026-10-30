import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyCors from '@fastify/cors';
import {
  FastifyReply,
  FastifyRequest,
  LogController,
} from 'fastify';

class ApplicationLogController extends LogController {
  private isHealthProbe(request: FastifyRequest): boolean {
    return request.url.split('?')[0] === '/api/health';
  }

  override incomingRequest(
    request: FastifyRequest,
    reply: FastifyReply,
    metadata?: Record<string, unknown>,
  ): void {
    if (this.isHealthProbe(request)) return;
    super.incomingRequest(request, reply, metadata);
  }

  override requestCompleted(
    error: Error | null | undefined,
    request: FastifyRequest,
    reply: FastifyReply,
    metadata?: Record<string, unknown>,
  ): void {
    if (!error && this.isHealthProbe(request)) return;
    super.requestCompleted(error, request, reply, metadata);
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      logController: new ApplicationLogController(),
    }),
  );

  const configService = app.get(ConfigService);
  const port = Number(configService.get('PORT', '3000'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const allowedOrigins = (configService.get<string>('CORS_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (allowedOrigins.includes('*')) {
    throw new Error('CORS_ORIGINS must contain explicit origins when credentials are enabled');
  }

  await app.register(fastifyCors, {
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: allowedOrigins.length > 0,
  });

  const isProduction = configService.get('NODE_ENV') === 'production';
  const swaggerEnabled = configService.get('SWAGGER_ENABLED') === 'true';
  if (!isProduction || swaggerEnabled) {
    const appName = configService.get('APP_NAME', 'NestJS API');
    const swaggerConfig = new DocumentBuilder()
      .setTitle(appName)
      .setDescription(`${appName} API`)
      .setVersion('1.0.0')
      .addServer(`http://localhost:${port}`, 'Local')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      jsonDocumentUrl: 'docs/json',
      swaggerOptions: { persistAuthorization: false },
    });
  }

  await app.listen(port, '0.0.0.0');
}

bootstrap().catch((error: unknown) => {
  console.error('Application bootstrap failed', error);
  process.exitCode = 1;
});
