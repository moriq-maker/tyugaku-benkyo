# テスタン

中学1年生の1学期中間テスト対策に特化した、5科目対応の学習サポートWebアプリです。

数学・英語・国語・理科・社会の問題を解きながら、正答率や間違えた問題を確認し、テスト前の復習を効率化します。

公開URL: https://tyugaku-benkyo.vercel.app/

## 現在の対応範囲

- 対象学年: 中学1年生
- 対象時期: 1学期中間テスト範囲（4月から6月）
- 対象科目: 国語・数学・英語・理科・社会
- 問題形式: 4択モード、短答式モード（5教科）
- 出題数: 1回あたり最大10問
- 問題データ: 5科目合計650問（4択325問 + 短答式325問）

今後、中1期末・中2・中3の範囲を追加できるように、DB上は `grade` や `exam_term` を持つ構成にしています。

## 主な機能

- メール/パスワードログイン
- Googleログイン
- 科目別ダッシュボード
- 科目・学年別のクイズ
- 単元別モード
- 4択モードと短答式モードの切り替え
- 5教科の短答式入力問題（実テスト型の記述・整序・資料読み取りを含む）
- 即時フィードバックと解説表示
- 結果画面での振り返り
- 回答履歴の保存
- 科目別・全体の正答率集計
- カテゴリ別の弱点分析
- 間違えた回数と直近の不正解をもとにした優先復習
- 7日間の学習履歴グラフ
- 問題のブックマークと保存問題の復習
- iPhone / iPad / PC 向けレスポンシブUI

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フロントエンド | Next.js 16 App Router + TypeScript |
| スタイリング | Tailwind CSS |
| 認証 | Supabase Auth |
| データベース | Supabase PostgreSQL |
| ホスティング | Vercel |

## セットアップ

### 1. 依存パッケージをインストール

```bash
npm install
```

### 2. 環境変数を作成

`.env.local.example` をコピーして `.env.local` を作成します。

```bash
cp .env.local.example .env.local
```

`.env.local` にSupabaseの値を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=SupabaseプロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=Supabase anonキー
```

`.env.local` はGitHubに上げないでください。

### 3. Supabaseを準備

Supabase Dashboardの SQL Editor で、以下を順番に実行します。

```text
supabase/schema.sql
supabase/seed.sql
```

`schema.sql` には以下が含まれます。

- テーブル作成
- RLS設定
- 集計用ビュー
- ブックマーク用テーブル
- 弱点分析・学習履歴・復習優先度用ビュー
- クイズ高速化用の `get_random_problems` 関数
- 必要な権限設定

`seed.sql` は既存の `problems` と `user_answers` を削除してから、中1・1学期中間範囲の問題を投入します。

### 4. Supabase Authを設定

Supabase Dashboardで以下を設定します。

- Authentication > Providers > Email を有効化
- Googleログインを使う場合は Providers > Google を有効化
- Authentication > URL Configuration にローカルと本番URLを登録

登録するURLの例:

```text
http://localhost:3000
https://tyugaku-benkyo.vercel.app
```

Google OAuth側にはSupabaseのCallback URLを登録します。

### 5. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで開きます。

```text
http://localhost:3000
```

## 開発時の確認

修正後は最低限以下を実行します。

```bash
npm run lint
npm run build
```

Supabaseの `schema.sql` や `seed.sql` を変更した場合は、Supabase SQL Editorでも再実行してください。

## デプロイ

VercelでGitHubリポジトリを連携し、Environment Variablesに `.env.local` と同じ値を設定します。

GitHubに反映すると、Vercelが自動で再デプロイします。

```bash
git add .
git commit -m "Update app"
git push
```

DB構造を変えた場合は、GitHubにpushするだけではSupabaseには反映されません。必ずSupabase SQL Editorで `schema.sql` を実行します。

## ディレクトリ構成

```text
tyugaku-benkyo/
├── docs/
│   └── 仕様書.md
├── supabase/
│   ├── schema.sql
│   └── seed.sql
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── auth/
│   │   └── (main)/
│   ├── components/
│   ├── lib/supabase/
│   └── proxy.ts
├── .env.local.example
└── README.md
```

## ドキュメント

- [仕様書](docs/仕様書.md)
