# Ficha de estado — ecosistema Gus

Cada app de la familia **Gus** (apps personales · by Práctica Integral) publica un archivo
`estado.json` en la raíz de su web (`https://gcalabro12.github.io/<Repo>/estado.json`).
El **Hub Gus** lee esas fichas y muestra el estado de todas las apps en un solo panel.

## Formato (ficha 1)

```json
{
  "ficha": 1,
  "id": "finan-gus",
  "app": "Finan Gus",
  "familia": "Gus",
  "version": "v1.11",
  "estado": "ok",
  "mensaje": "Sin facturas nuevas hoy",
  "cifras": [
    { "valor": 14, "etiqueta": "en el registro" }
  ],
  "actualizado": "2026-10-15T09:12:00+02:00",
  "frecuencia_horas": 24
}
```

| Campo | Qué es |
|---|---|
| `ficha` | Versión del formato. Ahora `1`. |
| `id` | Igual que en `apps.json` del Hub (minúsculas y guiones). |
| `app` | Nombre visible. |
| `familia` | Siempre `"Gus"`. |
| `version` | Versión de la app (`"v1.11"`) o `null` si no tiene. |
| `estado` | `ok` (verde) · `aviso` (ámbar, hay algo que mirar) · `error` (rojo, algo falló) · `pausa` (gris, apagada a propósito). |
| `mensaje` | Una frase corta (máx. ~80 caracteres) que resume el estado. |
| `cifras` | Hasta 3 recuentos `{valor, etiqueta}`. Opcional. |
| `actualizado` | Fecha y hora ISO 8601 con zona horaria. |
| `frecuencia_horas` | Cada cuántas horas se renueva la ficha. Si pasa 1,5 veces ese tiempo sin ficha nueva, el Hub la muestra como **«Sin noticias»**. |

## Reglas

1. **Nada privado.** Los repos son públicos: solo recuentos, versión y fechas.
   Nunca nombres, importes, asuntos de correo, direcciones ni enlaces a datos.
2. La ficha la genera un script de cada app (no se escribe a mano) y se publica con
   `python "15 Hub Gus/utilidades/publicar_ficha.py" GCalabro12/<Repo> <ruta>/estado.json`.
3. Los enlaces e iconos de cada app los pone el Hub (`apps.json`), no la ficha.

## Añadir una app nueva al Hub

1. Crear su script de ficha (ver `12 App Finan Gus/utilidades/ficha_estado.py` como ejemplo).
2. Añadir la app a `apps.json` (id, nombre, ficha, url, icono o emoji) y publicar el Hub.
3. Añadir el paso «genera y publica la ficha» a la tarea o rutina que actualiza la app.
