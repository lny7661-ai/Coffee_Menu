-- Run in Supabase SQL Editor or via CLI migrate
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  menu text not null,
  session_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_session_created_idx
  on public.orders (session_id, created_at desc);

alter table public.orders enable row level security;

create policy "orders_anon_insert"
  on public.orders for insert
  to anon
  with check (true);

create policy "orders_anon_select"
  on public.orders for select
  to anon
  using (true);

-- Realtime: Dashboard → Database → Replication → orders 테이블 활성화
-- 또는:
-- alter publication supabase_realtime add table public.orders;
