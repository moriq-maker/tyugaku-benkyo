import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// OAuthコールバックとメール確認後のリダイレクト処理
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=認証に失敗しました`);
}
