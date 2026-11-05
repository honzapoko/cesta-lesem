-- Kruhy v3: vzkazy (posts) + sdílené položky dne (status.items), aby šlo rozkliknout, co kdo dnes udělal.
-- Spustit v Supabase → SQL Editor. Idempotentní (obsahuje i v2, stačí spustit jen tohle).
alter table public.status add column if not exists items jsonb not null default '[]'::jsonb;

create table if not exists public.posts (
  id bigserial primary key,
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  to_user uuid references auth.users(id) on delete set null,
  text text not null check (char_length(text) between 1 and 160),
  created_at timestamptz not null default now()
);
create index if not exists posts_circle_time on public.posts (circle_id, created_at desc);
alter table public.posts enable row level security;
drop policy if exists posts_select on public.posts;
create policy posts_select on public.posts for select to authenticated using (circle_id in (select public.my_circles()));
drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert to authenticated with check (user_id = auth.uid() and circle_id in (select public.my_circles()));
drop policy if exists posts_delete on public.posts;
create policy posts_delete on public.posts for delete to authenticated using (user_id = auth.uid() or circle_id in (select id from public.circles where owner = auth.uid()));
notify pgrst, 'reload schema';
