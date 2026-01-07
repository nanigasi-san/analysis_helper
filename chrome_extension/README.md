# Analysis Helper Chrome Extension

LapCenterの記録ページ (`runner.jsp`) からレース情報を読み取り、Markdownテンプレートを自動生成します。

## 使い方
1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をオン
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `chrome_extension/` を選択
5. LapCenterの記録ページを開き、拡張アイコンから「分析」を押す

## 出力内容
- レースURL
- 氏名 / 記録 / 巡航速度 / ミス率
- レッグごとの `miss`, 区間順位, 総合順位
- 分析テンプレート (Plan / Do / Analysis)

## 注意
- Wordを直接起動する機能はありません。必要ならMarkdownをHTMLに変換してWordで開いてください。
- 対象ページ: `https://mulka2.com/lapcenter/lapcombat2/runner.jsp`
