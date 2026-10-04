import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  widthClass?: string;
}

export function Modal({ open, onClose, title, children, widthClass = "max-w-lg" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${widthClass} rounded-md bg-white dark:bg-ink shadow-xl border border-ink/10 dark:border-paper/10`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-ink/10 dark:border-paper/10 px-5 py-4">
            <h3 className="font-serif text-lg font-semibold text-ink dark:text-paper">{title}</h3>
            <button onClick={onClose} aria-label="Close" className="text-ink/50 hover:text-ink dark:text-paper/50 dark:hover:text-paper">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
