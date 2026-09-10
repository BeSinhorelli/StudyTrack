import styles from './ErrorMessage.module.css';

export function ErrorMessage({ message }: { message: string }) {
  return <div className={styles.box}>⚠️ {message}</div>;
}