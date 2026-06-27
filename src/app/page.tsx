import Link from "next/link";

const stats = [
  ["対象", "中1・1学期中間"],
  ["科目", "5教科"],
  ["問題", "300問"],
];

const flow = [
  ["01", "科目を選ぶ", "数学・英語・国語・理科・社会から、今日やる教科を選択。"],
  ["02", "10問解く", "4択で回答し、すぐに正誤と解説を確認。"],
  ["03", "解き直す", "間違えた問題だけを後からまとめて復習。"],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-900 text-sm font-black text-white">
            T
          </span>
          <span className="text-base font-bold">テスタン</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            ログイン
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            無料で始める
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-10">
        <section className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600">
              中学1年生の4月から6月に集中
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              テスト前に、何を間違えたかまで残す。
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
              テスタンは、定期テスト範囲の問題を解き、間違いを記録し、解き直しまでつなげる学習サポートアプリです。
              まずは中1の1学期中間範囲に絞って、毎日の復習を軽く始められる形にしています。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="rounded-md bg-slate-900 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-700"
              >
                アカウントを作成
              </Link>
              <Link
                href="/auth/login"
                className="rounded-md border border-slate-300 bg-white px-6 py-3 text-center text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                ログイン
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-500">現在の収録範囲</p>
            <div className="mt-4 divide-y divide-slate-100">
              {stats.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-4">
                  <span className="text-sm font-medium text-slate-500">{label}</span>
                  <span className="text-lg font-bold text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {flow.map(([step, title, body]) => (
            <div key={step} className="rounded-lg border border-slate-200 bg-white p-5">
              <span className="text-xs font-bold text-indigo-600">{step}</span>
              <h2 className="mt-3 text-lg font-bold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
