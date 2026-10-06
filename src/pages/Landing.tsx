import Button from "../components/Button";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import type { JobStatus } from "../types";
import styles from "./Landing.module.css";

const features = [
  {
    title: "Add and edit jobs",
    text: "Save the company, role, date applied and job duties, then update them as things change.",
  },
  {
    title: "Search, filter, sort",
    text: "Find a job by company or role, filter by status and sort by date. Share the link and get the same view.",
  },
  {
    title: "Prepare for interviews",
    text: "Keep the address, contact details and requirements of each company on its own page.",
  },
];

const statuses: JobStatus[] = ["Applied", "Interviewed", "Rejected"];

export default function Landing() {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <main className="container">
        <section className={styles.hero}>
          <h1>Every job application, in one place.</h1>
          <p className={styles.lead}>
            Job Tracker helps you keep count of the jobs you have applied for,
            so you can see at a glance what is pending, what led to an
            interview and what was turned down.
          </p>
          <div className={styles.actions}>
            {currentUser ? (
              <Button to="/home">Go to my jobs</Button>
            ) : (
              <>
                <Button to="/register">Get started free</Button>
                <Button to="/login" variant="secondary">
                  I already have an account
                </Button>
              </>
            )}
          </div>
        </section>

        <section aria-label="Features" className={styles.features}>
          {features.map((f) => (
            <article key={f.title} className={styles.card}>
              <h2>{f.title}</h2>
              <p>{f.text}</p>
            </article>
          ))}
        </section>

        <section className={styles.legend}>
          <strong>Track every status:</strong>
          {statuses.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </section>
      </main>
    </>
  );
}