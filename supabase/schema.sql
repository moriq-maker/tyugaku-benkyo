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
  explanation text,                                                    -- 解説
  difficulty int default 1 check (difficulty between 1 and 3),       -- 難易度（1:基礎 2:標準 3:応用）
  created_at timestamptz default now()
);

create index if not exists problems_subject_grade_term_idx on problems(subject_id, grade, exam_term);

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

-- 画面表示用の軽量ビュー
create or replace view user_answer_subject_stats as
select
  ua.user_id,
  p.subject_id,
  count(*)::int as total,
  count(*) filter (where ua.is_correct)::int as correct
from user_answers ua
join problems p on p.id = ua.problem_id
group by ua.user_id, p.subject_id;

create or replace view latest_user_problem_answers as
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

create or replace function get_random_problems(
  p_subject_id uuid,
  p_grade int,
  p_limit int default 10
)
returns setof problems
language sql
stable
security definer
set search_path = public
as $$
  select *
  from problems
  where subject_id = p_subject_id
    and grade = p_grade
  order by random()
  limit p_limit;
$$;

-- Row Level Security の設定
alter table subjects enable row level security;
alter table problems enable row level security;
alter table user_answers enable row level security;

-- Supabase API から参照・保存できるようにする権限
grant usage on schema public to anon, authenticated;
grant select on subjects to anon, authenticated;
grant select on problems to anon, authenticated;
grant select, insert, delete on user_answers to authenticated;
grant select on user_answer_subject_stats to authenticated;
grant select on latest_user_problem_answers to authenticated;
grant select on problem_grade_stats to anon, authenticated;
grant execute on function get_random_problems(uuid, int, int) to anon, authenticated;

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
