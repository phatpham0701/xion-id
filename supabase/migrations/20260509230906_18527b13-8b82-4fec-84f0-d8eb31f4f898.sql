
create table public.profile_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  actor_id uuid,
  actor_email text,
  event text not null,
  source text not null default 'trigger',
  before jsonb,
  after jsonb,
  changed_keys text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index profile_history_profile_id_created_at_idx
  on public.profile_history (profile_id, created_at desc);

alter table public.profile_history enable row level security;

create policy "Admins can read profile history"
on public.profile_history for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert profile history"
on public.profile_history for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- Trigger function: snapshot any change to profiles
create or replace function public.profiles_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_event text;
  v_before jsonb;
  v_after jsonb;
  v_keys text[] := '{}';
  k text;
begin
  if (tg_op = 'INSERT') then
    v_event := 'insert';
    v_before := null;
    v_after := to_jsonb(new);
  elsif (tg_op = 'UPDATE') then
    v_event := 'update';
    v_before := to_jsonb(old);
    v_after := to_jsonb(new);
    for k in select jsonb_object_keys(v_after) loop
      if v_before->k is distinct from v_after->k then
        v_keys := array_append(v_keys, k);
      end if;
    end loop;
    if array_length(v_keys, 1) is null then
      return new;
    end if;
  else
    v_event := 'delete';
    v_before := to_jsonb(old);
    v_after := null;
  end if;

  begin
    select email into v_email from auth.users where id = v_actor;
  exception when others then
    v_email := null;
  end;

  insert into public.profile_history(profile_id, actor_id, actor_email, event, source, before, after, changed_keys)
  values (
    coalesce((v_after->>'id')::uuid, (v_before->>'id')::uuid),
    v_actor,
    v_email,
    v_event,
    'trigger',
    v_before,
    v_after,
    v_keys
  );

  if (tg_op = 'DELETE') then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_audit_trg on public.profiles;
create trigger profiles_audit_trg
after insert or update or delete on public.profiles
for each row execute function public.profiles_audit();

-- Manual log RPC for non-DB events (e.g. demo seed)
create or replace function public.log_profile_event(
  _profile_id uuid,
  _event text,
  _source text,
  _before jsonb,
  _after jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_email text;
  v_keys text[] := '{}';
  k text;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'forbidden';
  end if;

  select email into v_email from auth.users where id = auth.uid();

  if _before is not null and _after is not null then
    for k in select jsonb_object_keys(_after) loop
      if _before->k is distinct from _after->k then
        v_keys := array_append(v_keys, k);
      end if;
    end loop;
  end if;

  insert into public.profile_history(profile_id, actor_id, actor_email, event, source, before, after, changed_keys)
  values (_profile_id, auth.uid(), v_email, _event, coalesce(_source,'admin'), _before, _after, v_keys)
  returning id into v_id;

  return v_id;
end;
$$;
