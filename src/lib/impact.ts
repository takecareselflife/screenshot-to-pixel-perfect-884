import { supabase } from "@/integrations/supabase/client";

export type ImpactKind = "article_view" | "assistant_question" | "referral_search" | "service_found";

/** Anonymous counter: only what was used and the day. No user, device or text is stored. */
export function track(kind: ImpactKind, ref: string) {
  if (typeof window === "undefined") return;
  void supabase.from("impact_events").insert({ kind, ref: ref.slice(0, 60) }).then(() => {}, () => {});
}

export async function loadImpact() {
  const { data, error } = await supabase.rpc("impact_summary");
  if (error) throw error;
  return data ?? [];
}
