import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { duration, instOf, levelNames, type Course } from "./data/cursos.ts";

const rows: [string, (c: Course) => ReactNode][] = [
  ["Instituição", (c) => (c.capes && c.ie ? `${instOf(c)[0]} — ${c.ie}` : instOf(c)[0])],
  ["Estado", (c) => instOf(c)[1] || "—"],
  ["Tipo", (c) => instOf(c)[2] || "não informado"],
  ["Nível", (c) => (c.capes ? "Mestrado / Doutorado (confira no site)" : c.levels.split("").map((l) => levelNames[l]).join(", "))],
  ["Área", (c) => c.area],
  ["Subárea", (c) => c.subarea],
  ["Modalidade", (c) => (c.capes ? "Presencial (confira no site)" : c.mode)],
  ["Duração", (c) => c.levels.split("").map((l) => duration[l]).join(" / ")],
  ["Nota CAPES", (c) => c.nota ?? "—"],
  ["Link", (c) => (
    <a href={c.link || instOf(c)[3]} target="_blank" rel="noreferrer">
      {c.capes ? "Buscar programa" : "Ver site"}
    </a>
  )],
];

export default function Compare({ items, onClose, onRemove }: { items: Course[]; onClose: () => void; onRemove: (key: string) => void }) {
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
      <div className="dlg" role="dialog" aria-modal="true" aria-labelledby="cmp-title" onClick={(e) => e.stopPropagation()}>
        <div className="dlg-head">
          <h2 id="cmp-title">Comparar cursos</h2>
          <button ref={closeRef} className="more-btn" onClick={onClose}>
            Fechar
          </button>
        </div>
        <div className="dlg-body">
          <table className="cmp-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Critério</span>
                </th>
                {items.map((c) => (
                  <th scope="col" key={c.key}>
                    {c.name}
                    <button className="link-btn" onClick={() => onRemove(c.key)} aria-label={`Remover ${c.name} da comparação`}>
                      Remover
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, get]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {items.map((c) => (
                    <td key={c.key}>{get(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
