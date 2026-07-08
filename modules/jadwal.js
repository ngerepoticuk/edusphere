/* jadwal.js — Jadwal Kelas/Sesi. Countdown sesi terdekat. */
(function () {
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function dleft(t) { return Math.ceil((t - Date.now()) / 864e5); }

  function mount(view, ctx) {
    view.appendChild(UI.el("div", { class: "view-head" }, [
      UI.el("div", {}, [UI.el("div", { class: "kick", text: "Jadwal" }), UI.el("h1", { class: "h1", text: "Jadwal Kelas" }), UI.el("div", { class: "sub", text: "Sesi mendatang + hitung mundur." })]),
      UI.el("button", { class: "btn btn-primary btn-sm", text: "+ Sesi", onclick: function () { edit(null); } })
    ]));
    var insWrap = UI.el("div"); view.appendChild(insWrap);
    var listWrap = UI.el("div", { class: "panel mt16" }); view.appendChild(listWrap);
    function data() { return Store.get("edu_jadwal", []).sort(function (a, b) { return (a.tanggal || 0) - (b.tanggal || 0); }); }

    function render() {
      UI.clear(insWrap); UI.clear(listWrap);
      var d = data();
      if (!d.length) { listWrap.appendChild(UI.el("div", { class: "empty", html: "Belum ada jadwal.<br>Tambah sesi kelas (tanggal, jam, topik) — sesi terdekat dihitung mundur otomatis." })); return; }
      var upcoming = d.filter(function (x) { return x.tanggal && x.tanggal >= Date.now() - 864e5; });
      if (upcoming[0]) insWrap.appendChild(UI.el("div", { class: "briefing mb16" }, [UI.el("div", { class: "bh", text: "◆ Sesi terdekat" }), UI.el("p", { html: "<b>" + upcoming[0].topik + "</b> — " + (dleft(upcoming[0].tanggal) <= 0 ? "hari ini" : dleft(upcoming[0].tanggal) + " hari lagi") + " (" + (upcoming[0].jam || "") + "). Siapkan materi." })]));
      listWrap.appendChild(UI.el("div", { class: "kick mb16", text: "Semua sesi" }));
      d.forEach(function (x) {
        var dl = x.tanggal ? dleft(x.tanggal) : null;
        listWrap.appendChild(UI.el("div", { class: "flex between center", style: "padding:11px 0;border-bottom:1px solid var(--line)" }, [
          UI.el("div", {}, [UI.el("b", { style: "font-size:14px", text: x.topik }), UI.el("div", { class: "sub", text: (x.kelas ? x.kelas + " · " : "") + (x.tanggal ? new Date(x.tanggal).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }) : "") + (x.jam ? " " + x.jam : "") + (dl != null ? (dl < 0 ? " · selesai" : dl === 0 ? " · hari ini" : " · " + dl + "h lagi") : "") })]),
          UI.el("button", { class: "btn btn-ghost btn-sm", text: "Edit", onclick: function () { edit(x); } })
        ]));
      });
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), topik: "", kelas: "", tanggal: Date.now() + 864e5, jam: "19:00" };
      function f(l, v, ph, ty) { var i = UI.el("input", { class: "input", placeholder: ph || "", type: ty || "text" }); i.value = v; return { el: UI.el("label", { class: "fld" }, [UI.el("span", { text: l }), i]), i: i }; }
      var ft = f("Topik sesi", x.topik, "Modul 3: Editing");
      var fk = f("Kelas", x.kelas, "Dasar Fotografi");
      var fd = f("Tanggal", x.tanggal ? new Date(x.tanggal).toISOString().slice(0, 10) : "", "", "date");
      var fj = f("Jam", x.jam, "", "time");
      var sv = UI.el("button", { class: "btn btn-primary", text: "Simpan" });
      var del = isNew ? UI.el("span") : UI.el("button", { class: "btn btn-ghost", text: "Hapus" });
      var m = UI.modal(isNew ? "Sesi baru" : "Edit sesi", UI.el("div", {}, [ft.el, fk.el, fd.el, fj.el, UI.el("div", { class: "set-foot", style: "justify-content:space-between" }, [del, sv])]));
      sv.onclick = function () { x.topik = ft.i.value.trim(); x.kelas = fk.i.value.trim(); x.tanggal = fd.i.value ? new Date(fd.i.value).getTime() : null; x.jam = fj.i.value; if (!x.topik) { UI.toast("Isi topik", "err"); return; } var d = Store.get("edu_jadwal", []); var idx = -1; d.forEach(function (y, i) { if (y.id === x.id) idx = i; }); if (idx >= 0) d[idx] = x; else d.push(x); Store.set("edu_jadwal", d); m.close(); UI.toast("Tersimpan", "ok"); render(); };
      if (!isNew) del.onclick = function () { Store.set("edu_jadwal", Store.get("edu_jadwal", []).filter(function (y) { return y.id !== x.id; })); m.close(); render(); };
    }
    render();
  }
  Shell.register({ id: "jadwal", nama: "Jadwal", ikon: "", mount: mount });
})();
