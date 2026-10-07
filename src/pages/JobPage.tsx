import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { deleteJob, getJob } from "../api";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import JobForm from "../components/JobForm";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Job } from "../types";
import { formatDate } from "../utils/date";
import NotFound from "./NotFound";
import styles from "./JobPage.module.css";

type LoadState = "loading" | "ready" | "notFound" | "error";

// Optional details the person left empty are shown as "Not added".
function orNotAdded(value?: string) {
  return value && value.trim() ? value : "Not added";
}

export default function JobPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Load the job whose id is in the URL ----
  useEffect(() => {
    if (!currentUser || !id) return;
    let cancelled = false;
    setState("loading");

    getJob(id)
      .then((found) => {
        if (cancelled) return;
        // Someone else's job looks exactly like a job that does not exist.
        if (found.userId !== currentUser.id) {
          setState("notFound");
        } else {
          setJob(found);
          setState("ready");
        }
      })
      .catch((error) => {
        if (cancelled) return;
        const missing = error instanceof Error && error.message.includes("404");
        setState(missing ? "notFound" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [id, currentUser]);

  const closeForm = useCallback(() => setIsFormOpen(false), []);
  const closeConfirm = useCallback(() => setIsConfirmOpen(false), []);

  const handleSaved = (saved: Job) => {
    setJob(saved);
    setIsFormOpen(false);
  };

  const confirmDelete = async () => {
    if (!job) return;
    setIsDeleting(true);
    try {
      await deleteJob(job.id);
      showToast("success", "Job deleted");
      navigate("/home");
    } catch {
      showToast("error", "Could not delete the job.");
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  if (state === "notFound") return <NotFound />;

  if (state === "loading") {
    return (
      <>
        <Navbar />
        <main className="container">
          <Loader />
        </main>
      </>
    );
  }

  if (state === "error" || !job) {
    return (
      <>
        <Navbar />
        <main className="container">
          <EmptyState
            title="Could not load this job"
            message="Check that the database is running, then try again."
          >
            <Button to="/home" variant="secondary">
              Back to my jobs
            </Button>
          </EmptyState>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <NavLink to="/home" className={styles.back}>
          ← Back to my jobs
        </NavLink>

        <article className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1>{job.company}</h1>
              <p className={styles.role}>{job.role}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>

          <dl className={styles.facts}>
            <div>
              <dt>Date applied</dt>
              <dd>{formatDate(job.dateApplied)}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{orNotAdded(job.address)}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{orNotAdded(job.contact)}</dd>
            </div>
          </dl>

          <div className={styles.columns}>
            <section>
              <h2>Job duties</h2>
              <p className={styles.text}>{job.duties}</p>
            </section>
            <section>
              <h2>Requirements</h2>
              <p className={styles.text}>{orNotAdded(job.requirements)}</p>
            </section>
          </div>

          <section>
            <h2>Interview notes</h2>
            <p className={styles.text}>{orNotAdded(job.notes)}</p>
          </section>

          <div className={styles.actions}>
            <Button onClick={() => setIsFormOpen(true)}>Edit job</Button>
            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
              Delete job
            </Button>
          </div>
        </article>
      </main>

      <Modal title="Edit job" isOpen={isFormOpen} onClose={closeForm}>
        <JobForm job={job} onSaved={handleSaved} onCancel={closeForm} />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete this job?"
        message={`${job.company} will be removed. This cannot be undone.`}
        confirmLabel="Delete"
        isBusy={isDeleting}
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
      />
    </>
  );
}