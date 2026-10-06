import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { deleteJob, getJobsForUser } from "../api";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import FilterChip from "../components/FilterChip";
import JobCard from "../components/JobCard";
import JobForm from "../components/JobForm";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Job, JobStatus } from "../types";
import styles from "./Home.module.css";

type StatusFilter = "All" | JobStatus;

const STATUSES: JobStatus[] = ["Applied", "Interviewed", "Rejected"];
const FILTERS: StatusFilter[] = ["All", ...STATUSES];

export default function Home() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Read search, status and sort from the URL (with safe defaults) ----
  const search = searchParams.get("search") ?? "";
  const rawStatus = searchParams.get("status");
  const status: StatusFilter =
    rawStatus && (STATUSES as string[]).includes(rawStatus) ? (rawStatus as JobStatus) : "All";
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";

  // Change one value in the URL. Defaults are removed so the address stays tidy.
  const updateParam = (name: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) {
      next.delete(name);
    } else {
      next.set(name, value);
    }
    // Typing in the search box should not fill up the back button history.
    setSearchParams(next, { replace: name === "search" });
  };

  // ---- Load this user's jobs ----
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    getJobsForUser(currentUser.id)
      .then((list) => {
        if (!cancelled) setJobs(list);
      })
      .catch(() => {
        if (!cancelled) showToast("error", "Could not load your jobs.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser, showToast]);

  // ---- Work out which jobs to show ----
  const visibleJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = jobs.filter((job) => {
      const matchesStatus = status === "All" || job.status === status;
      const matchesSearch =
        !term ||
        job.company.toLowerCase().includes(term) ||
        job.role.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
    list.sort((a, b) =>
      sort === "asc"
        ? a.dateApplied.localeCompare(b.dateApplied)
        : b.dateApplied.localeCompare(a.dateApplied)
    );
    return list;
  }, [jobs, search, status, sort]);

  // Counts use ALL jobs, not the filtered list.
  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      All: jobs.length,
      Applied: 0,
      Interviewed: 0,
      Rejected: 0,
    };
    jobs.forEach((job) => {
      result[job.status] += 1;
    });
    return result;
  }, [jobs]);

  // ---- Add and edit ----
  const openAdd = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };
  const openEdit = (job: Job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };
  const closeForm = useCallback(() => setIsFormOpen(false), []);

  const handleSaved = (saved: Job) => {
    setJobs((list) =>
      editingJob ? list.map((job) => (job.id === saved.id ? saved : job)) : [...list, saved]
    );
    setIsFormOpen(false);
  };

  // ---- Delete ----
  const cancelDelete = useCallback(() => setJobToDelete(null), []);

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      await deleteJob(jobToDelete.id);
      setJobs((list) => list.filter((job) => job.id !== jobToDelete.id));
      showToast("success", "Job deleted");
    } catch {
      showToast("error", "Could not delete the job.");
    } finally {
      setIsDeleting(false);
      setJobToDelete(null);
    }
  };

  const hasFilters = Boolean(search) || status !== "All";

  return (
    <>
      <Navbar />
      <main className="container">
        <h1 className={styles.title}>My jobs</h1>

        <div className={styles.toolbar}>
          <div className={styles.search}>
            <label htmlFor="search" className={styles.sr}>
              Search by company or role
            </label>
            <input
              id="search"
              type="search"
              placeholder="Search by company or role"
              value={search}
              onChange={(e) => updateParam("search", e.target.value, "")}
            />
          </div>
          <Button onClick={openAdd}>+ Add Job</Button>
        </div>

        <div className={styles.filters}>
          <span className={styles.filterLabel}>STATUS</span>
          {FILTERS.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              count={counts[filter]}
              isSelected={status === filter}
              onClick={() => updateParam("status", filter, "All")}
            />
          ))}
          <select
            className={styles.sort}
            value={sort}
            aria-label="Sort by date applied"
            onChange={(e) => updateParam("sort", e.target.value, "desc")}
          >
            <option value="desc">Sort: Newest</option>
            <option value="asc">Sort: Oldest</option>
          </select>
        </div>

        {isLoading ? (
          <Loader />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No jobs yet"
            message="Add the first job you applied for and track it from here."
          >
            <Button onClick={openAdd}>Add your first job</Button>
          </EmptyState>
        ) : visibleJobs.length === 0 ? (
          <EmptyState
            title="No jobs match your search"
            message="Try a different search or filter."
          >
            {hasFilters && (
              <Button variant="secondary" onClick={() => setSearchParams({})}>
                Clear filters
              </Button>
            )}
          </EmptyState>
        ) : (
          <section className={styles.grid} aria-label="Your jobs">
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} onEdit={openEdit} onDelete={setJobToDelete} />
            ))}
          </section>
        )}
      </main>

      <Modal
        title={editingJob ? "Edit job" : "Add a job"}
        isOpen={isFormOpen}
        onClose={closeForm}
      >
        <JobForm
          key={editingJob?.id ?? "new"}
          job={editingJob}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        isOpen={jobToDelete !== null}
        title="Delete this job?"
        message={`${jobToDelete?.company ?? "This job"} will be removed. This cannot be undone.`}
        confirmLabel="Delete"
        isBusy={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}