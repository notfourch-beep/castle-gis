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
    "CS立体図（試験）": csMapGroup,
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
        <a href="index.html#select">検索の選択にもどる</a>
    `;

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