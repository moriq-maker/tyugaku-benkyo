import Link from "next/link";

const features = [
  { label: "5科目", value: "10問ずつ", tone: "bg-blue-50 text-blue-700 border-blue-100" },
  { label: "対象範囲", value: "中1・4〜6月", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { label: "学習記録", value: "正答率を保存", tone: "bg-violet-50 text-violet-700 border-violet-100" },
];

const subjects = ["数学", "英語", "国語", "理科", "社会"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-xl font-black text-white shadow-sm">
            T
          </span>
          <span>
            <span className="block text-xl font-black">テスタン</span>
            <span className="block text-xs font-bold text-slate-500">中学生の定期テスト対策</span>
          </span>
        </Link>
        <Link
          href="/auth/login"
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          ログイン
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1fr_440px] lg:pt-14">
        <section>
          <div className="mb-5 inline-flex rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm">
            中1の1学期中間テスト範囲からスタート
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-6xl">
            テスト前の勉強を、解いて覚える流れに変える。
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
            テスタンは、5科目の4択問題を解きながら弱点を見つける学習サポートWebアプリです。
            まずは中学1年生の4月〜6月範囲に絞って、短時間で復習できます。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="rounded-2xl bg-slate-950 px-7 py-4 text-center text-base font-black text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              無料で始める
            </Link>
            <Link
              href="/auth/login"
              className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-center text-base font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              ログインして続きから
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.label} className={`rounded-2xl border px-5 py-4 ${feature.tone}`}>
                <p className="text-sm font-bold opacity-80">{feature.label}</p>
                <p className="mt-1 text-xl font-black">{feature.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white bg-white/80 p-4 shadow-2xl shadow-slate-200 backdrop-blur">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400">今日の復習</p>
                <p className="mt-1 text-2xl font-black">1セット10問</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-950">
                4択
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {subjects.map((subject, index) => (
                <div key={subject} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-black text-slate-950">
                    {index + 1}
                  </span>
                  <span className="font-bold">{subject}</span>
                  <span className="ml-auto text-sm font-bold text-slate-400">10問</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-xs font-bold text-blue-500">正答率</p>
              <p className="mt-1 text-2xl font-black text-blue-700">記録</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-bold text-emerald-500">解説</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">即時</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-500">弱点</p>
              <p className="mt-1 text-2xl font-black text-amber-700">発見</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
