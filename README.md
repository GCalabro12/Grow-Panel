# Hub Gus

Panel central de las apps personales de la **familia Gus** · by Práctica Integral.

- Web: https://gcalabro12.github.io/Hub-Gus/
- Cada app publica su ficha `estado.json` (formato en [FICHA.md](FICHA.md)); el Hub las lee desde [apps.json](apps.json).
- Para ponerlo dentro de cualquier app:

```html
<script src="https://gcalabro12.github.io/Hub-Gus/hub.js" defer></script>
<hub-gus ocultar="id-de-esta-app"></hub-gus>
```
