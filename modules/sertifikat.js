/* sertifikat.js — Generator Sertifikat. Isi nama+kelas → sertifikat siap cetak. */
(function () {
  function mount(view, ctx) {
    view.appendChild(UI.el("div", { class: "view-head" }, [
      UI.el("div", {}, [UI.el("div", { class: "kick", text: "Sertifikat" }), UI.el("h1", { class: "h1", text: "Generator Sertifikat" }), UI.el("div", { class: "sub", text: "Cetak sertifikat kelulusan rapi dalam hitungan detik." })])
    ]));
    var grid = UI.el("div", { class: "grid2", style: "grid-template-columns:1fr 1.3fr;align-items:start" });
    var left = UI.el("div", { class: "panel" }); var right = UI.el("div"); grid.appendChild(left); grid.appendChild(right); view.appendChild(grid);
    var b = ctx.brain.get();
    function f(l, v, ph, ty) { var i = UI.el("input", { class: "input", placeholder: ph || "", type: ty || "text" }); i.value = v || ""; return { el: UI.el("label", { class: "fld" }, [UI.el("span", { text: l }), i]), i: i }; }
    var fn = f("Nama murid", "", "Andi Wijaya");
    var fk = f("Nama kelas / program", "", "Dasar Fotografi HP");
    var fp = f("Penyelenggara", b.bisnis.nama || APP.nama, "");
    var fd = f("Tanggal", new Date().toISOString().slice(0, 10), "", "date");
    var fpara = UI.el("textarea", { class: "input", rows: "2", placeholder: "Kalimat penghargaan (opsional)" });
    left.appendChild(fn.el); left.appendChild(fk.el); left.appendChild(fp.el); left.appendChild(fd.el);
    left.appendChild(UI.el("label", { class: "fld" }, [UI.el("span", { text: "Kalimat tambahan" }), fpara]));
    left.appendChild(UI.el("button", { class: "btn btn-primary", text: "🖨 Cetak sertifikat", onclick: cetak }));
    fn.i.oninput = preview; fk.i.oninput = preview; fp.i.oninput = preview; fd.i.oninput = preview; fpara.oninput = preview;

    function html() {
      var tgl = fd.i.value ? new Date(fd.i.value).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";
      return '<div class="cert" id="cert-print"><div class="cert-in">' +
        '<div class="cert-kick">SERTIFIKAT</div><div class="cert-sub2">diberikan kepada</div>' +
        '<div class="cert-name">' + (UI.esc(fn.i.value) || "—") + '</div>' +
        '<div class="cert-body">atas penyelesaian program<br><b>' + (UI.esc(fk.i.value) || "—") + '</b>' + (fpara.value ? '<br><span class="cert-para">' + UI.esc(fpara.value) + '</span>' : '') + '</div>' +
        '<div class="cert-foot"><div>' + UI.esc(tgl) + '</div><div class="cert-org">' + (UI.esc(fp.i.value) || "") + '</div></div>' +
        '</div></div>';
    }
    function preview() { UI.clear(right); right.appendChild(UI.el("div", { html: html() })); }
    function cetak() {
      if (!fn.i.value.trim()) { UI.toast("Isi nama murid", "err"); return; }
      var w = window.open("", "_blank");
      w.document.write('<html><head><title>Sertifikat</title>' + css(true) + '</head><body>' + html() + '</body></html>');
      w.document.close(); setTimeout(function () { w.print(); }, 300); UI.toast("Siap cetak", "ok");
    }
    function css(print) {
      var c = print ? { bg: "#fff", ink: "#1B2A4A", gold: "#C2902A", line: "#1B2A4A" } : { bg: "var(--surface2)", ink: "var(--ink)", gold: "var(--brass)", line: "var(--primary)" };
      return '<style>' + (print ? 'body{margin:0;padding:30px;background:#eee}' : '') +
        '.cert{background:' + c.bg + ';padding:14px;border-radius:14px}' +
        '.cert-in{border:2px solid ' + c.gold + ';outline:1px solid ' + c.gold + ';outline-offset:5px;border-radius:8px;padding:40px 30px;text-align:center;font-family:Georgia,serif;color:' + c.ink + '}' +
        '.cert-kick{font-size:26px;font-weight:bold;letter-spacing:8px;color:' + c.gold + '}' +
        '.cert-sub2{margin-top:18px;font-size:13px;font-style:italic}' +
        '.cert-name{font-size:34px;font-weight:bold;margin:8px 0;border-bottom:1px solid ' + c.line + ';display:inline-block;padding:0 20px 6px}' +
        '.cert-body{margin-top:14px;font-size:15px;line-height:1.6}.cert-para{font-size:12px;font-style:italic}' +
        '.cert-foot{display:flex;justify-content:space-between;margin-top:38px;font-size:12px}.cert-org{font-weight:bold}' +
        '</style>';
    }
    // inject preview css once
    if (!document.getElementById("cert-css")) { var s = document.createElement("style"); s.id = "cert-css"; s.textContent = css(false).replace(/<\/?style>/g, ""); document.head.appendChild(s); }
    preview();
  }
  Shell.register({ id: "sertifikat", nama: "Sertifikat", ikon: "", mount: mount });
})();
