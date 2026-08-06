        // 地図を作成
        // 初期位置：古座川町・串本町付近
        const map = L.map("map").setView(
            [33.52, 135.72],
            11
        );

        // 地理院標準地図を表示
        const gsiStandard = L.tileLayer(
            "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
            {
                attribution:
                    '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
                minZoom: 5,
                maxZoom: 18
            }
        );

        gsiStandard.addTo(map);

        // 縮尺を表示
        L.control.scale({
            imperial: false,
            metric: true
        }).addTo(map);