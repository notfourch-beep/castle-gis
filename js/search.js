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

        // 五十音順ではなく、まずは文字列順で並べる
        locations.sort();

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