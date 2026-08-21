// 地図を作成
const map = L.map("map").setView(
    [33.52, 135.72],
    11
);

// 地理院標準地図
const gsiStandard = L.tileLayer(
    "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    {
        attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        minZoom: 5,
        maxZoom: 18
    }
);



// 背景地図の一覧
const baseMaps = {
    "地理院標準地図": gsiStandard
};

// CS立体図（06TD 3x3 結合版）
const csMap06TD3x3 = L.tileLayer(
    "./tiles/06TD_3x3_tiles/{z}/{x}/{y}.png",
    {
        minZoom: 12,
        maxZoom: 18,
        maxNativeZoom: 18,
        opacity: 1.0
    }
);

// CS立体図（06TD 3x3 B）
const csMap06TD3x3B = L.tileLayer(
    "./tiles/06TD_3x3_B_tiles/{z}/{x}/{y}.png",
    {
        minZoom: 12,
        maxZoom: 18,
        maxNativeZoom: 18,
        opacity: 1.0
    }
);

// CS立体図をグループ化
const csMapGroup = L.layerGroup([
    csMap06TD3x3,
    csMap06TD3x3B
]);

// shi-works 和歌山県CS立体図
const shiworksCsMap = L.tileLayer(
    "https://xs489works.xsrv.jp/raster-tiles/pref-wakayama/wakayamapc-cs-tiles/{z}/{x}/{y}.png",
    {
        minZoom: 4,
        maxZoom: 18,
        maxNativeZoom: 17,
        opacity: 1.0
    }
);

// 初期背景地図
gsiStandard.addTo(map);

// CS立体図
csMapGroup.addTo(map);

// 縮尺を表示
L.control.scale({
    imperial: false,
    metric: true
}).addTo(map);

// statusによってマーカーの色を決める
function getMarkerColor(status) {
    if (status === "城郭") {
        return "red";
    } else if (status === "類似地形") {
        return "blue";
    } else if (status === "調査中") {
        return "gold";
    } else {
        return "gray";
    }
}

// GeoJSONレイヤー
const castleLayer = L.geoJSON(null, {

    pointToLayer: function (feature, latlng) {

        const color = getMarkerColor(feature.properties.status);

        return L.circleMarker(latlng, {
            radius: 8,
            color: "black",
            fillColor: color,
            fillOpacity: 0.8,
            weight: 2
        });
    },

    // マーカーをクリックしたときのポップアップ
    onEachFeature: function (feature, layer) {

 const name = feature.properties["城郭名"];
 const id = feature.properties.id;

    layer.bindPopup(
    `<strong>${name}</strong><br>
    ${id}<br>
    <a href="./detail.html?id=${encodeURIComponent(id)}">
        詳細を見る
    </a>`
);
    }

}).addTo(map);

// 重ね合わせレイヤーの一覧
const overlayMaps = {
    "自作CS立体図": csMapGroup,
    "shi-works 和歌山県CS立体図": shiworksCsMap,
    "城館等": castleLayer
};

// レイヤー切替コントロールを表示
L.control.layers(
    baseMaps,
    overlayMaps,
    {
        collapsed: false,
        position: "topright"
    }
).addTo(map);


// GeoJSONを読み込む
fetch("./data/castles.geojson")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        return response.json();
    })
    .then(data => {
    castleLayer.addData(data);
    console.log("GeoJSONを正常に読み込みました", data);

    // URLから城郭番号を取得
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("id");

    // 城郭番号が指定されている場合
    if (targetId) {

        let targetLayer = null;

        castleLayer.eachLayer(layer => {

            if (
                layer.feature &&
                layer.feature.properties.id === targetId
            ) {
                targetLayer = layer;
            }
        });

        // 該当する城郭が見つかった場合
        if (targetLayer) {

            const latlng = targetLayer.getLatLng();

            map.setView(latlng, 16);

            targetLayer.openPopup();
        }
    }
})
    .catch(error => {
        console.error("GeoJSONの読み込みに失敗しました", error);
    });

// 凡例を作成
const legend = L.control({
    position: "bottomright"
});

legend.onAdd = function () {

    const div = L.DomUtil.create("div", "legend");

    div.innerHTML = `
        <strong>凡例</strong><br>
        <span class="legend-marker castle"></span> 城郭<br>
        <span class="legend-marker noncastle"></span> 類似地形<br>
        <span class="legend-marker investigating"></span> 調査中

        <hr>

        <div class="map-information">
            地図上に表示のない場所で城館らしい地形を発見された場合は、
            未発見の城館である可能性があります。
            経緯度を添えて
            <a href="mailto:wajokenjimukyoku@gmail.com?subject=城館候補地の情報提供">
                ご一報ください
            </a>。
        </div>

        <hr>

        <a href="index.html#select">検索の選択にもどる</a>
    `;

    // 凡例上のクリック操作が地図に伝わらないようにする
    L.DomEvent.disableClickPropagation(div);

    return div;
};

legend.addTo(map);

// 地図をクリックした場所の座標を表示
map.on("click", function (e) {

    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

const popupContent = `
    <strong>座標</strong><br>
    経度：${lng}<br>
    緯度：${lat}<br><br>
    <button onclick="copyCoordinates('${lat}', '${lng}')">
        座標をコピー
    </button>
`;

    L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);
});

// 座標をクリップボードへコピー
function copyCoordinates(lat, lng) {

    const text = `${lng}\t${lat}`;

    navigator.clipboard.writeText(text)
        .then(() => {
            alert("座標をコピーしました");
        })
        .catch(error => {
            console.error("座標のコピーに失敗しました", error);
        });
}

// 指定した座標へ移動するコントロール
const coordinateJump = L.control({
    position: "topleft"
});

coordinateJump.onAdd = function () {

    const div = L.DomUtil.create("div", "coordinate-jump");

    div.innerHTML = `
        <button
            type="button"
            class="coordinate-jump-toggle"
            id="coordinate-jump-toggle">
            経緯度を入力
        </button>

        <div class="coordinate-jump-panel">

            <div class="coordinate-jump-title">
                座標へ移動
            </div>

            <input
                type="text"
                id="coordinate-input"
                placeholder="33.512345, 135.765432"
            >

            <button
                type="button"
                class="coordinate-jump-button"
                id="coordinate-jump-button">
                移動
            </button>

            <div class="coordinate-jump-guide">
                緯度, 経度 または 経度, 緯度
            </div>

        </div>
    `;

    // コントロール上の操作を地図へ伝えない
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    return div;
};

coordinateJump.addTo(map);


const coordinateJumpBox =
    document.querySelector(".coordinate-jump");

const coordinateJumpToggle =
    document.getElementById("coordinate-jump-toggle");

const coordinateInput =
    document.getElementById("coordinate-input");

const coordinateJumpButton =
    document.getElementById("coordinate-jump-button");


// 「座標」ボタンで開閉
coordinateJumpToggle.addEventListener("click", function () {

    coordinateJumpBox.classList.toggle("open");

    if (coordinateJumpBox.classList.contains("open")) {
        coordinateInput.focus();
    }
});


// 「移動」ボタン
coordinateJumpButton.addEventListener(
    "click",
    jumpToCoordinate
);


// Enterキーでも移動
coordinateInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            jumpToCoordinate();
        }
    }
);


// 地図をクリックしたら座標入力欄を閉じる
map.on("click", function () {
    coordinateJumpBox.classList.remove("open");
});


function jumpToCoordinate() {

    const input =
        coordinateInput.value.trim();

    if (input === "") {
        alert("座標を入力してください。");
        return;
    }

    // カンマ、空白、タブなどを区切りとして扱う
    const values = input
        .split(/[\s,]+/)
        .filter(value => value !== "")
        .map(Number);

    if (
        values.length !== 2 ||
        values.some(value => Number.isNaN(value))
    ) {
        alert(
            "座標を正しく入力してください。\n" +
            "例：33.512345, 135.765432"
        );
        return;
    }

    const first = values[0];
    const second = values[1];

    let lat;
    let lng;

    // 緯度・経度
    if (
        first >= -90 &&
        first <= 90 &&
        second >= -180 &&
        second <= 180
    ) {
        lat = first;
        lng = second;
    }

    // 経度・緯度
    if (
        Math.abs(first) > 90 &&
        Math.abs(first) <= 180 &&
        Math.abs(second) <= 90
    ) {
        lng = first;
        lat = second;
    }

    if (
        lat === undefined ||
        lng === undefined
    ) {
        alert("緯度・経度として認識できませんでした。");
        return;
    }

    map.setView(
        [lat, lng],
        17
    );

    L.popup()
        .setLatLng([lat, lng])
        .setContent(
            `<strong>指定座標</strong><br>
            緯度：${lat.toFixed(6)}<br>
            経度：${lng.toFixed(6)}`
        )
        .openOn(map);

    // 移動後は入力欄を閉じる
    coordinateJumpBox.classList.remove("open");
}