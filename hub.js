/* Hub Gus — panel central del ecosistema Gus (apps personales · by Práctica Integral)
   Lee apps.json y la ficha de estado (estado.json) de cada app. Formato: FICHA.md

   Para ponerlo en cualquier app:
     <script src="https://gcalabro12.github.io/Hub-Gus/hub.js" defer></script>
     <hub-gus></hub-gus>

   Atributos opcionales de <hub-gus>:
     compacto            una línea por app, sin cifras
     ocultar="finan-gus" no mostrar esas apps (ids separados por comas), p. ej. la app anfitriona
     sin-titulo          sin la cabecera «Hub Gus»
     titulo="Mis apps"   cambiar el texto de la cabecera
     tema="claro|oscuro" forzar tema (por defecto sigue al sistema)
*/
(() => {
  const VERSION = 'v1.00';
  const BASE = new URL('.', document.currentScript ? document.currentScript.src : location.href).href;
  const ESTADOS = {
    ok: 'Todo bien', aviso: 'Con avisos', error: 'Con errores', pausa: 'En pausa', mudo: 'Sin noticias'
  };
  const ORDEN = { error: 0, aviso: 1, mudo: 2, pausa: 3, ok: 4 };

  const CSS = `
:host{--hb-bg:#ffffff;--hb-tx:#1d2330;--hb-mut:#6b7280;--hb-ln:#e5e7eb;--hb-sub:#f3f4f6;
  --hb-ok:#16a34a;--hb-aviso:#d97706;--hb-error:#dc2626;--hb-pausa:#64748b;--hb-mudo:#94a3b8;
  display:block;font-family:system-ui,"Segoe UI",sans-serif;color:var(--hb-tx)}
:host([tema=oscuro]){--hb-bg:#1b2029;--hb-tx:#e8eaee;--hb-mut:#9aa3b2;--hb-ln:#2a313d;--hb-sub:#232a35;
  --hb-ok:#4ade80;--hb-aviso:#fbbf24;--hb-error:#f87171;--hb-pausa:#94a3b8;--hb-mudo:#64748b}
@media (prefers-color-scheme:dark){:host(:not([tema=claro])){--hb-bg:#1b2029;--hb-tx:#e8eaee;--hb-mut:#9aa3b2;
  --hb-ln:#2a313d;--hb-sub:#232a35;--hb-ok:#4ade80;--hb-aviso:#fbbf24;--hb-error:#f87171;--hb-pausa:#94a3b8;--hb-mudo:#64748b}}
*{box-sizing:border-box}
.cab{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}
.cab h2{margin:0;font-size:20px;letter-spacing:-.2px}
.cab .sub{color:var(--hb-mut);font-size:13px;margin-top:2px}
.rec{border:1px solid var(--hb-ln);background:var(--hb-bg);color:var(--hb-mut);width:36px;height:36px;
  border-radius:50%;font-size:17px;cursor:pointer;flex:none}
.rec:hover{color:var(--hb-tx)}
.rec.girando{animation:g 1s linear infinite}@keyframes g{to{transform:rotate(360deg)}}
.lista{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
.app{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:start;padding:12px;border-radius:12px;
  background:var(--hb-bg);border:1px solid var(--hb-ln);border-left:4px solid var(--c);color:inherit;text-decoration:none}
a.app:hover{border-color:var(--c)}
.ico{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;font-size:22px;background:var(--hb-sub);overflow:hidden}
.ico img{width:100%;height:100%;object-fit:cover}
.fila{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.fila b{font-size:16px}
.ver{font-size:11px;font-weight:700;color:var(--hb-mut);background:var(--hb-sub);padding:1px 7px;border-radius:20px}
.cuando{margin-left:auto;font-size:12px;color:var(--hb-mut);white-space:nowrap}
.msg{display:flex;align-items:flex-start;gap:7px;font-size:14px;margin-top:3px;line-height:1.35}
.punto{width:9px;height:9px;border-radius:50%;background:var(--c);flex:none;margin-top:5px}
.cifras{grid-column:2;display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.cifras span{font-size:12px;color:var(--hb-mut);background:var(--hb-sub);border-radius:8px;padding:4px 8px}
.cifras b{color:var(--hb-tx);font-size:13px;font-variant-numeric:tabular-nums}
.vacio{color:var(--hb-mut);font-size:14px;padding:12px;border:1px dashed var(--hb-ln);border-radius:12px}
:host([compacto]) .lista{grid-template-columns:1fr;gap:6px}
:host([compacto]) .app{padding:8px 10px;align-items:center}
:host([compacto]) .ico{width:30px;height:30px;font-size:17px;border-radius:8px}
:host([compacto]) .cifras{display:none}
:host([compacto]) .msg{font-size:13px;margin-top:0}
`;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const urlSegura = u => /^https:\/\//.test(u || '') ? u : '';

  async function leerJSON(url) {
    const r = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    return r.json();
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

  // Une la entrada del registro con su ficha y decide el estado visible
  function combinar(app, f) {
    if (!f) return { app, estado: 'mudo', mensaje: 'Todavía no ha publicado su ficha' };
    const t = Date.parse(f.actualizado);
    const limite = (Number(f.frecuencia_horas) || 24) * 1.5 * 3600e3;
    const estado = ESTADOS[f.estado] && f.estado !== 'mudo' ? f.estado : 'aviso';
    const v = { app, f, t, estado, mensaje: f.mensaje || ESTADOS[estado] };
    if (!t || Date.now() - t > limite) {
      v.estado = 'mudo';
      v.mensaje = t ? `Sin ficha nueva desde el ${new Date(t).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}` : 'Ficha sin fecha';
    }
    return v;
  }

  function tarjeta(v) {
    const a = v.app, url = urlSegura(a.url), icono = urlSegura(a.icono);
    const tag = url ? 'a' : 'div';
    const attrs = url ? ` href="${esc(url)}" target="_blank" rel="noopener"` : '';
    const cifras = (v.f && Array.isArray(v.f.cifras) ? v.f.cifras.slice(0, 3) : [])
      .map(c => `<span><b>${esc(c.valor)}</b> ${esc(c.etiqueta)}</span>`).join('');
    return `<${tag} class="app" style="--c:var(--hb-${v.estado})"${attrs} title="${esc(a.nombre)} · ${esc(ESTADOS[v.estado])}">
  <span class="ico">${icono ? `<img src="${esc(icono)}" alt="">` : esc(a.emoji || '•')}</span>
  <span>
    <span class="fila"><b>${esc(a.nombre)}</b>${v.f && v.f.version ? `<span class="ver">${esc(v.f.version)}</span>` : ''}${v.t ? `<span class="cuando">${hace(v.t)}</span>` : ''}</span>
    <span class="msg"><i class="punto"></i>${esc(v.mensaje)}</span>
  </span>
  ${cifras ? `<span class="cifras">${cifras}</span>` : ''}
</${tag}>`;
  }

  class HubGus extends HTMLElement {
    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' }).innerHTML = `<style>${CSS}</style><div id="raiz"></div>`;
      this.cargar();
      this._t = setInterval(() => this.cargar(), 10 * 60e3);
      this._v = () => { if (!document.hidden) this.cargar(); };
      document.addEventListener('visibilitychange', this._v);
    }
    disconnectedCallback() {
      clearInterval(this._t);
      document.removeEventListener('visibilitychange', this._v);
    }
    async cargar() {
      const raiz = this.shadowRoot.getElementById('raiz');
      const rec = this.shadowRoot.querySelector('.rec');
      if (rec) rec.classList.add('girando');
      const turno = this._turno = (this._turno || 0) + 1; // solo pinta la carga más reciente
      try {
        const reg = await leerJSON(this.getAttribute('registro') || BASE + 'apps.json');
        const ocultar = (this.getAttribute('ocultar') || '').split(',').map(s => s.trim()).filter(Boolean);
        const apps = (reg.apps || []).filter(a => !ocultar.includes(a.id));
        const fichas = await Promise.all(apps.map(a => leerJSON(a.ficha).catch(() => null)));
        if (turno !== this._turno) return;
        const vistas = apps.map((a, i) => combinar(a, fichas[i])).sort((x, y) => ORDEN[x.estado] - ORDEN[y.estado]);
        this.pintar(raiz, reg, vistas);
      } catch (e) {
        if (turno !== this._turno) return;
        raiz.innerHTML = this.cabecera('No se pudo leer el Hub. Revisa la conexión.') + '<div class="vacio">Sin conexión con el Hub.</div>';
      }
      const r2 = this.shadowRoot.querySelector('.rec');
      if (r2) r2.onclick = () => this.cargar();
    }
    cabecera(sub) {
      if (this.hasAttribute('sin-titulo')) return '';
      return `<div class="cab"><div><h2>${esc(this.getAttribute('titulo') || 'Hub Gus')}</h2><div class="sub">${esc(sub)}</div></div>
        <button class="rec" title="Actualizar" aria-label="Actualizar">↻</button></div>`;
    }
    pintar(raiz, reg, vistas) {
      const n = vistas.length;
      const malas = vistas.filter(v => v.estado !== 'ok' && v.estado !== 'pausa').length;
      const sub = `Familia ${reg.familia || 'Gus'} · ${n} ${n === 1 ? 'app' : 'apps'} · ` +
        (malas ? `${malas} ${malas === 1 ? 'pide' : 'piden'} atención` : 'todo en orden');
      raiz.innerHTML = this.cabecera(sub) +
        (n ? `<div class="lista">${vistas.map(tarjeta).join('')}</div>` : '<div class="vacio">No hay apps en el Hub.</div>');
      this.dispatchEvent(new CustomEvent('hub-gus-listo', { detail: { apps: n, atencion: malas } }));
    }
  }

  if (!customElements.get('hub-gus')) customElements.define('hub-gus', HubGus);
  window.HubGus = { VERSION };
})();
