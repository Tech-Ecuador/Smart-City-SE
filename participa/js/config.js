/* ==========================================================
   CONFIGURACIÓN GENERAL
   ========================================================== */
window.CONFIG = {
  appName: 'Santa Elena Participa',
  slogan: 'Tu voz construye provincia',
  demoMode: true, // Muestra la etiqueta DEMO y usa datos ficticios

  // Reservado para conectar Supabase en una etapa posterior.
  // IMPORTANTE: aquí va SOLO la clave pública "anon". NUNCA la clave service_role.
  supabaseUrl: '',
  supabaseAnonKey: '',

  // Umbral mínimo de respuestas para mostrar resultados filtrados por cantón
  // (evita conclusiones con muestras muy pequeñas).
  minSampleForFilter: 8,

  // Tamaño máximo por foto (bytes) y tipos permitidos
  maxPhotoBytes: 4 * 1024 * 1024,
  allowedPhotoTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxPhotos: 3,

  // Mapa base. Vista centrada de forma aproximada en la provincia.
  mapCenter: [-2.23, -80.9],
  mapZoom: 11,
};
