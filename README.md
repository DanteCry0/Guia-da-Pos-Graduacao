# PósGuia

Guia de pós-graduação: cursos por área e subárea, editais com prazo, programas CAPES com nota, quiz de indicação e guia de escolha.

React 19 + Vite 8 + Tailwind CSS 4. Gerenciador de pacotes: pnpm.

## Rodar no computador

```bash
pnpm install
pnpm dev        # abre em http://localhost:8443
pnpm build      # gera a pasta dist/
```

Requer Node 22.12 ou mais novo.

## Publicar na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. A Vercel detecta o Vite sozinha. Confirme: **Build Command** `pnpm build` e **Output Directory** `dist`.
4. Clique em **Deploy**. A cada `git push` na branch principal, o site é publicado de novo.

## Onde editar

| O que | Onde |
| --- | --- |
| Cursos e instituições | `src/App.tsx` (`institutions` e `courseRows`) |
| Editais (nome, datas, link) | `src/App.tsx` (`calls`). O status é calculado pela data de hoje |
| Quiz | `src/Quiz.tsx` |
| Programas CAPES com nota | `src/Programas.tsx` e `public/data/programas.json` |
| Título, descrição e idioma do site | `.figma/make/site.json` |

## Atualizar os programas CAPES

Os programas e notas vêm da API oficial do Portal de Dados Abertos da CAPES (CKAN, conjunto "Programas da Pós-Graduação Stricto Sensu do Brasil").

```bash
pnpm atualizar-programas
```

O comando grava `public/data/programas.json`. Ele também roda sozinho antes de cada `pnpm build` (inclusive na Vercel). Se a API estiver fora do ar, o build continua com o arquivo que já estava no repositório. Para atualizar o site, basta fazer um novo deploy.

- Para usar outro ano ou arquivo da CAPES, defina `CAPES_RESOURCE_ID` com o novo identificador do recurso.
- Alternativa sem API: `python3 scripts/atualizar-programas.py arquivo.csv` converte um CSV baixado.

## Observações

- O `.gitattributes` da raiz manda imagens para o Git LFS. O de `public/` exclui o `favicon.png` dessa regra, então mantenha os dois. Se for adicionar outras imagens, use arquivos pequenos fora do LFS ou ative o LFS na Vercel.
- Os prazos e links dos editais devem ser conferidos nos editais oficiais.
- A pasta `.figma/` e os arquivos `AGENTS.md` e `CLAUDE.md` vêm do Figma Make. Pode mantê-los.
