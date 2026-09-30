/* =========================================================
   ELEMENTOS
========================================================= */

const openMessage = document.getElementById("openMessage");
const closeMessage = document.getElementById("closeMessage");
const messageOverlay = document.getElementById("messageOverlay");
const scene = document.querySelector(".scene");
const notebook = document.querySelector(".notebook");

const startExam = document.getElementById("startExam");

const countdownOverlay = document.getElementById("countdownOverlay");
const countdownNumber = document.getElementById("countdownNumber");

const petalsContainer = document.getElementById("petals");

/* =========================================================
   ESTADO
========================================================= */

let countdownRunning = false;
let countdownToken = 0;
let notebookHideTimer = 0;
let notebookPinned = false;
let suppressNotebookFocus = false;

function revealNotebook(pin = false) {
  window.clearTimeout(notebookHideTimer);

  if (pin) notebookPinned = true;

  scene.classList.add("notebook-open");
  notebook.setAttribute("aria-hidden", "false");
}

function hideNotebook(force = false) {
  if (!force && (notebookPinned || messageOverlay.classList.contains("active"))) return;

  window.clearTimeout(notebookHideTimer);
  scene.classList.remove("notebook-open");
  notebook.setAttribute("aria-hidden", "true");
}

function scheduleNotebookHide() {
  window.clearTimeout(notebookHideTimer);
  notebookHideTimer = window.setTimeout(() => {
    const pointerIsOverTrigger = openMessage.matches(":hover");
    const pointerIsOverSheet = notebook.matches(":hover");
    const triggerHasFocus = document.activeElement === openMessage;

    if (notebookPinned || messageOverlay.classList.contains("active")) return;
    if (pointerIsOverTrigger || pointerIsOverSheet || triggerHasFocus) return;

    hideNotebook(true);
  }, 180);
}

openMessage.addEventListener("pointerenter", () => revealNotebook());
openMessage.addEventListener("pointerleave", scheduleNotebookHide);
openMessage.addEventListener("focus", () => {
  if (!suppressNotebookFocus) revealNotebook();
});
openMessage.addEventListener("blur", scheduleNotebookHide);
notebook.addEventListener("pointerenter", () => revealNotebook());
notebook.addEventListener("pointerleave", scheduleNotebookHide);

/* =========================================================
   PÉTALOS
========================================================= */

function createPetal() {
  if (!petalsContainer) return;

  const petal = document.createElement("span");

  petal.className = "petal";

  petal.style.left = Math.random() * 100 + "vw";

  petal.style.setProperty("--drift", Math.random() * 180 - 90 + "px");

  petal.style.animationDuration = 5 + Math.random() * 6 + "s";

  const size = 10 + Math.random() * 8;

  petal.style.width = size + "px";

  petal.style.height = size * 1.5 + "px";

  petal.style.transform = `rotate(${Math.random() * 360}deg)`;

  petalsContainer.appendChild(petal);

  setTimeout(() => {
    petal.remove();
  }, 13000);
}

/* =========================================================
   PÉTALOS AMBIENTALES
========================================================= */

setInterval(createPetal, 850);

/* =========================================================
   PÉTALOS ESPECIALES
========================================================= */

function createMessagePetals() {
  for (let i = 0; i < 22; i++) {
    setTimeout(() => {
      createPetal();
    }, i * 45);
  }
}

/* =========================================================
   ABRIR CARTA
========================================================= */

openMessage.addEventListener("click", () => {
  if (countdownRunning) return;

  /*
   * Limpiamos únicamente
   * estados del botón.
   */

  openMessage.classList.remove("message-return");

  openMessage.classList.remove("message-hidden");

  openMessage.classList.remove("message-opening");

  /*
   * Abrimos la carta.
   */

  revealNotebook(true);

  messageOverlay.removeAttribute("inert");

  messageOverlay.classList.add("active");

  messageOverlay.setAttribute("aria-hidden", "false");

  closeMessage.focus({ preventScroll: true });

  /*
   * Pétalos.
   */

  createMessagePetals();
});

/* =========================================================
   CERRAR CARTA
========================================================= */

function closeMessageCard() {
  if (countdownRunning) return;

  /*
   * Cerramos la carta.
   */

  messageOverlay.classList.remove("active");

  notebookPinned = false;
  hideNotebook(true);

  /*
   * Quitamos cualquier estado
   * de regreso del contador.
   */

  messageOverlay.classList.remove("from-countdown");

  if (messageOverlay.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  messageOverlay.setAttribute("inert", "");

  messageOverlay.setAttribute("aria-hidden", "true");

  suppressNotebookFocus = true;
  openMessage.focus({ preventScroll: true });
  suppressNotebookFocus = false;

  /*
   * Recuperamos el botón.
   */

  openMessage.classList.remove("message-hidden");

  openMessage.classList.remove("message-opening");

  openMessage.classList.remove("message-return");

  /*
   * Reiniciamos la animación
   * del botón.
   */

  void openMessage.offsetWidth;

  openMessage.classList.add("message-return");

  /*
   * Limpiamos la clase.
   */

  setTimeout(() => {
    openMessage.classList.remove("message-return");
  }, 550);
}

closeMessage.addEventListener("click", closeMessageCard);

/* =========================================================
   CERRAR HACIENDO CLICK AFUERA
========================================================= */

messageOverlay.addEventListener("click", (event) => {
  if (event.target === messageOverlay) {
    closeMessageCard();
  }
});

/* =========================================================
   ESC PARA CERRAR CARTA
========================================================= */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && messageOverlay.classList.contains("active")) {
    closeMessageCard();
  }
});

/* =========================================================
   ESPERA
========================================================= */

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/* =========================================================
   CAMBIAR NÚMERO
========================================================= */

function showCountdownNumber(number) {
  countdownNumber.classList.remove("countdown-pop");

  void countdownNumber.offsetWidth;

  countdownNumber.textContent = number;

  countdownNumber.classList.add("countdown-pop");
}

/* =========================================================
   CONTADOR
========================================================= */

async function startCountdown() {
  if (countdownRunning) return;

  countdownRunning = true;

  const token = ++countdownToken;

  /* =====================================================
       1. CERRAMOS LA CARTA
    ===================================================== */

  messageOverlay.classList.remove("active");

  messageOverlay.classList.remove("from-countdown");

  if (messageOverlay.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  messageOverlay.setAttribute("inert", "");

  messageOverlay.setAttribute("aria-hidden", "true");

  /* =====================================================
       2. ESPERAMOS A QUE DESAPAREZCA
    ===================================================== */

  await sleep(450);

  if (token !== countdownToken) return;

  /* =====================================================
       3. MOSTRAMOS EL CONTADOR
    ===================================================== */

  countdownOverlay.classList.remove("countdown-finale");

  countdownOverlay.classList.add("active");

  countdownOverlay.removeAttribute("inert");

  countdownOverlay.setAttribute("aria-hidden", "false");

  /* =====================================================
       3
    ===================================================== */

  showCountdownNumber("3");

  countdownNumber.focus({ preventScroll: true });

  await sleep(1000);

  if (token !== countdownToken) return;

  /* =====================================================
       2
    ===================================================== */

  showCountdownNumber("2");

  await sleep(1000);

  if (token !== countdownToken) return;

  /* =====================================================
       1
    ===================================================== */

  showCountdownNumber("1");

  await sleep(1000);

  if (token !== countdownToken) return;

  /* =====================================================
       MOMENTO FINAL
    ===================================================== */

  countdownNumber.classList.remove("countdown-pop");

  void countdownNumber.offsetWidth;

  countdownNumber.textContent = "♡";

  countdownNumber.classList.add("countdown-pop");

  countdownOverlay.classList.add("countdown-finale");

  createMessagePetals();

  /* =====================================================
       DEJAMOS EL MOMENTO FINAL
    ===================================================== */

  await sleep(1600);

  if (token !== countdownToken) return;

  /* =====================================================
       4. CERRAMOS CONTADOR
    ===================================================== */

  countdownOverlay.classList.remove("active");

  countdownOverlay.classList.remove("countdown-finale");

  if (countdownOverlay.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  countdownOverlay.setAttribute("inert", "");

  countdownOverlay.setAttribute("aria-hidden", "true");

  /* =====================================================
       5. REGRESA LA CARTA
    ===================================================== */

  messageOverlay.classList.add("from-countdown");

  messageOverlay.removeAttribute("inert");

  messageOverlay.classList.add("active");

  messageOverlay.setAttribute("aria-hidden", "false");

  startExam.focus({ preventScroll: true });

  createMessagePetals();

  /*
   * IMPORTANTE:
   *
   * NO quitamos "from-countdown"
   * después de 900 ms.
   *
   * La dejamos mientras la carta
   * permanezca abierta para evitar
   * que vuelva a ejecutarse la
   * animación original de la carta.
   */

  countdownRunning = false;
}

/* =========================================================
   BOTÓN "ANTES DE EMPEZAR"
========================================================= */

startExam.addEventListener("click", startCountdown);

/* =========================================================
   ESC DURANTE EL CONTADOR
========================================================= */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && countdownOverlay.classList.contains("active")) {
    /*
     * Cancelamos el contador actual.
     */

    countdownToken++;

    countdownRunning = false;

    /*
     * Cerramos contador.
     */

    countdownOverlay.classList.remove("active");

    countdownOverlay.classList.remove("countdown-finale");

    if (countdownOverlay.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    countdownOverlay.setAttribute("inert", "");

    countdownOverlay.setAttribute("aria-hidden", "true");

    /*
     * Regresamos a la carta.
     */

    messageOverlay.removeAttribute("inert");

    messageOverlay.classList.add("active");

    messageOverlay.setAttribute("aria-hidden", "false");

    startExam.focus({ preventScroll: true });
  }
});
