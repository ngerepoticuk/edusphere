/* pin.js — kunci PIN pemilik utk halaman sensitif (laporan, pengaturan).
   Pakai: Pin.guard(function(){ ...render... }, view) — minta PIN bila diset & belum unlock sesi ini.
   Pin.section() → blok pengaturan (aktif/ganti/hapus PIN). Hash sederhana + salt (bukan kripto bank,
   cukup utk mencegah karyawan iseng buka laporan). */
window.Pin = (function () {
  var unlocked = false;
  function h(s) { var x = 5381 + (window.APP ? APP.id.length : 0); s = "jx7" + s + "q2"; for (var i = 0; i < s.length; i++) { x = ((x << 5) + x + s.charCodeAt(i)) | 0; } return String(x); }
  function isSet() { return !!Store.get("__pin"); }
  function check(p) { return Store.get("__pin") === h(p); }

  function ask(onOk, judul) {
    var inp = UI.el("input", { class: "input", type: "password", inputmode: "numeric", maxlength: "6", placeholder: "PIN 4-6 digit", style: "text-align:center;font-size:22px;letter-spacing:.4em" });
    var msg = UI.el("div", { class: "muted", style: "font-size:12px;min-height:16px;margin-top:6px" });
    var ok = UI.el("button", { class: "btn btn-primary", text: "Buka", style: "width:100%" });
    var body = UI.el("div", {}, [
      UI.el("p", { class: "muted", style: "margin:0 0 10px", text: judul || "Halaman ini dikunci pemilik." }),
      inp, msg, UI.el("div", { style: "margin-top:10px" }, [ok])
    ]);
    var m = UI.modal("🔒 Masukkan PIN", body);
    function submit() {
      if (check(inp.value)) { unlocked = true; m.close(); onOk && onOk(); }
      else { msg.textContent = "PIN salah."; inp.value = ""; inp.focus(); }
    }
    ok.addEventListener("click", submit);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    setTimeout(function () { inp.focus(); }, 60);
  }

  function guard(render, view) {
    if (!isSet() || unlocked) { render(); return; }
    if (view) {
      UI.clear(view);
      view.appendChild(UI.el("div", { class: "card", style: "max-width:420px;margin:40px auto;text-align:center" }, [
        UI.el("div", { style: "font-size:34px;margin-bottom:8px" }, [UI.icon("lock")]),
        UI.el("h3", { text: "Dikunci Pemilik" }),
        UI.el("p", { class: "muted", text: "Bagian ini butuh PIN. Masukkan PIN untuk membuka." }),
        UI.el("button", { class: "btn btn-primary", text: "Masukkan PIN", onclick: function () { ask(render); } })
      ]));
    } else ask(render);
  }

  /* blok utk modal Pengaturan */
  function section() {
    var wrap = UI.el("div", {});
    function paint() {
      UI.clear(wrap);
      if (isSet()) {
        wrap.appendChild(UI.el("div", { class: "row gap8" }, [
          UI.el("button", { class: "btn btn-ghost btn-sm", text: "Ganti PIN", onclick: function () { setNew(); } }),
          UI.el("button", { class: "btn btn-ghost btn-sm", text: "Hapus PIN", onclick: function () {
            ask(function () { Store.del("__pin"); unlocked = false; UI.toast("PIN dihapus", "ok"); paint(); }, "Masukkan PIN lama untuk menghapus.");
          } })
        ]));
      } else {
        wrap.appendChild(UI.el("button", { class: "btn btn-ghost btn-sm", text: "Aktifkan PIN", onclick: setNew }));
      }
    }
    function setNew() {
      var inp = UI.el("input", { class: "input", type: "password", inputmode: "numeric", maxlength: "6", placeholder: "PIN baru 4-6 digit", style: "text-align:center;font-size:20px;letter-spacing:.35em" });
      var inp2 = UI.el("input", { class: "input", type: "password", inputmode: "numeric", maxlength: "6", placeholder: "Ulangi PIN", style: "text-align:center;font-size:20px;letter-spacing:.35em;margin-top:8px" });
      var msg = UI.el("div", { class: "muted", style: "font-size:12px;min-height:16px;margin-top:6px" });
      var ok = UI.el("button", { class: "btn btn-primary", text: "Simpan PIN", style: "width:100%;margin-top:10px" });
      var m = UI.modal("Atur PIN", UI.el("div", {}, [inp, inp2, msg, ok]));
      ok.addEventListener("click", function () {
        var p = inp.value.trim();
        if (!/^\d{4,6}$/.test(p)) { msg.textContent = "PIN harus 4-6 angka."; return; }
        if (p !== inp2.value.trim()) { msg.textContent = "PIN tidak sama."; return; }
        Store.set("__pin", h(p)); unlocked = true; m.close(); UI.toast("PIN aktif 🔒", "ok"); paint();
      });
      setTimeout(function () { inp.focus(); }, 60);
    }
    paint();
    return wrap;
  }

  return { guard: guard, ask: ask, isSet: isSet, section: section };
})();
