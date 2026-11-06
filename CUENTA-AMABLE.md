# Cuenta Amable: el mismo usuario en todas las apps y en todos los aparatos

Decidido por Gustavo el 6-11-2026 («camino 2»).

## La regla
**La Cuenta Amable es la cuenta de Google de la persona.** Google da a cada cuenta un número fijo (`sub`), igual en todas
las apps y en todos los aparatos. El registro diario y Grow Panel identifican a la persona por ese número, así que:
- entra con «Continuar con Google» en cualquier app o en Grow Panel → es la misma persona en todas;
- móvil y PC ven lo mismo, sin claves ni códigos.

Hoy cada app tiene su propio sistema de cuentas:

| App | Cuentas | ¿Google? |
|---|---|---|
| Amable Life | Firebase `equilibra-6aff8` | sí («Continuar con Google») |
| Amable Fit | Firebase `app-unbreakable` | sí |
| Amable PC | Worker propio `amable-pc-api` | sí («Continuar con Google») |
| Amable Meta | Worker propio `metas-amables-api` | por confirmar |
| Grow Panel | ninguna → «Entrar con Google» (usa el proyecto Firebase de Amable Life, que ya admite gcalabro12.github.io) |

No hace falta mover las cuentas de cada app: basta con que todas reconozcan el mismo `sub` de Google.

## Fases
1. **Registro diario con Google** (Grow Panel, este chat):
   - El Worker `registro-diario` acepta, además de la clave, un token de Firebase (de `equilibra-6aff8` o `app-unbreakable`)
     de una persona que entró con Google. Lo verifica de verdad (firma RS256 con las claves públicas de Google, `aud`, `iss`, `exp`)
     y guarda sus números bajo `google:<sub>`.
   - `POST /vincular`: une la clave que ya usaba ese navegador con su cuenta de Google y pasa sus datos. Desde entonces, lo que
     llegue con esa clave va a su cuenta. Así las apps que ya envían con clave (PC 2.55, Life 3.54, Fit 2.25) siguen funcionando.
   - Grow Panel: botón «Entrar con Google» en «Mi registro diario». Al entrar, vincula sola la clave del navegador y enseña
     el registro de la cuenta: el mismo en el móvil y en el PC.
2. **Apps con Firebase + Google (Life, Fit):** envían con su token de Firebase en vez de la clave. Funciona en cualquier aparato
   donde la persona haya entrado con Google, también en las apps instaladas.
3. **Apps con Worker propio (PC, Meta):** su Worker guarda el `sub` de Google al entrar y lo usa para enviar al registro
   (por ejemplo, reenviando el token de Google o con una firma entre Workers). Se decide con sus chats.
4. **«Mismo nivel» dentro de cada app:** es la sincronización en la nube de cada app con su cuenta. Cada chat revisa que,
   entrando con Google, sus datos sean los mismos en el móvil y en el PC.

## Cómo aseguramos que es la misma persona
- En todas las apps, **«Continuar con Google» es la forma principal de entrar** (primer botón).
- El registro solo acepta identidades verificadas por Google (nunca un correo escrito a mano).
- Si alguien entró con correo y contraseña en una app, esa app le propone «Unir con tu cuenta de Google».
