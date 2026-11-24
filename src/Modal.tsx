import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/** Janela sobreposta acessível: foca o botão Fechar, fecha com Esc e devolve o foco ao sair. */
export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);
  return (
    <div className="dlg-backdrop" onClick={onClose}>
      <div className="dlg" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="dlg-head">
          <h2>{title}</h2>
          <button ref={closeRef} className="more-btn" onClick={onClose}>
            Fechar
          </button>
        </div>
        <div className="dlg-body">{children}</div>
      </div>
    </div>
  );
}
