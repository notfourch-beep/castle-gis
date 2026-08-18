// URLから検索条件を取得
const params = new URLSearchParams(window.location.search);

const searchName = params.get("name") || "";
const searchLocation = params.get("location") || "";
const searchId = params.get("id") || "";

// castles.json を読み込む
fetch("./data/castles.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        return response.json();
    })
    .then(castles => {

        // AND検索
        const results = castles.filter(castle => {

            const nameMatch =
                searchName === "" ||
                castle.name.includes(searchName);

            const locationMatch =
                searchLocation === "" ||
                castle.location === searchLocation;

            const idMatch =
                searchId === "" ||
                castle.id.toLowerCase() === searchId.toLowerCase();

            return nameMatch && locationMatch && idMatch;
        });

        const summary = document.getElementById("result-summary");
        const resultList = document.getElementById("result-list");

        // 件数表示
        summary.textContent = `${results.length}件見つかりました。`;

        // 0件の場合
        if (results.length === 0) {
            resultList.innerHTML =
                "<p>条件に一致するものはありませんでした。</p>";
            return;
        }

// 検索結果を表示
results.forEach(castle => {

    const item = document.createElement("div");
    item.className = "result-item";

    // 詳細画面へ検索条件も引き継ぐ
    const detailParams = new URLSearchParams();

    detailParams.set("id", castle.id);

    if (searchName !== "") {
        detailParams.set("name", searchName);
    }

    if (searchLocation !== "") {
        detailParams.set("location", searchLocation);
    }

    if (searchId !== "") {
        detailParams.set("searchId", searchId);
    }


    item.innerHTML = `
        <span class="result-id">${castle.id}</span>

    <a
    class="result-name"
    href="./detail.html?${detailParams.toString()}">
    ${castle.name}
    </a>

        <span class="result-location">
            （${castle.location}）
        </span>

        <span class="result-label">分類</span>
        <span class="result-value">${castle.status}</span>

        <span class="result-label">遺構</span>
        <span class="result-value">${castle.remains}</span>
    `;

    resultList.appendChild(item);

});

})
.catch(error => {
    console.error("castles.json の読み込みに失敗しました", error);
});