import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, bearer, createAuthedUser } from '../helpers/testApp.js';
import { cleanDatabase, createSubject } from '../helpers/factories.js';

describe('Goals endpoints', () => {
  let token: string;
  let userId: string;
  let subjectId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const authed = await createAuthedUser({ email: `goal-${Date.now()}@test.com` });
    token = authed.token;
    userId = authed.userId;
    const subject = await createSubject(userId);
    subjectId = subject.id;
  });

  describe('POST /api/goals', () => {
    it('cria meta e retorna com progresso 0%', async () => {
      const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const res = await request(app)
        .post('/api/goals')
        .set(bearer(token))
        .send({
          title: 'Estudar 10h',
          targetHours: 10,
          deadline: deadline.toISOString(),
          subjectId,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        title: 'Estudar 10h',
        targetHours: 10,
        hoursStudied: 0,
        progressPercent: 0,
        completed: false,
      });
    });

    it('cria meta geral (sem matéria)', async () => {
      const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const res = await request(app)
        .post('/api/goals')
        .set(bearer(token))
        .send({
          title: 'Estudar muito',
          targetHours: 50,
          deadline: deadline.toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.data.subjectId).toBe(null);
    });

    it('rejeita prazo no passado', async () => {
      const deadline = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const res = await request(app)
        .post('/api/goals')
        .set(bearer(token))
        .send({
          title: 'Meta atrasada',
          targetHours: 10,
          deadline: deadline.toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_DEADLINE');
    });

    it('rejeita targetHours negativo', async () => {
      const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const res = await request(app)
        .post('/api/goals')
        .set(bearer(token))
        .send({
          title: 'Meta inválida',
          targetHours: -5,
          deadline: deadline.toISOString(),
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/goals', () => {
    it('lista metas com progresso calculado', async () => {
      const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // 1. Cria a meta
      const goalRes = await request(app)
        .post('/api/goals')
        .set(bearer(token))
        .send({
          title: 'Meta 1',
          targetHours: 4,
          deadline: deadline.toISOString(),
          subjectId,
        });

      expect(goalRes.status).toBe(201);
      const goalCreatedAt = new Date(goalRes.body.data.createdAt);

      // 2. Aguarda 100ms pra garantir que now > goal.createdAt
      await new Promise((r) => setTimeout(r, 100));

      // 3. Cria 2 sessões de 1h no passado (depois do createdAt da meta)
      //    Base: 5 minutos atrás, para caber no passado
      const base = Date.now() - 5 * 60 * 1000;

      // Sessão 1: 2h atrás → 1h atrás
      const s1Start = new Date(base - 60 * 60 * 1000);
      const s1End = new Date(base);
      const r1 = await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId,
          startedAt: s1Start.toISOString(),
          endedAt: s1End.toISOString(),
        });
      expect(r1.status).toBe(201);
      expect(r1.body.data.durationMinutes).toBe(60);

      // Sessão 2: 1h atrás → agora
      const s2Start = new Date(base);
      const s2End = new Date(base + 60 * 60 * 1000);
      const r2 = await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId,
          startedAt: s2Start.toISOString(),
          endedAt: s2End.toISOString(),
        });
      expect(r2.status).toBe(201);
      expect(r2.body.data.durationMinutes).toBe(60);

      // 4. Busca a meta com progresso
      const res = await request(app).get('/api/goals').set(bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].hoursStudied).toBe(2);
      expect(res.body.data[0].progressPercent).toBe(50);
    });
  });

  describe('PUT /api/goals/:id', () => {
    it('atualiza título', async () => {
      const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const created = await request(app)
        .post('/api/goals')
        .set(bearer(token))
        .send({ title: 'Meta Antiga', targetHours: 10, deadline: deadline.toISOString() });

      const res = await request(app)
        .put(`/api/goals/${created.body.data.id}`)
        .set(bearer(token))
        .send({ title: 'Meta Nova' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Meta Nova');
    });
  });

  describe('DELETE /api/goals/:id', () => {
    it('exclui meta', async () => {
      const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const created = await request(app)
        .post('/api/goals')
        .set(bearer(token))
        .send({ title: 'Excluir', targetHours: 10, deadline: deadline.toISOString() });

      const res = await request(app)
        .delete(`/api/goals/${created.body.data.id}`)
        .set(bearer(token));

      expect(res.status).toBe(204);
    });
  });
});