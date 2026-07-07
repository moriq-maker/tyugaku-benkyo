"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

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
    <div className="app-shell min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-5xl lg:grid-cols-[1fr_420px]">

        {/* ── 左：ブランドパネル ── */}
        <div className="study-hero relative hidden p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="hero-content">
            <Link href="/" className="inline-flex items-center gap-2.5 focus-ring rounded-lg">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/12 text-sm font-black text-white border border-white/12">
                T
              </span>
              <span className="text-base font-black text-white">テスタン</span>
            </Link>

            <h1 className="mt-14 text-3xl font-black leading-snug text-white">
              学習履歴を残して、<br />次の復習につなげる。
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              ログインすると、回答履歴と間違えた問題の解き直しが使えます。連続学習記録も積み上がります。
            </p>
          </div>

          <div className="hero-content">
            <div className="grid grid-cols-3 gap-3">
              {[["650問", "収録問題"], ["5教科", "対応科目"], ["無料", "完全無料"]].map(([v, l]) => (
                <div key={l} className="data-tile p-4 text-center">
                  <p className="text-xl font-black text-white">{v}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 右：フォーム ── */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-8">
          {/* モバイルロゴ */}
          <Link href="/" className="mb-8 inline-flex items-center gap-2.5 focus-ring rounded-lg lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">T</span>
            <span className="text-base font-black text-slate-900">テスタン</span>
          </Link>

          <div className="panel p-6 sm:p-8">
            <h2 className="text-2xl font-black text-slate-900">ログイン</h2>
            <p className="mt-1 text-sm text-slate-500">学習を続きから再開します。</p>

            <button
              onClick={handleGoogleLogin}
              className="focus-ring mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <GoogleMark />
              Googleでログイン
            </button>

            <div className="my-5 flex items-center gap-3">
              <hr className="flex-1 border-slate-200" />
              <span className="text-xs font-semibold text-slate-400">または</span>
              <hr className="flex-1 border-slate-200" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="6文字以上"
                  className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="focus-ring primary-action w-full rounded-xl py-3 text-sm font-black disabled:opacity-60"
              >
                {loading ? "ログイン中…" : "ログイン →"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              アカウントがない場合は{" "}
              <Link href="/auth/signup" className="font-black text-slate-900 underline underline-offset-2 hover:no-underline">
                新規登録
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
