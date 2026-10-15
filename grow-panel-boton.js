/* Botón de Grow Panel para las apps de Práctica Integral (mismo archivo en todas las apps).

   Uso en cada app:
     <span id="grow-panel-boton"></span>          ← donde va el botón (arriba, en la cabecera)
     <script src="https://gcalabro12.github.io/Grow-Panel/grow-panel-boton.js"
             data-app="pc-body-mind" data-nombre="PC & Body-mind" defer></script>

   Qué hace:
   1. Apunta esta app en la memoria del navegador (localStorage «growpanel.apps»).
      Las apps publicadas en la misma dirección (gcalabro12.github.io) comparten esa memoria.
   2. Si Grow Panel abre esta app, el enlace trae «?growpanel=N» (N = apps del usuario) y la app lo recuerda.
      Así funcionan también las apps de otra dirección (Calistenia, Mi Reproductor…).
   3. Con 2 apps o más, muestra el botón redondo con la mini flor. Al tocarlo abre Grow Panel,
      que muestra el botón «Volver a <esta app>».
   4. Resumen (fase 2): la app llama a GrowPanel.resumen({estado, mensaje, cifras}) cuando cambian sus datos.
      Se guarda en «growpanel.fichas» y viaja a Grow Panel detrás de «#» en el enlace del botón
      (esa parte de la dirección nunca se envía a internet). Todo se queda en el navegador del usuario.
      Si el código de la app corre antes que este archivo, puede dejar los datos en window.growPanelResumen.
*/
(() => {
  const PANEL = 'https://gcalabro12.github.io/Grow-Panel/';
  const CLAVE = 'growpanel.apps', CLAVE_N = 'growpanel.n', CLAVE_F = 'growpanel.fichas';
  const s = document.currentScript;
  const id = s && s.dataset.app;
  if (!id) return;
  const nombre = s.dataset.nombre || id;
  const url = location.origin + location.pathname;

  const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (e) { return def; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const apps = leer(CLAVE, {});
  apps[id] = { nombre, url, visto: new Date().toISOString() };
  guardar(CLAVE, apps);

  // Grow Panel abrió esta app: recordar cuántas apps tiene el usuario y limpiar la dirección
  const q = new URLSearchParams(location.search);
  if (q.has('growpanel')) {
    const n = parseInt(q.get('growpanel'), 10);
    if (n > 0) guardar(CLAVE_N, n);
    q.delete('growpanel');
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
  }

  const total = Math.max(Object.keys(apps).length, Number(leer(CLAVE_N, 0)) || 0);

  // Deja el resumen con el formato de FICHA.md y sin textos largos
  const corta = (t, n) => String(t ?? '').slice(0, n);
  function limpiar(r) {
    r = r || {};
    return {
      ficha: 1, id, app: nombre,
      version: r.version ? corta(r.version, 12) : null,
      estado: ['ok', 'aviso', 'error', 'pausa'].includes(r.estado) ? r.estado : 'ok',
      mensaje: corta(r.mensaje, 90),
      cifras: (Array.isArray(r.cifras) ? r.cifras : []).slice(0, 3)
        .map(c => ({ valor: corta(c && c.valor, 12), etiqueta: corta(c && c.etiqueta, 30) })),
      actualizado: new Date().toISOString(),
      frecuencia_horas: Number(r.frecuencia_horas) > 0 ? Number(r.frecuencia_horas) : 24
    };
  }

  const FLOR = '<svg viewBox="0 0 512 512" aria-hidden="true" style="width:18px;height:18px;display:block"><circle cx="256" cy="107.5" r="69.1" fill="#f59e0b"/><circle cx="397.2" cy="210.1" r="69.1" fill="#0f766e"/><circle cx="343.3" cy="376.1" r="69.1" fill="#8b5cf6"/><circle cx="168.7" cy="376.1" r="69.1" fill="#3b82f6"/><circle cx="114.8" cy="210.1" r="69.1" fill="#ef4444"/><circle cx="256" cy="256" r="79.4" fill="#6b7280"/></svg>';

  function destino() {
    const f = leer(CLAVE_F, {})[id];
    return PANEL + '?desde=' + encodeURIComponent(id) + '&nombre=' + encodeURIComponent(nombre) + '&url=' + encodeURIComponent(url)
      + (f ? '#ficha=' + encodeURIComponent(JSON.stringify(f)) : '');
  }

  function pintar() {
    const sitio = document.getElementById('grow-panel-boton');
    if (!sitio || total < 2) return;
    const a = sitio.querySelector('a.gp-boton');
    if (a) { a.href = destino(); return; }
    sitio.innerHTML = '<a class="gp-boton" href="' + destino() + '" title="Grow Panel: todas tus apps" aria-label="Abrir Grow Panel"'
      + ' style="box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;'
      + 'border:1px solid rgba(148,163,184,.45);background:transparent;text-decoration:none;flex:none">' + FLOR + '</a>';
  }

  window.GrowPanel = Object.assign(window.GrowPanel || {}, {
    resumen(r) {
      const fichas = leer(CLAVE_F, {});
      fichas[id] = limpiar(r);
      guardar(CLAVE_F, fichas);
      pintar();
    }
  });
  if (window.growPanelResumen) window.GrowPanel.resumen(window.growPanelResumen);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pintar); else pintar();
  window.dispatchEvent(new Event('growpanel-listo'));
})();
