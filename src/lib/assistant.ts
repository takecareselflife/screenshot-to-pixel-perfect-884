/**
 * Assistente demonstrativo baseado em regras sobre a base de conhecimento local.
 * Preparado para trocar por um modelo de IA com recuperação (RAG) no futuro.
 */
import { articles } from "./data";

export type Reply = { text: string; sources: string[]; links: { to: string; label: string }[]; risk: boolean };

const riskWords = ["me matar", "suicid", "me machucar", "morrer", "abuso", "estupr", "me forçou", "ameaç", "chantag", "nudes vazad", "vazaram", "medo de"];

const topics: { keys: string[]; slug: string }[] = [
  { keys: ["camisinha", "pílula", "pilula", "anticoncep", "contracep", "gravid", "diu"], slug: "contraceptivos" },
  { keys: ["ist", "dst", "hiv", "sífilis", "sifilis", "hpv", "teste"], slug: "ists" },
  { keys: ["consentimento", "namoro", "relacionamento", "ciúme", "ciume"], slug: "consentimento" },
  { keys: ["ansiedade", "depress", "triste", "sozinh", "estresse"], slug: "saude-mental" },
  { keys: ["bullying", "zoação", "humilha"], slug: "bullying" },
  { keys: ["foto", "nude", "internet", "instagram", "online", "on-line", "senha"], slug: "seguranca-digital" },
  { keys: ["aliciamento", "presente", "segredo", "adulto"], slug: "aliciamento" },
  { keys: ["puberdade", "menstrua", "corpo", "pelos", "sexualidade"], slug: "puberdade" },
  { keys: ["direito", "sigilo", "pais", "conselho tutelar"], slug: "direitos" },
];

export function answer(input: string): Reply {
  const t = input.toLowerCase();
  const risk = riskWords.some((w) => t.includes(w));
  const topic = topics.find((x) => x.keys.some((k) => t.includes(k)));
  const art = topic && articles.find((a) => a.slug === topic.slug);

  if (risk) {
    return {
      risk: true,
      text: "Obrigado por confiar em mim. O que você está sentindo importa, e você merece apoio de uma pessoa agora. Se estiver em perigo imediato, ligue 190 (polícia) ou 192 (SAMU). Para conversar, o CVV atende 24h pelo 188. Eu sou um assistente automático e não substituo um profissional.",
      sources: ["CVV", "Ministério da Saúde"],
      links: [{ to: "/ajuda", label: "Preciso de ajuda" }, { to: "/solicitar-apoio", label: "Falar com profissional" }],
    };
  }
  if (art) {
    return {
      risk: false,
      text: `${art.summary} ${art.explain[0]} Dica: ${art.practical[0]}`,
      sources: art.sources,
      links: [{ to: `/biblioteca/${art.slug}`, label: `Ler: ${art.title}` }, { to: "/servicos", label: "Encontrar serviço" }],
    };
  }
  return {
    risk: false,
    text: "Ainda não tenho uma resposta revisada sobre isso. Você pode reformular, explorar a biblioteca ou conversar com um profissional da UBS.",
    sources: [],
    links: [{ to: "/biblioteca", label: "Ver biblioteca" }],
  };
}
