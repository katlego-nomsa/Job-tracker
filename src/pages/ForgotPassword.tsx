import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getUsersByName, updateUserPassword } from "../api";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Navbar from "../components/Navbar";
import PasswordStrength from "../components/PasswordStrength";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { isStrongPassword } from "../utils/password";
import styles from "./AuthPage.module.css";

type Errors = { username?: string; password?: string; confirm?: string };

export default function ForgotPassword() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) return <Navigate to="/home" replace />;

  const validate = (): Errors => {
    const found: Errors = {};
    if (!username.trim()) found.username = "Enter your username.";
    if (!isStrongPassword(password)) {
      found.password = "Your new password must meet every requirement below.";
    }
    if (confirm !== password) found.confirm = "Passwords do not match.";
    return found;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    try {
      const matches = await getUsersByName(username.trim());
      if (matches.length === 0) {
        setErrors({ username: "We could not find an account with that username." });
        return;
      }
      await updateUserPassword(matches[0].id, password);
      showToast("success", "Password changed. Please log in.");
      navigate("/login");
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
          <h1>Reset your password</h1>
          <p className={styles.sub}>
            This is a practice app, so there is no email step. Enter your
            username and choose a new password.
          </p>

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
            label="New password"
            type="password"
            canReveal
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordStrength password={password} />
          <InputField
            id="confirm"
            label="Confirm new password"
            type="password"
            canReveal
            value={confirm}
            onChange={setConfirm}
            error={errors.confirm}
            autoComplete="new-password"
          />

          <Button type="submit" className={styles.submit} isLoading={isSubmitting}>
            {isSubmitting ? "Saving" : "Change password"}
          </Button>

          <p className={styles.footer}>
            Remembered it? <Link to="/login">Back to log in</Link>
          </p>
        </form>
      </main>
    </>
  );
}