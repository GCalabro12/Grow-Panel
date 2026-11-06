# Botón de Grow Panel en las apps

Cada app lleva **arriba, en la cabecera**, un botón redondo con la mini flor que abre Grow Panel.
Solo aparece cuando el usuario tiene **2 apps o más**. Lo hace todo un único archivo común:
`https://gcalabro12.github.io/Grow-Panel/grow-panel-boton.js`. No se copia: se enlaza, y así
cualquier mejora llega a todas las apps a la vez.

## Lo que añade cada app (2 líneas)

1. Donde quieras el botón, en la cabecera (normalmente arriba a la derecha):

```html
<span id="grow-panel-boton"></span>
```

2. Antes de `</body>`, con el `data-app` y el `data-nombre` de tu app:

```html
<script src="https://gcalabro12.github.io/Grow-Panel/grow-panel-boton.js" data-app="ID-DE-LA-APP" data-nombre="Nombre de la app" defer></script>
```

| App | data-app | data-nombre |
|---|---|---|
| Amable Money (ex Finan Gus) | `finan-gus` | `Amable Money` |
| PC & Body-mind | `pc-body-mind` | `PC & Body-mind` |
| Amable Fit: Calistenia (ex Calistenia) | `calistenia` | `Amable Fit: Calistenia` |
| Amable Meta (ex Metas Amables / Amable Skills) | `metas-amables` | `Amable Meta` |
| Amable Flow (ex Flow) | `flow` | `Amable Flow` |
| Amable Music (ex Mi Reproductor) | `mi-reproductor` | `Amable Music` |
| Delicioso | `delicioso` | `Delicioso` |

## Cómo funciona

- Al abrirse, la app se apunta en la memoria del navegador (`localStorage`, clave `growpanel.apps`): solo nombre y dirección.
  Las apps de `gcalabro12.github.io` comparten esa memoria, así que se ven entre sí.
- Las apps de otra dirección (Calistenia, Mi Reproductor) se enteran cuando se abren **desde Grow Panel**:
  el enlace trae `?growpanel=N` y la app lo recuerda (`growpanel.n`). La dirección se limpia sola.
- Al tocar el botón se abre Grow Panel con un botón **«← Volver a la app»**.
- El botón mide 34 × 34 px. Si hay que adaptarlo a los colores de la app, se puede usar el selector `#grow-panel-boton .gp-boton`
  (por ejemplo, el borde). No cambies la mini flor.
- Si la app tiene service worker, no hace falta tocarlo: el archivo viene de otra ruta y siempre se pide a la red.

## Resumen de la app en Grow Panel (fase 2)

Cada vez que cambian los datos que importan (al abrir la app, al terminar un entreno, al sumar pasos…), la app llama a:

```js
GrowPanel.resumen({
  estado: 'ok',            // 'ok' (verde) · 'aviso' (ámbar: algo pendiente hoy) · 'error' (rojo) · 'pausa' (gris)
  mensaje: 'Entreno de hoy hecho ✓',          // una frase, máx. 90 caracteres
  cifras: [                                    // hasta 3, valor máx. 12 caracteres y etiqueta máx. 30
    { valor: 6, etiqueta: 'días de racha' },
    { valor: '3/5', etiqueta: 'esta semana' },
    { valor: '32 min', etiqueta: 'último' }
  ],
  version: 'v1.39'                             // opcional
});
```

- Si tu código se ejecuta antes de que cargue el botón, espera al evento:
  `addEventListener('growpanel-listo', () => GrowPanel.resumen({...}))`
  o deja los datos en `window.growPanelResumen = {...}` y el botón los recoge al cargar.
- El resumen **se queda en el navegador del usuario** (`localStorage` «growpanel.fichas»). No se sube a ningún servidor.
  - Apps de `gcalabro12.github.io`: Grow Panel lo ve al momento.
  - Apps de otra dirección (Calistenia…): viaja al tocar el botón, detrás de `#` en el enlace (esa parte nunca se envía a internet).
- Si pasan más de 36 horas sin resumen nuevo, la tarjeta se pone gris («Sin ficha nueva desde…»).
- Solo números y frases cortas: nada que no quieras ver en una tarjeta.


## Registro diario: la clave de Grow Panel (desde Grow Panel v1.10)

Grow Panel crea la **clave de Grow Panel** de cada usuario (sección «📊 Mi registro diario»). La apps la usan para mandar
sus números al registro diario (`https://registro-diario.proud-hill-016b.workers.dev`, detalles en `APPs WEBs\Registro diario\LEEME.md`).

- Se guarda en `localStorage` con el nombre `growpanel.clave` (43 caracteres `A-Za-z0-9_-`).
- **Apps en gcalabro12.github.io** (Amable PC, Amable Flow, Amable Life…), abiertas en el mismo navegador que Grow Panel:
  `GrowPanel.clave()` devuelve la clave, sin pedir nada al usuario. En otras direcciones, o si no hay clave, devuelve `null`.
- **Qué clave gana:** si `GrowPanel.clave()` devuelve una clave, se usa esa. Si devuelve `null`, se usa la que el usuario pegó en la app.
- **Apps en otra dirección y apps instaladas (APK / WebView / TWA)** no ven la memoria del navegador: necesitan el campo
  «Pega tu clave de Grow Panel» (en «Mi resumen diario»). Mismo texto en todas las apps.
- Nunca pongas la clave en una URL, en `#ficha`, en `apps.json`, en un commit ni en notas.
- Nombres de app en el registro: campo `registro` de `apps.json` (`amable-pc`, `amable-life`, `amable-meta`, `amable-fit`, `amable-flow`…).
