import styles from './Loading.module.css';

export function Loading({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <span className="text-muted">{message}</span>
    </div>
  );
}