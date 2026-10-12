/* Confirmaciones sin ventanas del navegador: algunos lugares (como una página publicada)
   bloquean confirm() y alert(). Acá se confirma tocando dos veces el mismo botón. */
(function () {
  function toast(msg) {
    let t = document.getElementById("fxToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "fxToast";
      t.style.cssText = "position:fixed;left:50%;bottom:40px;transform:translateX(-50%);z-index:100000;max-width:90vw;background:#1a1408;color:#ffe9a8;border:2px solid #f4d77b;border-radius:14px;padding:14px 18px;font:600 15px Inter,Arial,sans-serif;box-shadow:0 10px 30px #000a;text-align:center";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(t._h);
    t._h = setTimeout(() => { t.style.display = "none"; }, 3800);
  }
  let last = null;
  window.confirm = function (msg) {
    const now = Date.now();
    if (last && last.msg === msg && now - last.t < 4000) { last = null; const t = document.getElementById("fxToast"); if (t) t.style.display = "none"; return true; }
    last = { msg, t: now };
    toast(String(msg) + " 👉 Tocá de nuevo para confirmar.");
    return false;
  };
  window.alert = function (msg) { toast(String(msg)); };
})();
