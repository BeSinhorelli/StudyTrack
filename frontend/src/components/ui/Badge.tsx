import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

export function Badge({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}