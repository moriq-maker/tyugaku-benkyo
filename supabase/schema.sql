-- 科目テーブル
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,        -- 日本語名（例：数学）
  name_en text not null,     -- 英語名（例：math）※URLに使用
  icon text not null,        -- 絵文字アイコン
  color text not null        -- カラーコード
);

create unique index if not exists subjects_name_en_key on subjects(name_en);

-- 問題テーブル
create table if not exists problems (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade not null,
  grade int not null check (grade between 1 and 3),                   -- 学年（1〜3）
  exam_term text not null default '中1前期中間',                      -- テスト範囲（例：中1前期中間）
  category text not null default '一般',                              -- 問題カテゴリ（例：漢字（読み）、文法）
  passage text,                                                        -- 長文読解用の本文（NULLの場合は通常問題）
  question text not null,                                              -- 問題文
  choice_a text not null,                                              -- 選択肢A
  choice_b text not null,                                              -- 選択肢B
  choice_c text not null,                                              -- 選択肢C
  choice_d text not null,                                              -- 選択肢D
  answer char(1) not null check (answer in ('A','B','C','D')),        -- 正解
  problem_format text not null default 'multiple_choice'
    check (problem_format in ('multiple_choice','short_answer')),      -- 問題形式
  correct_text text,                                                    -- 短答式の正答
  accepted_answers text[] not null default '{}',                        -- 短答式の別解
  explanation text,                                                    -- 解説
  difficulty int default 1 check (difficulty between 1 and 3),       -- 難易度（1:基礎 2:標準 3:応用）
  created_at timestamptz default now()
);

alter table problems add column if not exists problem_format text not null default 'multiple_choice';
alter table problems add column if not exists correct_text text;
alter table problems add column if not exists accepted_answers text[] not null default '{}';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'problems_problem_format_check'
  ) then
    alter table problems
      add constraint problems_problem_format_check
      check (problem_format in ('multiple_choice','short_answer'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'problems_multiple_choice_unique_choices_check'
  ) then
    alter table problems
      add constraint problems_multiple_choice_unique_choices_check
      check (
        problem_format <> 'multiple_choice'
        or (
          choice_a <> choice_b
          and choice_a <> choice_c
          and choice_a <> choice_d
          and choice_b <> choice_c
          and choice_b <> choice_d
          and choice_c <> choice_d
        )
      )
      not valid;
  end if;
end $$;

create index if not exists problems_subject_grade_term_idx on problems(subject_id, grade, exam_term);
create index if not exists problems_subject_grade_format_category_idx on problems(subject_id, grade, problem_format, category);

-- ユーザー回答履歴テーブル
create table if not exists user_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  problem_id uuid references problems(id) on delete cascade not null,
  is_correct boolean not null,
  answered_at timestamptz default now()
);

create index if not exists user_answers_user_id_idx on user_answers(user_id);
create index if not exists user_answers_problem_id_idx on user_answers(problem_id);
create index if not exists user_answers_user_answered_idx on user_answers(user_id, answered_at desc);
create index if not exists user_answers_user_problem_answered_idx on user_answers(user_id, problem_id, answered_at desc);

-- ブックマークテーブル
create table if not exists user_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  problem_id uuid references problems(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, problem_id)
);

create index if not exists user_bookmarks_user_id_idx on user_bookmarks(user_id);
create index if not exists user_bookmarks_problem_id_idx on user_bookmarks(problem_id);

-- 画面表示用の軽量ビュー
create or replace view user_answer_subject_stats
with (security_invoker = true) as
select
  ua.user_id,
  p.subject_id,
  count(*)::int as total,
  count(*) filter (where ua.is_correct)::int as correct
from user_answers ua
join problems p on p.id = ua.problem_id
group by ua.user_id, p.subject_id;

create or replace view latest_user_problem_answers
with (security_invoker = true) as
select distinct on (ua.user_id, ua.problem_id)
  ua.user_id,
  ua.problem_id,
  ua.is_correct,
  ua.answered_at,
  p.subject_id,
  p.grade
from user_answers ua
join problems p on p.id = ua.problem_id
order by ua.user_id, ua.problem_id, ua.answered_at desc;

create or replace view problem_grade_stats as
select
  subject_id,
  grade,
  count(*)::int as total
from problems
group by subject_id, grade;

create or replace view user_answer_category_stats
with (security_invoker = true) as
select
  ua.user_id,
  p.subject_id,
  p.grade,
  p.category,
  count(*)::int as total,
  count(*) filter (where ua.is_correct)::int as correct
from user_answers ua
join problems p on p.id = ua.problem_id
group by ua.user_id, p.subject_id, p.grade, p.category;

create or replace view user_answer_daily_stats
with (security_invoker = true) as
select
  ua.user_id,
  (ua.answered_at at time zone 'Asia/Tokyo')::date as answered_date,
  count(*)::int as total,
  count(*) filter (where ua.is_correct)::int as correct
from user_answers ua
group by ua.user_id, (ua.answered_at at time zone 'Asia/Tokyo')::date;

create or replace view user_problem_review_priority
with (security_invoker = true) as
select
  ua.user_id,
  ua.problem_id,
  p.subject_id,
  p.grade,
  p.category,
  count(*) filter (where not ua.is_correct)::int as wrong_count,
  max(ua.answered_at) filter (where not ua.is_correct) as latest_wrong_at,
  max(ua.answered_at) as latest_answered_at,
  p.problem_format
from user_answers ua
join problems p on p.id = ua.problem_id
group by ua.user_id, ua.problem_id, p.subject_id, p.grade, p.category, p.problem_format
having count(*) filter (where not ua.is_correct) > 0
  and (array_agg(ua.is_correct order by ua.answered_at desc))[1] = false;

drop function if exists get_random_problems(uuid, int, int);
drop function if exists get_random_problems(uuid, int, int, text);

create or replace function get_random_problems(
  p_subject_id uuid,
  p_grade int,
  p_limit int default 10,
  p_problem_format text default 'multiple_choice',
  p_category text default null
)
returns setof problems
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from problems
  where subject_id = p_subject_id
    and grade = p_grade
    and problem_format = p_problem_format
    and (p_category is null or category = p_category)
  order by random()
  limit p_limit;
$$;

create or replace function get_dashboard_summary()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with subject_rows as (
    select
      s.id,
      s.name,
      s.name_en,
      s.icon,
      s.color,
      coalesce(stats.total, 0) as total,
      coalesce(stats.correct, 0) as correct
    from subjects s
    left join user_answer_subject_stats stats
      on stats.subject_id = s.id
      and stats.user_id = auth.uid()
  ),
  latest_wrong as (
    select count(*)::int as total
    from latest_user_problem_answers
    where user_id = auth.uid()
      and is_correct = false
  ),
  bookmark_total as (
    select count(*)::int as total
    from user_bookmarks
    where user_id = auth.uid()
  ),
  daily_rows as (
    select answered_date, total, correct
    from user_answer_daily_stats
    where user_id = auth.uid()
    order by answered_date desc
    limit 7
  ),
  category_rows as (
    select
      category,
      sum(total)::int as total,
      sum(correct)::int as correct
    from user_answer_category_stats
    where user_id = auth.uid()
    group by category
  ),
  weakest as (
    select
      category,
      total,
      correct,
      round((correct::numeric / nullif(total, 0)) * 100)::int as rate
    from category_rows
    where total > 0
    order by rate asc, total desc
    limit 1
  )
  select jsonb_build_object(
    'subjects',
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'name', name,
            'name_en', name_en,
            'icon', icon,
            'color', color,
            'total', total,
            'correct', correct,
            'rate', case when total > 0 then round((correct::numeric / total) * 100)::int else 0 end
          )
          order by name_en
        )
        from subject_rows
      ), '[]'::jsonb),
    'wrong_total', (select total from latest_wrong),
    'bookmark_total', (select total from bookmark_total),
    'daily_stats',
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'answered_date', answered_date,
            'total', total,
            'correct', correct
          )
          order by answered_date
        )
        from daily_rows
      ), '[]'::jsonb),
    'weakest_category', (select to_jsonb(weakest) from weakest)
  );
$$;

create or replace function get_subject_summary(p_subject_en text)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with selected_subject as (
    select *
    from subjects
    where name_en = p_subject_en
    limit 1
  ),
  grade_list as (
    select generate_series(1, 3) as grade
  ),
  problem_rows as (
    select p.id, p.subject_id, p.grade, p.category, p.problem_format
    from problems p
    join selected_subject ss on ss.id = p.subject_id
  ),
  problem_summary as (
    select
      grade,
      count(*)::int as count,
      count(*) filter (where problem_format = 'multiple_choice')::int as multiple_choice_count,
      count(*) filter (where problem_format = 'short_answer')::int as short_answer_count
    from problem_rows
    group by grade
  ),
  category_names as (
    select
      grade,
      jsonb_agg(category order by category) as categories
    from (
      select distinct grade, category
      from problem_rows
    ) distinct_categories
    group by grade
  ),
  review_rows as (
    select
      priority.problem_id,
      priority.grade,
      priority.category,
      priority.problem_format
    from user_problem_review_priority priority
    join selected_subject ss on ss.id = priority.subject_id
    where priority.user_id = auth.uid()
  ),
  review_summary as (
    select
      grade,
      count(*)::int as wrong_count,
      count(*) filter (where problem_format = 'multiple_choice')::int as wrong_multiple_choice_count,
      count(*) filter (where problem_format = 'short_answer')::int as wrong_short_answer_count
    from review_rows
    group by grade
  ),
  bookmark_rows as (
    select p.id as problem_id, p.grade, p.category, p.problem_format
    from user_bookmarks bookmark
    join problem_rows p on p.id = bookmark.problem_id
    where bookmark.user_id = auth.uid()
  ),
  bookmark_summary as (
    select
      grade,
      count(*)::int as bookmark_count,
      count(*) filter (where problem_format = 'multiple_choice')::int as bookmark_multiple_choice_count,
      count(*) filter (where problem_format = 'short_answer')::int as bookmark_short_answer_count
    from bookmark_rows
    group by grade
  ),
  category_rows as (
    select
      p.grade,
      p.category,
      count(*)::int as count,
      count(*) filter (where p.problem_format = 'multiple_choice')::int as multiple_choice_count,
      count(*) filter (where p.problem_format = 'short_answer')::int as short_answer_count,
      count(distinct r.problem_id) filter (where p.problem_format = 'multiple_choice')::int as wrong_multiple_choice_count,
      count(distinct r.problem_id) filter (where p.problem_format = 'short_answer')::int as wrong_short_answer_count,
      count(distinct b.problem_id) filter (where p.problem_format = 'multiple_choice')::int as bookmark_multiple_choice_count,
      count(distinct b.problem_id) filter (where p.problem_format = 'short_answer')::int as bookmark_short_answer_count
    from problem_rows p
    left join review_rows r on r.problem_id = p.id
    left join bookmark_rows b on b.problem_id = p.id
    group by p.grade, p.category
  ),
  category_summaries as (
    select
      grade,
      jsonb_agg(
        jsonb_build_object(
          'category', category,
          'count', count,
          'multiple_choice_count', multiple_choice_count,
          'short_answer_count', short_answer_count,
          'wrong_multiple_choice_count', wrong_multiple_choice_count,
          'wrong_short_answer_count', wrong_short_answer_count,
          'bookmark_multiple_choice_count', bookmark_multiple_choice_count,
          'bookmark_short_answer_count', bookmark_short_answer_count
        )
        order by category
      ) as category_summaries
    from category_rows
    group by grade
  ),
  grade_rows as (
    select
      gl.grade,
      coalesce(ps.count, 0) as count,
      coalesce(ps.multiple_choice_count, 0) as multiple_choice_count,
      coalesce(ps.short_answer_count, 0) as short_answer_count,
      coalesce(cn.categories, '[]'::jsonb) as categories,
      coalesce(cs.category_summaries, '[]'::jsonb) as category_summaries,
      coalesce(rs.wrong_count, 0) as wrong_count,
      coalesce(rs.wrong_multiple_choice_count, 0) as wrong_multiple_choice_count,
      coalesce(rs.wrong_short_answer_count, 0) as wrong_short_answer_count,
      coalesce(bs.bookmark_count, 0) as bookmark_count,
      coalesce(bs.bookmark_multiple_choice_count, 0) as bookmark_multiple_choice_count,
      coalesce(bs.bookmark_short_answer_count, 0) as bookmark_short_answer_count
    from grade_list gl
    left join problem_summary ps on ps.grade = gl.grade
    left join category_names cn on cn.grade = gl.grade
    left join category_summaries cs on cs.grade = gl.grade
    left join review_summary rs on rs.grade = gl.grade
    left join bookmark_summary bs on bs.grade = gl.grade
  ),
  weak_categories as (
    select
      grade,
      category,
      total,
      correct,
      round((correct::numeric / nullif(total, 0)) * 100)::int as rate
    from user_answer_category_stats stats
    join selected_subject ss on ss.id = stats.subject_id
    where stats.user_id = auth.uid()
      and total > 0
    order by rate asc, total desc
    limit 5
  )
  select case
    when not exists (select 1 from selected_subject) then null
    else jsonb_build_object(
      'subject', (select to_jsonb(selected_subject) from selected_subject),
      'grades',
        coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'grade', grade,
              'count', count,
              'multiple_choice_count', multiple_choice_count,
              'short_answer_count', short_answer_count,
              'categories', categories,
              'category_summaries', category_summaries,
              'wrong_count', wrong_count,
              'wrong_multiple_choice_count', wrong_multiple_choice_count,
              'wrong_short_answer_count', wrong_short_answer_count,
              'bookmark_count', bookmark_count,
              'bookmark_multiple_choice_count', bookmark_multiple_choice_count,
              'bookmark_short_answer_count', bookmark_short_answer_count
            )
            order by grade
          )
          from grade_rows
        ), '[]'::jsonb),
      'weak_categories',
        coalesce((
          select jsonb_agg(to_jsonb(weak_categories) order by rate asc, total desc)
          from weak_categories
        ), '[]'::jsonb)
    )
  end;
$$;

-- Row Level Security の設定
alter table subjects enable row level security;
alter table problems enable row level security;
alter table user_answers enable row level security;
alter table user_bookmarks enable row level security;

-- Supabase API から参照・保存できるようにする権限
grant usage on schema public to anon, authenticated;
grant select on subjects to anon, authenticated;
grant select on problems to anon, authenticated;
grant select, insert, delete on user_answers to authenticated;
grant select, insert, delete on user_bookmarks to authenticated;
grant select on user_answer_subject_stats to authenticated;
grant select on latest_user_problem_answers to authenticated;
grant select on problem_grade_stats to anon, authenticated;
grant select on user_answer_category_stats to authenticated;
grant select on user_answer_daily_stats to authenticated;
grant select on user_problem_review_priority to authenticated;
grant execute on function get_random_problems(uuid, int, int, text, text) to anon, authenticated;
grant execute on function get_dashboard_summary() to authenticated;
grant execute on function get_subject_summary(text) to authenticated;

-- 科目と問題は全員が参照可能
drop policy if exists "誰でも科目を参照可能" on subjects;
create policy "誰でも科目を参照可能" on subjects for select using (true);

drop policy if exists "誰でも問題を参照可能" on problems;
create policy "誰でも問題を参照可能" on problems for select using (true);

-- 回答履歴は自分のものだけ操作可能
drop policy if exists "自分の回答履歴のみ参照" on user_answers;
create policy "自分の回答履歴のみ参照" on user_answers for select using (auth.uid() = user_id);

drop policy if exists "自分の回答履歴のみ追加" on user_answers;
create policy "自分の回答履歴のみ追加" on user_answers for insert with check (auth.uid() = user_id);

drop policy if exists "自分の回答履歴のみ削除" on user_answers;
create policy "自分の回答履歴のみ削除" on user_answers for delete using (auth.uid() = user_id);

-- ブックマークは自分のものだけ操作可能
drop policy if exists "自分のブックマークのみ参照" on user_bookmarks;
create policy "自分のブックマークのみ参照" on user_bookmarks for select using (auth.uid() = user_id);

drop policy if exists "自分のブックマークのみ追加" on user_bookmarks;
create policy "自分のブックマークのみ追加" on user_bookmarks for insert with check (auth.uid() = user_id);

drop policy if exists "自分のブックマークのみ削除" on user_bookmarks;
create policy "自分のブックマークのみ削除" on user_bookmarks for delete using (auth.uid() = user_id);
