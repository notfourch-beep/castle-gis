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