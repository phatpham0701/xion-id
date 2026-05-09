
revoke execute on function public.profiles_audit() from public, anon, authenticated;
revoke execute on function public.log_profile_event(uuid, text, text, jsonb, jsonb) from public, anon;
