-- ============================================================
-- ReviewHub — Seed Data
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- This runs as postgres superuser so it bypasses RLS.
-- ============================================================

-- ── 1. Roles ─────────────────────────────────────────────────
insert into public.roles (name, description) values
  ('student',   'Student user'),
  ('frontdesk', 'Front desk staff'),
  ('proctor',   'Exam proctor'),
  ('manager',   'Operations manager'),
  ('admin',     'System administrator')
on conflict (name) do nothing;

-- ── 2. Permissions ───────────────────────────────────────────
insert into public.permissions (name, description) values
  ('read',                    'Read access'),
  ('write',                   'Write access'),
  ('delete',                  'Delete access'),
  ('view_own_profile',        'View own profile'),
  ('edit_own_profile',        'Edit own profile'),
  ('view_packages',           'View learning packages'),
  ('enroll',                  'Enroll in a package'),
  ('view_own_enrollment',     'View own enrollment'),
  ('view_own_payments',       'View own payments'),
  ('view_lessons',            'View lessons'),
  ('take_quiz',               'Take practice quiz'),
  ('take_mock_exam',          'Take mock exam'),
  ('use_ai_reviewer',         'Use AI reviewer'),
  ('view_certificates',       'View certificates'),
  ('view_announcements',      'View announcements'),
  ('manage_students',         'Manage students'),
  ('manage_enrollment',       'Manage enrollment'),
  ('manage_payments',         'Manage payments'),
  ('manage_schedule',         'Manage schedule'),
  ('view_reports',            'View reports'),
  ('manage_lessons',          'Manage lessons'),
  ('manage_quiz',             'Manage quizzes'),
  ('manage_mock_exam',        'Manage mock exams'),
  ('view_student_performance','View student performance'),
  ('manage_users',            'Manage users'),
  ('assign_roles',            'Assign roles'),
  ('manage_packages',         'Manage packages'),
  ('monitor_enrollment',      'Monitor enrollment'),
  ('monitor_payments',        'Monitor payments'),
  ('monitor_schedule',        'Monitor schedule'),
  ('view_analytics',          'View analytics'),
  ('manage_settings',         'Manage settings'),
  ('manage_backup',           'Manage backups')
on conflict (name) do nothing;

-- ── 3. Role → Permission mapping ─────────────────────────────
with role_map as (select id, name from public.roles),
     perm_map as (select id, name from public.permissions)
insert into public.role_permissions (role_id, permission_id)
select rm.id, pm.id
from role_map rm join perm_map pm on (
  (rm.name = 'student'   and pm.name in ('read','view_own_profile','edit_own_profile','view_packages','enroll','view_own_enrollment','view_own_payments','view_lessons','take_quiz','take_mock_exam','use_ai_reviewer','view_certificates','view_announcements'))
  or (rm.name = 'frontdesk' and pm.name in ('read','write','view_own_profile','edit_own_profile','manage_students','manage_enrollment','manage_payments','manage_schedule','view_reports','view_announcements'))
  or (rm.name = 'proctor'   and pm.name in ('read','write','view_own_profile','edit_own_profile','manage_lessons','manage_quiz','manage_mock_exam','view_student_performance','view_announcements'))
  or (rm.name = 'manager'   and pm.name in ('read','write','delete','view_own_profile','edit_own_profile','manage_users','assign_roles','manage_students','manage_packages','monitor_enrollment','monitor_payments','monitor_schedule','view_reports','view_analytics','manage_settings','manage_backup','view_announcements','manage_enrollment','manage_payments','manage_schedule','manage_lessons','manage_quiz','manage_mock_exam','view_student_performance'))
  or (rm.name = 'admin'     and pm.name in ('read','write','delete','view_own_profile','edit_own_profile','manage_users','assign_roles','manage_students','manage_packages','monitor_enrollment','monitor_payments','monitor_schedule','view_reports','view_analytics','manage_settings','manage_backup','view_announcements','manage_enrollment','manage_payments','manage_schedule','manage_lessons','manage_quiz','manage_mock_exam','view_student_performance'))
)
on conflict (role_id, permission_id) do nothing;

-- ── 4. Review packages ────────────────────────────────────────
insert into public.review_packages (slug, title, subtitle, description, price, period, category, is_popular, total_modules, mock_exam_count, features, status)
values
  ('prc-licensure-comprehensive', 'PRC Licensure Comprehensive', 'For graduating seniors & degree holders', 'Complete high-yield review curriculum.', 7999.00, '6-Month Access', 'Licensure', true, 68, 5, ARRAY['Full syllabus modular lectures','AI-powered adaptive study plan','5 full-length mock exams','Unlimited AI reviewer summaries'], 'active'),
  ('college-entrance-intensive', 'College Entrance Exam (CET) Intensive', 'For Grade 11 & 12 students', 'Targeted preparation for entrance exams.', 4999.00, '4-Month Access', 'College Entrance', false, 42, 4, ARRAY['Math, Science, and English drills','Time-pressure test simulators','Detailed rationales'], 'active'),
  ('civil-service-pass', 'Civil Service Examination Pass', 'For government eligibility aspirants', 'Preparation for civil service exams.', 3499.00, '3-Month Access', 'Civil Service', false, 36, 3, ARRAY['Constitution modules','Numerical ability drills','Verbal ability tests'], 'active'),
  ('ielts-masterclass', 'IELTS Academic & General Training Masterclass', 'For international study and migration', 'Band-boosting curriculum for IELTS.', 6999.00, '5-Month Access', 'IELTS / Language', true, 50, 6, ARRAY['Official mock scoring','AI essay grading','Speaking evaluation','Band 7.5+ strategy'], 'active')
on conflict (slug) do nothing;

-- ── 5. Lessons ────────────────────────────────────────────────
insert into public.lessons (package_id, title, subject, duration, instructor, materials_count, completed, progress_percent, next_quiz_available, content_summary, key_takeaways)
select rp.id, v.title, v.subject, v.duration, v.instructor, v.materials_count, v.completed, v.progress_percent, v.next_quiz_available, v.content_summary, v.key_takeaways
from (values
  ('PRC Licensure Comprehensive', 'Core Principles of Thermodynamics & Energy Transfer', 'General Engineering Sciences', '45 mins', 'Engr. Marco Santos, M.Sc.', 4, true, 100, true, 'Energy transfer and system laws', ARRAY['Entropy','Heat transfer','System efficiency']),
  ('PRC Licensure Comprehensive', 'Constitutional Law, General Principles & Bill of Rights', 'Professional Ethics & Law', '60 mins', 'Atty. Cristina Valderrama', 6, true, 100, true, 'Foundations of constitutional rights', ARRAY['Due process','Equal protection','Bill of Rights']),
  ('PRC Licensure Comprehensive', 'Fluid Mechanics: Laminar and Turbulent Flow in Pipes', 'Applied Physical Sciences', '50 mins', 'Dr. Ramon Delgado', 5, false, 65, true, 'Flow regimes and pressure losses', ARRAY['Laminar flow','Reynolds number','Head loss']),
  ('College Entrance Exam (CET) Intensive', 'Quantitative Data Analysis & Probability Distributions', 'Applied Mathematics', '55 mins', 'Prof. Helen Ramirez', 3, false, 20, false, 'Statistics and probability review', ARRAY['Mean','Variance','Probability']),
  ('Civil Service Examination Pass', 'Ethics and Public Service Standards', 'Civil Service Review', '40 mins', 'Dr. Maria Solis', 2, false, 0, false, 'Ethics in government work', ARRAY['Integrity','Transparency','Accountability'])
) as v(package_title, title, subject, duration, instructor, materials_count, completed, progress_percent, next_quiz_available, content_summary, key_takeaways)
join public.review_packages rp on rp.title = v.package_title
where not exists (select 1 from public.lessons where title = v.title);

-- ── 6. Quiz set ───────────────────────────────────────────────
insert into public.quiz_sets (title, subject, difficulty, item_count, total_questions)
values ('General Board Exam Drill', 'Mixed', 'Moderate', 5, 5)
on conflict do nothing;

-- ── 7. Quiz questions (attached to the set above) ─────────────
insert into public.quiz_questions (quiz_set_id, set_id, subject, difficulty, question, options, correct_index, explanation, item_order)
select qs.id, qs.id, v.subject, v.difficulty, v.question, v.options, v.correct_index, v.explanation, v.item_order
from (values
  ('Thermodynamics',    'Moderate',    'According to the Second Law of Thermodynamics, which statement correctly describes the behavior of a closed natural system?',   ARRAY['The total energy always increases','The entropy of an isolated system never decreases spontaneously','Heat flows from cold to hot without work','Absolute zero is achievable in finite cycles'], 1, 'The entropy of an isolated system always increases or remains constant over time. Natural processes are irreversible.',        1),
  ('Constitutional Law','Easy',        'Which constitutional section protects a person from self-incrimination during custodial investigations?',                         ARRAY['Article III, Section 12','Article V, Section 2','Article VI, Section 1','Article IX, Section 2'],                                                                                              0, 'Article III, Section 12 protects the right to remain silent and to have independent counsel.',                               2),
  ('Fluid Dynamics',    'Moderate',    'If Reynolds number is 1450 in a pipe, which flow regime is present?',                                                            ARRAY['Turbulent','Critical transition','Laminar','Sonic'],                                                                                                                                          2, 'Re < 2100 indicates laminar flow inside pipes.',                                                                             3),
  ('Organic Chemistry', 'Challenging', 'Which compound gives a positive Tollens test?',                                                                                  ARRAY['Propanone','Benzophenone','Ethanal','Ethyl ethanoate'],                                                                                                                                2, 'Aldehydes reduce Tollens reagent to silver metal. Ethanal is an aldehyde.',                                                  4),
  ('Statistics',        'Easy',        'If variance is 36, what is the standard deviation?',                                                                             ARRAY['18','6','72','1296'],                                                                                                                                                                         1, 'The standard deviation is the square root of the variance: sqrt(36) = 6.',                                                   5)
) as v(subject, difficulty, question, options, correct_index, explanation, item_order)
cross join (select id from public.quiz_sets where title = 'General Board Exam Drill' limit 1) qs
where not exists (select 1 from public.quiz_questions where question = v.question);

-- ── 8. Announcements ─────────────────────────────────────────
insert into public.announcements (title, body, audience) values
  ('November 2026 Board Exam Preparation Schedule Released', 'The November 2026 PRC Licensure Examination intensive review schedule has been finalized. Students enrolled in Batch Alpha are required to attend the Saturday diagnostic mock exams starting November 2.', 'all'),
  ('AI Reviewer Engine Updated — Gemini 2.0 Flash Integration', 'The AI Reviewer has been upgraded to Gemini 2.0 Flash. Upload your PDF notes and receive richer, more accurate summaries and flashcard sets. Response time reduced by 40%.', 'all'),
  ('Holiday Schedule — November 1–2 Suspension of Classes', 'In observance of All Saints'' Day and All Souls'' Day, all live Q&A sessions will be suspended on November 1–2. Online AI Reviewer and self-paced modules remain available 24/7.', 'all'),
  ('Front Desk: Payment Reference Verification Required', 'Please verify GCash and Maya reference numbers before approving enrollment records.', 'frontdesk'),
  ('Proctor Schedule Update', 'Please review the exam calendar before the next mock exam cycle.', 'proctor')
on conflict do nothing;

-- Verify
select 'roles'           as tbl, count(*) from public.roles           union all
select 'permissions',            count(*) from public.permissions      union all
select 'review_packages',        count(*) from public.review_packages  union all
select 'lessons',                count(*) from public.lessons          union all
select 'quiz_sets',              count(*) from public.quiz_sets        union all
select 'quiz_questions',         count(*) from public.quiz_questions   union all
select 'announcements',          count(*) from public.announcements
order by 1;
