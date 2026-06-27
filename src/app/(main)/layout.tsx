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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f6f8fb_34%,#eef2ff_72%,#f8fafc_100%)] flex flex-col">
      <Header email={user.email ?? ""} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
