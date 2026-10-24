import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Phone } from "lucide-react";
import { hotlines } from "@/lib/data";
import { PageTitle } from "@/components/Layout";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Preciso de ajuda | Cuida+" },
      { name: "description", content: "Orientações iniciais de segurança e caminhos para apoio humano." },
      { property: "og:title", content: "Preciso de ajuda | Cuida+" },
      { property: "og:description", content: "Você não está sozinho(a). Veja caminhos de apoio." },
    ],
  }),
  component: Ajuda,
});

// Protocolos de demonstração — devem ser revisados por profissionais antes do uso real.
const situations: { label: string; urgent?: boolean; steps: string[] }[] = [
  { label: "Estou me sentindo inseguro(a)", steps: ["Se puder, vá para um lugar onde se sinta mais seguro(a).", "Fale com um adulto de confiança.", "Você pode pedir contato de um profissional."] },
  { label: "Alguém está me ameaçando", urgent: true, steps: ["Se o perigo for agora, ligue 190.", "Evite ficar sozinho(a) com essa pessoa.", "Guarde mensagens se for seguro.", "O Disque 100 recebe denúncias."] },
  { label: "Estou sofrendo violência pela internet", steps: ["Não responda a chantagens nem envie mais nada.", "Faça prints se for seguro.", "Bloqueie e denuncie na plataforma.", "A SaferNet Brasil orienta sobre remoção de conteúdo."] },
  { label: "Passei por uma situação sexual que me deixou desconfortável", urgent: true, steps: ["Não foi culpa sua.", "Serviços de saúde atendem sem exigir boletim de ocorrência. Ir o quanto antes (idealmente em até 72h) permite cuidados preventivos.", "Você não precisa contar detalhes para pedir ajuda."] },
  { label: "Tenho medo de alguém", steps: ["Seu medo é válido.", "Conte para alguém de confiança.", "O Conselho Tutelar pode proteger você."] },
  { label: "Quero conversar com um profissional", steps: ["Você pode ir à UBS mais próxima.", "Ou pedir que entrem em contato com você."] },
  { label: "Não sei o que está acontecendo, mas preciso de ajuda", steps: ["Tudo bem não saber explicar.", "O CVV (188) escuta 24h, de graça.", "Você pode pedir contato de um profissional."] },
];

function Ajuda() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <PageTitle title="Você não está sozinho(a)" subtitle="Escolha o que mais se parece com o que você está vivendo. Não pedimos detalhes nem provas." />
      <section className="mb-6 rounded-2xl bg-warm p-4 text-warm-foreground">
        <p className="font-bold">Em perigo agora?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {hotlines.map((h) => (
            <a key={h.number} href={`tel:${h.number}`} className="flex items-center gap-2 rounded-xl bg-card p-3 text-card-foreground">
              <Phone className="h-4 w-4 text-warm" aria-hidden />
              <span><strong>{h.number}</strong> {h.name}<br /><span className="text-xs text-muted-foreground">{h.desc}</span></span>
            </a>
          ))}
        </div>
        <p className="mt-2 text-xs opacity-90">Ao tocar, seu celular abre a ligação. O app não faz chamadas por você.</p>
      </section>
      <ul className="space-y-2">
        {situations.map((s, i) => (
          <li key={s.label} className="card-base overflow-hidden">
            <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="w-full p-4 text-left font-bold">
              {s.label}
            </button>
            {open === i && (
              <div className="border-t bg-muted p-4">
                {s.urgent && <p className="mb-2 text-sm font-bold text-destructive">Se houver risco imediato, ligue 190 ou 192.</p>}
                <ul className="list-disc space-y-1 pl-5">{s.steps.map((x) => <li key={x}>{x}</li>)}</ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to="/solicitar-apoio" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Pedir contato</Link>
                  <Link to="/servicos" className="rounded-full border bg-card px-4 py-2 text-sm font-bold">Ver serviços</Link>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
