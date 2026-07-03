import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Problem } from "@/types";
import QuizClient from "./QuizClient";

type ProblemFormat = "multiple_choice" | "short_answer";

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ grade?: string; review?: string; format?: string }>;
}) {
  const { subject: subjectEn } = await params;
  const { grade: gradeParam, review, format } = await searchParams;
  const grade = Number(gradeParam ?? 1);
  const mode = review === "wrong" ? "review" : review === "bookmarked" ? "bookmarked" : "normal";
  const problemFormat: ProblemFormat = format === "short_answer" ? "short_answer" : "multiple_choice";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 科目情報を取得
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("name_en", subjectEn)
    .single();

  if (!subject) notFound();

  let problems: Problem[] | null = null;

  if (mode === "review" && user) {
    const { data: priorityRows } = await supabase
      .from("user_problem_review_priority")
      .select("problem_id")
      .eq("user_id", user.id)
      .eq("subject_id", subject.id)
      .eq("grade", grade)
      .eq("problem_format", problemFormat)
      .order("wrong_count", { ascending: false })
      .order("latest_wrong_at", { ascending: false })
      .limit(10);

    const problemIds = (priorityRows ?? [])
      .map((row) => row.problem_id)
      .filter(Boolean);

    if (problemIds.length > 0) {
      const { data } = await supabase
        .from("problems")
        .select("*")
        .in("id", problemIds)
        .eq("problem_format", problemFormat);
      const problemById = new Map((data ?? []).map((problem) => [problem.id, problem]));
      problems = problemIds.map((id) => problemById.get(id)).filter(Boolean);
    } else {
      problems = [];
    }
  } else if (mode === "bookmarked" && user) {
    const { data: bookmarkRows } = await supabase
      .from("user_bookmarks")
      .select("problem_id")
      .eq("user_id", user.id)
      .limit(50);

    const bookmarkedIds = (bookmarkRows ?? [])
      .map((row) => row.problem_id)
      .filter(Boolean);

    if (bookmarkedIds.length > 0) {
      const { data } = await supabase
        .from("problems")
        .select("*")
        .in("id", bookmarkedIds)
        .eq("subject_id", subject.id)
        .eq("grade", grade)
        .eq("problem_format", problemFormat)
        .limit(10);
      problems = data;
    } else {
      problems = [];
    }
  } else {
    // 指定学年の問題をSupabase側でランダムに10問だけ取得
    const { data, error } = await supabase.rpc("get_random_problems", {
      p_subject_id: subject.id,
      p_grade: grade,
      p_limit: 10,
      p_problem_format: problemFormat,
    });
    if (error && problemFormat === "multiple_choice") {
      const { data: fallbackData } = await supabase.rpc("get_random_problems", {
        p_subject_id: subject.id,
        p_grade: grade,
        p_limit: 10,
      });
      problems = fallbackData;
    } else {
      problems = data;
    }
  }

  if (!problems || problems.length === 0) notFound();

  const problemIds = problems.map((problem) => problem.id);
  const { data: bookmarkRows } = user && problemIds.length > 0
    ? await supabase
        .from("user_bookmarks")
        .select("problem_id")
        .eq("user_id", user.id)
        .in("problem_id", problemIds)
    : { data: [] };

  const bookmarkedProblemIds = ((bookmarkRows ?? []) as { problem_id: string }[])
    .map((bookmark) => bookmark.problem_id)
      .filter(Boolean);

  const selectedProblems = problems.slice(0, 10);

  return (
    <QuizClient
      subject={subject}
      problems={selectedProblems}
      grade={grade}
      mode={mode}
      problemFormat={problemFormat}
      initialBookmarkedProblemIds={bookmarkedProblemIds}
    />
  );
}
