/* MÓDULO D: Observatorio provincial (dashboard estadístico) */
(function () {
  function monthsRange() {
    var out = [], d = new Date(2026, 5, 1), end = new Date();
    if (end < new Date(2026, 10, 1)) end = new Date(2026, 10, 1);
    while (d <= end) { out.push(d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2)); d.setMonth(d.getMonth() + 1); }
    return out;
  }
  var MN = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  function mlabel(m) { return MN[+m.slice(5) - 1] + ' ' + m.slice(2, 4); }

  Pages.observatorio = function (root) {
    var months = monthsRange();
    root.innerHTML = UI.pageHead('Observatorio provincial', 'Estadísticas de participación y necesidades ciudadanas con filtros interactivos.') +
      '<div class="container page-body"><div class="notice" style="margin-bottom:16px">' + icon('info', 18) + '<span><strong>Datos DEMO / SIMULACIÓN.</strong> Las cifras son ficticias y no representan resultados provinciales. Las respuestas que registres en este navegador se suman a los indicadores.</span></div>' +
      '<div class="card filters" style="margin-bottom:16px">' +
      '<div class="field"><label for="o-canton">Cantón</label><select class="input" id="o-canton">' + UI.options(DATA.CANTONS, '', true, 'Todos') + '</select></div>' +
      '<div class="field"><label for="o-cat">Categoría</label><select class="input" id="o-cat">' + UI.options(DATA.CATEGORIES, '', true, 'Todas') + '</select></div>' +
      '<div class="field"><label for="o-from">Desde</label><select class="input" id="o-from">' + months.map(function (m) { return '<option value="' + m + '">' + mlabel(m) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="o-to">Hasta</label><select class="input" id="o-to">' + months.map(function (m, i) { return '<option value="' + m + '"' + (i === months.length - 1 ? ' selected' : '') + '>' + mlabel(m) + '</option>'; }).join('') + '</select></div>' +
      '<button class="btn btn-outline" id="o-reset" type="button">Limpiar</button></div>' +
      '<div class="grid grid-4" id="o-kpis"></div>' +
      '<div class="grid grid-2" style="margin-top:16px">' +
      '<div class="card"><div class="row between"><h3 style="font-size:17px">Necesidades por cantón</h3>' + UI.badge('sim') + '</div><div class="chart-box"><canvas id="c-canton" aria-label="Gráfico de necesidades por cantón" role="img"></canvas></div></div>' +
      '<div class="card"><div class="row between"><h3 style="font-size:17px">Necesidades por categoría</h3>' + UI.badge('sim') + '</div><div class="chart-box"><canvas id="c-cat" aria-label="Gráfico de necesidades por categoría" role="img"></canvas></div></div>' +
      '<div class="card"><div class="row between"><h3 style="font-size:17px">Evolución temporal</h3>' + UI.badge('sim') + '</div><div class="chart-box"><canvas id="c-time" aria-label="Evolución temporal" role="img"></canvas></div></div>' +
      '<div class="card"><div class="row between"><h3 style="font-size:17px">Comparación territorial por categoría</h3>' + UI.badge('sim') + '</div><div class="chart-box"><canvas id="c-comp" aria-label="Comparación territorial" role="img"></canvas></div></div></div>' +
      '<div class="card" style="margin-top:16px"><h3 style="font-size:17px">Detalle por categoría y cantón</h3><div class="table-wrap" id="o-table" style="margin-top:10px"></div></div>' +
      '<div class="row" style="margin-top:16px"><button class="btn btn-outline" id="o-share" type="button">Compartir enlace del observatorio</button></div></div>';

    var charts = {};
    function inRange(date) { var m = date.slice(0, 7); return m >= UI.$('#o-from').value && m <= UI.$('#o-to').value; }

    function update() {
      var canton = UI.$('#o-canton').value, cat = UI.$('#o-cat').value;
      var reps = Store.allReports().filter(function (r) { return (!canton || r.canton === canton) && (!cat || r.category === cat) && inRange(r.date); });
      var resp = DATA.SEED_RESPONSES.concat(Store.state.responses).filter(function (r) { return (!canton || r.canton === canton) && inRange(r.ts); });

      UI.$('#o-kpis').innerHTML = [
        ['Total de participaciones', resp.length + Object.keys(Store.state.votes).length, 'message-square-text'],
        ['Total de encuestas', Store.allSurveys().length, 'clipboard-list'],
        ['Problemas reportados', reps.length, 'file-warning'],
        ['Atendidos', reps.filter(function (r) { return r.status === 4; }).length, 'circle-check'],
      ].map(function (k) { return '<div class="card stat"><div class="top"><span class="ico">' + icon(k[2], 20) + '</span>' + UI.badge('demo') + '</div><p class="num">' + UI.num(k[1]) + '</p><p class="lbl">' + k[0] + '</p></div>'; }).join('');

      // Por cantón
      var byCanton = DATA.CANTONS.map(function (c) { return reps.filter(function (r) { return r.canton === c.id; }).length; });
      // Por categoría
      var byCat = DATA.CATEGORIES.map(function (c) { return reps.filter(function (r) { return r.category === c.id; }).length; });
      // Evolución
      var sel = months.filter(function (m) { return m >= UI.$('#o-from').value && m <= UI.$('#o-to').value; });
      var tRep = sel.map(function (m) { return reps.filter(function (r) { return r.date.slice(0, 7) === m; }).length; });
      var tRes = sel.map(function (m) { return resp.filter(function (r) { return r.ts.slice(0, 7) === m; }).length; });

      function draw(id, cfg) {
        if (charts[id]) { charts[id].data = cfg.data; charts[id].update(); return; }
        charts[id] = UI.chart(UI.$('#' + id), cfg);
      }
      var common = { responsive: true, maintainAspectRatio: false };
      draw('c-canton', { type: 'bar', data: { labels: DATA.CANTONS.map(function (c) { return c.name; }), datasets: [{ label: 'Reportes', data: byCanton, backgroundColor: ['#12335f', '#14b8b1', '#2ea05e'], borderRadius: 8 }] }, options: Object.assign({}, common, { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }) });
      draw('c-cat', { type: 'bar', data: { labels: DATA.CATEGORIES.map(function (c) { return c.name; }), datasets: [{ label: 'Reportes', data: byCat, backgroundColor: DATA.CATEGORIES.map(function (c) { return c.color; }), borderRadius: 6 }] }, options: Object.assign({}, common, { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }) });
      draw('c-time', { type: 'line', data: { labels: sel.map(mlabel), datasets: [
        { label: 'Reportes', data: tRep, borderColor: '#12335f', backgroundColor: '#12335f22', tension: .3, fill: true, pointBackgroundColor: '#2ea05e' },
        { label: 'Respuestas a encuestas', data: tRes, borderColor: '#14b8b1', backgroundColor: '#14b8b122', tension: .3, fill: true } ] }, options: Object.assign({}, common, { scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }) });
      draw('c-comp', { type: 'bar', data: { labels: DATA.CATEGORIES.map(function (c) { return c.name; }), datasets: DATA.CANTONS.map(function (cn, i) {
        return { label: cn.name, backgroundColor: ['#12335f', '#14b8b1', '#2ea05e'][i], data: DATA.CATEGORIES.map(function (c) { return reps.filter(function (r) { return r.canton === cn.id && r.category === c.id; }).length; }) };
      }) }, options: Object.assign({}, common, { scales: { x: { stacked: true, ticks: { maxRotation: 60, minRotation: 40 } }, y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } } } }) });

      // Tabla
      var rows = DATA.CATEGORIES.map(function (c, i) {
        return '<tr><td>' + UI.esc(c.name) + '</td>' + DATA.CANTONS.map(function (cn) {
          return '<td>' + reps.filter(function (r) { return r.canton === cn.id && r.category === c.id; }).length + '</td>';
        }).join('') + '<td><strong>' + byCat[i] + '</strong></td><td>' + UI.pct(byCat[i], reps.length) + '%</td></tr>';
      }).join('');
      UI.$('#o-table').innerHTML = '<table class="table"><thead><tr><th>Categoría</th>' + DATA.CANTONS.map(function (c) { return '<th>' + UI.esc(c.name) + '</th>'; }).join('') + '<th>Total</th><th>%</th></tr></thead><tbody>' + rows + '</tbody></table>';
    }

    UI.$$('#o-canton,#o-cat,#o-from,#o-to').forEach(function (el) { el.addEventListener('change', function () {
      if (UI.$('#o-from').value > UI.$('#o-to').value) UI.$('#o-to').value = UI.$('#o-from').value;
      update();
    }); });
    UI.$('#o-reset').addEventListener('click', function () {
      UI.$('#o-canton').value = ''; UI.$('#o-cat').value = ''; UI.$('#o-from').value = months[0]; UI.$('#o-to').value = months[months.length - 1]; update();
    });
    UI.$('#o-share').addEventListener('click', function () {
      if (navigator.share) navigator.share({ title: 'Observatorio · Santa Elena Participa', url: location.href }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { UI.toast('Enlace copiado.'); });
    });
    update();
  };
})();
