/* ==========================================================
   CATÁLOGOS Y DATOS DE DEMOSTRACIÓN
   Todo lo generado aquí es FICTICIO (is_demo = true).
   No representa ciudadanos reales ni estadísticas oficiales.
   ========================================================== */
(function () {
  // ---------- Catálogos ----------
  // Las coordenadas "ref" son puntos APROXIMADOS de las cabeceras cantonales,
  // usados solo para ubicar datos DEMO. No son límites territoriales.
  // Pendiente: reemplazar por cartografía oficial verificada (IGM/INEC/GAD).
  var CANTONS = [
    { id: 'santa-elena', name: 'Santa Elena', ref: [-2.2267, -80.859] },
    { id: 'la-libertad', name: 'La Libertad', ref: [-2.2333, -80.9083] },
    { id: 'salinas', name: 'Salinas', ref: [-2.2167, -80.9583] },
  ];

  var CATEGORIES = [
    { id: 'agua', name: 'Agua potable', icon: 'droplets', color: '#0ea5e9' },
    { id: 'alcantarillado', name: 'Alcantarillado', icon: 'waves', color: '#6366f1' },
    { id: 'vialidad', name: 'Vialidad', icon: 'route', color: '#f59e0b' },
    { id: 'seguridad', name: 'Seguridad', icon: 'shield-alert', color: '#ef4444' },
    { id: 'salud', name: 'Salud', icon: 'heart-pulse', color: '#ec4899' },
    { id: 'educacion', name: 'Educación', icon: 'graduation-cap', color: '#8b5cf6' },
    { id: 'empleo', name: 'Empleo', icon: 'briefcase', color: '#14b8a6' },
    { id: 'turismo', name: 'Turismo', icon: 'tree-palm', color: '#f97316' },
    { id: 'agricultura', name: 'Agricultura', icon: 'sprout', color: '#84cc16' },
    { id: 'pesca', name: 'Pesca', icon: 'fish', color: '#0284c7' },
    { id: 'ambiente', name: 'Medioambiente', icon: 'leaf', color: '#16a34a' },
  ];

  var STATUSES = ['Recibido', 'En revisión', 'Validado', 'Derivado', 'Atendido'];
  var ROLES = ['Administrador', 'Editor', 'Moderador', 'Analista', 'Ciudadano'];
  var ACTIVITIES = ['Gastronomía', 'Artesanías', 'Turismo', 'Pesca y mariscos', 'Agricultura', 'Comercio', 'Servicios', 'Tecnología'];

  function byId(list, id) { return list.find(function (x) { return x.id === id; }); }

  // ---------- Generador pseudoaleatorio determinista ----------
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pickWeighted(r, weights) {
    var total = weights.reduce(function (a, b) { return a + b; }, 0), x = r() * total, acc = 0;
    for (var i = 0; i < weights.length; i++) { acc += weights[i]; if (x < acc) return i; }
    return weights.length - 1;
  }

  // ---------- Encuestas ----------
  var SURVEYS = [
    {
      id: 'sv1', title: 'Prioridades de servicios básicos en tu sector',
      description: 'Queremos conocer qué servicios deberían atenderse primero en tu comunidad.',
      opens: '2026-10-01', closes: '2026-12-31', demo: true, openSample: true,
      method: 'Encuesta abierta y voluntaria de autoselección. Refleja la opinión de quienes participaron; no es una muestra probabilística ni representativa de la población provincial.',
      questions: [
        { id: 'q1', text: '¿Cuál es el principal problema de tu sector?', type: 'single',
          options: [['o1', 'Agua potable'], ['o2', 'Alcantarillado'], ['o3', 'Vialidad'], ['o4', 'Seguridad'], ['o5', 'Salud']] },
        { id: 'q2', text: '¿Qué servicios te gustaría que se mejoren primero? (puedes elegir varios)', type: 'multiple',
          options: [['o1', 'Distribución de agua'], ['o2', 'Recolección de basura'], ['o3', 'Alumbrado público'], ['o4', 'Calles y veredas'], ['o5', 'Centros de salud']] },
      ],
      weights: { q1: [38, 18, 20, 16, 8], q2: [34, 22, 24, 30, 18] }, n: 142,
    },
    {
      id: 'sv2', title: 'Turismo y empleo local',
      description: 'Opina sobre oportunidades económicas ligadas al turismo y a los emprendimientos de la costa.',
      opens: '2026-11-01', closes: '2026-12-15', demo: true, openSample: true,
      method: 'Encuesta abierta y voluntaria. Los resultados son indicativos y no estadísticamente representativos.',
      questions: [
        { id: 'q1', text: '¿Qué actividad debería impulsarse con más fuerza?', type: 'single',
          options: [['o1', 'Turismo comunitario'], ['o2', 'Pesca artesanal'], ['o3', 'Agricultura'], ['o4', 'Comercio y servicios'], ['o5', 'Tecnología']] },
        { id: 'q2', text: '¿Qué apoyo necesitan más los emprendedores?', type: 'multiple',
          options: [['o1', 'Capacitación'], ['o2', 'Crédito accesible'], ['o3', 'Promoción y ferias'], ['o4', 'Trámites más simples']] },
      ],
      weights: { q1: [34, 24, 14, 18, 10], q2: [30, 36, 28, 26] }, n: 96,
    },
    {
      id: 'sv3', title: 'Cuidado de playas y medioambiente (cerrada)',
      description: 'Consulta de ejemplo ya finalizada, para mostrar encuestas cerradas.',
      opens: '2026-08-01', closes: '2026-10-31', demo: true, openSample: true,
      method: 'Encuesta abierta y voluntaria. Resultados indicativos, no representativos.',
      questions: [
        { id: 'q1', text: '¿Qué acción ambiental es más urgente?', type: 'single',
          options: [['o1', 'Limpieza de playas'], ['o2', 'Manejo de residuos'], ['o3', 'Protección de manglares'], ['o4', 'Educación ambiental']] },
      ],
      weights: { q1: [30, 34, 20, 16] }, n: 120,
    },
  ];

  function genSurveyResponses() {
    var out = [];
    SURVEYS.forEach(function (s, si) {
      var r = rng(100 + si);
      for (var i = 0; i < s.n; i++) {
        var answers = {};
        s.questions.forEach(function (q) {
          var w = s.weights[q.id];
          if (q.type === 'single') answers[q.id] = [q.options[pickWeighted(r, w)][0]];
          else {
            var chosen = [];
            q.options.forEach(function (o, k) { if (r() * 100 < w[k]) chosen.push(o[0]); });
            if (!chosen.length) chosen.push(q.options[pickWeighted(r, w)][0]);
            answers[q.id] = chosen;
          }
        });
        var c = CANTONS[pickWeighted(r, [34, 42, 24])].id;
        out.push({ surveyId: s.id, canton: c, answers: answers, ts: '2026-' + ('0' + (8 + Math.floor(r() * 3))).slice(-2) + '-' + ('0' + (1 + Math.floor(r() * 27))).slice(-2), demo: true });
      }
    });
    return out;
  }

  // ---------- Reportes ciudadanos ----------
  var REPORT_TEXTS = {
    agua: ['Corte de agua frecuente en el sector.', 'Baja presión de agua durante varios días.'],
    alcantarillado: ['Aguas servidas en la calle.', 'Alcantarilla tapada tras las lluvias.'],
    vialidad: ['Bache grande en la vía principal.', 'Calle sin señalización ni mantenimiento.'],
    seguridad: ['Falta de iluminación en la cancha.', 'Se solicita mayor presencia de patrullaje.'],
    salud: ['Centro de salud sin medicinas básicas.', 'Se requiere más personal médico.'],
    educacion: ['Aulas con goteras en la escuela.', 'Falta de conectividad a internet en el colegio.'],
    empleo: ['Se requiere capacitación laboral para jóvenes.', 'Pocas ofertas de trabajo en la zona.'],
    turismo: ['Falta de señalética turística.', 'Baños públicos deteriorados en la playa.'],
    agricultura: ['Canal de riego dañado.', 'Se solicita asistencia técnica para cultivos.'],
    pesca: ['Muelle artesanal requiere mantenimiento.', 'Falta de cadena de frío para la pesca.'],
    ambiente: ['Acumulación de basura en la playa.', 'Quema de desechos en terreno baldío.'],
  };

  function genReports() {
    var r = rng(7), out = [];
    var catW = [16, 10, 14, 11, 8, 6, 7, 8, 5, 6, 9];
    for (var i = 0; i < 90; i++) {
      var cat = CATEGORIES[pickWeighted(r, catW)];
      var cn = CANTONS[pickWeighted(r, [34, 40, 26])];
      var month = 6 + Math.floor(Math.pow(r(), 0.7) * 5.5);
      var day = 1 + Math.floor(r() * 27);
      var lat = cn.ref[0] + (r() - 0.5) * 0.045, lng = cn.ref[1] + (r() - 0.5) * 0.06;
      var texts = REPORT_TEXTS[cat.id];
      out.push({
        id: 'DEMO-' + (1000 + i), code: 'DEMO-' + (1000 + i), category: cat.id, canton: cn.id,
        description: texts[Math.floor(r() * texts.length)] + ' (ejemplo ficticio)',
        lat: +lat.toFixed(5), lng: +lng.toFixed(5),
        date: '2026-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2),
        status: Math.min(4, Math.floor(r() * r() * 5.4)), demo: true, photos: [],
      });
    }
    return out;
  }

  // ---------- Proyectos y propuestas ----------
  var PROJECT_KINDS = ['Propuesta ciudadana', 'Proyecto en estudio', 'Proyecto institucional aprobado'];
  var PROJECTS = [
    { id: 'p1', name: 'Mejora de espacios públicos comunitarios', kind: 0, sector: 'Medioambiente', canton: 'santa-elena',
      description: 'Rehabilitación de parques y áreas verdes con participación de comités barriales.',
      objective: 'Ampliar espacios seguros de recreación y encuentro.', beneficiaries: 4200, cost: 185000,
      funding: 'Por definir (aporte municipal y cooperación)', institution: 'GAD Municipal', evaluation: 'Pendiente de evaluación' },
    { id: 'p2', name: 'Ruta turística comunitaria', kind: 1, sector: 'Turismo', canton: 'salinas',
      description: 'Circuito de visita a emprendimientos locales con señalética y capacitación en servicio.',
      objective: 'Diversificar ingresos de familias vinculadas al turismo.', beneficiaries: 900, cost: 120000,
      funding: 'Presupuesto institucional + cooperación', institution: 'Ministerio de Turismo / GAD', evaluation: 'En evaluación técnica' },
    { id: 'p3', name: 'Capacitación a pescadores artesanales', kind: 2, sector: 'Pesca', canton: 'santa-elena',
      description: 'Talleres de manejo poscaptura, cadena de frío y comercialización.',
      objective: 'Mejorar la calidad y el precio de venta de la pesca.', beneficiaries: 650, cost: 64000,
      funding: 'Presupuesto institucional', institution: 'Viceministerio de Acuacultura y Pesca', evaluation: 'Aprobado' },
    { id: 'p4', name: 'Puntos de recolección diferenciada de residuos', kind: 0, sector: 'Medioambiente', canton: 'la-libertad',
      description: 'Instalación de contenedores y campañas de educación en barrios con alta generación.',
      objective: 'Reducir basura en calles y playas.', beneficiaries: 15000, cost: 98000,
      funding: 'Por definir', institution: 'GAD Municipal', evaluation: 'Pendiente de evaluación' },
    { id: 'p5', name: 'Mantenimiento de canales de riego', kind: 1, sector: 'Agricultura', canton: 'santa-elena',
      description: 'Limpieza y reparación de canales para pequeños productores.',
      objective: 'Garantizar riego durante la temporada seca.', beneficiaries: 1100, cost: 210000,
      funding: 'Presupuesto institucional', institution: 'Gobierno Provincial / MAG', evaluation: 'En estudio de factibilidad' },
    { id: 'p6', name: 'Alumbrado LED en sectores prioritarios', kind: 2, sector: 'Seguridad', canton: 'la-libertad',
      description: 'Cambio de luminarias en calles y canchas identificadas por los reportes.',
      objective: 'Aumentar la seguridad y la eficiencia energética.', beneficiaries: 8000, cost: 340000,
      funding: 'Presupuesto institucional', institution: 'Empresa eléctrica / GAD', evaluation: 'Aprobado' },
    { id: 'p7', name: 'Aulas digitales para colegios rurales', kind: 1, sector: 'Educación', canton: 'santa-elena',
      description: 'Conectividad y equipos básicos para instituciones con baja cobertura.',
      objective: 'Reducir la brecha digital estudiantil.', beneficiaries: 2300, cost: 150000,
      funding: 'Cooperación + presupuesto institucional', institution: 'Ministerio de Educación', evaluation: 'En evaluación técnica' },
    { id: 'p8', name: 'Feria mensual de emprendedores', kind: 0, sector: 'Empleo', canton: 'salinas',
      description: 'Espacio fijo para promocionar productos locales en temporada alta y baja.',
      objective: 'Aumentar ventas de emprendimientos locales.', beneficiaries: 500, cost: 18000,
      funding: 'Aporte municipal y privado', institution: 'GAD Municipal', evaluation: 'Pendiente de evaluación' },
  ];

  // ---------- Presupuesto participativo (propuestas consultivas) ----------
  var BUDGET = [
    { id: 'b1', name: 'Parque lineal con juegos infantiles', canton: 'la-libertad', cost: 95000, beneficiaries: 3500, votes: 128, demo: true },
    { id: 'b2', name: 'Reparación de la vía de acceso a la comuna', canton: 'santa-elena', cost: 240000, beneficiaries: 2800, votes: 164, demo: true },
    { id: 'b3', name: 'Cámaras de seguridad comunitarias', canton: 'salinas', cost: 70000, beneficiaries: 5200, votes: 97, demo: true },
    { id: 'b4', name: 'Planta de tratamiento de aguas residuales (estudio)', canton: 'santa-elena', cost: 120000, beneficiaries: 9000, votes: 143, demo: true },
    { id: 'b5', name: 'Centro de capacitación para emprendedores', canton: 'la-libertad', cost: 85000, beneficiaries: 1200, votes: 76, demo: true },
  ];

  // ---------- Emprendedores (ficticios) ----------
  var ENTREPRENEURS = [
    { id: 'e1', name: 'Artesanías El Faro', activity: 'Artesanías', canton: 'salinas', description: 'Objetos decorativos con conchas y materiales reciclados.', contact: '', demo: true },
    { id: 'e2', name: 'Cevichería Mar Azul', activity: 'Gastronomía', canton: 'santa-elena', description: 'Mariscos frescos y platos de la costa.', contact: '', demo: true },
    { id: 'e3', name: 'Pesca Directa del Puerto', activity: 'Pesca y mariscos', canton: 'santa-elena', description: 'Venta de pesca fresca de pescadores locales.', contact: '', demo: true },
    { id: 'e4', name: 'Huerto Seco', activity: 'Agricultura', canton: 'santa-elena', description: 'Hortalizas resistentes a clima seco, sin agroquímicos.', contact: '', demo: true },
    { id: 'e5', name: 'Tours Costa Viva', activity: 'Turismo', canton: 'salinas', description: 'Recorridos guiados por comunidades y miradores.', contact: '', demo: true },
    { id: 'e6', name: 'Digital Costa', activity: 'Tecnología', canton: 'la-libertad', description: 'Páginas web y marketing para negocios pequeños.', contact: '', demo: true },
    { id: 'e7', name: 'Tienda Mi Barrio', activity: 'Comercio', canton: 'la-libertad', description: 'Abarrotes y productos de primera necesidad.', contact: '', demo: true },
    { id: 'e8', name: 'Lavandería Brisa', activity: 'Servicios', canton: 'la-libertad', description: 'Lavado y planchado para hogares y hospedajes.', contact: '', demo: true },
  ];

  var NEWS = [
    { id: 'n1', title: 'Lanzamiento de la plataforma en versión DEMO', date: '2026-11-18', excerpt: 'Presentamos la primera versión tecnológica de Santa Elena Participa.' },
    { id: 'n2', title: 'Jornada comunitaria de ejemplo', date: '2026-11-25', excerpt: 'Actividad ficticia para ilustrar la sección de noticias y eventos.' },
    { id: 'n3', title: 'Taller sobre participación ciudadana (ejemplo)', date: '2026-12-02', excerpt: 'Evento de muestra para la agenda comunitaria.' },
  ];

  var DEMO_USERS = [
    { name: 'Usuario demo 1', email: 'admin@demo.local', role: 'Administrador' },
    { name: 'Usuario demo 2', email: 'editor@demo.local', role: 'Editor' },
    { name: 'Usuario demo 3', email: 'moderador@demo.local', role: 'Moderador' },
    { name: 'Usuario demo 4', email: 'analista@demo.local', role: 'Analista' },
  ];

  window.DATA = {
    CANTONS: CANTONS, CATEGORIES: CATEGORIES, STATUSES: STATUSES, ROLES: ROLES, ACTIVITIES: ACTIVITIES,
    SURVEYS: SURVEYS, PROJECT_KINDS: PROJECT_KINDS, PROJECTS: PROJECTS, BUDGET: BUDGET,
    ENTREPRENEURS: ENTREPRENEURS, NEWS: NEWS, DEMO_USERS: DEMO_USERS,
    SEED_RESPONSES: genSurveyResponses(), SEED_REPORTS: genReports(),
    cantonName: function (id) { var c = byId(CANTONS, id); return c ? c.name : id; },
    category: function (id) { return byId(CATEGORIES, id) || { name: id, color: '#64748b', icon: 'map-pin' }; },
  };
})();
