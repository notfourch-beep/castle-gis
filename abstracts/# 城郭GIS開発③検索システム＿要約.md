# 城郭GIS開発③ 検索システム　引き継ぎ要約

## ① このチャットの目的

「城郭GIS開発② 地形図実装」で作成中のLeafletベースのGISと並行して、**城館データベースの検索システムを構築し、GISと双方向参照できるようにする**ことを目的とした。

基本構想は以下のとおり。

```text
Excel原本
   ↓
検索用JSON ＋ GIS用GeoJSON
   ↓
検索システム ⇄ 城館詳細 ⇄ GIS
```

検索システムとGISを別々のサービスにはせず、**一つの「城郭研究支援GIS」の中で連携させる**方針とした。

最終的に、

```text
検索
 ↓
検索結果
 ↓
城館詳細
 ↓↑
GIS
```

の基本動線を実装。

GIS側から詳細画面への逆方向リンクも実装したため、**GISと検索システムの双方向参照が実際に動作することを確認済み**。


---

## ② 実装・変更した内容

### A. Excel原本の整理

今後はExcelを唯一のマスターデータとし、

```text
Excel原本
   ├─ castles.json
   └─ castles.geojson
```

を生成する方式とした。

正式な原本を **「縄張図DB原本v1」** とした。

Excelは1行目を見出しとする単純な表構造に整理し、不要だったT・U列を削除。

現在は **A～Sの19列**。

主な変更：

- `STATUS` → `分類`
- H列 → `和歌山城郭研究　号（頁）`
- I列 → `和歌山城郭研究　図：作図者`
- K列 → `近畿の城郭　巻`
- L列 → `近畿の城郭　図：作図者`

分類は以下の3種類。

```text
城郭
類似地形
調査中
```

従来の「非城館」は、研究上の表現として不適切との判断から**「類似地形」へ変更**した。

原本点検時に発見した城郭番号重複と分類空欄は修正済み。

最終確認時のデータは **419件**。


### B. `castles.json` を生成

検索・詳細画面用データとして `castles.json` を作成。

Excelの419件をすべて収録する。

主要キー：

```text
id
name
longitude
latitude
status
remains
location
wakayama_jokaku_issue
wakayama_jokaku_map_author
taikei
kinki_volume
kinki_map_author
aohon
akahon
gunyu
other_maps
related_papers
excavation_reports
doi
```

重要なルール：

```text
Excel「分類」 → JSON「status」
```

画面上では `status` を **「分類」** と表示する。


### C. `castles.geojson` を生成

GIS用には軽量なGeoJSONを生成。

座標登録済みの **362件**を収録。

座標未登録57件は `castles.json` には残すが、GeoJSONには出力しない。

基本構造：

```json
{
  "type": "Feature",
  "properties": {
    "id": "WM0014",
    "城郭名": "愛宕山城",
    "status": "城郭"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [
      135.504239,
      34.115316
    ]
  }
}
```

経度・緯度は `properties` に重複保存せず、GeoJSON標準の `geometry.coordinates` にのみ格納。


### D. 既存GISを新GeoJSONへ移行

既存の `main.js` を新しいデータ構造へ対応させた。

分類色：

```text
城郭       → red
類似地形   → blue
調査中     → gold
その他     → gray
```

マーカーは従来どおり黒枠。

旧：

```javascript
feature.properties["仮番号"]
```

を、

```javascript
feature.properties.id
```

へ変更。

読み込み先も、

```text
./data/castle.geojson
```

から、

```text
./data/castles.geojson
```

へ変更。

凡例も、

```text
城館 → 城郭
非城館 → 類似地形
調査中 → 調査中
```

へ変更。

新しいGeoJSONで**362地点の正常表示を確認済み**。


### E. 検索画面 `search.html`

検索条件は最終的に以下の3種類とした。

```text
城郭名
所在
城郭番号
```

「分類」は検索条件から除外。

理由：
類似地形だけを検索する利用場面は少なく、「○○市町村にはどんな城があるか」などの検索の方が実用性が高いため。

複数条件を指定した場合は**AND検索**。

`所在` は `castles.json` の `location` を読み込み、JavaScriptで重複を除いてプルダウンを自動生成する。


### F. 検索結果 `results.html`

`search.html` からURLパラメータで検索条件を渡す。

例：

```text
results.html?location=串本町
```

`results.js` が `castles.json` を読み込み、条件に合致する城館を抽出。

串本町で試験し、**12件が正常に抽出・表示されることを確認済み**。

表示項目：

```text
城郭番号
城郭名
所在
分類
遺構
```

城郭名をクリックすると、

```text
detail.html?id=WMxxxx
```

へ移動する。


### G. 城館詳細 `detail.html`

URLの城郭番号から `castles.json` の該当レコードを取得する。

例：

```text
detail.html?id=WM0033
```

基本情報：

```text
城郭番号
城郭名
所在
分類
遺構
```

さらに文献情報として、

```text
和歌山城郭研究
日本城郭大系
近畿の城郭
定本 和歌山県の城
和歌山県中世城館跡詳細分布調査報告書
戦国和歌山の群雄と城館
その他の図
関連論文
発掘報告書など
DOI
```

を表示する。

空欄は現在 `―` と表示。


### H. 詳細画面 → GIS

詳細画面に、

```text
地図で表示
```

リンクを設置。

例：

```text
index.html?id=WM0033
```

`main.js` がURLの `id` を取得し、GeoJSONから対応するマーカーを検索。

該当地点へ、

```javascript
map.setView(latlng, 16);
targetLayer.openPopup();
```

で自動移動し、ポップアップを開く。

**WM0033 稲荷山城で正常動作確認済み。**


### I. GIS → 詳細画面

GISのマーカーポップアップを、

```text
稲荷山城
WM0033
詳細を見る
```

という構成に変更。

「詳細を見る」から、

```text
detail.html?id=WM0033
```

へ移動できる。

これにより、

```text
詳細画面 → GIS
GIS → 詳細画面
```

の**双方向参照が完成**。


---

## ③ 確定した仕様・方針

### データ管理

**Excelを唯一の原本とする。**

```text
縄張図DB原本v1.xlsx
       ↓
   変換処理
   ├─ castles.json
   └─ castles.geojson
```

JSON/GeoJSONを手作業で別々に編集しない。


### 共通ID

**城郭番号をシステム全体の共通IDとする。**

例：

```text
WM0033
```

これを検索、詳細画面、GISの相互参照に利用する。


### 「分類」の扱い

```text
Excel             → 分類
castles.json      → status
castles.geojson   → status
Web画面の表示     → 分類
```

内部データを `status` に統一することで混乱を防ぐ。


### GIS用GeoJSON

必要最小限とする。

```text
id
城郭名
status
geometry.coordinates
```

所在・遺構・文献情報等はGIS用GeoJSONには重複保存しない。


### 座標未登録データ

```text
castles.json      → 収録する
castles.geojson   → 収録しない
```

とする。


### 検索条件

当面、

```text
城郭名
所在
城郭番号
```

の3種類。

分類は検索条件にしない。

複数条件はAND検索。


---

## ④ 重要なファイル・設定

現在の主要構成：

```text
castle-gis/
├── index.html          # GIS地図
├── search.html         # 検索画面
├── results.html        # 検索結果
├── detail.html         # 城館詳細
│
├── data/
│   ├── castle.geojson      # 旧GeoJSON・当面バックアップ
│   ├── castles.geojson     # 新GIS用データ
│   └── castles.json        # 検索・詳細用データ
│
├── js/
│   ├── main.js
│   ├── search.js
│   ├── results.js
│   └── detail.js
│
├── css/
└── tiles/
```

### `main.js` の重要設定

地図初期位置：

```javascript
L.map("map").setView(
    [33.52, 135.72],
    11
);
```

地理院標準地図：

```text
https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png
```

設定：

```text
minZoom: 5
maxZoom: 18
```

CS立体図：

```text
./tiles/06TD_3x3_tiles/{z}/{x}/{y}.png
./tiles/06TD_3x3_B_tiles/{z}/{x}/{y}.png
```

両者を `csMapGroup` でまとめている。

GeoJSON：

```javascript
fetch("./data/castles.geojson")
```

分類色：

```text
城郭       赤
類似地形   青
調査中     黄
```

検索・詳細用：

```text
./data/castles.json
```


### Git

検索システムとGIS連携完成時にコミット済み。

コミットメッセージ：

```text
Add castle search and GIS-detail navigation
```


---

## ⑤ 未解決事項・積み残し

### UI全般

現在は機能優先で、検索・結果・詳細画面はほぼ素のHTML。

次のUI調整段階でデザインを統一する。


### 「所在」プルダウンの順序

現在JavaScriptの `sort()` による文字列順。

そのため、

```text
かつらぎ町
すさみ町
みなべ町
上富田町
串本町
...
```

などの順になる。

**将来、和歌山県の市町村コード順など、自然な順序へ変更する。**

この項目は忘れないこと。


### 文献情報の表示形式

現在は例えば、

```text
『和歌山城郭研究』：20 (67) ○：白石博則
```

のように値を単純連結している。

最終的には、

```text
号（頁）
図：作図者
```

など、意味が明確になるよう表示を整理する。


### 旧 `castle.geojson`

新しい `castles.geojson` で正常動作しているが、旧ファイルは安全のためまだ残している。

十分確認後、削除を検討する。


### Excel → JSON/GeoJSON変換

今回JSON/GeoJSON自体は生成したが、今後原本を更新するための**再利用可能な正式な変換手順・スクリプトの整備**は保守・更新段階で必要。


---

## ⑥ 次のチャットへの申し送り

このチャット「城郭GIS開発③ 検索システム」は、**検索システムの骨格およびGISとの双方向参照完成**をもって一旦終了。

次は、

# 城郭GIS開発⑤ UIの調整

として進める予定。

最初に**仕様書の画面①・②に相当する入口画面を実装する。**

現在の `index.html` は開発初期から使ってきたGIS画面であり、開発経過を分かりやすくするため**名称を変更しない方針**。

新たに、

```text
start.html
```

を画面①として追加する。

想定構成：

```text
start.html
    ↓
画面②
    ├─ データベース検索 → search.html
    └─ 地図から探す     → index.html
```

したがって、既に完成している、

```text
detail.html → index.html?id=WMxxxx
```

や、

```text
index.html → detail.html?id=WMxxxx
```

は変更せず利用できる。

⑤では主として、

```text
画面①・②の実装
検索画面のUI調整
検索結果画面のUI調整
詳細画面のUI調整
GIS画面のUI調整
所在プルダウンの並び順改善
文献情報表示の改善
```

を行う。

一方、**CS立体図の県域展開は②・④系統の作業として並行して継続**する。

検索システムの基本機能は既に動作しているため、⑤では原則として既存機能を壊さず、**現在のシステムの外側・表示面を整えて完成形へ近づける**ことを優先する。