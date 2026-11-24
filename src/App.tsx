import { useMemo, useState } from "react";
import Programas from "./Programas";
import Quiz from "./Quiz";
import editais from "./data/editais.json";
import { notaFor, relatedProgs, usePrograms } from "./programs";

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

const institutions: Record<string, [string, string, "Pública" | "Privada", string]> = {
  usp: ["USP", "SP", "Pública", "https://www.prpg.usp.br/"],
  unicamp: ["Unicamp", "SP", "Pública", "https://www.pg.unicamp.br/"],
  ufscar: ["UFSCar", "SP", "Pública", "https://www.propg.ufscar.br/"],
  ita: ["ITA", "SP", "Pública", "https://www.ita.br/"],
  inpe: ["INPE", "SP", "Pública", "https://www.gov.br/inpe/pt-br"],
  ufrj: ["UFRJ", "RJ", "Pública", "https://pr2.ufrj.br/"],
  uff: ["UFF", "RJ", "Pública", "https://www.uff.br/"],
  uerj: ["UERJ", "RJ", "Pública", "https://iesp.uerj.br/pos-graduacao/selecao/"],
  ufmg: ["UFMG", "MG", "Pública", "https://www.ufmg.br/prpg/"],
  ufu: ["UFU", "MG", "Pública", "https://www.ufu.br/"],
  ufrgs: ["UFRGS", "RS", "Pública", "https://www.ufrgs.br/propg/"],
  unipampa: ["Unipampa", "RS", "Pública", "https://unipampa.edu.br/"],
  ufsc: ["UFSC", "SC", "Pública", "https://propg.ufsc.br/"],
  unb: ["UnB", "DF", "Pública", "https://dpg.unb.br/"],
  ufpe: ["UFPE", "PE", "Pública", "https://www.ufpe.br/propg"],
  ufba: ["UFBA", "BA", "Pública", "https://propg.ufba.br/"],
  fgv: ["FGV", "SP", "Privada", "https://portal.fgv.br/"],
  insper: ["Insper", "SP", "Privada", "https://www.insper.edu.br/"],
  fia: ["FIA Business School", "SP", "Privada", "https://fia.com.br/"],
  pucrio: ["PUC-Rio", "RJ", "Privada", "https://www.puc-rio.br/"],
  pucrs: ["PUCRS", "RS", "Privada", "https://portal.pucrs.br/"],
};

const levelNames: Record<string, string> = {
  M: "Mestrado",
  D: "Doutorado",
  E: "Especialização",
  B: "MBA",
};
const duration: Record<string, string> = {
  M: "até 24 meses",
  D: "até 48 meses",
  E: "mín. 360 horas",
  B: "mín. 360 horas",
};

type Course = {
  id: number;
  institution: string;
  name: string;
  levels: string;
  area: string;
  subarea: string;
  mode: string;
  link?: string;
};

const courseRows: Array<[string, string, string, string, string, string?, string?]> = [
  ["usp", "Direito (Faculdade de Direito)", "MD", "Ciências Sociais Aplicadas", "Direito"],
  ["unb", "Direito", "MD", "Ciências Sociais Aplicadas", "Direito"],
  ["ufsc", "Direito", "MD", "Ciências Sociais Aplicadas", "Direito"],
  ["ufrj", "Direito", "MD", "Ciências Sociais Aplicadas", "Direito"],
  ["uff", "Direito", "MD", "Ciências Sociais Aplicadas", "Direito"],
  ["pucrio", "Direito", "MD", "Ciências Sociais Aplicadas", "Direito"],
  [
    "fgv",
    "Direito e Desenvolvimento (FGV Direito SP)",
    "M",
    "Ciências Sociais Aplicadas",
    "Direito",
  ],
  [
    "usp",
    "Ciências de Computação e Matemática Computacional (ICMC)",
    "MD",
    "Ciências Exatas",
    "Computação",
  ],
  [
    "unicamp",
    "Ciência da Computação (Instituto de Computação)",
    "MD",
    "Ciências Exatas",
    "Computação",
  ],
  ["ufmg", "Ciência da Computação", "MD", "Ciências Exatas", "Computação"],
  ["ufpe", "Ciência da Computação (CIn)", "MD", "Ciências Exatas", "Computação"],
  ["ufrgs", "Computação", "MD", "Ciências Exatas", "Computação"],
  ["ufrj", "Engenharia de Sistemas e Computação (COPPE)", "MD", "Ciências Exatas", "Computação"],
  ["unipampa", "Computação Aplicada (Bagé)", "M", "Ciências Exatas", "Computação"],
  ["inpe", "Meteorologia", "MD", "Ciências Exatas", "Meteorologia"],
  ["ufrgs", "Ensino de Matemática", "MD", "Ciências Humanas", "Educação"],
  ["usp", "Educação (Faculdade de Educação)", "MD", "Ciências Humanas", "Educação"],
  ["unicamp", "Educação (Faculdade de Educação)", "MD", "Ciências Humanas", "Educação"],
  ["ufba", "Educação", "MD", "Ciências Humanas", "Educação"],
  [
    "ufmg",
    "Educação: Conhecimento e Inclusão Social",
    "MD",
    "Ciências Humanas",
    "Educação",
    "Presencial",
    "https://www.posgrad.fae.ufmg.br/",
  ],
  [
    "ufmg",
    "Mestrado Profissional em Educação e Docência",
    "M",
    "Ciências Humanas",
    "Educação",
    "Presencial",
    "https://selecao.promestre.fae.ufmg.br/",
  ],
  ["ufsc", "Antropologia Social", "M", "Ciências Humanas", "Ciências Sociais"],
  ["uerj", "Ciência Política e Sociologia (IESP)", "D", "Ciências Humanas", "Ciências Sociais"],
  [
    "unicamp",
    "Divulgação Científica e Cultural (Labjor)",
    "MD",
    "Ciências Humanas",
    "Comunicação",
    "Presencial",
    "https://www.labjor.unicamp.br/",
  ],
  ["pucrs", "Comunicação Social", "MD", "Ciências Sociais Aplicadas", "Comunicação"],
  ["uff", "Ciência da Informação", "MD", "Ciências Sociais Aplicadas", "Ciência da Informação"],
  ["ufu", "Relações Internacionais", "MD", "Ciências Sociais Aplicadas", "Relações Internacionais"],
  ["ufu", "Estudos Linguísticos", "MD", "Linguística, Letras e Artes", "Linguística"],
  ["ufscar", "Terapia Ocupacional", "MD", "Saúde", "Terapia Ocupacional"],
  ["ita", "Engenharia Aeronáutica e Mecânica", "MD", "Engenharias", "Engenharia Aeroespacial"],
  ["unipampa", "Engenharia Elétrica (Alegrete)", "M", "Engenharias", "Engenharia Elétrica"],
  ["unipampa", "Engenharia (Alegrete)", "MD", "Engenharias", "Engenharia"],
  [
    "usp",
    "MBA USP/Esalq",
    "B",
    "Ciências Sociais Aplicadas",
    "Administração",
    "EAD",
    "https://mbauspesalq.com/",
  ],
  [
    "fgv",
    "MBAs e especializações FGV",
    "EB",
    "Ciências Sociais Aplicadas",
    "Administração",
    "Presencial / EAD",
  ],
  [
    "insper",
    "MBAs e especializações Insper",
    "EB",
    "Ciências Sociais Aplicadas",
    "Administração",
    "Presencial / EAD",
  ],
  [
    "fia",
    "MBAs e especializações FIA",
    "EB",
    "Ciências Sociais Aplicadas",
    "Administração",
    "Presencial / EAD",
  ],
];

const courses: Course[] = courseRows.map((c, id) => ({
  id,
  institution: c[0],
  name: c[1],
  levels: c[2],
  area: c[3],
  subarea: c[4],
  mode: c[5] || "Presencial",
  link: c[6],
}));

type Call = {
  name: string;
  org: string;
  level: string;
  area: string;
  start?: string;
  end: string;
  detail: string;
  url: string;
  fonte?: string;
};

// Os editais ficam em src/data/editais.json (fácil de editar).
const calls = editais as unknown as Call[];

const areas = [...new Set(courses.map((c) => c.area))].sort();
const states = [...new Set(Object.values(institutions).map((i) => i[1]))].sort();
const callAreas = [...new Set(calls.map((c) => c.area))].sort();

const norm = (s: string) =>
  s
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d} ${months[Number(m) - 1]} ${y}`;
};
const parseDay = (iso: string, endOfDay = false) => {
  const [y, m, d] = iso.split("-").map(Number);
  return endOfDay ? new Date(y, m - 1, d, 23, 59, 59) : new Date(y, m - 1, d);
};
type CallStatus = "ab" | "prog" | "enc";
const statusOrder: Record<CallStatus, number> = { ab: 0, prog: 1, enc: 2 };
function callState(c: Call, now: Date) {
  const end = parseDay(c.end, true);
  const status: CallStatus = c.start && now < parseDay(c.start) ? "prog" : now > end ? "enc" : "ab";
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((parseDay(c.end).getTime() - today.getTime()) / 864e5);
  return { status, days, soon: status === "ab" && days <= 7 };
}

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
  const [tab, setTab] = useState<"cursos" | "editais" | "guia" | "programas" | "quiz">("cursos");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [area, setArea] = useState("");
  const [state, setState] = useState("");
  const [mode, setMode] = useState("");
  const [type, setType] = useState("");
  const [sub, setSub] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const [callArea, setCallArea] = useState("");
  const [callQuery, setCallQuery] = useState("");
  const [sort, setSort] = useState("Relevância");
  const [saved, setSaved] = useState<number[]>([]);
  const [onlySaved, setOnlySaved] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query
      .toLocaleLowerCase("pt-BR")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
    return courses
      .filter((c) => {
        const inst = institutions[c.institution];
        const haystack = `${c.name} ${inst[0]} ${c.area} ${c.subarea}`
          .toLocaleLowerCase("pt-BR")
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "");
        return (
          (!q || haystack.includes(q)) &&
          (!level || c.levels.includes(level)) &&
          (!area || c.area === area) &&
          (!sub || c.subarea === sub) &&
          (!state || inst[1] === state) &&
          (!mode || c.mode.includes(mode)) &&
          (!type || inst[2] === type) &&
          (!onlySaved || saved.includes(c.id))
        );
      })
      .sort((a, b) => (sort === "Nome A–Z" ? a.name.localeCompare(b.name) : 0));
  }, [query, level, area, sub, state, mode, type, onlySaved, saved, sort]);

  const subareas = useMemo(
    () => [...new Set(courses.filter((c) => !area || c.area === area).map((c) => c.subarea))].sort(),
    [area],
  );
  const progs = usePrograms();
  const related = useMemo(() => {
    if (!progs || !(area || sub) || level === "E" || level === "B") return [];
    return relatedProgs(progs, area, sub, courses)
      .filter((p) => !state || p.uf === state)
      .sort((a, b) => b.nota - a.nota || a.n.localeCompare(b.n, "pt-BR"))
      .slice(0, 8);
  }, [progs, area, sub, level, state]);
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
        (!callStatus || c.status === callStatus) &&
        (!callArea || c.area === callArea) &&
        (!callQuery || norm(`${c.name} ${c.org}`).includes(norm(callQuery))),
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
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                className={tab === id ? "active" : ""}
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
                  <p>
                    <strong>{filtered.length}</strong>{" "}
                    {filtered.length === 1 ? "curso encontrado" : "cursos encontrados"}
                    {onlySaved && " nos seus salvos"}
                  </p>
                  <label>
                    Ordenar por{" "}
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option>Relevância</option>
                      <option>Nome A–Z</option>
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
                <div className="course-list">
                  {filtered.map((course) => {
                    const inst = institutions[course.institution];
                    const isSaved = saved.includes(course.id);
                    const nota = notaFor(course.name, course.levels, inst[0], progs);
                    return (
                      <article className="course-card" key={course.id}>
                        <div className="institution-avatar">
                          {inst[0].slice(0, 3).toUpperCase()}
                        </div>
                        <div className="course-body">
                          <div className="card-topline">
                            <span>
                              {inst[0]} · {inst[2]}
                            </span>
                            <button
                              className={isSaved ? "heart-button saved" : "heart-button"}
                              onClick={() =>
                                setSaved(
                                  isSaved
                                    ? saved.filter((x) => x !== course.id)
                                    : [...saved, course.id],
                                )
                              }
                              aria-label={isSaved ? "Remover dos salvos" : "Salvar curso"}
                            >
                              <Icon name="heart" size={20} filled={isSaved} />
                            </button>
                          </div>
                          <h3>{course.name}</h3>
                          <div className="pills">
                            {course.levels.split("").map((l) => (
                              <span className="level-pill" key={l}>
                                {levelNames[l]}
                              </span>
                            ))}
                            <span>{course.subarea}</span>
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
                        </div>
                        <a
                          className="details-button"
                          href={course.link || inst[3]}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver detalhes <Icon name="arrow" size={17} />
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
                </div>
                {related.length > 0 && (
                  <div className="related-box">
                    <h3>Programas reconhecidos pela CAPES{sub ? ` em ${sub}` : ` em ${area}`}</h3>
                    <div className="prog-grid">
                      {related.map((p, i) => (
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
                              {p.a} · {p.m}
                            </small>
                          </div>
                        </article>
                      ))}
                    </div>
                    <button className="more-btn" onClick={() => setTab("programas")}>
                      Ver todos os programas CAPES
                    </button>
                  </div>
                )}
              </section>
            </div>
          </main>
        </>
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
                    {call.fonte && <small className="call-source">Fonte: {call.fonte}</small>}
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
        </div>
      </footer>
    </div>
  );
}
