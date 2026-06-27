"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Problem, Subject, QuizResult } from "@/types";

const CHOICES = ["A", "B", "C", "D"] as const;
const CHOICE_LABELS: Record<string, string> = {
  A: "A", B: "B", C: "C", D: "D",
};

// 難易度の星表示
function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="text-amber-400 text-sm">
      {"★".repeat(level)}{"☆".repeat(3 - level)}
    </span>
  );
}

export default function QuizClient({
  subject,
  problems,
  grade,
  mode,
}: {
  subject: Subject;
  problems: Problem[];
  grade: number;
  mode: "normal" | "review";
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [saving, setSaving] = useState(false);

  const current = problems[currentIndex];
  const isLastQuestion = currentIndex === problems.length - 1;

  // 選択肢の内容を choice_a〜choice_d から取得
  const getChoiceText = (choice: string): string => {
    const map: Record<string, string> = {
      A: current.choice_a,
      B: current.choice_b,
      C: current.choice_c,
      D: current.choice_d,
    };
    return map[choice] ?? "";
  };

  // 選択肢を選んだときの処理
  const handleSelect = useCallback((choice: string) => {
    if (showAnswer) return;
    setSelected(choice);
    setShowAnswer(true);
  }, [showAnswer]);

  // 次の問題または結果ページへ
  const handleNext = useCallback(async () => {
    if (!selected) return;

    const isCorrect = selected === current.answer;
    const newResult: QuizResult = {
      problem: current,
      userAnswer: selected as "A" | "B" | "C" | "D",
      isCorrect,
    };
    const updatedResults = [...results, newResult];

    // 最後の問題なら回答を保存して結果ページへ
    if (isLastQuestion) {
      setSaving(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("user_answers").insert(
            updatedResults.map((r) => ({
              user_id: user.id,
              problem_id: r.problem.id,
              is_correct: r.isCorrect,
            }))
          );
        }
      } catch (e) {
        console.error("回答の保存に失敗しました:", e);
      }

      // 結果をsessionStorageに保存してページ遷移
      sessionStorage.setItem(
        "quiz_results",
        JSON.stringify({
          results: updatedResults,
          subject,
          grade,
          mode,
        })
      );
      router.push("/result");
      return;
    }

    setResults(updatedResults);
    setCurrentIndex((i) => i + 1);
    setSelected(null);
    setShowAnswer(false);
  }, [selected, current, results, isLastQuestion, subject, grade, mode, router]);

  return (
    <div>
      {/* 進捗バー */}
      <div className="mb-6 rounded-3xl border border-white bg-white/85 p-5 shadow-sm backdrop-blur">
        <div className="mb-3 flex justify-between text-sm font-black text-slate-600">
          <span>{subject.icon} {subject.name}・中学{grade}年生{mode === "review" ? "・解き直し" : ""}</span>
          <span>{currentIndex + 1} / {problems.length}問</span>
        </div>
        <div className="h-3 rounded-full bg-slate-200">
          <div
            className="h-3 rounded-full bg-slate-950 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <div className="mb-4 rounded-[2rem] border border-white bg-white p-6 shadow-xl shadow-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-500">
            問題 {currentIndex + 1}・{current.category}
          </span>
          <DifficultyStars level={current.difficulty} />
        </div>
        {current.passage && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium leading-7 text-slate-700">
            {current.passage}
          </div>
        )}
        <p className="text-xl font-black leading-relaxed text-slate-900">
          {current.question}
        </p>
      </div>

      {/* 選択肢 */}
      <div className="space-y-3 mb-6">
        {CHOICES.map((choice) => {
          const text = getChoiceText(choice);
          const isCorrect = choice === current.answer;
          const isSelected = choice === selected;

          let choiceStyle =
            "bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50";

          if (showAnswer) {
            if (isCorrect) {
              choiceStyle = "bg-emerald-50 border-emerald-400 text-emerald-800";
            } else if (isSelected && !isCorrect) {
              choiceStyle = "bg-red-50 border-red-400 text-red-800";
            } else {
              choiceStyle = "bg-white border-slate-100 text-slate-400";
            }
          }

          return (
            <button
              key={choice}
              onClick={() => handleSelect(choice)}
              disabled={showAnswer}
              className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left shadow-sm transition-all ${choiceStyle}`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-lg font-black">{CHOICE_LABELS[choice]}</span>
              <span className="flex-1 font-bold">{text}</span>
              {showAnswer && isCorrect && <span className="text-emerald-500">✓</span>}
              {showAnswer && isSelected && !isCorrect && <span className="text-red-500">✗</span>}
            </button>
          );
        })}
      </div>

      {/* 解説表示 */}
      {showAnswer && current.explanation && (
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="mb-1 text-sm font-black text-blue-800">解説</p>
          <p className="text-sm font-medium leading-6 text-blue-700">{current.explanation}</p>
        </div>
      )}

      {/* 次へ / 結果を見るボタン */}
      {showAnswer && (
        <button
          onClick={handleNext}
          disabled={saving}
          className="w-full rounded-2xl bg-slate-950 py-4 text-lg font-black text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "保存中..." : isLastQuestion ? "結果を見る" : "次の問題へ →"}
        </button>
      )}
    </div>
  );
}
