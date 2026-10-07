import type { JobStatus } from "../types";
import styles from "./StatusBadge.module.css";

type Props = { status: JobStatus };

const classFor: Record<JobStatus, string> = {
  Applied: styles.applied,
  Interviewed: styles.interviewed,
  Rejected: styles.rejected,
};

// The text label means status never relies on colour alone.
export default function StatusBadge({ status }: Props) {
  return <span className={`${styles.badge} ${classFor[status]}`}>{status}</span>;
}