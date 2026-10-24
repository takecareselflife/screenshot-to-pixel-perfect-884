/**
 * Dados de demonstração (sintéticos). Conteúdos educativos são resumos gerais
 * e devem ser revisados por profissionais antes de uso real.
 * Estrutura preparada para substituir por API/diretórios oficiais.
 */

export type Article = {
  slug: string;
  title: string;
  summary: string;
  explain: string[];
  practical: string[];
  warning: string[];
  services: string[];
  sources: string[];
};

export const articles: Article[] = [
  {
    slug: "puberdade",
    title: "Sexualidade e puberdade",
    summary: "As mudanças do corpo e das emoções são naturais e cada pessoa tem seu ritmo.",
    explain: [
      "A puberdade é a fase em que o corpo muda por ação dos hormônios: crescimento, pelos, menstruação, mudanças na voz e nas emoções.",
      "Sexualidade envolve corpo, sentimentos, identidade e relações — não só relações sexuais.",
    ],
    practical: ["Tire dúvidas com profissionais da UBS.", "Respeite seu tempo: ninguém precisa ter pressa.", "Cuide da higiene e do sono."],
    warning: ["Dor intensa ou sangramento fora do comum.", "Pressão de alguém para fazer algo que você não quer."],
    services: ["Unidade Básica de Saúde (UBS)"],
    sources: ["Ministério da Saúde – Caderneta de Saúde do Adolescente", "OMS – Saúde do adolescente"],
  },
  {
    slug: "contraceptivos",
    title: "Métodos contraceptivos",
    summary: "Existem vários métodos para prevenir a gravidez. A camisinha também protege contra ISTs.",
    explain: [
      "Métodos incluem camisinha externa e interna, pílula, injeção, DIU e implante. Alguns são oferecidos gratuitamente pelo SUS.",
      "Apenas a camisinha protege contra infecções sexualmente transmissíveis.",
    ],
    practical: ["Converse com um profissional para escolher o método adequado.", "Camisinhas são gratuitas nas UBS.", "Existe contracepção de emergência, que deve ser usada o quanto antes."],
    warning: ["Atraso menstrual após relação sem proteção.", "Efeitos colaterais que preocupam você."],
    services: ["UBS", "Farmácia Popular"],
    sources: ["Ministério da Saúde – Saúde sexual e reprodutiva", "OMS – Planejamento familiar"],
  },
  {
    slug: "ists",
    title: "Infecções sexualmente transmissíveis",
    summary: "ISTs têm prevenção, teste e tratamento. Muitas não dão sintomas.",
    explain: ["HIV, sífilis, hepatites, HPV e clamídia são exemplos. O teste rápido é gratuito no SUS.", "A vacina contra HPV é oferecida gratuitamente para adolescentes."],
    practical: ["Use camisinha.", "Faça testes regularmente se tiver vida sexual.", "Procure a UBS se tiver dúvidas — o atendimento é seu direito."],
    warning: ["Feridas, verrugas ou corrimento.", "Dor ou ardência ao urinar."],
    services: ["UBS", "Centro de Testagem e Aconselhamento (CTA)"],
    sources: ["Ministério da Saúde – IST/HIV", "OPAS"],
  },
  {
    slug: "consentimento",
    title: "Consentimento e relacionamentos saudáveis",
    summary: "Consentimento é um sim livre, claro, informado — e que pode mudar a qualquer momento.",
    explain: ["Ninguém deve ser pressionado, ameaçado ou manipulado. Silêncio não é sim.", "Relacionamentos saudáveis têm respeito, confiança e liberdade."],
    practical: ["Você pode dizer não a qualquer momento.", "Pergunte e respeite a resposta do outro.", "Ciúme excessivo e controle não são amor."],
    warning: ["Controle do celular ou das roupas.", "Ameaças ou chantagem.", "Isolamento de amigos e família."],
    services: ["UBS", "CREAS", "Conselho Tutelar"],
    sources: ["ECA – Lei 8.069/1990", "UNICEF Brasil"],
  },
  {
    slug: "saude-mental",
    title: "Saúde mental, ansiedade e depressão",
    summary: "Sentir tristeza ou ansiedade às vezes é humano. Quando pesa demais, pedir ajuda é força.",
    explain: ["Ansiedade e depressão são comuns e têm tratamento.", "Sono, alimentação, movimento e vínculos ajudam no bem-estar."],
    practical: ["Converse com alguém de confiança.", "Respire devagar: 4 segundos inspirando, 6 expirando.", "Procure a UBS ou o CAPS."],
    warning: ["Tristeza que dura semanas.", "Pensamentos de se machucar.", "Perda de interesse em tudo."],
    services: ["UBS", "CAPS / CAPSi", "CVV – 188"],
    sources: ["Ministério da Saúde – Saúde mental", "OMS – Saúde mental de adolescentes"],
  },
  {
    slug: "bullying",
    title: "Bullying e violência psicológica",
    summary: "Humilhações repetidas, exclusão e ameaças não são brincadeira.",
    explain: ["Bullying é intimidação repetida, presencial ou on-line (cyberbullying).", "Violência psicológica inclui humilhar, ameaçar, controlar."],
    practical: ["Guarde registros (prints) se for seguro.", "Conte para alguém de confiança.", "Você não tem culpa."],
    warning: ["Medo de ir à escola.", "Mudanças bruscas de humor ou isolamento."],
    services: ["Escola", "CREAS", "Disque 100"],
    sources: ["Lei 13.185/2015 (Combate à Intimidação Sistemática)"],
  },
  {
    slug: "violencia-sexual-digital",
    title: "Violência sexual e digital",
    summary: "Nenhuma situação sexual sem consentimento é culpa sua. Existe ajuda.",
    explain: ["Violência sexual é qualquer ato sexual sem consentimento, inclusive tocar, expor ou forçar.", "Também pode acontecer pela internet."],
    practical: ["Procure um lugar seguro.", "Serviços de saúde atendem casos de violência, inclusive com profilaxia de emergência — quanto antes, melhor (idealmente até 72h).", "Você pode buscar ajuda sem contar todos os detalhes."],
    warning: ["Alguém pede segredo sobre contato físico.", "Pedidos de fotos íntimas."],
    services: ["Serviço de referência para violência sexual", "Conselho Tutelar", "Disque 100"],
    sources: ["Ministério da Saúde – Atenção a pessoas em situação de violência sexual", "ECA"],
  },
  {
    slug: "aliciamento",
    title: "Assédio, coerção, ameaças e aliciamento",
    summary: "Adultos ou pessoas que oferecem presentes e pedem segredo podem estar aliciando.",
    explain: ["Aliciamento (grooming) é quando alguém cria confiança para depois manipular ou abusar.", "Coerção é forçar algo com pressão, chantagem ou ameaça."],
    practical: ["Não aceite encontros com pessoas que conheceu on-line sem um adulto de confiança.", "Bloqueie e denuncie.", "Conte para alguém."],
    warning: ["Pedidos de segredo.", "Presentes ou dinheiro em troca de algo.", "Ameaças de expor você."],
    services: ["Disque 100", "SaferNet Brasil", "Conselho Tutelar"],
    sources: ["SaferNet Brasil", "UNICEF"],
  },
  {
    slug: "seguranca-digital",
    title: "Segurança digital e imagens íntimas",
    summary: "Compartilhar imagens íntimas de alguém sem consentimento é crime. A culpa nunca é de quem foi exposto.",
    explain: ["Imagens de pessoas menores de 18 anos de cunho sexual são ilegais em qualquer situação.", "Plataformas têm canais para remover conteúdo."],
    practical: ["Não apague as provas se for seguro guardá-las.", "Denuncie à plataforma e à SaferNet.", "Use senhas fortes e verificação em duas etapas."],
    warning: ["Chantagem com fotos (sextorsão).", "Contas falsas com seu nome."],
    services: ["SaferNet Brasil", "Delegacia", "Disque 100"],
    sources: ["SaferNet Brasil", "Lei 13.718/2018"],
  },
  {
    slug: "direitos",
    title: "Direitos dos adolescentes e como buscar ajuda",
    summary: "Você tem direito à saúde, à proteção e a ser ouvido com respeito.",
    explain: ["O ECA garante proteção integral.", "Adolescentes podem ser atendidos em serviços de saúde com respeito à privacidade, observados os limites legais."],
    practical: ["Você pode ir à UBS e pedir atendimento.", "O sigilo tem limites quando há risco à sua vida ou segurança."],
    warning: ["Ter direitos negados.", "Sofrer qualquer violência."],
    services: ["UBS", "Conselho Tutelar", "Defensoria Pública"],
    sources: ["ECA – Lei 8.069/1990", "Ministério da Saúde – Diretrizes de atenção à saúde do adolescente"],
  },
];

export type ServiceType = "UBS" | "Saúde mental" | "Violência" | "Proteção";

export type Service = {
  id: string;
  name: string;
  type: ServiceType;
  city: string;
  region: string;
  address?: string;
  phone?: string;
  hours?: string;
  access?: string;
  verified: boolean;
};

// Todos FICTÍCIOS. Campos ausentes = não cadastrados/verificados.
export const services: Service[] = [
  { id: "s1", name: "UBS Jardim Esperança (fictícia)", type: "UBS", city: "Vila Aurora", region: "Norte", address: "Rua Exemplo, 100", phone: "(00) 0000-0001", hours: "Seg–Sex, 7h–19h", access: "Acolhimento por demanda espontânea", verified: true },
  { id: "s2", name: "UBS Centro (fictícia)", type: "UBS", city: "Vila Aurora", region: "Centro", address: "Av. Demonstração, 45", hours: "Seg–Sex, 7h–17h", verified: true },
  { id: "s3", name: "CAPSi Girassol (fictício)", type: "Saúde mental", city: "Vila Aurora", region: "Sul", address: "Rua Modelo, 12", phone: "(00) 0000-0003", hours: "Seg–Sex, 8h–18h", access: "Porta aberta para adolescentes", verified: true },
  { id: "s4", name: "Serviço de Referência Rosa (fictício)", type: "Violência", city: "Vila Aurora", region: "Centro", phone: "(00) 0000-0004", hours: "24 horas", access: "Atendimento sem necessidade de boletim de ocorrência", verified: true },
  { id: "s5", name: "Conselho Tutelar Região Leste (fictício)", type: "Proteção", city: "Vila Aurora", region: "Leste", address: "Praça Teste, 8", phone: "(00) 0000-0005", verified: true },
  { id: "s6", name: "UBS Bela Vista (fictícia)", type: "UBS", city: "Porto Sereno", region: "Norte", verified: false },
  { id: "s7", name: "CAPS Ipê (fictício)", type: "Saúde mental", city: "Porto Sereno", region: "Centro", address: "Rua Simulada, 300", hours: "Seg–Sex, 8h–17h", verified: true },
  { id: "s8", name: "CREAS Porto Sereno (fictício)", type: "Proteção", city: "Porto Sereno", region: "Sul", phone: "(00) 0000-0008", verified: true },
];

// Canais nacionais reais e públicos
export const hotlines = [
  { name: "SAMU", number: "192", desc: "Emergência médica" },
  { name: "CVV", number: "188", desc: "Apoio emocional, 24h, gratuito" },
  { name: "Polícia", number: "190", desc: "Perigo imediato" },
  { name: "Disque 100", number: "100", desc: "Denúncia de violações de direitos" },
];

export type Questionnaire = {
  id: string;
  title: string;
  questions: string[];
};

// Perguntas de autorreflexão — NÃO são instrumentos clínicos validados.
export const questionnaires: Questionnaire[] = [
  { id: "humor", title: "Humor", questions: ["Nas últimas duas semanas, me senti para baixo.", "Perdi o interesse por coisas que gostava.", "Me senti sem esperança."] },
  { id: "ansiedade", title: "Ansiedade e estresse", questions: ["Me senti nervoso(a) ou tenso(a).", "Tive dificuldade de parar de me preocupar.", "Me senti sobrecarregado(a) com tarefas."] },
  { id: "sono", title: "Sono", questions: ["Tive dificuldade para dormir.", "Acordei cansado(a).", "Usei o celular até tarde e dormi pouco."] },
  { id: "relacoes", title: "Relações e segurança", questions: ["Me senti sozinho(a).", "Me senti inseguro(a) em casa, na escola ou on-line.", "Alguém me fez sentir medo."] },
];

export const scale = ["Nunca", "Às vezes", "Muitas vezes", "Quase sempre"];

export type RequestStatus = "Nova" | "Em contato" | "Acolhida" | "Encaminhada" | "Em acompanhamento";

export type SupportRequest = {
  id: string;
  createdAt: string;
  topic: string;
  contact: string;
  city: string;
  status: RequestStatus;
  notes: string[];
};

export const demoRequests: SupportRequest[] = [
  { id: "SOL-0001", createdAt: "2026-10-20", topic: "Quero conversar com um profissional", contact: "Telefone (demo)", city: "Vila Aurora", status: "Nova", notes: [] },
  { id: "SOL-0002", createdAt: "2026-10-19", topic: "Saúde mental", contact: "E-mail (demo)", city: "Vila Aurora", status: "Em contato", notes: ["Primeiro contato realizado (demo)."] },
  { id: "SOL-0003", createdAt: "2026-10-17", topic: "Contracepção", contact: "Presencial na UBS", city: "Porto Sereno", status: "Encaminhada", notes: ["Encaminhada à UBS Bela Vista (demo)."] },
  { id: "SOL-0004", createdAt: "2026-10-15", topic: "Violência pela internet", contact: "Telefone (demo)", city: "Vila Aurora", status: "Em acompanhamento", notes: ["Acolhimento realizado.", "Retorno agendado (demo)."] },
];
