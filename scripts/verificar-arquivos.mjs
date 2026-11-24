// Confere se os arquivos do projeto estão em UTF-8 SEM "BOM" e se os JSON são válidos.
// O BOM é um marcador invisível que alguns editores do Windows (Bloco de Notas, por exemplo) gravam
// no começo do arquivo e que faz o pnpm e o Vercel falharem com "Invalid package.json".
//   node scripts/verificar-arquivos.mjs            só confere
//   node scripts/verificar-arquivos.mjs --corrigir  remove o BOM dos arquivos afetados
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const corrigir = process.argv.includes("--corrigir");
const RAIZ = [
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "index.html",
  ".mise.toml",
  ".gitignore",
  ".gitattributes",
  "pnpm-lock.yaml",
];
const PASTAS = ["src", "tests", "scripts", "public/data", ".github", ".figma"];
const EXT = new Set([
  ".json",
  ".ts",
  ".tsx",
  ".mjs",
  ".css",
  ".html",
  ".yml",
  ".yaml",
  ".md",
  ".toml",
  ".py",
  ".txt",
]);

function listar(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) listar(p, out);
    else if (EXT.has(extname(nome))) out.push(p);
  }
  return out;
}

const arquivos = [...RAIZ.filter(existsSync), ...PASTAS.flatMap((d) => listar(d))];
const problemas = [];
for (const arq of arquivos) {
  let buf = readFileSync(arq);
  const temBom = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  if (temBom) {
    if (corrigir) {
      buf = buf.subarray(3);
      writeFileSync(arq, buf);
      console.log(`Corrigido (BOM removido): ${arq}`);
    } else problemas.push(`${arq}: começa com BOM (marca invisível do Windows)`);
  }
  if (extname(arq) === ".json") {
    try {
      JSON.parse(buf.toString("utf8"));
    } catch (e) {
      problemas.push(`${arq}: JSON inválido (${e.message})`);
    }
  }
}

if (problemas.length) {
  console.error("Problemas encontrados:\n - " + problemas.join("\n - "));
  console.error(
    "\nComo resolver: abra o arquivo no editor do GitHub (lápis) e cole o conteúdo de novo, ou rode: node scripts/verificar-arquivos.mjs --corrigir",
  );
  process.exit(1);
}
console.log(`Arquivos OK (${arquivos.length} conferidos, sem BOM e com JSON válido).`);
