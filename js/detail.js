// URLから城郭番号を取得
const params = new URLSearchParams(window.location.search);

const castleId = params.get("id");
const searchName = params.get("name") || "";
const searchLocation = params.get("location") || "";
const searchId = params.get("searchId") || "";

const resultParams = new URLSearchParams();

if (searchName !== "") {
    resultParams.set("name", searchName);
}

if (searchLocation !== "") {
    resultParams.set("location", searchLocation);
}

if (searchId !== "") {
    resultParams.set("id", searchId);
}

const backToResultsUrl =
    resultParams.toString() !== ""
        ? `./results.html?${resultParams.toString()}`
        : "./search.html";

const detail = document.getElementById("detail");

// castles.json を読み込む
fetch("./data/castles.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        return response.json();
    })
    .then(castles => {

        // 城郭番号が一致するデータを探す
        const castle = castles.find(
            castle => castle.id === castleId
        );

        // 該当データがない場合
        if (!castle) {
            detail.innerHTML =
                "<p>該当する城館データがありません。</p>";
            return;
        }

 // 城館情報を表示
detail.innerHTML = `

    <section class="basic-info">

        <div class="castle-heading">
            <span class="castle-id">${castle.id}</span>
            <span class="castle-name">${castle.name}</span>
        </div>

        <div class="basic-row">
            <span>
                <span class="data-label">所在</span>
                ${castle.location}
            </span>

            <span>
                <span class="data-label">分類</span>
                ${castle.status}
            </span>

            <span>
                <span class="data-label">遺構</span>
                ${castle.remains}
            </span>
        </div>

    </section>


    <section class="detail-section">

        <h2>縄張り図などの掲載情報</h2>

 <div class="detail-row">
    <div class="label">『和歌山城郭研究』</div>
    <div>
        <span class="data-label">号（頁）</span>
        ${castle.wakayama_jokaku_issue || "―"}

        &nbsp;&nbsp;

        <span class="data-label">図：作図者</span>
        ${castle.wakayama_jokaku_map_author || "―"}
    </div>
</div>

        <div class="detail-row">
            <div class="label">『日本城郭大系 10』</div>
            <div>${castle.taikei || "―"}</div>
        </div>

        <div class="detail-row">
            <div class="label">『近畿の城郭』</div>
            <div>
        ${castle.kinki_volume || "―"} 巻

        &nbsp;&nbsp;

        <span class="data-label">図：作図者</span>
        ${castle.kinki_map_author || "―"}
             </div>
        </div>

<div class="detail-row">
    <div class="label">『定本 和歌山県の城』</div>
    <div>
        <span class="data-label">図：作図者</span>
        ${castle.aohon || "―"}
    </div>
</div>

        <div class="detail-row">
            <div class="label">
                『和歌山県中世城館跡詳細分布調査報告書』
            </div>
            <div>${castle.akahon || "―"}</div>
        </div>

 <div class="detail-row">
    <div class="label">『戦国和歌山の群雄と城館』</div>
    <div>
        <span class="data-label">図：作図者</span>
        ${castle.gunyu || "―"}
    </div>
</div>

        <div class="detail-row">
            <div class="label">その他の図</div>
            <div>${castle.other_maps || "―"}</div>
        </div>

    </section>


    <section class="detail-section">

        <h2>関連資料</h2>

        <div class="detail-row">
            <div class="label">関連論文</div>
            <div>${castle.related_papers || "―"}</div>
        </div>

        <div class="detail-row">
            <div class="label">発掘報告書など</div>
            <div>${castle.excavation_reports || "―"}</div>
        </div>

        <div class="detail-row">
            <div class="label">奈文研DOI</div>
            <div>${castle.doi || "―"}</div>
        </div>

    </section>


 <div class="map-link-area">
    <a
        class="map-link"
        href="./index.html?id=${encodeURIComponent(castle.id)}">
        地図で表示
    </a>
</div>

<div class="detail-navigation">
    <a
        class="back-result-link"
        href="${backToResultsUrl}">
        検索結果にもどる
    </a>
</div>

<section class="detail-note">
    <h3>註</h3>

    <p>
        「遺構」について「地割」は遺構は無いが地籍図などで推定できるものを指す。
        「縄張り図」については、〇は縄張図、「実測」は実測図または測量図、
        「現状」は現状図や地籍図、「復元」は復元図または推定図、
        「鳥瞰」は鳥瞰図を示す（あくまで本会の見解による）。
        また△は記述のみを意味する。
    </p>

    <p>
        『日本城郭大系10 』は新人物往来社（1980）、
        『定本 和歌山県の城』は郷土出版社（1995）、
        『和歌山県中世城館跡詳細分布調査報告書』は和歌山県教委（1998）、
        『戦国和歌山の群雄と城館』は戎光祥出版（2019）、
        『近畿の城郭Ⅰ〜Ⅴ』は戎光祥出版（2014〜18)の書籍。
        『和歌山城郭研究』は本会発行の研究誌。
    </p>

    <p>
        『その他』・『関連論文』の項目で署名が無いものは
        『和歌山城郭研究』の掲載。
    </p>

<p>
    奈文研doiは、奈良文化財研究所の全国文化財総覧のdoiです。
    この数字を https://sitereports.nabunken.go.jp/ の後に付けるなどしてご利用ください。
</p>

</section>
`;
    })
    .catch(error => {
        console.error("castles.json の読み込みに失敗しました", error);
    });