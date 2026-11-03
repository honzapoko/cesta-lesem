-- Kruhy: malé skupiny 2–8 lidí, kteří si drží palce (KONCEPT-KRUHY.md)
-- Spustit v Supabase → SQL Editor. Je idempotentní (dá se spustit opakovaně).

create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null check (char_length(name) between 1 and 40),
  owner uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.members (
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);
-- stav dne viditelný v rámci kruhu; nikdy ne poznámky, deník ani detaily
create table if not exists public.status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nick text not null default 'Klíček' check (char_length(nick) between 1 and 24),
  avatar text not null default 'leaf',
  day date,
  done int not null default 0,
  total int not null default 0,
  streak int not null default 0,
  mood text,
  updated_at timestamptz not null default now()
);
create table if not exists public.nudges (
  id bigserial primary key,
  circle_id uuid not null references public.circles(id) on delete cascade,
  from_user uuid not null references auth.users(id) on delete cascade,
  to_user uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'palec' check (kind in ('palec','mysli','gratulace')),
  day date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists nudges_to_day on public.nudges (to_user, day);
create index if not exists nudges_from_day on public.nudges (from_user, day);
create index if not exists members_user on public.members (user_id);

alter table public.circles enable row level security;
alter table public.members enable row level security;
alter table public.status enable row level security;
alter table public.nudges enable row level security;

-- pomocné funkce (security definer, aby RLS na members nebyla rekurzivní)
create or replace function public.my_circles() returns setof uuid
language sql security definer stable set search_path = public as $$
  select circle_id from public.members where user_id = auth.uid()
$$;
create or replace function public.same_circle(other uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.members a join public.members b on a.circle_id = b.circle_id
                 where a.user_id = auth.uid() and b.user_id = other)
$$;

drop policy if exists circles_select on public.circles;
create policy circles_select on public.circles for select to authenticated using (id in (select public.my_circles()));
drop policy if exists circles_update on public.circles;
create policy circles_update on public.circles for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists members_select on public.members;
create policy members_select on public.members for select to authenticated using (user_id = auth.uid() or circle_id in (select public.my_circles()));
drop policy if exists members_delete on public.members;
create policy members_delete on public.members for delete to authenticated using (user_id = auth.uid());
drop policy if exists status_select on public.status;
create policy status_select on public.status for select to authenticated using (user_id = auth.uid() or public.same_circle(user_id));
drop policy if exists status_upsert on public.status;
create policy status_upsert on public.status for insert to authenticated with check (user_id = auth.uid());
drop policy if exists status_update on public.status;
create policy status_update on public.status for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists nudges_select on public.nudges;
create policy nudges_select on public.nudges for select to authenticated using (circle_id in (select public.my_circles()));

-- založení kruhu: vrátí kód (6 znaků)
create or replace function public.create_circle(p_name text) returns table (id uuid, code text, name text)
language plpgsql security definer set search_path = public as $$
declare v_code text; v_id uuid; v_try int := 0;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if (select count(*) from public.members where user_id = auth.uid()) >= 5 then raise exception 'too many circles'; end if;
  loop
    v_code := upper(substr(translate(encode(gen_random_bytes(6), 'base64'), '+/=0OI1l', 'ABCDEFGH'), 1, 6));
    exit when not exists (select 1 from public.circles c where c.code = v_code);
    v_try := v_try + 1; if v_try > 20 then raise exception 'code'; end if;
  end loop;
  insert into public.circles (code, name, owner) values (v_code, trim(p_name), auth.uid()) returning circles.id into v_id;
  insert into public.members (circle_id, user_id) values (v_id, auth.uid());
  insert into public.status (user_id) values (auth.uid()) on conflict do nothing;
  return query select c.id, c.code, c.name from public.circles c where c.id = v_id;
end $$;

-- připojení kódem (max 8 lidí)
create or replace function public.join_circle(p_code text) returns table (id uuid, code text, name text)
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select c.id into v_id from public.circles c where c.code = upper(trim(p_code));
  if v_id is null then raise exception 'no such circle'; end if;
  if (select count(*) from public.members m where m.circle_id = v_id) >= 8 then raise exception 'circle full'; end if;
  insert into public.members (circle_id, user_id) values (v_id, auth.uid()) on conflict do nothing;
  insert into public.status (user_id) values (auth.uid()) on conflict do nothing;
  return query select c.id, c.code, c.name from public.circles c where c.id = v_id;
end $$;

-- palec: max 3 denně na jednu osobu, jen v rámci společného kruhu, ne sobě
create or replace function public.send_nudge(p_circle uuid, p_to uuid, p_kind text default 'palec') returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_to = auth.uid() then raise exception 'self'; end if;
  if not exists (select 1 from public.members where circle_id = p_circle and user_id = auth.uid())
     or not exists (select 1 from public.members where circle_id = p_circle and user_id = p_to) then raise exception 'not members'; end if;
  select count(*) into n from public.nudges where from_user = auth.uid() and to_user = p_to and day = current_date;
  if n >= 3 then raise exception 'limit'; end if;
  insert into public.nudges (circle_id, from_user, to_user, kind) values (p_circle, auth.uid(), p_to, p_kind);
  return n + 1;
end $$;

-- mince z podpory: +1 za poslaný palec (max 3 denně), +1 za přijatý
create or replace function public.nudge_coins() returns table (sent int, received int)
language sql security definer stable set search_path = public as $$
  select
    coalesce((select sum(least(c, 3))::int from (select count(*) c from public.nudges where from_user = auth.uid() group by day) s), 0),
    coalesce((select count(*)::int from public.nudges where to_user = auth.uid()), 0)
$$;

grant execute on function public.create_circle(text), public.join_circle(text), public.send_nudge(uuid, uuid, text), public.nudge_coins(), public.my_circles(), public.same_circle(uuid) to authenticated;
revoke execute on function public.create_circle(text), public.join_circle(text), public.send_nudge(uuid, uuid, text), public.nudge_coins(), public.my_circles(), public.same_circle(uuid) from public, anon;
