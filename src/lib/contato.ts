// Links de e-mail para reportar erro ou sugerir edital. Testado em tests/ics.test.ts.
import type { Call } from "./editais.ts";

const mailto = (to: string, subject: string, body: string) =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, "\r\n"))}`;

export const reportEditalMailto = (to: string, c: Call, page: string) =>
  mailto(
    to,
    `[PósGuia] Corrigir edital: ${c.org} · ${c.name}`,
    `Olá! Encontrei um problema neste edital do PósGuia.\n\nEdital: ${c.org} · ${c.name}\nFim das inscrições cadastrado: ${c.end}\nLink cadastrado: ${c.url}\nPágina: ${page}\n\nO que está errado (prazo, link, vagas ou outro):\n\nLink do edital oficial com a informação correta:\n`,
  );

export const suggestEditalMailto = (to: string, page: string) =>
  mailto(
    to,
    "[PósGuia] Sugestão de edital",
    `Olá! Gostaria de sugerir um edital para o PósGuia.\n\nInstituição:\nPrograma ou curso:\nNível (mestrado, doutorado, especialização ou MBA):\nInício das inscrições:\nFim das inscrições:\nLink do edital oficial:\n\nPágina: ${page}\n`,
  );

export const contatoMailto = (to: string, page: string) =>
  mailto(to, "[PósGuia] Contato", `Olá!\n\n\n\nPágina: ${page}\n`);
