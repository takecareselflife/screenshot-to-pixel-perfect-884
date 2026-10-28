CREATE OR REPLACE FUNCTION public.audit_permission_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE row_data jsonb; detail jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := to_jsonb(OLD); ELSE row_data := to_jsonb(NEW); END IF;
  IF TG_TABLE_NAME = 'professional_access' THEN detail := jsonb_build_object('status',row_data->>'status');
  ELSIF TG_TABLE_NAME = 'user_roles' THEN detail := jsonb_build_object('role',row_data->>'role');
  ELSE detail := jsonb_build_object('active',row_data->'active'); END IF;
  INSERT INTO public.security_audit(actor_id,subject_id,action,details)
  VALUES (auth.uid(),(row_data->>'user_id')::uuid,TG_TABLE_NAME || '_' || lower(TG_OP),detail);
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.audit_permission_change() FROM PUBLIC,anon,authenticated;