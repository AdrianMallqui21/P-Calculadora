import json
from pathlib import Path


def guardarOperacion(p_numero, s_numero, operacion, resultado):
    datos = {
        "Primer número": p_numero,
        "Segundo número": s_numero,
        "Operación": operacion,
        "Resultado": resultado,
    }

    carpeta = Path(__file__).resolve().parent.parent / "historial"
    carpeta.mkdir(parents=True, exist_ok=True)

    archivo = carpeta / "historico.json"
    historial = []

    if archivo.exists():
        with archivo.open("r", encoding="utf-8") as f:
            historial = json.load(f)

        # Conserva la operación guardada con tu formato anterior.
        if isinstance(historial, dict):
            historial = [historial]

    historial.append(datos)

    with archivo.open("w", encoding="utf-8") as f:
        json.dump(historial, f, ensure_ascii=False, indent=4)

    return datos


def listarOperaciones():
    carpeta = Path(__file__).resolve().parent.parent / "historial"
    archivo = carpeta / "historico.json"

    if not archivo.exists():
        return []

    with archivo.open("r", encoding="utf-8") as f:
        datos = json.load(f)

    return datos


def eliminarOperaciones():
    carpeta = Path(__file__).resolve().parent.parent / "historial"
    archivo = carpeta / "historico.json"

    if archivo.exists():
        archivo.unlink()

    return {"mensaje": "Historial eliminado correctamente"}
