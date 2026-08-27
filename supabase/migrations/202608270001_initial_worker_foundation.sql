create type public.access_status as enum (
  'owner',
  'pending',
  'approved',
  'rejected',
  'revoked'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  access_status public.access_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_lower_idx on public.profiles (lower(email));

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  description text check (description is null or char_length(description) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger workspaces_set_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, access_status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when lower(coalesce(new.email, '')) = 'ya712267@gmail.com'
        then 'owner'::public.access_status
      else 'pending'::public.access_status
    end
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    access_status = case
      when lower(excluded.email) = 'ya712267@gmail.com'
        then 'owner'::public.access_status
      else public.profiles.access_status
    end;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, email, display_name, avatar_url, access_status)
select
  id,
  coalesce(email, ''),
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
  raw_user_meta_data ->> 'avatar_url',
  case
    when lower(coalesce(email, '')) = 'ya712267@gmail.com'
      then 'owner'::public.access_status
    else 'pending'::public.access_status
  end
from auth.users
on conflict (id) do nothing;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and access_status = 'owner'
  );
$$;

create or replace function public.has_worker_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and access_status in ('owner', 'approved')
  );
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;

create policy "Users can read their own access profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "Owner can read all access profiles"
on public.profiles for select
to authenticated
using (public.is_owner());

create policy "Owner can manage non-owner access states"
on public.profiles for update
to authenticated
using (public.is_owner() and id <> auth.uid() and access_status <> 'owner')
with check (public.is_owner() and id <> auth.uid() and access_status <> 'owner');

create policy "Approved users share all workspaces"
on public.workspaces for select
to authenticated
using (public.has_worker_access());

create policy "Approved users can create workspaces"
on public.workspaces for insert
to authenticated
with check (public.has_worker_access());

create policy "Approved users can rename workspaces"
on public.workspaces for update
to authenticated
using (public.has_worker_access())
with check (public.has_worker_access());

create policy "Approved users can delete workspaces"
on public.workspaces for delete
to authenticated
using (public.has_worker_access());

grant usage on type public.access_status to authenticated;
grant select on public.profiles to authenticated;
grant update (access_status) on public.profiles to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
