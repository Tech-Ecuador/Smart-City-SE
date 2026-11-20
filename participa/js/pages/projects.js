/* MÓDULO E: Proyectos y propuestas */
(function () {
  var kindClass = ['tag-turq', 'tag-amber', 'tag-leaf'];

  Pages.proyectos = function (root) {
    var sectors = Array.from(new Set(DATA.PROJECTS.map(function (p) { return p.sector; }))).sort();
    root.innerHTML = UI.pageHead('Proyectos y propuestas', 'Catálogo de iniciativas para el desarrollo provincial: propuestas ciudadanas, proyectos en estudio y proyectos institucionales aprobados.') +
      '<div class="container page-body"><div class="notice" style="margin-bottom:16px">' + icon('info', 18) + '<span><strong>Datos DEMO.</strong> Los proyectos, costos e instituciones son ejemplos ficticios. Los costos son referenciales y no constituyen compromisos presupuestarios.</span></div>' +
      '<div class="card filters" style="margin-bottom:16px">' +
      '<div class="field"><label for="p-kind">Tipo</label><select class="input" id="p-kind"><option value="">Todos</option>' + DATA.PROJECT_KINDS.map(function (k, i) { return '<option value="' + i + '">' + k + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="p-sector">Sector</label><select class="input" id="p-sector">' + UI.options(sectors, '', true, 'Todos') + '</select></div>' +
      '<div class="field"><label for="p-canton">Cantón</label><select class="input" id="p-canton">' + UI.options(DATA.CANTONS, '', true, 'Todos') + '</select></div></div>' +
      '<p class="small muted" id="p-count" style="margin-bottom:12px"></p><div class="grid grid-2" id="p-list"></div></div>';

    function render() {
      var k = UI.$('#p-kind').value, s = UI.$('#p-sector').value, c = UI.$('#p-canton').value;
      var items = DATA.PROJECTS.filter(function (p) { return (k === '' || p.kind === +k) && (!s || p.sector === s) && (!c || p.canton === c); });
      UI.$('#p-count').textContent = items.length + ' resultado(s) · Costo referencial total: ' + UI.money(items.reduce(function (a, p) { return a + p.cost; }, 0));
      UI.$('#p-list').innerHTML = items.map(function (p) {
        return '<article class="card hover"><div class="row between"><span class="tag ' + kindClass[p.kind] + '">' + DATA.PROJECT_KINDS[p.kind] + '</span>' + UI.badge('demo') + '</div>' +
          '<h3 style="margin-top:12px;font-size:19px">' + UI.esc(p.name) + '</h3><p class="muted" style="margin-top:6px">' + UI.esc(p.description) + '</p>' +
          '<dl style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:14px 0 0;font-size:14px">' +
          '<dt class="muted">Sector</dt><dd style="margin:0">' + UI.esc(p.sector) + ' · ' + UI.esc(DATA.cantonName(p.canton)) + '</dd>' +
          '<dt class="muted">Objetivo</dt><dd style="margin:0">' + UI.esc(p.objective) + '</dd>' +
          '<dt class="muted">Beneficiarios</dt><dd style="margin:0">' + UI.num(p.beneficiaries) + ' (estimados)</dd>' +
          '<dt class="muted">Costo</dt><dd style="margin:0"><strong>' + UI.money(p.cost) + '</strong> (referencial)</dd>' +
          '<dt class="muted">Financiamiento</dt><dd style="margin:0">' + UI.esc(p.funding) + '</dd>' +
          '<dt class="muted">Institución</dt><dd style="margin:0">' + UI.esc(p.institution) + '</dd>' +
          '<dt class="muted">Evaluación</dt><dd style="margin:0"><span class="status status-1">' + UI.esc(p.evaluation) + '</span></dd></dl></article>';
      }).join('') || '<p class="muted">No hay proyectos con esos filtros.</p>';
    }
    UI.$$('#p-kind,#p-sector,#p-canton').forEach(function (el) { el.addEventListener('change', render); });
    render();
  };
})();
