import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import styles from './Header.module.css';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const initials = user?.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.user}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <strong>{user?.name}</strong>
          <span className="text-muted">{user?.email}</span>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Sair
      </Button>
    </header>
  );
}