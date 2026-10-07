import { getPasswordChecks, getStrength } from "../utils/password";
import styles from "./PasswordStrength.module.css";

type Props = { password: string };

export default function PasswordStrength({ password }: Props) {
  const { level, label } = getStrength(password);
  const checks = getPasswordChecks(password);

  return (
    <div className={styles.wrap}>
      <div className={styles.bars} aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`${styles.bar} ${n <= level ? styles[`level${level}`] : ""}`}
          />
        ))}
      </div>
      {/* The word is announced to screen readers, so colour is not the only signal */}
      <p className={styles.label} aria-live="polite">
        {label ? `Password strength: ${label}` : "Choose a strong password"}
      </p>
      <ul className={styles.list}>
        {checks.map((check) => (
          <li key={check.label} className={check.passed ? styles.passed : ""}>
            <span aria-hidden="true">{check.passed ? "✓" : "○"}</span>{" "}
            {check.label}
            <span className={styles.sr}>{check.passed ? " (done)" : " (needed)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}