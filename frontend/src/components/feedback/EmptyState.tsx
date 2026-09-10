import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

type Props = {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon = '📭', title, description, action }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}