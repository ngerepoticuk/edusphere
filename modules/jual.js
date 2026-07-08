/* jual.js — deskripsi kelas + sales page + teks sertifikat. */
(function () {
  function mount(view, ctx) {
    view.appendChild(UI.el("div", { class: "view-head" }, [
      UI.el("div", {}, [UI.el("div", { class: "kick", text: "Jual" }), UI.el("h1", { class: "h1", text: "Sales & Sertifikat" }), UI.el("div", { class: "sub", text: "Deskripsi kelas, sales page, dan teks sertifikat." })])
    ]));
    var bar = UI.el("div", { class: "panel mb16" });
    var nama = UI.el("input", { class: "input", placeholder: "Nama kelas" });
    var hasil = UI.el("input", { class: "input", placeholder: "Hasil/transformasi yang didapat murid" });
    bar.appendChild(UI.el("div", { class: "grid2" }, [
      UI.el("label", { class: "fld", style: "margin:0" }, [UI.el("span", { text: "Nama kelas" }), nama]),
      UI.el("label", { class: "fld", style: "margin:0" }, [UI.el("span", { text: "Hasil" }), hasil])
    ]));
    bar.appendChild(UI.el("button", { class: "btn btn-primary mt16", text: "✦ Buat materi jual", onclick: run }));
    view.appendChild(bar);
    var out = UI.el("div"); view.appendChild(out);
    out.appendChild(UI.el("div", { class: "empty", text: "Materi jualan muncul di sini." }));

    function copyBtn(t) { return UI.el("button", { class: "btn btn-ghost btn-sm mt16", text: "Salin", onclick: function () { navigator.clipboard && navigator.clipboard.writeText(t); UI.toast("Disalin", "ok"); } }); }
    function sec(t, node) { return UI.el("div", { class: "panel mb16" }, [UI.el("div", { class: "kick mb16", text: t }), node]); }
    function run() {
      if (!nama.value.trim()) { UI.toast("Isi nama kelas", "err"); return; }
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu", "err"); ctx.shell.openSettings(); return; }
      UI.clear(out); out.appendChild(UI.spinner("Menulis materi jualan…"));
      var prompt = ctx.brain.context() + "\n\nKelas: " + nama.value.trim() + ". Hasil untuk murid: " + (hasil.value || "-") + "\n\n" +
        "Balas JSON: {\"deskripsi\":\"deskripsi kelas menarik\",\"salespage\":{\"hero\":\"headline+subheadline\",\"benefit\":[\"5 benefit\"],\"untuk\":[\"3 untuk siapa\"],\"cta\":\"teks tombol\"},\"sertifikat\":\"contoh teks sertifikat kelulusan\"}. Bahasa Indonesia.";
      ctx.ai.ask({ prompt: prompt, json: true, temp: 0.8 }).then(function (r) {
        if (typeof r === "string") { UI.clear(out); out.appendChild(UI.el("div", { class: "ai-out", text: r })); return; }
        UI.clear(out);
        out.appendChild(sec("Deskripsi kelas", UI.el("div", {}, [UI.el("div", { class: "ai-out", text: r.deskripsi || "" }), copyBtn(r.deskripsi || "")])));
        if (r.salespage) { var s = r.salespage;
          out.appendChild(sec("Sales page", UI.el("div", {}, [
            UI.el("div", { class: "ai-out", text: s.hero || "" }),
            UI.el("div", { class: "row gap8 mt16" }, (s.benefit || []).map(function (b) { return UI.el("span", { class: "pill pill-accent", text: b }); })),
            UI.el("div", { class: "sub", style: "margin-top:10px", text: "Untuk: " + (s.untuk || []).join(", ") }),
            UI.el("div", { class: "mt16" }, [UI.el("span", { class: "pill pill-primary", text: "CTA: " + (s.cta || "") })])
          ])));
        }
        if (r.sertifikat) out.appendChild(sec("Teks sertifikat", UI.el("div", {}, [UI.el("div", { class: "ai-out", text: r.sertifikat }), copyBtn(r.sertifikat)])));
        ctx.brain.logResult({ modul: "jual", kelas: nama.value.trim() });
      }).catch(function (e) { UI.clear(out); out.appendChild(UI.el("p", { class: "down", text: e.message })); });
    }
  }
  Shell.register({ id: "jual", nama: "Jual Kelas", ikon: "◇", mount: mount });
})();
