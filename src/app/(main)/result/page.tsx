"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuizResult, Subject } from "@/types";

type StoredData = {
  results: QuizResult[];
  subject: Subject;
  grade: number;
  mode?: "normal" | "review" | "bookmarked";
  problemFormat?: "multiple_choice" | "short_answer";
};

const GRADE_LABELS: Record<number, string> = {
  1: "中学1年生",
  2: "中学2年生",
  3: "中学3年生",
};

function getScoreMessage(rate: number): string {
  if (rate === 100) return "全問正解です。この範囲はかなり安定しています。";
  if (rate >= 80) return "よく取れています。間違えた問題だけ確認しましょう。";
  if (rate >= 60) return "基礎は見えています。解説を見てもう一度解くと定着します。";
  return "まずは間違えた問題を解き直して、出題形式に慣れましょう。";
}

function getChoice(problem: QuizResult["problem"], answer: string) {
  if (problem.problem_format === "short_answer") return answer;

  return {
    A: problem.choice_a,
    B: problem.choice_b,
    C: problem.choice_c,
    D: problem.choice_d,
  }[answer as "A" | "B" | "C" | "D"];
}

export default function ResultPage() {
  const router = useRouter();
  const stored = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem("quiz_results"),
    () => null
  );
  const data = useMemo<StoredData | null>(() => {
    if (!stored) return null;
    return JSON.parse(stored);
  }, [stored]);

  useEffect(() => {
    if (!data) router.push("/dashboard");
  }, [data, router]);

  if (!data) {
    return <div className="py-20 text-center text-sm font-semibold text-slate-500">読み込み中...</div>;
  }

  const { results, subject, grade, mode, problemFormat } = data;
  const correct = results.filter((result) => result.isCorrect).length;
  const wrong = results.length - correct;
  const total = results.length;
  const rate = Math.round((correct / total) * 100);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
          <div className="rounded-lg bg-slate-900 p-5 text-white">
            <p className="text-sm font-semibold text-slate-300">Score</p>
            <p className="mt-2 text-5xl font-bold">{rate}%</p>
            <p className="mt-2 text-sm text-slate-300">{correct}/{total}問 正解</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">
              {subject.name} / {GRADE_LABELS[grade]}
              {problemFormat === "short_answer" ? " / 短答式" : " / 4択"}
              {mode === "review" ? " / 優先復習" : mode === "bookmarked" ? " / 保存問題" : ""}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">結果</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{getScoreMessage(rate)}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              {wrong > 0 && (
                <Link
                  href={`/quiz/${subject.name_en}?grade=${grade}&review=wrong`}
                  className="rounded-md bg-red-600 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-red-700"
                >
                  間違えた問題を解き直す
                </Link>
              )}
              <Link
                href={`/quiz/${subject.name_en}?grade=${grade}`}
                className="rounded-md bg-slate-900 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-slate-700"
              >
                同じ条件で10問
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                ダッシュボード
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-950">振り返り</h2>
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={result.problem.id}
              className={`rounded-lg border bg-white p-4 ${
                result.isCorrect ? "border-slate-200" : "border-red-200"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <span
                  className={`inline-flex w-fit rounded-md px-2 py-1 text-xs font-bold ${
                    result.isCorrect
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {result.isCorrect ? "正解" : "不正解"}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400">{result.problem.category}</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-slate-950">
                    Q{index + 1}. {result.problem.question}
                  </p>
                  {!result.isCorrect && (
                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <p className="rounded-md bg-red-50 px-3 py-2 text-red-800">
                        あなた: {getChoice(result.problem, result.userAnswer)}
                      </p>
                      <p className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-800">
                        正解: {result.problem.problem_format === "short_answer"
                          ? result.problem.correct_text
                          : getChoice(result.problem, result.problem.answer)}
                      </p>
                    </div>
                  )}
                  {result.problem.explanation && (
                    <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                      {result.problem.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
