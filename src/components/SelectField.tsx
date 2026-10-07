import styles from "./Field.module.css";

type Props = {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  error?: string;
};

export default function SelectField({ id, label, value, options, onChange, error }: Props) {
  const messageId = `${id}-message`;
  return (
    <div className={`${styles.field} ${error ? styles.hasError : ""}`}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p id={messageId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}