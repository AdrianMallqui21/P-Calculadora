def sumar(a: float, b: float):
    if a is None or b is None:
        raise ValueError("Tiene que ingresar dos números")

    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Los valores deben ser números")

    return a + b


def restar(a: float, b: float):
    if a is None or b is None:
        raise ValueError("Tiene que ingresar dos números")

    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Los valores deben ser números")

    return a - b


def multiplicar(a: float, b: float):
    if a is None or b is None:
        raise ValueError("Tiene que ingresar dos números")

    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Los valores deben ser números")

    return a * b


def dividir(a: float, b: float):
    if a is None or b is None:
        raise ValueError("Tiene que ingresar dos números")

    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Los valores deben ser números")

    if b == 0:
        raise ValueError("No se puede dividir por cero")

    return a / b
