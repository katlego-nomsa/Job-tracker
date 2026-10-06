export type JobStatus = "Applied" | "Interviewed" | "Rejected";

// What is stored in db.json (passwords are plain text only because this is a mock app)
export type StoredUser = {
  id: number;
  username: string;
  password: string;
};

// What the app keeps in memory and session storage (never the password)
export type User = {
  id: number;
  username: string;
};

// The details the person types in the add and edit form
export type JobInput = {
  company: string;
  role: string;
  status: JobStatus;
  dateApplied: string; // "YYYY-MM-DD"
  duties: string;
  address?: string;
  contact?: string;
  requirements?: string;
  notes?: string;
};

// A saved job: the form details, plus an id and the id of the user who owns it
export type Job = JobInput & {
  id: number;
  userId: number;
};