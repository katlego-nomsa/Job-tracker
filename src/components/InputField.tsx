import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import styles from "./InputField.module.css";

type Props = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
  canReveal?: boolean; // adds the eye button on password fields
};

export default function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  hint,
  autoComplete,
  canReveal = false,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // Stop the timer if the field disappears.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Show the password, then hide it again after one second.
  const reveal = () => {
    window.clearTimeout(timer.current);
    setRevealed(true);
    timer.current = window.setTimeout(() => setRevealed(false), 1000);
  };

  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || hint);
  const inputType = canReveal && revealed ? "text" : type;

  return (
    <div className={`${styles.field} ${error ? styles.hasError : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.control}>
        <input
          id={id}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          className={canReveal ? styles.withButton : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
        />
        {canReveal && (
          <button
            type="button"
            className={styles.eye}
            onClick={reveal}
            aria-label="Show password for one second"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>
      {error ? (
        <p id={messageId} className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}