import { forwardRef, type TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, id, className, ...rest }, ref) => {
    const textareaId = id ?? rest.name;
    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`${styles.textarea} ${error ? styles.textareaError : ''} ${className ?? ''}`}
          {...rest}
        />
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';