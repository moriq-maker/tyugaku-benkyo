"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f6f8fb_38%,#eef2ff_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white bg-white/90 p-8 shadow-2xl shadow-slate-200 backdrop-blur">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-2xl font-black text-white">
              T
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-black text-slate-950">ログイン</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">今日の復習を続けましょう。</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Googleでログイン
        </button>

        <div className="mb-6 flex items-center gap-4">
          <hr className="flex-1 border-slate-200" />
          <span className="text-sm font-bold text-slate-400">または</span>
          <hr className="flex-1 border-slate-200" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-bold text-slate-700">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-slate-700">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="6文字以上"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-slate-950 py-3 font-black text-white shadow-lg shadow-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          アカウントをお持ちでない方は{" "}
          <Link href="/auth/signup" className="font-black text-indigo-600 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
