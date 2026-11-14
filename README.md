# ほしのひと / personal homepage

GitHub Pages向けの静的サイトです。HTML・CSS・JavaScriptだけで動作し、通常の公開にはビルドやバックエンドは不要です。

## 公開手順（最も簡単）

1. ZIP内の **`hoshinohito-portfolio-v8` フォルダの中身** をGitHubリポジトリ直下に配置します（ZIPや親フォルダをそのまま置かない）。
2. GitHub → Settings → Pages → `Deploy from a branch` → `main` → `/(root)` を選び保存します。
3. `index.html` がトップページです。CSSとJSは相対パスなのでリポジトリ名つきURLでも動きます。

## ふだんの更新は `data/content.js` だけ

| 更新したいもの | 編集する場所 |
|---|---|
| BOOTH・GitHubなどの制作物 | `works` 配列に1件追加・編集 |
| 作品展示室のピックアップ | `settings.featuredIds` のIDを差し替え（最大3件） |
| 読みもの（note記事） | `notes` 配列 |
| Recent Workの手動公開履歴 | `recent` 配列（`date`・`source`・`title`・`url`） |
| 天気の都市 | `settings.weatherCities`（座標と `forecastCity` のコードをセット） |
| Twitterアカウントとアイコン | `settings.twitterHandle`、`settings.twitterAvatar` |

作品画像は `works[].image` のURLで指定します。BOOTHの商品写真は公開先の画像URLを参照しているため、外部側の制限で表示できない場合があります。安定性を上げたい場合は許可された画像を `assets/` に保存して相対パスに変更できます。

Recent Workは手動の公開履歴と、取得できたGitHubのリポジトリ更新・**厳しい条件を満たす制作Twitter投稿**を日付順に統合し、最大5件です。Twitterは最大1件。全投稿の一覧をここへ流し込みません。

## 星の演出 (v9)

ページ全体に淡い星が降るアニメーションを追加し、ポインタ移動時のキラキラも増量しました。既存のクリック波紋はそのままです。

- ヘッダーの **「✧ 光」** で、星の雨・カーソルのキラキラ・波紋をまとめてON/OFFできます。
- 星は画面スクロール中もビューポート全体を流れ、クリックやリンク操作は妨げません。
- 画面上の星は最大32個、カーソルの光は最大90個。画面外の星は順次自動で削除します。
- OS / ブラウザの「動きを減らす」設定 (`prefers-reduced-motion`) では動作しません。非表示タブでも新規生成しません。
- 表示内容とデータ構造はv8から変更していません。

## 自動表示・通信失敗時の動作

- **Twitterの投稿欄：** 初期表示は `data/twitter-snapshot.js` の保存済み抜粋。ブラウザからFxTwitter APIにアクセスできた場合は、実際の最近の投稿（最大5件）に差し替えます。公式埋め込みも「公式表示」から選べますが、Firefoxの追跡防止やブラウザ拡張の影響で表示できない場合があります。Firefoxの保護機能を無効にしなくても保存済み抜粋は読めます。
- **天気：** Open-Meteoの現在天気を優先し、失敗した場合は天気予報 API（気象庁データから編集された今日の予報）を試します。両方失敗した場合だけ、6時間以内の前回取得値に「前回」と表示します。初回に両方失敗した場合は気象庁のリンクを案内します。`予報` と表示される値は現在の観測ではありません。
- **地震：** P2P地震情報 APIを利用。これは緊急速報・防災通知の代わりにはできません。
- **効果音：** `ui-sound.js` でWeb Audio APIを使います。最初のクリックやキー操作後に使用可能になります。ホバー音、クリック音、消音・音量調整を用意。設定はブラウザごとに保存されます。音声素材ファイルは不要です。
- **時刻・ウェルカム・配色・カーソル装飾・星の雨：** `script.js` が担当します。

### Twitterの保存済み投稿を完全自動更新したい場合（オプション）

`tools/update_twitter.py` は認証不要のFxTwitter APIから公開投稿だけを取得し、`data/twitter-snapshot.js` を書き換えます。失敗時は旧ファイルを残します。ローカルでは `python tools/update_twitter.py` を手動実行し、GitHubにpushすれば更新できます。

定期的に公開ページの控えも更新したい場合は：

1. `tools/twitter-auto-update.yml.example` を `.github/workflows/twitter-auto-update.yml` にコピーします。
2. GitHub Pagesの Source を **GitHub Actions** に変更します（`Deploy from a branch` のままではActionsのボットpushだけでPagesが再ビルドされません）。
3. Actionsのワークフローを有効にすると、push時と6時間ごとの実行で公開投稿の控えの取得・Pagesデプロイを試みます。API側が不調でも保存済みの表示を維持します。

このオプションは必須ではありません。GitHub API・FxTwitter API・外部画像の利用可能性は各提供元に依存します。自動更新のために個人認証用CookieやTwitter APIキーは保存しません。

## フォルダ構成・責務

- `index.html`：画面の骨格（通常は変更しない）
- `style.css`：デザイン（通常は変更しない）
- `script.js`：一覧表示、Recent、SNS、天気、時刻など（通常は変更しない）
- `ui-sound.js`：効果音専用（他のJSから独立）
- `data/content.js`：**日常更新専用**
- `data/twitter-snapshot.js`：Twitterの保存済み抜粋・任意の自動更新対象
- `assets/`：ローカル画像・アイコン
- `tools/`：Twitter控えの更新（オプション）
- `tests/`：回帰確認
- `.nojekyll`：GitHub Pages用

## 更新後のチェック（デグレ防止）

```bash
python tests/check_site.py
python tests/browser_check.py
node --check script.js
node --check ui-sound.js
```

ブラウザテストは、Playwright・Chromium・BeautifulSoup（Python）が入っている環境で実行してください。外部APIの模擬成功と失敗、天気予報APIへの切り替え、Recent Workの件数上限、作品・記事の表示、検索、テーマ、スマホ表示を検証します。

このチャットで更新する場合は `data/content.js` を優先編集し、必要のないHTML/CSS/JSの書き換えを避けてください。**作品12件以上、note7件以上、作品画像、ピックアップ2件、Recent5件・Twitter最大1件、Twitter投稿欄、天気の代替取得、効果音とON/OFF、ウェルカム、地震、スマホ幅**の回帰を確認すること。
