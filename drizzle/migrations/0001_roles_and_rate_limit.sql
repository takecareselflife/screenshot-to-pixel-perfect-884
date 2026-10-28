CREATE TYPE public.app_role AS ENUM ('professional', 'manager');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.impact_summary()
RETURNS TABLE(kind text, ref text, total bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'manager') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT e.kind, e.ref, count(*) FROM public.impact_events e
    WHERE e.day > current_date - 90 GROUP BY e.kind, e.ref ORDER BY e.kind, count(*) DESC;
END $$;
REVOKE EXECUTE ON FUNCTION public.impact_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.impact_summary() TO authenticated;

CREATE TABLE public.ai_rate_limits (
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  hits int NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);
GRANT ALL ON public.ai_rate_limits TO service_role;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Atomic counter: concurrent requests serialize on the row, so the limit holds across server instances.
CREATE OR REPLACE FUNCTION public.hit_rate_limit(_bucket text, _window_seconds int)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w timestamptz := to_timestamp(floor(extract(epoch FROM now()) / _window_seconds) * _window_seconds);
DECLARE n int;
BEGIN
  INSERT INTO public.ai_rate_limits (bucket, window_start, hits) VALUES (_bucket, w, 1)
  ON CONFLICT (bucket, window_start) DO UPDATE SET hits = ai_rate_limits.hits + 1
  RETURNING hits INTO n;
  DELETE FROM public.ai_rate_limits WHERE window_start < now() - interval '1 day';
  RETURN n;
END $$;
REVOKE EXECUTE ON FUNCTION public.hit_rate_limit(text, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hit_rate_limit(text, int) TO service_role;