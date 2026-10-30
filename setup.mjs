#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function readEnvFile(filePath, defaults) {
  if (!fs.existsSync(filePath)) return defaults;

  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator < 0) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (key) defaults[key] = value;
  }

  return defaults;
}

function normalizeProjectName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[._-]+|[._-]+$/g, '')
    .slice(0, 214) || 'my-nest-project';
}

async function main() {
  console.log('NestJS Template Setup\n');

  const requestedName = (await ask('Nombre del nuevo proyecto: ')).trim();
  const projectName = normalizeProjectName(requestedName || 'my-nest-project');
  if (requestedName !== projectName) {
    console.log(`El nombre se normalizó como: ${projectName}`);
  }

  const defaults = readEnvFile(path.resolve('docker', '.env.example'), {
    APP_NAME: projectName,
    PORT: '3000',
    CORS_ORIGINS: 'http://localhost:3000',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USER: 'nest_template',
    DB_NAME: 'nest_template',
    DB_PASS: '',
    DB_SSL: 'false',
    DB_SSL_CA_BASE64: '',
  });

  defaults.APP_NAME = projectName;
  defaults.DB_PASS ||= randomBytes(32).toString('base64url');

  const customDb = (await ask('¿Querés configurar otra conexión a base de datos? (y/N): '))
    .trim()
    .toLowerCase();

  if (['y', 'yes', 's', 'si'].includes(customDb)) {
    for (const key of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME', 'DB_PASS']) {
      const value = (await ask(`${key} (${defaults[key]}): `)).trim();
      if (value) defaults[key] = value;
    }
  }

  const dockerEnvPath = path.resolve('docker', '.env');
  fs.mkdirSync(path.dirname(dockerEnvPath), { recursive: true });

  if (fs.existsSync(dockerEnvPath)) {
    const overwrite = (await ask('Ya existe docker/.env. ¿Sobrescribirlo? (y/N): '))
      .trim()
      .toLowerCase();
    if (!['y', 'yes', 's', 'si'].includes(overwrite)) {
      console.log('Se conserva el archivo docker/.env existente.');
    } else {
      writeEnvFile(dockerEnvPath, defaults);
    }
  } else {
    writeEnvFile(dockerEnvPath, defaults);
  }

  const packagePath = path.resolve('package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.name = projectName;
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const packageLockPath = path.resolve('package-lock.json');
  if (fs.existsSync(packageLockPath)) {
    const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
    packageLock.name = projectName;
    if (packageLock.packages?.['']) {
      packageLock.packages[''].name = projectName;
    }
    fs.writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
  }

  rl.close();
  console.log(`\nSetup completo para ${projectName}.`);
  console.log('Desarrollo con Docker:');
  console.log('  docker compose --env-file docker/.env -f docker/docker-compose.dev.yml up --build');
  console.log('Desarrollo local:');
  console.log('  npm ci && npm run start:dev');
}

function writeEnvFile(filePath, values) {
  const keys = [
    'APP_NAME',
    'PORT',
    'CORS_ORIGINS',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_NAME',
    'DB_PASS',
    'DB_SSL',
    'DB_SSL_CA_BASE64',
  ];
  const content = `${keys.map((key) => `${key}=${values[key] ?? ''}`).join('\n')}\n`;
  fs.writeFileSync(filePath, content, { mode: 0o600 });
  fs.chmodSync(filePath, 0o600);
  console.log(`Archivo de entorno creado/actualizado: ${filePath}`);
}

main().catch((error) => {
  console.error('Error en el setup:', error);
  rl.close();
  process.exitCode = 1;
});
