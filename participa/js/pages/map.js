/* MÓDULO B: Mapa interactivo (Leaflet + OpenStreetMap + Leaflet.heat) */
(function () {
  L.Icon.Default.imagePath = 'vendor/leaflet/images/';

  window.MapUtil = {
    tiles: function () {
      return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18, attribution: '&copy; Colaboradores de <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      });
    },
    pin: function (color) {
      return L.divIcon({ className: '', html: '<div class="pin" style="background:' + color + '"><i></i></div>', iconSize: [26, 26], iconAnchor: [4, 26], popupAnchor: [9, -26] });
    },
    cabeceras: function (map) {
      DATA.CANTONS.forEach(function (c) {
        L.circleMarker(c.ref, { radius: 7, color: '#0a1f3a', weight: 2, fillColor: '#fff', fillOpacity: 1 })
          .bindTooltip('Cabecera de ' + c.name + ' (ubicación referencial aprox.)', { direction: 'top' }).addTo(map);
      });
    },
  };

  Pages.mapa = function (root) {
    root.innerHTML = UI.pageHead('Mapa interactivo de Santa Elena', 'Explora las necesidades ciudadanas por categoría y cantón con marcadores y mapa de calor.') +
      '<div class="container page-body"><div class="notice" style="margin-bottom:16px">' + icon('info', 18) +
      '<span><strong>Datos DEMO.</strong> Los puntos son ficticios y se ubican de forma aproximada alrededor de las cabeceras cantonales. Aún no se muestran límites de parroquias, comunas ni sectores porque falta cartografía oficial verificada.</span></div>' +
      '<div class="map-layout"><aside class="card" aria-label="Filtros del mapa">' +
      '<div class="field"><label for="m-canton">Cantón</label><select class="input" id="m-canton">' + UI.options(DATA.CANTONS, '', true, 'Todos') + '</select></div>' +
      '<p class="label" style="margin:16px 0 6px;font-size:14px;font-weight:700;color:var(--navy-800)">Categorías</p>' +
      '<div id="m-cats">' + DATA.CATEGORIES.map(function (c) {
        return '<label class="legend-item"><input type="checkbox" value="' + c.id + '" checked style="accent-color:' + c.color + '"><span class="dot" style="background:' + c.color + '"></span>' + UI.esc(c.name) + '</label>';
      }).join('') + '</div>' +
      '<div class="row" style="margin-top:8px"><button class="btn btn-outline btn-sm" id="m-all" type="button">Todas</button><button class="btn btn-outline btn-sm" id="m-none" type="button">Ninguna</button></div>' +
      '<p class="label" style="margin:16px 0 6px;font-size:14px;font-weight:700;color:var(--navy-800)">Capas</p>' +
      '<label class="legend-item"><input type="checkbox" id="m-markers" checked> Marcadores</label>' +
      '<label class="legend-item"><input type="checkbox" id="m-heat" checked> Mapa de calor</label>' +
      '<p class="label" style="margin:16px 0 6px;font-size:14px;font-weight:700;color:var(--navy-800)">Estadísticas por territorio</p><div id="m-stats"></div></aside>' +
      '<div class="map-box" id="map" role="application" aria-label="Mapa de reportes ciudadanos"></div></div></div>';

    var map = L.map('map').setView(CONFIG.mapCenter, CONFIG.mapZoom);
    MapUtil.tiles().addTo(map);
    MapUtil.cabeceras(map);
    var markers = L.layerGroup().addTo(map), heat = null;
    UI.onCleanup(function () { map.remove(); });

    function filtered() {
      var canton = UI.$('#m-canton').value;
      var cats = UI.$$('#m-cats input:checked').map(function (i) { return i.value; });
      return Store.allReports().filter(function (r) { return (!canton || r.canton === canton) && cats.indexOf(r.category) >= 0; });
    }

    function draw() {
      var rs = filtered();
      markers.clearLayers();
      if (heat) { map.removeLayer(heat); heat = null; }
      if (UI.$('#m-markers').checked) {
        rs.forEach(function (r) {
          var c = DATA.category(r.category);
          L.marker([r.lat, r.lng], { icon: MapUtil.pin(c.color), title: c.name }).bindPopup(
            '<strong>' + UI.esc(c.name) + '</strong><br>' + UI.esc(r.description) + '<br>' +
            '<small>' + UI.esc(DATA.cantonName(r.canton)) + ' · ' + UI.date(r.date) + '</small><br>' +
            '<span class="status status-' + r.status + '" style="margin-top:6px">' + DATA.STATUSES[r.status] + '</span> ' + (r.demo ? UI.badge('demo') : '')
          ).addTo(markers);
        });
      }
      if (UI.$('#m-heat').checked && rs.length) {
        heat = L.heatLayer(rs.map(function (r) { return [r.lat, r.lng, 0.7]; }), { radius: 28, blur: 22, maxZoom: 14 }).addTo(map);
      }
      var total = rs.length;
      UI.$('#m-stats').innerHTML = DATA.CANTONS.map(function (c) {
        var n = rs.filter(function (r) { return r.canton === c.id; }).length;
        return '<div class="canton-stat"><span>' + UI.esc(c.name) + '</span><strong>' + n + ' <span class="muted small">(' + UI.pct(n, total) + '%)</span></strong></div>';
      }).join('') + '<div class="canton-stat"><span>Total visible</span><strong>' + total + '</strong></div>';
    }

    UI.$$('#m-canton, #m-cats input, #m-markers, #m-heat').forEach(function (el) { el.addEventListener('change', draw); });
    UI.$('#m-all').addEventListener('click', function () { UI.$$('#m-cats input').forEach(function (i) { i.checked = true; }); draw(); });
    UI.$('#m-none').addEventListener('click', function () { UI.$$('#m-cats input').forEach(function (i) { i.checked = false; }); draw(); });
    draw();
    setTimeout(function () { map.invalidateSize(); }, 200);
  };
})();
