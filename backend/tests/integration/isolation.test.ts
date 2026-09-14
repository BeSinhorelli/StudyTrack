import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, bearer, createAuthedUser } from '../helpers/testApp.js';
import { cleanDatabase } from '../helpers/factories.js';

describe('Isolamento entre usuários', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('usuário A não vê matéria do usuário B na listagem', async () => {
    const { token: tokenA } = await createAuthedUser({ email: 'a@test.com' });
    const { token: tokenB } = await createAuthedUser({ email: 'b@test.com' });

    // B cria uma matéria
    await request(app)
      .post('/api/subjects')
      .set(bearer(tokenB))
      .send({ name: 'Matéria do B' });

    // A lista as matérias dele → deve estar vazia
    const res = await request(app).get('/api/subjects').set(bearer(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('usuário A não acessa matéria do B por ID (retorna 404)', async () => {
    const { token: tokenA } = await createAuthedUser({ email: 'a2@test.com' });
    const { token: tokenB } = await createAuthedUser({ email: 'b2@test.com' });

    // B cria uma matéria
    const created = await request(app)
      .post('/api/subjects')
      .set(bearer(tokenB))
      .send({ name: 'Matéria do B' });
    const subjectId = created.body.data.id;

    // A tenta acessar
    const res = await request(app)
      .get(`/api/subjects/${subjectId}`)
      .set(bearer(tokenA));

    expect(res.status).toBe(404);
  });

  it('usuário A não consegue editar matéria do B', async () => {
    const { token: tokenA } = await createAuthedUser({ email: 'a3@test.com' });
    const { token: tokenB } = await createAuthedUser({ email: 'b3@test.com' });

    const created = await request(app)
      .post('/api/subjects')
      .set(bearer(tokenB))
      .send({ name: 'Matéria do B' });
    const subjectId = created.body.data.id;

    const res = await request(app)
      .put(`/api/subjects/${subjectId}`)
      .set(bearer(tokenA))
      .send({ name: 'Hackeada' });

    expect(res.status).toBe(404);

    // Confirma que o nome continua o mesmo
    const original = await request(app)
      .get(`/api/subjects/${subjectId}`)
      .set(bearer(tokenB));
    expect(original.body.data.name).toBe('Matéria do B');
  });

  it('usuário A não consegue excluir matéria do B', async () => {
    const { token: tokenA } = await createAuthedUser({ email: 'a4@test.com' });
    const { token: tokenB } = await createAuthedUser({ email: 'b4@test.com' });

    const created = await request(app)
      .post('/api/subjects')
      .set(bearer(tokenB))
      .send({ name: 'Matéria do B' });
    const subjectId = created.body.data.id;

    const res = await request(app)
      .delete(`/api/subjects/${subjectId}`)
      .set(bearer(tokenA));

    expect(res.status).toBe(404);

    // Confirma que ainda existe pro B
    const stillThere = await request(app)
      .get(`/api/subjects/${subjectId}`)
      .set(bearer(tokenB));
    expect(stillThere.status).toBe(200);
  });

  it('usuário A não consegue criar sessão na matéria do B', async () => {
    const { token: tokenA } = await createAuthedUser({ email: 'a5@test.com' });
    const { token: tokenB } = await createAuthedUser({ email: 'b5@test.com' });

    const created = await request(app)
      .post('/api/subjects')
      .set(bearer(tokenB))
      .send({ name: 'Matéria do B' });
    const subjectId = created.body.data.id;

    const now = new Date();
    const res = await request(app)
      .post('/api/study-sessions')
      .set(bearer(tokenA))
      .send({
        subjectId,
        startedAt: new Date(now.getTime() - 3600_000).toISOString(),
        endedAt: now.toISOString(),
      });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('SUBJECT_NOT_FOUND');
  });
});