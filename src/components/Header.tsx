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
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 px-3 py-3 shadow-xl shadow-slate-950/20 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link href="/dashboard" className="flex items-center gap-3 focus-ring rounded-xl">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 text-sm font-black text-white border border-white/15">
            T
          </span>
          <span className="text-sm font-black text-white">テスタン</span>
        </Link>

        <nav className="flex shrink-0 items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white focus-ring sm:inline-flex"
          >
            ダッシュボード
          </Link>
          {email && (
            <span className="hidden max-w-44 truncate rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 md:block">
              {email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15 focus-ring"
          >
            ログアウト
          </button>
        </nav>
      </div>
    </header>
  );
}
