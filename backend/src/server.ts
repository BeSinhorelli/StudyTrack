import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(`🚀 StudyTrack API rodando`);
  console.log(`   URL:      http://localhost:${env.PORT}`);
  console.log(`   Ambiente: ${env.NODE_ENV}`);
  console.log('═══════════════════════════════════════════════');
  console.log('');
});

async function shutdown(signal: string) {
  console.log(`\n${signal} recebido. Encerrando...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));