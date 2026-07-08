# やることポータル

**「話す・学ぶ・遊ぶ」を1つにまとめたミニアプリポータル**

高校生活を軸にした自作Webアプリを、1つのNext.jsプロジェクト・1つのURLで公開しています。

---

## Demo

**デモURL:** `<ここにVercelの本番URLを入れる>`

| ルート | アプリ | 概要 |
|---|---|---|
| `/` | やることポータル | アプリ一覧のランディングページ |
| `/talk` | 🗣️ はなす日記 | 毎日1分のスピーキング練習。採点なし・音声非保存のやさしい発話習慣アプリ |
| `/game` | ⚔️ 放課後タクティクス | 3対3のリアルタイム演習バトル。ユニットは自動で戦い、プレイヤーは科目スキルの発動タイミングを指示する3Dゲーム |
| `/study` | 📚 じぶん自習校 | 25分の自習でスマホ逃避を卒業。バーチャル自習室と、勉強するほど全国を旅できる旅行モード |
| (外部) | 🛡 wt-battle-sim | React + Vite製の戦闘シミュレータ(別プロジェクトとして公開予定) |

---

## 各アプリのドキュメント

- [はなす日記](docs/hanasu-nikki.md) — 開発背景・UX設計・データ設計の詳細

---

## 技術構成

| 技術 | 用途 |
|---|---|
| Next.js 16 (App Router) | フレームワーク。各アプリをルートで住み分け |
| React 19 / TypeScript | UI・型安全な開発 |
| Tailwind CSS 4 | スタイリング |
| React Three Fiber + three.js | 放課後タクティクスの3D描画 |
| zustand | ゲーム状態のストア(シミュレーションはReact外で更新) |
| MediaRecorder / Web Audio API | はなす日記のブラウザ録音・音量表示 |
| localStorage | 全アプリの記録永続化(アカウント不要・サーバー送信なし) |
| Vitest | ゲームロジックのユニットテスト |

**バックエンド・外部API・データベースは不使用。** すべてブラウザ内で完結します。

---

## アーキテクチャの方針

- 各アプリは `src/app/<route>/page.tsx`(metadataを持つ薄いサーバーコンポーネント)+ `src/components/<app>/`(UI)+ `src/lib/<app>/`(ロジック)の名前空間に分離
- ゲームロジック(`src/lib/game/`)はthree.js/React非依存の純TypeScript。グリッドA*・DDA射線判定・固定タイムステップ(30Hz)シミュレーションをVitestでテスト
- localStorageのキーはアプリごとにプレフィックスを分けて衝突を防止(`hanasu_*` / `jibun_*` など)

---

## セットアップ

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run typecheck  # 型チェック
npm run lint       # ESLint
npm test           # Vitest(ゲームロジック)
npm run build      # 本番ビルド
```

---

## デプロイ

Vercelにリポジトリをimportするだけでデプロイできます(Framework: Next.js自動検出、環境変数不要)。

---

## ライセンス

MIT
