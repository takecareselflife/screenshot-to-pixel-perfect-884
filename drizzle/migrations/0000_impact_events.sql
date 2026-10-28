CREATE TABLE public.impact_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind text NOT NULL,
  ref text NOT NULL,
  day date NOT NULL DEFAULT current_date
);
GRANT INSERT ON public.impact_events TO anon, authenticated;
GRANT ALL ON public.impact_events TO service_role;
ALTER TABLE public.impact_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anonymous counted events" ON public.impact_events FOR INSERT TO anon, authenticated
WITH CHECK (kind IN ('article_view','assistant_question','referral_search','service_found') AND length(ref) <= 60 AND day = current_date);

CREATE OR REPLACE FUNCTION public.impact_summary()
RETURNS TABLE(kind text, ref text, total bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT kind, ref, count(*) FROM public.impact_events
  WHERE day > current_date - 90 GROUP BY kind, ref ORDER BY kind, count(*) DESC
$$;
GRANT EXECUTE ON FUNCTION public.impact_summary() TO anon, authenticated;