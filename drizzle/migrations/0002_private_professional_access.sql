CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  registration text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profile_name_length CHECK (length(display_name) <= 100),
  CONSTRAINT profile_registration_length CHECK (length(registration) <= 80)
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE(display_name, registration) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.professional_access (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','suspended','revoked')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.professional_access TO authenticated;
GRANT ALL ON public.professional_access TO service_role;
ALTER TABLE public.professional_access ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admin_authorizations (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_authorizations TO authenticated;
GRANT ALL ON public.admin_authorizations TO service_role;
ALTER TABLE public.admin_authorizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.security_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid,
  subject_id uuid,
  action text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.security_audit TO authenticated;
GRANT ALL ON public.security_audit TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.security_audit_id_seq TO service_role;
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;
CREATE INDEX security_audit_time ON public.security_audit(occurred_at DESC);

CREATE FUNCTION public.has_active_session() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM auth.sessions s JOIN auth.users u ON u.id = s.user_id
    WHERE s.user_id = auth.uid() AND s.id::text = auth.jwt()->>'session_id'
      AND (s.not_after IS NULL OR s.not_after > now())
      AND u.email_confirmed_at IS NOT NULL
      AND (u.banned_until IS NULL OR u.banned_until < now())
  )
$$;
REVOKE ALL ON FUNCTION public.has_active_session() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_session() TO authenticated;

CREATE FUNCTION public.is_authorized_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_active_session() AND EXISTS (
    SELECT 1 FROM public.admin_authorizations a WHERE a.user_id = auth.uid() AND a.active
  )
$$;
REVOKE ALL ON FUNCTION public.is_authorized_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_authorized_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id = auth.uid() AND public.has_active_session()
    AND EXISTS (SELECT 1 FROM public.professional_access a WHERE a.user_id = _user_id AND a.status = 'approved')
    AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = _user_id AND r.role = _role)
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "Own private profile" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() AND public.has_active_session());
CREATE POLICY "Edit own profile fields" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() AND public.has_active_session() AND NOT EXISTS (
  SELECT 1 FROM public.professional_access a WHERE a.user_id = auth.uid() AND a.status IN ('suspended','revoked')
)) WITH CHECK (id = auth.uid() AND public.has_active_session());
CREATE POLICY "Own access state" ON public.professional_access FOR SELECT TO authenticated
USING (user_id = auth.uid() AND public.has_active_session());
CREATE POLICY "Own administrator designation" ON public.admin_authorizations FOR SELECT TO authenticated
USING (user_id = auth.uid() AND public.has_active_session());
CREATE POLICY "Administrator audit read" ON public.security_audit FOR SELECT TO authenticated
USING (public.is_authorized_admin());
DROP POLICY "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() AND public.has_active_session());

CREATE FUNCTION public.initialize_private_profile() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.professional_access(user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.initialize_private_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER care_private_profile AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.initialize_private_profile();
INSERT INTO public.profiles(id) SELECT id FROM auth.users ON CONFLICT DO NOTHING;
INSERT INTO public.professional_access(user_id) SELECT id FROM public.profiles ON CONFLICT DO NOTHING;

CREATE FUNCTION public.profile_change_requires_review() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.display_name IS DISTINCT FROM OLD.display_name OR NEW.registration IS DISTINCT FROM OLD.registration THEN
    UPDATE public.professional_access SET status = 'pending', updated_at = now()
      WHERE user_id = NEW.id AND status = 'approved';
    INSERT INTO public.security_audit(actor_id, subject_id, action) VALUES (auth.uid(), NEW.id, 'profile_updated');
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.profile_change_requires_review() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER care_profile_review BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profile_change_requires_review();

CREATE FUNCTION public.audit_permission_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE subject uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN subject := OLD.user_id; ELSE subject := NEW.user_id; END IF;
  INSERT INTO public.security_audit(actor_id, subject_id, action, details)
  VALUES (auth.uid(), subject, TG_TABLE_NAME || '_' || lower(TG_OP),
    CASE WHEN TG_TABLE_NAME = 'professional_access' THEN
      jsonb_build_object('status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status ELSE NEW.status END)
    WHEN TG_TABLE_NAME = 'user_roles' THEN
      jsonb_build_object('role', CASE WHEN TG_OP = 'DELETE' THEN OLD.role ELSE NEW.role END)
    ELSE jsonb_build_object('active', CASE WHEN TG_OP = 'DELETE' THEN OLD.active ELSE NEW.active END) END);
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.audit_permission_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER care_access_audit AFTER INSERT OR UPDATE OR DELETE ON public.professional_access
FOR EACH ROW EXECUTE FUNCTION public.audit_permission_change();
CREATE TRIGGER care_role_audit AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_permission_change();
CREATE TRIGGER care_admin_audit AFTER INSERT OR UPDATE OR DELETE ON public.admin_authorizations
FOR EACH ROW EXECUTE FUNCTION public.audit_permission_change();

CREATE FUNCTION public.professional_session() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_active_session() THEN RETURN jsonb_build_object('error','unauthorized'); END IF;
  SELECT jsonb_build_object('status', COALESCE(a.status,'ordinary'),
    'profile', jsonb_build_object('display_name',p.display_name,'registration',p.registration),
    'admin', public.is_authorized_admin(),
    'roles', CASE WHEN a.status = 'approved' THEN COALESCE((SELECT jsonb_agg(r.role) FROM public.user_roles r WHERE r.user_id = auth.uid()),'[]'::jsonb) ELSE '[]'::jsonb END)
  INTO result FROM public.profiles p LEFT JOIN public.professional_access a ON a.user_id = p.id WHERE p.id = auth.uid();
  RETURN COALESCE(result,jsonb_build_object('status','ordinary','roles','[]'::jsonb,'admin',false));
END $$;
REVOKE ALL ON FUNCTION public.professional_session() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.professional_session() TO authenticated;

CREATE FUNCTION public.authorize_professional(_area text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE allowed boolean := false;
BEGIN
  IF NOT public.has_active_session() THEN RETURN jsonb_build_object('error','unauthorized'); END IF;
  IF _area = 'intake' THEN allowed := public.has_role(auth.uid(),'professional');
  ELSIF _area = 'indicators' THEN allowed := public.has_role(auth.uid(),'manager');
  ELSIF _area = 'administration' THEN allowed := public.is_authorized_admin(); END IF;
  IF NOT allowed THEN
    INSERT INTO public.security_audit(actor_id, action, details) VALUES
      (auth.uid(), 'access_denied', jsonb_build_object('area',CASE WHEN _area IN ('intake','indicators','administration') THEN _area ELSE 'invalid' END));
    RETURN jsonb_build_object('error','forbidden');
  END IF;
  RETURN jsonb_build_object('ok',true);
END $$;
REVOKE ALL ON FUNCTION public.authorize_professional(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.authorize_professional(text) TO authenticated;

CREATE FUNCTION public.admin_professionals() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_authorized_admin() THEN
    IF auth.uid() IS NOT NULL THEN INSERT INTO public.security_audit(actor_id,action) VALUES (auth.uid(),'admin_access_denied'); END IF;
    RETURN jsonb_build_object('error','forbidden');
  END IF;
  RETURN jsonb_build_object('records',COALESCE((SELECT jsonb_agg(row_to_json(x)) FROM (
    SELECT p.id, p.display_name, p.registration, a.status,
      COALESCE((SELECT jsonb_agg(r.role) FROM public.user_roles r WHERE r.user_id=p.id),'[]'::jsonb) AS roles
    FROM public.profiles p JOIN public.professional_access a ON a.user_id=p.id
    WHERE NOT EXISTS (SELECT 1 FROM public.admin_authorizations ad WHERE ad.user_id=p.id AND ad.active)
    ORDER BY a.updated_at DESC LIMIT 100
  ) x),'[]'::jsonb));
END $$;
REVOKE ALL ON FUNCTION public.admin_professionals() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_professionals() TO authenticated;

CREATE FUNCTION public.manage_professional(_target uuid, _status text, _roles text[]) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM 1 FROM public.admin_authorizations WHERE user_id=auth.uid() FOR UPDATE;
  IF NOT public.is_authorized_admin() OR _target = auth.uid() THEN
    IF auth.uid() IS NOT NULL THEN INSERT INTO public.security_audit(actor_id,action) VALUES (auth.uid(),'permission_change_denied'); END IF;
    RETURN jsonb_build_object('error','forbidden');
  END IF;
  IF _status NOT IN ('approved','suspended','revoked') OR _roles IS NULL
    OR NOT (_roles <@ ARRAY['professional','manager']::text[]) OR array_length(_roles,1) > 2 THEN
    RETURN jsonb_build_object('error','invalid');
  END IF;
  PERFORM 1 FROM public.professional_access WHERE user_id=_target FOR UPDATE;
  IF NOT FOUND OR EXISTS (SELECT 1 FROM public.admin_authorizations WHERE user_id=_target AND active) THEN
    RETURN jsonb_build_object('error','forbidden');
  END IF;
  IF _status='approved' AND (COALESCE(array_length(_roles,1),0)=0 OR NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id=_target AND length(trim(display_name))>0 AND length(trim(registration))>0
  )) THEN RETURN jsonb_build_object('error','profile_required'); END IF;
  DELETE FROM public.user_roles WHERE user_id=_target;
  IF _status='approved' THEN
    INSERT INTO public.user_roles(user_id,role) SELECT _target,x::public.app_role FROM (SELECT DISTINCT unnest(_roles) x) q;
  END IF;
  UPDATE public.professional_access SET status=_status, updated_at=now() WHERE user_id=_target;
  INSERT INTO public.security_audit(actor_id,subject_id,action,details)
    VALUES (auth.uid(),_target,'professional_access_changed',jsonb_build_object('status',_status,'roles',CASE WHEN _status='approved' THEN to_jsonb(_roles) ELSE '[]'::jsonb END));
  RETURN jsonb_build_object('ok',true);
END $$;
REVOKE ALL ON FUNCTION public.manage_professional(uuid,text,text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.manage_professional(uuid,text,text[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.impact_summary()
RETURNS TABLE(kind text, ref text, total bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'manager') THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
  RETURN QUERY SELECT e.kind,e.ref,count(*) FROM public.impact_events e
    WHERE e.day > current_date-90 GROUP BY e.kind,e.ref ORDER BY e.kind,count(*) DESC;
END $$;
REVOKE ALL ON FUNCTION public.impact_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.impact_summary() TO authenticated;