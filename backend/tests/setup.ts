import { execSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const TEST_DB_PATH = resolve(__dirname, '../prisma/test.db');
const TEST_DB_URL = `file:./test.db`;

// Antes de tudo: apaga o banco de teste se existir e recria com migration
beforeAll(() => {
  // Remove banco antigo
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }

  // Set env ANTES de importar o Prisma
  process.env.DATABASE_URL = TEST_DB_URL;
  process.env.JWT_SECRET = 'test-secret-com-no-minimo-32-caracteres-aqui-ok';
  process.env.NODE_ENV = 'test';

  // Aplica migrations no banco de teste
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    stdio: 'inherit',
  });
});

// Depois de tudo: limpa
afterAll(() => {
  if (existsSync(TEST_DB_PATH)) {
    try {
      unlinkSync(TEST_DB_PATH);
    } catch {
      // ignora
    }
  }
});