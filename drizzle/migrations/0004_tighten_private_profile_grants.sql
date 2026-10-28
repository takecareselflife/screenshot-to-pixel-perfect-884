REVOKE ALL ON public.profiles, public.professional_access, public.admin_authorizations, public.security_audit FROM anon;
REVOKE INSERT, DELETE, UPDATE ON public.professional_access, public.admin_authorizations, public.security_audit FROM authenticated;
REVOKE INSERT, DELETE ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE(display_name,registration) ON public.profiles TO authenticated;
COMMENT ON TABLE public.profiles IS 'Private professional names and registration identifiers. No adolescent health data. Changes to approved profile require renewed review.';
COMMENT ON TABLE public.admin_authorizations IS 'Explicit operator-designated administrators only. No application or signup flow can grant this designation.';
COMMENT ON TABLE public.security_audit IS 'Minimal action audit; retention policy requires owner/legal review. Operator operations without auth.uid have null actor.';