import axios from 'axios';

const TOKEN_KEY = 'studytrack.token';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    if (import.meta.env.DEV) {
      console.error(
        `[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.status,
        error.response?.data ?? error.message,
      );
    }
    return Promise.reject(error);
  },
);

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/**
 * Extrai mensagem de erro legível da resposta da API.
 * Erros de validação (Zod) vêm com `errors[]` — montamos uma msg por campo.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          code?: string;
          errors?: { field: string; message: string }[];
        }
      | undefined;

    if (data?.errors && data.errors.length > 0) {
      const labels: Record<string, string> = {
        name: 'Nome',
        email: 'Email',
        password: 'Senha',
      };
      return data.errors
        .map((e) => `${labels[e.field] ?? e.field}: ${e.message}`)
        .join(' • ');
    }

    if (data?.message) {
      return data.message;
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Tempo esgotado ao conectar com o servidor.';
    }
    return error.message || 'Erro ao comunicar com o servidor';
  }
  if (error instanceof Error) return error.message;
  return 'Erro inesperado';
}