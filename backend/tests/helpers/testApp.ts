import { createApp } from '../../src/app.js';
import { authService } from '../../src/services/auth.service.js';

export const app = createApp();

/**
 * Cria um usuário e retorna { token, userId } prontos pra usar nos testes.
 */
export async function createAuthedUser(overrides: {
  name?: string;
  email?: string;
  password?: string;
} = {}) {
  const { user, token } = await authService.register({
    name: overrides.name ?? 'Test User',
    email: overrides.email ?? `user-${Date.now()}-${Math.random()}@test.com`,
    password: overrides.password ?? 'senha1234',
  });

  return { user, token, userId: user.id };
}

/**
 * Retorna o header Authorization pronto.
 */
export function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}