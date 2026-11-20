/* MÓDULO C: Reportes ciudadanos */
(function () {
  function nearestCanton(lat, lng) {
    var best = null, bd = Infinity;
    DATA.CANTONS.forEach(function (c) {
      var d = Math.pow(c.ref[0] - lat, 2) + Math.pow(c.ref[1] - lng, 2);
      if (d < bd) { bd = d; best = c; }
    });
    return best.id;
  }

  function timeline(status) {
    return '<ol style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px">' + DATA.STATUSES.map(function (s, i) {
      var done = i <= status;
      return '<li class="status ' + (done ? 'status-' + (i === status ? status : 4) : 'status-0') + '" style="' + (i === status ? 'box-shadow:0 0 0 2px var(--turq-500)' : '') + '">' + (i + 1) + '. ' + s + '</li>';
    }).join('') + '</ol>';
  }

  Pages.reportes = function (root) {
    root.innerHTML = UI.pageHead('Reportes ciudadanos', 'Registra una necesidad de tu comunidad y da seguimiento a su estado.') +
      '<div class="container page-body"><div class="grid" style="grid-template-columns:1.25fr 1fr;gap:16px" id="rep-layout">' +
      '<form class="card form-grid" id="rep-form" novalidate><h3 style="font-size:20px">Nuevo reporte</h3>' +
      '<div class="field"><label for="r-cat">Categoría *</label><select class="input" id="r-cat">' + UI.options(DATA.CATEGORIES, '', true, 'Selecciona una categoría') + '</select></div>' +
      '<div class="field"><label for="r-desc">Descripción *</label><textarea class="input" id="r-desc" maxlength="600" placeholder="Describe la necesidad: qué ocurre, dónde y desde cuándo."></textarea>' +
      '<p class="hint">Mínimo 15 caracteres. <strong>No incluyas nombres, teléfonos, cédulas ni datos de otras personas.</strong></p></div>' +
      '<div class="field"><label>Ubicación * <span class="muted small" style="font-weight:400">(haz clic en el mapa)</span></label>' +
      '<div class="map-box small" id="r-map" role="application" aria-label="Mapa para seleccionar la ubicación"></div>' +
      '<div class="row" style="margin-top:8px"><button class="btn btn-outline btn-sm" id="r-geo" type="button">' + icon('map-pin', 14) + ' Usar mi ubicación</button><span class="small muted" id="r-loc">Aún no seleccionaste un punto.</span></div></div>' +
      '<div class="field"><label for="r-canton">Cantón *</label><select class="input" id="r-canton">' + UI.options(DATA.CANTONS, '', true, 'Se completa al elegir el punto') + '</select></div>' +
      '<div class="field"><label for="r-photos">Fotografías (opcional, máx. ' + CONFIG.maxPhotos + ')</label><input class="input" id="r-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple>' +
      '<p class="hint">JPG, PNG o WebP de hasta 4 MB. Evita rostros, placas de vehículos o documentos. Las fotos <strong>no se publican</strong>; solo las ve el equipo de moderación.</p><div class="thumbs" id="r-thumbs"></div></div>' +
      '<div class="hp" aria-hidden="true"><label>No llenar<input type="text" id="r-hp" tabindex="-1" autocomplete="off"></label></div>' +
      '<label class="check"><input type="checkbox" id="r-consent"><span>Acepto el tratamiento de la información de este reporte para fines de planificación, conforme a la <a href="#/privacidad" style="text-decoration:underline">política de privacidad</a>. No se publicarán datos personales.</span></label>' +
      '<div id="r-error" class="notice err" style="display:none" role="alert"></div>' +
      '<div id="r-ok" class="notice ok" style="display:none" role="status"></div>' +
      '<div><button class="btn btn-primary" type="submit">Enviar reporte</button></div></form>' +

      '<div class="grid" style="align-content:start">' +
      '<div class="card"><h3 style="font-size:20px">Consultar estado</h3><p class="muted small" style="margin-top:4px">Ingresa el código que recibiste al enviar tu reporte.</p>' +
      '<form class="row" id="q-form" style="margin-top:12px;flex-wrap:nowrap"><label class="sr-only" for="q-code">Código del reporte</label><input class="input" id="q-code" placeholder="Ej. SEP-AB12CD" autocomplete="off"><button class="btn btn-primary" type="submit">Buscar</button></form>' +
      '<div id="q-result" style="margin-top:12px"></div></div>' +
      '<div class="card"><h3 style="font-size:20px">Reportes recientes</h3><p class="small muted" style="margin:4px 0 8px">Solo se muestran categoría, cantón, fecha y estado.</p><div id="recent"></div></div></div></div></div>';

    var layout = UI.$('#rep-layout');
    function responsive() { layout.style.gridTemplateColumns = window.innerWidth < 960 ? '1fr' : '1.25fr 1fr'; }
    responsive(); window.addEventListener('resize', responsive);
    UI.onCleanup(function () { window.removeEventListener('resize', responsive); });

    // Mapa selector
    var map = L.map('r-map').setView(CONFIG.mapCenter, CONFIG.mapZoom);
    MapUtil.tiles().addTo(map); MapUtil.cabeceras(map);
    UI.onCleanup(function () { map.remove(); });
    var point = null, marker = null;
    function setPoint(lat, lng) {
      point = { lat: +lat.toFixed(5), lng: +lng.toFixed(5) };
      if (marker) marker.setLatLng([lat, lng]); else marker = L.marker([lat, lng], { icon: MapUtil.pin('#14b8b1') }).addTo(map);
      UI.$('#r-loc').textContent = 'Punto: ' + point.lat + ', ' + point.lng;
      UI.$('#r-canton').value = nearestCanton(lat, lng);
    }
    map.on('click', function (e) { setPoint(e.latlng.lat, e.latlng.lng); });
    UI.$('#r-geo').addEventListener('click', function () {
      if (!navigator.geolocation) return UI.toast('Tu navegador no permite geolocalización.', true);
      navigator.geolocation.getCurrentPosition(function (p) { setPoint(p.coords.latitude, p.coords.longitude); map.setView([p.coords.latitude, p.coords.longitude], 15); },
        function () { UI.toast('No se pudo obtener tu ubicación. Selecciónala en el mapa.', true); }, { timeout: 8000 });
    });
    setTimeout(function () { map.invalidateSize(); }, 200);

    // Fotos
    var photos = [];
    UI.$('#r-photos').addEventListener('change', function (e) {
      UI.readPhotos(e.target.files).then(function (arr) {
        photos = arr;
        UI.$('#r-thumbs').innerHTML = arr.map(function (src) { return '<img src="' + src + '" alt="Vista previa de la fotografía adjunta">'; }).join('');
      }).catch(function (err) { e.target.value = ''; photos = []; UI.$('#r-thumbs').innerHTML = ''; UI.toast(err.message, true); });
    });

    // Envío
    var t0 = Date.now(), lastSubmit = 0;
    UI.$('#rep-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var err = UI.$('#r-error'), ok = UI.$('#r-ok'); err.style.display = 'none'; ok.style.display = 'none';
      function fail(m) { err.textContent = m; err.style.display = 'flex'; err.scrollIntoView({ block: 'center' }); }
      if (UI.$('#r-hp').value) return;
      if (Date.now() - t0 < 4000) return fail('Espera unos segundos antes de enviar.');
      if (Date.now() - lastSubmit < 15000) return fail('Espera un momento antes de enviar otro reporte.'); // limitación de solicitudes
      var cat = UI.$('#r-cat').value, desc = UI.$('#r-desc').value.trim(), canton = UI.$('#r-canton').value;
      if (!DATA.CATEGORIES.some(function (c) { return c.id === cat; })) return fail('Selecciona una categoría.');
      if (desc.length < 15) return fail('La descripción debe tener al menos 15 caracteres.');
      if (!point) return fail('Selecciona la ubicación en el mapa.');
      if (!canton) return fail('Selecciona el cantón.');
      if (!UI.$('#r-consent').checked) return fail('Debes aceptar el consentimiento informado.');

      var code = 'SEP-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      var saved = Store.addReport({ id: code, code: code, category: cat, canton: canton, description: desc, lat: point.lat, lng: point.lng, date: new Date().toISOString().slice(0, 10), status: 0, demo: false, photos: photos });
      if (!saved) return;
      lastSubmit = Date.now();
      ok.innerHTML = icon('circle-check', 18) + '<span>¡Reporte recibido! Tu código de seguimiento es <span class="code">' + code + '</span>. Guárdalo para consultar el estado.</span>';
      ok.style.display = 'flex';
      UI.$('#rep-form').reset(); photos = []; UI.$('#r-thumbs').innerHTML = ''; UI.$('#r-loc').textContent = 'Aún no seleccionaste un punto.';
      if (marker) { map.removeLayer(marker); marker = null; point = null; }
      renderRecent();
    });

    // Consulta de estado
    UI.$('#q-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var r = Store.findReport(UI.$('#q-code').value), box = UI.$('#q-result');
      if (!r) { box.innerHTML = '<div class="notice err">No encontramos un reporte con ese código.</div>'; return; }
      var c = DATA.category(r.category);
      box.innerHTML = '<div class="notice info" style="display:block"><strong>' + UI.esc(r.code) + '</strong> · ' + UI.esc(c.name) + ' · ' + UI.esc(DATA.cantonName(r.canton)) + '<br><span class="small">Enviado el ' + UI.date(r.date) + '</span>' + timeline(r.status) + '</div>';
    });

    function renderRecent() {
      var rs = Store.allReports().slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 8);
      UI.$('#recent').innerHTML = rs.map(function (r) {
        var c = DATA.category(r.category);
        return '<div class="canton-stat" style="gap:8px;align-items:center"><span><span class="dot" style="background:' + c.color + ';margin-right:6px"></span>' + UI.esc(c.name) + ' · ' + UI.esc(DATA.cantonName(r.canton)) + '<br><span class="small muted">' + UI.date(r.date) + (r.demo ? ' · DEMO' : '') + '</span></span><span class="status status-' + r.status + '">' + DATA.STATUSES[r.status] + '</span></div>';
      }).join('');
    }
    renderRecent();
  };
})();
