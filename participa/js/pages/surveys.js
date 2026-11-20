/* MÓDULO A: Encuestas ciudadanas */
(function () {
  var statusTag = { Abierta: 'tag-leaf', Cerrada: 'tag', 'Próxima': 'tag-amber' };

  function list(root) {
    var surveys = Store.allSurveys();
    root.innerHTML = UI.pageHead('Encuestas ciudadanas', 'Participa, consulta resultados y conoce la metodología de cada encuesta.') +
      '<div class="container page-body"><div class="notice info" style="margin-bottom:16px">' + icon('info', 18) +
      '<span>Las encuestas abiertas son de autoselección: reflejan la opinión de quienes participan y <strong>no son muestras estadísticamente representativas</strong> de la provincia.</span></div>' +
      '<div class="grid grid-2">' + surveys.map(function (s) {
        var st = Store.surveyStatus(s), n = Store.responsesFor(s.id).length;
        return '<article class="card hover"><div class="row between"><span class="tag ' + statusTag[st] + '">' + st + '</span>' + (s.demo ? UI.badge('demo') : '<span class="tag">Registrada en este navegador</span>') + '</div>' +
          '<h3 style="margin-top:12px;font-size:19px">' + UI.esc(s.title) + '</h3><p class="muted" style="margin-top:6px">' + UI.esc(s.description) + '</p>' +
          '<p class="small muted" style="margin-top:10px">' + icon('calendar-days', 14) + ' ' + UI.date(s.opens) + ' → ' + UI.date(s.closes) + ' · ' + UI.num(n) + ' respuestas</p>' +
          '<div class="row" style="margin-top:14px"><a class="btn btn-primary" href="#/encuestas/' + s.id + '">' + (st === 'Abierta' && !Store.hasAnswered(s.id) ? 'Responder' : 'Ver resultados') + '</a></div></article>';
      }).join('') + '</div></div>';
  }

  function questionHtml(q, idx) {
    var type = q.type === 'single' ? 'radio' : 'checkbox';
    return '<fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label">' + (idx + 1) + '. ' + UI.esc(q.text) + '</legend><div class="checks">' +
      q.options.map(function (o) {
        return '<label class="check"><input type="' + type + '" name="' + q.id + '" value="' + o[0] + '"><span>' + UI.esc(o[1]) + '</span></label>';
      }).join('') + '</div></fieldset>';
  }

  function resultsHtml(s, canton) {
    var all = Store.responsesFor(s.id);
    var rs = canton ? all.filter(function (r) { return r.canton === canton; }) : all;
    var n = rs.length;
    if (canton && n < CONFIG.minSampleForFilter) {
      return '<div class="notice">' + icon('info', 18) + '<span>Hay solo ' + n + ' respuestas en ' + UI.esc(DATA.cantonName(canton)) + '. Por criterio metodológico no se muestran resultados con menos de ' + CONFIG.minSampleForFilter + ' respuestas.</span></div>';
    }
    return '<p class="small muted">Respuestas consideradas: <strong>' + UI.num(n) + '</strong>' + (canton ? ' (cantón ' + UI.esc(DATA.cantonName(canton)) + ')' : ' (todos los cantones y respuestas sin cantón indicado)') + '</p>' +
      s.questions.map(function (q, i) {
        var counts = {}; q.options.forEach(function (o) { counts[o[0]] = 0; });
        rs.forEach(function (r) { (r.answers[q.id] || []).forEach(function (a) { if (a in counts) counts[a]++; }); });
        var max = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; }).concat([1]));
        return '<div style="margin-top:22px"><h4 style="font-size:16px">' + (i + 1) + '. ' + UI.esc(q.text) + '</h4>' +
          q.options.map(function (o) {
            var c = counts[o[0]], p = UI.pct(c, n);
            return '<div class="bar-row"><div class="meta"><span>' + UI.esc(o[1]) + '</span><span><strong>' + p + '%</strong> · ' + UI.num(c) + '</span></div>' +
              '<div class="bar" role="img" aria-label="' + UI.esc(o[1]) + ': ' + p + '%"><i style="width:' + (c / max) * 100 + '%"></i></div></div>';
          }).join('') + '</div>';
      }).join('');
  }

  function detail(root, id) {
    var s = Store.getSurvey(id);
    if (!s) return Pages.notfound(root);
    var st = Store.surveyStatus(s), answered = Store.hasAnswered(s.id);
    var canParticipate = st === 'Abierta' && !answered;

    root.innerHTML = UI.pageHead(UI.esc(s.title), UI.esc(s.description)) +
      '<div class="container page-body"><p style="margin-bottom:14px"><a class="btn btn-outline btn-sm" href="#/encuestas">← Volver a encuestas</a></p>' +
      '<div class="grid" style="grid-template-columns:1fr;gap:18px">' +
      '<div class="card"><div class="row between"><span class="tag ' + statusTag[st] + '">' + st + '</span>' + (s.demo ? UI.badge('demo') : '') + '</div>' +
      '<p class="small muted" style="margin-top:10px">' + icon('calendar-days', 14) + ' Abre ' + UI.date(s.opens) + ' · Cierra ' + UI.date(s.closes) + '</p>' +
      '<div class="notice info" style="margin-top:12px">' + icon('info', 18) + '<span><strong>Metodología:</strong> ' + UI.esc(s.method || 'Encuesta abierta y voluntaria; resultados no representativos.') + '</span></div></div>' +

      (canParticipate ? '<form class="card form-grid" id="survey-form" novalidate><h3 style="font-size:20px">Participar</h3>' +
        '<div class="field"><label for="sv-canton">Cantón donde vives (opcional)</label><select class="input" id="sv-canton">' + UI.options(DATA.CANTONS, '', true, 'Prefiero no indicarlo') + '</select><p class="hint">Se usa solo para estadísticas agregadas.</p></div>' +
        s.questions.map(questionHtml).join('') +
        '<div class="hp" aria-hidden="true"><label>No llenar este campo<input type="text" id="sv-hp" tabindex="-1" autocomplete="off"></label></div>' +
        '<label class="check"><input type="checkbox" id="sv-consent"><span>Acepto participar voluntariamente y el tratamiento de mi respuesta de forma anónima y agregada, según la <a href="#/privacidad" style="text-decoration:underline">política de privacidad</a>.</span></label>' +
        '<div id="sv-error" class="notice err" style="display:none" role="alert"></div>' +
        '<div><button class="btn btn-primary" type="submit">Enviar respuestas</button></div></form>'
        : '<div class="notice ' + (answered ? 'ok' : '') + '">' + icon('circle-check', 18) + '<span>' +
          (answered ? 'Ya participaste en esta encuesta desde este dispositivo. ¡Gracias!' : st === 'Cerrada' ? 'Esta encuesta está cerrada. Puedes consultar sus resultados.' : 'Esta encuesta aún no está abierta.') + '</span></div>') +

      '<div class="card"><div class="row between"><h3 style="font-size:20px">Resultados</h3>' +
      '<div class="row"><div class="field" style="min-width:190px"><label class="sr-only" for="sv-filter">Filtrar por cantón</label><select class="input" id="sv-filter">' + UI.options(DATA.CANTONS, '', true, 'Todos los cantones') + '</select></div>' +
      '<button class="btn btn-outline btn-sm" id="sv-share" type="button">Compartir</button></div></div>' +
      '<div id="sv-results">' + resultsHtml(s, '') + '</div></div></div></div>';

    var t0 = Date.now();
    UI.$('#sv-filter').addEventListener('change', function (e) { UI.$('#sv-results').innerHTML = resultsHtml(s, e.target.value); });
    UI.$('#sv-share').addEventListener('click', function () {
      var url = location.href;
      if (navigator.share) navigator.share({ title: s.title, url: url }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { UI.toast('Enlace copiado.'); });
      else UI.toast(url);
    });

    var form = UI.$('#survey-form');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = UI.$('#sv-error'); err.style.display = 'none';
      function fail(m) { err.textContent = m; err.style.display = 'flex'; err.scrollIntoView({ block: 'center' }); }

      // Anti-bots: campo trampa + tiempo mínimo de lectura
      if (UI.$('#sv-hp').value) return;
      if (Date.now() - t0 < 3000) return fail('Responde con calma: espera unos segundos antes de enviar.');
      if (Store.hasAnswered(s.id)) return fail('Ya participaste en esta encuesta desde este dispositivo.');
      if (Store.surveyStatus(s) !== 'Abierta') return fail('La encuesta no está abierta.');

      var answers = {};
      for (var i = 0; i < s.questions.length; i++) {
        var q = s.questions[i];
        var sel = UI.$$('input[name="' + q.id + '"]:checked', form).map(function (x) { return x.value; });
        if (!sel.length) return fail('Responde la pregunta ' + (i + 1) + '.');
        // Validar que las opciones existan (evita valores manipulados)
        var valid = q.options.map(function (o) { return o[0]; });
        if (sel.some(function (v) { return valid.indexOf(v) < 0; })) return fail('Respuesta no válida.');
        answers[q.id] = sel;
      }
      if (!UI.$('#sv-consent').checked) return fail('Debes aceptar el consentimiento informado para participar.');

      var ok = Store.addResponse({ surveyId: s.id, canton: UI.$('#sv-canton').value || '', answers: answers, ts: new Date().toISOString(), demo: false });
      if (ok) { UI.toast('¡Gracias por participar!'); detail(root, id); window.scrollTo(0, 0); }
    });
  }

  Pages.encuestas = function (root, params) { return params[0] ? detail(root, params[0]) : list(root); };
})();
