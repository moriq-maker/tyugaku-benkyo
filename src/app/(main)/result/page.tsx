"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuizResult, Subject } from "@/types";

type StoredData = {
  results: QuizResult[];
  subject: Subject;
  grade: number;
  mode?: "normal" | "review";
};

const GRADE_LABELS: Record<number, string> = {
  1: "中学1年生",
  2: "中学2年生",
  3: "中学3年生",
};

// スコアに応じたメッセージ
function getScoreMessage(rate: number): { emoji: string; message: string } {
  if (rate === 100) return { emoji: "🏆", message: "パーフェクト！完璧です！" };
  if (rate >= 80)  return { emoji: "🎉", message: "すごい！よく頑張りました！" };
  if (rate >= 60)  return { emoji: "😊", message: "いい感じ！もう少しで合格圏！" };
  if (rate >= 40)  return { emoji: "📚", message: "復習してもう一度チャレンジしよう！" };
  return { emoji: "💪", message: "まずは基礎からしっかり復習しよう！" };
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
    if (!data) {
      router.push("/dashboard");
    }
  }, [data, router]);

  if (!data) {
    return (
      <div className="py-20 text-center font-bold text-slate-400">読み込み中...</div>
    );
  }

  const { results, subject, grade, mode } = data;
  const correct = results.filter((r) => r.isCorrect).length;
  const wrong = results.length - correct;
  const total = results.length;
  const rate = Math.round((correct / total) * 100);
  const { emoji, message } = getScoreMessage(rate);

  return (
    <div>
      {/* スコアカード */}
      <div className="mb-8 rounded-[2rem] bg-slate-950 p-8 text-center text-white shadow-xl shadow-slate-200">
        <div className="mb-3 text-6xl">{emoji}</div>
        <p className="mb-1 text-sm font-bold text-slate-400">
          {subject.icon} {subject.name} / {GRADE_LABELS[grade]}{mode === "review" ? " / 解き直し" : ""}
        </p>
        <div className="mb-2 text-7xl font-extrabold">{rate}%</div>
        <p className="text-lg font-bold text-slate-300">{correct} / {total}問正解</p>
        <p className="mt-4 text-lg font-black">{message}</p>
      </div>

      {/* 問題別の振り返り */}
      <h2 className="mb-4 text-xl font-black text-slate-900">問題の振り返り</h2>
      <div className="mb-8 space-y-4">
        {results.map((result, i) => (
          <div
            key={result.problem.id}
            className={`rounded-3xl border-2 bg-white p-5 shadow-sm ${
              result.isCorrect ? "border-emerald-200" : "border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-xl">
                {result.isCorrect ? "✅" : "❌"}
              </span>
              <div className="flex-1">
                {result.problem.category && (
                  <p className="mb-2 text-xs font-black text-slate-400">{result.problem.category}</p>
                )}
                <p className="mb-2 font-black leading-7 text-slate-900">
                  Q{i + 1}. {result.problem.question}
                </p>
                {!result.isCorrect && (
                  <div className="space-y-1 text-sm">
                    <p className="text-red-600">
                      あなたの答え：
                      {result.userAnswer === "A" && result.problem.choice_a}
                      {result.userAnswer === "B" && result.problem.choice_b}
                      {result.userAnswer === "C" && result.problem.choice_c}
                      {result.userAnswer === "D" && result.problem.choice_d}
                    </p>
                    <p className="text-emerald-700 font-medium">
                      正解：
                      {result.problem.answer === "A" && result.problem.choice_a}
                      {result.problem.answer === "B" && result.problem.choice_b}
                      {result.problem.answer === "C" && result.problem.choice_c}
                      {result.problem.answer === "D" && result.problem.choice_d}
                    </p>
                  </div>
                )}
                {result.problem.explanation && (
                  <p className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium leading-6 text-blue-700">
                    {result.problem.explanation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col gap-3">
        <Link
          href={`/quiz/${subject.name_en}?grade=${grade}`}
          className="block rounded-2xl bg-slate-950 py-4 text-center font-black text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800"
        >
          もう一度挑戦する
        </Link>
        {wrong > 0 && (
          <Link
            href={`/quiz/${subject.name_en}?grade=${grade}&review=wrong`}
            className="block rounded-2xl bg-red-600 py-4 text-center font-black text-white shadow-lg shadow-red-200 transition hover:bg-red-700"
          >
            間違えた問題だけ解き直す
          </Link>
        )}
        <Link
          href={`/subjects/${subject.name_en}`}
          className="block rounded-2xl border border-indigo-100 bg-white py-4 text-center font-black text-indigo-700 shadow-sm transition hover:bg-indigo-50"
        >
          別の学年を選ぶ
        </Link>
        <Link
          href="/dashboard"
          className="block py-4 text-center font-bold text-slate-500 hover:text-slate-700"
        >
          ダッシュボードへ戻る
        </Link>
      </div>
    </div>
  );
}
