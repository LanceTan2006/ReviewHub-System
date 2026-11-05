-- ReviewHub Supabase schema
-- Safe to re-run from a clean slate.

DROP VIEW IF EXISTS public.user_role_permissions;
DROP VIEW IF EXISTS public.active_enrollments;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP TABLE IF EXISTS public.ai_chat_messages CASCADE;
DROP TABLE IF EXISTS public.ai_chat_sessions CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.mock_exam_questions CASCADE;
DROP TABLE IF EXISTS public.mock_exams CASCADE;
DROP TABLE IF EXISTS public.mock_exam_questions CASCADE;
DROP TABLE IF EXISTS public.quiz_sets CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.payment_transactions CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.lesson_materials CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.review_packages CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique,
  full_name text not null,
  email citext not null unique,
  password_hash text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  primary key (profile_id, role_id)
);

create table if not exists public.review_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text not null,
  price numeric(12,2) not null default 0,
  period text not null,
  category text not null,
  is_popular boolean not null default false,
  total_modules integer not null default 0,
  mock_exam_count integer not null default 0,
  features text[] not null default '{}',
  status text not null default 'active' check (status in ('active','draft','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references public.review_packages(id) on delete set null,
  title text not null,
  subject text not null,
  duration text not null,
  instructor text,
  materials_count integer not null default 0,
  completed boolean not null default false,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  next_quiz_available boolean not null default false,
  content_summary text,
  key_takeaways text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  file_name text not null,
  object_path text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid not null references public.review_packages(id) on delete cascade,
  enrollment_date timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','pending','completed','cancelled')),
  amount numeric(12,2) not null default 0,
  batch text,
  academic_progress integer not null default 0 check (academic_progress between 0 and 100)
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid references public.review_packages(id) on delete set null,
  amount numeric(12,2) not null,
  payment_method text not null,
  reference_number text not null unique,
  status text not null default 'pending' check (status in ('verified','pending','failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_sets (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references public.review_packages(id) on delete set null,
  title text not null,
  subject text not null,
  description text,
  difficulty text not null default 'Moderate' check (difficulty in ('Easy','Moderate','Challenging')),
  item_count integer not null default 0,
  total_questions integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_set_id uuid not null references public.quiz_sets(id) on delete cascade,
  set_id uuid references public.quiz_sets(id) on delete cascade,  -- legacy alias, kept for compat
  subject text not null,
  difficulty text not null check (difficulty in ('Easy','Moderate','Challenging')),
  question text not null,
  options text[] not null,
  correct_index integer not null check (correct_index >= 0),
  explanation text,
  item_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(5,2) not null default 0,
  total_questions integer not null default 0,
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.mock_exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  package_id uuid references public.review_packages(id) on delete set null,
  total_questions integer not null default 0,
  duration_minutes integer not null default 60,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid references public.review_packages(id) on delete set null,
  certificate_code text not null unique,
  issue_date timestamptz not null default now(),
  status text not null default 'issued' check (status in ('issued','pending','revoked'))
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all' check (audience in ('all','student','frontdesk','proctor','manager','admin')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'AI Review Session',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions(id) on delete cascade,
  sender text not null check (sender in ('user','ai')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_user_roles_role_id on public.user_roles(role_id);
create index if not exists idx_enrollments_profile_id on public.enrollments(profile_id);
create index if not exists idx_payment_transactions_profile_id on public.payment_transactions(profile_id);
create index if not exists idx_lessons_package_id on public.lessons(package_id);
create index if not exists idx_lesson_materials_lesson_id on public.lesson_materials(lesson_id);
create index if not exists idx_quiz_questions_subject on public.quiz_questions(subject);
create index if not exists idx_quiz_questions_set_id on public.quiz_questions(set_id);
create index if not exists idx_announcements_audience on public.announcements(audience);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.has_admin_or_manager_role()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.profile_id = auth.uid()
      and r.name in ('admin', 'manager')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, firebase_uid, full_name, email, avatar_url, is_active)
  values (
    new.id,
    new.id::text,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    null,
    true
  )
  on conflict (id) do update
  set full_name = coalesce(public.profiles.full_name, excluded.full_name),
      email = excluded.email,
      avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
      is_active = coalesce(public.profiles.is_active, true),
      firebase_uid = coalesce(public.profiles.firebase_uid, excluded.firebase_uid);

  return new;
end;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (
  auth.uid() = id
  or public.has_admin_or_manager_role()
);

create policy "profiles_insert_own_or_admin"
on public.profiles
for insert
with check (
  auth.uid() = id
  or public.has_admin_or_manager_role()
);

create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (
  auth.uid() = id
  or public.has_admin_or_manager_role()
)
with check (
  auth.uid() = id
  or public.has_admin_or_manager_role()
);

create policy "profiles_delete_admin_only"
on public.profiles
for delete
using (public.has_admin_or_manager_role());

create policy "user_roles_select_own_or_admin"
on public.user_roles
for select
using (
  profile_id = auth.uid()
  or public.has_admin_or_manager_role()
);

create policy "user_roles_insert_admin_only"
on public.user_roles
for insert
with check (public.has_admin_or_manager_role());

create policy "user_roles_update_admin_only"
on public.user_roles
for update
using (public.has_admin_or_manager_role())
with check (public.has_admin_or_manager_role());

create policy "user_roles_delete_admin_only"
on public.user_roles
for delete
using (public.has_admin_or_manager_role());

-- Seed views for application use
create or replace view public.user_role_permissions as
select p.id as profile_id,
       p.email,
       p.full_name,
       r.name as role_name,
       perm.name as permission_name
from public.profiles p
join public.user_roles ur on ur.profile_id = p.id
join public.roles r on r.id = ur.role_id
join public.role_permissions rp on rp.role_id = r.id
join public.permissions perm on perm.id = rp.permission_id;

create or replace view public.active_enrollments as
select e.id,
       e.profile_id,
       p.full_name,
       rp.title as package_title,
       e.status,
       e.academic_progress,
       e.enrollment_date
from public.enrollments e
join public.profiles p on p.id = e.profile_id
join public.review_packages rp on rp.id = e.package_id
where e.status in ('active','pending','completed');

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trg_packages_updated_at ON public.review_packages;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger trg_packages_updated_at
before update on public.review_packages
for each row
execute function public.set_updated_at();
