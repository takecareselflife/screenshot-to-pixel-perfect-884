CREATE TABLE public.ai_usage_events (
  id bigserial PRIMARY KEY,
  scope text NOT NULL CHECK (scope IN ('assistant','voice','speech')),
  outcome text NOT NULL CHECK (outcome IN ('rejected_invalid','rejected_rate','rejected_budget','rejected_disabled','rejected_error','local','completed','failed_before_provider','failed_provider','timeout','cancelled')),
  est_cost numeric(10,4) NOT NULL DEFAULT 0,
  latency_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_usage_events_created_idx ON public.ai_usage_events(created_at);
CREATE TABLE public.ai_budget_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('assistant','voice','speech')),
  day date NOT NULL DEFAULT ((now() AT TIME ZONE 'utc')::date),
  est_cost numeric(10,4) NOT NULL CHECK (est_cost > 0),
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','charged','released')),
  created_at timestamptz NOT NULL DEFAULT now(),
  settled_at timestamptz
);
CREATE INDEX ai_budget_reservations_day_idx ON public.ai_budget_reservations(day, scope);
CREATE TABLE public.ai_kill_switch (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  active boolean NOT NULL DEFAULT false,
  reason text,
  changed_by uuid,
  changed_at timestamptz
);
GRANT ALL ON public.ai_usage_events, public.ai_budget_reservations, public.ai_kill_switch TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.ai_usage_events_id_seq TO service_role;
ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_budget_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_kill_switch ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.ai_usage_events IS 'Aggregate-only paid AI usage outcomes. No IP, user, question, audio or transcript data. Costs are conservative estimates, not provider invoices.';
COMMENT ON TABLE public.ai_budget_reservations IS 'Daily estimated-cost reservations made just before a provider call; released when the provider was never contacted.';
COMMENT ON TABLE public.ai_kill_switch IS 'Single-row emergency stop for paid AI, changed only through ai_set_kill_switch by an authorized administrator.';

CREATE OR REPLACE FUNCTION public.ai_record(_scope text, _outcome text, _cost numeric, _latency integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.ai_usage_events(scope,outcome,est_cost,latency_ms) VALUES (_scope,_outcome,COALESCE(_cost,0),_latency);
  DELETE FROM public.ai_usage_events WHERE created_at < now() - interval '35 days';
END $$;

CREATE OR REPLACE FUNCTION public.ai_reserve(_scope text, _cost numeric, _scope_limit numeric, _total_limit numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d date := (now() AT TIME ZONE 'utc')::date; s numeric; t numeric; rid uuid;
BEGIN
  -- Serialize reservations so simultaneous requests cannot overshoot the budget.
  PERFORM pg_advisory_xact_lock(hashtext('care_ai_budget'));
  IF EXISTS (SELECT 1 FROM public.ai_kill_switch WHERE id=1 AND active) THEN
    PERFORM public.ai_record(_scope,'rejected_disabled',0,NULL);
    RETURN jsonb_build_object('error','disabled');
  END IF;
  SELECT COALESCE(SUM(est_cost) FILTER (WHERE scope=_scope),0), COALESCE(SUM(est_cost),0) INTO s, t
    FROM public.ai_budget_reservations WHERE day=d AND status <> 'released';
  IF s + _cost > _scope_limit OR t + _cost > _total_limit THEN
    PERFORM public.ai_record(_scope,'rejected_budget',0,NULL);
    RETURN jsonb_build_object('error','budget');
  END IF;
  INSERT INTO public.ai_budget_reservations(scope,day,est_cost) VALUES (_scope,d,_cost) RETURNING id INTO rid;
  DELETE FROM public.ai_budget_reservations WHERE day < d - 35;
  RETURN jsonb_build_object('id',rid);
END $$;

CREATE OR REPLACE FUNCTION public.ai_settle(_id uuid, _outcome text, _latency integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.ai_budget_reservations; charged boolean := _outcome <> 'failed_before_provider';
BEGIN
  -- Idempotent: a reservation is settled at most once.
  UPDATE public.ai_budget_reservations SET status = CASE WHEN charged THEN 'charged' ELSE 'released' END, settled_at = now()
    WHERE id=_id AND status='reserved' RETURNING * INTO r;
  IF NOT FOUND THEN RETURN false; END IF;
  PERFORM public.ai_record(r.scope,_outcome,CASE WHEN charged THEN r.est_cost ELSE 0 END,_latency);
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.ai_set_kill_switch(_active boolean, _reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM 1 FROM public.admin_authorizations WHERE user_id=auth.uid() FOR UPDATE;
  IF NOT public.is_authorized_admin() THEN
    IF auth.uid() IS NOT NULL THEN INSERT INTO public.security_audit(actor_id,action) VALUES (auth.uid(),'ai_kill_switch_denied'); END IF;
    RETURN jsonb_build_object('error','forbidden');
  END IF;
  IF _active IS NULL OR _reason IS NULL OR length(trim(_reason)) < 10 OR length(_reason) > 300 THEN
    RETURN jsonb_build_object('error','invalid');
  END IF;
  INSERT INTO public.ai_kill_switch(id,active,reason,changed_by,changed_at) VALUES (1,_active,trim(_reason),auth.uid(),now())
    ON CONFLICT (id) DO UPDATE SET active=EXCLUDED.active, reason=EXCLUDED.reason, changed_by=EXCLUDED.changed_by, changed_at=EXCLUDED.changed_at;
  INSERT INTO public.security_audit(actor_id,action,details)
    VALUES (auth.uid(), CASE WHEN _active THEN 'ai_kill_switch_activated' ELSE 'ai_kill_switch_deactivated' END, jsonb_build_object('reason',trim(_reason)));
  RETURN jsonb_build_object('ok',true);
END $$;

CREATE OR REPLACE FUNCTION public.ai_monitoring()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE d date := (now() AT TIME ZONE 'utc')::date;
BEGIN
  IF NOT public.is_authorized_admin() THEN RETURN jsonb_build_object('error','forbidden'); END IF;
  RETURN jsonb_build_object(
    'day', d,
    'outcomes', COALESCE((SELECT jsonb_agg(jsonb_build_object('scope',scope,'outcome',outcome,'count',n)) FROM (
      SELECT scope,outcome,count(*) n FROM public.ai_usage_events WHERE created_at >= d::timestamp AT TIME ZONE 'utc' GROUP BY 1,2) q),'[]'::jsonb),
    'spend', COALESCE((SELECT jsonb_agg(jsonb_build_object('scope',scope,'charged',c,'reserved',r)) FROM (
      SELECT scope, SUM(est_cost) FILTER (WHERE status='charged') c, SUM(est_cost) FILTER (WHERE status='reserved') r
      FROM public.ai_budget_reservations WHERE day=d GROUP BY 1) q),'[]'::jsonb),
    'latency', COALESCE((SELECT jsonb_agg(jsonb_build_object('scope',scope,'avg',a,'p95',p)) FROM (
      SELECT scope, round(avg(latency_ms)) a, percentile_disc(0.95) WITHIN GROUP (ORDER BY latency_ms) p
      FROM public.ai_usage_events WHERE created_at >= d::timestamp AT TIME ZONE 'utc' AND latency_ms IS NOT NULL GROUP BY 1) q),'[]'::jsonb),
    'history', COALESCE((SELECT jsonb_agg(jsonb_build_object('day',dd,'cost',c) ORDER BY dd) FROM (
      SELECT day dd, SUM(est_cost) c FROM public.ai_budget_reservations WHERE day > d - 7 AND status <> 'released' GROUP BY 1) q),'[]'::jsonb),
    'kill_switch', (SELECT jsonb_build_object('active',active,'reason',reason,'changed_at',changed_at) FROM public.ai_kill_switch WHERE id=1),
    'interventions', COALESCE((SELECT jsonb_agg(x ORDER BY (x->>'at') DESC) FROM (
      SELECT jsonb_build_object('at',occurred_at,'actor',actor_id,'action',action,'reason',details->>'reason') x
      FROM public.security_audit WHERE action LIKE 'ai_kill_switch%' ORDER BY occurred_at DESC LIMIT 20) q),'[]'::jsonb)
  );
END $$;

REVOKE ALL ON FUNCTION public.ai_record(text,text,numeric,integer), public.ai_reserve(text,numeric,numeric,numeric), public.ai_settle(uuid,text,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ai_record(text,text,numeric,integer), public.ai_reserve(text,numeric,numeric,numeric), public.ai_settle(uuid,text,integer) TO service_role;
REVOKE ALL ON FUNCTION public.ai_set_kill_switch(boolean,text), public.ai_monitoring() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ai_set_kill_switch(boolean,text), public.ai_monitoring() TO authenticated;