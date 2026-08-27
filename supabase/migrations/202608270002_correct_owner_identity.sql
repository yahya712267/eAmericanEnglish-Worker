begin;

-- Correct the already-applied owner bootstrap without rewriting migration history.
update public.profiles
set access_status = 'pending'::public.access_status
where lower(email) = 'ya712267@gmail.com'
  and access_status = 'owner'::public.access_status;

update public.profiles
set access_status = 'owner'::public.access_status
where lower(email) = 'yahya@eamericanenglish.com';

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
      when lower(coalesce(new.email, '')) = 'yahya@eamericanenglish.com'
        then 'owner'::public.access_status
      else 'pending'::public.access_status
    end
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    access_status = case
      when lower(excluded.email) = 'yahya@eamericanenglish.com'
        then 'owner'::public.access_status
      when lower(excluded.email) = 'ya712267@gmail.com'
        then 'pending'::public.access_status
      else public.profiles.access_status
    end;
  return new;
end;
$$;

commit;
