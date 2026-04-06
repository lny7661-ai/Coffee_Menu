-- "room_id column does not exist" 가 rooms INSERT 시점에 나오면,
-- 보통 orders(또는 트리거가 건드리는 테이블)에 room_id 가 아직 없는 경우가 많습니다.
-- 마이그레이션 004 를 건너뛴 프로젝트용 보강입니다.

alter table public.orders add column if not exists room_id uuid references public.rooms(id);

-- 적용 확인 (한 행이라도 나오면 컬럼 존재):
-- select column_name, data_type
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'orders' and column_name = 'room_id';
