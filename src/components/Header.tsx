"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Header({ email }: { email: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-900 text-sm font-black text-white">
            T
          </span>
          <span>
            <span className="block text-base font-bold tracking-normal text-slate-950">テスタン</span>
            <span className="hidden text-xs font-medium text-slate-500 sm:block">定期テスト演習</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
          >
            ダッシュボード
          </Link>
          <span className="hidden max-w-48 truncate border-l border-slate-200 pl-3 text-xs font-medium text-slate-500 md:block">
            {email}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            ログアウト
          </button>
        </nav>
      </div>
    </header>
  );
}
