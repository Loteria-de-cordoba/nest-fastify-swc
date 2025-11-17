import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyCors from '@fastify/cors';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }) // logger nativo de fastify (rápido)
  );

  await app.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  // si más adelante usás ValidationPipe, funciona igual con Fastify
  // app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  // ---------- Swagger ----------
  const config = new DocumentBuilder()
    .setTitle('API Juegos')
    .setDescription('Endpoints API Juegos')
    .setVersion('1.0.0')
    // Si usás JWT en cookie (HttpOnly), declará cookie auth para verlo en el spec
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'JWT de acceso enviado como cookie HttpOnly',
    })
    // Opcional: si también admitís Bearer en header:
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'bearer',
    )
    // Opcional: servidores
    .addServer('http://localhost:3000', 'Local')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/json',
    swaggerOptions: {
      persistAuthorization: true, // recuerda el auth en la UI
    },
  });
  // -----------------------------

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
