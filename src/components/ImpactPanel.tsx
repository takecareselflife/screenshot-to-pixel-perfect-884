import { useEffect, useState } from "react";
import { getProfessionalIndicators } from "@/lib/professional.functions";
import { useServerFn } from "@tanstack/react-start";
import { articles } from "@/lib/data";
import { needs } from "@/lib/referral";

type Row = { kind: string; ref: string; total: number };
const label = (ref: string) => articles.find((a) => a.slug === ref)?.title ?? needs.find((n) => n.id === ref)?.label ?? ref;

export function ImpactPanel() {
  const load = useServerFn(getProfessionalIndicators);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { let active=true; load().then((d) => { if (!active) return; if (d.ok) setRows(d.rows.map((r) => ({ ...r, total: Number(r.total) }))); else setErr(true); }, () => { if (active) setErr(true); }); return () => { active=false; }; }, [load]);
  if (err) return <p className="text-sm">Indicators could not be loaded.</p>;
  if (!rows) return <p className="text-sm">Loading indicators…</p>;
  const sum = (k: string) => rows.filter((r) => r.kind === k).reduce((a, r) => a + r.total, 0);
  const searches = sum("referral_search");
  const found = sum("service_found");
  const top = (k: string) => rows.filter((r) => r.kind === k).slice(0, 5);
  return (
    <section className="mb-6 space-y-4" aria-labelledby="impact-h">
      <h2 id="impact-h" className="text-lg font-semibold">Impact indicators (last 90 days)</h2>
      <p className="text-xs text-muted-foreground">Anonymous counts only: what was used and the day. No person, device, location or message text is recorded.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[["Article views", sum("article_view")], ["Assistant questions", sum("assistant_question")], ["Service searches", searches], ["Found a service", found]].map(([t, n]) => (
          <div key={t} className="rounded-2xl bg-secondary p-3 text-center"><p className="text-2xl font-bold">{n}</p><p className="text-xs">{t}</p></div>
        ))}
      </div>
      <p className="text-sm">Found-service rate: <strong>{searches ? Math.round((found / searches) * 100) : 0}%</strong> of service searches.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card-base p-3"><h3 className="font-semibold">Most read content</h3><ul className="text-sm">{top("article_view").map((r) => <li key={r.ref}>{label(r.ref)} — {r.total}</li>)}</ul></div>
        <div className="card-base p-3"><h3 className="font-semibold">Most searched needs</h3><ul className="text-sm">{top("referral_search").map((r) => <li key={r.ref}>{label(r.ref)} — {r.total}</li>)}</ul></div>
      </div>
    </section>
  );
}
