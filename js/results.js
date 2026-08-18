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

            item.innerHTML = `
    <p>
        <strong>${castle.id}</strong>
        <a href="./detail.html?id=${encodeURIComponent(castle.id)}">
            ${castle.name}
        </a>
        ／ ${castle.location}
        ／ 分類：${castle.status}
        ／ 遺構：${castle.remains}
    </p>
`;

            resultList.appendChild(item);
        });
    })
    .catch(error => {
        console.error("castles.json の読み込みに失敗しました", error);
    });