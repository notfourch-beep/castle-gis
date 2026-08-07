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

// 初期背景地図として表示
gsiStandard.addTo(map);

// 背景地図の一覧
const baseMaps = {
    "地理院標準地図": gsiStandard
};

// レイヤー切替コントロールを表示
L.control.layers(
    baseMaps,
    null,
    {
        collapsed: false,
        position: "topright"
    }
).addTo(map);

// 縮尺を表示
L.control.scale({
    imperial: false,
    metric: true
}).addTo(map);

// statusによってマーカーの色を決める
function getMarkerColor(status) {
    if (status === "城館") {
        return "red";
    } else if (status === "非城館") {
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
        const id = feature.properties["仮番号"];

       layer.bindPopup(
    `<strong>${name}</strong><br>${id}`
    );
    }

}).addTo(map);
fetch("./data/castle.geojson")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        return response.json();
    })
    .then(data => {
        castleLayer.addData(data);
        console.log("GeoJSONを正常に読み込みました", data);
    })
    .catch(error => {
        console.error("GeoJSONの読み込みに失敗しました", error);
    });