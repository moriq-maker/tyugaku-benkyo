"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "ホーム", mark: "H" },
  { href: "/dashboard#subjects", label: "教科", mark: "S" },
  { href: "/dashboard#review", label: "復習", mark: "R" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/92 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {navItems.map((item) => {
          const [path, targetHash] = item.href.split("#");
          const active = pathname === path && (targetHash ? hash === `#${targetHash}` : hash === "");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-bold transition ${
                active
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded text-[10px] ${
                  active ? "bg-white text-slate-950" : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.mark}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
