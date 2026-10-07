import Button from "../components/Button";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <main className={styles.wrap}>
        <section className={styles.card}>
          <p className={styles.code} aria-hidden="true">
            404
          </p>
          <h1>This page does not exist</h1>
          <p className={styles.message}>
            The link may be broken, or the page may have moved.
          </p>
          {/* Logged-in people go to their jobs, everyone else to the landing page */}
          <Button to={currentUser ? "/home" : "/"}>Back to home</Button>
        </section>
      </main>
    </>
  );
}