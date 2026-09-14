let leafletPromise;
let mountedMap;
let mountToken = 0;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet-style]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.dataset.leafletStyle = "true";
      link.onerror = () => {
        const fallback = document.createElement("link");
        fallback.rel = "stylesheet";
        fallback.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
        fallback.dataset.leafletStyleFallback = "true";
        document.head.appendChild(fallback);
      };
      document.head.appendChild(link);
    }
    const scriptSources = [
      "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
      "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"
    ];
    const loadScript = (index) => {
      const script = document.createElement("script");
      script.src = scriptSources[index];
      script.async = true;
      script.onload = () => resolve(window.L);
      script.onerror = () => {
        if (index + 1 < scriptSources.length) loadScript(index + 1);
        else { leafletPromise = null; reject(new Error("地图组件加载失败")); }
      };
      document.head.appendChild(script);
    };
    loadScript(0);
  });
  return leafletPromise;
}

export function destroyRouteMap() {
  mountToken += 1;
  if (mountedMap) {
    mountedMap.remove();
    mountedMap = null;
  }
}

export function mountRouteMap(day) {
  const mapElement = document.querySelector("#routeMap");
  if (!mapElement) {
    destroyRouteMap();
    return;
  }

  destroyRouteMap();
  const token = mountToken;
  const points = (day?.mapPoints || []).filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon));
  const status = document.querySelector("[data-route-map-status]");
  if (!points.length) {
    mapElement.innerHTML = '<div class="route-map-fallback"><strong>今天还没有地图点位</strong><span>下面的顺序和导航按钮仍然可用。</span></div>';
    if (status) status.textContent = "地图点位待补充；实时导航仍可直接打开。";
    return;
  }

  mapElement.innerHTML = '<div class="route-map-loading"><span class="map-pulse"></span><span>正在加载路线地图</span></div>';
  loadLeaflet().then((L) => {
    if (token !== mountToken || !document.body.contains(mapElement)) return;
    mapElement.textContent = "";
    const map = L.map(mapElement, { zoomControl: false, scrollWheelZoom: false, attributionControl: true });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
    }).addTo(map);

    const latLngs = points.map((point) => [point.lat, point.lon]);
    const line = L.polyline(latLngs, { color: "#28564a", weight: 4, opacity: .9, dashArray: "7 8", lineCap: "round" }).addTo(map);
    points.forEach((point, index) => {
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: index === 0 || index === points.length - 1 ? 8 : 7,
        color: "#fffdf8",
        weight: 3,
        fillColor: index === 0 ? "#d6a84d" : "#28564a",
        fillOpacity: 1
      }).addTo(map);
      marker.bindTooltip(`${index + 1}. ${point.label}`, { direction: "top", offset: [0, -6] });
      marker.bindPopup(`<strong>${point.label}</strong><br><span>${point.detail || "路线节点"}</span>${point.approximate ? "<br><small>概览定位，导航请以实时地图为准</small>" : ""}`);
    });
    map.fitBounds(line.getBounds(), { padding: [24, 24], maxZoom: points.length > 2 ? 10 : 13 });
    mountedMap = map;
    if (status) status.textContent = "地点连线用于路线总览；实际道路、耗时和入口以高德实时导航为准。";
    window.setTimeout(() => map.invalidateSize(), 80);
  }).catch(() => {
    if (token !== mountToken || !document.body.contains(mapElement)) return;
    mapElement.innerHTML = '<div class="route-map-fallback"><strong>地图暂时加载不了</strong><span>网络恢复后刷新；下面的路线节点和高德导航不受影响。</span></div>';
    if (status) status.textContent = "地图服务暂不可用，仍可使用下方路线节点和导航。";
  });
}
