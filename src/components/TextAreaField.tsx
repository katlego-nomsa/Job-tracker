import styles from "./Field.module.css";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  rows?: number;
};

export default function TextAreaField({ id, label, value, onChange, error, rows = 3 }: Props) {
  const messageId = `${id}-message`;
  return (
    <div className={`${styles.field} ${error ? styles.hasError : ""}`}>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
      />
      {error && (
        <p id={messageId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}