# Santa Elena Participa · versión HTML + CSS + JavaScript

> *Tu voz construye provincia.*

Versión estática (sin Node, sin npm, sin compilar) de la plataforma de participación ciudadana
y observatorio provincial. **Es una DEMO:** los datos marcados como `DEMO` son ficticios y lo que
registres se guarda solo en tu navegador (localStorage).

## Cómo abrirla

**Opción recomendada (con VS Code):**
1. Abre la carpeta en VS Code.
2. Instala la extensión **Live Server** (Ritwick Dey).
3. Clic derecho en `index.html` → **Open with Live Server**.

**Opción rápida:** doble clic en `index.html`. Funciona, pero los mosaicos del mapa de
OpenStreetMap pueden no cargar al abrir desde `file://`. Con Live Server sí cargan.

**Con Python (si lo tienes):** `python -m http.server 8000` y abre http://localhost:8000

## Qué incluye

| Módulo | Archivo | Funciones |
|---|---|---|
| Inicio | `js/pages/home.js` | Los 10 bloques del documento del proyecto |
| A. Encuestas | `surveys.js` | Responder, resultados con %, filtro por cantón (mínimo de muestra), metodología, anti-duplicados y anti-bots |
| B. Mapa | `map.js` | Leaflet + OSM, marcadores, mapa de calor, filtros, estadísticas por cantón |
| C. Reportes | `reports.js` | Formulario, ubicación en mapa, fotos validadas, código de seguimiento, estados |
| D. Observatorio | `observatory.js` | KPIs, 4 gráficos (Chart.js), filtros, tabla |
| E. Proyectos | `projects.js` | Catálogo con todos los campos y filtros |
| F. Emprendedores | `entrepreneurs.js` | Directorio, filtros, registro con contacto voluntario |
| G. Presupuesto participativo | `budget.js` | Propuestas, votos consultivos, aviso de no vinculante |
| H. Panel admin | `admin.js` | Roles, moderación, crear encuestas, exportar CSV agregado, auditoría |
| Privacidad | `privacy.js` | Política, consentimiento, eliminación de datos |

## Estructura

```
index.html
css/styles.css
js/  config.js  data.js  store.js  ui.js  icons.js  app.js
js/pages/  (una página por módulo)
vendor/    Leaflet, Leaflet.heat, Chart.js (copias locales)
```

## Limitaciones de esta versión (importante)

- **Sin servidor:** todo corre en el navegador. Los votos y respuestas no se comparten entre personas.
- **Anti-duplicados solo por dispositivo.** La garantía real de "una persona, un voto" requiere servidor.
- **El panel administrativo es solo demostrativo:** no hay autenticación real. No lo uses para datos reales.
- **Geografía:** los puntos se ubican de forma aproximada alrededor de las cabeceras cantonales.
  No hay límites de parroquias, comunas ni sectores hasta contar con cartografía oficial verificada.
- Las fotografías se reducen y se guardan en el navegador; no se publican.

## Siguiente paso hacia producción

Conectar Supabase (PostgreSQL + Auth + RLS + Storage + Edge Functions) para tener usuarios reales,
votos únicos verificados, moderación segura y auditoría en servidor. Las pantallas y la lógica de
`js/store.js` están pensadas para reemplazarse por llamadas a Supabase. Nunca pongas la clave
`service_role` en estos archivos.

## Créditos

Leaflet (BSD-2), Leaflet.heat (BSD-2), Chart.js (MIT), íconos Lucide (ISC), mapas © colaboradores de OpenStreetMap.
