from fastapi import FastAPI, HTTPException, APIRouter
import servicios.app as servicios

app = FastAPI(title="Servicios Calculadora", version="1.0.0")
