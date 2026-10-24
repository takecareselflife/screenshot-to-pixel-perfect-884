import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/Layout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade e proteção de dados | Cuida+" },
      { name: "description", content: "Como protegemos seus dados, conforme a LGPD e o ECA." },
      { property: "og:title", content: "Privacidade | Cuida+" },
      { property: "og:description", content: "Transparência sobre dados, sigilo e seus direitos." },
    ],
  }),
  component: Privacidade,
});

const items = [
  ["Coleta mínima", "Só pedimos o necessário. Você pode usar a biblioteca, o assistente e os questionários sem se identificar."],
  ["Privacidade por padrão", "Questionários e conversas com o assistente não são salvos nesta versão."],
  ["Seus dados não são vendidos", "Não usamos dados para publicidade nem perfis de comportamento."],
  ["Sem compartilhamento automático", "Nada é enviado a família, escola ou terceiros automaticamente. Qualquer compartilhamento segue a lei e protocolos de proteção."],
  ["Limites do sigilo", "Profissionais respeitam o sigilo, mas, em situações de risco grave, a lei (ECA) pode exigir que acionem a rede de proteção."],
  ["Segurança", "Na versão real: criptografia, controle de acesso por função, registro de acessos administrativos e separação entre dados identificáveis e indicadores."],
  ["Retenção e exclusão", "Dados de solicitações serão guardados só pelo tempo necessário. Você poderá pedir a exclusão."],
  ["Incidentes", "Em caso de incidente de segurança, seguiremos os procedimentos da LGPD, incluindo comunicação à ANPD quando aplicável."],
];

function Privacidade() {
  return (
    <div>
      <PageTitle title="Privacidade e proteção de dados" subtitle="Base: LGPD (Lei 13.709/2018), ECA (Lei 8.069/1990) e normas profissionais." />
      <dl className="space-y-3">
        {items.map(([t, d]) => (
          <div key={t} className="card-base p-4"><dt className="font-bold">{t}</dt><dd className="mt-1 text-muted-foreground">{d}</dd></div>
        ))}
      </dl>
      <section className="mt-6 rounded-2xl bg-lilac p-4 text-lilac-foreground">
        <h2 className="text-lg font-semibold">O que é real e o que é simulado</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>Real: números nacionais (190, 192, 188, Disque 100) abrem a ligação no seu celular.</li>
          <li>Simulado: diretório de serviços, assistente, pedidos de apoio e painel de profissionais.</li>
          <li>Nenhuma integração com sistemas externos de saúde está ativa.</li>
        </ul>
      </section>
    </div>
  );
}
