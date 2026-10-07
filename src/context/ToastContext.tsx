import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import styles from "./Toast.module.css";

type ToastType = "success" | "error";
type ToastItem = { id: number; type: ToastType; message: string };
type ToastValue = { showToast: (type: ToastType, message: string) => void };

const ToastContext = createContext<ToastValue | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setToasts((list) => [...list, { id, type, message }]);
    // Remove this message after 3 seconds.
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Announced politely to screen readers */}
      <div className={styles.stack} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}