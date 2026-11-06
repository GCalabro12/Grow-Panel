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
   5. Registro diario: GrowPanel.clave() da la clave personal que creó Grow Panel (o null).
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

  // Registro diario: Grow Panel abre esta app con «#gpclave=…» (esa parte nunca se envía a internet).
  // Se guarda en esta dirección y se quita de la barra al momento: el usuario no tiene que pegar nada.
  // Igual con «#gpcorreo=…»: el Gmail con el que la persona entró en Grow Panel (para decirle con qué cuenta entrar aquí)
  const mh = location.hash.match(/(^#|&)gpclave=([A-Za-z0-9_-]{32,128})/);
  const mc = location.hash.match(/(^#|&)gpcorreo=([^&]{3,200})/);
  if (mh) { try { localStorage.setItem('growpanel.clave', mh[2]); } catch (e) {} }
  if (mc) {
    let correo = ''; try { correo = decodeURIComponent(mc[2]); } catch (e) {}
    if (/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(correo)) { try { localStorage.setItem('growpanel.correo', correo); } catch (e) {} }
  }
  // Y «#gpcodigo=…»: código de un solo uso (15 min) para unir sola esta app a la cuenta de Grow Panel. Solo en memoria.
  const mk = location.hash.match(/(^#|&)gpcodigo=([A-Za-z0-9_-]{24,64})/);
  if (mh || mc || mk) {
    const resto = location.hash.replace(/^#/, '').split('&').filter(p => !/^gp(clave|correo|codigo)=/.test(p)).join('&');
    history.replaceState(null, '', location.pathname + location.search + (resto ? '#' + resto : ''));
  }
  if (mk) {
    // La app expone window.growPanelSesion() → su «Bearer» ('meta.<…>', 'pc.<…>' o el token de Firebase), o null si aún no hay
    // sesión; y lanza el evento 'growpanel-sesion' al entrar. Se reintenta cada 5 s durante 60 s.
    const codigo = mk[2], REGISTRO = 'https://registro-diario.proud-hill-016b.workers.dev';
    let hecho = false, intentos = 0, ocupado = false;
    const intentar = async () => {
      if (hecho || ocupado || typeof window.growPanelSesion !== 'function') return;
      ocupado = true;
      try {
        const sesion = await window.growPanelSesion();
        if (sesion) {
          const r = await fetch(REGISTRO + '/vincular-app', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, sesion, app: (window.GrowPanelApp || '') }) });
          hecho = true;   // salga bien o mal, no se repite (el motivo queda en el registro)
          try { window.dispatchEvent(new CustomEvent('growpanel-unida', { detail: await r.json() })); } catch (e) {}
        }
      } catch (e) {} finally { ocupado = false; }
    };
    window.addEventListener('growpanel-sesion', intentar);
    const t = setInterval(() => { if (hecho || ++intentos > 12) clearInterval(t); else intentar(); }, 5000);
    setTimeout(intentar, 300);
  }

  const apps = leer(CLAVE, {});
  apps[id] = { nombre, url, visto: new Date().toISOString() };
  guardar(CLAVE, apps);

  // Grow Panel abrió esta app: recordar cuántas apps tiene el usuario y limpiar la dirección
  const q = new URLSearchParams(location.search);
  // Abierta a pantalla completa desde una tarjeta de Grow Panel: se recuerda en esta pestaña para mostrar
  // arriba la barra «← Volver a Grow Panel» (la barra del navegador no lleva a Grow Panel).
  if (q.has('growpanel')) { try { sessionStorage.setItem('growpanel.volver', '1'); } catch (e) {} }
  if (q.has('growpanel')) {
    const n = parseInt(q.get('growpanel'), 10);
    if (n > 0) guardar(CLAVE_N, n);
    q.delete('growpanel');
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
  }

  const total = Math.max(Object.keys(apps).length, Number(leer(CLAVE_N, 0)) || 0);

  // Deja el resumen con el formato de FICHA.md y sin textos largos
  const corta = (t, n) => String(t ?? '').slice(0, n);
  // Números del día para el registro diario: { pasos: 6420, ... } (nombres en minúsculas, solo números, máx. 20)
  function limpiarDatos(d) {
    if (!d || typeof d !== 'object' || Array.isArray(d)) return null;
    const ok = Object.entries(d).filter(([k, v]) => /^[a-z0-9_]{1,40}$/.test(k) && typeof v === 'number' && isFinite(v)).slice(0, 20);
    return ok.length ? Object.fromEntries(ok) : null;
  }
  const hoyLocal = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  function limpiar(r) {
    r = r || {};
    const datos = limpiarDatos(r.datos);
    return {
      ficha: 1, id, app: nombre,
      version: r.version ? corta(r.version, 12) : null,
      estado: ['ok', 'aviso', 'error', 'pausa'].includes(r.estado) ? r.estado : 'ok',
      mensaje: corta(r.mensaje, 90),
      cifras: (Array.isArray(r.cifras) ? r.cifras : []).slice(0, 3)
        .map(c => ({ valor: corta(c && c.valor, 12), etiqueta: corta(c && c.etiqueta, 30) })),
      actualizado: new Date().toISOString(),
      frecuencia_horas: Number(r.frecuencia_horas) > 0 ? Number(r.frecuencia_horas) : 24,
      // Grow Panel los manda al registro diario por la app (la app no tiene que enviar nada)
      ...(datos ? { datos, fecha: /^\d{4}-\d{2}-\d{2}$/.test(r.fecha || '') ? r.fecha : hoyLocal() } : {})
    };
  }

  const FLOR = '<svg viewBox="0 0 512 512" aria-hidden="true" style="width:18px;height:18px;display:block"><circle cx="256" cy="107.5" r="69.1" fill="#f59e0b"/><circle cx="397.2" cy="210.1" r="69.1" fill="#0f766e"/><circle cx="343.3" cy="376.1" r="69.1" fill="#8b5cf6"/><circle cx="168.7" cy="376.1" r="69.1" fill="#3b82f6"/><circle cx="114.8" cy="210.1" r="69.1" fill="#ef4444"/><circle cx="256" cy="256" r="79.4" fill="#6b7280"/></svg>';

  function destino() {
    const f = leer(CLAVE_F, {})[id];
    return PANEL + '?desde=' + encodeURIComponent(id) + '&nombre=' + encodeURIComponent(nombre) + '&url=' + encodeURIComponent(url)
      + (f ? '#ficha=' + encodeURIComponent(JSON.stringify(f)) : '');
  }

  function barraVolver() {
    let enMarco = false; try { enMarco = window.top !== window; } catch (e) { enMarco = true; }
    let viene = false; try { viene = sessionStorage.getItem('growpanel.volver') === '1'; } catch (e) {}
    if (enMarco || !viene || !document.body) return;
    let barra = document.getElementById('gp-volver-barra');
    if (!barra) {
      barra = document.createElement('a');
      barra.id = 'gp-volver-barra';
      // Naranja de Grow Panel, a lo ancho y arriba del todo. Va fuera de <body> (antes de él) para no
      // depender de cómo coloca cada app su contenido (en Amable Fit, dentro de body, salía a un lado).
      barra.setAttribute('style', 'display:flex;align-items:center;justify-content:center;gap:10px;width:100%;box-sizing:border-box;'
        + 'padding:14px 16px;margin:0;background:#f59e0b;color:#1c1300;font:800 18px/1.2 system-ui,-apple-system,Segoe UI,sans-serif;'
        + 'text-decoration:none;letter-spacing:.2px;position:relative;z-index:2147483000;border-bottom:2px solid #d97706');
      // La flor va en un círculo blanco: su pétalo de arriba es naranja y sobre la barra naranja no se vería
      barra.innerHTML = '<span style="display:inline-flex;align-items:center;justify-content:center;flex:none;width:36px;height:36px;'
        + 'border-radius:50%;background:#fff;box-shadow:0 0 0 2px #d97706">' + FLOR.replace('width:18px;height:18px', 'width:26px;height:26px') + '</span>'
        + '<span>← Volver a Grow Panel</span>';
      document.documentElement.insertBefore(barra, document.body);
    }
    barra.href = destino();
  }

  function pintar() {
    barraVolver();
    const sitio = document.getElementById('grow-panel-boton');
    if (!sitio || total < 2) return;
    // Abierta dentro de Grow Panel («Abre tus apps»): arriba ya está «Volver a Grow Panel»
    try { if (window.top !== window && window.top.location.pathname.indexOf('/Grow-Panel/') === 0) return; } catch (e) {}
    const a = sitio.querySelector('a.gp-boton');
    if (a) { a.href = destino(); return; }
    sitio.innerHTML = '<a class="gp-boton" href="' + destino() + '" title="Grow Panel: todas tus apps" aria-label="Abrir Grow Panel"'
      + ' style="box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;'
      + 'border:1px solid rgba(148,163,184,.45);background:transparent;text-decoration:none;flex:none">' + FLOR + '</a>';
  }

  window.GrowPanel = Object.assign(window.GrowPanel || {}, {
    // Clave del registro diario creada por Grow Panel. La tienen las apps de su misma dirección
    // (gcalabro12.github.io) y las de otra dirección después de abrirlas una vez desde Grow Panel.
    // Devuelve null en apps instaladas (APK/WebView/TWA): ahí, campo «Pega tu clave de Grow Panel».
    clave() {
      try { const k = localStorage.getItem('growpanel.clave'); return /^[A-Za-z0-9_-]{32,128}$/.test(k || '') ? k : null; } catch (e) { return null; }
    },
    // Gmail con el que la persona entró en Grow Panel, o null (para decirle con qué cuenta de Google entrar en esta app)
    correo() {
      try { const c = localStorage.getItem('growpanel.correo'); return /@/.test(c || '') ? c : null; } catch (e) { return null; }
    },
    // Hora del resumen del día que eligió la persona en Grow Panel («HH:MM», por defecto «20:00»).
    // Solo la ven las apps de esta misma dirección; las demás: GET /ajustes del registro diario.
    horaResumen() {
      try { const h = localStorage.getItem('growpanel.hora_resumen'); return /^([01]\d|2[0-3]):[0-5]\d$/.test(h || '') ? h : '20:00'; } catch (e) { return '20:00'; }
    },
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
