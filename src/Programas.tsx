import { useMemo, useState } from "react";
import { fmtDate } from "./lib/editais.ts";
import { lvText, norm, useProgramMeta, usePrograms, type Prog } from "./programs";

const PAGE = 60;

function Field({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="select-wrap">
      <span>{label}</span>
      <div>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Todos</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
    </label>
  );
}

export default function Programas() {
  const data = usePrograms();
  const [q, setQ] = useState("");
  const [nota, setNota] = useState("");
  const [area, setArea] = useState("");
  const [uf, setUf] = useState("");
  const [mod, setMod] = useState("");
  const [nivel, setNivel] = useState("");
  const meta = useProgramMeta();
  const [shown, setShown] = useState(PAGE);

  const opts = (k: keyof Prog) => [...new Set((data ?? []).map((p) => String(p[k])))].filter(Boolean).sort();
  const list = useMemo(
    () =>
      (data ?? [])
        .filter(
          (p) =>
            (!q || norm(`${p.n} ${p.ie} ${p.sg}`).includes(norm(q))) &&
            (!nota || p.nota >= Number(nota)) &&
            (!area || p.sa === area) &&
            (!uf || p.uf === uf) &&
            (!mod || p.m === mod) &&
            (!nivel || p.lv.includes(nivel === "Mestrado" ? "M" : "D")),
        )
        .sort((a, b) => b.nota - a.nota || a.n.localeCompare(b.n, "pt-BR")),
    [data, q, nota, area, uf, mod, nivel],
  );

  return (
    <main className="page-content">
      <div className="page-hero compact">
        <div>
          <span className="section-kicker">Cursos avaliados e reconhecidos</span>
          <h1>Programas CAPES com nota</h1>
          <p>Mestrados e doutorados reconhecidos, com a nota da avaliação da CAPES (de 3 a 7).</p>
        </div>
      </div>
      <div className="info-banner">
        <p>
          A nota resume a avaliação do programa: 3 é o mínimo para ser reconhecido, e 6 e 7 indicam nível
          internacional. Os dados vêm do Portal de Dados Abertos da CAPES e podem estar defasados em relação ao{" "}
          <a href="https://sucupira.capes.gov.br/programas" target="_blank" rel="noreferrer">
            Sucupira
          </a>
          .
        </p>
      </div>
      {meta && (
        <p className="call-count">
          Base de dados da CAPES: {meta.anoBase}. Lista atualizada no PósGuia em {fmtDate(meta.geradoEm)}.
        </p>
      )}
      {data === null && <p className="call-count">Carregando programas…</p>}
      {data !== null && data.length === 0 && (
        <div className="empty-state">
          <h3>Os dados dos programas ainda não foram carregados</h3>
          <p>
            Gere o arquivo <b>public/data/programas.json</b> rodando <b>pnpm atualizar-programas</b>. Enquanto isso, consulte os programas direto no Sucupira.
          </p>
          <a className="btn-link" href="https://sucupira.capes.gov.br/programas" target="_blank" rel="noreferrer">
            Abrir no Sucupira
          </a>
        </div>
      )}
      {data !== null && data.length > 0 && (
        <>
          <div className="call-filters prog-filters">
            <label className="select-wrap">
              <span>Buscar</span>
              <div>
                <input value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} placeholder="Programa ou instituição" />
              </div>
            </label>
            <Field label="Nota mínima" value={nota} onChange={(v) => { setNota(v); setShown(PAGE); }} options={["3", "4", "5", "6", "7"]} />
            <Field label="Área de avaliação" value={area} onChange={(v) => { setArea(v); setShown(PAGE); }} options={opts("sa")} />
            <Field label="Estado" value={uf} onChange={(v) => { setUf(v); setShown(PAGE); }} options={opts("uf")} />
            <Field label="Nível" value={nivel} onChange={(v) => { setNivel(v); setShown(PAGE); }} options={["Mestrado", "Doutorado"]} />
            <Field label="Modalidade" value={mod} onChange={(v) => { setMod(v); setShown(PAGE); }} options={opts("m")} />
          </div>
          <p className="call-count">
            <strong>{list.length}</strong> {list.length === 1 ? "programa" : "programas"}, ordenados pela maior nota
          </p>
          <div className="prog-grid">
            {list.slice(0, shown).map((p, i) => (
              <article className="prog-card" key={p.n + p.sg + i}>
                <span className={`nota nota-${p.nota}`} title="Nota CAPES">
                  {p.nota}
                </span>
                <div>
                  <h3>{p.n}</h3>
                  <p>
                    {p.sg ? `${p.sg} · ` : ""}
                    {p.ie} · {p.uf}
                  </p>
                  <small>
                    {p.sa} · {p.m}
                    {p.lv ? ` · ${lvText(p.lv)}` : ""}
                  </small>
                </div>
              </article>
            ))}
          </div>
          {shown < list.length && (
            <button className="more-btn" onClick={() => setShown(shown + PAGE)}>
              Mostrar mais
            </button>
          )}
        </>
      )}
    </main>
  );
}
