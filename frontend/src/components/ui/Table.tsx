import type { ReactNode } from 'react';
import styles from './Table.module.css';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className={styles.thead}>{children}</thead>;
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr className={onClick ? styles.clickable : undefined} onClick={onClick}>
      {children}
    </tr>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return <th className={styles.th}>{children}</th>;
}

export function Td({ children }: { children: ReactNode }) {
  return <td className={styles.td}>{children}</td>;
}