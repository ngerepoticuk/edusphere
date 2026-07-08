/* progres.js — Progress Kurikulum. Lacak penyelesaian modul kelas,
   persen progres, insight kelas mana yang macet. */
(function () {
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function mount(view, ctx) {
    if (window.Remind) { var __rp = Remind.panel(ctx); __rp.classList.add("mb16"); view.appendChild(__rp); }
    view.appendChild(UI.hero({
      kick: "Progres", title: "Progress Kurikulum",
      sub: "Pantau penyelesaian tiap kelas, modul demi modul.",
      actions: [UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { tambah(); } }, [UI.icon("plus"), "Kelas baru"])]
    }));
    var insWrap = UI.el("div"); view.appendChild(insWrap);
    var listWrap = UI.el("div", { class: "mt16" }); view.appendChild(listWrap);

    function data() { return Store.get("edu_progres", []); }
    function pct(k) { return k.modul.length ? Math.round(k.modul.filter(function (m) { return m.done; }).length / k.modul.length * 100) : 0; }

    function render() {
      var d = data();
      UI.clear(insWrap); UI.clear(listWrap);
      if (!d.length) { insWrap.appendChild(UI.el("div", { class: "panel" }, [UI.el("div", { class: "empty", html: "Belum ada kelas.<br>Tambah kelas + daftar modulnya — centang yang selesai, app hitung progres & tandai yang macet." })])); return; }
      var avg = Math.round(d.reduce(function (s, k) { return s + pct(k); }, 0) / d.length);
      var macet = d.filter(function (k) { return pct(k) > 0 && pct(k) < 50; });
      var belum = d.filter(function (k) { return pct(k) === 0; });
      insWrap.appendChild(UI.el("div", { class: "cards" }, [
        UI.el("div", { class: "card" }, [UI.el("div", { class: "clbl", text: "Total Kelas" }), UI.el("div", { class: "cval", text: d.length + "" })]),
        UI.el("div", { class: "card" }, [UI.el("div", { class: "clbl", text: "Rata-rata Progres" }), UI.el("div", { class: "cval", text: avg + "%" }), UI.el("div", { class: "cdelta " + (avg >= 70 ? "up" : ""), text: avg >= 70 ? "on track" : "perlu didorong" })]),
        UI.el("div", { class: "card" }, [UI.el("div", { class: "clbl", text: "Selesai" }), UI.el("div", { class: "cval", text: d.filter(function (k) { return pct(k) === 100; }).length + "" })])
      ]));
      if (macet.length || belum.length) insWrap.appendChild(UI.el("div", { class: "insight mt16", style: "border-left:3px solid var(--warn)" }, [UI.el("div", { class: "ic-emoji", style: "color:var(--warn)", text: "◷" }), UI.el("div", { style: "flex:1;font-size:14px", text: (macet.length ? macet.length + " kelas macet (<50%). " : "") + (belum.length ? belum.length + " kelas belum mulai: " + belum.slice(0, 2).map(function (k) { return k.nama; }).join(", ") + "." : "") })]));

      d.forEach(function (k) {
        var p = pct(k);
        var box = UI.el("div", { class: "panel mb16" }, [
          UI.el("div", { class: "flex between center" }, [UI.el("b", { style: "font-size:15px", text: k.nama }), UI.el("span", { class: "pill " + (p === 100 ? "pill-accent" : "pill-primary"), text: p + "%" })]),
          UI.el("div", { style: "height:7px;border-radius:6px;background:var(--line);margin:10px 0 14px;overflow:hidden" }, [UI.el("div", { style: "height:100%;width:" + p + "%;background:" + (p === 100 ? "var(--ok)" : "var(--accent)") })])
        ]);
        k.modul.forEach(function (m, i) {
          box.appendChild(UI.el("label", { class: "flex center gap8", style: "padding:6px 0;cursor:pointer;font-size:14px" + (m.done ? ";opacity:.55;text-decoration:line-through" : "") }, [
            UI.el("input", { type: "checkbox", checked: m.done ? "checked" : null, onchange: function () { var a = data(); var t = a.filter(function (y) { return y.id === k.id; })[0]; if (t) t.modul[i].done = !t.modul[i].done; Store.set("edu_progres", a); render(); } }),
            document.createTextNode(m.text)
          ]));
        });
        box.appendChild(UI.el("button", { class: "btn btn-ghost btn-sm mt16", text: "× Hapus kelas", onclick: function () { Store.set("edu_progres", data().filter(function (y) { return y.id !== k.id; })); render(); } }));
        listWrap.appendChild(box);
      });
    }

    function tambah() {
      var nama = UI.el("input", { class: "input", placeholder: "Nama kelas, mis. Dasar Fotografi HP" });
      var mods = UI.el("textarea", { class: "input", rows: "5", placeholder: "Daftar modul, 1 per baris:\nModul 1: Pengenalan\nModul 2: Komposisi\n…" });
      var save = UI.el("button", { class: "btn btn-primary", text: "Buat kelas" });
      var m = UI.modal("Kelas baru", UI.el("div", {}, [UI.el("label", { class: "fld" }, [UI.el("span", { text: "Nama kelas" }), nama]), UI.el("label", { class: "fld" }, [UI.el("span", { text: "Modul (1 per baris)" }), mods]), UI.el("p", { class: "hint", text: "Tip: tempel kurikulum dari modul Kelas untuk langsung dilacak." }), UI.el("div", { class: "set-foot" }, [save])]));
      save.onclick = function () { if (!nama.value.trim()) { UI.toast("Isi nama kelas", "err"); return; } var list = mods.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean); if (!list.length) { UI.toast("Isi minimal 1 modul", "err"); return; } Store.push("edu_progres", { id: uid(), t: Date.now(), nama: nama.value.trim(), modul: list.map(function (s) { return { text: s, done: false }; }) }); m.close(); UI.toast("Kelas dibuat", "ok"); render(); };
    }
    render();
  }
  Shell.register({ id: "progres", nama: "Progres", ikon: "◧", sep: true, mount: mount });
})();
