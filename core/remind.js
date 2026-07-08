/* remind.js — Pusat Pengingat "Perlu Perhatian".
   Modul mendaftar penyedia: Remind.provide(fn) — fn() → [{icon, text, sub, level(danger|warn|info), go, label}]
   Dashboard render: Remind.panel(ctx). Badge otomatis di nav via Shell.setBadge bila ada `go`. */
window.Remind = (function () {
  var providers = [];
  function provide(fn) { if (typeof fn === "function") providers.push(fn); }

  function collect() {
    var out = [];
    providers.forEach(function (fn) { try { var r = fn(); if (Array.isArray(r)) out = out.concat(r); } catch (e) {} });
    var rank = { danger: 0, warn: 1, info: 2 };
    out.sort(function (a, b) { return (rank[a.level] || 2) - (rank[b.level] || 2); });
    return out;
  }

  /* util tanggal utk penyedia */
  function daysTo(d) { if (!d) return null; var t = new Date(); t.setHours(0,0,0,0); var x = new Date(d); x.setHours(0,0,0,0); return Math.round((x - t) / 864e5); }
  function dueText(d) { var n = daysTo(d); if (n == null) return ""; if (n < 0) return "lewat " + (-n) + " hari"; if (n === 0) return "HARI INI"; if (n === 1) return "besok"; return n + " hari lagi"; }

  function panel(ctx) {
    var items = collect();
    var card = UI.el("div", { class: "card remind-card" });
    var head = UI.el("div", { class: "row", style: "justify-content:space-between;align-items:center;margin-bottom:10px" }, [
      UI.el("h3", { style: "margin:0;display:flex;align-items:center;gap:8px" }, [UI.icon("bell-ringing"), " Perlu Perhatian"]),
      items.length ? UI.el("span", { class: "chip", text: items.length + " hal" }) : null
    ]);
    card.appendChild(head);
    if (!items.length) {
      card.appendChild(UI.el("div", { class: "muted", style: "display:flex;align-items:center;gap:8px;padding:6px 0" }, [UI.icon("circle-check"), " Semua aman — tidak ada yang mendesak."]));
      return card;
    }
    items.slice(0, 6).forEach(function (it) {
      var colors = { danger: "#f87171", warn: "#fbbf24", info: "var(--primary)" };
      var row = UI.el("div", { class: "remind-row", style: "display:flex;gap:10px;align-items:center;padding:9px 10px;border:1px solid var(--line);border-radius:10px;margin-bottom:7px;background:var(--surface2)" }, [
        UI.el("span", { style: "color:" + (colors[it.level] || colors.info) + ";display:flex" }, [UI.icon(it.icon || "alert-circle")]),
        UI.el("div", { style: "flex:1;min-width:0" }, [
          UI.el("div", { style: "font-weight:600;font-size:13px", text: it.text }),
          it.sub ? UI.el("div", { class: "muted", style: "font-size:11.5px", text: it.sub }) : null
        ]),
        it.go ? UI.el("button", { class: "btn btn-ghost btn-sm", text: it.label || "Lihat", onclick: function () { ctx.go(it.go); } }) : null
      ]);
      card.appendChild(row);
    });
    if (items.length > 6) card.appendChild(UI.el("div", { class: "muted", style: "font-size:11.5px;text-align:center", text: "+" + (items.length - 6) + " lainnya" }));
    return card;
  }

  return { provide: provide, collect: collect, panel: panel, daysTo: daysTo, dueText: dueText };
})();
