import { useState } from "react";
import type { FormEvent } from "react";
import { createJob, updateJob } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Job, JobInput, JobStatus } from "../types";
import { todayString } from "../utils/date";
import Button from "./Button";
import InputField from "./InputField";
import SelectField from "./SelectField";
import TextAreaField from "./TextAreaField";
import styles from "./JobForm.module.css";

type Props = {
  job: Job | null; // null means "add a new job"
  onSaved: (job: Job) => void;
  onCancel: () => void;
};

type Errors = Partial<Record<"company" | "role" | "dateApplied" | "duties", string>>;

const STATUSES: JobStatus[] = ["Applied", "Interviewed", "Rejected"];

export default function JobForm({ job, onSaved, onCancel }: Props) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [company, setCompany] = useState(job?.company ?? "");
  const [role, setRole] = useState(job?.role ?? "");
  const [status, setStatus] = useState<JobStatus>(job?.status ?? "Applied");
  const [dateApplied, setDateApplied] = useState(job?.dateApplied ?? todayString());
  const [duties, setDuties] = useState(job?.duties ?? "");
  const [address, setAddress] = useState(job?.address ?? "");
  const [contact, setContact] = useState(job?.contact ?? "");
  const [requirements, setRequirements] = useState(job?.requirements ?? "");
  const [notes, setNotes] = useState(job?.notes ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = (): Errors => {
    const found: Errors = {};
    if (!company.trim()) found.company = "Enter the company name.";
    if (!role.trim()) found.role = "Enter the role.";
    if (!duties.trim()) found.duties = "Describe the job duties.";
    if (!dateApplied) {
      found.dateApplied = "Choose the date you applied.";
    } else if (dateApplied > todayString()) {
      found.dateApplied = "The date cannot be in the future.";
    }
    return found;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const values: JobInput = {
      company: company.trim(),
      role: role.trim(),
      status,
      dateApplied,
      duties: duties.trim(),
      address: address.trim(),
      contact: contact.trim(),
      requirements: requirements.trim(),
      notes: notes.trim(),
    };

    setIsSaving(true);
    try {
      if (job) {
        const saved = await updateJob(job.id, values);
        showToast("success", "Job updated");
        onSaved(saved);
      } else {
        const saved = await createJob({ ...values, userId: currentUser.id });
        showToast("success", "Job added");
        onSaved(saved);
      }
    } catch {
      // Keep the form open so nothing that was typed is lost.
      showToast("error", "Could not save the job. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <InputField
        id="company"
        label="Company name"
        value={company}
        onChange={setCompany}
        error={errors.company}
      />
      <InputField id="role" label="Role" value={role} onChange={setRole} error={errors.role} />
      <SelectField
        id="status"
        label="Status"
        value={status}
        options={STATUSES}
        onChange={(value) => setStatus(value as JobStatus)}
      />
      <InputField
        id="dateApplied"
        label="Date applied"
        type="date"
        value={dateApplied}
        onChange={setDateApplied}
        error={errors.dateApplied}
      />
      <TextAreaField
        id="duties"
        label="Job duties"
        value={duties}
        onChange={setDuties}
        error={errors.duties}
      />

      <h3 className={styles.optional}>Optional details for interview prep</h3>
      <InputField id="address" label="Address" value={address} onChange={setAddress} />
      <InputField
        id="contact"
        label="Contact details"
        value={contact}
        onChange={setContact}
        hint="Name, email or phone number."
      />
      <TextAreaField
        id="requirements"
        label="Requirements"
        value={requirements}
        onChange={setRequirements}
      />
      <TextAreaField id="notes" label="Notes" value={notes} onChange={setNotes} />

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {isSaving ? "Saving" : job ? "Save changes" : "Add job"}
        </Button>
      </div>
    </form>
  );
}