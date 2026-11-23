#!/usr/bin/env python3
"""Gera public/data/programas.json a partir do CSV de Programas da Pós-Graduação
Stricto Sensu do Portal de Dados Abertos da CAPES (dadosabertos.capes.gov.br,
conjunto "Programas da Pós-Graduação Stricto Sensu do Brasil").

Uso:  python3 scripts/atualizar-programas.py caminho/do/arquivo.csv
Rode de novo quando a CAPES publicar um arquivo novo.
"""
import csv, json, sys, unicodedata

COLS = {  # campo -> nomes possíveis da coluna no CSV
    "n": ["NM_PROGRAMA_IES", "NM_PROGRAMA"], "ie": ["NM_ENTIDADE_ENSINO"], "sg": ["SG_ENTIDADE_ENSINO"],
    "uf": ["SG_UF_PROGRAMA"], "a": ["NM_AREA_AVALIACAO"], "m": ["NM_MODALIDADE_PROGRAMA"],
    "nota": ["CD_CONCEITO_PROGRAMA"], "id": ["CD_PROGRAMA_IES"], "ano": ["AN_BASE"], "sit": ["DS_SITUACAO_PROGRAMA"],
}
def abrir(path):
    for enc in ("utf-8-sig", "latin-1"):
        try:
            open(path, encoding=enc).read(200000); return open(path, encoding=enc, newline="")
        except UnicodeDecodeError: pass
    sys.exit("Não consegui ler a codificação do arquivo.")
if len(sys.argv) < 2: sys.exit(__doc__)
f = abrir(sys.argv[1]); head = f.readline(); f.seek(0)
rd = csv.DictReader(f, delimiter=";" if head.count(";") > head.count(",") else ",")
cols = {k: next((c for c in v if c in rd.fieldnames), None) for k, v in COLS.items()}
falta = [k for k in ("n", "ie", "uf", "a", "nota") if not cols[k]]
if falta: sys.exit(f"Colunas não encontradas para {falta}. Colunas do arquivo: {rd.fieldnames}")
g = lambda r, k: (r.get(cols[k]) or "").strip() if cols[k] else ""
mais_recente = {}
for r in rd:
    chave = g(r, "id") or (g(r, "n") + g(r, "ie"))
    if chave not in mais_recente or g(r, "ano") >= g(mais_recente[chave], "ano"): mais_recente[chave] = r
out = []
for r in mais_recente.values():
    nota = g(r, "nota")
    if not nota.isdigit() or not 3 <= int(nota) <= 7: continue
    if cols["sit"] and "FUNCIONAMENTO" not in unicodedata.normalize("NFD", g(r, "sit")).upper(): continue
    out.append({"n": g(r, "n").title(), "ie": g(r, "ie"), "sg": g(r, "sg"), "uf": g(r, "uf"),
                "a": g(r, "a").title(), "m": g(r, "m").title(), "nota": int(nota)})
out.sort(key=lambda p: (-p["nota"], p["n"]))
json.dump(out, open("public/data/programas.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(out)} programas gravados em public/data/programas.json")
