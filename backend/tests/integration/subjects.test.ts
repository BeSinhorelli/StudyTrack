import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, bearer, createAuthedUser } from '../helpers/testApp.js';
import { cleanDatabase } from '../helpers/factories.js';

describe('Subjects endpoints', () => {
  let token: string;

  beforeEach(async () => {
    await cleanDatabase();
    const authed = await createAuthedUser({ email: `subj-${Date.now()}@test.com` });
    token = authed.token;
  });

  describe('POST /api/subjects', () => {
    it('cria matéria com cor padrão', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'TypeScript' });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        name: 'TypeScript',
        color: '#6366f1',
      });
    });

    it('cria matéria com cor customizada', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'React', color: '#61dafb' });

      expect(res.status).toBe(201);
      expect(res.body.data.color).toBe('#61dafb');
    });

    it('rejeita cor inválida (não é HEX)', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'Matéria X', color: 'vermelho' });

      expect(res.status).toBe(400);
    });

    it('rejeita nome duplicado no mesmo usuário com 409', async () => {
      await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'TypeScript' });

      const res = await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'TypeScript' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('SUBJECT_NAME_IN_USE');
    });

    it('permite mesmo nome em usuários diferentes', async () => {
      const other = await createAuthedUser({ email: `other-${Date.now()}@test.com` });

      await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'TypeScript' });

      const res = await request(app)
        .post('/api/subjects')
        .set(bearer(other.token))
        .send({ name: 'TypeScript' });

      expect(res.status).toBe(201);
    });

    it('rejeita sem token (401)', async () => {
      const res = await request(app).post('/api/subjects').send({ name: 'Matéria' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/subjects', () => {
    it('lista matérias do usuário', async () => {
      await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'Matéria A' });
      await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'Matéria B' });

      const res = await request(app).get('/api/subjects').set(bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('retorna lista vazia quando não há matérias', async () => {
      const res = await request(app).get('/api/subjects').set(bearer(token));
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/subjects/:id', () => {
    it('retorna matéria por id', async () => {
      const created = await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'Matéria X' });

      const res = await request(app)
        .get(`/api/subjects/${created.body.data.id}`)
        .set(bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(created.body.data.id);
    });

    it('retorna 404 para id inexistente', async () => {
      const res = await request(app)
        .get('/api/subjects/id-que-nao-existe')
        .set(bearer(token));

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/subjects/:id', () => {
    it('atualiza nome', async () => {
      const created = await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'Nome Antigo' });

      const res = await request(app)
        .put(`/api/subjects/${created.body.data.id}`)
        .set(bearer(token))
        .send({ name: 'Nome Novo' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Nome Novo');
    });

    it('rejeita nome duplicado com 409', async () => {
      await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'Matéria A' });

      const b = await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'Matéria B' });

      const res = await request(app)
        .put(`/api/subjects/${b.body.data.id}`)
        .set(bearer(token))
        .send({ name: 'Matéria A' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('SUBJECT_NAME_IN_USE');
    });
  });

  describe('DELETE /api/subjects/:id', () => {
    it('exclui matéria sem sessões', async () => {
      const created = await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'Para Excluir' });

      const res = await request(app)
        .delete(`/api/subjects/${created.body.data.id}`)
        .set(bearer(token));

      expect(res.status).toBe(204);

      const check = await request(app)
        .get(`/api/subjects/${created.body.data.id}`)
        .set(bearer(token));
      expect(check.status).toBe(404);
    });

    it('rejeita exclusão de matéria com sessões (409)', async () => {
      const subject = await request(app)
        .post('/api/subjects')
        .set(bearer(token))
        .send({ name: 'Com Sessão' });

      const now = new Date();
      await request(app)
        .post('/api/study-sessions')
        .set(bearer(token))
        .send({
          subjectId: subject.body.data.id,
          startedAt: new Date(now.getTime() - 3600_000).toISOString(),
          endedAt: now.toISOString(),
        });

      const res = await request(app)
        .delete(`/api/subjects/${subject.body.data.id}`)
        .set(bearer(token));

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('SUBJECT_HAS_SESSIONS');
    });
  });
});