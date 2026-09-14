import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, bearer, createAuthedUser } from '../helpers/testApp.js';
import { cleanDatabase } from '../helpers/factories.js';

describe('StudyPlans endpoints', () => {
  let token: string;

  beforeEach(async () => {
    await cleanDatabase();
    const authed = await createAuthedUser({ email: `plan-${Date.now()}@test.com` });
    token = authed.token;
  });

  describe('POST /api/study-plans', () => {
    it('cria plano com período válido', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const res = await request(app)
        .post('/api/study-plans')
        .set(bearer(token))
        .send({
          title: 'Aprender TypeScript',
          description: 'Plano de 30 dias',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        title: 'Aprender TypeScript',
      });
    });

    it('rejeita endDate anterior a startDate', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);

      const res = await request(app)
        .post('/api/study-plans')
        .set(bearer(token))
        .send({
          title: 'Plano inválido',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_DATE_RANGE');
    });
  });

  describe('GET /api/study-plans', () => {
    it('lista planos do usuário', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await request(app)
        .post('/api/study-plans')
        .set(bearer(token))
        .send({
          title: 'Plano 1',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      const res = await request(app).get('/api/study-plans').set(bearer(token));
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('PUT /api/study-plans/:id', () => {
    it('atualiza título', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const created = await request(app)
        .post('/api/study-plans')
        .set(bearer(token))
        .send({
          title: 'Antigo',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      const res = await request(app)
        .put(`/api/study-plans/${created.body.data.id}`)
        .set(bearer(token))
        .send({ title: 'Novo' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Novo');
    });
  });

  describe('DELETE /api/study-plans/:id', () => {
    it('exclui plano', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const created = await request(app)
        .post('/api/study-plans')
        .set(bearer(token))
        .send({
          title: 'Excluir',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      const res = await request(app)
        .delete(`/api/study-plans/${created.body.data.id}`)
        .set(bearer(token));

      expect(res.status).toBe(204);
    });
  });
});