import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, bearer, createAuthedUser } from '../helpers/testApp.js';
import { cleanDatabase, createSubject } from '../helpers/factories.js';

describe('Tasks endpoints', () => {
  let token: string;
  let userId: string;
  let subjectId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const authed = await createAuthedUser({ email: `task-${Date.now()}@test.com` });
    token = authed.token;
    userId = authed.userId;
    const subject = await createSubject(userId);
    subjectId = subject.id;
  });

  describe('POST /api/tasks', () => {
    it('cria tarefa mínima (só título)', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'Estudar TypeScript' });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        title: 'Estudar TypeScript',
        status: 'TODO',
        priority: 'MEDIUM',
        subjectId: null,
      });
    });

    it('cria tarefa completa', async () => {
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const res = await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({
          title: 'Tarefa completa',
          description: 'Com descrição',
          subjectId,
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          dueDate: dueDate.toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        title: 'Tarefa completa',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        subjectId,
      });
    });

    it('rejeita título curto (1 char)', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'X' });

      expect(res.status).toBe(400);
    });

    it('rejeita data de vencimento no passado', async () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const res = await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'Tarefa atrasada', dueDate: past.toISOString() });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_DUE_DATE');
    });

    it('rejeita matéria de outro usuário', async () => {
      const other = await createAuthedUser({ email: `other-${Date.now()}@test.com` });
      const otherSubject = await createSubject(other.userId, { name: 'Matéria do B' });

      const res = await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'Tarefa', subjectId: otherSubject.id });

      expect(res.status).toBe(404);
    });

    it('rejeita sem token (401)', async () => {
      const res = await request(app).post('/api/tasks').send({ title: 'Tarefa' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('lista tarefas do usuário', async () => {
      await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'Tarefa 1' });
      await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'Tarefa 2' });

      const res = await request(app).get('/api/tasks').set(bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('filtra por status', async () => {
      await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'Tarefa A', status: 'TODO' });
      await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'Tarefa B', status: 'COMPLETED' });

      const res = await request(app)
        .get('/api/tasks?status=COMPLETED')
        .set(bearer(token));

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Tarefa B');
    });

    it('filtra por overdue=true', async () => {
      // Cria uma tarefa com dueDate no passado via prisma direto (bypass da validação)
      // ou usa uma tarefa que já existe com data futura
      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'Tarefa futura', dueDate: future.toISOString() });

      const res = await request(app)
        .get('/api/tasks?overdue=true')
        .set(bearer(token));

      // Sem tarefas atrasadas (a que criamos tem data futura)
      expect(res.body.data).toHaveLength(0);
    });

    it('não retorna tarefas de outros usuários', async () => {
      const other = await createAuthedUser({ email: `other2-${Date.now()}@test.com` });
      await request(app)
        .post('/api/tasks')
        .set(bearer(other.token))
        .send({ title: 'Tarefa do B' });

      const res = await request(app).get('/api/tasks').set(bearer(token));
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('retorna tarefa por id', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'Buscar' });

      const res = await request(app)
        .get(`/api/tasks/${created.body.data.id}`)
        .set(bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(created.body.data.id);
    });

    it('retorna 404 para id inexistente', async () => {
      const res = await request(app).get('/api/tasks/id-inexistente').set(bearer(token));
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('atualiza status', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'Atualizar' });

      const res = await request(app)
        .put(`/api/tasks/${created.body.data.id}`)
        .set(bearer(token))
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('exclui tarefa', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set(bearer(token))
        .send({ title: 'Excluir' });

      const res = await request(app)
        .delete(`/api/tasks/${created.body.data.id}`)
        .set(bearer(token));

      expect(res.status).toBe(204);

      const check = await request(app)
        .get(`/api/tasks/${created.body.data.id}`)
        .set(bearer(token));
      expect(check.status).toBe(404);
    });
  });
});