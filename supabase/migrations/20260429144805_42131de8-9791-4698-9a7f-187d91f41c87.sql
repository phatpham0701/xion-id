-- Move citext to extensions schema
create schema if not exists extensions;
alter extension citext set schema extensions;

-- Set search_path on functions
alter function public.set_updated_at() set search_path = public;
alter function public.validate_username() set search_path = public;

-- Tighten analytics insert policy to specific roles instead of fully public
drop policy "Anyone can insert analytics events" on public.analytics_events;
create policy "Anon and authed can insert analytics events"
  on public.analytics_events for insert
  to anon, authenticated
  with check (true);

-- Restrict execute on security-definer functions
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- handle_new_user is only called by the auth.users trigger, never via API.