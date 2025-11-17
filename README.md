# 🧱 NestJS + Fastify + SWC Template

Template base para crear APIs **rápidas, modernas y eficientes** con [NestJS](https://nestjs.com/), [Fastify](https://fastify.io/) y [SWC](https://swc.rs/).
Pensado como punto de partida para proyectos backend escalables dentro de cualquier entorno profesional.

---

## 🚀 Características principales

✅ **NestJS + Fastify** — servidor HTTP de alto rendimiento, más rápido que Express.

✅ **Compilador SWC** — compilación hasta 20x más rápida que `tsc`.

✅ **TypeScript** — tipado fuerte y estructura modular.

✅ **Script de setup automatizado** — inicializa el proyecto con nombre y variables personalizadas.

✅ **Entorno Docker listo** — configuración base para levantar el backend con PostgreSQL.

✅ **Health check API** — endpoint básico `/health` para monitoreo.

✅ **Soporte de configuración global (.env)** — manejo de entornos flexible y centralizado.

---

## 🧩 Tecnologías principales

| Tecnología              | Uso                                      |
| ------------------------ | ---------------------------------------- |
| **NestJS**         | Framework backend modular                |
| **Fastify**        | Servidor HTTP de alto rendimiento        |
| **SWC**            | Compilador ultrarrápido para TypeScript |
| **TypeORM**        | ORM para PostgreSQL                      |
| **Docker Compose** | Entorno local y despliegue rápido       |
| **Node.js 22+**    | Entorno de ejecución recomendado        |

---

## 📁 Estructura del proyecto

```
.
├── docker/
│   ├── .env              # Variables de entorno (se genera con setup.js)
│   ├── .env.example      # Variables de entorno por defecto
│   └── docker-compose.yml
├── src/
│   ├── health/           # Módulo de health check
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   └── app.module.ts     # Configuración principal (ConfigModule + TypeORM)
├── setup.js              # Script automático de inicialización del template
├── package.json
├── nest-cli.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Uso del template

### 1️⃣ Crear un nuevo repositorio desde GitHub

1. Abrí este repositorio en GitHub.
2. Hacé clic en **Use this template → Create a new repository**.
3. Elegí el nombre y visibilidad del nuevo repo.
4. Clonalo localmente:
   ```bash
   git clone https://github.com/tu-org/nuevo-proyecto.git
   cd nuevo-proyecto
   ```

---

### 2️⃣ Inicializar el proyecto

Ejecutá el script de setup:

```bash
npm run setup
```

El asistente te pedirá:

- Nombre del nuevo proyecto.
- Si querés configurar conexión a base de datos personalizada.
- (Opcional) Datos de host, puerto, usuario, base y contraseña.

El script:

- Generará el archivo `docker/.env` (desde `.env.example` o valores custom).
- Actualizará el nombre del proyecto en los archivos relevantes:
  - `package.json`
  - `package-lock.json`
  - `docker/docker-compose.yml` (container_name e image)
  - `src/health/health.controller.ts`

---

### 3️⃣ Levantar el entorno

#### 🐳 Opción 1 — con Docker (recomendada)

```bash
docker compose up --build
```

Esto levantará el contenedor del backend y, si lo configurás, también PostgreSQL.

#### 💻 Opción 2 — localmente sin Docker

Instalá dependencias y ejecutá:

```bash
npm install
npm run start:dev
```

---

## 🌱 Variables de entorno

El proyecto usa **ConfigModule** global para cargar variables desde los siguientes paths (en orden de prioridad):

1. `./docker/.env`
2. `./.env`

Ejemplo de configuración por defecto:

```bash
# variables
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_NAME=postgres
DB_PASS=admin123
```

---

## 🩺 Health check básico

Ruta:

```
GET /health
```

Devuelve información básica de estado y nombre del proyecto.
Ideal para monitoreo, load balancers o verificación de despliegue.

Ejemplo de respuesta:

```json
{
  "status": "ok",
  "name": "my-nest-project",
}
```

---

## 🧰 Scripts disponibles

| Script                 | Descripción                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run setup`      | Ejecuta el asistente de configuración inicial   |
| `npm run start`      | Inicia la aplicación en modo producción        |
| `npm run start:dev`  | Inicia la aplicación en modo desarrollo (watch) |
| `npm run build`      | Compila usando SWC con type-check                |
| `npm run type-check` | Verifica tipos usando `tsc --noEmit`           |

---

## 🛠️ Recomendaciones de desarrollo

- Usa **Node.js 22+** y **npm 10+**.
- Mantén tu `.env.example` actualizado para futuros clones del template.
- Si agregás nuevos módulos o configuraciones base, hacé commit en `main` — el template se actualiza automáticamente.
- Para proyectos derivados, recordá que **los cambios del template no se aplican automáticamente**; deberás mergearlos manualmente si querés traer mejoras.

---

## 🧩 Próximos pasos sugeridos

- Añadir un módulo `Logger` centralizado.
- Configurar `Prettier` y `ESLint` con reglas comunes de equipo.
- Crear una acción de GitHub CI para `build + lint + test`.
- Crear script de testing e2e automático basado en documentación Swagger

---

## 🧱 Licencia

Este template es de uso interno para proyectos de **Loteria de Córdoba**, pero puede adaptarse libremente en otros contextos.
Licencia recomendada: [MIT](https://opensource.org/licenses/MIT).

---

_Hecho por Octavio Garcia - [Github](https://github.com/OctavioGarcia1337 "Github Profile")_
