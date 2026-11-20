/* ==========================================================
   ROUTER (hash) y arranque
   Rutas: #/ , #/encuestas , #/encuestas/sv1 , #/mapa , ...
   ========================================================== */
(function () {
  window.Pages = window.Pages || {};

  var TITLES = {
    '': 'Inicio', encuestas: 'Encuestas', mapa: 'Mapa interactivo', reportes: 'Reportes ciudadanos',
    observatorio: 'Observatorio', proyectos: 'Proyectos y propuestas', emprendedores: 'Emprendedores',
    presupuesto: 'Presupuesto participativo', admin: 'Panel administrativo', privacidad: 'Privacidad',
  };

  function route() {
    var hash = location.hash.replace(/^#\/?/, '');
    var parts = hash.split('/').filter(Boolean);
    var name = parts[0] || '';
    var params = parts.slice(1).map(decodeURIComponent);
    var root = document.getElementById('app');

    UI.cleanup();
    var page = window.Pages[name || 'home'];
    if (!page) { page = window.Pages.notfound; name = '404'; }

    root.innerHTML = '';
    try { page(root, params); }
    catch (err) {
      console.error(err);
      root.innerHTML = '<div class="container section"><div class="notice err">Ocurrió un error al cargar esta página. Recarga e inténtalo de nuevo.</div></div>';
    }

    document.title = (TITLES[name] || 'Página no encontrada') + ' · ' + CONFIG.appName;
    UI.$$('.site-nav a[data-route]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === name);
    });
    document.getElementById('nav').classList.remove('open');
    document.getElementById('nav-toggle').setAttribute('aria-expanded', 'false');
    window.scrollTo(0, 0);
    UI.reveal(root);
    UI.counters(root);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!CONFIG.demoMode) { var bar = document.getElementById('demo-bar'); if (bar) bar.remove(); }
    document.getElementById('year').textContent = new Date().getFullYear();
    var btn = document.getElementById('nav-toggle'), nav = document.getElementById('nav');
    btn.innerHTML = icon('menu', 24);
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.innerHTML = icon(open ? 'x' : 'menu', 24);
    });
    UI.$$('[data-icon]').forEach(function (el) { el.innerHTML = icon(el.getAttribute('data-icon'), Number(el.getAttribute('data-size')) || 22); });
    window.addEventListener('hashchange', route);
    route();
  });
})();
