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
- Si la app se abre a pantalla completa desde una tarjeta de Grow Panel (apps de otra dirección), el archivo pone arriba una barra oscura **«← Volver a Grow Panel»** durante esa pestaña. Dentro del visor de Grow Panel no sale.
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
- **Desde v1.13 la clave se crea sola** al abrir Grow Panel (nunca se cambia una que ya existe) y el usuario no la ve salvo que la busque.
- **Apps en otra dirección (Amable Meta, Amable Fit…):** al abrirlas desde una tarjeta de Grow Panel, la clave viaja detrás de `#gpclave=`
  (esa parte de la dirección nunca se envía a internet). `grow-panel-boton.js` la guarda en esa dirección y la quita de la barra al momento.
  Desde entonces `GrowPanel.clave()` también funciona ahí. Solo se pasa a direcciones que están en `apps.json`.
  Riesgo aceptado: la clave solo da acceso a números de uso.
- **Regla de Gustavo (6-nov-2026): nada de claves a la vista y el envío ACTIVADO DE SERIE** (se puede apagar). Sin campo «Pega tu clave», sin la palabra «clave». Al enviar, leer `localStorage.getItem('growpanel.clave')` o `GrowPanel.clave()` (en el momento de enviar, no al arrancar). Si no hay clave, no se envía y no se avisa. La clave llega sola al abrir la app desde Grow Panel.
- Nunca pongas la clave en una query (`?`), en `#ficha`, en `apps.json`, en un commit ni en notas.
- Nombres de app en el registro: campo `registro` de `apps.json` (`amable-pc`, `amable-life`, `amable-meta`, `amable-fit`, `amable-flow`…).

## Hora del resumen del día (desde v1.21, 6-11-2026)
- La persona elige en Grow Panel (pestaña «Resumen del día» o «Ajustes») a qué hora quiere su resumen del día. Por defecto, 20:00.
- Se guarda en el registro diario, en su cuenta: es la misma en el móvil y en el PC.
- Las apps la leen antes de programar el envío:
  `GET https://registro-diario.proud-hill-016b.workers.dev/ajustes` con la misma autorización que usan para enviar
  (token de Firebase o clave) → `{"hora_resumen":"21:30","elegida":true}`. Si falla, usar 20:00.
- Las apps de gcalabro12.github.io también tienen `GrowPanel.horaResumen()` (copia local, sin red).

## Los números del día los manda Grow Panel (desde v1.22, 6-11-2026)
Gustavo: «Grow Panel lo pide a la aplicación y ésta le pasa el dato». La app no tiene que enviar nada al registro:
- En su resumen (`GrowPanel.resumen({...})`) añade `datos`: los números del día con nombre en minúsculas,
  p. ej. `datos: { pasos: 6420, pausas_vista: 5, minutos_concentracion: 95 }` (máx. 20, solo números) y, si quiere, `fecha: "AAAA-MM-DD"`
  (por defecto, hoy).
- Grow Panel los manda al registro diario con el id de `registro` de apps.json (cuenta de Google o clave): al abrirse, al volver a él,
  al cerrar una app abierta debajo de él y cuando la app actualiza su ficha en otra pestaña del mismo navegador.
- Solo manda datos de hoy o de ayer, solo si han cambiado, y nunca si todo vale 0 (sería una copia vacía de la app en ese navegador).
- Las apps de otra dirección pasan la ficha con «#ficha=» al volver a Grow Panel; también vale `datos`.

## Buzón común: los números llegan durante el día (decidido por Gustavo el 6-11-2026)
Grow Panel es el centro: al pulsar «Actualizar datos» o abrir «Resumen del día» recoge al momento lo último de todas las apps,
estén en el móvil o en el PC. Como no puede preguntar a una app cerrada en otro aparato, cada app deja sus números en el
buzón común (el registro diario) en cuanto cambian:
- `POST /registro {"fecha":"AAAA-MM-DD","app":"<id>","datos":{...}}` con la cuenta de Google (token) o la clave.
  El mismo día se sobrescribe, así que se puede mandar muchas veces.
- Cuándo: cada vez que hay un cambio significativo (p. ej. +100 pasos, +5 min, una tarea o sesión nueva), agrupando: como mucho
  una vez cada 5 minutos; también al abrir la app, al volver a ella y al irse
  (`visibilitychange` → oculto, con `fetch(..., {keepalive:true})`). Si la app cuenta en segundo plano (pasos), también cada 15 min.
- No mandar si todo vale 0 y ya se mandaron números ese día.
- La hora del resumen (GET /ajustes) es la hora a la que se cierra el día, no la del envío.
- Las apps de gcalabro12.github.io pueden además poner `datos` en su ficha: Grow Panel los manda él (ver arriba).
- El Worker solo cambia la hora de «enviado» si el número cambia de verdad. Grow Panel la usa para decir en cada app
  «actualizado hace 30 min / hace 1 h»: así se sabe desde cuándo están al día sus números.
