import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Subject } from "@/types";

const SUBJECT_STYLES: Record<string, { accent: string; bg: string; bar: string; hex: string }> = {
  math: { accent: "text-blue-700", bg: "bg-blue-50", bar: "bg-blue-600", hex: "#2563eb" },
  english: { accent: "text-emerald-700", bg: "bg-emerald-50", bar: "bg-emerald-600", hex: "#059669" },
  japanese: { accent: "text-rose-700", bg: "bg-rose-50", bar: "bg-rose-600", hex: "#e11d48" },
  science: { accent: "text-amber-700", bg: "bg-amber-50", bar: "bg-amber-500", hex: "#f59e0b" },
  social: { accent: "text-violet-700", bg: "bg-violet-50", bar: "bg-violet-600", hex: "#7c3aed" },
};

type DashboardSubject = Subject & {
  total: number;
  correct: number;
  rate: number;
};

type DashboardSummary = {
  subjects: DashboardSubject[];
  wrong_total: number;
  bookmark_total: number;
  daily_stats: DailyStatRow[];
  weakest_category: (CategoryStatRow & { rate: number }) | null;
};

type SubjectStats = {
  subject_id: string;
  subject_name: string;
  total: number;
  correct: number;
  rate: number;
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
  const { data: summaryData } = await supabase.rpc("get_dashboard_summary");
  const summary = summaryData as DashboardSummary | null;
  const subjects = summary?.subjects ?? [];

  const stats: SubjectStats[] = subjects.map((subject) => ({
    subject_id: subject.id,
    subject_name: subject.name,
    total: subject.total,
    correct: subject.correct,
    rate: subject.rate,
  }));
  const wrongTotal = summary?.wrong_total ?? 0;
  const bookmarkTotal = summary?.bookmark_total ?? 0;
  const dailyStats = summary?.daily_stats ?? [];
  const weakestCategory = summary?.weakest_category ?? null;

  const totalAnswered = stats.reduce((sum, item) => sum + item.total, 0);
  const totalCorrect = stats.reduce((sum, item) => sum + item.correct, 0);
  const overallRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const bestSubject = stats
    .filter((item) => item.total > 0)
    .sort((a, b) => b.rate - a.rate)[0];

  return (
    <div className="space-y-7">
      <section id="review" className="study-hero rounded-lg p-5 sm:p-7">
        <div className="hero-content grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
              TESTAN STUDY BOARD
            </p>
            <h1 className="mt-5 max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl">
              今日やるべき10問を、迷わず始める。
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              中1・1学期中間範囲を、4択・短答式・単元別・復習に分けて演習できます。履歴から弱点を見つけて、次の一手までつなげます。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["中1中間", "4択", "短答式", "単元別", "弱点復習"].map((label) => (
                <span key={label} className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <div className="data-tile rounded-lg p-4">
              <div>
                <p className="text-xs font-semibold text-slate-300">回答</p>
                <p className="mt-2 text-3xl font-black text-white">{totalAnswered}</p>
              </div>
            </div>
            <div className="data-tile rounded-lg p-4">
              <div>
                <p className="text-xs font-semibold text-slate-300">正答率</p>
                <p className="mt-2 text-3xl font-black text-white">{overallRate}%</p>
              </div>
            </div>
            <div className="data-tile rounded-lg p-4">
              <div>
                <p className="text-xs font-semibold text-slate-300">復習</p>
                <p className="mt-2 text-3xl font-black text-white">{wrongTotal}</p>
              </div>
            </div>
            <div className="data-tile rounded-lg p-4">
              <div>
                <p className="text-xs font-semibold text-slate-300">保存</p>
                <p className="mt-2 text-3xl font-black text-white">{bookmarkTotal}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {totalAnswered > 0 && (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="panel rounded-lg p-5">
            <p className="text-sm font-semibold text-slate-500">学習状況</p>
            <div className="mt-4 h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-blue-600 shadow-sm"
                style={{ width: `${overallRate}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              全体で {totalCorrect}/{totalAnswered} 問正解しています。
            </p>
          </div>
          <div className="panel rounded-lg p-5">
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
          <div className="panel rounded-lg p-5">
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
                className="w-full rounded-sm bg-blue-600"
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

      <section id="subjects" className="scroll-mt-24">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs font-black text-blue-700">SUBJECTS</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">教科を選ぶ</h2>
            <p className="mt-1 text-sm text-slate-500">単元別・形式別・復習まで、この画面から入れます。</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const style = SUBJECT_STYLES[subject.name_en] ?? {
              accent: "text-slate-700",
              bg: "bg-slate-50",
              bar: "bg-slate-700",
              hex: "#334155",
            };
            const rate = subject.total ? subject.rate : null;

            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.name_en}`}
                className="subject-card group panel rounded-lg p-5 pl-6 transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white focus-ring"
                style={{ "--subject-accent": style.hex } as React.CSSProperties}
              >
                <div className="flex min-h-36 flex-col justify-between gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-12 w-12 place-items-center rounded-md text-base font-black shadow-sm ${style.bg} ${style.accent}`}>
                      {subject.icon}
                      </span>
                      <div>
                        <h3 className="text-lg font-black text-slate-950">{subject.name}</h3>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {rate === null ? "未演習" : `正答率 ${rate}%`}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white transition group-hover:bg-blue-600">
                      開く
                    </span>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>progress</span>
                      <span>{rate ?? 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${style.bar}`} style={{ width: `${rate ?? 0}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
