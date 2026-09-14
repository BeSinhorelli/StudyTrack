import { describe, it, expect, beforeEach } from 'vitest';
import { dashboardService } from '../../src/services/dashboard.service.js';
import { createUser, createSubject, createSession, cleanDatabase } from '../helpers/factories.js';

describe('dashboardService.calculateStreak', () => {
  let userId: string;
  let subjectId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const { user } = await createUser();
    userId = user.id;
    const subject = await createSubject(userId);
    subjectId = subject.id;
  });

  it('retorna 0 quando não há sessões', async () => {
    const streak = await dashboardService.calculateStreak(userId);
    expect(streak).toBe(0);
  });

  it('retorna 1 quando estudou só hoje', async () => {
    const today = new Date();
    today.setHours(10, 0, 0, 0);
    const ended = new Date(today);
    ended.setHours(11, 0, 0, 0);

    await createSession(userId, subjectId, {
      startedAt: today,
      endedAt: ended,
      durationMinutes: 60,
    });

    const streak = await dashboardService.calculateStreak(userId);
    expect(streak).toBe(1);
  });

  it('conta 3 dias consecutivos terminando hoje', async () => {
    for (let i = 0; i < 3; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(10, 0, 0, 0);
      const ended = new Date(day);
      ended.setHours(11, 0, 0, 0);

      await createSession(userId, subjectId, {
        startedAt: day,
        endedAt: ended,
        durationMinutes: 60,
      });
    }

    const streak = await dashboardService.calculateStreak(userId);
    expect(streak).toBe(3);
  });

  it('mantém streak quando a última sessão foi ontem', async () => {
    // Sessão de ontem e anteontem (não estudou hoje)
    for (let i = 1; i <= 2; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(10, 0, 0, 0);
      const ended = new Date(day);
      ended.setHours(11, 0, 0, 0);

      await createSession(userId, subjectId, {
        startedAt: day,
        endedAt: ended,
        durationMinutes: 60,
      });
    }

    const streak = await dashboardService.calculateStreak(userId);
    expect(streak).toBe(2);
  });

  it('reseta quando ficou 2+ dias sem estudar', async () => {
    // Sessão de 3 dias atrás
    const day = new Date();
    day.setDate(day.getDate() - 3);
    day.setHours(10, 0, 0, 0);
    const ended = new Date(day);
    ended.setHours(11, 0, 0, 0);

    await createSession(userId, subjectId, {
      startedAt: day,
      endedAt: ended,
      durationMinutes: 60,
    });

    const streak = await dashboardService.calculateStreak(userId);
    expect(streak).toBe(0);
  });
});