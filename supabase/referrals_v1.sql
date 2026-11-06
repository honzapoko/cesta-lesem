-- Poquito – doporučení (spustit v SQL Editoru; idempotentní)
-- Každý přihlášený má kód (my_ref_code). Nový uživatel otevře odkaz ?ref=KOD, po přihlášení zavolá claim_referral.
-- Doporučující dostane mince v appce (REF_COINS v app.js) za každého pozvaného s aspoň 3 aktivními dny; pozvaný REF_WELCOME na uvítanou.
-- Pravidla proti zneužití: ne sám sebe, každý může být pozván jen jednou, pozvat jde jen účet mladší než 14 dní.

create table if not exists public.referral_codes (
  user_id uuid primary key references auth.users on delete cascade,
  code text unique not null,
  created_at timestamptz not null default now()
);
create table if not exists public.referrals (
  referee uuid primary key references auth.users on delete cascade,
  referrer uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists referrals_referrer on public.referrals (referrer);
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
-- bez policies: tabulky jsou dostupné jen přes funkce níže

create or replace function public.my_ref_code() returns text
language plpgsql security definer set search_path = public as $$
declare v_code text; v_try int := 0; v_alpha text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; i int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select code into v_code from public.referral_codes where user_id = auth.uid();
  if v_code is not null then return v_code; end if;
  loop
    v_code := '';
    for i in 1..7 loop v_code := v_code || substr(v_alpha, 1 + floor(random() * length(v_alpha))::int, 1); end loop;
    exit when not exists (select 1 from public.referral_codes r where r.code = v_code);
    v_try := v_try + 1; if v_try > 20 then raise exception 'code'; end if;
  end loop;
  insert into public.referral_codes (user_id, code) values (auth.uid(), v_code);
  return v_code;
end $$;

create or replace function public.claim_referral(p_code text) returns int
language plpgsql security definer set search_path = public as $$
declare v_ref uuid; v_created timestamptz;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if exists (select 1 from public.referrals where referee = auth.uid()) then raise exception 'already'; end if;
  select user_id into v_ref from public.referral_codes where code = upper(trim(p_code));
  if v_ref is null then raise exception 'no such code'; end if;
  if v_ref = auth.uid() then raise exception 'self'; end if;
  select created_at into v_created from auth.users where id = auth.uid();
  if v_created < now() - interval '14 days' then raise exception 'too old'; end if;
  insert into public.referrals (referee, referrer) values (auth.uid(), v_ref);
  return 1;
end $$;

-- invited = kolik lidí jsem pozval; active = z nich s aspoň 3 aktivními dny (v tabulce days je aspoň jedna fajfka); welcome = 1, když mě někdo pozval
create or replace function public.my_referrals() returns table (invited int, active int, welcome int)
language sql security definer stable set search_path = public as $$
  select
    (select count(*)::int from public.referrals where referrer = auth.uid()),
    (select count(*)::int from public.referrals r where r.referrer = auth.uid() and (
       select count(*) from public.days d where d.user_id = r.referee
         and exists (select 1 from jsonb_each(d.data) e where jsonb_typeof(e.value) = 'object' and (e.value->>'d') in ('true', '1'))
     ) >= 3),
    (select count(*)::int from public.referrals where referee = auth.uid())
$$;

grant execute on function public.my_ref_code(), public.claim_referral(text), public.my_referrals() to authenticated;
revoke execute on function public.my_ref_code(), public.claim_referral(text), public.my_referrals() from public, anon;
notify pgrst, 'reload schema';
