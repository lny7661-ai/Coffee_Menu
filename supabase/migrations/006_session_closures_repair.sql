-- session_closures 가 없거나 컬럼이 빠진 프로젝트용 보수(멱등).
-- Supabase SQL Editor 에서 한 번에 실행 가능.

create table if not exists public.session_closures (
  session_id text primary key,
  closed_at timestamptz not null default now()
);

-- 기존 테이블에 closed_at 만 없던 경우(드묾)
alter table public.session_closures
  add column if not exists closed_at timestamptz not null default now();

create index if not exists session_closures_closed_idx
  on public.session_closures (closed_at desc);

alter table public.session_closures enable row level security;

drop policy if exists "session_closures_anon_select" on public.session_closures;
create policy "session_closures_anon_select"
  on public.session_closures for select
  to anon
  using (true);

drop policy if exists "session_closures_anon_insert" on public.session_closures;
create policy "session_closures_anon_insert"
  on public.session_closures for insert
  to anon
  with check (true);

drop policy if exists "session_closures_anon_update" on public.session_closures;
create policy "session_closures_anon_update"
  on public.session_closures for update
  to anon
  using (true)
  with check (true);
