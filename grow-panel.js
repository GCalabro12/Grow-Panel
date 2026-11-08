/* Grow Panel — panel central de las apps · by Práctica Integral
   Lee apps.json y la ficha de estado (estado.json) de cada app. Formato: FICHA.md
   Se activa a partir de la segunda app: con menos de 2 apps no se muestra.

   Para ponerlo en cualquier app:
     <script src="https://gcalabro12.github.io/Grow-Panel/grow-panel.js" defer></script>
     <grow-panel></grow-panel>

   Atributos opcionales de <grow-panel>:
     compacto            una línea por app, sin cifras
     ocultar="finan-gus" no mostrar esas apps (ids separados por comas), p. ej. la app anfitriona
     sin-titulo          sin la cabecera «Grow Panel»
     titulo="Mis apps"   cambiar el texto de la cabecera
     tema="claro|oscuro" forzar tema (por defecto sigue al sistema)
   Orden: cada tarjeta tiene un asa de seis puntos abajo a la izquierda; arrastrándola (o con las flechas
   ↑ ↓ del teclado) se cambia el orden. Se guarda en este navegador (localStorage «growpanel.orden»).
*/
(() => {
  const VERSION = 'v1.64';
  const BASE = new URL('.', document.currentScript ? document.currentScript.src : location.href).href;
  const ESTADOS = {
    ok: 'Todo bien', aviso: 'Con avisos', error: 'Con errores', pausa: 'En pausa', mudo: 'Sin noticias'
  };
  const ORDEN = { error: 0, aviso: 1, mudo: 2, pausa: 3, ok: 4 };

  const CSS = `
:host{--gp-bg:#ffffff;--gp-tx:#1d2330;--gp-mut:#6b7280;--gp-ln:#e5e7eb;--gp-sub:#f3f4f6;
  --gp-ok:#16a34a;--gp-aviso:#d97706;--gp-error:#dc2626;--gp-pausa:#64748b;--gp-mudo:#94a3b8;
  display:block;font-family:system-ui,"Segoe UI",sans-serif;color:var(--gp-tx)}
:host([oculto]){display:none}
:host([tema=oscuro]){--gp-bg:#1b2029;--gp-tx:#e8eaee;--gp-mut:#9aa3b2;--gp-ln:#2a313d;--gp-sub:#232a35;
  --gp-ok:#4ade80;--gp-aviso:#fbbf24;--gp-error:#f87171;--gp-pausa:#94a3b8;--gp-mudo:#64748b}
@media (prefers-color-scheme:dark){:host(:not([tema=claro])){--gp-bg:#1b2029;--gp-tx:#e8eaee;--gp-mut:#9aa3b2;
  --gp-ln:#2a313d;--gp-sub:#232a35;--gp-ok:#4ade80;--gp-aviso:#fbbf24;--gp-error:#f87171;--gp-pausa:#94a3b8;--gp-mudo:#64748b}}
*{box-sizing:border-box}
.cab{margin-bottom:14px}
.franja{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;min-height:52px;padding:8px 10px;
  border-radius:12px;background:#f59e0b;color:#1c1300}
.franja h2{grid-column:2;margin:0;font-size:21px;font-weight:800;letter-spacing:-.2px;text-align:center}
.franja .rec{grid-column:3;justify-self:end;width:auto;height:auto;border-radius:999px;padding:7px 12px;font-size:14px;font-weight:700;
  display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.45);border:1px solid rgba(28,19,0,.25);color:#1c1300}
.franja .rec:hover{background:rgba(255,255,255,.7)}
.franja .rec .ic{display:inline-block}
.franja .rec.girando{animation:none}.franja .rec.girando .ic{animation:g 1s linear infinite}
.cab .sub{color:var(--gp-mut);font-size:13px;margin-top:6px;text-align:center}
.cab .bajo{display:grid;grid-template-columns:1fr auto 1fr;align-items:baseline;gap:4px 10px;margin-top:6px}
.cab .bajo .sub{grid-column:2;margin-top:0}
.cab .act{grid-column:3;justify-self:end;text-align:right;color:var(--gp-mut);font-size:12.5px;padding-right:8px}
@media (max-width:560px){.cab .bajo{grid-template-columns:1fr}.cab .bajo .sub,.cab .act{grid-column:1;justify-self:center;text-align:center;padding-right:0}}
.rec{border:1px solid var(--gp-ln);background:var(--gp-bg);color:var(--gp-mut);width:36px;height:36px;
  border-radius:50%;font-size:17px;cursor:pointer;flex:none}
.rec:hover{color:var(--gp-tx)}
.rec.girando{animation:g 1s linear infinite}@keyframes g{to{transform:rotate(360deg)}}
.lista{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
.app{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:start;padding:12px;border-radius:12px;
  background:var(--gp-bg);border:1px solid var(--gp-ln);border-left:4px solid var(--c);color:inherit;text-decoration:none}
a.app:hover{border-color:var(--c)}
.ico{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:21px;background:var(--a,var(--gp-sub));overflow:hidden}
.ico img{width:100%;height:100%;object-fit:cover}
.fila{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.fila b{font-size:16px}
.ver{font-size:11px;font-weight:700;color:var(--gp-mut);background:var(--gp-sub);padding:1px 7px;border-radius:20px}
.cuando{margin-left:auto;font-size:12px;color:var(--gp-mut);white-space:nowrap}
.cuenta{margin-left:auto;font-size:11px;color:var(--gp-mut);overflow-wrap:anywhere}
.cuenta+.cuando{margin-left:0}
.consejo{display:block;margin-top:4px;font-size:12px;color:var(--gp-aviso);font-weight:600}
.fechas{display:flex;align-items:center;gap:4px 10px;flex-wrap:wrap;font-size:12.5px;color:var(--gp-mut);margin-top:3px}
.fechas .punto{margin-top:0}
.fechas .dia{margin-left:auto;color:var(--gp-tx);font-weight:600;white-space:nowrap}
.msg{display:flex;align-items:flex-start;gap:7px;font-size:14px;margin-top:3px;line-height:1.35}
.punto{width:9px;height:9px;border-radius:50%;background:var(--c);flex:none;margin-top:5px}
.cifras{grid-column:2;display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.cifras span{font-size:12px;color:var(--gp-mut);background:var(--gp-sub);border-radius:8px;padding:4px 8px}
.cifras b{color:var(--gp-tx);font-size:13px;font-variant-numeric:tabular-nums}
.item{position:relative}
.item.pendiente .app{border:2px dashed #f59e0b}
.consejo.clica{display:inline-block;margin-top:6px;padding:4px 10px;border-radius:999px;background:#f59e0b;color:#1c1300;font-weight:800}
.item .app{height:100%;min-height:96px}
.asa{position:absolute;left:16px;bottom:8px;width:32px;height:26px;display:grid;place-items:center;padding:0;border:0;
  border-radius:6px;background:transparent;color:var(--gp-mut);cursor:grab;touch-action:none}
.asa:hover,.asa:focus-visible{background:var(--gp-sub);color:var(--gp-tx);outline:none}
.asa svg{width:12px;height:18px;display:block}
.item.arrastrando{opacity:.6}
.item.arrastrando .app{border-style:dashed}
.item.arrastrando .asa{cursor:grabbing}
.vacio{color:var(--gp-mut);font-size:14px;padding:12px;border:1px dashed var(--gp-ln);border-radius:12px}
:host([compacto]) .lista{grid-template-columns:1fr;gap:6px}
:host([compacto]) .app{padding:8px 10px;align-items:center}
:host([compacto]) .ico{width:30px;height:30px;font-size:16px}
:host([compacto]) .cifras{display:none}
:host([compacto]) .msg{font-size:13px;margin-top:0}
:host([compacto]) .item .app{min-height:0;padding-left:40px}
:host([compacto]) .asa{left:4px;bottom:auto;top:50%;transform:translateY(-50%)}
`;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const urlSegura = u => /^https:\/\//.test(u || '') ? u : '';
  const colorSeguro = c => /^#[0-9a-f]{3,8}$/i.test(c || '') ? c : '';

  const PUNTOS = '<svg viewBox="0 0 10 16" aria-hidden="true"><circle cx="2" cy="2" r="1.6" fill="currentColor"/><circle cx="8" cy="2" r="1.6" fill="currentColor"/><circle cx="2" cy="8" r="1.6" fill="currentColor"/><circle cx="8" cy="8" r="1.6" fill="currentColor"/><circle cx="2" cy="14" r="1.6" fill="currentColor"/><circle cx="8" cy="14" r="1.6" fill="currentColor"/></svg>';
  function ordenGuardado() {
    try { const o = JSON.parse(localStorage.getItem('growpanel.orden')); return Array.isArray(o) ? o : []; } catch (e) { return []; }
  }

  // Apps y resúmenes apuntados por grow-panel-boton.js en este navegador
  function local(clave) {
    try { return JSON.parse(localStorage.getItem(clave)) || {}; } catch (e) { return {}; }
  }
  const appsLocales = () => local('growpanel.apps');

  async function leerJSON(url) {
    const r = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }

  // «Actualizado a las 18:37 · hace 1 minuto»: cuándo leyó Grow Panel los datos por última vez
  function textoActualizado(t) {
    if (!t) return '';
    const d = new Date(t), hoy = new Date();
    const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const min = Math.floor((Date.now() - t) / 60000);
    const cuanto = min < 1 ? 'ahora' : min < 60 ? `hace ${min} ${min === 1 ? 'minuto' : 'minutos'}`
      : `hace ${Math.floor(min / 60)} h${min % 60 ? ' ' + (min % 60) + ' min' : ''}`;
    const dia = d.toDateString() === hoy.toDateString() ? '' : ` el ${d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`;
    return `Actualizado${dia} a las ${hora} · ${cuanto}`;
  }

  function hace(fecha) {
    const min = Math.round((Date.now() - fecha) / 60000);
    if (min < 2) return 'ahora';
    if (min < 60) return `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.round(h / 24);
    if (d === 1) return 'ayer';
    if (d < 7) return `hace ${d} días`;
    return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }

  // Registro diario → ficha: si la página da window.GrowPanelRegistro(), sus números (de internet, iguales en el móvil
  // y en el PC) sirven de resumen cuando son más recientes que lo que la app dejó en este navegador.
  const NOMBRES_DATO = { pasos: 'pasos', pausas_vista: 'pausas de la vista', minutos_concentracion: 'min de concentración',
    tareas_hechas: 'tareas realizadas', tareas_pendientes: 'tareas pendientes', habitos_hechos: 'hábitos realizados', areas_accion: 'áreas que piden acción', tareas_total: 'tareas en total', bloques_con_tareas: 'bloques con tareas', bloques_total: 'bloques',
    sesiones: 'sesiones hoy', minutos: 'minutos hoy', racha: 'días de racha', semana: 'esta semana', acciones_pendientes: 'acciones pendientes',
    minutos_presencia: 'min de presencia', practicas_hoy: 'prácticas hoy', racha_dias: 'días de racha', practicas_semana: 'prácticas esta semana',
    dias_registrados: 'días registrados', registrado_hoy: 'registrado hoy', compromiso_semana: 'compromiso semanal', metas_sencillas_hoy: 'metas sencillas hoy', metas_sencillas_hechas: 'metas sencillas hechas' };
  // Orden de las cifras en la tarjeta (Gustavo, 7-11-2026). Life: pendientes, realizadas, hábitos y áreas
  const ORDEN_CIFRAS = { 'amable-life': ['tareas_pendientes', 'tareas_hechas', 'habitos_hechos', 'areas_accion'] };
  const ORDEN_ETIQUETAS = { 'equilibra': [/pendiente/i, /realizad|hech/i, /h[áa]bito/i, /[áa]rea/i] };
  function ordenarCifras(cifras, reglas) {
    if (!reglas || !Array.isArray(cifras)) return cifras;
    const pos = c => { const i = reglas.findIndex(r => r.test(c.etiqueta || '')); return i < 0 ? 99 : i; };
    return cifras.map((c, i) => [c, i]).sort((x, y) => pos(x[0]) - pos(y[0]) || x[1] - y[1]).map(x => x[0]);
  }
  const textoDia = (fecha) => {   // fecha AAAA-MM-DD → «Datos solo de hoy» / «Datos del 06/11»
    const h = new Date(), hoy = h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-' + String(h.getDate()).padStart(2, '0');
    return fecha === hoy ? 'Datos solo de hoy' : 'Datos del ' + fecha.slice(8, 10) + '/' + fecha.slice(5, 7);
  };
  function fichasDelRegistro(filas) {
    const ultimo = {};
    (filas || []).forEach(f => {
      const u = ultimo[f.app];
      if (!u || f.fecha > u.fecha) ultimo[f.app] = { fecha: f.fecha, enviado: f.enviado, datos: {} };
      const v = ultimo[f.app];
      if (v.fecha === f.fecha) { v.datos[f.dato] = f.valor; if (f.enviado > v.enviado) v.enviado = f.enviado; }
    });
    const hoy = new Date(), dia = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const res = {};
    // Con qué cuenta envía cada app (lo dice el registro) y con cuál ha entrado Grow Panel
    res.__cuentas = {}; (filas && filas.cuentas || []).forEach(c => { res.__cuentas[c.app] = c; });
    res.__miCuenta = (filas && filas.miCuenta) || '';
    // Pasos: con Amable PC y Amable Life, cuentan los de Amable PC (regla de Gustavo, 6-11-2026)
    res.__pasosDePC = !!(ultimo['amable-pc'] && ultimo['amable-pc'].datos.pasos !== undefined);
    if (res.__pasosDePC && ultimo['amable-life']) delete ultimo['amable-life'].datos.pasos;
    Object.entries(ultimo).forEach(([app, v]) => {
      const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 1 });
      const d = v.datos, orden = ORDEN_CIFRAS[app] || [];
      if (app === 'amable-life' && d.tareas_pendientes === undefined && d.tareas_total !== undefined && d.tareas_hechas !== undefined)
        d.tareas_pendientes = Math.max(0, d.tareas_total - d.tareas_hechas);
      if (app === 'amable-life' && d.tareas_pendientes !== undefined) delete d.tareas_total;
      const claves = Object.keys(d).map((k, i) => [k, i]).sort((x, y) => {
        const a = orden.indexOf(x[0]), b = orden.indexOf(y[0]);
        return (a < 0 ? 99 : a) - (b < 0 ? 99 : b) || x[1] - y[1];
      }).map(x => x[0]);
      res[app] = { ficha: 1, estado: 'ok', mensaje: '', diaDatos: v.fecha,
        cifras: claves.slice(0, 4).map(k => [k, d[k]]).map(([k, n]) => ({ valor: fmt(n), etiqueta: (app === 'amable-fit' && k === 'minutos' ? 'min de ejercicio hoy' : NOMBRES_DATO[k]) || k.replace(/_/g, ' ') })),
        actualizado: (v.enviado || v.fecha).replace(' ', 'T') + (v.enviado ? 'Z' : 'T20:00:00'), frecuencia_horas: 48, delRegistro: true };
    });
    return res;
  }

  // Une la entrada del registro con su ficha y decide el estado visible
  function combinar(app, f, reg) {
    if (!app.ficha) f = local('growpanel.fichas')[app.id] || null;
    // El registro diario manda si es más reciente que lo que la app dejó en este navegador
    const r = reg && app.registro && reg[app.registro];
    if (r && (!f || !(Date.parse(f.actualizado) >= Date.parse(r.actualizado)))) f = Object.assign({}, r, { version: f && f.version });
    const v = f ? combinarFicha(app, f)
      : app.ficha ? { app, estado: 'mudo', mensaje: 'Todavía no ha publicado su ficha' } : { app, estado: 'pausa', mensaje: 'Conectada · resumen próximamente' };
    if (reg && reg.__pasosDePC && app.registro === 'amable-life' && v.f && Array.isArray(v.f.cifras))
      v.f = Object.assign({}, v.f, { cifras: v.f.cifras.filter(c => !/pasos/i.test(c.etiqueta || '')) });
    return conCuenta(v, app, reg);
  }

  // Con qué cuenta está conectada la app («(gcalabro12@gmail.com)») y, si algo no cuadra, qué hacer
  function conCuenta(v, app, reg) {
    if (!reg || !app.registro) return v;
    const c = reg.__cuentas && reg.__cuentas[app.registro], mia = reg.__miCuenta;
    if (c) {
      const google = /^google/.test(c.tipo || '');
      v.cuenta = c.cuenta || (google ? 'cuenta de Google' : 'sin cuenta de Google');
      if (!google) { v.pendiente = true; v.consejo = 'Clica aquí para conectarla con Grow Panel'; }
      else if (mia && c.cuenta && /@/.test(c.cuenta) && c.cuenta.toLowerCase() !== mia.toLowerCase()) v.consejo = `Envía con ${c.cuenta}; Grow Panel usa ${mia}`;
    } else if (app.registro_activo && reg[app.registro]) {
      v.cuenta = 'cuenta: se verá en su próximo envío';   // hay números, pero llegaron antes de que se apuntara la cuenta
    } else if (app.registro_activo && mia && !reg[app.registro]) {
      // Ni números ni cuenta: no llega nada de esta app con tu cuenta
      v.cuenta = 'sin conectar';
      v.pendiente = true;
      v.consejo = 'Clica aquí para conectarla con Grow Panel';
    }
    return v;
  }

  function combinarFicha(app, f) {
    if (!f) return { app, estado: 'mudo', mensaje: 'Todavía no ha publicado su ficha' };
    const t = Date.parse(f.actualizado);
    const limite = (Number(f.frecuencia_horas) || 24) * 1.5 * 3600e3;
    const estado = ESTADOS[f.estado] && f.estado !== 'mudo' ? f.estado : 'aviso';
    const v = { app, f, t, estado, mensaje: f.delRegistro ? '' : String(f.mensaje || ESTADOS[estado]).slice(0, 90) };
    // De qué día son los números: el del registro, o el del último envío de la app
    const fd = f.diaDatos || (t ? new Date(t - new Date(t).getTimezoneOffset() * 60000).toISOString().slice(0, 10) : '');
    if (fd) v.dia = textoDia(fd);
    if (ORDEN_ETIQUETAS[app.id]) v.f = Object.assign({}, f, { cifras: ordenarCifras(f.cifras, ORDEN_ETIQUETAS[app.id]) });
    if (!t || Date.now() - t > limite) {
      v.estado = 'mudo';
      v.mensaje = t ? `Sin ficha nueva desde el ${new Date(t).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}` : 'Ficha sin fecha';
    }
    return v;
  }

  function tarjeta(v, n) {
    const a = v.app, base = urlSegura(a.url), url = base && (a.externa ? base : base + (base.includes('?') ? '&' : '?') + 'growpanel=' + n + (v.pendiente ? '&gpguia=1' : '')), icono = urlSegura(a.icono), color = colorSeguro(a.color);
    const tag = url ? 'a' : 'div';
    const attrs = url ? ` href="${esc(url)}" target="_blank" rel="noopener"` : '';
    const cifras = (v.f && Array.isArray(v.f.cifras) ? v.f.cifras.slice(0, 4) : [])
      .map(c => `<span><b>${esc(c.valor)}</b> ${esc(c.etiqueta)}</span>`).join('');
    return `<div class="item${v.pendiente ? ' pendiente' : ''}" data-id="${esc(a.id)}"><${tag} class="app" style="--c:var(--gp-${v.estado})${color ? `;--a:${color}` : ''}"${attrs} title="${esc(a.nombre)} · ${esc(ESTADOS[v.estado])}">
  <span class="ico">${icono ? `<img src="${esc(icono)}" alt="">` : esc(a.emoji || (a.nombre || '•').charAt(0))}</span>
  <span>
    <span class="fila"><b>${esc(a.nombre)}</b>${v.f && v.f.version ? `<span class="ver">${esc(v.f.version)}</span>` : ''}${v.cuenta ? `<span class="cuenta" title="Cuenta con la que envía sus números">(${esc(v.cuenta)})</span>` : ''}</span>
    ${v.t ? `<span class="fechas"><i class="punto"></i><span title="Último cambio de sus números">actualizado ${hace(v.t)}</span>${v.dia && v.estado !== 'mudo' ? `<span class="dia">${esc(v.dia)}</span>` : ''}</span>` : ''}
    ${v.mensaje ? `<span class="msg">${v.t ? '' : '<i class="punto"></i>'}${esc(v.mensaje)}</span>` : ''}${v.consejo ? (v.pendiente ? `<span class="consejo clica">👉 ${esc(v.consejo)}</span>` : `<span class="consejo">⚠ ${esc(v.consejo)}</span>`) : ''}
  </span>
  ${cifras ? `<span class="cifras">${cifras}</span>` : ''}
</${tag}><button class="asa" type="button" title="Arrastra para ordenar" aria-label="Mover ${esc(a.nombre)}: arrastra o usa las flechas arriba y abajo">${PUNTOS}</button></div>`;
  }

  class GrowPanel extends HTMLElement {
    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' }).innerHTML = `<style>${CSS}</style><div id="raiz"></div>`;
      this.cargar();
      this._t = setInterval(() => this.cargar(), 10 * 60e3);
      this._reloj = setInterval(() => this.pintarActualizado(), 20e3);
      this._v = () => { if (!document.hidden) this.cargar(); };
      document.addEventListener('visibilitychange', this._v);
    }
    disconnectedCallback() {
      clearInterval(this._t);
      clearInterval(this._reloj);
      document.removeEventListener('visibilitychange', this._v);
    }
    async cargar() {
      const raiz = this.shadowRoot.getElementById('raiz');
      const rec = this.shadowRoot.querySelector('.rec');
      if (rec) rec.classList.add('girando');
      const turno = this._turno = (this._turno || 0) + 1; // solo pinta la carga más reciente
      try {
        const reg = await leerJSON(this.getAttribute('registro') || BASE + 'apps.json');
        // La tarjeta abre la app desde la que el usuario llegó (su dirección real), no la de apps.json:
        // una app puede estar publicada en varias direcciones y cada una guarda sus datos aparte.
        const locales = appsLocales();
        const todas = (reg.apps || []).map(a => {
          const l = locales[a.id];
          return l && urlSegura(l.url) && !a.externa ? Object.assign({}, a, { url: l.url }) : a;
        });
        for (const [id, a] of Object.entries(locales)) {
          if (!todas.some(x => x.id === id) && urlSegura(a.url)) todas.push({ id, nombre: a.nombre, url: a.url });
        }
        // Apps marcadas "oculta" en apps.json: no salen aunque este navegador las tenga apuntadas
        const visibles = todas.filter(a => !a.oculta);
        // Grow Panel se activa a partir de la segunda app
        this.toggleAttribute('oculto', visibles.length < 2);
        const ocultar = (this.getAttribute('ocultar') || '').split(',').map(s => s.trim()).filter(Boolean);
        const apps = visibles.filter(a => !ocultar.includes(a.id));
        const [fichas, filasReg] = await Promise.all([
          Promise.all(apps.map(a => a.ficha ? leerJSON(a.ficha).catch(() => null) : null)),
          typeof window.GrowPanelRegistro === 'function'
            ? Promise.race([window.GrowPanelRegistro().catch(() => null), new Promise(ok => setTimeout(() => ok(null), 6000))]) : null
        ]);
        if (turno !== this._turno || this._arrastrando) return;
        const diario = filasReg ? fichasDelRegistro(filasReg) : null;
        const vistas = apps.map((a, i) => combinar(a, fichas[i], diario)).sort((x, y) => ORDEN[x.estado] - ORDEN[y.estado]);
        // Orden elegido por el usuario; las apps nuevas van al final, por estado
        const orden = ordenGuardado();
        if (orden.length) {
          const pos = v => { const i = orden.indexOf(v.app.id); return i < 0 ? 1e6 : i; };
          vistas.sort((x, y) => pos(x) - pos(y));
        }
        this._leido = Date.now();
        this.pintar(raiz, vistas, visibles.length);
      } catch (e) {
        if (turno !== this._turno) return;
        raiz.innerHTML = this.cabecera('No se pudo leer el panel. Revisa la conexión.') + '<div class="vacio">Sin conexión con Grow Panel.</div>';
      }
      const r2 = this.shadowRoot.querySelector('.rec');
      if (r2) r2.onclick = () => this.cargar();
    }
    cabecera(sub) {
      if (this.hasAttribute('sin-titulo')) return '';
      return `<div class="cab"><div class="franja"><h2>${esc(this.getAttribute('titulo') || 'Grow Panel')}</h2>
        <button class="rec" title="Volver a leer los resúmenes que han dejado tus apps" aria-label="Actualizar datos"><span class="ic">↻</span> Actualizar datos</button></div><div class="bajo"><div class="sub">${esc(sub)}</div><div class="act">${esc(textoActualizado(this._leido))}</div></div></div>`;
    }
    pintarActualizado() {
      const el = this.shadowRoot && this.shadowRoot.querySelector('.act');
      if (el) el.textContent = textoActualizado(this._leido);
    }
    pintar(raiz, vistas, total) {
      const n = vistas.length;
      const malas = vistas.filter(v => v.estado !== 'ok' && v.estado !== 'pausa').length;
      const sub = `${n} ${n === 1 ? 'app' : 'apps'} · ` +
        (malas ? `${malas} ${malas === 1 ? 'pide' : 'piden'} atención` : 'todo en orden');
      raiz.innerHTML = this.cabecera(sub) +
        (n ? `<div class="lista">${vistas.map(v => tarjeta(v, total)).join('')}</div>` : '<div class="vacio">No hay apps en el panel.</div>');
      this.activarOrden(raiz);
      this.dispatchEvent(new CustomEvent('grow-panel-listo', { detail: { apps: n, atencion: malas } }));
    }
    // Asa de seis puntos: arrastrar (ratón o dedo) o flechas ↑ ↓ para cambiar el orden
    activarOrden(raiz) {
      const lista = raiz.querySelector('.lista');
      if (!lista) return;
      const guardar = () => {
        try { localStorage.setItem('growpanel.orden', JSON.stringify([...lista.children].map(el => el.dataset.id))); } catch (e) {}
      };
      // Al tocar una tarjeta: aviso «grow-panel-abrir» (cancelable). Si la página lo cancela, abre la app ella misma.
      lista.querySelectorAll('a.app').forEach(a => a.addEventListener('click', e => {
        const item = a.closest('.item');
        const ev = new CustomEvent('grow-panel-abrir', { cancelable: true, detail: { id: item.dataset.id, nombre: (a.querySelector('.fila b') || {}).textContent || '', url: a.href } });
        if (!this.dispatchEvent(ev)) e.preventDefault();
      }));
      lista.querySelectorAll('.asa').forEach(asa => {
        const item = asa.closest('.item');
        asa.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
        asa.addEventListener('keydown', e => {
          if (e.key === 'ArrowUp' && item.previousElementSibling) lista.insertBefore(item, item.previousElementSibling);
          else if (e.key === 'ArrowDown' && item.nextElementSibling) lista.insertBefore(item.nextElementSibling, item);
          else return;
          e.preventDefault(); asa.focus(); guardar();
        });
        asa.addEventListener('pointerdown', e => {
          e.preventDefault();
          // Se escucha en la ventana: al mover la tarjeta en la lista, el asa pierde el puntero
          item.classList.add('arrastrando');
          this._arrastrando = true;
          const mover = ev => {
            if (ev.clientY < 60) scrollBy(0, -12); else if (ev.clientY > innerHeight - 60) scrollBy(0, 12);
            const otro = [...lista.children].find(el => {
              if (el === item) return false;
              const r = el.getBoundingClientRect();
              return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
            });
            if (!otro) return;
            const items = [...lista.children];
            lista.insertBefore(item, items.indexOf(otro) < items.indexOf(item) ? otro : otro.nextElementSibling);
          };
          const soltar = () => {
            removeEventListener('pointermove', mover);
            removeEventListener('pointerup', soltar);
            removeEventListener('pointercancel', soltar);
            item.classList.remove('arrastrando');
            this._arrastrando = false;
            guardar();
          };
          addEventListener('pointermove', mover);
          addEventListener('pointerup', soltar);
          addEventListener('pointercancel', soltar);
        });
      });
    }
  }

  if (!customElements.get('grow-panel')) customElements.define('grow-panel', GrowPanel);
  window.GrowPanel = { VERSION };
})();
