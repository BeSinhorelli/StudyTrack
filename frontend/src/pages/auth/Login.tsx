import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import styles from './Login.module.css';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError('');
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <h1>StudyTrack</h1>
          <p className="text-muted">Entre para continuar seus estudos</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <ErrorMessage message={error} />}

          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />

          <Input
            label="Senha"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button type="submit" loading={loading} size="lg">
            Entrar
          </Button>
        </form>

        <p className={styles.footer}>
          Não tem conta? <Link to="/register">Criar conta</Link>
        </p>

        <p className={styles.demoHint}>
          🧪 Modo demo: use <code>demo@studytrack.dev</code> / <code>demo1234</code>
        </p>
      </div>
    </div>
  );
}