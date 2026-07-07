"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function RepeatIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

const navItems = [
  { href: "/dashboard",          label: "ホーム", Icon: HomeIcon },
  { href: "/dashboard#subjects", label: "教科",   Icon: BookIcon },
  { href: "/dashboard#review",   label: "復習",   Icon: RepeatIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 sm:hidden">
      <div className="mx-auto grid max-w-sm grid-cols-3 gap-1">
        {navItems.map(({ href, label, Icon }) => {
          const [path, targetHash] = href.split("#");
          const active =
            pathname === path &&
            (targetHash ? hash === `#${targetHash}` : hash === "");

          return (
            <Link
              key={href}
              href={href}
              className={`focus-ring flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-slate-100 text-slate-900 font-black"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
