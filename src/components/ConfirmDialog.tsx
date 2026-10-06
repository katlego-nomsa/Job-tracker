import Button from "./Button";
import Modal from "./Modal";
import styles from "./ConfirmDialog.module.css";

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isBusy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  isBusy,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal title={title} isOpen={isOpen} onClose={onCancel}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={isBusy}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isBusy}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}