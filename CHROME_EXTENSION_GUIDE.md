# Chrome拡張版への移行手順

目的: `analysis_helper.py` の機能（LapCenterの記録ページから各レッグ情報を取得し、Markdownテンプレートを生成）を、Chrome拡張（Manifest V3）として動作させる。

## 1. 仕様の整理
- 入力: LapCenterの記録ページURL（例: `runner.jsp?...`）
- 取得: `.btn-leg-name`, `.split-cell-loss`, `.split-cell-laprank`, `.split-cell-elapsedrank`
- 出力: Markdownテンプレート（必要ならHTMLも）
- 操作: 拡張のポップアップから「生成」ボタンでダウンロード
- 制限: Chrome拡張はWordを直接起動できないので、HTMLをダウンロードして手動でWordで開く

## 2. 構成決め
シンプルな構成（ビルド不要）で進める。

```
analysis_helper/
  chrome_extension/
    manifest.json
    popup.html
    popup.js
    popup.css
    content.js
    icons/
      icon_16.png
      icon_48.png
      icon_128.png
```

## 3. manifest.json の作成
最低限必要な権限と対象ドメインを指定する。

例:
```json
{
  "manifest_version": 3,
  "name": "Analysis Helper",
  "version": "0.1.0",
  "description": "LapCenterの記録ページからアナリシス用テンプレートを生成",
  "action": { "default_popup": "popup.html" },
  "permissions": ["activeTab", "scripting", "downloads"],
  "host_permissions": ["https://mulka2.com/lapcenter/*"],
  "icons": {
    "16": "icons/icon_16.png",
    "48": "icons/icon_48.png",
    "128": "icons/icon_128.png"
  }
}
```

## 4. ポップアップUIを作る
`popup.html` に「URL表示」「生成ボタン」「ダウンロード形式の選択（md / html）」を用意。

実装方針:
- 現在開いているタブURLを自動表示
- 「生成」クリックで `content.js` にスクレイプを依頼

## 5. content.js でDOM取得
LapCenterの記録ページ上でDOMから必要な情報を取得。

取得例（疑似コード）:
```js
const legNames = [...document.querySelectorAll(".btn-leg-name")].map(e => e.textContent);
const losses = [...document.querySelectorAll(".split-cell-loss")].map(e => e.textContent);
const lapRanks = [...document.querySelectorAll(".split-cell-laprank")].map(e => e.textContent);
const totalRanks = [...document.querySelectorAll(".split-cell-elapsedrank")].map(e => e.textContent);
```

**ポイント**
- `analysis_helper.py` と同じCSSクラスを使う
- 取得数の不一致があればエラーにする

## 6. Markdown/HTMLの生成
Python側のテンプレートをJSに移植する。

Markdown生成例（疑似コード）:
```js
let md = `> **レース URL**：[${url}](${url})\n\n`;
md += "# レース名 - コース\n";
md += "## レース結果\n";
md += "+ 総合タイム:\n+ 順位:\n+ 巡航速度:\n+ ミス率:\n";
md += "---\n";
md += "## 出走前\n";
for (let i = 0; i < legNames.length; i++) {
  md += `## ${legNames[i]} (miss: ${losses[i]}, 区間${lapRanks[i]}位) - 総合${totalRanks[i]}位\n`;
  md += "#### [Plan]\n#### [Do]\n#### [Analysis]\n";
}
md += "## 課題と対策\n";
md += "## 総括\n";
```

HTML出力も必要なら、MarkdownをHTMLに変換してCSSを埋め込む。
- 変換ライブラリを入れない場合は、MarkdownのままHTMLに貼る簡易版でも可
- Word用なら最低限のHTMLでも十分

## 7. ファイルダウンロード
`chrome.downloads.download` でローカルに保存。

例:
```js
const blob = new Blob([md], { type: "text/markdown" });
const url = URL.createObjectURL(blob);
chrome.downloads.download({
  url,
  filename: "analysis.md",
  saveAs: true
});
```

## 8. Chromeで動作確認
1. Chrome → `chrome://extensions/`
2. 「デベロッパーモード」ON
3. 「パッケージ化されていない拡張機能を読み込む」
4. `chrome_extension/` を選択
5. LapCenterの記録ページを開き、拡張ボタンから生成

## 9. 配布用にパッケージ化
ストア配布しない場合は `chrome_extension/` をZIP化して配布でOK。

## 10. 追加改善（任意）
- レース名やコース名をページから自動抽出
- 生成したファイル名をページ情報から自動生成
- 出力フォーマット（Word用HTML / Markdown）の切替
- エラー時のUI表示

---

この手順で、Selenium依存を排除し、ブラウザ内で完結するChrome拡張として再実装できます。
