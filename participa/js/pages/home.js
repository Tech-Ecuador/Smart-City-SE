/* Página principal: 10 bloques definidos en el documento del proyecto */
(function () {
  var HERO_ART =
    '<svg viewBox="0 0 400 340" class="hero-art" role="img" aria-label="Ilustración abstracta de costa y sol" style="filter:drop-shadow(0 20px 30px rgba(0,0,0,.35))">' +
    '<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14b8b1" stop-opacity=".35"/><stop offset="1" stop-color="#0a1f3a" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="se" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14b8b1"/><stop offset="1" stop-color="#0c7771"/></linearGradient></defs>' +
    '<rect x="10" y="10" width="380" height="320" rx="28" fill="url(#sk)" stroke="#ffffff22"/>' +
    '<circle cx="290" cy="95" r="58" fill="#fde68a" opacity=".15"/><circle cx="290" cy="95" r="38" fill="#fde68a" opacity=".95"/>' +
    '<path d="M10 215 C80 190 140 235 210 215 S330 190 390 215 V300 a28 28 0 0 1 -28 28 H38 a28 28 0 0 1 -28 -28Z" fill="url(#se)" opacity=".9"/>' +
    '<path d="M10 245 C80 225 140 265 210 245 S330 225 390 245" stroke="#ffffff55" stroke-width="3" fill="none"/>' +
    '<path d="M10 272 C80 255 140 290 210 272 S330 255 390 272" stroke="#ffffff33" stroke-width="3" fill="none"/>' +
    '<path d="M10 215 C60 205 90 190 130 195 C170 200 190 175 240 180 C300 185 340 200 390 190 V215 C330 190 270 215 210 215 S80 190 10 215Z" fill="#2ea05e" opacity=".9"/>' +
    [[90, 160], [160, 140], [230, 150], [320, 160], [125, 185]].map(function (p) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="14" fill="#fff" opacity=".18"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="#fff"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#14b8b1"/>';
    }).join('') +
    '<text x="30" y="46" fill="#ffffffaa" font-size="12" font-weight="700" letter-spacing="2">ILUSTRACIÓN</text></svg>';

  Pages.home = function (root) {
    var surveys = Store.allSurveys();
    var open = surveys.filter(function (s) { return Store.surveyStatus(s) === 'Abierta'; }).slice(0, 2);
    var stats = [
      ['message-square-text', 'Participaciones', Store.participationCount()],
      ['clipboard-list', 'Encuestas', surveys.length],
      ['file-warning', 'Problemas reportados', Store.allReports().length],
      ['folder-kanban', 'Propuestas', DATA.PROJECTS.length + Store.allBudget().length],
    ];
    var steps = [
      ['clipboard-list', 'Opina', 'Responde encuestas desde tu celular en pocos minutos.'],
      ['megaphone', 'Reporta', 'Cuéntanos qué necesita tu comunidad y ubícalo en el mapa.'],
      ['vote', 'Prioriza', 'Participa en votaciones consultivas de propuestas.'],
      ['chart-column', 'Observa', 'Consulta estadísticas públicas, claras y transparentes.'],
    ];

    root.innerHTML =
      // 3. Banner principal
      '<section class="hero"><div class="container hero-grid"><div>' +
      '<p class="hero-pill">' + icon('map-pin', 14) + ' Provincia de Santa Elena · Ecuador</p>' +
      '<h1>Tu voz construye <em>provincia</em>.</h1>' +
      '<p class="lead">Participa en encuestas, reporta las necesidades de tu comunidad y explora información del territorio para aportar a la planificación y al desarrollo de la provincia.</p>' +
      '<div class="hero-actions"><a class="btn btn-primary" href="#/encuestas">Participar ahora ' + icon('arrow-right', 16) + '</a>' +
      '<a class="btn btn-ghost-light" href="#/reportes">' + icon('megaphone', 16) + ' Reportar una necesidad</a></div>' +
      '<p class="hero-note">' + icon('users', 16) + ' Participación voluntaria · Tus datos personales se protegen conforme a la LOPDP.</p>' +
      '</div>' + HERO_ART + '</div></section>' +

      // 4. Indicadores
      '<section class="container" aria-label="Indicadores estadísticos"><div class="grid grid-4 grid-stats">' +
      stats.map(function (s, i) {
        return '<div class="card stat hover reveal" style="transition-delay:' + i * 80 + 'ms"><div class="top"><span class="ico">' + icon(s[0], 20) + '</span>' + UI.badge('demo') + '</div>' +
          '<p class="num" data-count="' + s[2] + '">0</p><p class="lbl">' + s[1] + '</p></div>';
      }).join('') + '</div></section>' +

      // Cómo funciona
      '<section class="container section reveal">' + UI.head('Cómo funciona', 'Cuatro formas de participar', 'Una plataforma simple, abierta y transparente para que la planificación nazca de la comunidad.') +
      '<div class="grid grid-4">' + steps.map(function (s, i) {
        return '<div class="card step"><span class="n">' + (i + 1) + '</span><span class="ico">' + icon(s[0], 24) + '</span><h3>' + s[1] + '</h3><p>' + s[2] + '</p></div>';
      }).join('') + '</div></section>' +

      // 5. Mapa
      '<section class="container section reveal">' + UI.head('Territorio', 'Mapa interactivo provincial', 'Visualiza las necesidades ciudadanas por cantón y categoría.',
        '<a class="btn btn-outline" href="#/mapa">Abrir mapa ' + icon('map', 16) + '</a>') +
      '<div class="card"><div class="map-box small" id="home-map" role="img" aria-label="Vista previa del mapa de reportes"></div>' +
      '<p class="small muted" style="margin-top:10px">Vista previa con reportes DEMO. Las ubicaciones son referenciales; los límites territoriales oficiales se incorporarán cuando se disponga de cartografía verificada.</p></div></section>' +

      // Categorías
      '<section class="container section reveal">' + UI.head('Necesidades ciudadanas', '¿Sobre qué tema quieres opinar?', 'Elige una categoría para reportar o consultar información.') +
      '<div class="cat-grid">' + DATA.CATEGORIES.map(function (c) {
        return '<a class="card cat hover" href="#/reportes"><span class="ico">' + icon(c.icon, 22) + '</span>' + UI.esc(c.name) + '</a>';
      }).join('') + '</div></section>' +

      // 6. Encuestas activas
      '<section class="container section reveal">' + UI.head('Participa', 'Encuestas activas', 'Las encuestas abiertas reflejan la opinión de quienes participan; no son muestras estadísticamente representativas.',
        '<a class="btn btn-outline" href="#/encuestas">Ver todas</a>') +
      '<div class="grid grid-2">' + (open.length ? open.map(function (s) {
        return '<article class="card hover"><div class="row between">' + (s.demo ? UI.badge('demo') : '<span></span>') +
          '<span class="small muted">' + icon('calendar-days', 14) + ' Cierra ' + UI.date(s.closes) + '</span></div>' +
          '<h3 style="margin-top:12px;font-size:19px">' + UI.esc(s.title) + '</h3><p class="muted" style="margin-top:6px">' + UI.esc(s.description) + '</p>' +
          '<a class="btn btn-primary" style="margin-top:16px" href="#/encuestas/' + s.id + '">Responder ' + icon('arrow-right', 16) + '</a></article>';
      }).join('') : '<p class="muted">No hay encuestas abiertas por ahora.</p>') + '</div></section>' +

      // 7. Reportes ciudadanos
      '<section class="container section reveal"><div class="card" style="background:linear-gradient(90deg,var(--leaf-50),#fff,var(--turq-50));padding:32px"><div class="row between" style="gap:24px">' +
      '<div style="max-width:620px"><p class="eyebrow" style="color:var(--leaf-700)">Reportes ciudadanos</p><h2 style="font-size:28px;font-weight:800">¿Ves un problema en tu comunidad?</h2>' +
      '<p class="muted" style="margin-top:8px">Registra la necesidad, elige una categoría, ubica el punto en el mapa y da seguimiento al estado: Recibido, En revisión, Validado, Derivado o Atendido.</p></div>' +
      '<a class="btn btn-green" href="#/reportes">' + icon('file-warning', 16) + ' Crear reporte</a></div></div></section>' +

      // 8. Proyectos
      '<section class="container section reveal">' + UI.head('Desarrollo provincial', 'Proyectos y propuestas', '', '<a class="btn btn-outline" href="#/proyectos">Ver catálogo</a>') +
      '<div class="grid grid-3">' + DATA.PROJECTS.slice(0, 3).map(function (p) {
        return '<article class="card hover">' + UI.badge('demo') + '<p class="eyebrow" style="margin-top:12px">' + UI.esc(DATA.PROJECT_KINDS[p.kind]) + '</p>' +
          '<h3 style="font-size:18px">' + UI.esc(p.name) + '</h3><p class="small muted" style="margin-top:8px">Sector: ' + UI.esc(p.sector) + ' · ' + UI.esc(DATA.cantonName(p.canton)) + '</p></article>';
      }).join('') + '</div></section>' +

      // 9. Noticias
      '<section class="container section reveal">' + UI.head('Comunidad', 'Noticias y actividades comunitarias') +
      '<div class="grid grid-3">' + DATA.NEWS.map(function (n) {
        return '<article class="card"><div class="row between"><time class="small muted" datetime="' + n.date + '">' + UI.date(n.date) + '</time>' + UI.badge('demo') + '</div>' +
          '<h3 style="margin-top:10px;font-size:18px">' + UI.esc(n.title) + '</h3><p class="muted" style="margin-top:6px;font-size:14px">' + UI.esc(n.excerpt) + '</p></article>';
      }).join('') + '</div></section>';

    // Mini mapa de vista previa
    var el = document.getElementById('home-map');
    if (el && window.L) {
      var m = L.map(el, { scrollWheelZoom: false, zoomControl: true }).setView(CONFIG.mapCenter, CONFIG.mapZoom);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; Colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(m);
      L.heatLayer(Store.allReports().map(function (r) { return [r.lat, r.lng, 0.6]; }), { radius: 28, blur: 22, maxZoom: 13 }).addTo(m);
      UI.onCleanup(function () { m.remove(); });
    }
  };

  Pages.notfound = function (root) {
    root.innerHTML = '<section class="container section" style="text-align:center;padding:60px 0"><p style="font-size:72px;font-weight:800;color:var(--turq-500)">404</p>' +
      '<h1 style="font-size:28px">Página no encontrada</h1><a class="btn btn-primary" style="margin-top:20px" href="#/">Ir al inicio</a></section>';
  };
})();
