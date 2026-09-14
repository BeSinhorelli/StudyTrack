import { describe, it, expect, beforeEach } from 'vitest';
import { goalService } from '../../src/services/goal.service.js';
import {
  createUser,
  createSubject,
  createSession,
  cleanDatabase,
} from '../helpers/factories.js';

describe('goalService', () => {
  let userId: string;
  let subjectId: string;

  beforeEach(async () => {
    await cleanDatabase();

    const { user } = await createUser();
    userId = user.id;

    const subject = await createSubject(userId);
    subjectId = subject.id;
  });

  describe('progresso', () => {
    it('retorna 0% quando não há sessões', async () => {
      const goal = await goalService.create(userId, {
        subjectId,
        title: 'Estudar 10h',
        targetHours: 10,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      expect(goal.hoursStudied).toBe(0);
      expect(goal.progressPercent).toBe(0);
      expect(goal.completed).toBe(false);
    });

    it('calcula progresso a partir das sessões da matéria', async () => {
      // 1. Cria a meta primeiro
      const goal = await goalService.create(userId, {
        subjectId,
        title: 'Estudar 4h',
        targetHours: 4,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      // 2. Espera 10ms pra garantir que `now` seja após `goal.createdAt`
      await new Promise((r) => setTimeout(r, 10));

      // 3. Cria as sessões com `startedAt` APÓS a criação da meta
      const now = Date.now();
      await createSession(userId, subjectId, {
        startedAt: new Date(now + 1_000),
        endedAt: new Date(now + 1_000 + 60 * 60 * 1000),
        durationMinutes: 60,
      });
      await createSession(userId, subjectId, {
        startedAt: new Date(now + 2_000 + 60 * 60 * 1000),
        endedAt: new Date(now + 2_000 + 2 * 60 * 60 * 1000),
        durationMinutes: 60,
      });

      // 4. Recarrega a meta pra ver o progresso
      const updated = await goalService.getById(goal.id, userId);

      expect(updated.hoursStudied).toBe(2);
      expect(updated.progressPercent).toBe(50);
    });

    it('marca como completed quando atinge a meta', async () => {
      const goal = await goalService.create(userId, {
        subjectId,
        title: 'Estudar 5h',
        targetHours: 5,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await new Promise((r) => setTimeout(r, 10));

      const now = Date.now();
      await createSession(userId, subjectId, {
        durationMinutes: 300,
        startedAt: new Date(now + 1_000),
        endedAt: new Date(now + 1_000 + 300 * 60_000),
      });

      const updated = await goalService.getById(goal.id, userId);

      expect(updated.completed).toBe(true);
      expect(updated.progressPercent).toBe(100);
    });

    it('não conta sessões de outras matérias', async () => {
      const goal = await goalService.create(userId, {
        subjectId,
        title: 'Estudar 10h de TypeScript',
        targetHours: 10,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await new Promise((r) => setTimeout(r, 10));

      const otherSubject = await createSubject(userId, { name: 'React' });
      const now = Date.now();
      await createSession(userId, otherSubject.id, {
        durationMinutes: 120,
        startedAt: new Date(now + 1_000),
        endedAt: new Date(now + 1_000 + 120 * 60_000),
      });

      const updated = await goalService.getById(goal.id, userId);
      expect(updated.hoursStudied).toBe(0);
    });

    it('rejeita prazo no passado', async () => {
      await expect(
        goalService.create(userId, {
          subjectId,
          title: 'Meta atrasada',
          targetHours: 10,
          deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
        }),
      ).rejects.toThrow('Prazo deve ser futuro');
    });
  });
});