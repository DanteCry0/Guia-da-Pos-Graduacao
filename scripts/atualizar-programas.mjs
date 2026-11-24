// Baixa os programas de pós-graduação stricto sensu do Portal de Dados Abertos da CAPES (CKAN)
// e grava public/data/programas.json (só programas com nota 3 a 7 em funcionamento).
//   node scripts/atualizar-programas.mjs
// Ordem: 1) DataStore do recurso conhecido; 2) se não existir, procura o conjunto de dados
// "Programas da Pós-Graduação Stricto Sensu" e usa o recurso mais recente (DataStore ou CSV).
// Variáveis opcionais: CAPES_RESOURCE_ID e CAPES_BASE.
import { writeFileSync, existsSync } from "node:fs";

const BASE = process.env.CAPES_BASE || "https://dadosabertos.capes.gov.br/api/3/action";
const RESOURCE = process.env.CAPES_RESOURCE_ID || "7ba1e10d-d3af-4e42-bf0f-f7436af63c80";
const OUT = "public/data/programas.json";
const LIMIT = 5000;
const HEADERS = { Accept: "application/json, text/csv, */*", "User-Agent": "Mozilla/5.0 (compatible; PosGuia/1.0)" };
const COLS = {
  n: ["NM_PROGRAMA_IES", "NM_PROGRAMA"], ie: ["NM_ENTIDADE_ENSINO"], sg: ["SG_ENTIDADE_ENSINO"],
  uf: ["SG_UF_PROGRAMA"], a: ["NM_AREA_AVALIACAO"], m: ["NM_MODALIDADE_PROGRAMA"],
  nota: ["CD_CONCEITO_PROGRAMA"], dep: ["DS_DEPENDENCIA_ADMINISTRATIVA", "CS_STATUS_JURIDICO"], mu: ["NM_MUNICIPIO_PROGRAMA_IES"], id: ["CD_PROGRAMA_IES"], ano: ["AN_BASE"], sit: ["DS_SITUACAO_PROGRAMA"],
};
const MINUSCULAS = new Set(["da", "de", "do", "das", "dos", "e", "em", "para", "a", "o", "no", "na"]);
const title = (s) =>
  s.toLocaleLowerCase("pt-BR").replace(/(^|[\s(/-])(\p{L}+)/gu, (_, a, w) => (a && MINUSCULAS.has(w) ? a + w : a + w[0].toLocaleUpperCase("pt-BR") + w.slice(1))).replace(/\b(Ii|Iii|Iv)\b/g, (m) => m.toUpperCase());
const norm = (s) => String(s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const anoMax = (s) => Math.max(0, ...(String(s ?? "").match(/20\d\d/g) || []).map(Number));

async function get(url, binario = false) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} em ${url} :: ${(await res.text()).slice(0, 200)}`);
  return binario ? Buffer.from(await res.arrayBuffer()) : res.json();
}

async function viaDatastore(id) {
  const records = [];
  let total = Infinity;
  while (records.length < total) {
    const j = await get(`${BASE}/datastore_search?resource_id=${id}&limit=${LIMIT}&offset=${records.length}`);
    if (!j.success) throw new Error("A API respondeu com erro: " + JSON.stringify(j.error));
    total = j.result.total;
    if (!j.result.records.length) break;
    records.push(...j.result.records);
  }
  return records;
}

function parseCsv(t) {
  const l1 = t.split("\n", 1)[0];
  const d = (l1.match(/;/g) || []).length > (l1.match(/,/g) || []).length ? ";" : ",";
  const rows = [];
  let row = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === d) { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f.replace(/\r$/, "")); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f || row.length) { row.push(f.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

async function viaCsv(url) {
  const buf = await get(url, true);
  let texto;
  try { texto = new TextDecoder("utf-8", { fatal: true }).decode(buf); } catch { texto = new TextDecoder("latin1").decode(buf); }
  const rows = parseCsv(texto.replace(/^\uFEFF/, ""));
  const head = rows.shift().map((h) => h.trim());
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

async function descobrir() {
  const j = await get(`${BASE}/package_search?q=${encodeURIComponent("programas pós-graduação stricto sensu")}&rows=100`);
  const todos = j.result.results;
  const pacotes = todos.filter((p) => /^(\[.*?\]\s*)?programas da pos-graduacao stricto sensu/.test(norm(p.title)));
  console.log(`Conjuntos de dados encontrados (${todos.length} na busca, ${pacotes.length} de programas):`);
  (pacotes.length ? pacotes : todos.slice(0, 15)).forEach((p) => console.log(` - ${p.title} [${p.name}]`));
  pacotes.sort((a, b) => anoMax(b.title) - anoMax(a.title) || String(b.metadata_modified).localeCompare(String(a.metadata_modified)));
  for (const p of pacotes) {
    const rs = (p.resources || [])
      .filter((r) => /csv/i.test(r.format || "") || /\.csv/i.test(r.url || ""))
      .sort((a, b) => anoMax(b.name + b.url) - anoMax(a.name + a.url) || String(b.last_modified).localeCompare(String(a.last_modified)));
    for (const r of rs) {
      console.log(`Tentando: ${p.title} :: ${r.name} (${r.id}) datastore_ativo=${r.datastore_active} ${r.url}`);
      try {
        const dados = r.datastore_active ? await viaDatastore(r.id) : await viaCsv(r.url);
        if (dados.length) return dados;
      } catch (e) {
        console.log("  falhou:", e.message);
      }
    }
  }
  throw new Error("Não encontrei um arquivo de programas utilizável na CAPES.");
}

async function main() {
  let records;
  try {
    records = await viaDatastore(RESOURCE);
    console.log(`DataStore do recurso ${RESOURCE}: ${records.length} registros.`);
  } catch (e) {
    console.log(`Recurso ${RESOURCE} indisponível no DataStore (${e.message.slice(0, 120)}). Procurando o conjunto de dados...`);
    records = await descobrir();
  }
  if (!records.length) throw new Error("Nenhum registro recebido.");

  const keys = Object.keys(records[0]);
  const find = (names) => keys.find((k) => names.includes(k.trim().toUpperCase()));
  const col = Object.fromEntries(Object.entries(COLS).map(([k, v]) => [k, find(v)]));
  const faltam = ["n", "ie", "uf", "a", "nota"].filter((k) => !col[k]);
  if (faltam.length) throw new Error(`Colunas não encontradas (${faltam}). Colunas do arquivo: ${keys.join(", ")}`);
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
    if (col.sit && !norm(g(r, "sit")).includes("funcionamento")) continue;
    const dep = norm(g(r, "dep"));
    const item = { n: title(g(r, "n")), ie: g(r, "ie"), sg: g(r, "sg"), uf: g(r, "uf"), a: title(g(r, "a")), m: title(g(r, "m")), nota: Number(nota) };
    if (dep) item.t = dep.includes("priv") ? "Privada" : "Pública";
    if (g(r, "mu")) item.mu = title(g(r, "mu"));
    out.push(item);
  }
  if (!out.length) throw new Error(`Nenhum programa com nota 3 a 7 em ${records.length} registros. Colunas: ${keys.join(", ")}`);
  out.sort((a, b) => b.nota - a.nota || a.n.localeCompare(b.n, "pt-BR"));
  writeFileSync(OUT, JSON.stringify(out));
  console.log(`${out.length} programas gravados em ${OUT} (de ${records.length} registros).`);
}

main().catch((e) => {
  console.error("Não foi possível atualizar os programas:", e.message);
  if (e.cause) console.error("Causa:", e.cause.code || "", e.cause.message || e.cause);
  console.error(existsSync(OUT) ? "Mantendo o arquivo atual." : "Nenhum arquivo anterior.");
  process.exit(1);
});
