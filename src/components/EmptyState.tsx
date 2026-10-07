import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

type Props = {
  title: string;
  message: string;
  children?: ReactNode; // an optional button
};

export default function EmptyState({ title, message, children }: Props) {
  return (
    <div className={styles.box}>
      <h2>{title}</h2>
      <p>{message}</p>
      {children}
    </div>
  );
}