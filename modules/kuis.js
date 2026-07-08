/* kuis.js — Bank Soal. Simpan kuis per kelas, generate via AI, pakai ulang. */
(function () {
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function mount(view, ctx) {
    view.appendChild(UI.el("div", { class: "view-head" }, [
      UI.el("div", {}, [UI.el("div", { class: "kick", text: "Kuis" }), UI.el("h1", { class: "h1", text: "Bank Soal" }), UI.el("div", { class: "sub", text: "Kumpulan soal per kelas — buat manual atau pakai AI." })]),
      UI.el("button", { class: "btn btn-primary btn-sm", text: "+ Set Soal", onclick: function () { edit(null); } })
    ]));
    var listWrap = UI.el("div"); view.appendChild(listWrap);
    function data() { return Store.get("edu_kuis", []); }

    function render() {
      UI.clear(listWrap);
      var d = data();
      if (!d.length) { listWrap.appendChild(UI.el("div", { class: "panel" }, [UI.el("div", { class: "empty", html: "Belum ada bank soal.<br>Buat set kuis per kelas (manual atau ✦ AI) — tersimpan untuk dipakai ulang tiap angkatan." })])); return; }
      d.forEach(function (k) {
        var box = UI.el("div", { class: "panel mb16" }, [UI.el("div", { class: "flex between center mb16" }, [UI.el("div", {}, [UI.el("b", { style: "font-size:15px", text: k.kelas }), UI.el("span", { class: "sub", text: " · " + (k.soal || []).length + " soal" })]), UI.el("div", { class: "row gap8" }, [UI.el("button", { class: "btn btn-ghost btn-sm", text: "Edit", onclick: function () { edit(k); } }), UI.el("button", { class: "btn btn-ghost btn-sm", text: "×", onclick: function () { Store.set("edu_kuis", data().filter(function (y) { return y.id !== k.id; })); render(); } })])])]);
        (k.soal || []).forEach(function (s, i) {
          box.appendChild(UI.el("div", { style: "padding:9px 0;border-bottom:1px solid var(--line)" }, [
            UI.el("div", { style: "font-weight:600;font-size:14px", text: (i + 1) + ". " + s.q }),
            UI.el("div", { class: "sub", style: "margin-top:4px", text: (s.opsi || []).join("  ·  ") }),
            UI.el("span", { class: "pill pill-accent", style: "margin-top:6px", text: "Jawaban: " + s.jawaban })
          ]));
        });
        listWrap.appendChild(box);
      });
    }
    function edit(k) {
      var isNew = !k; k = k ? JSON.parse(JSON.stringify(k)) : { id: uid(), kelas: "", soal: [{ q: "", opsi: ["", "", ""], jawaban: "" }] };
      var fk = UI.el("input", { class: "input", placeholder: "Nama kelas" }); fk.value = k.kelas;
      var rows = UI.el("div");
      function draw() {
        UI.clear(rows);
        k.soal.forEach(function (s, i) {
          var q = UI.el("input", { class: "input", placeholder: "Pertanyaan " + (i + 1) }); q.value = s.q; q.oninput = function () { s.q = q.value; };
          var op = UI.el("input", { class: "input", placeholder: "Opsi pisah koma (a, b, c)" }); op.value = (s.opsi || []).join(", "); op.oninput = function () { s.opsi = op.value.split(",").map(function (z) { return z.trim(); }).filter(Boolean); };
          var jw = UI.el("input", { class: "input", placeholder: "Jawaban benar" }); jw.value = s.jawaban; jw.oninput = function () { s.jawaban = jw.value; };
          rows.appendChild(UI.el("div", { style: "border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:10px" }, [q, UI.el("div", { style: "height:8px" }), op, UI.el("div", { style: "height:8px" }), jw, UI.el("button", { class: "btn btn-ghost btn-sm mt16", text: "× Hapus soal", onclick: function () { k.soal.splice(i, 1); draw(); } })]));
        });
      }
      draw();
      var add = UI.el("button", { class: "btn btn-ghost btn-sm", text: "+ Soal", onclick: function () { k.soal.push({ q: "", opsi: ["", "", ""], jawaban: "" }); draw(); } });
      var ai = UI.el("button", { class: "btn btn-ghost btn-sm", text: "✦ Buat via AI", onclick: function () {
        if (!fk.value.trim()) { UI.toast("Isi nama kelas dulu", "err"); return; }
        if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu", "err"); ctx.shell.openSettings(); return; }
        UI.toast("AI menyusun soal…");
        ctx.ai.ask({ prompt: ctx.brain.context() + "\n\nBuat 5 soal kuis pilihan ganda untuk kelas \"" + fk.value.trim() + "\". Balas JSON {\"soal\":[{\"q\":\"\",\"opsi\":[\"a\",\"b\",\"c\"],\"jawaban\":\"\"}]}. Bahasa Indonesia.", json: true }).then(function (r) { if (r && r.soal) { k.soal = r.soal; draw(); UI.toast("Soal terisi", "ok"); } }).catch(function (e) { UI.toast(e.message, "err"); });
      } });
      var sv = UI.el("button", { class: "btn btn-primary", text: "Simpan" });
      var del = isNew ? UI.el("span") : UI.el("button", { class: "btn btn-ghost", text: "Hapus" });
      var m = UI.modal(isNew ? "Set soal baru" : "Edit set soal", UI.el("div", {}, [UI.el("label", { class: "fld" }, [UI.el("span", { text: "Kelas" }), fk]), UI.el("div", { class: "row gap8 mb16" }, [add, ai]), rows, UI.el("div", { class: "set-foot", style: "justify-content:space-between" }, [del, sv])]), { wide: true });
      sv.onclick = function () { k.kelas = fk.value.trim() || "Kelas"; var d = data(); var idx = -1; d.forEach(function (y, i) { if (y.id === k.id) idx = i; }); if (idx >= 0) d[idx] = k; else d.push(k); Store.set("edu_kuis", d); m.close(); UI.toast("Tersimpan", "ok"); render(); };
      if (!isNew) del.onclick = function () { Store.set("edu_kuis", data().filter(function (y) { return y.id !== k.id; })); m.close(); render(); };
    }
    render();
  }
  Shell.register({ id: "kuis", nama: "Kuis", ikon: "", sep: true, mount: mount });
})();
