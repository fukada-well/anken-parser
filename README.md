# 案件Parser

IT案件情報をAIで統一フォーマットに変換・管理するツールです。

---

## セットアップ手順

### 必要なもの
- GitHubアカウント（無料）
- Vercelアカウント（無料）: https://vercel.com
- Anthropic APIキー: https://console.anthropic.com

---

### 1. GitHubにアップロード

1. https://github.com にログイン
2. 右上「+」→「New repository」
3. Repository name: `anken-parser` → 「Create repository」
4. ターミナルでこのフォルダに移動して実行：

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/あなたのID/anken-parser.git
git push -u origin main
```

---

### 2. VercelにDBを作成

1. https://vercel.com にログイン
2. 「Add New Project」→ GitHubの `anken-parser` を選んで「Import」
3. 「Deploy」を押す（この時点ではエラーになってもOK）
4. プロジェクトページの「Storage」タブ → 「Create Database」→「Neon」を選択
5. DB名は `anken-parser-db`、Region は `ap-southeast-1` → 「Create」
6. 「Connect to Project」をクリック（環境変数が自動追加される）

---

### 3. 環境変数を設定

Vercelの「Settings」→「Environment Variables」に以下を追加：

| 変数名 | 値 |
|--------|-----|
| `ANTHROPIC_API_KEY` | sk-ant-api03-... |
| `SECURITY_IP_RESTRICTION` | false（IP制限を使う場合は true） |
| `ALLOWED_IPS` | 許可するIPをカンマ区切りで（例: 1.2.3.4,5.6.7.8） |
| `SECURITY_BASIC_AUTH` | false（Basic認証を使う場合は true） |
| `BASIC_AUTH_USER` | admin |
| `BASIC_AUTH_PASSWORD` | 任意のパスワード |

※ `POSTGRES_PRISMA_URL` と `POSTGRES_URL_NON_POOLING` はNeon連携で自動追加されます

---

### 4. DBテーブルを作成

Vercelの「Settings」→「Environment Variables」で環境変数を確認後、
ターミナルで以下を実行：

```bash
# .env.local にVercelのDB接続URLをコピーしてから実行
npx prisma db push
```

または Vercel の「Deployments」から最新のデプロイを「Redeploy」するだけでも
自動で `prisma generate` が走ります（テーブル作成は別途必要）。

---

### 5. 再デプロイ

```bash
git add .
git commit -m "setup complete"
git push
```

pushするとVercelが自動でビルド・デプロイします。
完了するとURLが発行されます。

---

## セキュリティ設定

### IP制限
Vercelの環境変数で設定します：
```
SECURITY_IP_RESTRICTION = true
ALLOWED_IPS = 自分のIP,相手のIP
```
自分のIPは https://whatismyip.com で確認できます。

### Basic認証
```
SECURITY_BASIC_AUTH = true
BASIC_AUTH_USER = admin
BASIC_AUTH_PASSWORD = 任意のパスワード
```

---

## ローカルで動かす場合

`.env.local` ファイルを作成して以下を記述：

```
ANTHROPIC_API_KEY=sk-ant-api03-...
POSTGRES_PRISMA_URL=（NeonのConnection String）
POSTGRES_URL_NON_POOLING=（NeonのDirect URL）
```

```bash
npm install
npx prisma db push
npm run dev
```

http://localhost:3000 で起動します。
