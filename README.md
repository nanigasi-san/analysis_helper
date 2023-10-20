# how to analysis_helper

## analysis_helperとは

オリエンテーリングのアナリシス(レース反省用の自己分析)を書くハードルを下げるために作成されたソフトウェアです。各レッグの

+ Plan
+ Do
+ Analysis

を書くことに集中するために、以下の情報をLapCenterから自動で取得し、アナリシスのテンプレートを生成してくれます。

+ アナリシス全体の流れ
  + レース情報
  + 各レッグ
  + 全体的な課題
  + など
+ 各レッグの情報
  + ミスタイム
  + レッグ順位
  + そのレッグ時点での全体順位

また、アナリシスはmarkdown形式のファイルで生成されますが、編集環境が無い方のために、Wordでの編集機能も提供しています。

(Wordも無い方は、頑張ってmarkdownを編集してください。おすすめはVSCode(無料)かTypora(有料)です)

---



## 使い方

### step0: analysis_helperのダウンロード

以下のリンクからファイルをダウンロードしてください。デスクトップなどに置いておくと使いやすいと思います。(アナリシスを保存する場所は毎回選べるので、このファイル自体はどこに置いても大丈夫です)

https://drive.google.com/file/d/171Og3sJxyBWFLzn6R6AeaHbByDi8CHMY/view?usp=share_link

### step1: リンクの取得

1. LapCenterを開き、アナリシスを書きたいレースを開く。

![image-20231020125000659](C:\Users\kaito\AppData\Roaming\Typora\typora-user-images\image-20231020125000659.png)

2. 自分の出たコースの「記録一覧」を開き、自分の名前をクリックする。

![image-20231020125155814](C:\Users\kaito\AppData\Roaming\Typora\typora-user-images\image-20231020125155814.png)

3. このような画面が出てくるので、このページのURLをコピーする。「Ctrl+L」でURLを選択できるので、そこで「Ctrl+C」でコピーできます。このページの場合はhttps://mulka2.com/lapcenter/lapcombat2/runner.jsp?event=7985&file=1&runner=442がURLです。

![image-20231020125350645](C:\Users\kaito\AppData\Roaming\Typora\typora-user-images\image-20231020125350645.png)

### step2: アナリシスのひな型を生成する

1. 分かりやすいところ(デスクトップがおすすめです)に保存しておいた`analysis_helper.exe`を実行します。以下のようなウインドウが出てきます。先ほどのURLをボックスに張り付けましょう。「レースログを生成」を押すと作業が始まります。

![image-20231020125922662](C:\Users\kaito\AppData\Roaming\Typora\typora-user-images\image-20231020125922662.png)

2. ファイルの保存場所や名前を決めるウインドウが出てくるので、アナリシス置き場を用意しておくとよいです。ファイル名はレース名を入れておくと探しやすいと思います。「保存」を押すと自動で生成が始まります。

![image-20231020130134968](C:\Users\kaito\AppData\Roaming\Typora\typora-user-images\image-20231020130134968.png)

3. 生成が終了すると以下のダイアログが表示されます。たいていの人はmarkdownファイルを編集する機会がないと思うので、step3を参考に、Wordで編集をすることをお勧めします。

![image-20231020130256253](C:\Users\kaito\AppData\Roaming\Typora\typora-user-images\image-20231020130256253.png)

### step3: Wordで開く

「Wordで編集する」を押して、先ほど生成した「インカレロング\_アナリシス.md」を選ぶと、Wordで編集できる形式に変換され、Wordで開かれます。

ここでの注意として、ファイルの拡張子は`.docx`ではなく`.html`になっていることに注意してください。(実用上は気にする必要はありませんが、`docx`で探すと見つかりません。)

必要に応じて、Wordの機能を用いて`.docx`や`.pdf`にエクスポート(変換)してください。



作成者：山田海音(千葉大学2021)