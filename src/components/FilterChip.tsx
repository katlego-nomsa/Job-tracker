import styles from "./FilterChip.module.css";

type Props = {
  label: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
};

export default function FilterChip({ label, count, isSelected, onClick }: Props) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${isSelected ? styles.selected : ""}`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {label} · {count}
    </button>
  );
}