import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Phone, Clock, Info } from "lucide-react";
import { services, type ServiceType } from "@/lib/data";
import { PageTitle, SimBadge } from "@/components/Layout";
import { needs, recommend, type NeedId } from "@/lib/referral";
import { track } from "@/lib/impact";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Health services | Care+" },
      { name: "description", content: "Find health centers, mental health care, violence response and protection by city and region." },
      { property: "og:title", content: "Health services | Care+" },
      { property: "og:description", content: "Directory of services for adolescents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Servicos,
});

const types: ServiceType[] = ["Health center", "Mental health", "Violence response", "Protection"];
const cities = [...new Set(services.map((s) => s.city))];
const regions = [...new Set(services.map((s) => s.region))];
const sel = "rounded-xl border bg-card px-3 py-2";

function Servicos() {
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [need, setNeed] = useState<NeedId | "">("");
  const [found, setFound] = useState<string[]>([]);
  const chosen = needs.find((n) => n.id === need);
  const list = useMemo(
    () => (need ? recommend(services, need, city || undefined) : services).filter((s) => (!city || s.city === city) && (!region || s.region === region) && (!type || s.type === type)),
    [city, region, type, need],
  );
  const pickNeed = (id: NeedId) => { const next = need === id ? "" : id; setNeed(next); if (next) track("referral_search", next); };
  return (
    <div>
      <PageTitle title="Find a service" />
      <p className="mb-4 text-sm"><SimBadge>Fictional data</SimBadge> These places don't exist. Later the directory will be connected to official registries.</p>
      <section className="mb-4" aria-labelledby="need-h">
        <h2 id="need-h" className="mb-2 font-semibold">What do you need?</h2>
        <div className="flex flex-wrap gap-2">
          {needs.map((n) => (
            <button key={n.id} aria-pressed={need === n.id} onClick={() => pickNeed(n.id)} className={`rounded-full border px-3 py-1.5 text-sm ${need === n.id ? "bg-primary text-primary-foreground" : "bg-card"}`}>{n.label}</button>
          ))}
        </div>
        {chosen && (
          <div className="mt-3 rounded-2xl bg-secondary p-3 text-sm text-secondary-foreground">
            {chosen.urgent && <p className="font-bold">⚠️ {chosen.urgent}</p>}
            <p>Best match: {chosen.types.join(", then ")}. {chosen.tip}</p>
          </div>
        )}
      </section>
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <label className="grid text-sm">City<select className={sel} value={city} onChange={(e) => setCity(e.target.value)}><option value="">All</option>{cities.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="grid text-sm">Region<select className={sel} value={region} onChange={(e) => setRegion(e.target.value)}><option value="">All</option>{regions.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="grid text-sm">Type<select className={sel} value={type} onChange={(e) => setType(e.target.value)}><option value="">All</option>{types.map((c) => <option key={c}>{c}</option>)}</select></label>
      </div>
      <p className="mb-2 text-sm text-muted-foreground" aria-live="polite">{list.length} result(s)</p>
      <ul className="space-y-3">
        {list.map((s) => (
          <li key={s.id} className="card-base p-4">
            <span className="text-xs font-bold text-primary">{s.type}</span>
            <h2 className="text-lg font-semibold">{s.name}</h2>
            <p className="text-sm text-muted-foreground">{s.city} · {s.region}</p>
            {s.verified ? (
              <ul className="mt-2 space-y-1 text-sm">
                {s.address && <li className="flex gap-2"><MapPin className="h-4 w-4" />{s.address}</li>}
                {s.phone && <li className="flex gap-2"><Phone className="h-4 w-4" />{s.phone}</li>}
                {s.hours && <li className="flex gap-2"><Clock className="h-4 w-4" />{s.hours}</li>}
                {s.access && <li className="flex gap-2"><Info className="h-4 w-4" />{s.access}</li>}
              </ul>
            ) : (
              <p className="mt-2 text-sm italic text-muted-foreground">Information not verified yet.</p>
            )}
            {found.includes(s.id) ? (
              <p className="mt-2 text-sm font-bold text-primary">Thanks! Counted anonymously.</p>
            ) : (
              <button onClick={() => { setFound((f) => [...f, s.id]); track("service_found", need || s.type); }} className="mt-2 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">This is the service I need</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
