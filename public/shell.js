const shell = document.querySelector(".j-mini-fixed-shell");
const mask = document.querySelector("#sheetMask");
const aiSheet = document.querySelector("#aiSheet");
let sheetReturnFocus = null;
let sheetBodyOverflow = "";

function openSheet(id) {
  if (id !== aiSheet.id || aiSheet.classList.contains("is-open")) return;
  sheetReturnFocus = document.activeElement;
  sheetBodyOverflow = document.body.style.overflow;
  aiSheet.classList.add("is-open");
  aiSheet.setAttribute("aria-hidden", "false");
  mask.classList.add("is-open");
  document.body.style.overflow = "hidden";
  shell.inert = true;
  aiSheet.querySelector("[data-close]").focus({ preventScroll: true });
}

function closeSheets() {
  if (!aiSheet.classList.contains("is-open")) return;
  aiSheet.classList.remove("is-open");
  aiSheet.setAttribute("aria-hidden", "true");
  mask.classList.remove("is-open");
  document.body.style.overflow = sheetBodyOverflow;
  shell.inert = false;
  if (sheetReturnFocus?.isConnected) sheetReturnFocus.focus({ preventScroll: true });
}

document.addEventListener("keydown", (event) => {
  if (!aiSheet.classList.contains("is-open")) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeSheets();
    return;
  }
  if (event.key !== "Tab") return;
  const controls = [...aiSheet.querySelectorAll("button, textarea, [tabindex]")].filter((control) =>
    !control.disabled && control.tabIndex >= 0 && !control.closest("[hidden]") && getComputedStyle(control).visibility !== "hidden"
  );
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (!aiSheet.contains(document.activeElement) ||
      (event.shiftKey && document.activeElement === first) ||
      (!event.shiftKey && document.activeElement === last)) {
    event.preventDefault();
    (event.shiftKey ? last : first)?.focus();
  }
});

aiSheet.querySelector("[data-close]").addEventListener("click", closeSheets);
mask.addEventListener("click", closeSheets);
