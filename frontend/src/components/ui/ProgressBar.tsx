import styles from './ProgressBar.module.css';

type Props = {
  value: number; // 0 a 100
  variant?: 'primary' | 'success' | 'warning';
};

export function ProgressBar({ value, variant = 'primary' }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={styles.track}>
      <div
        className={`${styles.fill} ${styles[variant]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}