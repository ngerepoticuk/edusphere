/* murid.js — Daftar Murid. Progress belajar, status bayar, insight nunggak. */
(function () {
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function mount(view, ctx) {
    view.appendChild(UI.el("div", { class: "view-head" }, [
      UI.el("div", {}, [UI.el("div", { class: "kick", text: "Murid" }), UI.el("h1", { class: "h1", text: "Daftar Murid" }), UI.el("div", { class: "sub", text: "Pantau progress belajar & status pembayaran." })]),
      UI.el("button", { class: "btn btn-primary btn-sm", text: "+ Murid", onclick: function () { edit(null); } })
    ]));
    var sumWrap = UI.el("div"); view.appendChild(sumWrap);
    var insWrap = UI.el("div"); view.appendChild(insWrap);
    var listWrap = UI.el("div", { class: "panel mt16" }); view.appendChild(listWrap);
    function data() { return Store.get("edu_murid", []); }

    function render() {
      var d = data();
      var lunas = d.filter(function (x) { return x.bayar === "lunas"; });
      var nunggak = d.filter(function (x) { return x.bayar !== "lunas"; });
      var avg = d.length ? Math.round(d.reduce(function (s, x) { return s + (+x.progress || 0); }, 0) / d.length) : 0;
      UI.clear(sumWrap);
      sumWrap.appendChild(UI.el("div", { class: "cards" }, [
        UI.el("div", { class: "card" }, [UI.el("div", { class: "clbl", text: "Total Murid" }), UI.el("div", { class: "cval", text: d.length + "" })]),
        UI.el("div", { class: "card raise" }, [UI.el("div", { class: "clbl", text: "Rata-rata Progress" }), UI.el("div", { class: "cval", text: avg + "%" })]),
        UI.el("div", { class: "card" }, [UI.el("div", { class: "clbl", text: "Belum Bayar" }), UI.el("div", { class: "cval", style: "color:" + (nunggak.length ? "var(--warn)" : "var(--ok)"), text: nunggak.length + "" }), UI.el("div", { class: "cdelta", text: lunas.length + " lunas" })])
      ]));
      UI.clear(insWrap);
      if (!d.length) { listWrap.style.display = "none"; insWrap.appendChild(UI.el("div", { class: "panel mt16" }, [UI.el("div", { class: "empty", html: "Belum ada murid.<br>Tambah murid + kelas yang diikuti — pantau progress & tandai yang belum bayar." })])); return; }
      listWrap.style.display = "block";
      if (nunggak.length) insWrap.appendChild(UI.el("div", { class: "insight mt16", style: "border-left:3px solid var(--warn)" }, [UI.el("div", { class: "ic-emoji", style: "color:var(--warn)", text: "💰" }), UI.el("div", { style: "flex:1;font-size:14px", text: nunggak.length + " murid belum bayar: " + nunggak.slice(0, 3).map(function (x) { return x.nama; }).join(", ") + ". Ingatkan dengan sopan." })]));
      UI.clear(listWrap);
      listWrap.appendChild(UI.el("div", { class: "kick mb16", text: "Daftar murid" }));
      d.forEach(function (x) {
        var p = +x.progress || 0;
        listWrap.appendChild(UI.el("div", { style: "padding:11px 0;border-bottom:1px solid var(--line)" }, [
          UI.el("div", { class: "flex between center" }, [
            UI.el("div", { class: "flex center gap12" }, [UI.avatar(x.nama), UI.el("div", {}, [UI.el("b", { style: "font-size:14px", text: x.nama }), UI.el("span", { class: "sub", text: " · " + (x.kelas || "") })])]),
            UI.el("div", { class: "row gap8 center" }, [UI.el("button", { class: "pill " + (x.bayar === "lunas" ? "pill-accent" : "pill-primary"), style: "cursor:pointer;border:none", text: x.bayar === "lunas" ? "Lunas" : "Belum", onclick: function () { var dd = data(); var t = dd.filter(function (y) { return y.id === x.id; })[0]; if (t) t.bayar = t.bayar === "lunas" ? "belum" : "lunas"; Store.set("edu_murid", dd); render(); } }), UI.el("button", { class: "btn btn-ghost btn-sm", text: "Edit", onclick: function () { edit(x); } }),
              (x.bayar !== "lunas" && x.kontak) ? UI.el("button", { class: "btn btn-ghost btn-sm", title: "Tagih via WA", onclick: function () { WA.send(x.kontak, WA.tagihan({ nama: x.nama, jumlah: 0, untuk: "Biaya kelas " + (x.kelas || "") })); } }, [UI.icon("brand-whatsapp")]) : null,
              UI.el("button", { class: "btn btn-ghost btn-sm", title: "Rapor PDF", onclick: function () {
                Doc.laporan("Rapor Progres — " + x.nama, [
                  { stats: [{ label: "Kelas", val: x.kelas || "-" }, { label: "Progres", val: (x.progress || 0) + "%" }, { label: "Status bayar", val: x.bayar === "lunas" ? "Lunas" : "Belum lunas" }] },
                  { h: "Catatan", table: { head: ["Aspek", "Keterangan"], rows: [["Kehadiran & progres", (x.progress || 0) + "% materi selesai"], ["Rekomendasi", (x.progress || 0) >= 80 ? "Siap lanjut ke level berikutnya" : "Perlu pendampingan pada modul tersisa"]] } }
                ], { sub: "RAPOR MURID" });
              } }, [UI.icon("printer")])])
          ]),
          UI.el("div", { class: "flex center gap8", style: "margin-top:8px" }, [UI.el("div", { style: "flex:1;height:6px;border-radius:6px;background:var(--line);overflow:hidden" }, [UI.el("div", { style: "height:100%;width:" + p + "%;background:" + (p >= 100 ? "var(--ok)" : "var(--accent)") })]), UI.el("span", { class: "mono", style: "font-size:11px;color:var(--muted)", text: p + "%" })])
        ]));
      });
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), nama: "", kelas: "", progress: 0, bayar: "belum", kontak: "" };
      function f(l, v, ph, ty) { var i = UI.el("input", { class: "input", placeholder: ph || "", type: ty || "text" }); i.value = v; return { el: UI.el("label", { class: "fld" }, [UI.el("span", { text: l }), i]), i: i }; }
      var fn = f("Nama murid", x.nama, "Andi");
      var fk = f("Kelas diikuti", x.kelas, "Dasar Fotografi HP");
      var fp = f("Progress (%)", x.progress || 0, "0", "number");
      var fc = f("Kontak", x.kontak, "0812xxxx");
      var sv = UI.el("button", { class: "btn btn-primary", text: "Simpan" });
      var del = isNew ? UI.el("span") : UI.el("button", { class: "btn btn-ghost", text: "Hapus" });
      var m = UI.modal(isNew ? "Murid baru" : "Edit murid", UI.el("div", {}, [fn.el, fk.el, fp.el, fc.el, UI.el("div", { class: "set-foot", style: "justify-content:space-between" }, [del, sv])]));
      sv.onclick = function () { x.nama = fn.i.value.trim(); x.kelas = fk.i.value.trim(); x.progress = Math.min(100, +fp.i.value || 0); x.kontak = fc.i.value.trim(); if (!x.nama) { UI.toast("Nama wajib", "err"); return; } var d = data(); var idx = -1; d.forEach(function (y, i) { if (y.id === x.id) idx = i; }); if (idx >= 0) d[idx] = x; else d.push(x); Store.set("edu_murid", d); m.close(); UI.toast("Tersimpan", "ok"); render(); };
      if (!isNew) del.onclick = function () { Store.set("edu_murid", data().filter(function (y) { return y.id !== x.id; })); m.close(); render(); };
    }
    render();
  }
  Shell.register({ id: "murid", nama: "Murid", ikon: "", sep: true, mount: mount });
})();
