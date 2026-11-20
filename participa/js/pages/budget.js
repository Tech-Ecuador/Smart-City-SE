/* MÓDULO G: Presupuesto participativo (consultivo) */
(function () {
  Pages.presupuesto = function (root) {
    root.innerHTML = UI.pageHead('Presupuesto participativo', 'Presenta propuestas ciudadanas y consulta las prioridades de la comunidad.') +
      '<div class="container page-body"><div class="notice" style="margin-bottom:16px">' + icon('info', 18) + '<span><strong>Importante:</strong> las votaciones son <strong>consultivas</strong>. Los resultados de esta plataforma <strong>no constituyen una asignación presupuestaria oficial</strong>. Datos DEMO.</span></div>' +
      '<div class="grid grid-4" id="b-kpis"></div>' +
      '<div class="card filters" style="margin:16px 0"><div class="field"><label for="b-canton">Cantón</label><select class="input" id="b-canton">' + UI.options(DATA.CANTONS, '', true, 'Todos') + '</select></div></div>' +
      '<div class="grid grid-2" id="b-list"></div>' +
      '<form class="card form-grid" id="b-form" style="margin-top:24px" novalidate><h3 style="font-size:20px">Presentar una propuesta</h3>' +
      '<div class="grid grid-2"><div class="field"><label for="n-name">Nombre de la propuesta *</label><input class="input" id="n-name" maxlength="100"></div>' +
      '<div class="field"><label for="n-canton">Cantón *</label><select class="input" id="n-canton">' + UI.options(DATA.CANTONS, '', true, 'Selecciona') + '</select></div>' +
      '<div class="field"><label for="n-cost">Costo estimado (USD) *</label><input class="input" id="n-cost" type="number" min="1" max="100000000" step="1"></div>' +
      '<div class="field"><label for="n-ben">Beneficiarios potenciales *</label><input class="input" id="n-ben" type="number" min="1" max="1000000" step="1"></div></div>' +
      '<div class="field"><label for="n-desc">Descripción *</label><textarea class="input" id="n-desc" maxlength="400"></textarea></div>' +
      '<div class="hp" aria-hidden="true"><label>No llenar<input type="text" id="n-hp" tabindex="-1" autocomplete="off"></label></div>' +
      '<label class="check"><input type="checkbox" id="n-consent"><span>Acepto la <a href="#/privacidad" style="text-decoration:underline">política de privacidad</a>.</span></label>' +
      '<div id="n-error" class="notice err" style="display:none" role="alert"></div>' +
      '<div><button class="btn btn-primary" type="submit">Enviar propuesta</button></div></form></div>';

    function render() {
      var canton = UI.$('#b-canton').value;
      var all = Store.allBudget();
      var items = all.filter(function (p) { return !canton || p.canton === canton; }).sort(function (a, b) { return b.votes - a.votes; });
      var totalVotes = items.reduce(function (a, p) { return a + p.votes; }, 0), max = Math.max.apply(null, items.map(function (p) { return p.votes; }).concat([1]));
      UI.$('#b-kpis').innerHTML = [['Propuestas recibidas', items.length], ['Votos consultivos', totalVotes],
        ['Costo estimado total (USD)', items.reduce(function (a, p) { return a + p.cost; }, 0)], ['Beneficiarios potenciales', items.reduce(function (a, p) { return a + p.beneficiaries; }, 0)]]
        .map(function (k) { return '<div class="card stat"><div class="top"><span></span>' + UI.badge('demo') + '</div><p class="num" style="font-size:30px">' + UI.num(k[1]) + '</p><p class="lbl">' + k[0] + '</p></div>'; }).join('');

      UI.$('#b-list').innerHTML = items.map(function (p, i) {
        var voted = Store.state.votes[p.id];
        return '<article class="card"><div class="row between"><span class="tag tag-turq">#' + (i + 1) + ' · ' + UI.esc(DATA.cantonName(p.canton)) + '</span>' + (p.demo === false ? '<span class="tag">Nueva</span>' : UI.badge('demo')) + '</div>' +
          '<h3 style="margin-top:10px;font-size:18px">' + UI.esc(p.name) + '</h3>' + (p.description ? '<p class="muted small" style="margin-top:4px">' + UI.esc(p.description) + '</p>' : '') +
          '<p class="small" style="margin-top:8px">Costo estimado: <strong>' + UI.money(p.cost) + '</strong> · Beneficiarios: <strong>' + UI.num(p.beneficiaries) + '</strong></p>' +
          '<div class="bar-row"><div class="meta"><span>Votos consultivos</span><span><strong>' + UI.num(p.votes) + '</strong> · ' + UI.pct(p.votes, totalVotes) + '%</span></div><div class="bar"><i style="width:' + (p.votes / max) * 100 + '%"></i></div></div>' +
          '<button class="btn ' + (voted ? 'btn-outline' : 'btn-primary') + ' btn-sm" style="margin-top:14px" data-vote="' + UI.esc(p.id) + '"' + (voted ? ' disabled' : '') + '>' + (voted ? 'Ya votaste' : 'Votar (consultivo)') + '</button></article>';
      }).join('') || '<p class="muted">No hay propuestas para este filtro.</p>';
    }

    UI.$('#b-canton').addEventListener('change', render);
    UI.$('#b-list').addEventListener('click', function (e) {
      var b = e.target.closest('[data-vote]'); if (!b) return;
      if (Store.vote(b.getAttribute('data-vote'))) { UI.toast('Voto consultivo registrado en este dispositivo.'); render(); }
      else UI.toast('Ya votaste por esta propuesta.', true);
    });

    var t0 = Date.now();
    UI.$('#b-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var err = UI.$('#n-error'); err.style.display = 'none';
      function fail(m) { err.textContent = m; err.style.display = 'flex'; }
      if (UI.$('#n-hp').value) return;
      if (Date.now() - t0 < 4000) return fail('Espera unos segundos antes de enviar.');
      var name = UI.$('#n-name').value.trim(), canton = UI.$('#n-canton').value, cost = Number(UI.$('#n-cost').value), ben = Number(UI.$('#n-ben').value), desc = UI.$('#n-desc').value.trim();
      if (name.length < 5) return fail('Ingresa el nombre de la propuesta.');
      if (!canton) return fail('Selecciona el cantón.');
      if (!(cost > 0) || !(ben > 0)) return fail('Ingresa costo y beneficiarios válidos.');
      if (desc.length < 15) return fail('Describe la propuesta (mínimo 15 caracteres).');
      if (!UI.$('#n-consent').checked) return fail('Debes aceptar el consentimiento informado.');
      if (Store.addBudgetProposal({ id: Store.uid('b'), name: name, canton: canton, cost: Math.round(cost), beneficiaries: Math.round(ben), description: desc, votes: 0, demo: false })) {
        UI.toast('Propuesta enviada.'); UI.$('#b-form').reset(); render();
      }
    });
    render();
  };
})();
