import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, className, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${error ? styles.inputError : ''} ${className ?? ''}`}
          {...rest}
        />
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';