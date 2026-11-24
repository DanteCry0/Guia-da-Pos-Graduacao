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

| O que                              | Onde                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Cursos e instituições              | `src/data/cursos.ts` (`institutions` e `courseRows`)                   |
| Editais (nome, datas, link)        | `src/data/editais.json`. O status é calculado por `src/lib/editais.ts` |
| Quiz                               | `src/Quiz.tsx`                                                         |
| Programas CAPES com nota           | `src/Programas.tsx` e `public/data/programas.json`                     |
| Título, descrição e idioma do site | `.figma/make/site.json`                                                |

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

## Atualização automática dos programas

O workflow `.github/workflows/atualizar-programas.yml` roda toda segunda-feira e também sob demanda (aba **Actions → Atualizar programas CAPES → Run workflow**). Ele baixa os dados da CAPES, salva `public/data/programas.json` e a Vercel publica de novo. Em caso de erro, o log do workflow mostra o motivo.

## Como adicionar ou editar um edital

Abra `src/data/editais.json` no GitHub (lápis) e copie um bloco `{ ... }` existente. Campos:

| Campo        | Exemplo                  | Observação                                                                  |
| ------------ | ------------------------ | --------------------------------------------------------------------------- |
| `name`       | `"Engenharia Elétrica"`  | nome do programa                                                            |
| `org`        | `"UFMA"`                 | instituição                                                                 |
| `level`      | `"Mestrado e Doutorado"` | texto livre                                                                 |
| `area`       | `"Engenharias"`          | usa-se no filtro de área                                                    |
| `start`      | `"2026-11-03"`           | abertura (AAAA-MM-DD); opcional, se não souber                              |
| `end`        | `"2026-12-04"`           | último dia de inscrição (AAAA-MM-DD)                                        |
| `detail`     | `"45 vagas..."`          | resumo curto                                                                |
| `url`        | `"https://..."`          | link do edital                                                              |
| `fonte`      | `"UFMA (oficial)"`       | de onde veio a informação                                                   |
| `verificado` | `"2026-11-23"`           | dia em que você conferiu prazo e link; o site avisa quando passa de 14 dias |

O status (aberto, programado, encerrado) e o aviso de "vence em N dias" são calculados sozinhos. Mantenha as vírgulas entre os blocos e confira as datas no edital oficial.

## Estrutura do código

| Pasta ou arquivo                                       | Função                                                                  |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `src/App.tsx`                                          | telas e navegação                                                       |
| `src/Quiz.tsx`, `src/Programas.tsx`, `src/Compare.tsx` | quiz, programas CAPES e comparação de cursos                            |
| `src/data/`                                            | dados editáveis: `cursos.ts` e `editais.json`                           |
| `src/lib/`                                             | regras sem React (áreas, notas, status de editais), cobertas por testes |
| `tests/`                                               | testes automáticos                                                      |

## Testes e verificação

```bash
pnpm test        # roda os testes (Node 22.18 ou mais novo)
pnpm typecheck   # confere os tipos
pnpm verificar   # confere se os arquivos estão sem BOM e com JSON válido
```

O workflow `.github/workflows/ci.yml` roda tipos, testes e build a cada push. Os testes também validam os dados: um edital com data inexistente, link sem `https://` ou duplicado faz o teste falhar e avisa qual linha corrigir.

## Links compartilháveis

A aba e os filtros de Explorar cursos ficam na URL (`?aba=cursos&area=...&sub=...&uf=SP&nivel=M&modo=EAD&tipo=Pública&ordem=...&salvos=1&q=...`). O botão **Copiar link da busca** copia o endereço atual. No Quiz, **Copiar link do resultado** gera um link que reabre o resultado.

## Favoritos e comparação

Os cursos salvos ficam no navegador de quem usa (`localStorage`, chave `posguia:salvos`). A comparação aceita até 3 cursos e não é salva.

## Editais: lembrete, reporte e limpeza

- Cada edital aberto ou programado tem **Lembrete no Google Agenda** e **Baixar .ics** (evento no último dia de inscrição, com alerta 3 dias antes).
- **Informar erro** e **Sugira por e-mail** abrem o e-mail já preenchido. O endereço de destino fica em `src/config.ts` (`CONTACT_EMAIL`).
- Editais encerrados há mais de 30 dias saem da lista padrão e continuam em **Situação: Encerrados**.

## Sobre e ajuda, Pix e QR Code

A aba **Sobre e ajuda** (`src/Ajuda.tsx`) reúne FAQ, fontes dos dados, contato e o bloco de apoio (`src/Apoio.tsx`). O mesmo bloco abre em uma janela pelo link **Apoie o projeto** no rodapé.

- **Dados de pagamento:** `src/config.ts` (`PIX_KEY`, `PIX_NAME`, `PIX_CITY`, `LIVEPIX_URL`). Trocou a chave? Altere só ali.
- **Pix copia e cola e QR Code:** gerados no próprio navegador (`src/lib/pix.ts` e `src/lib/qr.ts`), com valor e mensagem opcionais. A mensagem vai sem acentos e é cortada no tamanho máximo aceito pelo Pix.
- **Biblioteca de QR Code:** `uqr` (licença MIT), copiada em `src/vendor/` para não depender de pacote novo.
- **Teste antes de divulgar:** faça um Pix de R$ 1,00 de outra conta, lendo o QR Code e também pelo copia e cola, e confira o nome que o banco mostra.

## Cuidado ao editar arquivos no Windows

Editores como o Bloco de Notas podem gravar um marcador invisível (BOM) no começo do arquivo. Em `package.json` isso quebra o pnpm e a Vercel com o erro "Invalid package.json". Prefira editar pelo lápis do GitHub, ou salvar como "UTF-8" (sem BOM). O comando `pnpm verificar` (e o passo de verificação do CI) acusa o problema, e `node scripts/verificar-arquivos.mjs --corrigir` remove o BOM.

## Nível e data dos programas CAPES

O arquivo da CAPES traz o grau de cada programa (`NM_GRAU_PROGRAMA`). O script grava esse grau em `programas.json` e a data da base em `public/data/programas-meta.json` (ano-base, data da atualização e fonte). O site usa o grau para o filtro de nível e mostra a data na aba Programas CAPES e em Sobre e ajuda. O workflow e o build da Vercel gravam os dois arquivos.
