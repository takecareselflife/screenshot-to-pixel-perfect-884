import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/Layout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade e proteção de dados | Care+" },
      { name: "description", content: "O que o Care+ envia para a IA, o que guarda, o que não guarda e o que ainda precisa ser verificado." },
      { property: "og:title", content: "Privacidade | Care+" },
      { property: "og:description", content: "Transparência sobre dados, assistente com IA e seus direitos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacidade,
});

type Item = [string, string[]];

const sections: { title: string; items: Item[] }[] = [
  {
    title: "Assistente com IA",
    items: [
      ["Como funciona", [
        "Sua pergunta vai primeiro para um servidor do Care+. Só o servidor fala com o modelo de IA; a chave de acesso nunca fica no seu aparelho.",
        "O modelo usado é da OpenAI, acessado por meio do serviço de IA da Lovable (a plataforma que hospeda o Care+).",
        "A IA recebe instruções para responder só com o conteúdo da nossa biblioteca, sem diagnósticos e sem receitar remédios.",
      ]],
      ["O que é enviado para a IA", [
        "O texto da sua pergunta e das últimas mensagens desta mesma conversa (até 12).",
        "Antes do envio, e-mails e números de telefone são apagados automaticamente. Esse filtro é simples e pode falhar — por isso, não escreva nome, endereço, escola ou outros dados pessoais.",
        "Não enviamos seu nome, conta, localização ou identificação do aparelho.",
      ]],
      ["O que o Care+ guarda", [
        "Nada da conversa. Ela some quando você fecha ou recarrega a página.",
      ]],
      ["O que ainda não sabemos", [
        "Por quanto tempo a OpenAI e o serviço de IA da Lovable podem manter as mensagens, e para quê. Isso ainda precisa ser confirmado nos contratos e não pode ser garantido aqui.",
      ]],
    ],
  },
  {
    title: "Outros dados",
    items: [
      ["Botão Ouvir (áudio)", ["O texto da tela é enviado pelo servidor a um serviço de voz do Google, também via Lovable, para virar áudio. Não guardamos o áudio. A retenção pelo provedor precisa ser verificada."]],
      ["Botão Falar (voz)", ["Quando você grava, o áudio do microfone vai ao nosso servidor e segue para um modelo de transcrição (OpenAI, via Lovable) só para virar texto. O texto aparece na caixa de perguntas para você revisar antes de enviar. Não guardamos o áudio nem a transcrição no Care+."]],
      ["Contagens anônimas", ["Guardamos só contagens: qual conteúdo foi aberto, qual tipo de serviço foi buscado e o dia. Não guardamos quem, aparelho, local nem textos. Só gestores autorizados veem os totais."]],
      ["Limite de perguntas", ["Para evitar abuso, o servidor conta quantas perguntas chegam por minuto. Seu endereço de internet (IP) não é guardado: usamos um código embaralhado que muda todo dia e é apagado em cerca de 1 dia. O mesmo limite se aplica às mensagens de voz."]],
      ["Questionários e pedido de apoio", ["Nesta versão, ficam só na memória da página e não são enviados a nenhum servidor. O pedido de apoio ainda é uma demonstração: ninguém o recebe."]],
      ["Contas de profissionais", ["Só profissionais têm conta (e-mail e senha). Adolescentes não precisam de conta. O acesso ao painel exige aprovação de um administrador."]],
      ["Registros técnicos", ["A hospedagem pode registrar dados técnicos de acesso (como IP e horário) por segurança. Quais dados e por quanto tempo ainda precisa ser verificado."]],
    ],
  },
  {
    title: "Seus direitos e limites",
    items: [
      ["Sem venda nem anúncios", ["Não vendemos dados e não usamos dados para publicidade."]],
      ["Sem envio automático", ["Nada é enviado automaticamente para família, escola ou serviços."]],
      ["Limites do sigilo", ["Não podemos prometer sigilo total. Em situações de risco grave, profissionais podem ter o dever de acionar a rede de proteção."]],
    ],
  },
];

const pending = [
  "Retenção e uso dos dados pela OpenAI, Google e Lovable.",
  "Por quanto tempo o áudio gravado e o texto transcrito ficam guardados no serviço de transcrição (OpenAI e Lovable).",
  "Revisão jurídica conforme a lei de proteção de dados do país do piloto e as regras de consentimento para adolescentes.",
  "Revisão clínica do conteúdo da biblioteca, que a IA usa como base (ainda não validado).",
  "Prazos de guarda dos registros técnicos da hospedagem.",
  "Plano de resposta a incidentes de segurança.",
];

function Privacidade() {
  return (
    <div lang="pt-BR">
      <PageTitle title="Privacidade e proteção de dados" subtitle="O que acontece com suas informações no Care+. Texto de protótipo — ainda sem revisão jurídica." />
      {sections.map((s) => (
        <section key={s.title} className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">{s.title}</h2>
          <dl className="space-y-3">
            {s.items.map(([t, d]) => (
              <div key={t} className="card-base p-4">
                <dt className="font-bold">{t}</dt>
                {d.map((p) => <dd key={p} className="mt-1 text-muted-foreground">{p}</dd>)}
              </div>
            ))}
          </dl>
        </section>
      ))}
      <section className="rounded-2xl bg-lilac p-4 text-lilac-foreground">
        <h2 className="text-lg font-semibold">Ainda precisa ser verificado</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">{pending.map((p) => <li key={p}>{p}</li>)}</ul>
        <p className="mt-2 text-sm">Os números de emergência (190, 192, 188) são reais. Os serviços listados são fictícios.</p>
      </section>
    </div>
  );
}
