import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.link} ${isActive ? styles.active : ""}`;

  return (
    <header className={`container ${styles.bar}`}>
      <Link to="/" className={styles.logo}>
                <span className={styles.mark} aria-hidden="true" />
        Job Tracker
      </Link>

      <nav aria-label="Main" className={styles.nav}>
        {currentUser ? (
          <>
            <NavLink to="/home" className={linkClass}>My Jobs</NavLink>
            <NavLink to="/" end className={linkClass}>Landing</NavLink>
            <Button variant="secondary" onClick={logout}>Log out</Button>
          </>
        ) : (
          <>
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <Button variant="secondary" to="/login">Log in</Button>
            <Button to="/register">Register</Button>
          </>
        )}
      </nav>
    </header>
  );
}