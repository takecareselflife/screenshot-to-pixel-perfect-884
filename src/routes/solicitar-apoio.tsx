import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { createRequest } from "@/lib/requests-store";
import { PageTitle, SimBadge } from "@/components/Layout";

export const Route = createFileRoute("/solicitar-apoio")({
  head: () => ({
    meta: [
      { title: "Solicitar apoio | Cuida+" },
      { name: "description", content: "Peça que um serviço ou profissional entre em contato com você." },
      { property: "og:title", content: "Solicitar apoio | Cuida+" },
      { property: "og:description", content: "Peça contato de um profissional de forma segura." },
    ],
  }),
  component: Solicitar,
});

const topics = ["Quero conversar com um profissional", "Saúde mental", "Sexualidade e contracepção", "Violência pela internet", "Me sinto inseguro(a)", "Prefiro não dizer"];
const contacts = ["Telefone (demo)", "E-mail (demo)", "Presencial na UBS"];

function Solicitar() {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState<string>(topics[0]!);
  const [contact, setContact] = useState<string>(contacts[0]!);
  const [city, setCity] = useState("Vila Aurora");
  const [agree, setAgree] = useState(false);
  const [id, setId] = useState<string | null>(null);

  if (id) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Solicitação registrada</h1>
        <p>Código: <strong>{id}</strong></p>
        <p className="rounded-xl bg-lilac p-3 text-sm text-lilac-foreground">Esta é uma <strong>simulação</strong>: o pedido ficou apenas na demonstração do painel de profissionais e nenhuma informação real foi enviada.</p>
        <Link to="/" className="inline-block rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground">Voltar ao início</Link>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="Pedir contato" />
      <p className="mb-4 text-sm"><SimBadge /> Use apenas dados fictícios.</p>
      {step === 0 ? (
        <section className="card-base space-y-3 p-4">
          <h2 className="text-xl font-semibold">Antes de começar</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>Pedimos o mínimo: assunto, forma de contato e município.</li>
            <li>Só profissionais autorizados do serviço veem seu pedido.</li>
            <li>Nada é compartilhado automaticamente com família ou escola.</li>
            <li>O sigilo tem limites: se houver risco grave à sua vida ou segurança, a lei pode exigir que profissionais acionem a proteção.</li>
            <li>Você pode pedir a exclusão dos seus dados.</li>
          </ul>
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> Entendi como meus dados serão usados.</label>
          <button disabled={!agree} onClick={() => setStep(1)} className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50">Continuar</button>
          <Link to="/privacidade" className="block text-center text-sm underline">Ler política de privacidade</Link>
        </section>
      ) : (
        <form className="card-base space-y-4 p-4" onSubmit={(e) => { e.preventDefault(); setId(createRequest({ topic, contact, city }).id); }}>
          <label className="grid gap-1 text-sm font-bold">Sobre o que quer conversar?
            <select className="rounded-xl border bg-card p-2 font-normal" value={topic} onChange={(e) => setTopic(e.target.value)}>{topics.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label className="grid gap-1 text-sm font-bold">Como prefere ser contatado(a)?
            <select className="rounded-xl border bg-card p-2 font-normal" value={contact} onChange={(e) => setContact(e.target.value)}>{contacts.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label className="grid gap-1 text-sm font-bold">Município
            <select className="rounded-xl border bg-card p-2 font-normal" value={city} onChange={(e) => setCity(e.target.value)}><option>Vila Aurora</option><option>Porto Sereno</option></select>
          </label>
          <button className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground">Enviar pedido (simulado)</button>
        </form>
      )}
    </div>
  );
}
