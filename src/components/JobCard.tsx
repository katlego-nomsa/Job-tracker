import { Link } from "react-router-dom";
import { formatDate } from "../utils/date";
import type { Job } from "../types";
import StatusBadge from "./StatusBadge";
import styles from "./JobCard.module.css";

type Props = {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
};

export default function JobCard({ job, onEdit, onDelete }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div>
          <h2 className={styles.company}>
            <Link to={`/jobs/${job.id}`}>{job.company}</Link>
          </h2>
          <p className={styles.role}>{job.role}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <p className={styles.date}>Applied {formatDate(job.dateApplied)}</p>
      <p className={styles.duties}>{job.duties}</p>

      <div className={styles.actions}>
        <button type="button" onClick={() => onEdit(job)}>
          Edit
          <span className={styles.sr}> {job.company}</span>
        </button>
        <button type="button" onClick={() => onDelete(job)}>
          Delete
          <span className={styles.sr}> {job.company}</span>
        </button>
      </div>
    </article>
  );
}