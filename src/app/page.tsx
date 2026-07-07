import Link from "next/link";

const steps = [
  {
    num: "1",
    title: "教科を選ぶ",
    body: "数学・英語・国語・理科・社会の5教科から今日やる科目を選択。",
  },
  {
    num: "2",
    title: "形式を選んで演習",
    body: "4択・短答式・単元別から、その日の目的に合わせてサクッと10問。",
  },
  {
    num: "3",
    title: "間違いを解き直す",
    body: "間違い・保存問題・弱点カテゴリをあとからまとめて復習。着実に定着。",
  },
];

export default function LandingPage() {
  return (
    <div className="app-shell min-h-screen text-slate-950">

      {/* ── Header ── */}
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 focus-ring rounded-lg">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">
            T
          </span>
          <span className="text-base font-black text-slate-900">テスタン</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/auth/login"
            className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            ログイン
          </Link>
          <Link
            href="/auth/signup"
            className="focus-ring primary-action rounded-lg px-4 py-2 text-sm font-bold"
          >
            無料で始める
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-6 sm:px-8 sm:pt-10">

        {/* ── Hero ── */}
        <section className="study-hero rounded-2xl px-8 py-14 sm:px-12 sm:py-20">
          <div className="hero-content max-w-lg">
            <h1 className="text-4xl font-black leading-snug text-white sm:text-5xl">
              中学の定期テストを、<br />毎日10問で攻略する。
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">
              間違いを記録して、解き直す。シンプルな学習ループで、定期テストの点数を着実に上げる。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="focus-ring rounded-xl bg-white px-7 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-slate-100"
              >
                無料で始める →
              </Link>
              <Link
                href="/auth/login"
                className="focus-ring rounded-xl border border-white/20 px-7 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                ログイン
              </Link>
            </div>
            <p className="mt-8 text-sm text-slate-500">650問収録 · 5教科対応 · 完全無料</p>
          </div>
        </section>

        {/* ── 使い方 ── */}
        <section className="mt-16">
          <h2 className="text-xl font-black text-slate-900">使い方</h2>
          <p className="mt-1 text-sm text-slate-500">3ステップで始められます。</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {steps.map(({ num, title, body }) => (
              <div key={num} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                  {num}
                </span>
                <div>
                  <h3 className="font-black text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mt-16">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-12 text-center">
            <h2 className="text-2xl font-black text-slate-900">今日から、毎日10問。</h2>
            <p className="mt-2 text-sm text-slate-500">登録は30秒。まず1科目10問やってみよう。</p>
            <Link
              href="/auth/signup"
              className="focus-ring primary-action mt-6 inline-block rounded-xl px-8 py-3 text-sm font-bold"
            >
              無料アカウントを作る →
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
