import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuizClient from "./QuizClient";

function shuffleProblems<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ grade?: string; review?: string }>;
}) {
  const { subject: subjectEn } = await params;
  const { grade: gradeParam, review } = await searchParams;
  const grade = Number(gradeParam ?? 1);
  const mode = review === "wrong" ? "review" : "normal";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 科目情報を取得
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("name_en", subjectEn)
    .single();

  if (!subject) notFound();

  let problems = null;

  if (mode === "review" && user) {
    const { data: latestWrongAnswers } = await supabase
      .from("latest_user_problem_answers")
      .select("problem_id")
      .eq("user_id", user.id)
      .eq("subject_id", subject.id)
      .eq("grade", grade)
      .eq("is_correct", false)
      .limit(50);

    const problemIds = (latestWrongAnswers ?? [])
      .map((answer) => answer.problem_id)
      .filter(Boolean);

    if (problemIds.length > 0) {
      const { data } = await supabase
        .from("problems")
        .select("*")
        .in("id", problemIds);
      problems = data;
    } else {
      problems = [];
    }
  } else {
    // 指定学年の問題をランダムに10問取得
    const { data } = await supabase
      .from("problems")
      .select("*")
      .eq("subject_id", subject.id)
      .eq("grade", grade);
    problems = data;
  }

  if (!problems || problems.length === 0) notFound();

  // 問題をシャッフル（最大10問）
  const shuffled = shuffleProblems(problems).slice(0, 10);

  return (
    <QuizClient
      subject={subject}
      problems={shuffled}
      grade={grade}
      mode={mode}
    />
  );
}
