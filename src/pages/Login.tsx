import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { findUser } from "../api";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import styles from "./AuthPage.module.css";

type Errors = { username?: string; password?: string };

export default function Login() {
  const { currentUser, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The page they first wanted, or /home when there was none.
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;
  const destination = from ? `${from.pathname}${from.search}` : "/home";

  if (currentUser) return <Navigate to="/home" replace />;

  const validate = (): Errors => {
    const found: Errors = {};
    if (!username.trim()) found.username = "Enter your username.";
    if (!password) found.password = "Enter your password.";
    return found;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    try {
      const matches = await findUser(username.trim(), password);
      if (matches.length === 0) {
        setErrors({ password: "Incorrect username or password." });
      } else {
        login({ id: matches[0].id, username: matches[0].username });
        showToast("success", `Welcome back, ${matches[0].username}`);
        navigate(destination, { replace: true });
      }
    } catch {
      showToast("error", "Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.wrap}>
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <h1>Welcome back</h1>
          <p className={styles.sub}>Log in to see your job applications.</p>

          <InputField
            id="username"
            label="Username"
            value={username}
            onChange={setUsername}
            error={errors.username}
            autoComplete="username"
          />
                    <InputField
            id="password"
            label="Password"
            type="password"
            canReveal
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="current-password"
          />
          <p className={styles.forgot}>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>

          <Button type="submit" className={styles.submit} isLoading={isSubmitting}>
            {isSubmitting ? "Logging in" : "Log in"}
          </Button>

          <p className={styles.footer}>
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </main>
    </>
  );
}