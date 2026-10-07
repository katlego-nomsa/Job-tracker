# Job Tracker

A job application tracker built with **React, TypeScript, React Router and JSON Server**. People can register, log in and keep track of the jobs they have applied for, so they can see how many are pending, led to an interview or were rejected.

This is Task 3 of the ReactTS course (React navigation, routing, URL queries and URL parameters).

## Links

- **Figma design:** https://www.figma.com/proto/B60mUhrzmBPkUzC2Ga4qbe/Register?node-id=0-1&t=nN6JttDbvCaTHkXz-1
- **Live site:** https://job-tracker-llrw.vercel.app
- **Pseudocode:** [job-pseudocode.md](./job-pseudocode.md)

> **About the live site:** the React app is hosted on Vercel, but its database (JSON Server) runs on my own computer and is shared through a temporary tunnel. The live site only works while that tunnel is running. If you see "Something went wrong" when registering or logging in, the tunnel is off. The app always works locally, see [Run it locally](#run-it-locally).

## Features

- **Six pages:** Landing, Register, Login, Home (my jobs), Job details and a 404 page. A Forgot password page is included too.
- **Accounts:** register and log in. Pages with private data are protected, so logged-out visitors are sent to the login page and returned to the page they wanted after logging in.
- **Strong passwords:** a strength meter and a checklist (8+ characters, uppercase, lowercase, number, symbol). An eye button shows the password for one second.
- **Jobs (CRUD):** add, view, edit and delete jobs. Each job has a company, role, status (Applied, Interviewed or Rejected), date applied and duties, plus optional address, contact details, requirements and notes.
- **Search, filter and sort from the URL:** search by company or role, filter by status, and sort by date (newest or oldest). The values live in the address bar, so a link always gives the same view.
- **Status colours:** yellow for Applied, green for Interviewed, red for Rejected. Every badge also has a text label, so colour is never the only signal.
- **Feedback:** loaders and disabled buttons while requests run, pop-up messages (toasts) for success and errors, a confirmation popup before deleting, and empty states ("No jobs yet", "No jobs match your search").
- **Validation:** every form checks its input and shows a message under the field.
- **Responsive:** works from 320px up to wide desktop screens.
- **Accessibility:** labelled inputs, visible focus outlines, keyboard-friendly popups (Escape to close, focus kept inside), and messages announced to screen readers.

## Pages and routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Landing | Public |
| `/register` | Register | Public |
| `/login` | Log in | Public |
| `/forgot-password` | Reset password | Public |
| `/home` | My jobs | Logged in only |
| `/jobs/:id` | Job details | Logged in only (a job you do not own shows the 404 page) |
| `*` | 404 page | Public |

### URL queries on `/home`

| Query | Values | Default |
| --- | --- | --- |
| `search` | any text (matches company or role) | empty |
| `status` | `Applied`, `Interviewed`, `Rejected` | all |
| `sort` | `asc` (oldest first), `desc` (newest first) | `desc` |


## Tech stack

- React 19 with TypeScript, built with Vite
- React Router (`NavLink`, `useSearchParams`, `useParams`, protected routes)
- JSON Server for the mock database
- CSS Modules with shared design tokens (colours, spacing, type)

## Run it locally

You need **Node.js 20 or newer**.

```bash
# 1. Install the packages
npm install

# 2. Start the database and the app together
npm start
```

- The app opens at http://localhost:5173
- The database (JSON Server) runs at http://localhost:3001

To start them separately, use `npm run server` (database) and `npm run dev` (app).

Your data is saved in `db.json`. Reset it to this before committing so test accounts are not uploaded:

```json
{
  "users": [],
  "jobs": []
}
```

## Project structure

```
src/
  api.ts          all calls to JSON Server (the server address lives in one place)
  types.ts        shared types
  index.css       colour, spacing and font tokens
  context/        AuthContext (who is logged in) and ToastContext (pop-up messages)
  components/     Button, InputField, Navbar, JobCard, Modal, ProtectedRoute and more
  pages/          Landing, Register, Login, ForgotPassword, Home, JobPage, NotFound
  utils/          date and password helpers
```

## Deployment

The React app is deployed on Vercel from the `Job-link` branch. The address of the database is set with the environment variable `VITE_API_URL`. If it is not set, the app uses `http://localhost:3001`. `vercel.json` makes page refreshes on routes like `/home` work.

## Notes

- This is a practice project. **Passwords are stored as plain text in `db.json`** because JSON Server does not hash them. Do not use a real password.
- **Forgot password** has no email step: a person enters their username and chooses a new password. A real app would send a reset link.
- The session is kept in the browser's session storage, so closing the tab logs the person out.


## Git workflow

Work was done on the `Job-link` branch and merged through a pull request into `main`, with my mentor assigned as reviewer.
