// Baixa os programas de pós-graduação stricto sensu da API CKAN do Portal de Dados Abertos
// da CAPES e grava public/data/programas.json (só programas com nota 3 a 7 em funcionamento).
//   pnpm atualizar-programas
// Variáveis opcionais: CAPES_RESOURCE_ID (outro ano/arquivo) e CAPES_API (outra URL base).
import { writeFileSync, existsSync } from "node:fs";

const API = process.env.CAPES_API || "https://dadosabertos.capes.gov.br/api/3/action/datastore_search";
const RESOURCE = process.env.CAPES_RESOURCE_ID || "7ba1e10d-d3af-4e42-bf0f-f7436af63c80";
const OUT = "public/data/programas.json";
const LIMIT = 5000;

const COLS = {
  n: ["NM_PROGRAMA_IES", "NM_PROGRAMA"], ie: ["NM_ENTIDADE_ENSINO"], sg: ["SG_ENTIDADE_ENSINO"],
  uf: ["SG_UF_PROGRAMA"], a: ["NM_AREA_AVALIACAO"], m: ["NM_MODALIDADE_PROGRAMA"],
  nota: ["CD_CONCEITO_PROGRAMA"], id: ["CD_PROGRAMA_IES"], ano: ["AN_BASE"], sit: ["DS_SITUACAO_PROGRAMA"],
};
const MINUSCULAS = new Set(["da", "de", "do", "das", "dos", "e", "em", "para", "a", "o", "no", "na"]);
const title = (s) =>
  s
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|[\s(/-])(\p{L}+)/gu, (_, a, w) => (a && MINUSCULAS.has(w) ? a + w : a + w[0].toLocaleUpperCase("pt-BR") + w.slice(1)));

async function main() {
  const records = [];
  let total = Infinity;
  while (records.length < total) {
    const res = await fetch(`${API}?resource_id=${RESOURCE}&limit=${LIMIT}&offset=${records.length}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`A API respondeu HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error("A API respondeu com erro: " + JSON.stringify(json.error));
    total = json.result.total;
    if (!json.result.records.length) break;
    records.push(...json.result.records);
  }
  if (!records.length) throw new Error("A API não devolveu registros.");

  const keys = Object.keys(records[0]);
  const find = (names) => keys.find((k) => names.includes(k.toUpperCase()));
  const col = Object.fromEntries(Object.entries(COLS).map(([k, v]) => [k, find(v)]));
  const faltam = ["n", "ie", "uf", "a", "nota"].filter((k) => !col[k]);
  if (faltam.length) throw new Error(`Colunas não encontradas (${faltam}). Colunas da API: ${keys.join(", ")}`);
  const g = (r, k) => (col[k] && r[col[k]] != null ? String(r[col[k]]).trim() : "");

  const recentes = new Map();
  for (const r of records) {
    const chave = g(r, "id") || g(r, "n") + g(r, "ie");
    const atual = recentes.get(chave);
    if (!atual || g(r, "ano") >= g(atual, "ano")) recentes.set(chave, r);
  }
  const out = [];
  for (const r of recentes.values()) {
    const nota = g(r, "nota");
    if (!/^[3-7]$/.test(nota)) continue;
    if (col.sit && !g(r, "sit").normalize("NFD").toUpperCase().includes("FUNCIONAMENTO")) continue;
    out.push({ n: title(g(r, "n")), ie: g(r, "ie"), sg: g(r, "sg"), uf: g(r, "uf"), a: title(g(r, "a")), m: title(g(r, "m")), nota: Number(nota) });
  }
  if (!out.length) throw new Error(`Nenhum programa com nota 3 a 7 em ${records.length} registros. Colunas: ${keys.join(", ")}`);
  out.sort((a, b) => b.nota - a.nota || a.n.localeCompare(b.n, "pt-BR"));
  writeFileSync(OUT, JSON.stringify(out));
  console.log(`${out.length} programas gravados em ${OUT} (de ${records.length} registros).`);
}

main().catch((e) => {
  console.error("Não foi possível atualizar os programas:", e.message);
  console.error(existsSync(OUT) ? "Mantendo o arquivo atual." : "Nenhum arquivo anterior.");
  process.exit(1);
});
