"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function SignupPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("登録に失敗しました。しばらくしてからもう一度お試しください。");
      setLoading(false);
      return;
    }
    setDone(true);
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (done) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
        <div className="panel mx-auto max-w-md p-8 text-center animate-pop-in">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <svg className="h-7 w-7 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900">確認メールを送信しました</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            <strong className="text-slate-700">{email}</strong> に確認メールを送りました。
            メール内のリンクから登録を完了してください。
          </p>
          <Link
            href="/auth/login"
            className="focus-ring primary-action mt-6 inline-flex rounded-xl px-6 py-3 text-sm font-bold"
          >
            ログインへ →
          </Link>
        </div>
      </div>
    );
  }

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
              まずは1科目、<br />10問から始めよう。
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              アカウントを作成すると、回答履歴と間違えた問題が保存されます。テスト前の復習を短い単位で繰り返せます。
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "全問題に無料でアクセス",
                "弱点を自動で記録",
                "間違い問題の解き直し",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm font-semibold text-slate-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-white">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-content">
            <p className="text-sm font-semibold text-slate-500">すでにアカウントをお持ちの方は</p>
            <Link
              href="/auth/login"
              className="focus-ring mt-2 inline-flex rounded-lg border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              ログイン →
            </Link>
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
            <h2 className="text-2xl font-black text-slate-900">新規登録</h2>
            <p className="mt-1 text-sm text-slate-500">30秒で無料アカウントを作成。</p>

            <button
              onClick={handleGoogleLogin}
              className="focus-ring mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <GoogleMark />
              Googleで登録
            </button>

            <div className="my-5 flex items-center gap-3">
              <hr className="flex-1 border-slate-200" />
              <span className="text-xs font-semibold text-slate-400">または</span>
              <hr className="flex-1 border-slate-200" />
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
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
                {loading ? "登録中…" : "アカウントを作成 →"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              すでにアカウントがある場合は{" "}
              <Link href="/auth/login" className="font-black text-slate-900 underline underline-offset-2 hover:no-underline">
                ログイン
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
