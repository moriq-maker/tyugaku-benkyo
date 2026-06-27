import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "テスタン - 中学生の定期テスト対策",
  description:
    "全国の中学生向け定期テスト勉強サポートアプリ。科目別問題集で効率よく学習しよう！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
