/* ==========================================================
   UTILIDADES DE INTERFAZ
   ========================================================== */
(function () {
  var cleanups = [];

  var UI = {
    // Escapa texto para evitar XSS: SIEMPRE usar al insertar datos de usuarios.
    esc: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    $: function (sel, root) { return (root || document).querySelector(sel); },
    $$: function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); },

    money: function (n) { return '$' + Number(n).toLocaleString('es-EC'); },
    num: function (n) { return Number(n).toLocaleString('es-EC'); },
    date: function (iso) {
      var d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
      return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    pct: function (a, b) { return b ? Math.round((a / b) * 1000) / 10 : 0; },

    badge: function (kind) {
      var map = { demo: ['badge-demo', 'DEMO', 'Dato ficticio de demostración'], sim: ['badge-sim', 'SIMULACIÓN', 'Resultado simulado'], real: ['badge-real', 'DATO REAL', 'Dato verificado'] };
      var m = map[kind || 'demo'];
      return '<span class="badge ' + m[0] + '" title="' + m[2] + '">' + m[1] + '</span>';
    },

    head: function (eyebrow, title, subtitle, action) {
      return '<div class="section-head"><div>' +
        (eyebrow ? '<p class="eyebrow">' + eyebrow + '</p>' : '') +
        '<h2>' + title + '</h2>' + (subtitle ? '<p>' + subtitle + '</p>' : '') +
        '</div>' + (action || '') + '</div>';
    },

    pageHead: function (title, subtitle) {
      return '<section class="page-head"><div class="container"><h1>' + title + '</h1>' +
        (subtitle ? '<p>' + subtitle + '</p>' : '') + '</div></section>';
    },

    toast: function (msg, isErr) {
      var box = document.getElementById('toasts');
      var t = document.createElement('div');
      t.className = 'toast' + (isErr ? ' err' : '');
      t.setAttribute('role', 'status');
      t.textContent = msg;
      box.appendChild(t);
      setTimeout(function () { t.remove(); }, 4200);
    },

    // Registro de limpieza (mapas, gráficos) al cambiar de página
    onCleanup: function (fn) { cleanups.push(fn); },
    cleanup: function () {
      while (cleanups.length) { try { cleanups.pop()(); } catch (e) {} }
    },

    chart: function (canvas, config) {
      var c = new Chart(canvas, config);
      UI.onCleanup(function () { c.destroy(); });
      return c;
    },

    counters: function (root) {
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      UI.$$('[data-count]', root).forEach(function (el) {
        var target = Number(el.getAttribute('data-count'));
        if (reduce || !('IntersectionObserver' in window)) { el.textContent = UI.num(target); return; }
        var io = new IntersectionObserver(function (en) {
          if (!en[0].isIntersecting) return;
          io.disconnect();
          var t0 = performance.now();
          (function tick(now) {
            var p = Math.min((now - t0) / 1300, 1);
            el.textContent = UI.num(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
          // Respaldo por si el navegador no avanza la animación
          setTimeout(function () { el.textContent = UI.num(target); }, 2200);
        });
        io.observe(el);
        UI.onCleanup(function () { io.disconnect(); });
      });
    },

    reveal: function (root) {
      var els = UI.$$('.reveal', root);
      if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.1 });
      els.forEach(function (e) { io.observe(e); });
      setTimeout(function () { els.forEach(function (e) { e.classList.add('in'); }); }, 2500);
      UI.onCleanup(function () { io.disconnect(); });
    },

    // Lee y valida fotos: tipo, tamaño; las reduce para guardarlas en el navegador.
    readPhotos: function (files) {
      files = Array.prototype.slice.call(files || []);
      if (files.length > CONFIG.maxPhotos) return Promise.reject(new Error('Máximo ' + CONFIG.maxPhotos + ' fotografías.'));
      return Promise.all(files.map(function (f) {
        return new Promise(function (resolve, reject) {
          if (CONFIG.allowedPhotoTypes.indexOf(f.type) < 0) return reject(new Error('Formato no permitido (use JPG, PNG o WebP).'));
          if (f.size > CONFIG.maxPhotoBytes) return reject(new Error('Cada foto debe pesar menos de 4 MB.'));
          var fr = new FileReader();
          fr.onerror = function () { reject(new Error('No se pudo leer la imagen.')); };
          fr.onload = function () {
            var img = new Image();
            img.onerror = function () { reject(new Error('El archivo no es una imagen válida.')); };
            img.onload = function () {
              var max = 480, k = Math.min(1, max / Math.max(img.width, img.height));
              var c = document.createElement('canvas');
              c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
              c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); // re-codificar elimina metadatos EXIF
              resolve(c.toDataURL('image/jpeg', 0.72));
            };
            img.src = fr.result;
          };
          fr.readAsDataURL(f);
        });
      }));
    },

    csv: function (rows, filename) {
      var text = rows.map(function (r) {
        return r.map(function (v) {
          v = String(v == null ? '' : v);
          // Evita inyección de fórmulas en Excel
          if (/^[=+\-@]/.test(v)) v = "'" + v;
          return '"' + v.replace(/"/g, '""') + '"';
        }).join(',');
      }).join('\r\n');
      var blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    },

    options: function (list, selected, withAll, allLabel) {
      return (withAll ? '<option value="">' + (allLabel || 'Todos') + '</option>' : '') +
        list.map(function (o) {
          var id = o.id !== undefined ? o.id : o, name = o.name !== undefined ? o.name : o;
          return '<option value="' + UI.esc(id) + '"' + (id === selected ? ' selected' : '') + '>' + UI.esc(name) + '</option>';
        }).join('');
    },
  };

  window.UI = UI;
  window.Pages = window.Pages || {}; // registro de páginas (las rellenan js/pages/*.js)
  if (window.Chart) {
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.color = '#475569';
  }
})();
