-- 방(rooms) + orders.room_id + menu 컬럼명을 menu_item 으로 통일
-- 기존 session_id 기반 주문은 마이그레이션용 rooms 행이 자동 생성됩니다.

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;
-- anon 은 rooms 에 직접 접근하지 않음 (비밀번호 해시는 서버·service role 만)

-- menu -> menu_item
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'menu'
  ) then
    alter table public.orders rename column menu to menu_item;
  end if;
end $$;

alter table public.orders add column if not exists room_id uuid references public.rooms(id);

-- 레거시 주문이 있던 session_id 마다 rooms 행 생성 (비밀번호: 마이그레이션 전용 해시)
insert into public.rooms (id, room_name, password_hash)
select distinct on (o.session_id)
  o.session_id::uuid,
  '이전 방 (마이그레이션)',
  '$2b$10$xhAq2cHInWnDs6EYCNfguOTKUhIyPYZCun26Aou6PmSMaV7d1C/Hq'
from public.orders o
where o.session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
on conflict (id) do nothing;

update public.orders o
set room_id = o.session_id::uuid
where o.room_id is null
  and o.session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- UUID 로 rooms 에 매핑되지 않은 레거시 행 제거 (이상한 session_id 만 남은 경우)
delete from public.orders where room_id is null;

drop index if exists public.orders_session_kakao_uidx;
create unique index if not exists orders_room_kakao_uidx
  on public.orders (room_id, kakao_id)
  where kakao_id is not null;

alter table public.orders alter column room_id set not null;
