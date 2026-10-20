"use strict";

// ========================================
// CONEXIÓN CON TU BACKEND FASTAPI
// ========================================
const API_BASE = "http://127.0.0.1:8000/api";

const ENDPOINTS = {
  "+": "/sumar",
  "-": "/restar",
  "*": "/multiplicar",
  "/": "/dividir",
};

// ========================================
// ELEMENTOS DEL HTML
// ========================================
const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const message = document.querySelector("#message");
const historyList = document.querySelector("#history-list");
const equalsButton = document.querySelector("#equals");
const clearHistoryButton = document.querySelector("#clear-history");

// ========================================
// ESTADO DE LA CALCULADORA
// ========================================
let input = "0";
let first = null;
let operation = null;
let newInput = true;
let busy = false;
let history = [];

// ========================================
// PETICIONES AL BACKEND
// ========================================
async function request(path, method = "GET") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `El servidor devolvió una respuesta no JSON (${response.status}).`,
        );
      }
    }

    if (!response.ok) {
      let detail = `Error HTTP ${response.status}`;

      if (typeof data?.detail === "string") {
        detail = data.detail;
      } else if (Array.isArray(data?.detail)) {
        detail = data.detail
          .map((error) => {
            const field = error.loc?.at(-1) ?? "Dato";
            return `${field}: ${error.msg}`;
          })
          .join(" · ");
      }

      throw new Error(detail);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function errorText(error) {
  if (error.name === "AbortError") {
    return "El servidor tardó demasiado. Revisa el historial antes de repetir la operación.";
  }

  if (error instanceof TypeError) {
    return "No se pudo conectar con Python. Revisa el servidor, API_BASE y CORS.";
  }

  return error.message;
}

// ========================================
// ACTUALIZAR PANTALLA
// ========================================
function render() {
  display.textContent = input;

  document.querySelectorAll("[data-operation]").forEach((button) => {
    const selected = button.dataset.operation === operation;

    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function setBusy(value) {
  busy = value;
  equalsButton.disabled = value;
  clearHistoryButton.disabled = value;
}

// ========================================
// ENTRADA DE NÚMEROS
// ========================================
function digit(value) {
  if (busy) return;

  if (newInput) {
    input = value;
    newInput = false;
  } else if (input.replace(/[-.]/g, "").length < 15) {
    if (input === "0") {
      input = value;
    } else if (input === "-0") {
      input = value === "0" ? "-0" : `-${value}`;
    } else {
      input += value;
    }
  }

  message.textContent = "";
  render();
}

function decimal() {
  if (busy) return;

  if (newInput) {
    input = "0.";
    newInput = false;
  } else if (!input.includes(".")) {
    input += ".";
  }

  message.textContent = "";
  render();
}

function backspace() {
  if (busy || newInput) return;

  input = input.slice(0, -1);

  if (input === "" || input === "-") {
    input = "0";
  }

  render();
}

function changeSign() {
  if (busy) return;

  if (newInput && operation) {
    input = "-0";
    newInput = false;
  } else {
    input = input.startsWith("-") ? input.slice(1) : `-${input}`;

    if (!operation) {
      newInput = false;
    }
  }

  render();
}

function reset() {
  if (busy) return;

  input = "0";
  first = null;
  operation = null;
  newInput = true;

  expression.textContent = "";
  message.textContent = "";

  render();
}

// ========================================
// SELECCIONAR OPERACIÓN
// ========================================
function selectOperation(value) {
  if (busy) return;

  if (operation && !newInput) {
    message.textContent =
      "Pulsa = para terminar la operación actual antes de elegir otra.";
    return;
  }

  first = Number(input);
  operation = value;
  newInput = true;

  expression.textContent = `${first} ${operation}`;
  message.textContent = "";

  render();
}

// ========================================
// CALCULAR MEDIANTE PYTHON
// ========================================
async function calculate(a, b, operator) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error("Ingresa números válidos.");
  }

  // AQUÍ SE CONECTAN TUS ENDPOINTS.
  // Ejemplo: GET /api/sumar?a=12&b=5
  const params = new URLSearchParams({ a, b });
  const data = await request(`${ENDPOINTS[operator]}?${params}`);

  // Tu controlador devuelve {"resultado": número}.
  if (typeof data?.resultado !== "number" || !Number.isFinite(data.resultado)) {
    throw new Error("El backend debe devolver un resultado numérico.");
  }

  return data.resultado;
}

async function equals() {
  if (busy) return;

  if (!operation || newInput) {
    message.textContent =
      "Ingresa el primer número, selecciona una operación e ingresa el segundo.";
    return;
  }

  const a = first;
  const b = Number(input);
  const operator = operation;

  setBusy(true);
  message.textContent = "Calculando…";

  try {
    const result = await calculate(a, b, operator);

    input = String(Number(result.toPrecision(12)));
    expression.textContent = `${a} ${operator} ${b} =`;

    first = null;
    operation = null;
    newInput = true;

    message.textContent = "";
    render();

    // Python debe guardar la operación desde el servicio.
    // Aquí solamente consultamos el historial actualizado.
    try {
      await loadHistory();
    } catch (error) {
      message.textContent =
        "Cálculo realizado. No se pudo actualizar el historial: " +
        errorText(error);
    }
  } catch (error) {
    message.textContent = errorText(error);
  } finally {
    setBusy(false);
    render();
  }
}

// ========================================
// CONSULTAR HISTORIAL DEL BACKEND
// ========================================
async function loadHistory() {
  // GET /api/historial
  // Respuesta esperada: {"historial": [...]}
  const data = await request("/historial");

  if (!Array.isArray(data?.historial)) {
    throw new Error('El endpoint /historial debe devolver {"historial": []}.');
  }

  // Tu repositorio agrega las operaciones al final.
  // Las invertimos para mostrar primero la más reciente.
  history = [...data.historial].reverse();

  renderHistory();
}

function renderHistory() {
  historyList.replaceChildren();

  if (history.length === 0) {
    const empty = document.createElement("div");
    empty.className = "history__item";
    empty.textContent = "Aún no hay operaciones guardadas.";
    historyList.append(empty);
    return;
  }

  const symbols = {
    suma: "+",
    sumar: "+",
    resta: "−",
    restar: "−",
    multiplicación: "×",
    multiplicacion: "×",
    multiplicar: "×",
    división: "÷",
    division: "÷",
    dividir: "÷",
  };

  history.forEach((row) => {
    const item = document.createElement("div");
    item.className = "history__item";

    // Claves exactas del diccionario de tu repositorio.
    const operationName = String(row["Operación"] ?? "");
    const symbol = symbols[operationName.toLowerCase()] ?? operationName;

    item.textContent =
      `${row["Primer número"]} ${symbol} ` +
      `${row["Segundo número"]} = ${row["Resultado"]}`;

    historyList.append(item);
  });
}

// ========================================
// ELIMINAR HISTORIAL EN PYTHON
// ========================================
async function deleteHistory() {
  if (busy) return;

  setBusy(true);
  message.textContent = "Borrando historial…";

  try {
    // AQUÍ SE CONECTA TU ENDPOINT DELETE.
    await request("/historial-eliminar", "DELETE");

    history = [];
    renderHistory();

    message.textContent = "Historial eliminado.";

    try {
      await loadHistory();
    } catch (error) {
      message.textContent =
        "Se eliminó el historial, pero no se pudo recargar: " +
        errorText(error);
    }
  } catch (error) {
    message.textContent = errorText(error);
  } finally {
    setBusy(false);
  }
}

// ========================================
// EVENTOS DE LOS BOTONES
// ========================================
document.querySelectorAll("[data-digit]").forEach((button) => {
  button.addEventListener("click", () => {
    digit(button.dataset.digit);
  });
});

document.querySelectorAll("[data-operation]").forEach((button) => {
  button.addEventListener("click", () => {
    selectOperation(button.dataset.operation);
  });
});

equalsButton.addEventListener("click", equals);
clearHistoryButton.addEventListener("click", deleteHistory);

document.querySelector("#reset")?.addEventListener("click", reset);
document.querySelector("#backspace")?.addEventListener("click", backspace);
document.querySelector("#decimal")?.addEventListener("click", decimal);
document.querySelector("#sign")?.addEventListener("click", changeSign);

// ========================================
// TECLADO
// ========================================
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (/^[0-9]$/.test(event.key)) {
    event.preventDefault();
    digit(event.key);
  } else if (Object.hasOwn(ENDPOINTS, event.key)) {
    event.preventDefault();
    selectOperation(event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    equals();
  } else if (event.key === "Escape") {
    event.preventDefault();
    reset();
  } else if (event.key === "Backspace") {
    event.preventDefault();
    backspace();
  } else if (event.key === "." || event.key === ",") {
    event.preventDefault();
    decimal();
  }
});

// ========================================
// INICIAR LA APLICACIÓN
// ========================================
async function initialize() {
  render();
  setBusy(true);
  message.textContent = "Cargando historial…";

  try {
    await loadHistory();
    message.textContent = "";
  } catch (error) {
    message.textContent = "No se pudo cargar el historial: " + errorText(error);
  } finally {
    setBusy(false);
  }
}

initialize();
