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
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-lg text-white shadow-sm">
          T
        </span>
        <span>
          <span className="block text-lg font-black tracking-normal text-slate-950">テスタン</span>
          <span className="hidden text-xs font-medium text-slate-500 sm:block">中1・1学期中間対策</span>
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden max-w-48 truncate rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:block">
          {email}
        </span>
        <button
          onClick={handleLogout}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:border-red-200 hover:text-red-600"
        >
          ログアウト
        </button>
      </div>
      </div>
    </header>
  );
}
