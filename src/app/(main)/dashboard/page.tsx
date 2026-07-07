import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Subject } from "@/types";

/* ── 教科スタイル ── */
const SUBJECT_STYLES: Record<string, { accent: string; bg: string; bar: string; hex: string; emoji: string }> = {
  math:     { accent: "text-blue-700",    bg: "bg-blue-50",    bar: "bg-blue-600",    hex: "#2563eb", emoji: "🔢" },
  english:  { accent: "text-emerald-700", bg: "bg-emerald-50", bar: "bg-emerald-600", hex: "#059669", emoji: "🔤" },
  japanese: { accent: "text-rose-700",    bg: "bg-rose-50",    bar: "bg-rose-600",    hex: "#e11d48", emoji: "📖" },
  science:  { accent: "text-amber-700",   bg: "bg-amber-50",   bar: "bg-amber-500",   hex: "#f59e0b", emoji: "🔬" },
  social:   { accent: "text-violet-700",  bg: "bg-violet-50",  bar: "bg-violet-600",  hex: "#7c3aed", emoji: "🌍" },
};

/* ── XPレベル ── */
const LEVELS = [
  { min: 0,   max: 29,  label: "見習い",     next: 30  },
  { min: 30,  max: 79,  label: "学習者",     next: 80  },
  { min: 80,  max: 179, label: "努力家",     next: 180 },
  { min: 180, max: 349, label: "テスト戦士", next: 350 },
  { min: 350, max: 599, label: "受験生",     next: 600 },
  { min: 600, max: Infinity, label: "エリート", next: Infinity },
];

function getLevel(answered: number) {
  const lv = LEVELS.findIndex((l) => answered >= l.min && answered <= l.max);
  const idx = lv === -1 ? LEVELS.length - 1 : lv;
  const { label, min, next } = LEVELS[idx];
  const pct = next === Infinity ? 100 : Math.round(((answered - min) / (next - min)) * 100);
  return { level: idx + 1, label, pct: Math.min(pct, 100), toNext: next === Infinity ? 0 : next - answered };
}

/* ── 連続日数 ── */
type DailyStatRow = { answered_date: string; total: number; correct: number };

function computeStreak(rows: DailyStatRow[]): number {
  if (!rows.length) return 0;
  const sorted = [...rows].sort(
    (a, b) => new Date(b.answered_date).getTime() - new Date(a.answered_date).getTime()
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let expected = new Date(today);

  for (const row of sorted) {
    const d = new Date(row.answered_date);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.round((expected.getTime() - d.getTime()) / 86_400_000);
    if (diffDays <= 1) {
      streak++;
      expected = new Date(d);
    } else break;
  }
  return streak;
}

/* ── 型 ── */
type DashboardSubject = Subject & { total: number; correct: number; rate: number };
type CategoryStatRow  = { category: string; total: number; correct: number };
type DashboardSummary = {
  subjects: DashboardSubject[];
  wrong_total: number;
  bookmark_total: number;
  daily_stats: DailyStatRow[];
  weakest_category: (CategoryStatRow & { rate: number }) | null;
};

/* ─────────────────────────────────────── */

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: summaryData } = await supabase.rpc("get_dashboard_summary");
  const summary = summaryData as DashboardSummary | null;

  const subjects       = summary?.subjects ?? [];
  const wrongTotal     = summary?.wrong_total ?? 0;
  const bookmarkTotal  = summary?.bookmark_total ?? 0;
  const dailyStats     = summary?.daily_stats ?? [];
  const weakestCat     = summary?.weakest_category ?? null;

  const totalAnswered = subjects.reduce((s, x) => s + x.total, 0);
  const totalCorrect  = subjects.reduce((s, x) => s + x.correct, 0);
  const overallRate   = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const bestSubject   = [...subjects].filter((x) => x.total > 0).sort((a, b) => b.rate - a.rate)[0];
  const streak        = computeStreak(dailyStats);
  const { level, label: levelLabel, pct: xpPct, toNext } = getLevel(totalAnswered);

  /* 今日のおすすめ教科 */
  const todaySubject = subjects.find((s) => s.total === 0) ?? subjects[0];

  return (
    <div className="space-y-6">

      {/* ── XP / レベルバナー ── */}
      <section className="study-hero rounded-3xl p-5 sm:p-7 animate-slide-up">
        <div className="hero-content">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Level badge */}
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white/10 border border-white/12">
                <p className="text-[10px] font-bold text-slate-400 leading-none">Lv.</p>
                <p className="text-2xl font-black text-white leading-none">{level}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">称号</p>
                <p className="text-xl font-black text-white">{levelLabel}</p>
                {toNext > 0 && (
                  <p className="mt-0.5 text-xs text-slate-400">あと {toNext} 問で次のレベルへ</p>
                )}
              </div>
            </div>

            {/* Streak + quick stats */}
            <div className="flex flex-wrap items-center gap-3">
              {streak > 0 && (
                <span className="streak-badge">🔥 {streak}日連続</span>
              )}
              <div className="data-tile rounded-xl px-4 py-2 text-center">
                <p className="text-xs font-bold text-slate-400">総回答</p>
                <p className="text-2xl font-black text-white">{totalAnswered}</p>
              </div>
              <div className="data-tile rounded-xl px-4 py-2 text-center">
                <p className="text-xs font-bold text-slate-400">正答率</p>
                <p className="text-2xl font-black text-white">{overallRate}%</p>
              </div>
              {wrongTotal > 0 && (
                <div className="data-tile rounded-xl px-4 py-2 text-center">
                  <p className="text-xs font-bold text-slate-400">復習</p>
                  <p className="text-2xl font-black text-white">{wrongTotal}</p>
                </div>
              )}
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">XP進捗</span>
              <span className="text-cyan-300">{xpPct}%</span>
            </div>
            <div className="xp-track">
              <div className="xp-fill" style={{ "--xp-pct": `${xpPct}%` } as React.CSSProperties} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 今日やること ── */}
      {todaySubject && (
        <section className="animate-slide-up delay-100">
          <div className="panel rounded-3xl p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {todaySubject.total === 0
                    ? `${todaySubject.name}を初めて解こう！`
                    : bestSubject
                      ? `${bestSubject.name}をさらに伸ばそう！`
                      : "今日も10問チャレンジ！"}
                </h2>
                {weakestCat && (
                  <p className="mt-1 text-sm text-slate-500">
                    弱点候補: <span className="font-bold text-rose-600">{weakestCat.category}</span> ({weakestCat.rate}%)
                  </p>
                )}
              </div>
              <Link
                href={`/subjects/${todaySubject.name_en}`}
                className="focus-ring primary-action shrink-0 rounded-2xl px-5 py-3 text-sm font-black whitespace-nowrap"
              >
                始める →
              </Link>
            </div>

            {/* 学習状況バー */}
            {totalAnswered > 0 && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>全体正答率</span>
                  <span>{totalCorrect}/{totalAnswered}問</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="progress-bar-fill bg-gradient-to-r from-violet-500 to-indigo-500"
                    style={{ "--bar-w": `${overallRate}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 7日間グラフ ── */}
      {dailyStats.length > 0 && (
        <section className="animate-slide-up delay-200">
          <div className="panel rounded-3xl p-5">
            <h3 className="text-lg font-black text-slate-900">最近の学習</h3>
            <div className="mt-4 flex h-28 items-end gap-2">
              {(() => {
                const maxTotal = Math.max(...dailyStats.map((d) => d.total), 1);
                return dailyStats.map((day) => {
                  const h    = Math.max(8, Math.round((day.total / maxTotal) * 100));
                  const rate = day.total > 0 ? Math.round((day.correct / day.total) * 100) : 0;
                  const label = new Date(day.answered_date).getDate();
                  return (
                    <div key={day.answered_date} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-20 w-full items-end rounded-xl bg-violet-50 px-1">
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-violet-600 to-indigo-400 transition-all"
                          style={{ height: `${h}%` }}
                          title={`${day.total}問 / ${rate}%`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{label}日</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </section>
      )}

      {/* ── 教科を選ぶ ── */}
      <section id="subjects" className="scroll-mt-24 animate-slide-up delay-300">
        <div className="mb-4">
          <h2 className="text-2xl font-black text-slate-900">教科を選ぶ</h2>
          <p className="mt-1 text-sm text-slate-500">単元別・形式別・復習まで、この画面から入れます。</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, i) => {
            const style = SUBJECT_STYLES[subject.name_en] ?? {
              accent: "text-slate-700", bg: "bg-slate-50", bar: "bg-slate-700", hex: "#334155", emoji: "📚",
            };
            const rate = subject.total ? subject.rate : null;

            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.name_en}`}
                className="game-card subject-card group focus-ring block p-5 pl-6 animate-slide-up"
                style={{
                  "--subject-accent": style.hex,
                  animationDelay: `${300 + i * 80}ms`,
                } as React.CSSProperties}
              >
                <div className="flex min-h-36 flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-12 w-12 place-items-center rounded-2xl text-xl shadow-sm ${style.bg} ${style.accent}`}>
                        {subject.icon}
                      </span>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{subject.name}</h3>
                        <p className="mt-0.5 text-xs font-bold text-slate-500">
                          {rate === null ? "未演習" : `正答率 ${rate}%`}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition group-hover:bg-violet-600 group-hover:text-white">
                      開く →
                    </span>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>progress</span>
                      <span>{rate ?? 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`progress-bar-fill ${style.bar}`}
                        style={{ "--bar-w": `${rate ?? 0}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 保存・復習クイックアクセス ── */}
      {(wrongTotal > 0 || bookmarkTotal > 0) && (
        <section id="review" className="scroll-mt-24 animate-slide-up delay-500">
          <div className="mb-4">
            <h2 className="text-2xl font-black text-slate-900">復習する</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {wrongTotal > 0 && (
              <div className="panel rounded-3xl p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-100 text-xl">❌</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500">間違えた問題</p>
                    <p className="text-2xl font-black text-rose-600">{wrongTotal}<span className="text-sm font-bold text-slate-500 ml-1">問</span></p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">各教科ページの「復習」から解き直せます。</p>
              </div>
            )}
            {bookmarkTotal > 0 && (
              <div className="panel rounded-3xl p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-xl">🔖</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500">保存した問題</p>
                    <p className="text-2xl font-black text-amber-600">{bookmarkTotal}<span className="text-sm font-bold text-slate-500 ml-1">問</span></p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">各教科ページの「保存」から確認できます。</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
