# DLP ITニュース・プロンプトメーカー

公開ITニュースRSSを取得し、PCDEPOTのデジタルライフプランナー視点でGeminiに貼り付ける分析プロンプトを作るWebアプリです。

## 機能

- ITニュースRSSの取得
- ニュース一覧表示
- カテゴリ絞り込み
- キーワード検索
- 相談増加スコア表示
- 「Gemini用プロンプトをコピー」ボタン
- 顧客情報、社内情報、個人情報を入力しない前提のプロンプト生成

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## Web公開

Vercelでの公開を想定しています。

1. このフォルダをGitHubリポジトリにアップロードします。
2. Vercelで「Add New Project」からGitHubリポジトリを選びます。
3. Framework Preset は Next.js のままでデプロイします。
4. デプロイ後に発行されるURLへアクセスすると、Web上のアプリとして利用できます。

環境変数は不要です。RSS取得は `/api/news` のサーバーAPIで実行します。

## RSS取得元

- IPA セキュリティセンター
- JPCERT/CC 注意喚起
- ITmedia NEWS
- PC Watch
- INTERNET Watch

## 注意

- RSS提供元の仕様変更やネットワーク状態により、取得できない場合があります。
- AI分析はアプリ内では実行しません。コピーしたプロンプトをGeminiなどに貼り付けて使います。
- 公開情報のみを扱い、顧客情報・社内情報・個人情報は入力しないでください。
