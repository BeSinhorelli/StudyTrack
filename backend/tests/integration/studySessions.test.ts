import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, bearer, createAuthedUser } from '../helpers/testApp.js';
import { cleanDatabase, createSubject, createTopic } from '../helpers/factories.js';

describe('StudySessions endpoints', () => {
  let token: string;
  let userId: string;
  let subjectId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const authed = await createAuthedUser({ email: `sess-${Date.now()}@test.com` });
    token = authed.token;
    userId = authed.userId;
    const subject = await createSubject(userId);
    subjectId = subject.id;
  });

  describe('POST /api/study-sessions', () => {
    it('cria sessão e calcula duração', async () => {
      const now = new Date();
      const startedAt = new Date(now.getTime() - 90 * 60 * 1000); // 90min atrás

      const res = await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId,
          startedAt: startedAt.toISOString(),
          endedAt: now.toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.data.durationMinutes).toBe(90);
    });

    it('cria sessão com tópico', async () => {
      const topic = await createTopic(subjectId);
      const now = new Date();

      const res = await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId,
          topicId: topic.id,
          startedAt: new Date(now.getTime() - 3600_000).toISOString(),
          endedAt: now.toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.data.topicId).toBe(topic.id);
    });

    it('rejeita endedAt anterior a startedAt', async () => {
      const now = new Date();
      const res = await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId,
          startedAt: now.toISOString(),
          endedAt: new Date(now.getTime() - 3600_000).toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_DATE_RANGE');
    });

    it('rejeita sessão com mais de 12h', async () => {
      const now = new Date();
      const res = await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId,
          startedAt: new Date(now.getTime() - 13 * 3600_000).toISOString(),
          endedAt: now.toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('SESSION_TOO_LONG');
    });

    it('rejeita sessão no futuro', async () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const res = await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId,
          startedAt: future.toISOString(),
          endedAt: new Date(future.getTime() + 3600_000).toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('SESSION_IN_FUTURE');
    });

    it('rejeita tópico que não pertence à matéria', async () => {
      const otherSubject = await createSubject(userId, { name: 'Outra Matéria' });
      const otherTopic = await createTopic(otherSubject.id);
      const now = new Date();

      const res = await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId,
          topicId: otherTopic.id,
          startedAt: new Date(now.getTime() - 3600_000).toISOString(),
          endedAt: now.toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('TOPIC_SUBJECT_MISMATCH');
    });
  });

  describe('GET /api/study-sessions', () => {
    it('lista sessões do usuário', async () => {
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/study-sessions')
          .set(bearer(token))
          .send({
            subjectId,
            startedAt: new Date(now.getTime() - (i + 1) * 3600_000).toISOString(),
            endedAt: new Date(now.getTime() - i * 3600_000).toISOString(),
          });
      }

      const res = await request(app).get('/api/study-sessions').set(bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
    });

    it('filtra por subjectId', async () => {
      const otherSubject = await createSubject(userId, { name: 'Filtro' });
      const now = new Date();

      await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId,
          startedAt: new Date(now.getTime() - 3600_000).toISOString(),
          endedAt: now.toISOString(),
        });
      await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId: otherSubject.id,
          startedAt: new Date(now.getTime() - 3600_000).toISOString(),
          endedAt: now.toISOString(),
        });

      const res = await request(app)
        .get(`/api/study-sessions?subjectId=${subjectId}`)
        .set(bearer(token));

      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('PUT /api/study-sessions/:id', () => {
    it('atualiza sessão e recalcula duração', async () => {
      const now = new Date();
      const created = await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId,
          startedAt: new Date(now.getTime() - 3600_000).toISOString(),
          endedAt: now.toISOString(),
        });

      const res = await request(app)
        .put(`/api/study-sessions/${created.body.data.id}`)
        .set(bearer(token))
        .send({
          startedAt: new Date(now.getTime() - 120 * 60 * 1000).toISOString(),
          endedAt: now.toISOString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.data.durationMinutes).toBe(120);
    });
  });

  describe('DELETE /api/study-sessions/:id', () => {
    it('exclui sessão', async () => {
      const now = new Date();
      const created = await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId,
          startedAt: new Date(now.getTime() - 3600_000).toISOString(),
          endedAt: now.toISOString(),
        });

      const res = await request(app)
        .delete(`/api/study-sessions/${created.body.data.id}`)
        .set(bearer(token));

      expect(res.status).toBe(204);
    });
  });
});