# Sellos de las apps

Cada app lleva **dos botones separados**, uno al lado del otro (si no caben, el segundo baja debajo):

1. **by Práctica Integral**: punto verde, enlaza a https://practicaintegral.club
2. **with Grow Panel**: mini flor de Grow Panel en lugar del punto, enlaza a https://practicaintegral.club/grow-panel/

Los dos se abren en una pestaña nueva. Los colores de borde y de texto se adaptan a cada app.

```html
<div class="sellos">
  <a class="pi-seal" href="https://practicaintegral.club" target="_blank" rel="noopener">by Práctica Integral</a>
  <a class="gp-seal" href="https://practicaintegral.club/grow-panel/" target="_blank" rel="noopener"><svg viewBox="0 0 512 512" aria-hidden="true"><circle cx="256" cy="107.5" r="69.1" fill="#f59e0b"/><circle cx="397.2" cy="210.1" r="69.1" fill="#0f766e"/><circle cx="343.3" cy="376.1" r="69.1" fill="#8b5cf6"/><circle cx="168.7" cy="376.1" r="69.1" fill="#3b82f6"/><circle cx="114.8" cy="210.1" r="69.1" fill="#ef4444"/><circle cx="256" cy="256" r="79.4" fill="#6b7280"/></svg>with Grow Panel</a>
</div>
```

```css
.sellos{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.pi-seal,.gp-seal{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:.3px;
  color:#94A3B8;border:1px solid #334155;border-radius:999px;padding:6px 12px;text-decoration:none}
.pi-seal::before{content:"";width:7px;height:7px;border-radius:50%;background:#4ADE80}
.gp-seal svg{width:14px;height:14px;flex:none}
.pi-seal:hover{border-color:#4ADE80}
.gp-seal:hover{border-color:#8b5cf6}
```

Logo oficial de Grow Panel: `logo/grow-panel-logo.svg` (fondo claro) y `logo/grow-panel-logo-oscuro.svg` (fondo oscuro).
Publicados en https://gcalabro12.github.io/Grow-Panel/logo.svg y https://gcalabro12.github.io/Grow-Panel/logo-oscuro.svg.
