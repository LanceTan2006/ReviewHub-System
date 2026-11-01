-- ReviewHub Supabase schema
-- This schema implements the core RBAC model, app records, and seed data for ReviewHub.
-- Replace raw password values with password_hash values in production.
-- Safe to re-run from a clean slate so partial imports do not leave missing columns behind.

DROP VIEW IF EXISTS public.user_role_permissions;
DROP VIEW IF EXISTS public.active_enrollments;
DROP FUNCTION IF EXISTS public.set_updated_at();
DROP TABLE IF EXISTS public.ai_chat_messages CASCADE;
DROP TABLE IF EXISTS public.ai_chat_sessions CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.mock_exams CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.payment_transactions CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
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
  full_name text not null,
  email citext not null unique,
  password_hash text not null,
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

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  difficulty text not null check (difficulty in ('Easy','Moderate','Challenging')),
  question text not null,
  options text[] not null,
  correct_index integer not null check (correct_index >= 0),
  explanation text,
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
create index if not exists idx_quiz_questions_subject on public.quiz_questions(subject);
create index if not exists idx_announcements_audience on public.announcements(audience);

-- Seed roles
insert into public.roles (name, description)
values
  ('student', 'Student user'),
  ('frontdesk', 'Front desk staff'),
  ('proctor', 'Exam proctor'),
  ('manager', 'Operations manager'),
  ('admin', 'System administrator')
on conflict (name) do nothing;

-- Seed permissions
insert into public.permissions (name, description)
values
  ('read', 'Read access'),
  ('write', 'Write access'),
  ('delete', 'Delete access'),
  ('view_own_profile', 'View own profile'),
  ('edit_own_profile', 'Edit own profile'),
  ('view_packages', 'View learning packages'),
  ('enroll', 'Enroll in a package'),
  ('view_own_enrollment', 'View own enrollment'),
  ('view_own_payments', 'View own payments'),
  ('view_lessons', 'View lessons'),
  ('take_quiz', 'Take practice quiz'),
  ('take_mock_exam', 'Take mock exam'),
  ('use_ai_reviewer', 'Use AI reviewer'),
  ('view_certificates', 'View certificates'),
  ('view_announcements', 'View announcements'),
  ('manage_students', 'Manage students'),
  ('manage_enrollment', 'Manage enrollment'),
  ('manage_payments', 'Manage payments'),
  ('manage_schedule', 'Manage schedule'),
  ('view_reports', 'View reports'),
  ('manage_lessons', 'Manage lessons'),
  ('manage_quiz', 'Manage quizzes'),
  ('manage_mock_exam', 'Manage mock exams'),
  ('view_student_performance', 'View student performance'),
  ('manage_users', 'Manage users'),
  ('assign_roles', 'Assign roles'),
  ('manage_packages', 'Manage packages'),
  ('monitor_enrollment', 'Monitor enrollment'),
  ('monitor_payments', 'Monitor payments'),
  ('monitor_schedule', 'Monitor schedule'),
  ('view_analytics', 'View analytics'),
  ('manage_settings', 'Manage settings'),
  ('manage_backup', 'Manage backups')
on conflict (name) do nothing;

-- Seed RBAC mapping
with role_map as (
  select id, name from public.roles
), permission_map as (
  select id, name from public.permissions
)
insert into public.role_permissions (role_id, permission_id)
select rm.id, pm.id
from role_map rm
join permission_map pm on (
  (rm.name = 'student' and pm.name in (
    'read','view_own_profile','edit_own_profile','view_packages','enroll',
    'view_own_enrollment','view_own_payments','view_lessons','take_quiz',
    'take_mock_exam','use_ai_reviewer','view_certificates','view_announcements'))
  or (rm.name = 'frontdesk' and pm.name in (
    'read','write','view_own_profile','edit_own_profile','manage_students',
    'manage_enrollment','manage_payments','manage_schedule','view_reports',
    'view_announcements'))
  or (rm.name = 'proctor' and pm.name in (
    'read','write','view_own_profile','edit_own_profile','manage_lessons',
    'manage_quiz','manage_mock_exam','view_student_performance','view_announcements'))
  or (rm.name = 'manager' and pm.name in (
    'read','write','delete','view_own_profile','edit_own_profile','manage_users',
    'assign_roles','manage_students','manage_packages','monitor_enrollment',
    'monitor_payments','monitor_schedule','view_reports','view_analytics',
    'manage_settings','manage_backup','view_announcements','manage_enrollment',
    'manage_payments','manage_schedule','manage_lessons','manage_quiz',
    'manage_mock_exam','view_student_performance'))
  or (rm.name = 'admin' and pm.name in (
    'read','write','delete','view_own_profile','edit_own_profile','manage_users',
    'assign_roles','manage_students','manage_packages','monitor_enrollment',
    'monitor_payments','monitor_schedule','view_reports','view_analytics',
    'manage_settings','manage_backup','view_announcements','manage_enrollment',
    'manage_payments','manage_schedule','manage_lessons','manage_quiz',
    'manage_mock_exam','view_student_performance'))
)
on conflict (role_id, permission_id) do nothing;

-- Seed sample users (kept in DB schema for real app setup)
insert into public.profiles (full_name, email, password_hash, avatar_url, is_active)
values
  ('Alyssa Reyes', 'alyssa.reyes@univ.edu.ph', 'Student@123', null, true),
  ('Maria Santos', 'maria.santos@meliorahub.edu.ph', 'FrontDesk@123', null, true),
  ('Dr. Ramon Delgado', 'r.delgado@meliorahub.edu.ph', 'Proctor@123', null, true),
  ('Catherine Lim', 'c.lim@meliorahub.edu.ph', 'Manager@123', null, true),
  ('Joshua Bautista', 'j.bautista@meliorahub.edu.ph', 'MultiRole@123', null, true),
  ('System Admin', 'admin@meliorahub.edu.ph', 'Admin@123', null, true)
on conflict (email) do nothing;

with profile_map as (
  select id, email from public.profiles
), role_map as (
  select id, name from public.roles
)
insert into public.user_roles (profile_id, role_id)
select pm.id, rm.id
from profile_map pm
join role_map rm on (
  (pm.email = 'alyssa.reyes@univ.edu.ph' and rm.name = 'student')
  or (pm.email = 'maria.santos@meliorahub.edu.ph' and rm.name = 'frontdesk')
  or (pm.email = 'r.delgado@meliorahub.edu.ph' and rm.name = 'proctor')
  or (pm.email = 'c.lim@meliorahub.edu.ph' and rm.name = 'manager')
  or (pm.email = 'j.bautista@meliorahub.edu.ph' and rm.name in ('frontdesk','proctor'))
  or (pm.email = 'admin@meliorahub.edu.ph' and rm.name = 'admin')
)
on conflict (profile_id, role_id) do nothing;

-- Seed review packages
insert into public.review_packages (slug, title, subtitle, description, price, period, category, is_popular, total_modules, mock_exam_count, features, status)
values
  ('prc-licensure-comprehensive', 'PRC Licensure Comprehensive', 'For graduating seniors & degree holders', 'Complete high-yield review curriculum covering core theory, simulations, and rationalized drills.', 7999.00, '6-Month Access', 'Licensure', true, 68, 5, ARRAY['Full syllabus modular lectures','AI-powered adaptive study plan','5 full-length mock exams','Unlimited AI reviewer summaries','Downloadable summary sheets'], 'active'),
  ('college-entrance-intensive', 'College Entrance Exam (CET) Intensive', 'For Grade 11 & 12 students', 'Targeted preparation for entrance exams and university admissions.', 4999.00, '4-Month Access', 'College Entrance', false, 42, 4, ARRAY['Math, Science, and English drills','Time-pressure test simulators','Detailed rationales','AI flashcards'], 'active'),
  ('civil-service-pass', 'Civil Service Examination Pass', 'For government eligibility aspirants', 'Preparation for sub-professional and professional civil service exams.', 3499.00, '3-Month Access', 'Civil Service', false, 36, 3, ARRAY['Constitution modules','Numerical ability drills','Verbal ability tests'], 'active'),
  ('ielts-masterclass', 'IELTS Academic & General Training Masterclass', 'For international study and migration', 'Targeted band-boosting curriculum for IELTS listening, reading, writing, and speaking.', 6999.00, '5-Month Access', 'IELTS / Language', true, 50, 6, ARRAY['Official mock scoring','AI essay grading','Speaking evaluation','Band 7.5+ strategy'], 'active')
on conflict (slug) do nothing;

-- Seed lessons
insert into public.lessons (package_id, title, subject, duration, instructor, materials_count, completed, progress_percent, next_quiz_available, content_summary, key_takeaways)
select rp.id, v.title, v.subject, v.duration, v.instructor, v.materials_count, v.completed, v.progress_percent, v.next_quiz_available, v.content_summary, v.key_takeaways
from (
  values
    ('PRC Licensure Comprehensive', 'Core Principles of Thermodynamics & Energy Transfer', 'General Engineering Sciences', '45 mins', 'Engr. Marco Santos, M.Sc.', 4, true, 100, true, 'Energy transfer and system laws', ARRAY['Entropy','Heat transfer','System efficiency']),
    ('PRC Licensure Comprehensive', 'Constitutional Law, General Principles & Bill of Rights', 'Professional Ethics & Law', '60 mins', 'Atty. Cristina Valderrama', 6, true, 100, true, 'Foundations of constitutional rights', ARRAY['Due process','Equal protection','Bill of Rights']),
    ('PRC Licensure Comprehensive', 'Fluid Mechanics: Laminar and Turbulent Flow in Pipes', 'Applied Physical Sciences', '50 mins', 'Dr. Ramon Delgado', 5, false, 65, true, 'Flow regimes and pressure losses', ARRAY['Laminar flow','Reynolds number','Head loss']),
    ('College Entrance Exam (CET) Intensive', 'Quantitative Data Analysis & Probability Distributions', 'Applied Mathematics', '55 mins', 'Prof. Helen Ramirez', 3, false, 20, false, 'Statistics and probability review', ARRAY['Mean','Variance','Probability']),
    ('Civil Service Examination Pass', 'Ethics and Public Service Standards', 'Civil Service Review', '40 mins', 'Dr. Maria Solis', 2, false, 0, false, 'Ethics in government work', ARRAY['Integrity','Transparency','Accountability'])
) as v(package_title, title, subject, duration, instructor, materials_count, completed, progress_percent, next_quiz_available, content_summary, key_takeaways)
join public.review_packages rp on rp.title = v.package_title;

-- Seed quiz questions
insert into public.quiz_questions (subject, difficulty, question, options, correct_index, explanation)
values
  ('Thermodynamics', 'Moderate', 'According to the Second Law of Thermodynamics, which statement correctly describes the behavior of a closed natural system?', ARRAY['The total energy always increases','The entropy of an isolated system never decreases spontaneously','Heat flows from cold to hot without work','Absolute zero is achievable in finite cycles'], 1, 'The entropy of an isolated system always increases or remains constant over time. Natural processes are irreversible.'),
  ('Constitutional Law', 'Easy', 'Which constitutional section protects a person from self-incrimination during custodial investigations?', ARRAY['Article III, Section 12','Article V, Section 2','Article VI, Section 1','Article IX, Section 2'], 0, 'Article III, Section 12 protects the right to remain silent and to have independent counsel.'),
  ('Fluid Dynamics', 'Moderate', 'If Reynolds number is 1450 in a pipe, which flow regime is present?', ARRAY['Turbulent','Critical transition','Laminar','Sonic'], 2, 'Re < 2100 indicates laminar flow inside pipes.'),
  ('Organic Chemistry', 'Challenging', 'Which compound gives a positive Tollens test?', ARRAY['Propanone','Benzophenone','Ethanal','Ethyl ethanoate'], 2, 'Aldehydes reduce Tollens reagent to silver metal. Ethanal is an aldehyde.'),
  ('Statistics', 'Easy', 'If variance is 36, what is the standard deviation?', ARRAY['18','6','72','1296'], 1, 'The standard deviation is the square root of the variance: sqrt(36) = 6.');

-- Seed announcements
insert into public.announcements (title, body, audience, created_by)
values
  ('Welcome to ReviewHub', 'Your review hub is ready. Please complete your profile and enroll in a package.', 'all', null),
  ('Mock Exam Window', 'Mock exams are now available for licensed review packages.', 'student', null),
  ('Front Desk Training', 'Front desk staff should verify payment references before enrollment approval.', 'frontdesk', null),
  ('Proctor Schedule Update', 'Please review the exam calendar before the next mock exam cycle.', 'proctor', null);

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
