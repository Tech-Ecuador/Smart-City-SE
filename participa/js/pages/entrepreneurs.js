/* MÓDULO F: Directorio de emprendedores */
(function () {
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, PHONE = /^[0-9+\s()-]{7,18}$/;

  Pages.emprendedores = function (root) {
    root.innerHTML = UI.pageHead('Directorio de emprendedores', 'Conoce y apoya los emprendimientos de Santa Elena. El contacto solo se publica si la persona lo autoriza.') +
      '<div class="container page-body"><div class="card filters" style="margin-bottom:16px">' +
      '<div class="field"><label for="e-q">Buscar</label><input class="input" id="e-q" placeholder="Nombre o descripción"></div>' +
      '<div class="field"><label for="e-act">Actividad económica</label><select class="input" id="e-act">' + UI.options(DATA.ACTIVITIES, '', true, 'Todas') + '</select></div>' +
      '<div class="field"><label for="e-canton">Cantón</label><select class="input" id="e-canton">' + UI.options(DATA.CANTONS, '', true, 'Todos') + '</select></div></div>' +
      '<div class="grid grid-3" id="e-list"></div>' +
      '<form class="card form-grid" id="e-form" style="margin-top:24px" novalidate><h3 style="font-size:20px">Registrar mi emprendimiento</h3>' +
      '<div class="grid grid-2"><div class="field"><label for="f-name">Nombre comercial *</label><input class="input" id="f-name" maxlength="80"></div>' +
      '<div class="field"><label for="f-act">Actividad económica *</label><select class="input" id="f-act">' + UI.options(DATA.ACTIVITIES, '', true, 'Selecciona') + '</select></div>' +
      '<div class="field"><label for="f-canton">Cantón *</label><select class="input" id="f-canton">' + UI.options(DATA.CANTONS, '', true, 'Selecciona') + '</select></div>' +
      '<div class="field"><label for="f-photo">Fotografía (opcional)</label><input class="input" id="f-photo" type="file" accept="image/jpeg,image/png,image/webp"></div></div>' +
      '<div class="field"><label for="f-desc">Descripción *</label><textarea class="input" id="f-desc" maxlength="300" placeholder="¿Qué ofrece tu emprendimiento?"></textarea></div>' +
      '<label class="check"><input type="checkbox" id="f-pub"><span>Deseo publicar mi información de contacto (voluntario).</span></label>' +
      '<div class="field" id="f-contact-box" style="display:none"><label for="f-contact">Teléfono o correo público</label><input class="input" id="f-contact" maxlength="80"></div>' +
      '<div class="hp" aria-hidden="true"><label>No llenar<input type="text" id="f-hp" tabindex="-1" autocomplete="off"></label></div>' +
      '<label class="check"><input type="checkbox" id="f-consent"><span>Acepto la <a href="#/privacidad" style="text-decoration:underline">política de privacidad</a> y la publicación de los datos que ingreso en este formulario.</span></label>' +
      '<div id="f-error" class="notice err" style="display:none" role="alert"></div>' +
      '<div><button class="btn btn-primary" type="submit">' + icon('plus', 16) + ' Registrar</button></div></form></div>';

    function render() {
      var q = UI.$('#e-q').value.trim().toLowerCase(), a = UI.$('#e-act').value, c = UI.$('#e-canton').value;
      var items = Store.allEntrepreneurs().filter(function (e) {
        return (!a || e.activity === a) && (!c || e.canton === c) && (!q || (e.name + ' ' + e.description).toLowerCase().indexOf(q) >= 0);
      });
      UI.$('#e-list').innerHTML = items.map(function (e) {
        return '<article class="card hover">' + (e.photo ? '<img src="' + e.photo + '" alt="Foto de ' + UI.esc(e.name) + '" style="height:140px;width:100%;object-fit:cover;border-radius:12px;margin-bottom:12px">' :
          '<div style="height:90px;border-radius:12px;margin-bottom:12px;display:grid;place-items:center;background:linear-gradient(135deg,var(--turq-50),var(--navy-50));color:var(--turq-600)">' + icon('store', 36) + '</div>') +
          '<div class="row between"><span class="tag tag-turq">' + UI.esc(e.activity) + '</span>' + (e.demo ? UI.badge('demo') : '<span class="tag">Nuevo</span>') + '</div>' +
          '<h3 style="margin-top:10px;font-size:18px">' + UI.esc(e.name) + '</h3><p class="small muted">' + icon('map-pin', 13) + ' ' + UI.esc(DATA.cantonName(e.canton)) + '</p>' +
          '<p style="margin-top:8px;font-size:14px">' + UI.esc(e.description) + '</p>' +
          (e.contact ? '<p class="small" style="margin-top:8px"><strong>Contacto:</strong> ' + UI.esc(e.contact) + '</p>' : '<p class="small muted" style="margin-top:8px">Contacto no publicado.</p>') + '</article>';
      }).join('') || '<p class="muted">No se encontraron emprendimientos.</p>';
    }
    UI.$$('#e-q,#e-act,#e-canton').forEach(function (el) { el.addEventListener('input', render); });
    UI.$('#f-pub').addEventListener('change', function (e) { UI.$('#f-contact-box').style.display = e.target.checked ? 'block' : 'none'; });
    render();

    var photo = '', t0 = Date.now();
    UI.$('#f-photo').addEventListener('change', function (e) {
      UI.readPhotos(e.target.files).then(function (arr) { photo = arr[0] || ''; }).catch(function (err) { e.target.value = ''; photo = ''; UI.toast(err.message, true); });
    });
    UI.$('#e-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var err = UI.$('#f-error'); err.style.display = 'none';
      function fail(m) { err.textContent = m; err.style.display = 'flex'; }
      if (UI.$('#f-hp').value) return;
      if (Date.now() - t0 < 4000) return fail('Espera unos segundos antes de enviar.');
      var name = UI.$('#f-name').value.trim(), act = UI.$('#f-act').value, canton = UI.$('#f-canton').value, desc = UI.$('#f-desc').value.trim();
      var contact = UI.$('#f-pub').checked ? UI.$('#f-contact').value.trim() : '';
      if (name.length < 3) return fail('Ingresa el nombre comercial.');
      if (!act || !canton) return fail('Selecciona la actividad y el cantón.');
      if (desc.length < 10) return fail('Describe brevemente tu emprendimiento.');
      if (UI.$('#f-pub').checked && !(EMAIL.test(contact) || PHONE.test(contact))) return fail('Ingresa un correo o teléfono válido, o desmarca la publicación del contacto.');
      if (!UI.$('#f-consent').checked) return fail('Debes aceptar el consentimiento informado.');
      if (Store.addEntrepreneur({ id: Store.uid('e'), name: name, activity: act, canton: canton, description: desc, contact: contact, photo: photo, demo: false })) {
        UI.toast('Emprendimiento registrado.'); UI.$('#e-form').reset(); photo = ''; UI.$('#f-contact-box').style.display = 'none'; render();
      }
    });
  };
})();
