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
   Solo guarda nombre y dirección de las apps: ningún dato personal.
*/
(() => {
  const PANEL = 'https://gcalabro12.github.io/Grow-Panel/';
  const CLAVE = 'growpanel.apps', CLAVE_N = 'growpanel.n';
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

  const FLOR = '<svg viewBox="0 0 512 512" aria-hidden="true" style="width:18px;height:18px;display:block"><circle cx="256" cy="107.5" r="69.1" fill="#f59e0b"/><circle cx="397.2" cy="210.1" r="69.1" fill="#0f766e"/><circle cx="343.3" cy="376.1" r="69.1" fill="#8b5cf6"/><circle cx="168.7" cy="376.1" r="69.1" fill="#3b82f6"/><circle cx="114.8" cy="210.1" r="69.1" fill="#ef4444"/><circle cx="256" cy="256" r="79.4" fill="#6b7280"/></svg>';

  function pintar() {
    const sitio = document.getElementById('grow-panel-boton');
    if (!sitio || total < 2) return;
    const destino = PANEL + '?desde=' + encodeURIComponent(id) + '&nombre=' + encodeURIComponent(nombre) + '&url=' + encodeURIComponent(url);
    sitio.innerHTML = '<a class="gp-boton" href="' + destino + '" title="Grow Panel: todas tus apps" aria-label="Abrir Grow Panel"'
      + ' style="box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;'
      + 'border:1px solid rgba(148,163,184,.45);background:transparent;text-decoration:none;flex:none">' + FLOR + '</a>';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pintar); else pintar();
})();
