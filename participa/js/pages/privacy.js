/* Política de privacidad, consentimiento y solicitud de eliminación de datos */
(function () {
  Pages.privacidad = function (root) {
    root.innerHTML = UI.pageHead('Política de privacidad y protección de datos', 'Aplicamos los principios de la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador.') +
      '<div class="container page-body"><div class="notice" style="margin-bottom:16px">' + icon('info', 18) + '<span>Borrador para la versión DEMO. Debe ser revisado por un profesional legal antes de su uso real.</span></div>' +
      '<div class="card" style="display:grid;gap:18px;max-width:860px">' +
      '<section><h3>Principios</h3><p class="muted">Licitud, finalidad, pertinencia, minimización, transparencia y seguridad. Solo pedimos lo necesario para cada módulo.</p></section>' +
      '<section><h3>Datos que se tratan</h3><ul style="list-style:disc;padding-left:20px;color:var(--slate-600)">' +
      '<li>Encuestas: respuestas anónimas y, de forma opcional, el cantón de residencia.</li>' +
      '<li>Reportes: categoría, descripción, ubicación y fotografías opcionales. Las fotografías no se publican.</li>' +
      '<li>Emprendedores: datos comerciales; el contacto se publica solo si la persona lo autoriza.</li></ul></section>' +
      '<section><h3>Uso de este navegador (versión DEMO)</h3><p class="muted">Lo que registras aquí se guarda únicamente en el almacenamiento local de tu navegador. No se envía a ningún servidor. Esto permite probar la plataforma sin riesgo para tus datos.</p></section>' +
      '<section><h3>Consentimiento informado</h3><p class="muted">Antes de enviar cualquier formulario se solicita tu consentimiento explícito. Puedes retirarlo en cualquier momento solicitando la eliminación de tus datos.</p></section>' +
      '<section><h3>Tus derechos</h3><p class="muted">Acceso, rectificación, eliminación, oposición y portabilidad, según la LOPDP. En la versión con servidor se habilitará un canal institucional para atender estas solicitudes.</p></section>' +
      '<section><h3>Datos de demostración</h3><p class="muted">La información marcada como DEMO o SIMULACIÓN es ficticia y no corresponde a personas reales ni a estadísticas oficiales de la provincia.</p></section>' +
      '<section style="border-top:1px solid var(--slate-200);padding-top:18px"><h3>Solicitar eliminación de mis datos</h3><p class="muted" style="margin:6px 0 12px">Borra de este navegador tus respuestas, reportes, votos, emprendimientos y propuestas registrados.</p>' +
      '<button class="btn btn-danger" id="erase" type="button">' + icon('trash-2', 16) + ' Eliminar mis datos de este navegador</button></section></div></div>';
    UI.$('#erase').addEventListener('click', function () {
      if (confirm('Se eliminarán todos tus registros locales. Esta acción no se puede deshacer. ¿Continuar?')) {
        Store.eraseMyData(); UI.toast('Tus datos locales fueron eliminados.');
      }
    });
  };
})();
