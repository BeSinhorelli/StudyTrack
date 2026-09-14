import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, bearer, createAuthedUser } from '../helpers/testApp.js';
import { cleanDatabase } from '../helpers/factories.js';

describe('Auth endpoints', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('cria usuário e retorna token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bernardo',
          email: 'bernardo@test.com',
          password: 'senha1234',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({
        name: 'Bernardo',
        email: 'bernardo@test.com',
      });
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      expect(res.body.data.token).toBeTruthy();
    });

    it('rejeita email duplicado com 409', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'User A', email: 'dup@test.com', password: 'senha1234' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User B', email: 'dup@test.com', password: 'senha1234' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('EMAIL_IN_USE');
    });

    it('rejeita senha fraca (sem número) com 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User X', email: 'x@test.com', password: 'senhasemnumero' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('rejeita senha curta (menos de 8 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User X', email: 'x2@test.com', password: 'ab1' });

      expect(res.status).toBe(400);
    });

    it('rejeita email inválido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User X', email: 'nao-eh-email', password: 'senha1234' });

      expect(res.status).toBe(400);
    });

    it('rejeita nome curto (menos de 2 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'X', email: 'x3@test.com', password: 'senha1234' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('faz login com credenciais válidas', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Login User', email: 'login@test.com', password: 'senha1234' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'senha1234' });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeTruthy();
      expect(res.body.data.user.email).toBe('login@test.com');
    });

    it('rejeita senha errada com 401', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'User X', email: 'l2@test.com', password: 'senha1234' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'l2@test.com', password: 'senhaerrada' });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('rejeita email não cadastrado com 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'naoexiste@test.com', password: 'senha1234' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('retorna usuário autenticado', async () => {
      const { user, token } = await createAuthedUser({ email: 'me@test.com' });

      const res = await request(app).get('/api/auth/me').set(bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(user.id);
      expect(res.body.data.email).toBe('me@test.com');
    });

    it('retorna 401 sem token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('retorna 401 com token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set(bearer('token.invalido.aqui'));
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/auth/me', () => {
    it('atualiza nome', async () => {
      const { token } = await createAuthedUser({ email: 'patch@test.com' });

      const res = await request(app)
        .patch('/api/auth/me')
        .set(bearer(token))
        .send({ name: 'Nome Novo' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Nome Novo');
    });

    it('rejeita email já em uso com 409', async () => {
      await createAuthedUser({ email: 'existente@test.com' });
      const { token } = await createAuthedUser({ email: 'outro@test.com' });

      const res = await request(app)
        .patch('/api/auth/me')
        .set(bearer(token))
        .send({ email: 'existente@test.com' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('EMAIL_IN_USE');
    });
  });

  describe('PATCH /api/auth/me/password', () => {
    it('troca senha com sucesso', async () => {
      const { token } = await createAuthedUser({
        email: 'pw@test.com',
        password: 'senha1234',
      });

      const res = await request(app)
        .patch('/api/auth/me/password')
        .set(bearer(token))
        .send({ currentPassword: 'senha1234', newPassword: 'novasenha1' });

      expect(res.status).toBe(204);

      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: 'pw@test.com', password: 'novasenha1' });
      expect(login.status).toBe(200);
    });

    it('rejeita senha atual errada', async () => {
      const { token } = await createAuthedUser({ email: 'pw2@test.com' });

      const res = await request(app)
        .patch('/api/auth/me/password')
        .set(bearer(token))
        .send({ currentPassword: 'errada', newPassword: 'novasenha1' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_CURRENT_PASSWORD');
    });

    it('rejeita nova senha igual à atual', async () => {
      const { token } = await createAuthedUser({
        email: 'pw3@test.com',
        password: 'senha1234',
      });

      const res = await request(app)
        .patch('/api/auth/me/password')
        .set(bearer(token))
        .send({ currentPassword: 'senha1234', newPassword: 'senha1234' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('PASSWORD_UNCHANGED');
    });
  });
});