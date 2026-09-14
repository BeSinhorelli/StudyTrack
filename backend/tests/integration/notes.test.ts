import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, bearer, createAuthedUser } from '../helpers/testApp.js';
import { cleanDatabase, createSubject, createTopic } from '../helpers/factories.js';

describe('Notes endpoints', () => {
  let token: string;
  let userId: string;
  let subjectId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const authed = await createAuthedUser({ email: `note-${Date.now()}@test.com` });
    token = authed.token;
    userId = authed.userId;
    const subject = await createSubject(userId);
    subjectId = subject.id;
  });

  describe('POST /api/notes', () => {
    it('cria nota solta (sem matéria)', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set(bearer(token))
        .send({ title: 'Nota livre', content: 'Conteúdo da nota' });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        title: 'Nota livre',
        content: 'Conteúdo da nota',
        subjectId: null,
        topicId: null,
      });
    });

    it('cria nota com matéria e tópico', async () => {
      const topic = await createTopic(subjectId);
      const res = await request(app)
        .post('/api/notes')
        .set(bearer(token))
        .send({
          title: 'Nota vinculada',
          content: 'Conteúdo',
          subjectId,
          topicId: topic.id,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.topicId).toBe(topic.id);
    });

    it('rejeita topicId sem subjectId', async () => {
      const topic = await createTopic(subjectId);
      const res = await request(app)
        .post('/api/notes')
        .set(bearer(token))
        .send({
          title: 'Nota inválida',
          content: 'Conteúdo',
          topicId: topic.id,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('TOPIC_REQUIRES_SUBJECT');
    });

    it('rejeita título vazio', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set(bearer(token))
        .send({ title: '', content: 'Conteúdo' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/notes', () => {
    it('lista notas do usuário', async () => {
      await request(app)
        .post('/api/notes')
        .set(bearer(token))
        .send({ title: 'Nota A', content: 'X' });
      await request(app)
        .post('/api/notes')
        .set(bearer(token))
        .send({ title: 'Nota B', content: 'Y' });

      const res = await request(app).get('/api/notes').set(bearer(token));
      expect(res.body.data).toHaveLength(2);
    });

    it('filtra por subjectId', async () => {
      const otherSubject = await createSubject(userId, { name: 'Outra' });
      await request(app)
        .post('/api/notes')
        .set(bearer(token))
        .send({ title: 'Nota S1', content: 'X', subjectId });
      await request(app)
        .post('/api/notes')
        .set(bearer(token))
        .send({ title: 'Nota S2', content: 'Y', subjectId: otherSubject.id });

      const res = await request(app)
        .get(`/api/notes?subjectId=${subjectId}`)
        .set(bearer(token));

      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('atualiza conteúdo', async () => {
      const created = await request(app)
        .post('/api/notes')
        .set(bearer(token))
        .send({ title: 'Nota', content: 'Antigo' });

      const res = await request(app)
        .put(`/api/notes/${created.body.data.id}`)
        .set(bearer(token))
        .send({ content: 'Novo conteúdo' });

      expect(res.status).toBe(200);
      expect(res.body.data.content).toBe('Novo conteúdo');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('exclui nota', async () => {
      const created = await request(app)
        .post('/api/notes')
        .set(bearer(token))
        .send({ title: 'Excluir', content: 'X' });

      const res = await request(app)
        .delete(`/api/notes/${created.body.data.id}`)
        .set(bearer(token));

      expect(res.status).toBe(204);
    });
  });
});