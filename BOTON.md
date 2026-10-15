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
| Finan Gus | `finan-gus` | `Finan Gus` |
| PC & Body-mind | `pc-body-mind` | `PC & Body-mind` |
| Calistenia | `calistenia` | `Calistenia` |

## Cómo funciona

- Al abrirse, la app se apunta en la memoria del navegador (`localStorage`, clave `growpanel.apps`): solo nombre y dirección.
  Las apps de `gcalabro12.github.io` comparten esa memoria, así que se ven entre sí.
- Las apps de otra dirección (Calistenia, Mi Reproductor) se enteran cuando se abren **desde Grow Panel**:
  el enlace trae `?growpanel=N` y la app lo recuerda (`growpanel.n`). La dirección se limpia sola.
- Al tocar el botón se abre Grow Panel con un botón **«← Volver a la app»**.
- El botón mide 34 × 34 px. Si hay que adaptarlo a los colores de la app, se puede usar el selector `#grow-panel-boton .gp-boton`
  (por ejemplo, el borde). No cambies la mini flor.
- Si la app tiene service worker, no hace falta tocarlo: el archivo viene de otra ruta y siempre se pide a la red.
