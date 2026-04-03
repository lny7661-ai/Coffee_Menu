-- 참가자 카카오 로그인 — 세션당 카카오 사용자 1행 (메뉴는 한 셀에 줄바꿈으로 묶음)
alter table public.orders add column if not exists kakao_id text;
alter table public.orders add column if not exists updated_at timestamptz default now();

-- 동일 세션·동일 카카오 ID 중복 방지 (NULL kakao_id 는 기존 행 여러 개 허용)
create unique index if not exists orders_session_kakao_uidx
  on public.orders (session_id, kakao_id)
  where kakao_id is not null;

drop policy if exists "orders_anon_update" on public.orders;
create policy "orders_anon_update"
  on public.orders for update
  to anon
  using (true)
  with check (true);
