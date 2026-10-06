import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Props = {
  children: ReactNode;
    variant?: "primary" | "secondary" | "danger";
  to?: string; // when set, renders a router Link instead of a <button>
  isLoading?: boolean; // shows a spinner and disables the button
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  variant = "primary",
  to,
  isLoading = false,
  className = "",
  disabled,
  ...rest
}: Props) {
  const classes = `${styles.btn} ${styles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}