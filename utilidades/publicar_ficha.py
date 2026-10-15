"""Publica la ficha de estado de una app del ecosistema Gus en su repo de GitHub (sin git local).

Uso: python publicar_ficha.py GCalabro12/<Repo> <ruta>/estado.json
Necesita `gh` con sesión iniciada. La web (GitHub Pages) se actualiza en ~1 minuto.
"""
import base64
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def publicar(repo, ruta, destino="estado.json"):
    contenido = Path(ruta).read_bytes()
    json.loads(contenido)  # no publicar una ficha rota
    r = subprocess.run(["gh", "api", f"repos/{repo}/contents/{destino}", "--jq", ".sha"],
                       capture_output=True, text=True)
    sha = r.stdout.strip() if r.returncode == 0 else ""
    datos = {
        "message": f"Ficha de estado {datetime.now():%Y-%m-%d %H:%M}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>",
        "content": base64.b64encode(contenido).decode(),
        "branch": "main",
    }
    if sha:
        datos["sha"] = sha
    subprocess.run(["gh", "api", "-X", "PUT", f"repos/{repo}/contents/{destino}", "--input", "-", "--jq", ".commit.sha"],
                   input=json.dumps(datos), text=True, check=True)
    print(f"Ficha publicada en {repo}/{destino}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    publicar(sys.argv[1], sys.argv[2], *sys.argv[3:4])
