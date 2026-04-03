-- 취합 마감 (참가자 화면에서 신규 주문 차단). Supabase 대시보드에서 실행하거나 CLI로 적용하세요.
create table if not exists public.session_closures (
  session_id text primary key,
  closed_at timestamptz not null default now()
);

create index if not exists session_closures_closed_idx
  on public.session_closures (closed_at desc);

alter table public.session_closures enable row level security;

create policy "session_closures_anon_select"
  on public.session_closures for select
  to anon
  using (true);

create policy "session_closures_anon_insert"
  on public.session_closures for insert
  to anon
  with check (true);

create policy "session_closures_anon_update"
  on public.session_closures for update
  to anon
  using (true)
  with check (true);

-- Realtime 사용 시: Replication에서 session_closures 활성화
