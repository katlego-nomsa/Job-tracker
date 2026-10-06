import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { createUser, getUsersByName } from "../api";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Navbar from "../components/Navbar";
import PasswordStrength from "../components/PasswordStrength";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { isStrongPassword } from "../utils/password";
import styles from "./AuthPage.module.css";

type Errors = { username?: string; password?: string; confirm?: string };

export default function Register() {
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
    if (username.trim().length < 3) {
      found.username = "Username must be at least 3 characters.";
    }
    if (!isStrongPassword(password)) {
      found.password = "Your password must meet every requirement below.";
    }
    if (confirm !== password) {
      found.confirm = "Passwords do not match.";
    }
    return found;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    try {
      const existing = await getUsersByName(username.trim());
      if (existing.length > 0) {
        setErrors({ username: "That username is already taken." });
        return;
      }
      await createUser({ username: username.trim(), password });
      showToast("success", "Account created. Please log in.");
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
          <h1>Create your account</h1>
          <p className={styles.sub}>It takes less than a minute.</p>

          <InputField
            id="username"
            label="Username"
            value={username}
            onChange={setUsername}
            error={errors.username}
            hint="At least 3 characters."
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
            autoComplete="new-password"
          />
          <PasswordStrength password={password} />
          <InputField
            id="confirm"
            label="Confirm password"
            type="password"
            canReveal
            value={confirm}
            onChange={setConfirm}
            error={errors.confirm}
            autoComplete="new-password"
          />

          <Button type="submit" className={styles.submit} isLoading={isSubmitting}>
            {isSubmitting ? "Creating account" : "Register"}
          </Button>

          <p className={styles.footer}>
            Already registered? <Link to="/login">Log in</Link>
          </p>
        </form>
      </main>
    </>
  );
}