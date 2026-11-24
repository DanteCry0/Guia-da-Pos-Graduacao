import { useMemo, useState } from "react";
import { relatedProgs, usePrograms } from "./programs";

type C = { id: number; institution: string; name: string; levels: string; area: string; subarea: string; mode: string; link?: string };
type Inst = Record<string, [string, string, string, string]>;
const norm = (s: string) =>
  s
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
const LV: Record<string, string> = { M: "Mestrado", D: "Doutorado", E: "Especialização", B: "MBA" };

function recommend(goal: string, now: string, avail: string) {
  const flex = avail === "Preciso de flexibilidade (EAD)";
  if (now === "Mestrado" && goal === "Carreira acadêmica e pesquisa")
    return { lv: ["D"], why: "Com mestrado concluído, o passo natural para pesquisa e docência é o doutorado." };
  if (goal === "Carreira acadêmica e pesquisa")
    return { lv: ["M", "D"], why: "Para pesquisa e docência, o caminho é o stricto sensu: comece pelo mestrado e siga para o doutorado." };
  if (goal === "Crescer no mercado")
    return { lv: flex ? ["B", "E"] : ["B", "M"], why: "Para crescer na carreira, MBAs e mestrados profissionais combinam gestão e aplicação prática." };
  if (goal === "Mudar de área")
    return { lv: ["E", "B"], why: "Para trocar de área com rapidez, especializações e MBAs são mais curtos que um mestrado." };
  return { lv: flex ? ["E"] : ["E", "M"], why: "Para se aprofundar num tema específico, uma especialização é direta; o mestrado vale se quiser pesquisa." };
}

export default function Quiz({ courses, institutions, onSeeCourses, onSeeProgramas }: { courses: C[]; institutions: Inst; onSeeCourses: (area: string, sub: string) => void; onSeeProgramas: () => void }) {
  const [goal, setGoal] = useState("");
  const [now, setNow] = useState("");
  const [avail, setAvail] = useState("");
  const [area, setArea] = useState("");
  const [sub, setSub] = useState("");
  const [topic, setTopic] = useState("");
  const [done, setDone] = useState(false);
  const [uf, setUf] = useState("");
  const progs = usePrograms();
  const ufs = [...new Set((progs ?? []).map((p) => p.uf))].filter(Boolean).sort();

  const areas = [...new Set([...courses.map((c) => c.area), ...(progs ?? []).map((p) => p.ga)])].sort();
  const subs = [...new Set([...courses.filter((c) => c.area === area).map((c) => c.subarea), ...(progs ?? []).filter((p) => p.ga === area).map((p) => p.sa)])].sort();
  const ready = goal && now && avail && area;

  const res = useMemo(() => {
    if (!done) return null;
    const rec = recommend(goal, now, avail);
    const flex = avail === "Preciso de flexibilidade (EAD)";
    const t = norm(topic.trim());
    const ranked = courses
      .map((c) => {
        let s = 0;
        if (rec.lv.some((l) => c.levels.includes(l))) s += 3;
        if (c.area === area) s += 2;
        if (sub && c.subarea === sub) s += 4;
        if (t && norm(`${c.name} ${c.subarea}`).includes(t)) s += 3;
        if (flex && c.mode.includes("EAD")) s += 2;
        return { c, s };
      })
      .filter((x) => x.c.area === area && x.s >= 5)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6);
    const prof = (m: string) => norm(m).includes("profission");
    const progList =
      progs && rec.lv.some((l) => l === "M" || l === "D")
        ? relatedProgs(progs, area, sub)
            .filter((p) => !uf || p.uf === uf)
            .map((p) => ({ p, s: p.nota + (goal === "Crescer no mercado" && prof(p.m) ? 1.5 : 0) + (goal === "Carreira acadêmica e pesquisa" && !prof(p.m) ? 1.5 : 0) }))
            .sort((a, b) => b.s - a.s || a.p.n.localeCompare(b.p.n, "pt-BR"))
            .slice(0, 8)
            .map((x) => x.p)
        : [];
    return { rec, ranked, progList };
  }, [done, goal, now, avail, area, sub, topic, courses, progs, uf]);

  const Q = ({ title, value, set, options }: { title: string; value: string; set: (v: string) => void; options: string[] }) => (
    <fieldset className="quiz-q">
      <legend>{title}</legend>
      <div className="quiz-opts">
        {options.map((o) => (
          <button type="button" key={o} className={value === o ? "quiz-opt on" : "quiz-opt"} onClick={() => { set(o); setDone(false); }}>
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <main className="page-content">
      <div className="page-hero compact">
        <div>
          <span className="section-kicker">Quiz</span>
          <h1>Qual pós-graduação combina com você?</h1>
          <p>Responda cinco perguntas e veja o tipo de curso indicado e instituições para começar a pesquisar.</p>
        </div>
      </div>
      <div className="quiz-card">
        <Q title="1. Qual é o seu principal objetivo?" value={goal} set={setGoal} options={["Carreira acadêmica e pesquisa", "Crescer no mercado", "Mudar de área", "Me aprofundar em um tema"]} />
        <Q title="2. Qual é a sua formação atual?" value={now} set={setNow} options={["Graduação", "Especialização", "Mestrado"]} />
        <Q title="3. Como é a sua disponibilidade?" value={avail} set={setAvail} options={["Dedicação integral", "Trabalho e estudo", "Preciso de flexibilidade (EAD)"]} />
        <Q title="4. Qual área mais te interessa?" value={area} set={(v) => { setArea(v); setSub(""); }} options={areas} />
        {area && <Q title="5. E qual subárea?" value={sub} set={setSub} options={subs} />}
        <label className="select-wrap">
          <span>Algum tema ou palavra-chave de pesquisa? (opcional)</span>
          <div>
            <input value={topic} onChange={(e) => { setTopic(e.target.value); setDone(false); }} placeholder="Ex.: inteligência artificial, inclusão, clima" />
          </div>
        </label>
        <label className="select-wrap">
          <span>Estado de preferência (opcional)</span>
          <div>
            <select value={uf} onChange={(e) => { setUf(e.target.value); setDone(false); }}>
              <option value="">Qualquer estado</option>
              {ufs.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        </label>
        <button className="more-btn" disabled={!ready} onClick={() => setDone(true)}>
          Ver minhas indicações
        </button>
      </div>
      {res && (
        <section className="quiz-result">
          <h2>Indicado para você: {res.rec.lv.map((l) => LV[l]).join(" ou ")}</h2>
          <p>{res.rec.why}</p>
          <h3>Cursos e instituições para começar</h3>
          {res.ranked.length === 0 && <p>Ainda não temos cursos cadastrados que combinem com essas respostas. Tente outra subárea.</p>}
          <div className="prog-grid">
            {res.ranked.map(({ c }) => {
              const i = institutions[c.institution];
              return (
                <article className="prog-card" key={c.id}>
                  <div>
                    <h3>{c.name}</h3>
                    <p>
                      {i[0]} · {i[1]} · {i[2]}
                    </p>
                    <small>
                      {c.levels.split("").map((l) => LV[l]).join(", ")} · {c.subarea} · {c.mode}
                    </small>
                    <br />
                    <a href={c.link || i[3]} target="_blank" rel="noreferrer">
                      Ver site do curso
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
          {res.rec.lv.some((l) => l === "M" || l === "D") && (
            <>
              <h3>Programas reconhecidos pela CAPES na sua área</h3>
              {progs === null && <p>Carregando programas…</p>}
              {progs !== null && res.progList.length === 0 && <p>Ainda não há dados de programas para essa combinação. Tente outro estado ou outra subárea.</p>}
              <div className="prog-grid">
                {res.progList.map((p, i) => (
                  <article className="prog-card" key={p.n + p.sg + i}>
                    <span className={`nota nota-${p.nota}`} title="Nota CAPES">{p.nota}</span>
                    <div>
                      <h3>{p.n}</h3>
                      <p>{p.sg ? `${p.sg} · ` : ""}{p.ie} · {p.uf}</p>
                      <small>{p.sa} · {p.m}</small>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          <div className="quiz-actions">
            <button className="more-btn" onClick={onSeeProgramas}>
              Ver todos os programas CAPES
            </button>
            <button className="more-btn" onClick={() => onSeeCourses(area, sub)}>
              Ver todos os cursos dessa área
            </button>
            <a className="btn-link" href="https://sucupira.capes.gov.br/programas" target="_blank" rel="noreferrer">
              Conferir linhas de pesquisa no Sucupira
            </a>
          </div>
          <p className="call-count">
            As indicações usam a área, a subárea e o tema que você informou. As linhas de pesquisa de cada programa
            estão no Sucupira: confirme lá se a linha combina com o seu projeto.
          </p>
        </section>
      )}
    </main>
  );
}
