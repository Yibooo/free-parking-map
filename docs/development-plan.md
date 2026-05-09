# 開発計画書 — 無料駐車場マップ（Free Parking Map）

**バージョン**: 1.0  
**作成日**: 2026-05-09  
**ステータス**: 確定

---

## 1. 技術スタック

| レイヤー | 技術 | 理由 |
|---------|-----|------|
| Frontend | Next.js 14（App Router） | SSR/SSG対応・SEO有利 |
| UI | Tailwind CSS + shadcn/ui | 高速UI構築 |
| 地図 | Leaflet + react-leaflet | **完全無料**・OpenStreetMap利用 |
| Backend/DB | Convex | リアルタイム・スキーマレス・無料枠充実 |
| スクレイピング | Playwright + Cheerio | 動的/静的サイト両対応 |
| デプロイ | Vercel | Next.js親和性・無料枠あり |
| バージョン管理 | GitHub | - |

### 無料枠の範囲
- **Vercel**: 無料枠（100GB帯域/月、商用非利用）
- **Convex**: 無料枠（1GB DB、100万関数呼び出し/月）
- **OpenStreetMap/Leaflet**: 完全無料・タイル利用規約準拠

---

## 2. システムアーキテクチャ

```
┌──────────────────────────────────┐
│         Vercel (Frontend)         │
│  Next.js App Router               │
│  ├─ /                地図TOP      │
│  ├─ /facilities/[id] 施設詳細     │
│  └─ /about           概要         │
└──────────┬───────────────────────┘
           │ Convex Client SDK
┌──────────▼───────────────────────┐
│         Convex (Backend/DB)       │
│  ├─ queries   施設検索・取得       │
│  ├─ mutations データ登録・更新     │
│  └─ scheduled スクレイパー定期実行 │
└──────────┬───────────────────────┘
           │ スクレイピング
┌──────────▼───────────────────────┐
│     外部データソース               │
│  各施設公式サイト・Google Maps等   │
└──────────────────────────────────┘
```

---

## 3. スクレイピング戦略

### 3-1. 対象データソース

| 優先度 | ソース | 対象情報 | 手法 |
|-------|-------|---------|-----|
| 高 | 各施設公式サイト | 駐車場詳細・営業時間 | Playwright（動的）/ Cheerio（静的） |
| 高 | 道の駅公式サイト（michi-no-eki.jp） | 道の駅一覧・駐車情報 | Cheerio |
| 中 | じゃらんnet / るるぶ | 観光施設一覧 | Playwright |
| 中 | 各自治体サイト | 公共施設・図書館 | Cheerio |
| 参考 | Google Maps（手動補完） | 住所・座標・レビュー | 手動 or Places API |

### 3-2. スクレイピングパイプライン

```
[スクレイパー実行] → [Raw HTMLパース] → [構造化データ抽出]
        ↓
[データ検証・クレンジング] → [重複チェック] → [Convex DB保存]
        ↓
[isVerified: false で仮登録] → [手動レビュー] → [isVerified: true で公開]
```

### 3-3. 実行スケジュール
- 初回：手動バッチ実行でシード投入
- 定期実行：Convex Scheduled Actions で月1回自動更新
- 更新検知：`updatedAt` と前回スクレイプ結果を差分比較

### 3-4. スクレイパーの構成ファイル

```
scraper/
├─ index.ts          エントリーポイント・スケジューラー
├─ sources/
│   ├─ michinoeki.ts  道の駅スクレイパー
│   ├─ facilities.ts  汎用施設スクレイパー
│   └─ ...
├─ parser.ts          HTMLパース共通ロジック
├─ validator.ts       データ検証・正規化
└─ types.ts           型定義
```

---

## 4. 開発フェーズ・タイムライン

### MVP（東京都）〜 約10週間

```
Week 1-2  ┃ 環境構築・設計
          ┃  - GitHubリポジトリ・Vercel・Convex セットアップ
          ┃  - DBスキーマ設計・Convexテーブル定義
          ┃  - Tailwind + shadcn/ui 導入・デザイントークン定義
          ┃  - ルーティング構成・レイアウト実装

Week 3-4  ┃ 地図UI実装
          ┃  - Leaflet + react-leaflet 地図表示
          ┃  - ピン表示・カテゴリ別アイコン
          ┃  - フィルタパネル（駐車場区分・施設カテゴリ）
          ┃  - 施設ポップアップ・サイドリスト

Week 5-6  ┃ スクレイパー開発
          ┃  - Playwright環境構築
          ┃  - 道の駅・複合施設・公共施設スクレイパー実装
          ┃  - データパース・バリデーションロジック
          ┃  - Convex Mutations でのデータ保存

Week 7-8  ┃ データ投入・施設詳細
          ┃  - 初回バッチスクレイピング実行（東京都全施設）
          ┃  - 手動レビュー・データクレンジング
          ┃  - 施設詳細ページ実装
          ┃  - キーワード検索・現在地表示

Week 9-10 ┃ 品質向上・リリース準備
          ┃  - レスポンシブ調整（スマホ最適化）
          ┃  - パフォーマンスチューニング
          ┃  - OGP・SEO設定
          ┃  - Vercel 本番デプロイ
          ┃  - 動作確認・バグ修正
```

### Phase 2（エリア拡張 + ユーザー機能）〜 MVP後 約8週間

```
Week 11-12 ┃ エリア拡張
           ┃  - 千葉・埼玉・神奈川・茨城のスクレイピング
           ┃  - 都道府県フィルタ追加

Week 13-14 ┃ ユーザー認証
           ┃  - Convex Auth 導入
           ┃  - お気に入り保存機能
           ┃  - 訪問済み記録

Week 15-16 ┃ ユーザー投稿
           ┃  - 施設情報の提案・報告フォーム
           ┃  - 管理者レビューフロー

Week 17-18 ┃ Phase 2 リリース
           ┃  - 総合テスト・バグ修正
           ┃  - 本番デプロイ
```

---

## 5. ディレクトリ構成（MVP）

```
free-parking-map/
├─ app/                        Next.js App Router
│   ├─ layout.tsx
│   ├─ page.tsx                地図TOP
│   ├─ facilities/
│   │   └─ [id]/page.tsx       施設詳細
│   └─ about/page.tsx
├─ components/
│   ├─ map/
│   │   ├─ MapView.tsx         地図本体
│   │   ├─ FacilityPin.tsx     ピンコンポーネント
│   │   └─ FacilityPopup.tsx   ポップアップ
│   ├─ filter/
│   │   ├─ FilterPanel.tsx     フィルタパネル
│   │   ├─ ParkingFilter.tsx   駐車場区分フィルタ
│   │   └─ CategoryFilter.tsx  施設カテゴリフィルタ
│   └─ facility/
│       ├─ FacilityList.tsx    施設リスト
│       └─ FacilityCard.tsx    施設カード
├─ convex/
│   ├─ schema.ts               DBスキーマ定義
│   ├─ facilities.ts           施設クエリ・ミューテーション
│   └─ scheduled.ts            定期スクレイピング
├─ scraper/                    スクレイパー（単独実行可）
│   ├─ index.ts
│   ├─ sources/
│   ├─ parser.ts
│   └─ validator.ts
├─ lib/
│   ├─ constants.ts            駐車場区分・カテゴリ定義
│   └─ utils.ts
├─ docs/
│   ├─ requirements.md         本要件定義書
│   └─ development-plan.md     本開発計画書
└─ public/
    └─ icons/                  カテゴリアイコン
```

---

## 6. Future Plan（MVP・Phase 2 以降）

| 機能 | 概要 |
|-----|-----|
| 収益化 | 施設掲載料・バナー広告（Google AdSense） |
| ユーザー報告 | 「情報が古い」報告ボタン・自動アラート |
| 多言語対応 | 英語・中国語（観光客向け） |
| ルート検索連携 | 出発地から施設へのルート案内（Google Maps API） |
| プッシュ通知 | お気に入り施設の駐車場条件変更通知 |
| モバイルアプリ | React Native による iOS/Android アプリ化 |

---

## 7. 利用規約・免責事項

- 本サービスのデータはスクレイピングにより自動収集されたものを含む
- 駐車場料金・条件は変更される場合があり、最新情報は各施設の公式サイトで確認すること
- 本サービスの情報を利用した損害について、運営者は責任を負わない
