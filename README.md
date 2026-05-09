# 無料駐車場マップ（Free Parking Map）

東京都内の駐車場付き施設を地図上に可視化し、家族のお出かけをサポートする Web アプリ。

## 特徴

- 駐車場の料金条件（A〜E）でフィルタリング
- 施設カテゴリ（複合施設・博物館・温泉・公園など）でフィルタリング
- 地図 + リストのデュアルビュー
- レスポンシブ対応（スマホ・PC）

## ドキュメント

- [要件定義書](docs/requirements.md)
- [開発計画書](docs/development-plan.md)

## 技術スタック

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **地図**: Leaflet + OpenStreetMap（完全無料）
- **Backend/DB**: Convex
- **スクレイピング**: Playwright + Cheerio
- **デプロイ**: Vercel

## 開発フェーズ

| フェーズ | 内容 | 期間 |
|---------|-----|-----|
| MVP | 東京都対応・基本機能 | 約10週間 |
| Phase 2 | 1都4県対応・ユーザー機能 | MVP後 約8週間 |

## セットアップ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# Convex開発モード起動
npx convex dev
```
