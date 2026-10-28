import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { createRequest } from "@/lib/requests-store";
import { PageTitle, SimBadge } from "@/components/Layout";

export const Route = createFileRoute("/solicitar-apoio")({
  head: () => ({
    meta: [
      { title: "Ask for support | Care+" },
      { name: "description", content: "Ask a service or professional to get in touch with you." },
      { property: "og:title", content: "Ask for support | Care+" },
      { property: "og:description", content: "Request contact from a professional safely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Solicitar,
});

const topics = ["I want to talk to a professional", "Mental health", "Sexuality and contraception", "Violence online", "I feel unsafe", "I'd rather not say"];
const contacts = ["Phone (demo)", "Email (demo)", "In person at the health center"];

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
        <h1 className="text-3xl font-semibold">Request recorded</h1>
        <p>Code: <strong>{id}</strong></p>
        <p className="rounded-xl bg-lilac p-3 text-sm text-lilac-foreground">This is a <strong>simulation</strong>: it stays only in this browser's temporary memory. No professional receives it.</p>
        <Link to="/" className="inline-block rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground">Back to start</Link>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="Ask to be contacted" />
      <p className="mb-4 text-sm"><SimBadge /> Use fictional data only.</p>
      {step === 0 ? (
        <section className="card-base space-y-3 p-4">
          <h2 className="text-xl font-semibold">Before you start</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>We ask for the minimum: topic, way to be contacted and city.</li>
            <li>This is a simulation. No service or professional receives this request.</li>
            <li>Nothing is shared automatically with family or school.</li>
            <li>Confidentiality has limits: if there is serious risk to your life or safety, the law may require professionals to activate protection services.</li>
            <li>You can ask for your data to be deleted.</li>
          </ul>
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I understand how my data will be used.</label>
          <button disabled={!agree} onClick={() => setStep(1)} className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50">Continue</button>
          <Link to="/privacidade" className="block text-center text-sm underline">Read the privacy policy</Link>
        </section>
      ) : (
        <form className="card-base space-y-4 p-4" onSubmit={(e) => { e.preventDefault(); setId(createRequest({ topic, contact, city }).id); }}>
          <label className="grid gap-1 text-sm font-bold">What do you want to talk about?
            <select className="rounded-xl border bg-card p-2 font-normal" value={topic} onChange={(e) => setTopic(e.target.value)}>{topics.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label className="grid gap-1 text-sm font-bold">How would you like to be contacted?
            <select className="rounded-xl border bg-card p-2 font-normal" value={contact} onChange={(e) => setContact(e.target.value)}>{contacts.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label className="grid gap-1 text-sm font-bold">City
            <select className="rounded-xl border bg-card p-2 font-normal" value={city} onChange={(e) => setCity(e.target.value)}><option>Vila Aurora</option><option>Porto Sereno</option></select>
          </label>
          <button className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground">Send request (simulated)</button>
        </form>
      )}
    </div>
  );
}
