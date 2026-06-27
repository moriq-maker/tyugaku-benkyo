import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const GRADE_LABELS: Record<number, string> = {
  1: "中学1年生",
  2: "中学2年生",
  3: "中学3年生",
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "基礎",
  2: "標準",
  3: "応用",
};

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: subjectEn } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 科目情報を取得
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("name_en", subjectEn)
    .single();

  if (!subject) notFound();

  // 学年ごとの問題数を集計
  const { data: problems } = await supabase
    .from("problems")
    .select("id, grade, difficulty")
    .eq("subject_id", subject.id);

  const gradeGroups = [1, 2, 3].map((grade) => ({
    grade,
    count: problems?.filter((p) => p.grade === grade).length ?? 0,
  }));

  let wrongCountsByGrade: Record<number, number> = {};
  if (user) {
    const { data: answers } = await supabase
      .from("user_answers")
      .select("problem_id, is_correct, answered_at, problems(subject_id, grade)")
      .eq("user_id", user.id)
      .order("answered_at", { ascending: false });

    const latestByProblem = new Map<string, { is_correct: boolean; grade: number | null }>();

    answers?.forEach((answer) => {
      if (latestByProblem.has(answer.problem_id)) return;
      const problem = answer.problems as unknown as { subject_id: string; grade: number } | null;
      if (!problem || problem.subject_id !== subject.id) return;
      const grade = problem.grade;
      latestByProblem.set(answer.problem_id, {
        is_correct: answer.is_correct,
        grade,
      });
    });

    wrongCountsByGrade = [...latestByProblem.values()].reduce<Record<number, number>>((acc, item) => {
      if (!item.is_correct && item.grade) {
        acc[item.grade] = (acc[item.grade] ?? 0) + 1;
      }
      return acc;
    }, {});
  }

  return (
    <div>
      <Link href="/dashboard" className="mb-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:text-indigo-700">
        ← ダッシュボードへ戻る
      </Link>

      <section className="mb-8 rounded-[2rem] bg-white/85 p-6 shadow-xl shadow-slate-200 backdrop-blur sm:p-8">
        <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-slate-950 text-2xl font-black text-white">
          {subject.icon}
        </span>
        <div>
          <p className="text-sm font-black text-indigo-600">中1・1学期中間テスト範囲</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">{subject.name}</h1>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            今は中学1年生の4月〜6月範囲だけを出題します。
          </p>
        </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {gradeGroups.map(({ grade, count }) => {
          const wrongCount = wrongCountsByGrade[grade] ?? 0;

          return (
          <div
            key={grade}
            className={`rounded-3xl border p-6 transition
              ${count > 0 ? "border-indigo-100 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg" : "cursor-not-allowed border-slate-100 bg-white/60 opacity-55"}`}
          >
            <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="mb-1 text-xl font-black text-slate-900">
                {GRADE_LABELS[grade]}
              </h2>
              <p className="text-sm font-bold text-slate-500">
                {count > 0 ? `${count}問` : "問題準備中"}
              </p>
              {wrongCount > 0 && (
                <p className="mt-1 text-sm font-black text-red-600">
                  解き直し対象 {wrongCount}問
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {count > 0 && (
                <Link
                  href={`/quiz/${subjectEn}?grade=${grade}`}
                  className="rounded-full bg-slate-950 px-5 py-2.5 text-center text-sm font-black text-white"
                >
                  スタート
                </Link>
              )}
              {wrongCount > 0 && (
                <Link
                  href={`/quiz/${subjectEn}?grade=${grade}&review=wrong`}
                  className="rounded-full bg-red-600 px-5 py-2.5 text-center text-sm font-black text-white"
                >
                  解き直し
                </Link>
              )}
            </div>
            </div>
          </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-3xl border border-amber-100 bg-amber-50 p-5">
        <h3 className="mb-2 font-black text-amber-900">難易度について</h3>
        <ul className="space-y-1 text-sm font-bold text-amber-700">
          {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
            <li key={key}>★{"★".repeat(Number(key) - 1)}{"☆".repeat(3 - Number(key))} {label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
