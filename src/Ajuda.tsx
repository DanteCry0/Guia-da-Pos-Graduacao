import { useState } from "react";
import Apoio from "./Apoio.tsx";
import { CONTACT_EMAIL } from "./config.ts";
import { calls, fmtDate } from "./lib/editais.ts";
import { contatoMailto } from "./lib/contato.ts";

const FAQ: [string, string][] = [
  ["Qual a diferença entre stricto sensu e lato sensu?", "Stricto sensu é o mestrado e o doutorado: formam pesquisadores e docentes, terminam em dissertação ou tese e dão diploma. Lato sensu são as especializações e os MBAs: têm no mínimo 360 horas, focam em capacitação profissional e dão certificado. Veja a comparação completa na aba Guia de escolha."],
  ["O que significa a nota da CAPES?", "É a nota de avaliação do programa, de 3 a 7. A nota 3 é o mínimo para o programa ser reconhecido, 4 indica bom desempenho e 5 muito bom. A nota 5 é a máxima para programas que têm só mestrado; as notas 6 e 7 são para programas com doutorado e nível internacional. A avaliação é periódica, então a nota pode não refletir mudanças recentes."],
  ["Mestrado profissional vale o mesmo que o acadêmico?", "Se o programa é reconhecido pela CAPES, o diploma tem a mesma validade nacional. O que muda é o foco: o acadêmico forma para a pesquisa, e o profissional aplica o conhecimento no mercado. Para seguir carreira docente ou doutorado, confira as regras do programa que você quer."],
  ["Preciso de mestrado para fazer doutorado?", "Em geral sim, mas alguns programas aceitam candidatos sem mestrado, no chamado doutorado direto. As regras estão no edital de cada programa."],
  ["Como me inscrevo em um programa?", "Cada programa publica o seu edital, com requisitos, documentos, etapas (prova, projeto, entrevista), taxa, vagas e cotas. Leia o edital completo no site oficial antes de se inscrever e confira o prazo na aba Editais."],
  ["Existe pós-graduação à distância?", "Especializações e MBAs são muito comuns na modalidade EAD. Mestrados e doutorados costumam ser presenciais, e alguns programas têm formatos híbridos. Os dados abertos da CAPES não informam a modalidade de cada programa, então confira no site."],
  ["Há bolsas para mestrado e doutorado?", "Sim. As principais fontes são a CAPES, o CNPq e as fundações estaduais de apoio à pesquisa, como a FAPESP em São Paulo. As bolsas costumam ser distribuídas pelo próprio programa e dependem de disponibilidade e do edital."],
  ["Por que alguns programas têm o botão “Buscar programa”?", "Os dados abertos da CAPES trazem o nome, a instituição, a área e a nota, mas não o site de cada programa. Por isso o botão abre uma busca. Os cursos do catálogo (com link direto) foram cadastrados manualmente."],
  ["Meus cursos salvos somem?", "Ficam guardados no navegador do aparelho que você usa. Eles não sincronizam entre aparelhos e podem ser apagados se você limpar os dados do navegador."],
  ["O PósGuia é um site oficial?", "Não. É um projeto independente, sem vínculo com a CAPES, o MEC ou as instituições listadas. Use as informações para pesquisar e confirme sempre nos sites oficiais."],
];

const ir = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function Ajuda() {
  const [copied, setCopied] = useState(false);
  const ultima = calls.map((c) => c.verificado).filter(Boolean).sort().pop();
  const pagina = `${window.location.origin}${window.location.pathname}?aba=ajuda`;
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
    } catch {
      window.prompt("Copie o e-mail:", CONTACT_EMAIL);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <main className="page-content ajuda">
      <div className="page-hero compact">
        <div>
          <span className="section-kicker">Sobre e ajuda</span>
          <h1>Dúvidas, fontes e contato</h1>
          <p>Como usar o PósGuia, de onde vêm os dados e como falar com a gente.</p>
        </div>
      </div>
      <nav className="ajuda-nav" aria-label="Seções desta página">
        {[["faq", "Perguntas frequentes"], ["fontes", "Fontes dos dados"], ["contato", "Contato"], ["apoio", "Apoie o projeto"]].map(([id, label]) => (
          <button key={id} type="button" className="quiz-opt" onClick={() => ir(id)}>
            {label}
          </button>
        ))}
      </nav>

      <section id="faq" className="ajuda-bloco" aria-labelledby="faq-t">
        <h2 id="faq-t">Perguntas frequentes</h2>
        {FAQ.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>

      <section id="fontes" className="ajuda-bloco" aria-labelledby="fontes-t">
        <h2 id="fontes-t">Fontes dos dados</h2>
        <ul className="fontes">
          <li>
            <strong>Programas de mestrado e doutorado e suas notas:</strong> Portal de Dados Abertos da CAPES, conjunto “Programas da Pós-Graduação Stricto Sensu do Brasil”. A lista é atualizada automaticamente toda segunda-feira. A plataforma oficial de consulta é o{" "}
            <a href="https://sucupira.capes.gov.br/programas" target="_blank" rel="noreferrer">Sucupira</a>.
          </li>
          <li>
            <strong>Cursos do catálogo (links, MBAs e especializações):</strong> cadastro manual a partir dos sites das instituições. Durações e modalidades são indicativas.
          </li>
          <li>
            <strong>Editais:</strong> pesquisa manual em páginas das instituições e em reportagens. Cada edital mostra a fonte e a data da última conferência
            {ultima ? ` (a mais recente foi em ${fmtDate(ultima)})` : ""}. Prazos mudam: confirme no edital oficial.
          </li>
        </ul>
      </section>

      <section id="contato" className="ajuda-bloco" aria-labelledby="contato-t">
        <h2 id="contato-t">Contato</h2>
        <p>Encontrou um erro, quer sugerir um edital ou tem uma dúvida? Escreva para <strong>{CONTACT_EMAIL}</strong>.</p>
        <p className="apoio-linha">
          <a className="more-btn apoio-btn" href={contatoMailto(CONTACT_EMAIL, pagina)}>
            Enviar e-mail
          </a>
          <button type="button" className="link-btn" onClick={copiar}>
            {copied ? "E-mail copiado!" : "Copiar o endereço"}
          </button>
        </p>
        <p className="ajuda-nota">Se o botão não abrir o seu e-mail, copie o endereço e escreva pelo seu provedor.</p>
      </section>

      <section id="apoio" className="ajuda-bloco" aria-labelledby="apoio-t">
        <h2 id="apoio-t">Apoie o projeto</h2>
        <Apoio />
      </section>
    </main>
  );
}
