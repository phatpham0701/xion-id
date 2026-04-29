create extension if not exists citext with schema public;

-- Enums
create type public.app_role as enum ('admin', 'user');

create type public.block_type as enum (
  'link', 'heading', 'text', 'avatar', 'social',
  'wallet', 'nft', 'token_balance',
  'image', 'video_embed', 'music_embed',
  'tip_jar', 'contact_form', 'calendar'
);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- profiles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username public.citext unique,
  display_name text,
  bio text,
  avatar_url text,
  theme jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.validate_username()
returns trigger language plpgsql as $$
begin
  if new.username is not null and new.username !~ '^[a-zA-Z0-9_.\-]{3,24}$' then
    raise exception 'Invalid username. Use 3-24 chars: letters, numbers, _ . -';
  end if;
  return new;
end;
$$;

create trigger profiles_validate_username
before insert or update on public.profiles
for each row execute function public.validate_username();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);
create policy "Users can insert their own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own profile" on public.profiles
  for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete their own profile" on public.profiles
  for delete to authenticated using (auth.uid() = user_id);

-- blocks
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type public.block_type not null,
  position integer not null default 0,
  config jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blocks_profile_position_idx on public.blocks(profile_id, position);

create trigger blocks_set_updated_at
before update on public.blocks
for each row execute function public.set_updated_at();

alter table public.blocks enable row level security;

create policy "Blocks are viewable by everyone" on public.blocks
  for select using (true);
create policy "Owners can insert blocks" on public.blocks
  for insert to authenticated with check (
    exists (select 1 from public.profiles p where p.id = blocks.profile_id and p.user_id = auth.uid())
  );
create policy "Owners can update blocks" on public.blocks
  for update to authenticated using (
    exists (select 1 from public.profiles p where p.id = blocks.profile_id and p.user_id = auth.uid())
  );
create policy "Owners can delete blocks" on public.blocks
  for delete to authenticated using (
    exists (select 1 from public.profiles p where p.id = blocks.profile_id and p.user_id = auth.uid())
  );

-- analytics_events
create table public.analytics_events (
  id bigserial primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  block_id uuid references public.blocks(id) on delete set null,
  event_type text not null check (event_type in ('view','click')),
  referrer text,
  created_at timestamptz not null default now()
);
create index analytics_profile_idx on public.analytics_events(profile_id, created_at desc);

alter table public.analytics_events enable row level security;
create policy "Anyone can insert analytics events" on public.analytics_events
  for insert with check (true);
create policy "Owners can read their analytics" on public.analytics_events
  for select using (
    exists (select 1 from public.profiles p where p.id = analytics_events.profile_id and p.user_id = auth.uid())
  );

-- user_roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create policy "Users can read their own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins can manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();