#!/usr/bin/env node
import fs from "fs";
import readline from "readline";
import path from "path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("🚀 NestJS Template Setup\n");

  // 1️⃣ Pedir nombre del proyecto
  const projectName =
    (await ask("Nombre del nuevo proyecto: ")).trim() || "my-nest-project";

  // 2️⃣ Preguntar si quiere configurar base de datos
  const customDb = (
    await ask("¿Querés configurar conexión a base de datos? (y/N): ")
  ).toLowerCase();

  // 3️⃣ Valores por defecto
  let dbHost = "localhost";
  let dbPort = "5432";
  let dbUser = "admin";
  let dbName = "postgres";
  let dbPass = "admin123";

  // 4️⃣ Cargar valores de .env.example si existe
  const examplePath = path.resolve(".env.example");
  if (fs.existsSync(examplePath)) {
    console.log("📋 Cargando valores desde .env.example...");
    const content = fs.readFileSync(examplePath, "utf8");
    const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
    for (const line of lines) {
      const [key, value] = line.split("=").map((s) => s.trim());
      if (key === "DB_HOST") dbHost = value;
      if (key === "DB_PORT") dbPort = value;
      if (key === "DB_USER") dbUser = value;
      if (key === "DB_NAME") dbName = value;
      if (key === "DB_PASS") dbPass = value;
    }
  }

  // 5️⃣ Permitir configuración personalizada
  if (["y", "yes", "s", "si"].includes(customDb)) {
    dbHost = (await ask(`DB_HOST (${dbHost}): `)) || dbHost;
    dbPort = (await ask(`DB_PORT (${dbPort}): `)) || dbPort;
    dbUser = (await ask(`DB_USER (${dbUser}): `)) || dbUser;
    dbName = (await ask(`DB_NAME (${dbName}): `)) || dbName;
    dbPass = (await ask(`DB_PASS (${dbPass}): `)) || dbPass;
  }

  rl.close();

  // 6️⃣ Crear carpeta docker si no existe
  fs.mkdirSync("docker", { recursive: true });

  // 7️⃣ Crear archivo .env en docker/
  const dockerEnvPath = path.resolve("docker", ".env");
  const envContent = `# variables
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_NAME=${dbName}
DB_PASS=${dbPass}
`;

  fs.writeFileSync(dockerEnvPath, envContent);
  console.log(`✅ Archivo .env creado en: ${dockerEnvPath}`);

  // 8️⃣ Archivos a actualizar
  const filesToUpdate = [
    "package.json",
    "package-lock.json",
    "docker/docker-compose.dev.yml",
    "docker/docker-compose.prod.yml",
    "src/health/health.controller.ts",
  ];

  for (const file of filesToUpdate) {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, "utf8");
      let updated = data.replace(/<project-name>/g, projectName);

      // Extra: actualizar container_name e image en docker-compose
      if (file.includes("docker-compose")) {
        updated = updated
          .replace(/container_name:\s?.*/g, `container_name: ${projectName}`)
          .replace(/image:\s?.*/g, `image: ${projectName}:latest`);
      }

      fs.writeFileSync(file, updated, "utf8");
      console.log(`🔧 Actualizado: ${file}`);
    }
  }

  // 9️⃣ Mensaje final
  console.log(`
✨ Configuración completada.
----------------------------------------
Nombre del proyecto: ${projectName}
Archivo .env: docker/.env
----------------------------------------
Siguientes pasos:
> npm install
> npm run start:dev
`);
}

main().catch((err) => {
  console.error("❌ Error en el setup:", err);
  rl.close();
});
