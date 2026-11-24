import { useEffect, useMemo, useState } from "react";
import Programas from "./Programas";
import Quiz from "./Quiz";
import Compare from "./Compare";
import Ajuda from "./Ajuda.tsx";
import Apoio from "./Apoio.tsx";
import Modal from "./Modal.tsx";
import { norm as pnorm, notaFor, usePrograms } from "./programs";
import { courses, duration, institutions, instOf, levelNames, type Course } from "./data/cursos.ts";
import { callAreas, calls, callState, daysSince, fmtDate, isStale, statusOrder, type Call } from "./lib/editais.ts";
import { buildIcs, googleCalendarUrl, icsFileName } from "./lib/ics.ts";
import { reportEditalMailto, suggestEditalMailto } from "./lib/contato.ts";
import { CONTACT_EMAIL } from "./config.ts";

type IconName =
  | "search"
  | "chevron"
  | "arrow"
  | "heart"
  | "book"
  | "calendar"
  | "spark"
  | "map"
  | "clock"
  | "building"
  | "filter"
  | "check"
  | "graduation"
  | "menu"
  | "close";

function Icon({
  name,
  size = 20,
  filled = false,
}: {
  name: IconName;
  size?: number;
  filled?: boolean;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    chevron: <path d="m8 10 4 4 4-4" />,
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9Z" />
    ),
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3-1.2 3.6A6 6 0 0 1 7 10.4L3.5 12l3.5 1.4a6 6 0 0 1 3.8 3.8L12 21l1.2-3.8a6 6 0 0 1 3.8-3.8l3.5-1.4-3.5-1.6a6 6 0 0 1-3.8-3.8Z" />
      </>
    ),
    map: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    building: (
      <>
        <path d="M3 21h18M6 21V8l6-4 6 4v13M9 12h.01M15 12h.01M9 16h.01M15 16h.01" />
      </>
    ),
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    check: <path d="m5 12 4 4L19 6" />,
    graduation: (
      <>
        <path d="m2 10 10-5 10 5-10 5Z" />
        <path d="M6 12v5c3 2 9 2 12 0v-5M22 10v6" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const qs = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
const TABS = ["cursos", "editais", "guia", "programas", "quiz", "ajuda"] as const;
type Tab = (typeof TABS)[number];

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
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
        <Icon name="chevron" size={16} />
      </div>
    </label>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>(TABS.find((t) => t === qs.get("aba")) ?? "cursos");
  const [query, setQuery] = useState(qs.get("q") ?? "");
  const [level, setLevel] = useState(qs.get("nivel") ?? "");
  const [area, setArea] = useState(qs.get("area") ?? "");
  const [state, setState] = useState(qs.get("uf") ?? "");
  const [mode, setMode] = useState(qs.get("modo") ?? "");
  const [type, setType] = useState(qs.get("tipo") ?? "");
  const [sub, setSub] = useState(qs.get("sub") ?? "");
  const [callStatus, setCallStatus] = useState("");
  const [callArea, setCallArea] = useState("");
  const [callQuery, setCallQuery] = useState("");
  const [sort, setSort] = useState(qs.get("ordem") ?? "Relevância");
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("posguia:salvos") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("posguia:salvos", JSON.stringify(saved));
    } catch {
      /* armazenamento indisponível: segue sem salvar */
    }
  }, [saved]);
  const [cmp, setCmp] = useState<string[]>([]);
  const [showCmp, setShowCmp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApoio, setShowApoio] = useState(false);
  const progs = usePrograms();
  const [shown, setShown] = useState(30);
  // Catálogo manual (com links e lato sensu) + programas reais da CAPES.
  const allCourses = useMemo(() => {
    const key = (n: string, s: string) => pnorm(s) + "|" + pnorm(n.replace(/\(.*?\)/g, "")).trim();
    const catalog = courses.map((c) => ({ ...c, nota: notaFor(c.name, c.levels, institutions[c.institution][0], progs) ?? undefined }));
    const catKeys = new Set(courses.filter((c) => /[MD]/.test(c.levels)).map((c) => key(c.name, institutions[c.institution][0])));
    const counts = new Map<string, number>();
    (progs ?? []).forEach((p) => counts.set(key(p.n, p.sg), (counts.get(key(p.n, p.sg)) ?? 0) + 1));
    const extra = (progs ?? [])
      .filter((p) => !(catKeys.has(key(p.n, p.sg)) && counts.get(key(p.n, p.sg)) === 1))
      .map((p, i): Course => ({
        id: 100000 + i, key: `p:${p.sg || p.ie}:${p.n}:${p.uf}`, institution: "", name: p.n, levels: "MD", area: p.ga, subarea: p.sa, mode: "Presencial",
        capes: true, nota: String(p.nota), sg: p.sg, ie: p.ie, uf: p.uf, tipo: p.t ?? "", prog: p.m,
        link: `https://www.google.com/search?q=${encodeURIComponent(`${p.n} ${p.sg || p.ie} pós-graduação`)}`,
      }));
    return [...catalog, ...extra];
  }, [progs]);
  const areas = useMemo(() => [...new Set(allCourses.map((c) => c.area))].sort(), [allCourses]);
  const states = useMemo(() => [...new Set(allCourses.map((c) => instOf(c)[1]))].filter(Boolean).sort(), [allCourses]);
  const [onlySaved, setOnlySaved] = useState(qs.get("salvos") === "1");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = pnorm(query);
    return allCourses
      .filter((c) => {
        const inst = instOf(c);
        const haystack = pnorm(`${c.name} ${inst[0]} ${c.ie ?? ""} ${c.area} ${c.subarea}`);
        return (
          (!q || haystack.includes(q)) &&
          (!level || c.levels.includes(level)) &&
          (!area || c.area === area) &&
          (!sub || c.subarea === sub) &&
          (!state || inst[1] === state) &&
          (!mode || c.mode.includes(mode)) &&
          (!type || inst[2] === type) &&
          (!onlySaved || saved.includes(c.key))
        );
      })
      .sort((a, b) =>
        sort === "Nome A–Z"
          ? a.name.localeCompare(b.name, "pt-BR")
          : sort === "Maior nota CAPES"
            ? (parseInt(b.nota ?? "0") || 0) - (parseInt(a.nota ?? "0") || 0)
            : 0,
      );
  }, [allCourses, query, level, area, sub, state, mode, type, onlySaved, saved, sort]);
  useEffect(() => {
    setShown(30);
  }, [query, level, area, sub, state, mode, type, onlySaved, sort]);
  // Mantém a aba e os filtros na URL, para a busca poder ser compartilhada.
  useEffect(() => {
    const p = new URLSearchParams();
    if (tab !== "cursos") p.set("aba", tab);
    else
      Object.entries({ q: query, nivel: level, area, sub, uf: state, modo: mode, tipo: type, ordem: sort === "Relevância" ? "" : sort, salvos: onlySaved ? "1" : "" }).forEach(
        ([k, v]) => v && p.set(k, v),
      );
    const s = p.toString();
    window.history.replaceState(null, "", window.location.pathname + (s ? `?${s}` : "") + window.location.hash);
  }, [tab, query, level, area, sub, state, mode, type, sort, onlySaved]);
  const cmpItems = cmp.map((k) => allCourses.find((c) => c.key === k)).filter(Boolean) as Course[];
  const toggleCmp = (k: string) => setCmp((c) => (c.includes(k) ? c.filter((x) => x !== k) : c.length < 3 ? [...c, k] : c));
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      window.prompt("Copie o link:", window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const subareas = useMemo(
    () => [...new Set(allCourses.filter((c) => !area || c.area === area).map((c) => c.subarea))].sort(),
    [area, allCourses],
  );
  const activeFilters = [level, area, sub, state, mode, type].filter(Boolean).length;
  const clearFilters = () => {
    setLevel("");
    setArea("");
    setSub("");
    setState("");
    setMode("");
    setType("");
    setOnlySaved(false);
  };
  const goToCourses = (selectedLevel?: string) => {
    if (selectedLevel) setLevel(selectedLevel);
    setTab("cursos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const now = new Date();
  const callList = calls
    .map((c) => ({ ...c, ...callState(c, now) }))
    .filter(
      (c) =>
        (callStatus ? c.status === callStatus : !isStale(c, now)) &&
        (!callArea || c.area === callArea) &&
        (!callQuery || pnorm(`${c.name} ${c.org}`).includes(pnorm(callQuery))),
    )
    .sort(
      (a, b) =>
        statusOrder[a.status] - statusOrder[b.status] ||
        (a.status === "enc"
          ? b.end.localeCompare(a.end)
          : a.status === "prog"
            ? (a.start ?? "").localeCompare(b.start ?? "")
            : a.end.localeCompare(b.end)),
    );
  const openCount = callList.filter((c) => c.status === "ab").length;
  const hiddenOld = callStatus ? 0 : calls.filter((c) => isStale(c, now)).length;
  const editaisUrl = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?aba=editais` : "";
  const downloadIcs = (c: Call) => {
    const url = URL.createObjectURL(new Blob([buildIcs(c)], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = icsFileName(c);
    link.click();
    URL.revokeObjectURL(url);
  };

  const filterContent = (
    <div className="filter-fields">
      <label className="select-wrap">
        <span>Nível do curso</span>
        <div>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(levelNames).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <Icon name="chevron" size={16} />
        </div>
      </label>
      <Select
        label="Área de interesse"
        value={area}
        onChange={(v) => {
          setArea(v);
          setSub("");
        }}
        options={areas}
      />
      <Select label="Subárea" value={sub} onChange={setSub} options={subareas} />
      <Select label="Estado" value={state} onChange={setState} options={states} />
      <Select label="Modalidade" value={mode} onChange={setMode} options={["Presencial", "EAD"]} />
      <Select
        label="Instituição"
        value={type}
        onChange={setType}
        options={["Pública", "Privada"]}
      />
    </div>
  );

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#conteudo"
        onClick={(e) => {
          e.preventDefault();
          const m = document.querySelector("main") as HTMLElement | null;
          m?.setAttribute("tabindex", "-1");
          m?.focus();
        }}
      >
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="nav-inner">
          <button className="brand" onClick={() => goToCourses()} aria-label="Ir para o início">
            <span className="brand-mark">
              <Icon name="graduation" size={25} />
            </span>
            <span>
              Pós<span>Guia</span>
            </span>
          </button>
          <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Navegação principal">
            {(
              [
                ["cursos", "Explorar cursos"],
                ["editais", "Editais"],
                ["guia", "Guia de escolha"],
                ["programas", "Programas CAPES"],
                ["quiz", "Quiz"],
                ["ajuda", "Sobre e ajuda"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                className={tab === id ? "active" : ""}
                aria-current={tab === id ? "page" : undefined}
                onClick={() => {
                  setTab(id);
                  setMenuOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            className="saved-link"
            onClick={() => {
              setTab("cursos");
              setOnlySaved(true);
            }}
          >
            <Icon name="heart" size={19} /> Salvos {saved.length > 0 && <b>{saved.length}</b>}
          </button>
          <button
            className="menu-button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </header>

      {tab === "cursos" && (
        <>
          <section className="hero">
            <div className="hero-orb orb-one" />
            <div className="hero-orb orb-two" />
            <div className="hero-content">
              <div className="eyebrow">
                <Icon name="spark" size={15} /> Seu próximo passo começa aqui
              </div>
              <h1>
                Encontre a pós que combina com <em>o seu futuro.</em>
              </h1>
              <p>
                Compare mestrados, doutorados, especializações e MBAs das principais instituições do
                Brasil.
              </p>
              <div className="hero-search">
                <Icon name="search" size={23} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Busque por curso, área ou instituição..."
                  aria-label="Buscar cursos"
                />
                <button
                  onClick={() =>
                    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Buscar
                </button>
              </div>
              <div className="popular">
                <span>Buscas populares:</span>
                {["Computação", "Direito", "Educação", "MBA"].map((item) => (
                  <button key={item} onClick={() => setQuery(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <main className="main-content" id="results">
            <div className="browse-heading">
              <div>
                <span className="section-kicker">Explore possibilidades</span>
                <h2>Encontre seu curso ideal</h2>
              </div>
              <button className="mobile-filter-button" onClick={() => setMobileFilters(true)}>
                <Icon name="filter" size={18} /> Filtros{" "}
                {activeFilters > 0 && <b>{activeFilters}</b>}
              </button>
            </div>
            <div className="catalog-layout">
              <aside className="filters-panel">
                <div className="filters-title">
                  <h3>
                    <Icon name="filter" size={19} /> Filtros
                  </h3>
                  {activeFilters > 0 && <button onClick={clearFilters}>Limpar</button>}
                </div>
                {filterContent}
                <div className="filter-tip">
                  <Icon name="spark" size={18} />
                  <p>
                    <strong>Não sabe por onde começar?</strong>
                    <br />
                    Use o nosso guia para entender qual curso faz sentido para você.
                  </p>
                  <button onClick={() => setTab("guia")}>
                    Abrir guia <Icon name="arrow" size={15} />
                  </button>
                </div>
              </aside>
              <section className="results-area">
                <div className="results-bar">
                  <p aria-live="polite">
                    <strong>{filtered.length}</strong>{" "}
                    {filtered.length === 1 ? "curso encontrado" : "cursos encontrados"}
                    {onlySaved && " nos seus salvos"}
                  </p>
                  <button className="copy-link" onClick={copyLink}>
                    {copied ? "Link copiado!" : "Copiar link da busca"}
                  </button>
                  <label>
                    Ordenar por{" "}
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option>Relevância</option>
                      <option>Nome A–Z</option>
                      <option>Maior nota CAPES</option>
                    </select>
                    <Icon name="chevron" size={15} />
                  </label>
                </div>
                {onlySaved && (
                  <div className="saved-notice">
                    <span>Mostrando apenas cursos salvos</span>
                    <button onClick={() => setOnlySaved(false)}>Ver todos</button>
                  </div>
                )}
                {progs && progs.length > 0 && (
                  <p className="capes-note">
                    A lista inclui os programas de mestrado e doutorado reconhecidos pela CAPES, com a nota. Os dados abertos não informam os
                    níveis oferecidos nem a modalidade de cada programa: confira no site antes de se inscrever.
                  </p>
                )}
                <div className="course-list">
                  {filtered.slice(0, shown).map((course) => {
                    const inst = instOf(course);
                    const isSaved = saved.includes(course.key);
                    const nota = course.nota;
                    return (
                      <article className="course-card" key={course.id}>
                        <div className="institution-avatar">
                          {inst[0].slice(0, 3).toUpperCase()}
                        </div>
                        <div className="course-body">
                          <div className="card-topline">
                            <span>
                              {inst[0]}
                              {inst[2] ? ` · ${inst[2]}` : ""}
                            </span>
                            <button
                              className={isSaved ? "heart-button saved" : "heart-button"}
                              onClick={() =>
                                setSaved(
                                  isSaved
                                    ? saved.filter((x) => x !== course.key)
                                    : [...saved, course.key],
                                )
                              }
                              aria-label={isSaved ? "Remover dos salvos" : "Salvar curso"}
                            >
                              <Icon name="heart" size={20} filled={isSaved} />
                            </button>
                          </div>
                          <h3>{course.name}</h3>
                          <div className="pills">
                            {course.capes ? (
                              <span className="level-pill">Mestrado / Doutorado</span>
                            ) : (
                              course.levels.split("").map((l) => (
                                <span className="level-pill" key={l}>
                                  {levelNames[l]}
                                </span>
                              ))
                            )}
                            <span>{course.subarea}</span>
                            {course.prog && <span>{course.prog}</span>}
                            {nota && (
                              <span className="nota-pill" title="Nota da avaliação da CAPES (3 a 7)">
                                Nota CAPES {nota}
                              </span>
                            )}
                          </div>
                          <div className="course-facts">
                            <span>
                              <Icon name="map" size={16} /> {inst[1]} · {course.mode}
                            </span>
                            <span>
                              <Icon name="clock" size={16} />{" "}
                              {course.levels
                                .split("")
                                .map((l) => duration[l])
                                .join(" / ")}
                            </span>
                          </div>
                          <label className="cmp-check">
                            <input
                              type="checkbox"
                              checked={cmp.includes(course.key)}
                              disabled={!cmp.includes(course.key) && cmp.length >= 3}
                              onChange={() => toggleCmp(course.key)}
                            />{" "}
                            Comparar
                          </label>
                        </div>
                        <a
                          className="details-button"
                          href={course.link || inst[3]}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {course.capes ? "Buscar programa" : "Ver detalhes"} <Icon name="arrow" size={17} />
                        </a>
                      </article>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="empty-state">
                      <span>
                        <Icon name="search" size={30} />
                      </span>
                      <h3>Nenhum curso encontrado</h3>
                      <p>Tente remover alguns filtros ou buscar por outro termo.</p>
                      <button onClick={clearFilters}>Limpar filtros</button>
                    </div>
                  )}
                  {filtered.length > shown && (
                    <button className="more-btn" onClick={() => setShown(shown + 30)}>
                      Mostrar mais ({filtered.length - shown} restantes)
                    </button>
                  )}
                </div>
              </section>
            </div>
          </main>
        </>
      )}

      {tab === "cursos" && cmp.length > 0 && (
        <div className="cmp-bar" role="region" aria-label="Comparação de cursos">
          <span>
            {cmp.length} {cmp.length === 1 ? "curso selecionado" : "cursos selecionados"} (máx. 3)
          </span>
          <button className="more-btn" disabled={cmp.length < 2} onClick={() => setShowCmp(true)}>
            Comparar
          </button>
          <button className="link-btn" onClick={() => setCmp([])}>
            Limpar
          </button>
        </div>
      )}
      {showCmp && cmpItems.length > 1 && (
        <Compare
          items={cmpItems}
          onClose={() => setShowCmp(false)}
          onRemove={(k) => {
            const next = cmp.filter((x) => x !== k);
            setCmp(next);
            if (next.length < 2) setShowCmp(false);
          }}
        />
      )}

      {tab === "ajuda" && <Ajuda />}
      {showApoio && (
        <Modal title="Apoie o PósGuia" onClose={() => setShowApoio(false)}>
          <Apoio />
        </Modal>
      )}
      {tab === "programas" && <Programas />}
      {tab === "quiz" && (
        <Quiz
          courses={courses}
          institutions={institutions}
          onSeeCourses={(a, b) => {
            setArea(a);
            setSub(b);
            setLevel("");
            setTab("cursos");
          }}
          onSeeProgramas={() => setTab("programas")}
        />
      )}

      {tab === "editais" && (
        <main className="page-content">
          <div className="page-hero compact">
            <div>
              <span className="section-kicker">Prazos importantes</span>
              <h1>Editais de pós-graduação</h1>
              <p>Acompanhe processos seletivos e não perca nenhuma oportunidade.</p>
            </div>
            <div className="page-icon">
              <Icon name="calendar" size={34} />
            </div>
          </div>
          <div className="info-banner">
            <Icon name="check" size={18} />
            <p>
              Os prazos podem ser prorrogados ou retificados. Confirme sempre as datas e requisitos
              no edital oficial.
            </p>
          </div>
          <p className="call-suggest">
            Conhece um edital que não está aqui? <a href={suggestEditalMailto(CONTACT_EMAIL, editaisUrl)}>Sugira por e-mail</a>.
          </p>
          <div className="call-filters">
            <label className="select-wrap">
              <span>Situação</span>
              <div>
                <select value={callStatus} onChange={(e) => setCallStatus(e.target.value)}>
                  <option value="">Todas</option>
                  <option value="ab">Abertos</option>
                  <option value="prog">Programados</option>
                  <option value="enc">Encerrados</option>
                </select>
                <Icon name="chevron" size={16} />
              </div>
            </label>
            <Select label="Área" value={callArea} onChange={setCallArea} options={callAreas} />
            <label className="select-wrap">
              <span>Buscar</span>
              <div>
                <input
                  value={callQuery}
                  onChange={(e) => setCallQuery(e.target.value)}
                  placeholder="Instituição ou programa"
                />
              </div>
            </label>
          </div>
          <p className="call-count">
            <strong>{callList.length}</strong> {callList.length === 1 ? "edital" : "editais"} ·{" "}
            {openCount} {openCount === 1 ? "aberto" : "abertos"}, ordenados pelo prazo mais próximo
            {hiddenOld > 0 && ` · ${hiddenOld} encerrado${hiddenOld === 1 ? "" : "s"} há mais de 30 dias oculto${hiddenOld === 1 ? "" : "s"}`}
          </p>
          <div className="call-grid">
            {callList.map((call) => {
              const badge =
                call.status === "ab"
                  ? call.soon
                    ? call.days <= 1
                      ? "Vence hoje ou amanhã"
                      : `Vence em ${call.days} dias`
                    : "Aberto"
                  : call.status === "prog"
                    ? "Programado"
                    : "Encerrado";
              return (
                <article
                  className={`call-card${call.soon ? " soon" : ""}${call.status === "enc" ? " ended" : ""}`}
                  key={call.name + call.end}
                >
                  <div className="call-date">
                    <span className={call.soon ? "soon" : call.status}>{badge}</span>
                    <small>{call.status === "prog" ? "Inscrições a partir de" : "Inscrições até"}</small>
                    <strong>{fmtDate(call.status === "prog" ? call.start! : call.end)}</strong>
                    {call.status === "ab" && !call.soon && (
                      <small className="days-left">{call.days} dias restantes</small>
                    )}
                  </div>
                  <div className="call-content">
                    <div className="card-topline">
                      <span>{call.org}</span>
                      <span>{call.area}</span>
                    </div>
                    <h2>{call.name}</h2>
                    <p>{call.detail}</p>
                    <div className="call-meta">
                      <span>
                        <Icon name="graduation" size={17} /> {call.level}
                      </span>
                      <span>
                        <Icon name="calendar" size={17} /> {call.start ? `${fmtDate(call.start)} — ${fmtDate(call.end)}` : `até ${fmtDate(call.end)}`}
                      </span>
                    </div>
                    <a href={call.url} target="_blank" rel="noreferrer">
                      Ver edital <Icon name="arrow" size={17} />
                    </a>
                    <small className="call-source">
                      {call.fonte && <>Fonte: {call.fonte}. </>}
                      {call.verificado &&
                        (daysSince(call.verificado, now) > 14 ? (
                          <b className="call-old">Verificado há {daysSince(call.verificado, now)} dias: confirme no edital.</b>
                        ) : (
                          <>Verificado em {fmtDate(call.verificado)}.</>
                        ))}
                    </small>
                    <div className="call-tools">
                      {call.status !== "enc" && (
                        <>
                          <a href={googleCalendarUrl(call)} target="_blank" rel="noreferrer">
                            Lembrete no Google Agenda
                          </a>
                          <button type="button" className="link-btn" onClick={() => downloadIcs(call)}>
                            Baixar .ics
                          </button>
                        </>
                      )}
                      <a href={reportEditalMailto(CONTACT_EMAIL, call, editaisUrl)}>Informar erro</a>
                    </div>
                  </div>
                </article>
              );
            })}
            {callList.length === 0 && (
              <div className="empty-state">
                <span>
                  <Icon name="calendar" size={30} />
                </span>
                <h3>Nenhum edital encontrado</h3>
                <p>Tente remover algum filtro.</p>
                <button
                  onClick={() => {
                    setCallStatus("");
                    setCallArea("");
                    setCallQuery("");
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {tab === "guia" && (
        <main className="page-content">
          <div className="page-hero guide-hero">
            <div>
              <span className="section-kicker">Decida com confiança</span>
              <h1>
                Qual pós-graduação
                <br />é ideal para você?
              </h1>
              <p>Entenda as diferenças e escolha o caminho mais alinhado aos seus objetivos.</p>
            </div>
            <div className="guide-art">
              <Icon name="book" size={62} />
              <span>
                <Icon name="spark" size={25} />
              </span>
            </div>
          </div>
          <section className="guide-intro">
            <div className="guide-copy">
              <span className="step-number">01</span>
              <h2>Primeiro, entenda as categorias</h2>
              <p>
                Toda pós-graduação se encaixa em um de dois grandes grupos. A diferença está no
                objetivo e no tipo de formação.
              </p>
            </div>
            <div className="category-grid">
              <article>
                <div className="category-icon green">
                  <Icon name="graduation" size={27} />
                </div>
                <span>Formação acadêmica</span>
                <h3>Stricto sensu</h3>
                <p>
                  Mestrado e doutorado. Formam pesquisadores e docentes, terminam em dissertação ou
                  tese e concedem diploma.
                </p>
                <ul>
                  <li>
                    <Icon name="check" size={15} /> Reconhecido pela CAPES
                  </li>
                  <li>
                    <Icon name="check" size={15} /> Ideal para pesquisa e docência
                  </li>
                </ul>
              </article>
              <article>
                <div className="category-icon purple">
                  <Icon name="building" size={27} />
                </div>
                <span>Formação profissional</span>
                <h3>Lato sensu</h3>
                <p>
                  Especializações e MBAs. Focam na capacitação para o mercado, têm no mínimo 360
                  horas e concedem certificado.
                </p>
                <ul>
                  <li>
                    <Icon name="check" size={15} /> Aplicação prática e rápida
                  </li>
                  <li>
                    <Icon name="check" size={15} /> Ideal para crescer ou mudar de área
                  </li>
                </ul>
              </article>
            </div>
          </section>
          <section className="compare-section">
            <div className="section-title">
              <span className="step-number">02</span>
              <h2>Compare os tipos de curso</h2>
              <p>Veja rapidamente qual opção atende melhor ao seu momento.</p>
            </div>
            <div className="comparison-grid">
              {[
                [
                  "E",
                  "Especialização",
                  "Aprofundar ou se atualizar em uma área",
                  "1 a 2 anos",
                  "Certificado",
                  "Mercado",
                ],
                [
                  "B",
                  "MBA",
                  "Crescer para cargos de gestão e negócios",
                  "1 a 2 anos",
                  "Certificado",
                  "Liderança",
                ],
                [
                  "M",
                  "Mestrado",
                  "Pesquisa, técnica ou carreira acadêmica",
                  "Até 2 anos",
                  "Diploma",
                  "Pesquisa",
                ],
                [
                  "D",
                  "Doutorado",
                  "Pesquisa original e docência superior",
                  "Até 4 anos",
                  "Diploma",
                  "Academia",
                ],
              ].map(([code, name, focus, time, doc, tag]) => (
                <article key={code} className="compare-card">
                  <span className="compare-tag">{tag}</span>
                  <h3>{name}</h3>
                  <p>{focus}</p>
                  <dl>
                    <div>
                      <dt>Duração típica</dt>
                      <dd>{time}</dd>
                    </div>
                    <div>
                      <dt>Ao concluir</dt>
                      <dd>{doc}</dd>
                    </div>
                  </dl>
                  <button onClick={() => goToCourses(code)}>
                    Ver cursos <Icon name="arrow" size={16} />
                  </button>
                </article>
              ))}
            </div>
          </section>
          <section className="guide-cta">
            <div>
              <span>Ainda em dúvida?</span>
              <h2>Explore os cursos e descubra novas possibilidades.</h2>
            </div>
            <button onClick={() => goToCourses()}>
              Explorar todos os cursos <Icon name="arrow" size={18} />
            </button>
          </section>
        </main>
      )}

      {mobileFilters && (
        <div className="mobile-overlay" onClick={() => setMobileFilters(false)}>
          <aside onClick={(e) => e.stopPropagation()}>
            <div className="mobile-sheet-head">
              <h2>Filtros</h2>
              <button onClick={() => setMobileFilters(false)}>
                <Icon name="close" />
              </button>
            </div>
            {filterContent}
            <div className="mobile-sheet-actions">
              <button onClick={clearFilters}>Limpar</button>
              <button onClick={() => setMobileFilters(false)}>Ver {filtered.length} cursos</button>
            </div>
          </aside>
        </div>
      )}

      <footer>
        <div className="footer-brand">
          <span className="brand-mark">
            <Icon name="graduation" size={22} />
          </span>
          <strong>PósGuia</strong>
          <p>Informação clara para decisões que transformam.</p>
        </div>
        <div>
          <strong>Fontes oficiais</strong>
          <a href="https://sucupira.capes.gov.br/" target="_blank" rel="noreferrer">
            Plataforma Sucupira
          </a>
          <a href="https://www.gov.br/capes/pt-br" target="_blank" rel="noreferrer">
            CAPES
          </a>
          <a href="https://www.gov.br/cnpq/pt-br" target="_blank" rel="noreferrer">
            CNPq
          </a>
        </div>
        <div>
          <strong>Sobre este guia</strong>
          <p>
            Lista inicial e não exaustiva. Confirme sempre as informações no site da instituição.
          </p>
          <button
            type="button"
            className="footer-link"
            onClick={() => {
              setTab("ajuda");
              window.scrollTo(0, 0);
            }}
          >
            Sobre e ajuda
          </button>
          <button type="button" className="footer-link" onClick={() => setShowApoio(true)}>
            Apoie o projeto
          </button>
        </div>
      </footer>
    </div>
  );
}
