# Grow Panel

El panel central de las apps de Práctica Integral: un vistazo al estado de todas. Se activa a partir de la segunda app.
*Apps para crecer, conectadas para crecer más.*

- Web: https://gcalabro12.github.io/Grow-Panel/
- Cada app publica su ficha `estado.json` (formato en [FICHA.md](FICHA.md)); el panel las lee desde [apps.json](apps.json).
- Logo: flor de aros (centro gris = Grow Panel, 5 pétalos de color = apps), en `logo/`.
- Para ponerlo dentro de cualquier app:

```html
<script src="https://gcalabro12.github.io/Grow-Panel/grow-panel.js" defer></script>
<grow-panel ocultar="id-de-esta-app"></grow-panel>
```

Las apps llevan el sello «by Práctica Integral with Grow Panel».
