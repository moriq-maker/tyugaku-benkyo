# テスタン 📚

全国の中学生向け **定期テスト対策Webアプリ**。

5科目（国語・数学・英語・理科・社会）の問題を学年別に解きながら、弱点を把握して効率的に学習できます。

---

## 機能概要

- **科目別問題集** — 5科目 × 中学1〜3年の問題
- **4択クイズ** — 即時フィードバックと解説表示
- **学習記録** — 科目ごとの正答率を自動集計
- **認証** — メール/パスワード・Googleログイン

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| バックエンド | Next.js API Routes |
| 認証・DB | Supabase (Auth + PostgreSQL) |
| ホスティング | Vercel |

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [仕様書](docs/仕様書.md) | 機能要件・画面設計・DBスキーマ |

## セットアップ

### 1. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成：

```bash
cp .env.local.example .env.local
```

`.env.local` を編集：

```env
NEXT_PUBLIC_SUPABASE_URL=（SupabaseプロジェクトURL）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（Supabase anonキー）
```

### 2. Supabase の設定

Supabase ダッシュボードの **SQL Editor** で以下を順に実行：

```
supabase/schema.sql  ← テーブル作成・RLS設定
supabase/seed.sql    ← 初期問題データの投入
```

Authentication → Providers から **Google** を有効化（任意）。

### 3. 依存パッケージのインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開く。

## ディレクトリ構成

```
tyugaku-benkyo/
├── docs/
│   └── 仕様書.md           # 機能要件・画面設計・DBスキーマ
├── supabase/
│   ├── schema.sql          # DBスキーマ（テーブル定義・RLS）
│   └── seed.sql            # 初期問題データ
├── src/
│   ├── proxy.ts            # 認証プロキシ（Next.js 16）
│   ├── app/
│   │   ├── page.tsx        # ランディングページ
│   │   ├── layout.tsx      # ルートレイアウト
│   │   ├── auth/           # 認証ページ群
│   │   └── (main)/         # ログイン後ページ群
│   ├── components/         # 共通コンポーネント
│   ├── lib/supabase/       # Supabaseクライアント
│   └── types/              # TypeScript型定義
├── .env.local.example      # 環境変数テンプレート
└── README.md
```

## デプロイ（Vercel）

1. Vercel にリポジトリを連携
2. Environment Variables に `.env.local` の内容を設定
3. デプロイ実行

---

© 2025 テスタン
