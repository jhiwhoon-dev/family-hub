-- Family Hub 데이터베이스 스키마
-- Supabase 대시보드 > SQL Editor 에서 그대로 실행하세요.

-- 1) 가족 구성원 프로필 (auth.users 와 1:1)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 회원가입 시 profiles 행 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) 가보고 싶은 장소
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  category text not null check (category in ('cafe', 'restaurant', 'travel', 'activity', 'etc')),
  address text,
  lat double precision,
  lng double precision,
  naver_map_url text,
  memo text,
  status text not null default 'want_to_go' check (status in ('want_to_go', 'visited')),
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

-- 3) 가족 일정
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  end_date date,
  all_day boolean not null default true,
  repeat_yearly boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4) 관심 뉴스 - 구독 피드 (RSS)
create table if not exists public.news_feeds (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  feed_url text not null unique,
  created_at timestamptz not null default now()
);

-- 5) 관심 뉴스 - 수집된 기사 캐시
create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  feed_id uuid not null references public.news_feeds (id) on delete cascade,
  title text not null,
  link text not null,
  published_at timestamptz,
  summary text,
  created_at timestamptz not null default now(),
  unique (feed_id, link)
);

-- ---------------------------------------------------------------------
-- Row Level Security: 로그인한 가족 구성원 전원이 모든 데이터를 보고
-- 쓸 수 있도록 허용합니다 (가족 공용 사이트 전제). 나중에 더 엄격하게
-- 바꾸고 싶다면 각 정책의 using/with check 절을 auth.uid() = created_by
-- 로 좁히면 됩니다.
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.events enable row level security;
alter table public.news_feeds enable row level security;
alter table public.news_articles enable row level security;

create policy "profiles: 가족 전원 열람" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles: 본인만 수정" on public.profiles
  for update using (auth.uid() = id);

create policy "places: 가족 전원 열람" on public.places
  for select using (auth.role() = 'authenticated');
create policy "places: 가족 전원 등록" on public.places
  for insert with check (auth.role() = 'authenticated');
create policy "places: 가족 전원 수정" on public.places
  for update using (auth.role() = 'authenticated');
create policy "places: 가족 전원 삭제" on public.places
  for delete using (auth.role() = 'authenticated');

create policy "events: 가족 전원 열람" on public.events
  for select using (auth.role() = 'authenticated');
create policy "events: 가족 전원 등록" on public.events
  for insert with check (auth.role() = 'authenticated');
create policy "events: 가족 전원 수정" on public.events
  for update using (auth.role() = 'authenticated');
create policy "events: 가족 전원 삭제" on public.events
  for delete using (auth.role() = 'authenticated');

create policy "news_feeds: 가족 전원 열람" on public.news_feeds
  for select using (auth.role() = 'authenticated');
create policy "news_feeds: 가족 전원 등록" on public.news_feeds
  for insert with check (auth.role() = 'authenticated');
create policy "news_feeds: 가족 전원 삭제" on public.news_feeds
  for delete using (auth.role() = 'authenticated');

create policy "news_articles: 가족 전원 열람" on public.news_articles
  for select using (auth.role() = 'authenticated');
create policy "news_articles: service role 쓰기" on public.news_articles
  for insert with check (auth.role() = 'authenticated');
