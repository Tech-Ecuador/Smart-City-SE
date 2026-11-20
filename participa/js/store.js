/* ==========================================================
   ALMACENAMIENTO LOCAL (localStorage)
   En esta versión estática los datos del usuario se guardan en su navegador.
   LIMITACIÓN: la prevención de duplicados funciona por dispositivo/navegador.
   La validación real (un voto por persona) requiere un servidor: ver Supabase.
   ========================================================== */
(function () {
  var KEY = 'sep_v1';

  function empty() {
    return {
      responses: [],      // respuestas a encuestas hechas en este navegador
      answered: {},       // {surveyId: timestamp} -> evita duplicados en este dispositivo
      reports: [],        // reportes ciudadanos creados aquí
      statusOverrides: {},// {code: statusIndex} (moderación)
      hiddenReports: {},  // {code: true}
      entrepreneurs: [],
      hiddenEntrepreneurs: {},
      budgetProposals: [],
      votes: {},          // {proposalId: true}
      surveysCreated: [],
      audit: [],
      admin: null,        // {role, since}
      consent: null,
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      var parsed = JSON.parse(raw), base = empty();
      for (var k in base) if (!(k in parsed)) parsed[k] = base[k];
      return parsed;
    } catch (e) { return empty(); }
  }

  var state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { UI && UI.toast('No se pudo guardar (almacenamiento lleno).', true); return false; }
  }

  function uid(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  var Store = {
    get state() { return state; },
    save: save,
    uid: uid,

    // ----- Encuestas -----
    allSurveys: function () { return DATA.SURVEYS.concat(state.surveysCreated); },
    getSurvey: function (id) { return this.allSurveys().find(function (s) { return s.id === id; }); },
    surveyStatus: function (s) {
      var t = new Date().toISOString().slice(0, 10);
      if (t < s.opens) return 'Próxima';
      if (t > s.closes) return 'Cerrada';
      return 'Abierta';
    },
    responsesFor: function (surveyId) {
      return DATA.SEED_RESPONSES.concat(state.responses).filter(function (r) { return r.surveyId === surveyId; });
    },
    hasAnswered: function (surveyId) { return !!state.answered[surveyId]; },
    addResponse: function (resp) {
      if (state.answered[resp.surveyId]) return false;
      state.responses.push(resp);
      state.answered[resp.surveyId] = new Date().toISOString();
      return save();
    },

    // ----- Reportes -----
    allReports: function () {
      var self = this;
      return DATA.SEED_REPORTS.concat(state.reports)
        .filter(function (r) { return !state.hiddenReports[r.code]; })
        .map(function (r) {
          var o = state.statusOverrides[r.code];
          return o === undefined ? r : Object.assign({}, r, { status: o });
        });
    },
    addReport: function (rep) { state.reports.push(rep); return save(); },
    setStatus: function (code, status) { state.statusOverrides[code] = status; save(); },
    hideReport: function (code) { state.hiddenReports[code] = true; save(); },
    findReport: function (code) {
      code = (code || '').trim().toUpperCase();
      return this.allReports().find(function (r) { return r.code.toUpperCase() === code; });
    },

    // ----- Emprendedores -----
    allEntrepreneurs: function () {
      return DATA.ENTREPRENEURS.concat(state.entrepreneurs).filter(function (e) { return !state.hiddenEntrepreneurs[e.id]; });
    },
    addEntrepreneur: function (e) { state.entrepreneurs.push(e); return save(); },
    hideEntrepreneur: function (id) { state.hiddenEntrepreneurs[id] = true; save(); },

    // ----- Presupuesto participativo -----
    allBudget: function () {
      return DATA.BUDGET.concat(state.budgetProposals).map(function (p) {
        return Object.assign({}, p, { votes: p.votes + (state.votes[p.id] ? 1 : 0) });
      });
    },
    addBudgetProposal: function (p) { state.budgetProposals.push(p); return save(); },
    vote: function (id) {
      if (state.votes[id]) return false;
      state.votes[id] = true; return save();
    },

    // ----- Admin y auditoría -----
    log: function (action) {
      state.audit.unshift({ ts: new Date().toISOString(), role: state.admin ? state.admin.role : 'Anónimo', action: action });
      state.audit = state.audit.slice(0, 200);
      save();
    },
    login: function (role) { state.admin = { role: role, since: new Date().toISOString() }; this.log('Inicio de sesión demo como ' + role); },
    logout: function () { this.log('Cierre de sesión'); state.admin = null; save(); },

    // ----- Datos personales -----
    eraseMyData: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      state = empty();
    },

    // ----- Estadísticas globales -----
    participationCount: function () {
      return DATA.SEED_RESPONSES.length + state.responses.length +
        Object.keys(state.votes).length + DATA.BUDGET.reduce(function (a, b) { return a + b.votes; }, 0);
    },
  };

  window.Store = Store;
})();
