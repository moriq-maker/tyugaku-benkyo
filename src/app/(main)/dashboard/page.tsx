import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { SubjectStats } from "@/types";

const SUBJECT_STYLES: Record<string, { accent: string; bg: string }> = {
  math: { accent: "text-indigo-700", bg: "bg-indigo-50" },
  english: { accent: "text-emerald-700", bg: "bg-emerald-50" },
  japanese: { accent: "text-rose-700", bg: "bg-rose-50" },
  science: { accent: "text-amber-700", bg: "bg-amber-50" },
  social: { accent: "text-violet-700", bg: "bg-violet-50" },
};

type AnswerRow = {
  subject_id: string;
  total: number;
  correct: number;
};

type LatestAnswerRow = {
  is_correct: boolean;
};

type DailyStatRow = {
  answered_date: string;
  total: number;
  correct: number;
};

type CategoryStatRow = {
  category: string;
  total: number;
  correct: number;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("name_en");

  let stats: SubjectStats[] = [];
  let wrongTotal = 0;
  let bookmarkTotal = 0;
  let dailyStats: DailyStatRow[] = [];
  let weakestCategory: (CategoryStatRow & { rate: number }) | null = null;

  if (subjects && user) {
    const [{ data: subjectStats }, { data: latestAnswers }, { data: bookmarks }, { data: dailyRows }, { data: categoryRows }] = await Promise.all([
      supabase
        .from("user_answer_subject_stats")
        .select("subject_id, total, correct")
        .eq("user_id", user.id),
      supabase
        .from("latest_user_problem_answers")
        .select("is_correct")
        .eq("user_id", user.id)
        .eq("is_correct", false),
      supabase
        .from("user_bookmarks")
        .select("id")
        .eq("user_id", user.id),
      supabase
        .from("user_answer_daily_stats")
        .select("answered_date, total, correct")
        .eq("user_id", user.id)
        .order("answered_date", { ascending: false })
        .limit(7),
      supabase
        .from("user_answer_category_stats")
        .select("category, total, correct")
        .eq("user_id", user.id),
    ]);

    const statRows = (subjectStats ?? []) as AnswerRow[];

    stats = subjects.map((subject) => {
      const subjectRow = statRows.find((row) => row.subject_id === subject.id);
      const total = subjectRow?.total ?? 0;
      const correct = subjectRow?.correct ?? 0;
      return {
        subject_id: subject.id,
        subject_name: subject.name,
        total,
        correct,
        rate: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
    });

    wrongTotal = ((latestAnswers ?? []) as LatestAnswerRow[]).length;
    bookmarkTotal = (bookmarks ?? []).length;
    dailyStats = ((dailyRows ?? []) as DailyStatRow[]).reverse();

    const mergedCategories = ((categoryRows ?? []) as CategoryStatRow[]).reduce<Record<string, CategoryStatRow>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = { category: item.category, total: 0, correct: 0 };
      acc[item.category].total += item.total;
      acc[item.category].correct += item.correct;
      return acc;
    }, {});
    weakestCategory = Object.values(mergedCategories)
      .filter((item) => item.total > 0)
      .map((item) => ({ ...item, rate: Math.round((item.correct / item.total) * 100) }))
      .sort((a, b) => a.rate - b.rate || b.total - a.total)[0] ?? null;
  }

  const totalAnswered = stats.reduce((sum, item) => sum + item.total, 0);
  const totalCorrect = stats.reduce((sum, item) => sum + item.correct, 0);
  const overallRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const bestSubject = stats
    .filter((item) => item.total > 0)
    .sort((a, b) => b.rate - a.rate)[0];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Dashboard</p>
            <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
              今日の演習を選ぶ
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              中1・1学期中間範囲から10問ずつ出題します。間違えた問題は科目ページからまとめて解き直せます。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[520px]">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3 sm:block">
                <p className="text-xs font-semibold text-slate-500">回答</p>
                <p className="mt-0 text-xl font-bold text-slate-950 sm:mt-1">{totalAnswered}</p>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3 sm:block">
                <p className="text-xs font-semibold text-slate-500">正答率</p>
                <p className="mt-0 text-xl font-bold text-slate-950 sm:mt-1">{overallRate}%</p>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3 sm:block">
                <p className="text-xs font-semibold text-slate-500">復習</p>
                <p className="mt-0 text-xl font-bold text-slate-950 sm:mt-1">{wrongTotal}</p>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3 sm:block">
                <p className="text-xs font-semibold text-slate-500">保存</p>
                <p className="mt-0 text-xl font-bold text-slate-950 sm:mt-1">{bookmarkTotal}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {totalAnswered > 0 && (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">学習状況</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-indigo-600"
                style={{ width: `${overallRate}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              全体で {totalCorrect}/{totalAnswered} 問正解しています。
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">次に見るポイント</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {wrongTotal > 0
                ? `未定着の問題が ${wrongTotal} 問あります。科目ページの「優先復習」から復習できます。`
                : bestSubject
                  ? `${bestSubject.subject_name} は正答率 ${bestSubject.rate}% です。別の科目にも進みましょう。`
                  : "まずは1科目10問から始めましょう。"}
            </p>
            {weakestCategory && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                弱点候補: {weakestCategory.category} / {weakestCategory.rate}%
              </p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">7日間の学習履歴</p>
            <div className="mt-4 flex h-28 items-end gap-2">
              {dailyStats.length > 0 ? dailyStats.map((day) => {
                const maxTotal = Math.max(...dailyStats.map((item) => item.total), 1);
                const height = Math.max(10, Math.round((day.total / maxTotal) * 100));
                const rate = day.total > 0 ? Math.round((day.correct / day.total) * 100) : 0;
                const label = new Date(day.answered_date).getDate();
                return (
                  <div key={day.answered_date} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-20 w-full items-end rounded-md bg-slate-50 px-1">
                      <div
                        className="w-full rounded-sm bg-indigo-600"
                        style={{ height: `${height}%` }}
                        title={`${day.total}問 / ${rate}%`}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{label}日</span>
                  </div>
                );
              }) : (
                <p className="self-center text-sm text-slate-500">まだ履歴がありません。</p>
              )}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">科目</h2>
            <p className="mt-1 text-sm text-slate-500">各教科60問からランダムに10問出題</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects?.map((subject) => {
            const style = SUBJECT_STYLES[subject.name_en] ?? {
              accent: "text-slate-700",
              bg: "bg-slate-50",
            };
            const subjectStat = stats.find((item) => item.subject_id === subject.id);
            const rate = subjectStat?.total ? subjectStat.rate : null;

            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.name_en}`}
                className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-md text-sm font-bold ${style.bg} ${style.accent}`}>
                      {subject.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-950">{subject.name}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {rate === null ? "未演習" : `正答率 ${rate}%`}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-400 transition group-hover:text-slate-700">
                    開く
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
