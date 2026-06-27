import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { SubjectStats } from "@/types";

// 科目アイコンと背景色のマップ
const SUBJECT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  math:    { bg: "bg-indigo-50",  text: "text-indigo-700", border: "border-indigo-200" },
  english: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  japanese:{ bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
  science: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  social:  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 全科目を取得
  const { data: subjects } = await supabase.from("subjects").select("*");

  // ユーザーの回答履歴と科目別正答率を集計
  let stats: SubjectStats[] = [];
  if (subjects && user) {
    const { data: answers } = await supabase
      .from("user_answers")
      .select("is_correct, problems(subject_id)")
      .eq("user_id", user.id);

    if (answers) {
      stats = subjects.map((s) => {
        const subjectAnswers = answers.filter(
          (a) => (a.problems as unknown as { subject_id: string } | null)?.subject_id === s.id
        );
        const total = subjectAnswers.length;
        const correct = subjectAnswers.filter((a) => a.is_correct).length;
        return {
          subject_id: s.id,
          subject_name: s.name,
          total,
          correct,
          rate: total > 0 ? Math.round((correct / total) * 100) : 0,
        };
      });
    }
  }

  const totalAnswered = stats.reduce((sum, s) => sum + s.total, 0);
  const totalCorrect = stats.reduce((sum, s) => sum + s.correct, 0);
  const overallRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div>
      <section className="mb-8 rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-200 sm:p-8">
        <p className="text-sm font-bold text-slate-400">中1・1学期中間テスト対策</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">
              今日の10問で、弱点を見つけよう。
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-300">
              科目を選ぶと、4月〜6月範囲の問題から最大10問をランダムに出題します。
            </p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 text-slate-950">
            <p className="text-xs font-bold text-slate-500">総回答数</p>
            <p className="text-3xl font-black">{totalAnswered}<span className="text-base">問</span></p>
          </div>
        </div>
      </section>

      {/* 総合成績カード */}
      {totalAnswered > 0 && (
        <div className="mb-8 rounded-3xl border border-white bg-white/85 p-5 shadow-sm backdrop-blur">
          <p className="mb-3 text-sm font-black text-slate-700">学習サマリー</p>
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-indigo-600 text-2xl font-black text-white">
              {overallRate}%
            </div>
            <div>
              <p className="font-black text-slate-900">総合正答率</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{totalCorrect}/{totalAnswered}問 正解</p>
            </div>
          </div>
        </div>
      )}

      {/* 科目カード一覧 */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">科目を選ぶ</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">中1範囲だけをすぐに演習できます。</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {subjects?.map((subject) => {
          const style = SUBJECT_STYLES[subject.name_en] ?? {
            bg: "bg-gray-50",
            text: "text-gray-700",
            border: "border-gray-200",
          };
          const subjectStat = stats.find((s) => s.subject_id === subject.id);

          return (
            <Link
              key={subject.id}
              href={`/subjects/${subject.name_en}`}
              className={`${style.bg} ${style.border} group border rounded-3xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl font-black shadow-sm ${style.text}`}>
                      {subject.icon}
                    </span>
                    <span className={`text-xl font-black ${style.text}`}>{subject.name}</span>
                  </div>
                  {subjectStat && subjectStat.total > 0 ? (
                    <p className="text-sm font-bold text-slate-600">
                      正答率 {subjectStat.rate}%（{subjectStat.total}問解答済み）
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-slate-400">まだ解いていません</p>
                  )}
                </div>
                <span className={`grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow-sm transition group-hover:translate-x-1 ${style.text}`}>
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
