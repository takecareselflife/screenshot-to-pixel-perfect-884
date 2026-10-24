import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Smile, HelpCircle, CloudRain, LifeBuoy, MapPin, MessageCircle, Info } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cuida+ | Saúde, apoio e informação para adolescentes" },
      { name: "description", content: "Informação confiável, apoio emocional e acesso a serviços de saúde para adolescentes." },
      { property: "og:title", content: "Cuida+ | Saúde Adolescente" },
      { property: "og:description", content: "Informação confiável, apoio emocional e acesso a serviços de saúde." },
    ],
  }),
  component: Index,
});

const options = [
  { to: "/biblioteca", label: "Quero cuidar da minha saúde", icon: Heart, tone: "bg-secondary text-secondary-foreground" },
  { to: "/bem-estar", label: "Quero conversar sobre meus sentimentos", icon: Smile, tone: "bg-sky text-sky-foreground" },
  { to: "/assistente", label: "Tenho dúvidas sobre sexualidade", icon: HelpCircle, tone: "bg-lilac text-lilac-foreground" },
  { to: "/ajuda", label: "Estou passando por uma situação difícil", icon: CloudRain, tone: "bg-accent text-accent-foreground" },
  { to: "/ajuda", label: "Preciso de ajuda", icon: LifeBuoy, tone: "bg-warm text-warm-foreground" },
  { to: "/servicos", label: "Encontrar um serviço de saúde", icon: MapPin, tone: "bg-secondary text-secondary-foreground" },
] as const;

function Index() {
  return (
    <div>
      <section className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wider text-warm">Oi, que bom que você está aqui</p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight">Como você quer se cuidar hoje?</h1>
        <p className="mt-3 text-muted-foreground">Escolha um caminho. Você não precisa se identificar para explorar.</p>
      </section>
      <ul className="grid gap-3 sm:grid-cols-2">
        {options.map(({ to, label, icon: Icon, tone }) => (
          <li key={label}>
            <Link to={to} className="card-base flex items-center gap-4 p-4 transition hover:-translate-y-0.5">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="font-bold">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/assistente" className="mt-6 flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground">
        <MessageCircle className="h-6 w-6" aria-hidden />
        <span><strong>Assistente de Saúde</strong><br /><span className="text-sm opacity-90">Tire dúvidas com respostas revisadas</span></span>
      </Link>
      <p className="mt-6 flex gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        O botão “Sair rápido” leva a outro site na hora, mas não apaga todo o histórico. Use navegação anônima ou limpe o histórico depois, se precisar.
      </p>
    </div>
  );
}
