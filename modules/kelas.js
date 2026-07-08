/* kelas.js — kurikulum + script modul + kuis. */
(function () {
  function mount(view, ctx) {
    view.appendChild(UI.el("div", { class: "view-head" }, [
      UI.el("div", {}, [UI.el("div", { class: "kick", text: "Kelas" }), UI.el("h1", { class: "h1", text: "Curriculum Builder" }), UI.el("div", { class: "sub", text: "Kurikulum, materi tiap modul, dan kuis." })])
    ]));
    var bar = UI.el("div", { class: "panel mb16" });
    var topik = UI.el("input", { class: "input", placeholder: "Topik kelas, mis. dasar fotografi HP" });
    var level = UI.el("select", { class: "input", style: "max-width:160px" });
    ["Pemula", "Menengah", "Lanjutan"].forEach(function (l) { level.appendChild(UI.el("option", { text: l })); });
    bar.appendChild(UI.el("div", { class: "row gap12", style: "align-items:flex-end" }, [
      UI.el("label", { class: "fld", style: "flex:1;margin:0" }, [UI.el("span", { text: "Topik" }), topik]),
      UI.el("label", { class: "fld", style: "margin:0" }, [UI.el("span", { text: "Level" }), level]),
      UI.el("button", { class: "btn btn-primary", text: "✦ Susun", onclick: run })
    ]));
    view.appendChild(bar);
    var out = UI.el("div"); view.appendChild(out);
    out.appendChild(UI.el("div", { class: "empty", text: "Kurikulum muncul di sini." }));

    function sec(t, node) { return UI.el("div", { class: "panel mb16" }, [UI.el("div", { class: "kick mb16", text: t }), node]); }
    function run() {
      if (!topik.value.trim()) { UI.toast("Isi topik", "err"); return; }
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu", "err"); ctx.shell.openSettings(); return; }
      UI.clear(out); out.appendChild(UI.spinner("Menyusun kurikulum…"));
      var prompt = ctx.brain.context() + "\n\nKelas: " + topik.value.trim() + " (level " + level.value + ").\n\n" +
        "Balas JSON: {\"kurikulum\":[{\"modul\":\"judul modul\",\"materi\":[\"poin materi\"]}],\"kuis\":[{\"q\":\"pertanyaan\",\"opsi\":[\"a\",\"b\",\"c\"],\"jawaban\":\"a\"}]}. Beri 5-6 modul, 4 kuis. Bahasa Indonesia.";
      ctx.ai.ask({ prompt: prompt, json: true, temp: 0.7 }).then(function (r) {
        if (typeof r === "string") { UI.clear(out); out.appendChild(UI.el("div", { class: "ai-out", text: r })); return; }
        UI.clear(out);
        var kg = UI.el("div", { class: "grid2" });
        (r.kurikulum || []).forEach(function (m, i) {
          kg.appendChild(UI.el("div", { class: "card" }, [
            UI.el("div", { class: "flex center gap8" }, [UI.el("span", { class: "pill pill-accent", text: "Modul " + (i + 1) }), UI.el("div", { style: "font-family:var(--font-d);font-size:18px;font-weight:600", text: m.modul || "" })]),
            UI.el("div", { class: "sub", style: "margin-top:8px", html: (m.materi || []).map(function (x) { return "• " + UI.esc(x); }).join("<br>") })
          ]));
        });
        out.appendChild(sec("Kurikulum", kg));
        if (r.kuis) { var ku = UI.el("div"); r.kuis.forEach(function (q, i) {
          ku.appendChild(UI.el("div", { style: "padding:12px 0;border-bottom:1px solid var(--line)" }, [
            UI.el("div", { style: "font-weight:600;font-size:14.5px", text: (i + 1) + ". " + (q.q || "") }),
            UI.el("div", { class: "sub", style: "margin-top:6px", html: (q.opsi || []).map(function (o) { return UI.esc(o); }).join(" &nbsp;·&nbsp; ") }),
            UI.el("div", { class: "pill pill-brass", style: "margin-top:8px", text: "Jawaban: " + (q.jawaban || "") })
          ]));
        }); out.appendChild(sec("Kuis", ku)); }
        ctx.brain.logResult({ modul: "kelas", topik: topik.value.trim() });
      }).catch(function (e) { UI.clear(out); out.appendChild(UI.el("p", { class: "down", text: e.message })); });
    }
  }
  Shell.register({ id: "kelas", nama: "Kelas", ikon: "✎", mount: mount });
})();
