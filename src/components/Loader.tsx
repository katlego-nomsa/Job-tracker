import styles from "./Loader.module.css";

export default function Loader() {
  return (
    <div className={styles.wrap} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>Loading</span>
    </div>
  );
}