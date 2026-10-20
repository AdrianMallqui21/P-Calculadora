from fastapi import FastAPI, HTTPException, APIRouter
import servicios.main as servicios

app = FastAPI(
    title="Calculadora API",
    description="API para realizar operaciones matemáticas básicas",
    version="1.0.0",
)
router = APIRouter(prefix="/api")


@router.get("/sumar")
def sumar(a: float, b: float):
    try:
        resultado = servicios.sumar(a, b)
        return {"resultado": resultado}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restar")
def restar(a: float, b: float):
    try:
        resultado = servicios.restar(a, b)
        return {"resultado": resultado}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/multiplicar")
def multiplicar(a: float, b: float):
    try:
        resultado = servicios.multiplicar(a, b)
        return {"resultado": resultado}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/dividir")
def dividir(a: float, b: float):
    try:
        resultado = servicios.dividir(a, b)
        return {"resultado": resultado}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


app.include_router(router)


@router.get("/historial")
def historial():
    try:
        operaciones = servicios.listarOperaciones()
        return {"historial": operaciones}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/historial-eliminar")
def eliminarOperaciones():
    try:
        resultado = servicios.eliminarOperaciones()
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
