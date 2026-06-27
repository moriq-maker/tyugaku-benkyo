import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";

// ログイン済みユーザー向けレイアウト
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col">
      <Header email={user.email ?? ""} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 sm:px-6 sm:py-7">
        {children}
      </main>
    </div>
  );
}
