# Template NestJS + Fastify + SWC

Base para APIs con NestJS, Fastify, SWC, PostgreSQL y Docker Compose.

## Requisitos

- Node.js `26.13.0` (versión fijada en `.nvmrc` y en la imagen Docker).
- npm `12` o superior.
- Docker Compose v2 para el entorno completo de desarrollo.

## Inicializar el template

```bash
npm run setup
```

El asistente normaliza el nombre del proyecto, actualiza `package.json` y `package-lock.json`, y crea `docker/.env` con permisos privados y una contraseña aleatoria para desarrollo. El archivo se ignora en Git y en el contexto de Docker.

## Desarrollo con Docker

```bash
docker compose --env-file docker/.env -f docker/docker-compose.dev.yml up --build
```

Compose levanta el backend y PostgreSQL. La base de datos queda disponible dentro de la red de Compose y no publica su puerto al host. Para detener los servicios:

```bash
docker compose --env-file docker/.env -f docker/docker-compose.dev.yml down
```

Para eliminar también los datos persistidos de PostgreSQL:

```bash
docker compose --env-file docker/.env -f docker/docker-compose.dev.yml down --volumes
```

## Desarrollo local

Se necesita PostgreSQL en `localhost:5432` o los valores configurados en `docker/.env`.

```bash
npm ci
npm run start:dev
```

## Configuración

`docker/.env.example` contiene valores de desarrollo. `npm run setup` genera `docker/.env`; no uses esa contraseña local en producción.

| Variable | Uso |
| --- | --- |
| `APP_NAME` | Nombre devuelto por el health check y mostrado en Swagger. |
| `PORT` | Puerto HTTP del backend; por defecto `3000`. |
| `CORS_ORIGINS` | Orígenes permitidos separados por comas. Sin valores, CORS queda deshabilitado. |
| `DB_HOST` | Host PostgreSQL. En Compose de desarrollo se reemplaza por `postgres`. |
| `DB_PORT` | Puerto PostgreSQL; por defecto `5432`. |
| `DB_USER` | Usuario PostgreSQL, obligatorio. |
| `DB_NAME` | Base PostgreSQL, obligatoria. |
| `DB_PASS` | Contraseña PostgreSQL, obligatoria. |
| `DB_SSL` | En producción debe ser `true`; en desarrollo local se desactiva. |
| `DB_SSL_CA_BASE64` | CA privada codificada en base64 si la base usa un certificado no incluido en Node. |
| `SWAGGER_ENABLED` | Permite Swagger en producción solo cuando vale `true`. |

En producción, configura `docker/.env` mediante el mecanismo de secretos del entorno y apunta `DB_HOST` a una base administrada o externa. No incluyas credenciales en la imagen ni en Git. La base no se crea desde el Compose de producción.

## Rutas

- `GET /api/health`: responde el estado básico del servicio y `APP_NAME`.
- `/docs`: interfaz Swagger en desarrollo. En producción se deshabilita salvo que `SWAGGER_ENABLED=true`.
- El template no incluye autenticación ni guards; agrega y configura autorización antes de exponer rutas privadas.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run setup` | Inicializa el nombre y el entorno local. |
| `npm run start:dev` | Inicia NestJS en modo watch. |
| `npm run build` | Compila con NestJS y SWC, con verificación de tipos. |
| `npm run type-check` | Verifica tipos con TypeScript. |
| `npm run lint` | Ejecuta ESLint sin modificar archivos. |
| `npm run lint:fix` | Aplica las correcciones automáticas de ESLint. |
| `npm run security:audit` | Revisa vulnerabilidades en todas las dependencias. |
| `npm run security:audit:prod` | Revisa vulnerabilidades en dependencias de producción. |
| `npm test` | Ejecuta Jest. |

## Decisiones de seguridad del template

- CORS acepta solo los orígenes listados en `CORS_ORIGINS`.
- Fastify omite las líneas automáticas de acceso exitoso de `/api/health`; conserva el registro de errores y el de las demás rutas.
- TypeORM requiere credenciales explícitas y mantiene `synchronize: false`.
- Producción requiere TLS verificado para PostgreSQL (`DB_SSL=true`); se puede configurar una CA privada mediante `DB_SSL_CA_BASE64`.
- Swagger queda apagado por defecto en producción.
- La imagen de producción ejecuta Node como usuario sin privilegios.
- `.dockerignore` excluye `.env`, dependencias, builds y metadatos Git del contexto.
- `npm audit` y las actualizaciones de Docker/Node deben mantenerse al día.
