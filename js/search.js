fetch("./data/castles.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        return response.json();
    })
    .then(castles => {

        const locationSelect = document.getElementById("location");

        // 所在を重複なしで取得
        const locations = [
            ...new Set(
                castles
                    .map(castle => castle.location)
                    .filter(location => location !== "")
            )
        ];

        // 和歌山県の市町村コード順
const municipalityOrder = [
    "和歌山市",
    "海南市",
    "橋本市",
    "有田市",
    "御坊市",
    "田辺市",
    "新宮市",
    "紀の川市",
    "岩出市",
    "紀美野町",
    "かつらぎ町",
    "九度山町",
    "高野町",
    "湯浅町",
    "広川町",
    "有田川町",
    "美浜町",
    "日高町",
    "由良町",
    "印南町",
    "みなべ町",
    "日高川町",
    "白浜町",
    "上富田町",
    "すさみ町",
    "那智勝浦町",
    "太地町",
    "古座川町",
    "北山村",
    "串本町"
];

locations.sort((a, b) => {
    return municipalityOrder.indexOf(a) - municipalityOrder.indexOf(b);
});

        // プルダウンへ追加
        locations.forEach(location => {

            const option = document.createElement("option");

            option.value = location;
            option.textContent = location;

            locationSelect.appendChild(option);
        });

        console.log("所在一覧を作成しました", locations);
    })
    .catch(error => {
        console.error("castles.json の読み込みに失敗しました", error);
    });

 // 検索フォームが送信されたとき
const searchForm = document.getElementById("search-form");

searchForm.addEventListener("submit", function (event) {

    // 通常のフォーム送信を止める
    event.preventDefault();

    // 入力された検索条件を取得
    const name = document.getElementById("name").value.trim();
    const location = document.getElementById("location").value;
    const castleId = document.getElementById("castle-id").value.trim();

    // 検索条件をURLに付ける
    const params = new URLSearchParams();

    if (name !== "") {
        params.set("name", name);
    }

    if (location !== "") {
        params.set("location", location);
    }

    if (castleId !== "") {
        params.set("id", castleId);
    }

    // 検索結果画面へ移動
    window.location.href = `./results.html?${params.toString()}`;
});   