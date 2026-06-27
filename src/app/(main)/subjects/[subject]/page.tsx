import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Subject } from "@/types";

const GRADE_LABELS: Record<number, string> = {
  1: "中学1年生",
  2: "中学2年生",
  3: "中学3年生",
};

const DIFFICULTY_LABELS = [
  ["基礎", "用語や基本計算の確認"],
  ["標準", "テストでよく出る形式"],
  ["応用", "少し考える確認問題"],
];

type GradeSummary = {
  grade: number;
  count: number;
  categories: string[];
  wrong_count: number;
  bookmark_count: number;
};

type WeakCategory = {
  grade: number;
  category: string;
  total: number;
  correct: number;
  rate: number;
};

type SubjectSummary = {
  subject: Subject;
  grades: GradeSummary[];
  weak_categories: WeakCategory[];
};

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: subjectEn } = await params;
  const supabase = await createClient();
  const { data: summaryData } = await supabase.rpc("get_subject_summary", {
    p_subject_en: subjectEn,
  });
  const summary = summaryData as SubjectSummary | null;

  if (!summary?.subject) notFound();

  const subject = summary.subject;
  const gradeGroups = summary.grades;
  const weakCategories = summary.weak_categories;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex rounded-md px-2 py-1 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950"
      >
        ← ダッシュボード
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-md bg-slate-900 text-base font-bold text-white">
              {subject.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">中1・1学期中間テスト範囲</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-950">{subject.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                通常演習はランダム10問。間違えた問題がある場合は、解き直しで最新の不正解だけを復習できます。
              </p>
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">収録問題</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {gradeGroups.reduce((sum, item) => sum + item.count, 0)}
              <span className="ml-1 text-sm text-slate-500">問</span>
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {gradeGroups.map(({ grade, count, categories, wrong_count, bookmark_count }) => {
          const wrongCount = wrong_count ?? 0;
          const enabled = count > 0;

          return (
            <div
              key={grade}
              className={`rounded-lg border bg-white p-5 ${
                enabled ? "border-slate-200" : "border-slate-200 opacity-60"
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">{GRADE_LABELS[grade]}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {enabled ? `${count}問から10問を出題` : "問題準備中"}
                  </p>
                  {categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <span
                          key={category}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {wrongCount > 0 && (
                    <Link
                      href={`/quiz/${subjectEn}?grade=${grade}&review=wrong`}
                      className="rounded-md bg-red-600 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-red-700"
                    >
                      優先復習 {wrongCount}問
                    </Link>
                  )}
                  {bookmark_count > 0 && (
                    <Link
                      href={`/quiz/${subjectEn}?grade=${grade}&review=bookmarked`}
                      className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-sm font-bold text-amber-800 transition hover:bg-amber-100"
                    >
                      保存問題 {bookmark_count}問
                    </Link>
                  )}
                  {enabled && (
                    <Link
                      href={`/quiz/${subjectEn}?grade=${grade}`}
                      className="rounded-md bg-slate-900 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-slate-700"
                    >
                      10問スタート
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {weakCategories.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-950">弱点カテゴリ</h3>
              <p className="mt-1 text-sm text-slate-500">正答率が低い順に表示しています。</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {weakCategories.map((item) => (
              <div key={`${item.grade}-${item.category}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.category}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {GRADE_LABELS[item.grade]} / {item.correct}/{item.total}問 正解
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.rate}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white">
                  <div
                    className={`h-2 rounded-full ${item.rate < 60 ? "bg-red-500" : "bg-amber-500"}`}
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-950">難易度</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {DIFFICULTY_LABELS.map(([label, description], index) => (
            <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-bold text-slate-800">
                {"★".repeat(index + 1)}
                <span className="ml-2">{label}</span>
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
