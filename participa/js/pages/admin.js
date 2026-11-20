/* MÓDULO H: Panel administrativo (DEMO)
   ADVERTENCIA: en esta versión estática el acceso es solo demostrativo y NO ofrece
   seguridad real (todo corre en el navegador). En producción se reemplaza por
   Supabase Auth + RLS + Edge Functions, con auditoría en servidor. */
(function () {
  var PERMS = {
    'Administrador': ['stats', 'reports', 'surveys', 'entrepreneurs', 'users', 'export', 'audit'],
    'Editor': ['stats', 'surveys', 'entrepreneurs'],
    'Moderador': ['stats', 'reports', 'entrepreneurs'],
    'Analista': ['stats', 'export'],
  };
  var TABS = { stats: 'Resumen', reports: 'Reportes', surveys: 'Encuestas', entrepreneurs: 'Emprendimientos', users: 'Usuarios y permisos', export: 'Exportar', audit: 'Auditoría' };
  function can(tab) { var a = Store.state.admin; return !!a && PERMS[a.role] && PERMS[a.role].indexOf(tab) >= 0; }

  Pages.admin = function (root) {
    if (!Store.state.admin) return login(root);
    var tab = can('stats') ? 'stats' : Object.keys(TABS).filter(can)[0];
    shell(root, tab);
  };

  function login(root) {
    root.innerHTML = UI.pageHead('Panel administrativo', 'Acceso privado para administración y moderación.') +
      '<div class="container page-body"><div class="card" style="max-width:520px;margin:0 auto"><div class="notice" style="margin-bottom:16px">' + icon('lock', 18) +
      '<span><strong>Acceso DEMO.</strong> Esta versión no tiene autenticación real. Elige un rol para explorar el panel con datos ficticios. En producción se usará Supabase Auth con contraseñas y roles verificados en el servidor.</span></div>' +
      '<form class="form-grid" id="login-form"><div class="field"><label for="a-role">Rol para la demostración</label><select class="input" id="a-role">' +
      Object.keys(PERMS).map(function (r) { return '<option>' + r + '</option>'; }).join('') + '</select></div>' +
      '<div><button class="btn btn-primary" type="submit">Entrar al panel demo</button></div></form></div></div>';
    UI.$('#login-form').addEventListener('submit', function (e) { e.preventDefault(); Store.login(UI.$('#a-role').value); Pages.admin(root); });
  }

  function shell(root, tab) {
    var a = Store.state.admin;
    root.innerHTML = UI.pageHead('Panel administrativo', 'Sesión demo como <strong>' + UI.esc(a.role) + '</strong>') +
      '<div class="container page-body"><div class="card"><div class="row between" style="margin-bottom:6px"><div class="tabs" style="margin:0;border:0" role="tablist">' +
      Object.keys(TABS).filter(can).map(function (k) { return '<button class="tab ' + (k === tab ? 'active' : '') + '" role="tab" aria-selected="' + (k === tab) + '" data-tab="' + k + '">' + TABS[k] + '</button>'; }).join('') +
      '</div><button class="btn btn-outline btn-sm" id="a-logout" type="button">' + icon('log-out', 14) + ' Salir</button></div>' +
      '<div style="border-top:1px solid var(--slate-200);padding-top:18px" id="a-body"></div></div></div>';
    UI.$$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { shell(root, b.getAttribute('data-tab')); }); });
    UI.$('#a-logout').addEventListener('click', function () { Store.logout(); Pages.admin(root); });
    var body = UI.$('#a-body');
    ({ stats: tabStats, reports: tabReports, surveys: tabSurveys, entrepreneurs: tabEntre, users: tabUsers, export: tabExport, audit: tabAudit })[tab](body, root);
  }

  function tabStats(body) {
    var reps = Store.allReports();
    var byStatus = DATA.STATUSES.map(function (s, i) { return reps.filter(function (r) { return r.status === i; }).length; });
    body.innerHTML = '<div class="grid grid-4">' + [['Reportes', reps.length], ['Participaciones', Store.participationCount()], ['Encuestas', Store.allSurveys().length], ['Emprendimientos', Store.allEntrepreneurs().length]]
      .map(function (k) { return '<div class="card stat"><p class="num" style="font-size:30px;margin:0">' + UI.num(k[1]) + '</p><p class="lbl">' + k[0] + '</p></div>'; }).join('') + '</div>' +
      '<h3 style="margin:22px 0 4px;font-size:17px">Reportes por estado</h3>' + DATA.STATUSES.map(function (s, i) {
        return '<div class="bar-row"><div class="meta"><span>' + s + '</span><span><strong>' + byStatus[i] + '</strong></span></div><div class="bar"><i style="width:' + UI.pct(byStatus[i], reps.length) + '%"></i></div></div>';
      }).join('');
  }

  function tabReports(body, root) {
    if (!can('reports')) return;
    var reps = Store.allReports().slice().sort(function (a, b) { return (a.demo === b.demo ? 0 : a.demo ? 1 : -1) || (a.date < b.date ? 1 : -1); }).slice(0, 40);
    body.innerHTML = '<p class="small muted" style="margin-bottom:10px">Se muestran los 40 reportes más recientes (los registrados en este navegador aparecen primero). Las fotografías solo son visibles aquí.</p>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Código</th><th>Categoría</th><th>Cantón</th><th>Fecha</th><th>Descripción</th><th>Estado</th><th></th></tr></thead><tbody>' +
      reps.map(function (r) {
        return '<tr><td><span class="code">' + UI.esc(r.code) + '</span></td><td>' + UI.esc(DATA.category(r.category).name) + '</td><td>' + UI.esc(DATA.cantonName(r.canton)) + '</td><td>' + UI.date(r.date) + '</td>' +
          '<td style="min-width:220px">' + UI.esc(r.description) + (r.photos && r.photos.length ? '<div class="thumbs">' + r.photos.map(function (p) { return '<img src="' + p + '" alt="Foto del reporte ' + UI.esc(r.code) + '">'; }).join('') + '</div>' : '') + '</td>' +
          '<td><label class="sr-only" for="st-' + UI.esc(r.code) + '">Estado</label><select class="input" id="st-' + UI.esc(r.code) + '" data-status="' + UI.esc(r.code) + '">' +
          DATA.STATUSES.map(function (s, i) { return '<option value="' + i + '"' + (i === r.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td>' +
          '<td><button class="btn btn-danger btn-sm" data-hide="' + UI.esc(r.code) + '" title="Ocultar reporte">' + icon('trash-2', 14) + '</button></td></tr>';
      }).join('') + '</tbody></table></div>';
    body.addEventListener('change', function (e) {
      var sel = e.target.closest('[data-status]'); if (!sel || !can('reports')) return;
      Store.setStatus(sel.getAttribute('data-status'), +sel.value); Store.log('Reporte ' + sel.getAttribute('data-status') + ' → ' + DATA.STATUSES[+sel.value]); UI.toast('Estado actualizado.');
    });
    body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-hide]'); if (!b || !can('reports')) return;
      if (confirm('¿Ocultar este reporte de las vistas públicas?')) { Store.hideReport(b.getAttribute('data-hide')); Store.log('Reporte ocultado ' + b.getAttribute('data-hide')); shell(root, 'reports'); }
    });
  }

  function tabSurveys(body, root) {
    if (!can('surveys')) return;
    body.innerHTML = '<h3 style="font-size:17px;margin-bottom:10px">Encuestas existentes</h3><div class="table-wrap"><table class="table"><thead><tr><th>Título</th><th>Estado</th><th>Respuestas</th><th></th></tr></thead><tbody>' +
      Store.allSurveys().map(function (s) {
        var mine = !s.demo;
        return '<tr><td>' + UI.esc(s.title) + '</td><td>' + Store.surveyStatus(s) + '</td><td>' + Store.responsesFor(s.id).length + '</td><td>' + (mine ? '<button class="btn btn-danger btn-sm" data-del="' + s.id + '">' + icon('trash-2', 14) + '</button>' : '<span class="muted small">Ejemplo</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<form class="form-grid" id="sv-new" style="margin-top:26px" novalidate><h3 style="font-size:17px">Crear encuesta</h3>' +
      '<div class="grid grid-2"><div class="field"><label for="n-title">Título *</label><input class="input" id="n-title" maxlength="120"></div>' +
      '<div class="field"><label for="n-desc">Descripción</label><input class="input" id="n-desc" maxlength="200"></div>' +
      '<div class="field"><label for="n-open">Fecha de apertura *</label><input class="input" id="n-open" type="date" value="' + new Date().toISOString().slice(0, 10) + '"></div>' +
      '<div class="field"><label for="n-close">Fecha de cierre *</label><input class="input" id="n-close" type="date"></div></div>' +
      '<div id="q-blocks"></div><div class="row"><button class="btn btn-outline btn-sm" id="q-add" type="button">' + icon('plus', 14) + ' Agregar pregunta</button></div>' +
      '<div id="sv-err" class="notice err" style="display:none" role="alert"></div><div><button class="btn btn-primary" type="submit">Publicar encuesta</button></div></form>';

    var count = 0;
    function addQ() {
      if (count >= 5) return UI.toast('Máximo 5 preguntas.', true);
      count++;
      var d = document.createElement('div'); d.className = 'card'; d.style.background = 'var(--slate-50)'; d.setAttribute('data-q', '');
      d.innerHTML = '<div class="field"><label>Pregunta ' + count + ' *</label><input class="input" data-qt maxlength="160"></div>' +
        '<div class="grid grid-2" style="margin-top:10px"><div class="field"><label>Tipo de respuesta</label><select class="input" data-qtype><option value="single">Respuesta única</option><option value="multiple">Respuesta múltiple</option></select></div>' +
        '<div class="field"><label>Opciones * (una por línea, 2 a 10)</label><textarea class="input" data-qopts style="min-height:90px"></textarea></div></div>';
      UI.$('#q-blocks').appendChild(d);
    }
    addQ();
    UI.$('#q-add').addEventListener('click', addQ);
    body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-del]'); if (!b || !can('surveys')) return;
      if (confirm('¿Eliminar esta encuesta?')) { Store.state.surveysCreated = Store.state.surveysCreated.filter(function (s) { return s.id !== b.getAttribute('data-del'); }); Store.save(); Store.log('Encuesta eliminada ' + b.getAttribute('data-del')); shell(root, 'surveys'); }
    });
    UI.$('#sv-new').addEventListener('submit', function (e) {
      e.preventDefault();
      var err = UI.$('#sv-err'); err.style.display = 'none';
      function fail(m) { err.textContent = m; err.style.display = 'flex'; }
      if (!can('surveys')) return fail('Tu rol no permite crear encuestas.');
      var title = UI.$('#n-title').value.trim(), open = UI.$('#n-open').value, close = UI.$('#n-close').value;
      if (title.length < 5) return fail('El título debe tener al menos 5 caracteres.');
      if (!open || !close || close < open) return fail('Define fechas válidas (el cierre no puede ser anterior a la apertura).');
      var qs = [];
      var blocks = UI.$$('[data-q]');
      for (var i = 0; i < blocks.length; i++) {
        var t = UI.$('[data-qt]', blocks[i]).value.trim();
        var opts = UI.$('[data-qopts]', blocks[i]).value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
        var uniq = opts.filter(function (x, k) { return opts.indexOf(x) === k; });
        if (t.length < 5) return fail('Escribe el texto de la pregunta ' + (i + 1) + '.');
        if (uniq.length < 2 || uniq.length > 10) return fail('La pregunta ' + (i + 1) + ' debe tener entre 2 y 10 opciones distintas.');
        if (uniq.some(function (x) { return x.length > 80; })) return fail('Cada opción debe tener máximo 80 caracteres.');
        qs.push({ id: 'q' + (i + 1), text: t, type: UI.$('[data-qtype]', blocks[i]).value, options: uniq.map(function (x, k) { return ['o' + (k + 1), x]; }) });
      }
      Store.state.surveysCreated.push({ id: Store.uid('sv').toLowerCase(), title: title, description: UI.$('#n-desc').value.trim(), opens: open, closes: close, demo: false, openSample: true,
        method: 'Encuesta abierta y voluntaria de autoselección. Los resultados reflejan solo a quienes participaron y no son estadísticamente representativos.', questions: qs });
      Store.save(); Store.log('Encuesta creada: ' + title); UI.toast('Encuesta publicada.'); shell(root, 'surveys');
    });
  }

  function tabEntre(body, root) {
    if (!can('entrepreneurs')) return;
    body.innerHTML = '<div class="table-wrap"><table class="table"><thead><tr><th>Nombre</th><th>Actividad</th><th>Cantón</th><th>Origen</th><th></th></tr></thead><tbody>' +
      Store.allEntrepreneurs().map(function (e) {
        return '<tr><td>' + UI.esc(e.name) + '</td><td>' + UI.esc(e.activity) + '</td><td>' + UI.esc(DATA.cantonName(e.canton)) + '</td><td>' + (e.demo ? 'DEMO' : 'Registro local') + '</td><td><button class="btn btn-danger btn-sm" data-hide-e="' + UI.esc(e.id) + '">' + icon('trash-2', 14) + '</button></td></tr>';
      }).join('') + '</tbody></table></div>';
    body.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-hide-e]'); if (!b || !can('entrepreneurs')) return;
      if (confirm('¿Ocultar este emprendimiento del directorio?')) { Store.hideEntrepreneur(b.getAttribute('data-hide-e')); Store.log('Emprendimiento ocultado ' + b.getAttribute('data-hide-e')); shell(root, 'entrepreneurs'); }
    });
  }

  function tabUsers(body) {
    if (!can('users')) return;
    var modules = { reports: 'Moderar reportes', surveys: 'Crear/editar encuestas', entrepreneurs: 'Emprendimientos', export: 'Exportar datos', users: 'Usuarios y permisos', audit: 'Auditoría' };
    body.innerHTML = '<div class="notice info" style="margin-bottom:14px">' + icon('info', 18) + '<span>Usuarios ficticios de ejemplo. La gestión real de usuarios se hará con Supabase Auth.</span></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr></thead><tbody>' +
      DATA.DEMO_USERS.map(function (u) { return '<tr><td>' + UI.esc(u.name) + '</td><td>' + UI.esc(u.email) + '</td><td>' + UI.esc(u.role) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<h3 style="margin:22px 0 8px;font-size:17px">Matriz de permisos por rol</h3><div class="table-wrap"><table class="table"><thead><tr><th>Función</th>' + Object.keys(PERMS).map(function (r) { return '<th>' + r + '</th>'; }).join('') + '<th>Ciudadano</th></tr></thead><tbody>' +
      Object.keys(modules).map(function (k) { return '<tr><td>' + modules[k] + '</td>' + Object.keys(PERMS).map(function (r) { return '<td>' + (PERMS[r].indexOf(k) >= 0 ? '✔' : '—') + '</td>'; }).join('') + '<td>—</td></tr>'; }).join('') + '</tbody></table></div>';
  }

  function tabExport(body) {
    if (!can('export')) return;
    body.innerHTML = '<p class="muted" style="margin-bottom:14px">Se exportan <strong>solo datos agregados</strong> (sin datos personales, sin fotografías ni textos libres).</p>' +
      '<div class="row"><button class="btn btn-primary" id="x-rep" type="button">' + icon('download', 16) + ' Reportes por cantón, categoría y estado (CSV)</button>' +
      '<button class="btn btn-outline" id="x-sv" type="button">' + icon('download', 16) + ' Resultados agregados de encuestas (CSV)</button></div>';
    UI.$('#x-rep').addEventListener('click', function () {
      if (!can('export')) return;
      var rows = [['canton', 'categoria', 'estado', 'cantidad']], reps = Store.allReports();
      DATA.CANTONS.forEach(function (c) { DATA.CATEGORIES.forEach(function (k) { DATA.STATUSES.forEach(function (s, i) {
        var n = reps.filter(function (r) { return r.canton === c.id && r.category === k.id && r.status === i; }).length; if (n) rows.push([c.name, k.name, s, n]);
      }); }); });
      UI.csv(rows, 'reportes_agregados.csv'); Store.log('Exportación CSV: reportes agregados');
    });
    UI.$('#x-sv').addEventListener('click', function () {
      if (!can('export')) return;
      var rows = [['encuesta', 'pregunta', 'opcion', 'respuestas', 'total_respuestas_encuesta', 'datos_demo_incluidos']];
      Store.allSurveys().forEach(function (s) {
        var rs = Store.responsesFor(s.id);
        s.questions.forEach(function (q) { q.options.forEach(function (o) {
          rows.push([s.title, q.text, o[1], rs.filter(function (r) { return (r.answers[q.id] || []).indexOf(o[0]) >= 0; }).length, rs.length, s.demo ? 'sí' : 'no']);
        }); });
      });
      UI.csv(rows, 'encuestas_agregadas.csv'); Store.log('Exportación CSV: encuestas agregadas');
    });
  }

  function tabAudit(body) {
    if (!can('audit')) return;
    var log = Store.state.audit;
    body.innerHTML = log.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Fecha y hora</th><th>Rol</th><th>Acción</th></tr></thead><tbody>' +
      log.map(function (l) { return '<tr><td>' + new Date(l.ts).toLocaleString('es-EC') + '</td><td>' + UI.esc(l.role) + '</td><td>' + UI.esc(l.action) + '</td></tr>'; }).join('') + '</tbody></table></div>' :
      '<p class="muted">Aún no hay registros.</p>';
  }
})();
