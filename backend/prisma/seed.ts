import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@studytrack.dev';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('ℹ️  Usuário demo já existe. Seed ignorado.');
    return;
  }

  const passwordHash = await bcrypt.hash('demo1234', 12);
  const user = await prisma.user.create({
    data: { name: 'Usuário Demo', email, passwordHash },
  });

  const ts = await prisma.subject.create({
    data: { userId: user.id, name: 'TypeScript', color: '#3178c6' },
  });
  const react = await prisma.subject.create({
    data: { userId: user.id, name: 'React', color: '#61dafb' },
  });

  await prisma.topic.createMany({
    data: [
      { subjectId: ts.id, name: 'Tipos' },
      { subjectId: ts.id, name: 'Interfaces' },
      { subjectId: ts.id, name: 'Generics' },
      { subjectId: react.id, name: 'Hooks' },
      { subjectId: react.id, name: 'Context API' },
    ],
  });

  const now = new Date();
  const sessionData = [];
  for (let i = 0; i < 14; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const startedAt = new Date(day);
    startedAt.setHours(19, 0, 0, 0);
    const endedAt = new Date(startedAt);
    endedAt.setMinutes(startedAt.getMinutes() + 60 + i * 5);

    sessionData.push({
      userId: user.id,
      subjectId: i % 2 === 0 ? ts.id : react.id,
      startedAt,
      endedAt,
      durationMinutes: Math.round((endedAt.getTime() - startedAt.getTime()) / 60000),
    });
  }
  await prisma.studySession.createMany({ data: sessionData });

  await prisma.task.createMany({
    data: [
      { userId: user.id, subjectId: ts.id, title: 'Estudar Generics', priority: 'HIGH' },
      { userId: user.id, subjectId: react.id, title: 'Praticar Hooks', priority: 'MEDIUM' },
    ],
  });

  await prisma.goal.create({
    data: {
      userId: user.id,
      subjectId: ts.id,
      title: 'Estudar 10h de TypeScript',
      targetHours: 10,
      deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Seed executado. Login: demo@studytrack.dev / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());