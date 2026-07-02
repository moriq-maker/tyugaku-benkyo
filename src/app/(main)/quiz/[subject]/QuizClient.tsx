"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Problem, Subject, QuizResult } from "@/types";

const CHOICES = ["A", "B", "C", "D"] as const;

function normalizeAnswer(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "")
    .replace(/　+/g, "")
    .toLowerCase();
}

function isShortAnswerCorrect(problem: Problem, value: string): boolean {
  const normalized = normalizeAnswer(value);
  const accepted = [
    problem.correct_text,
    ...(problem.accepted_answers ?? []),
  ].filter(Boolean) as string[];

  return accepted.some((answer) => normalizeAnswer(answer) === normalized);
}

function Difficulty({ level }: { level: number }) {
  return (
    <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
      {"★".repeat(level)}
      {"☆".repeat(3 - level)}
    </span>
  );
}

export default function QuizClient({
  subject,
  problems,
  grade,
  mode,
  problemFormat,
  initialBookmarkedProblemIds,
}: {
  subject: Subject;
  problems: Problem[];
  grade: number;
  mode: "normal" | "review" | "bookmarked";
  problemFormat: "multiple_choice" | "short_answer";
  initialBookmarkedProblemIds: string[];
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    () => new Set(initialBookmarkedProblemIds)
  );
  const [bookmarkSaving, setBookmarkSaving] = useState(false);

  const current = problems[currentIndex];
  const isShortAnswer = problemFormat === "short_answer";
  const isLastQuestion = currentIndex === problems.length - 1;
  const progress = Math.round(((currentIndex + 1) / problems.length) * 100);

  const getChoiceText = (choice: string): string => {
    const map: Record<string, string> = {
      A: current.choice_a,
      B: current.choice_b,
      C: current.choice_c,
      D: current.choice_d,
    };
    return map[choice] ?? "";
  };

  const handleSelect = useCallback((choice: string) => {
    if (showAnswer) return;
    setSelected(choice);
    setShowAnswer(true);
  }, [showAnswer]);

  const handleCheckShortAnswer = useCallback(() => {
    if (showAnswer || !selected?.trim()) return;
    setShowAnswer(true);
  }, [selected, showAnswer]);

  const handleToggleBookmark = useCallback(async () => {
    if (bookmarkSaving) return;

    const nextBookmarked = !bookmarkedIds.has(current.id);
    setBookmarkedIds((ids) => {
      const next = new Set(ids);
      if (nextBookmarked) next.add(current.id);
      else next.delete(current.id);
      return next;
    });
    setBookmarkSaving(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (nextBookmarked) {
        await supabase
          .from("user_bookmarks")
          .upsert({ user_id: user.id, problem_id: current.id }, { onConflict: "user_id,problem_id" });
      } else {
        await supabase
          .from("user_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("problem_id", current.id);
      }
    } catch (e) {
      console.error("ブックマークの保存に失敗しました:", e);
      setBookmarkedIds((ids) => {
        const next = new Set(ids);
        if (nextBookmarked) next.delete(current.id);
        else next.add(current.id);
        return next;
      });
    } finally {
      setBookmarkSaving(false);
    }
  }, [bookmarkSaving, bookmarkedIds, current.id]);

  const handleNext = useCallback(async () => {
    if (!selected?.trim()) return;

    const isCorrect = isShortAnswer
      ? isShortAnswerCorrect(current, selected)
      : selected === current.answer;
    const newResult: QuizResult = {
      problem: current,
      userAnswer: selected,
      isCorrect,
    };
    const updatedResults = [...results, newResult];

    if (isLastQuestion) {
      setSaving(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("user_answers").insert(
            updatedResults.map((result) => ({
              user_id: user.id,
              problem_id: result.problem.id,
              is_correct: result.isCorrect,
            }))
          );
        }
      } catch (e) {
        console.error("回答の保存に失敗しました:", e);
      }

      sessionStorage.setItem(
        "quiz_results",
        JSON.stringify({
          results: updatedResults,
          subject,
          grade,
          mode,
          problemFormat,
        })
      );
      router.push("/result");
      return;
    }

    setResults(updatedResults);
    setCurrentIndex((index) => index + 1);
    setSelected(null);
    setShowAnswer(false);
  }, [selected, current, results, isLastQuestion, subject, grade, mode, router, isShortAnswer, problemFormat]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={`/subjects/${subject.name_en}`}
          className="min-w-0 rounded-md px-2 py-1 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950"
        >
          <span className="truncate">← {subject.name}</span>
        </Link>
        <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
          {mode === "review" ? "優先復習" : mode === "bookmarked" ? "ブックマーク" : problemFormat === "short_answer" ? "短答式" : "4択"}
        </span>
      </div>

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-bold text-slate-950">
            {currentIndex + 1} / {problems.length}
          </span>
          <span className="font-semibold text-slate-500">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
              {current.category}
            </span>
            <Difficulty level={current.difficulty} />
            <button
              type="button"
              onClick={handleToggleBookmark}
              disabled={bookmarkSaving}
              className={`ml-auto rounded-md border px-3 py-1 text-xs font-bold transition disabled:opacity-60 ${
                bookmarkedIds.has(current.id)
                  ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {bookmarkedIds.has(current.id) ? "保存済み" : "保存"}
            </button>
          </div>
          {current.passage && (
            <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              {current.passage}
            </div>
          )}
          <h1 className="text-xl font-bold leading-8 text-slate-950">
            {current.question}
          </h1>
        </div>

        <div className="space-y-2 p-4">
          {isShortAnswer ? (
            <div className="space-y-3">
              <input
                value={selected ?? ""}
                onChange={(event) => setSelected(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleCheckShortAnswer();
                }}
                disabled={showAnswer}
                placeholder="答えを入力"
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-slate-900 disabled:bg-slate-50"
              />
              {showAnswer && (
                <div
                  className={`rounded-md border px-4 py-3 text-sm font-semibold ${
                    isShortAnswerCorrect(current, selected ?? "")
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-red-500 bg-red-50 text-red-900"
                  }`}
                >
                  {isShortAnswerCorrect(current, selected ?? "")
                    ? "正解です。"
                    : `正解: ${current.correct_text ?? ""}`}
                </div>
              )}
            </div>
          ) : (
            CHOICES.map((choice) => {
              const text = getChoiceText(choice);
              const isCorrect = choice === current.answer;
              const isSelected = choice === selected;

              let choiceStyle = "border-slate-200 bg-white text-slate-800 hover:border-slate-400";
              if (showAnswer) {
                if (isCorrect) choiceStyle = "border-emerald-500 bg-emerald-50 text-emerald-900";
                else if (isSelected) choiceStyle = "border-red-500 bg-red-50 text-red-900";
                else choiceStyle = "border-slate-200 bg-slate-50 text-slate-400";
              }

              return (
                <button
                  key={choice}
                  onClick={() => handleSelect(choice)}
                  disabled={showAnswer}
                  className={`flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition ${choiceStyle}`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white text-sm font-bold text-slate-700">
                    {choice}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-6">{text}</span>
                  {showAnswer && isCorrect && <span className="shrink-0 text-xs font-bold text-emerald-700 sm:text-sm">正解</span>}
                  {showAnswer && isSelected && !isCorrect && <span className="shrink-0 text-xs font-bold text-red-700 sm:text-sm">選択</span>}
                </button>
              );
            })
          )}
        </div>
      </section>

      {showAnswer && current.explanation && (
        <section className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-bold text-blue-900">解説</p>
          <p className="mt-2 text-sm leading-6 text-blue-900">{current.explanation}</p>
        </section>
      )}

      <div className="sticky bottom-0 mt-4 border-t border-slate-200 bg-[#f4f6f8]/95 py-3 backdrop-blur">
        <button
          onClick={showAnswer ? handleNext : isShortAnswer ? handleCheckShortAnswer : undefined}
          disabled={saving || !selected?.trim()}
          className="mt-4 w-full rounded-md bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {saving
            ? "保存中..."
            : showAnswer
              ? isLastQuestion ? "結果を見る" : "次の問題へ"
              : isShortAnswer ? "答え合わせ" : "選択してください"}
        </button>
      </div>
    </div>
  );
}
