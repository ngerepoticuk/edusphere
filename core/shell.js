/* shell.js — kerangka app: sidebar berlabel + brand, topbar (Brand Brain +
   command palette), settings (API key + Brand Brain + data demo), router modul,
   auto-seed demo data saat pertama buka. */
window.Shell = (function () {
  var mods = {}, order = [], active = null, curUnmount = null;
  var refs = {};
  var ICONMAP = {
    dashboard: "layout-dashboard", kasir: "cash-register", rekap: "chart-bar", closer: "message-circle",
    toko: "building-store", nota: "file-invoice", afilia: "sparkles", suara: "microphone",
    kalender: "calendar-event", visual: "photo", podcast: "broadcast", radar: "radar-2",
    iklanin: "speakerphone", luncur: "rocket", tulis: "pencil", persona: "user-circle",
    pipeline: "layout-kanban", klien: "calendar-heart", progres: "school", pelanggan: "users",
    listing: "home", prospek: "phone", proposal: "file-text", promosi: "heart",
    kelas: "book", jual: "tag", bahan: "flask", caption: "writing", konsultasi: "messages",
    jobdesc: "clipboard-text", screening: "list-check", email: "mail", validasi: "circle-check",
    rencana: "calendar", tracking: "trending-up",
    budget: "wallet", tamu: "users-group", vendor: "briefcase", timeline: "timeline", checklist: "checklist",
    akun: "wallet", anggaran: "chart-pie", goals: "target", tagihan: "receipt-2", laporan: "report",
    supplier: "truck", promo: "discount",
    tren: "trending-up", monetisasi: "coin", audiens: "users-group",
    funnel: "filter", sequence: "mail-forward", kpi: "chart-dots",
    komisi: "percentage", openhouse: "calendar-event", dokumen: "file-check",
    murid: "users", jadwal: "calendar-time", sertifikat: "certificate", kuis: "help-circle",
    katalog: "layout-grid", order: "package", bundling: "gift",
    jadwalint: "calendar-time", onboarding: "checklist", evaluasi: "star"
  };

  function register(m) { mods[m.id] = m; }
  function ctx() { return { brain: Brain, ai: AI, img: Img, store: Store, ui: UI, go: go, shell: api, doc: window.Doc, wa: window.WA, remind: window.Remind, pin: window.Pin }; }

  /* ---- 7 tema pilihan pengguna. "bawaan" = palet asli app (config.js).
     Override diterapkan DI ATAS config vars; font & logo tetap milik brand. ---- */
  var THEMES = [
    { key: "bawaan", nama: "Bawaan", vars: null },
    { key: "midnight", nama: "Midnight", vars: { "--bg": "#0a1120", "--surface": "#0f1a2e", "--surface2": "#15233c", "--ink": "#e8eef7", "--muted": "#8395ad", "--primary": "#38bdf8", "--primary-deep": "#0284c7", "--on-primary": "#041420", "--accent": "#7dd3fc", "--brass": "#7d8b9c", "--line": "#1c2c44", "--line2": "#2a3d5c", "--ok": "#4ade80" } },
    { key: "royal", nama: "Royal", vars: { "--bg": "#110e1d", "--surface": "#171329", "--surface2": "#1f1a38", "--ink": "#ede9f7", "--muted": "#948bad", "--primary": "#a78bfa", "--primary-deep": "#7c3aed", "--on-primary": "#130a26", "--accent": "#c4b5fd", "--brass": "#8b829c", "--line": "#292244", "--line2": "#3a305c", "--ok": "#4ade80" } },
    { key: "ember", nama: "Ember", vars: { "--bg": "#16100a", "--surface": "#201810", "--surface2": "#2c2016", "--ink": "#f5efe6", "--muted": "#a49481", "--primary": "#f59e0b", "--primary-deep": "#b45309", "--on-primary": "#1c1204", "--accent": "#fcd34d", "--brass": "#9c8a70", "--line": "#33281c", "--line2": "#46372a", "--ok": "#4ade80" } },
    { key: "rose", nama: "Rosé", vars: { "--bg": "#160b10", "--surface": "#201017", "--surface2": "#2c1720", "--ink": "#f7eaef", "--muted": "#a4899a", "--primary": "#fb7185", "--primary-deep": "#e11d48", "--on-primary": "#1e060c", "--accent": "#fda4af", "--brass": "#9c7a85", "--line": "#331f28", "--line2": "#472b38", "--ok": "#4ade80" } },
    { key: "hutan", nama: "Hutan", vars: { "--bg": "#0a1410", "--surface": "#101d17", "--surface2": "#16261f", "--ink": "#e8f2ec", "--muted": "#7d9488", "--primary": "#34d399", "--primary-deep": "#059669", "--on-primary": "#05130d", "--accent": "#6ee7b7", "--brass": "#7f8a6f", "--line": "#1f3329", "--line2": "#2d4638", "--ok": "#34d399" } },
    { key: "fajar", nama: "Fajar ☀", vars: { "--bg": "#f3f5f4", "--surface": "#ffffff", "--surface2": "#e9edeb", "--ink": "#17221c", "--muted": "#61706a", "--primary": "#0f9d6e", "--primary-deep": "#0a7a54", "--on-primary": "#ffffff", "--accent": "#0d8a63", "--brass": "#8a978f", "--line": "#dfe5e2", "--line2": "#cbd4cf", "--ok": "#16a34a" } }
  ];
  function themeVars(key) { for (var i = 0; i < THEMES.length; i++) if (THEMES[i].key === key) return THEMES[i].vars; return null; }

  function applyTheme() {
    var t = APP.tema || {}, v = t.vars || {};
    for (var k in v) document.documentElement.style.setProperty(k, v[k]);
    var saved = Store.get("__theme", "bawaan");
    var ov = themeVars(saved);
    if (ov) for (var k2 in ov) document.documentElement.style.setProperty(k2, ov[k2]);
    document.documentElement.setAttribute("data-theme", saved === "fajar" ? "light" : (t.theme || "dark"));
    document.documentElement.style.colorScheme = saved === "fajar" ? "light" : "dark";
    if (t.glass) document.body.classList.add("glass");
    document.title = APP.nama + " — " + (APP.tagline || "");
    var fav = document.querySelector("link[rel='icon']") || document.createElement("link");
    fav.rel = "icon"; fav.type = "image/svg+xml"; fav.href = (APP.logo && APP.logo.length) ? APP.logo : "assets/logo.svg";
    document.head.appendChild(fav);
  }
  function setTheme(key) { Store.set("__theme", key); applyTheme(); }

  function buildChrome() {
    var app = document.getElementById("app"); UI.clear(app);
    var logoSrc = (APP.logo && APP.logo.length) ? APP.logo : "assets/logo.svg";
    var brand = UI.el("div", { class: "brand" }, [
      UI.el("img", { class: "brand-logo", src: logoSrc, alt: APP.nama, onerror: function () { this.style.display = "none"; } }),
      UI.el("div", { class: "brand-txt" }, [UI.el("div", { class: "brand-name", text: APP.nama }), UI.el("div", { class: "brand-tag", text: APP.tagline || "" })])
    ]);
    refs.rail = UI.el("nav", { class: "nav" });
    order.forEach(function (id) {
      var m = mods[id];
      refs.rail.appendChild(UI.el("button", { class: "navi", "data-id": id, onclick: function () { go(id); closeMobile(); } }, [
        UI.el("span", { class: "navi-ic" }, [UI.icon(ICONMAP[id] || "circle")]),
        UI.el("span", { class: "navi-lbl", text: m.nama }),
        UI.el("span", { class: "navi-badge", "data-badge": id })
      ]));
    });
    var setBtn = UI.el("button", { class: "navi", onclick: openSettings }, [UI.el("span", { class: "navi-ic" }, [UI.icon("settings")]), UI.el("span", { class: "navi-lbl", text: "Pengaturan" })]);
    var sidebar = UI.el("aside", { class: "sidebar" }, [brand, UI.el("div", { class: "nav-sec", text: "Menu" }), refs.rail, UI.el("div", { class: "nav-foot" }, [setBtn])]);

    refs.brain = UI.el("div", { class: "brainbar", onclick: openSettings });
    var burger = UI.el("button", { class: "burger", onclick: function () { document.body.classList.toggle("nav-open"); } }, [UI.icon("menu-2")]);
    refs.crumbMod = UI.el("b", { text: "" });
    var crumb = UI.el("div", { class: "crumb" }, [
      UI.el("span", { text: APP.nama }), UI.el("span", { class: "sep", text: "/" }), refs.crumbMod,
      UI.el("span", { class: "today", text: new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }) })
    ]);
    var cmd = UI.el("button", { class: "cmdk", onclick: openPalette }, [UI.icon("search"), UI.el("span", {}, ["Cari modul atau aksi"]), UI.el("kbd", { text: (isMac() ? "⌘" : "Ctrl") + "K" })]);
    var topbar = UI.el("div", { class: "topbar" }, [burger, crumb, refs.brain, cmd]);
    refs.view = UI.el("main", { class: "view", id: "view" });
    var main = UI.el("div", { class: "main" }, [topbar, refs.view]);
    app.appendChild(UI.el("div", { class: "shell" }, [sidebar, main]));
    refreshBrain();
  }
  function closeMobile() { document.body.classList.remove("nav-open"); }

  function refreshBrain() {
    if (!refs.brain) return; UI.clear(refs.brain);
    var s = Brain.summary();
    refs.brain.appendChild(UI.el("span", { class: "pulse" }));
    if (s) { var parts = s.split(" · "); refs.brain.appendChild(UI.el("b", { text: parts[0] })); if (parts[1]) refs.brain.appendChild(UI.el("span", { class: "bb-niche", text: " · " + parts[1] })); }
    else refs.brain.appendChild(UI.el("span", { class: "bb-lbl bb-cta", text: "Atur Brand Brain →" }));
  }

  function go(id, fromHash) {
    if (!mods[id]) return;
    if (curUnmount) { try { curUnmount(); } catch (e) {} curUnmount = null; }
    active = id;
    Array.prototype.forEach.call(refs.rail.querySelectorAll(".navi"), function (b) { b.classList.toggle("on", b.getAttribute("data-id") === id); });
    if (refs.crumbMod) refs.crumbMod.textContent = mods[id].nama;
    UI.clear(refs.view); refs.view.scrollTop = 0;
    refs.view.style.animation = "none"; void refs.view.offsetWidth; refs.view.style.animation = "";
    var r = mods[id].mount(refs.view, ctx());
    curUnmount = (mods[id].unmount) || (r && r.unmount) || null;
    if (!fromHash) { try { history.replaceState(null, "", "#" + id); } catch (e) {} }
  }

  function setBadge(id, n) {
    var el = refs.rail && refs.rail.querySelector('[data-badge="' + id + '"]');
    if (!el) return;
    if (n && n > 0) { el.textContent = n > 99 ? "99+" : n; el.classList.add("on"); }
    else { el.textContent = ""; el.classList.remove("on"); }
  }

  function openPalette() {
    var items = order.map(function (id) { return { label: mods[id].nama, hint: "Modul", icon: ICONMAP[id] || "circle", run: function () { go(id); } }; });
    items.push({ label: "Pengaturan & API Key", hint: "Aksi", icon: "settings", run: openSettings });
    var list = UI.el("div", { class: "pal-list" });
    var input = UI.el("input", { class: "pal-input", placeholder: "Ketik modul atau aksi…" });
    var sel = 0, filtered = items;
    function paint() {
      Array.prototype.forEach.call(list.querySelectorAll(".pal-row"), function (r, i) { r.classList.toggle("sel", i === sel); });
      var s = list.querySelectorAll(".pal-row")[sel]; if (s && s.scrollIntoView) s.scrollIntoView({ block: "nearest" });
    }
    function render(q) {
      UI.clear(list); q = (q || "").toLowerCase();
      filtered = items.filter(function (it) { return it.label.toLowerCase().indexOf(q) >= 0; });
      if (sel >= filtered.length) sel = 0;
      if (!filtered.length) { list.appendChild(UI.el("div", { class: "pal-empty", text: "Tak ada hasil." })); return; }
      filtered.forEach(function (it, i) {
        list.appendChild(UI.el("div", { class: "pal-row" + (i === sel ? " sel" : ""),
          onmouseenter: function () { sel = i; paint(); },
          onclick: function () { m.close(); it.run(); } }, [
          UI.el("span", { class: "pal-left" }, [UI.icon(it.icon), UI.el("span", { text: it.label })]),
          UI.el("span", { class: "pal-hint", text: it.hint })
        ]));
      });
    }
    input.addEventListener("input", function () { sel = 0; render(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(filtered.length - 1, sel + 1); paint(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); paint(); }
      else if (e.key === "Enter") { e.preventDefault(); var it = filtered[sel]; if (it) { m.close(); it.run(); } }
    });
    render("");
    var m = UI.modal("Command Palette", UI.el("div", { class: "pal" }, [input, list]));
    setTimeout(function () { input.focus(); }, 50);
  }

  function openSettings() {
    if (window.Pin && Pin.isSet()) { return Pin.guard(openSettingsInner); }
    openSettingsInner();
  }
  function openSettingsInner() {
    var b = Brain.get(); var f = {};
    function field(label, key, val, ph) { var inp = UI.el("input", { class: "input", placeholder: ph || "" }); inp.value = val || ""; f[key] = inp; return UI.el("label", { class: "fld" }, [UI.el("span", { text: label }), inp]); }
    var keyInp = UI.el("input", { class: "input", type: "password", placeholder: "Tempel API key Gemini" }); keyInp.value = Store.get("apikey", "");
    var body = UI.el("div", { class: "settings" }, [
      UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "API Key (Gemini — gratis)" }), UI.el("p", { class: "hint", html: 'Dapatkan gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">aistudio.google.com/app/apikey</a>. Disimpan hanya di perangkat ini.' }), keyInp]),
      UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "Brand Brain — profil bisnis" }), UI.el("p", { class: "hint", text: "Dipakai semua modul agar hasil AI sesuai bisnismu." }),
        field("Nama bisnis", "nama", b.bisnis.nama, "mis. Kopi Senja"), field("Bidang / niche", "niche", b.bisnis.niche, "mis. Kedai kopi"),
        field("Produk utama (pisah koma)", "produk", (b.bisnis.produk || []).join(", "), "Kopi susu, gorengan"),
        field("Target pasar", "target", b.bisnis.target, "anak muda, pekerja"), field("Lokasi", "lokasi", b.bisnis.lokasi, "Jakarta"),
        field("Sapaan", "sapaan", b.voice.sapaan, "kamu / kak"), field("Gaya bahasa", "tone", b.voice.tone, "santai, hangat")]),
      UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "Tema tampilan" }), UI.el("p", { class: "hint", text: "Pilih suasana warna favoritmu — langsung berubah, tersimpan di perangkat ini." }), themeGrid()]),
      UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "Backup & pulihkan data" }), UI.el("p", { class: "hint", text: "Data tersimpan di perangkat ini. Unduh backup rutin agar aman dari hapus-cache / ganti HP." }),
        UI.el("div", { class: "row gap8" }, [
          UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { Store.download(); } }, [UI.icon("download"), " Unduh Backup"]),
          UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { Store.restoreFromFile(); } }, [UI.icon("upload"), " Pulihkan dari File"])
        ]),
        (function () { var t = Store.get("__lastBackup", 0); return UI.el("p", { class: "hint", style: "margin-top:6px", text: t ? ("Backup terakhir: " + new Date(t).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })) : "Belum pernah backup." }); })()
      ]),
      (window.Pin ? UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "Kunci PIN pemilik" }), UI.el("p", { class: "hint", text: "Lindungi laporan & pengaturan dengan PIN — cocok bila perangkat dipakai karyawan." }), Pin.section()]) : null),
      UI.el("div", { class: "set-sec" }, [UI.el("h4", { text: "Data demo" }), UI.el("p", { class: "hint", text: "App terisi contoh data agar langsung terlihat hidup. Kamu bisa reset atau kosongkan." }),
        UI.el("div", { class: "row gap8" }, [
          UI.el("button", { class: "btn btn-ghost btn-sm", text: "Reset ke data contoh", onclick: function () { var k = Store.get("apikey", ""); Store.clearAll(); Store.set("apikey", k); if (typeof window.SEED === "function") window.SEED(Store, Brain); Store.set("__seeded", 1); location.reload(); } }),
          UI.el("button", { class: "btn btn-ghost btn-sm", text: "Kosongkan data", onclick: function () { var k = Store.get("apikey", ""); Store.clearAll(); Store.set("apikey", k); Store.set("__seeded", 1); location.reload(); } })
        ])])
    ]);
    var save = UI.el("button", { class: "btn btn-primary", text: "Simpan" });
    body.appendChild(UI.el("div", { class: "set-foot" }, [save]));
    var m = UI.modal("Pengaturan", body, { wide: true });
    save.addEventListener("click", function () {
      Store.set("apikey", keyInp.value.trim());
      var nb = Brain.get();
      nb.bisnis.nama = f.nama.value.trim(); nb.bisnis.niche = f.niche.value.trim();
      nb.bisnis.produk = f.produk.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      nb.bisnis.target = f.target.value.trim(); nb.bisnis.lokasi = f.lokasi.value.trim();
      nb.voice.sapaan = f.sapaan.value.trim() || "kamu"; nb.voice.tone = f.tone.value.trim() || "santai & ramah";
      Brain.set(nb); refreshBrain(); UI.toast("Tersimpan", "ok"); m.close(); if (active) go(active);
    });
  }

  function themeGrid() {
    var wrap = UI.el("div", { class: "tgrid" });
    var cur = Store.get("__theme", "bawaan");
    THEMES.forEach(function (th) {
      var v = th.vars || (APP.tema && APP.tema.vars) || {};
      var sw = UI.el("button", { class: "tsw" + (th.key === cur ? " on" : ""), type: "button", onclick: function () {
        setTheme(th.key);
        Array.prototype.forEach.call(wrap.children, function (c) { c.classList.remove("on"); });
        sw.classList.add("on");
        UI.toast("Tema: " + th.nama, "ok");
      } }, [
        UI.el("span", { class: "tsw-dot", style: "background:linear-gradient(135deg," + (v["--bg"] || "#111") + " 50%," + (v["--primary"] || "#888") + " 50%)" }),
        UI.el("span", { class: "tsw-lbl", text: th.nama })
      ]);
      wrap.appendChild(sw);
    });
    return wrap;
  }

  function isMac() { return /Mac|iPhone|iPad/.test(navigator.platform); }

  function init() {
    applyTheme();
    order = (APP.modul || Object.keys(mods)).filter(function (id) { return mods[id]; });
    if (!Store.get("__seeded") && typeof window.SEED === "function") { try { window.SEED(Store, Brain); } catch (e) {} Store.set("__seeded", 1); }
    buildChrome();
    var startId = (location.hash || "").replace(/^#/, "");
    if (order.indexOf(startId) < 0) startId = order[0];
    if (order.length) go(startId);
    window.addEventListener("hashchange", function () { var h = (location.hash || "").replace(/^#/, ""); if (mods[h] && h !== active) go(h, true); });
    document.addEventListener("keydown", function (e) { if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === "k") { e.preventDefault(); openPalette(); } });
    /* backup pintar: ingatkan bila data ada tapi >7 hari tak backup */
    if (Store.backupDue && Store.backupDue()) {
      setTimeout(function () {
        var t = UI.el("div", { class: "toast warn", style: "display:flex;gap:10px;align-items:center" }, [
          UI.el("span", { text: "Sudah 7+ hari tanpa backup data." }),
          UI.el("button", { class: "btn btn-primary btn-sm", text: "Backup Sekarang", onclick: function () { Store.download(); t.remove(); } }),
          UI.el("button", { class: "btn btn-ghost btn-sm", text: "Nanti", onclick: function () { Store.set("__lastBackup", Date.now() - 5 * 864e5); t.remove(); } })
        ]);
        var host = document.querySelector(".toasts") || (function () { var d = UI.el("div", { class: "toasts" }); document.body.appendChild(d); return d; })();
        host.appendChild(t);
      }, 1600);
    }
  }

  var api = { register: register, go: go, openSettings: openSettings, refreshBrain: refreshBrain, setBadge: setBadge };
  document.addEventListener("DOMContentLoaded", init);
  return api;
})();
