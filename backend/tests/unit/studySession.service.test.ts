import { describe, it, expect, beforeEach } from 'vitest';
import { studySessionService } from '../../src/services/studySession.service.js';
import { AppError } from '../../src/utils/AppError.js';
import { createUser, createSubject, createTopic, cleanDatabase } from '../helpers/factories.js';

describe('studySessionService', () => {
  let userId: string;
  let subjectId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const { user } = await createUser();
    userId = user.id;
    const subject = await createSubject(userId);
    subjectId = subject.id;
  });

  describe('create', () => {
    it('calcula duração corretamente entre startedAt e endedAt', async () => {
      const startedAt = new Date('2026-01-01T19:00:00.000Z');
      const endedAt = new Date('2026-01-01T20:30:00.000Z');

      const session = await studySessionService.create(userId, {
        subjectId,
        startedAt,
        endedAt,
      });

      expect(session.durationMinutes).toBe(90);
    });

    it('rejeita quando endedAt é anterior a startedAt', async () => {
      const startedAt = new Date('2026-01-01T20:00:00.000Z');
      const endedAt = new Date('2026-01-01T19:00:00.000Z');

      await expect(
        studySessionService.create(userId, { subjectId, startedAt, endedAt }),
      ).rejects.toThrow(AppError);
    });

    it('rejeita duração maior que 12 horas', async () => {
      const startedAt = new Date('2026-01-01T08:00:00.000Z');
      const endedAt = new Date('2026-01-01T22:00:00.000Z'); // 14h

      await expect(
        studySessionService.create(userId, { subjectId, startedAt, endedAt }),
      ).rejects.toThrow('Sessão não pode ter mais de 12 horas');
    });

    it('rejeita sessão no futuro', async () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      const startedAt = future;
      const endedAt = new Date(future.getTime() + 60 * 60 * 1000);

      await expect(
        studySessionService.create(userId, { subjectId, startedAt, endedAt }),
      ).rejects.toThrow('Sessão não pode começar no futuro');
    });

    it('rejeita matéria de outro usuário', async () => {
      const { user: otherUser } = await createUser();
      const otherSubject = await createSubject(otherUser.id);

      await expect(
        studySessionService.create(userId, {
          subjectId: otherSubject.id,
          startedAt: new Date(Date.now() - 3600_000),
          endedAt: new Date(),
        }),
      ).rejects.toThrow('Matéria não encontrada');
    });

    it('rejeita tópico que não pertence à matéria', async () => {
      const otherSubject = await createSubject(userId, { name: 'React' });
      const otherTopic = await createTopic(otherSubject.id);

      await expect(
        studySessionService.create(userId, {
          subjectId,
          topicId: otherTopic.id,
          startedAt: new Date(Date.now() - 3600_000),
          endedAt: new Date(),
        }),
      ).rejects.toThrow('Tópico não encontrado');
    });
  });
});