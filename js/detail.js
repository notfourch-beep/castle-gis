// URLから城郭番号を取得
const params = new URLSearchParams(window.location.search);
const castleId = params.get("id");

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
    <p><strong>城郭番号：</strong>${castle.id}</p>
    <p><strong>城郭名：</strong>${castle.name}</p>
    <p><strong>所在：</strong>${castle.location}</p>
    <p><strong>分類：</strong>${castle.status}</p>
    <p><strong>遺構：</strong>${castle.remains}</p>

    <h3>縄張り図などの掲載情報</h3>

    <p>
        <strong>『和歌山城郭研究』：</strong>
        ${castle.wakayama_jokaku_issue || "―"}
        ${castle.wakayama_jokaku_map_author || ""}
    </p>

    <p>
        <strong>『日本城郭大系』：</strong>
        ${castle.taikei || "―"}
    </p>

    <p>
        <strong>『近畿の城郭』：</strong>
        ${castle.kinki_volume || "―"}
        ${castle.kinki_map_author || ""}
    </p>

    <p>
        <strong>『定本 和歌山県の城』：</strong>
        ${castle.aohon || "―"}
    </p>

    <p>
        <strong>『和歌山県中世城館跡詳細分布調査報告書』：</strong>
        ${castle.akahon || "―"}
    </p>

    <p>
        <strong>『戦国和歌山の群雄と城館』：</strong>
        ${castle.gunyu || "―"}
    </p>

    <p>
        <strong>その他の図：</strong>
        ${castle.other_maps || "―"}
    </p>

    <h3>関連資料</h3>

    <p>
        <strong>関連論文：</strong>
        ${castle.related_papers || "―"}
    </p>

    <p>
        <strong>発掘報告書など：</strong>
        ${castle.excavation_reports || "―"}
    </p>

    <p>
        <strong>DOI：</strong>
        ${castle.doi || "―"}
    </p>

<p>
    <a href="./index.html?id=${encodeURIComponent(castle.id)}">
        地図で表示
    </a>
</p>

    `;
    
    })
    .catch(error => {
        console.error("castles.json の読み込みに失敗しました", error);
    });