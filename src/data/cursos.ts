import { canonSub, gaOf } from "../lib/areas.ts";

export const institutions: Record<string, [string, string, "Pública" | "Privada", string]> = {
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

export const levelNames: Record<string, string> = {
  M: "Mestrado",
  D: "Doutorado",
  E: "Especialização",
  B: "MBA",
};
export const duration: Record<string, string> = {
  M: "até 24 meses",
  D: "até 48 meses",
  E: "mín. 360 horas",
  B: "mín. 360 horas",
};

export type Course = {
  id: number;
  key: string; // chave estável, usada em favoritos e comparação
  institution: string;
  name: string;
  levels: string;
  area: string;
  subarea: string;
  mode: string;
  link?: string;
  capes?: boolean; // programa vindo dos dados abertos da CAPES
  lvKnown?: boolean; // a CAPES informou se o programa é de mestrado e/ou doutorado
  nota?: string;
  sg?: string;
  ie?: string;
  uf?: string;
  tipo?: string;
  prog?: string;
};

export const courseRows: Array<[string, string, string, string, string, string?, string?]> = [
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

const SUB_FIX: Record<string, string> = {
  "Antropologia Social": "Antropologia / Arqueologia",
  "Ciência Política e Sociologia (IESP)": "Sociologia",
  "Ensino de Matemática": "Ensino",
};
export const courses: Course[] = courseRows.map((c, id) => {
  const subarea = SUB_FIX[c[1]] ?? canonSub(c[4]);
  return { id, key: `c:${c[0]}:${c[1]}`, institution: c[0], name: c[1], levels: c[2], area: gaOf(subarea) ?? c[3], subarea, mode: c[5] || "Presencial", link: c[6] };
});
export const instOf = (c: Course): [string, string, string, string] =>
  c.capes ? [c.sg || c.ie || "", c.uf || "", c.tipo || "", c.link || ""] : institutions[c.institution];
