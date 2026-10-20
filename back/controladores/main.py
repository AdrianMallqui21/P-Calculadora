from fastapi import FastAPI, HTTPException, APIRouter
import servicios.main as servicios

app = FastAPI()
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
