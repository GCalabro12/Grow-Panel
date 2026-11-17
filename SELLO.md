# Sellos de las apps

Cada app lleva **dos botones separados**, uno al lado del otro (si no caben, el segundo baja debajo):

1. **by Práctica Integral**: muñequito negro con la D azul del logotipo de Práctica Integral en lugar del punto (desde el 18-11-2026; antes era un punto verde), enlaza a https://practicaintegral.club
2. **with Grow Panel**: mini flor de Grow Panel en lugar del punto, enlaza a https://practicaintegral.club/grow-panel/

Los dos se abren en una pestaña nueva. Los colores de borde y de texto se adaptan a cada app.

```html
<div class="sellos">
  <a class="pi-seal" href="https://practicaintegral.club" target="_blank" rel="noopener">by Práctica Integral</a>
  <a class="gp-seal" href="https://practicaintegral.club/grow-panel/" target="_blank" rel="noopener"><svg viewBox="0 0 512 512" aria-hidden="true"><path d="M256 256L110.2 55.4A248 248 0 0 1 401.8 55.4Z" fill="#f59e0b"/><path d="M256 256L401.8 55.4A248 248 0 0 1 491.9 332.6Z" fill="#0f766e"/><path d="M256 256L491.9 332.6A248 248 0 0 1 256.0 504.0Z" fill="#8b5cf6"/><path d="M256 256L256.0 504.0A248 248 0 0 1 20.1 332.6Z" fill="#3b82f6"/><path d="M256 256L20.1 332.6A248 248 0 0 1 110.2 55.4Z" fill="#ef4444"/><path d="M256 256L109.1 53.7" stroke="#fff" stroke-width="7" fill="none"/><path d="M256 256L402.9 53.7" stroke="#fff" stroke-width="7" fill="none"/><path d="M256 256L493.8 333.3" stroke="#fff" stroke-width="7" fill="none"/><path d="M256 256L256.0 506.0" stroke="#fff" stroke-width="7" fill="none"/><path d="M256 256L18.2 333.3" stroke="#fff" stroke-width="7" fill="none"/><circle cx="256" cy="256" r="130" fill="#fff"/><circle cx="256" cy="256" r="98" fill="#6b7280"/></svg>with Grow Panel</a>
</div>
```

```css
.sellos{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.pi-seal,.gp-seal{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:.3px;
  line-height:16px;white-space:nowrap;color:#94A3B8;border:1px solid #334155;border-radius:999px;padding:6px 12px;text-decoration:none}
.pi-seal::before{content:"";width:18px;height:16px;flex:none;border-radius:4px;
  background:#fff url(https://gcalabro12.github.io/Grow-Panel/logo-pi-sello.png) no-repeat center/contain}
.gp-seal svg{width:14px;height:14px;flex:none}
.pi-seal:hover{border-color:#4ADE80}
.gp-seal:hover{border-color:#8b5cf6}
```

Logo oficial de Grow Panel: `logo/grow-panel-logo.svg` (fondo claro) y `logo/grow-panel-logo-oscuro.svg` (fondo oscuro).
Publicados en https://gcalabro12.github.io/Grow-Panel/logo.svg y https://gcalabro12.github.io/Grow-Panel/logo-oscuro.svg.

Logo del sello «by Práctica Integral»: `logo-pi-sello.png` (muñequito negro + D azul, fondo transparente), publicado en https://gcalabro12.github.io/Grow-Panel/logo-pi-sello.png. En apps de fondo oscuro lleva el fondito blanco (`background:#fff`) para que el muñequito negro se vea; en apps de fondo claro se puede quitar ese blanco (`background-color:transparent`).

Notas de las apps que ya lo llevan: `line-height` fija la altura (16px → 30 px; Calistenia usó 15px y Lety Videz 14px para igualar su sello anterior). `white-space:nowrap` evita que el texto se parta en varias líneas en pantallas estrechas.
