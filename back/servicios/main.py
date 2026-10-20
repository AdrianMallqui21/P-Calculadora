import repositorios.main as repositorios


def sumar(a: float, b: float):
    if a is None or b is None:
        raise ValueError("Tiene que ingresar dos números")

    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Los valores deben ser números")
    resultado = a + b
    repositorios.guardarOperacion(a, b, "+", resultado)

    return resultado


def restar(a: float, b: float):
    if a is None or b is None:
        raise ValueError("Tiene que ingresar dos números")

    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Los valores deben ser números")
    resultado = a - b
    repositorios.guardarOperacion(a, b, "-", resultado)

    return resultado


def multiplicar(a: float, b: float):
    if a is None or b is None:
        raise ValueError("Tiene que ingresar dos números")

    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Los valores deben ser números")
    resultado = a * b
    repositorios.guardarOperacion(a, b, "*", resultado)

    return resultado


def dividir(a: float, b: float):
    if a is None or b is None:
        raise ValueError("Tiene que ingresar dos números")

    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Los valores deben ser números")

    if b == 0:
        raise ValueError("No se puede dividir por cero")

    resultado = a / b
    repositorios.guardarOperacion(a, b, "/", resultado)

    return resultado


def listarOperaciones():
    return repositorios.listarOperaciones()


def eliminarOperaciones():
    return repositorios.eliminarOperaciones()
