import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/subjects', label: 'Matérias', icon: '📚' },
  { to: '/topics', label: 'Tópicos', icon: '🏷️' },
  { to: '/tasks', label: 'Tarefas', icon: '✅' },
  { to: '/study-sessions', label: 'Estudos', icon: '⏱️' },
  { to: '/goals', label: 'Metas', icon: '🎯' },
  { to: '/notes', label: 'Notas', icon: '📝' },
  { to: '/study-plans', label: 'Planos', icon: '🗓️' },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo}>📖</span>
        <span className={styles.brandName}>StudyTrack</span>
      </div>

      <nav className={styles.nav}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}