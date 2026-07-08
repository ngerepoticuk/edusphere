/* doc.js — engine dokumen: cetak/PDF (struk 58mm, invoice & laporan A4)
   + ekspor CSV (Excel-ready). Jalan offline via window.open + print.
   Pakai: Doc.struk({...}); Doc.invoice({...}); Doc.laporan(judul, seksi[]); Doc.csv(nama, rows). */
window.Doc = (function () {
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function rp(n) { n = Math.round(Number(n) || 0); var neg = n < 0; n = Math.abs(n); var s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); return (neg ? "-Rp" : "Rp") + s; }
  function tgl(d) { d = d ? new Date(d) : new Date(); return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }); }
  function jam(d) { d = d ? new Date(d) : new Date(); return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }); }

  var BASECSS = "*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
    "body{font:13px/1.5 'Segoe UI',system-ui,sans-serif;color:#111}" +
    "table{width:100%;border-collapse:collapse}h1,h2,h3{line-height:1.2}" +
    "@media print{.noprint{display:none!important}}";

  /* buka jendela, tulis html, auto-print. */
  function openPrint(html, css, title) {
    var w = window.open("", "_blank", "width=760,height=900");
    if (!w) { if (window.UI) UI.toast("Izinkan pop-up untuk mencetak", "warn"); return; }
    w.document.write("<!doctype html><html><head><meta charset='utf-8'><title>" + esc(title || "Dokumen") + "</title><style>" + BASECSS + (css || "") + "</style></head><body>" + html +
      "<div class='noprint' style='position:fixed;top:10px;right:10px;display:flex;gap:8px'>" +
      "<button onclick='window.print()' style='padding:9px 18px;border:0;border-radius:8px;background:#0f9d6e;color:#fff;font-weight:700;cursor:pointer'>Cetak / Simpan PDF</button>" +
      "<button onclick='window.close()' style='padding:9px 14px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer'>Tutup</button></div>" +
      "</body></html>");
    w.document.close();
    setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 350);
  }

  function brandHead(sub) {
    var b = (window.Brain && Brain.get().bisnis) || {};
    var nama = b.nama || (window.APP && APP.nama) || "Bisnis";
    return "<div style='display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2.5px solid #111;padding-bottom:12px;margin-bottom:16px'>" +
      "<div><div style='font-size:20px;font-weight:800'>" + esc(nama) + "</div>" +
      (b.lokasi ? "<div style='color:#555;font-size:12px'>" + esc(b.lokasi) + "</div>" : "") + "</div>" +
      "<div style='text-align:right;font-size:12px;color:#555'>" + esc(sub || "") + "<br>" + tgl() + "</div></div>";
  }

  /* ---------- STRUK 58mm ---------- */
  function struk(o) {
    /* o: {no, kasir, items:[{nama,qty,harga}], diskon, bayar, catatan} */
    var b = (window.Brain && Brain.get().bisnis) || {};
    var sub = 0; (o.items || []).forEach(function (it) { sub += (it.qty || 1) * (it.harga || 0); });
    var disk = o.diskon || 0, tot = sub - disk, bayar = o.bayar || 0, kembali = bayar - tot;
    var css = "body{width:58mm;padding:4mm;font:11px/1.45 'Courier New',monospace}" +
      ".c{text-align:center}.b{font-weight:700}.r{text-align:right}" +
      "hr{border:0;border-top:1px dashed #000;margin:6px 0}td{vertical-align:top;padding:1px 0}" +
      "@page{size:58mm auto;margin:0}";
    var h = "<div class='c b' style='font-size:13px'>" + esc(b.nama || APP.nama) + "</div>";
    if (b.lokasi) h += "<div class='c'>" + esc(b.lokasi) + "</div>";
    h += "<hr><table><tr><td>No</td><td class='r'>" + esc(o.no || "-") + "</td></tr>" +
      "<tr><td>Tanggal</td><td class='r'>" + tgl(o.tanggal) + " " + jam(o.tanggal) + "</td></tr>" +
      (o.kasir ? "<tr><td>Kasir</td><td class='r'>" + esc(o.kasir) + "</td></tr>" : "") + "</table><hr><table>";
    (o.items || []).forEach(function (it) {
      h += "<tr><td colspan='2'>" + esc(it.nama) + "</td></tr>" +
        "<tr><td>" + (it.qty || 1) + " x " + rp(it.harga) + "</td><td class='r'>" + rp((it.qty || 1) * (it.harga || 0)) + "</td></tr>";
    });
    h += "</table><hr><table>" +
      "<tr><td>Subtotal</td><td class='r'>" + rp(sub) + "</td></tr>" +
      (disk ? "<tr><td>Diskon</td><td class='r'>-" + rp(disk).slice(0) + "</td></tr>" : "") +
      "<tr class='b'><td>TOTAL</td><td class='r'>" + rp(tot) + "</td></tr>" +
      (bayar ? "<tr><td>Bayar</td><td class='r'>" + rp(bayar) + "</td></tr><tr><td>Kembali</td><td class='r'>" + rp(kembali) + "</td></tr>" : "") +
      "</table><hr><div class='c'>" + esc(o.catatan || "Terima kasih 🙏") + "</div>";
    openPrint(h, css, "Struk " + (o.no || ""));
  }

  /* ---------- INVOICE A4 ---------- */
  function invoice(o) {
    /* o: {no, kepada:{nama,kontak,alamat}, items:[{nama,qty,harga,ket}], diskon, dp, jatuhTempo, catatan, judul} */
    var sub = 0; (o.items || []).forEach(function (it) { sub += (it.qty || 1) * (it.harga || 0); });
    var disk = o.diskon || 0, dp = o.dp || 0, tot = sub - disk, sisa = tot - dp;
    var css = "body{padding:14mm}th{background:#f0f4f2;text-align:left;padding:8px;border-bottom:2px solid #111;font-size:12px}" +
      "td{padding:8px;border-bottom:1px solid #e2e8e5}.r{text-align:right}.tot td{border:0;padding:4px 8px}" +
      "@page{size:A4;margin:10mm}";
    var h = brandHead((o.judul || "INVOICE") + (o.no ? " · " + esc(o.no) : ""));
    h += "<table style='margin-bottom:14px'><tr><td style='border:0;padding:0'>" +
      "<div style='font-size:11px;color:#777;text-transform:uppercase;letter-spacing:.08em'>Kepada</div>" +
      "<div style='font-weight:700;font-size:15px'>" + esc((o.kepada || {}).nama || "-") + "</div>" +
      (o.kepada && o.kepada.kontak ? "<div style='color:#555'>" + esc(o.kepada.kontak) + "</div>" : "") +
      (o.kepada && o.kepada.alamat ? "<div style='color:#555'>" + esc(o.kepada.alamat) + "</div>" : "") + "</td>" +
      (o.jatuhTempo ? "<td style='border:0;padding:0;text-align:right'><div style='font-size:11px;color:#777'>JATUH TEMPO</div><div style='font-weight:700'>" + tgl(o.jatuhTempo) + "</div></td>" : "") + "</tr></table>";
    h += "<table><tr><th>Item</th><th class='r'>Qty</th><th class='r'>Harga</th><th class='r'>Jumlah</th></tr>";
    (o.items || []).forEach(function (it) {
      h += "<tr><td>" + esc(it.nama) + (it.ket ? "<div style='color:#888;font-size:11px'>" + esc(it.ket) + "</div>" : "") + "</td>" +
        "<td class='r'>" + (it.qty || 1) + "</td><td class='r'>" + rp(it.harga) + "</td><td class='r'>" + rp((it.qty || 1) * (it.harga || 0)) + "</td></tr>";
    });
    h += "</table><table style='width:46%;margin-left:auto;margin-top:10px'>" +
      "<tr class='tot'><td>Subtotal</td><td class='r'>" + rp(sub) + "</td></tr>" +
      (disk ? "<tr class='tot'><td>Diskon</td><td class='r'>-" + rp(disk) + "</td></tr>" : "") +
      (dp ? "<tr class='tot'><td>DP dibayar</td><td class='r'>-" + rp(dp) + "</td></tr>" : "") +
      "<tr class='tot' style='font-weight:800;font-size:16px;border-top:2px solid #111'><td>TOTAL" + (dp ? " SISA" : "") + "</td><td class='r'>" + rp(dp ? sisa : tot) + "</td></tr></table>";
    if (o.catatan) h += "<div style='margin-top:16px;padding:10px 12px;background:#f6f8f7;border-radius:8px;color:#555;font-size:12px'><b>Catatan:</b> " + esc(o.catatan) + "</div>";
    h += "<div style='margin-top:26px;color:#999;font-size:11px'>Dibuat dengan " + esc(APP.nama) + " · " + tgl() + "</div>";
    openPrint(h, css, (o.judul || "Invoice") + " " + (o.no || ""));
  }

  /* ---------- LAPORAN A4 ---------- */
  function laporan(judul, seksi, opts) {
    /* seksi: [{h, stats:[{label,val}], table:{head[], rows[][]}, note}] */
    opts = opts || {};
    var css = "body{padding:14mm}h1{font-size:22px;margin-bottom:2px}" +
      ".stats{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}" +
      ".st{flex:1;min-width:130px;border:1px solid #dfe5e2;border-radius:10px;padding:10px 12px}" +
      ".st b{display:block;font-size:17px}.st span{color:#777;font-size:11px}" +
      "h2{font-size:14px;margin:18px 0 8px;padding-bottom:5px;border-bottom:2px solid #111}" +
      "th{background:#f0f4f2;text-align:left;padding:7px 8px;font-size:11.5px;border-bottom:2px solid #111}" +
      "td{padding:7px 8px;border-bottom:1px solid #e6ebe8;font-size:12px}.r{text-align:right}" +
      ".note{margin-top:8px;padding:9px 11px;background:#f6f8f7;border-radius:8px;color:#555;font-size:11.5px}" +
      "@page{size:A4;margin:10mm}";
    var h = brandHead(opts.sub || "LAPORAN") + "<h1>" + esc(judul) + "</h1>" +
      (opts.periode ? "<div style='color:#777'>" + esc(opts.periode) + "</div>" : "");
    (seksi || []).forEach(function (s) {
      if (s.h) h += "<h2>" + esc(s.h) + "</h2>";
      if (s.stats) { h += "<div class='stats'>"; s.stats.forEach(function (st) { h += "<div class='st'><b>" + esc(st.val) + "</b><span>" + esc(st.label) + "</span></div>"; }); h += "</div>"; }
      if (s.table) {
        h += "<table><tr>"; s.table.head.forEach(function (th, i) { h += "<th" + (s.table.right && s.table.right.indexOf(i) >= 0 ? " class='r'" : "") + ">" + esc(th) + "</th>"; }); h += "</tr>";
        s.table.rows.forEach(function (row) { h += "<tr>"; row.forEach(function (c, i) { h += "<td" + (s.table.right && s.table.right.indexOf(i) >= 0 ? " class='r'" : "") + ">" + esc(c) + "</td>"; }); h += "</tr>"; });
        h += "</table>";
      }
      if (s.note) h += "<div class='note'>" + esc(s.note) + "</div>";
    });
    h += "<div style='margin-top:26px;color:#999;font-size:11px'>Dibuat dengan " + esc(APP.nama) + " · " + tgl() + "</div>";
    openPrint(h, css, judul);
  }

  /* ---------- CSV (Excel-ready, BOM + ;) ---------- */
  function csv(nama, rows) {
    var sep = ";";
    var txt = "﻿" + rows.map(function (r) {
      return r.map(function (c) {
        c = String(c == null ? "" : c);
        return (c.indexOf(sep) >= 0 || c.indexOf('"') >= 0 || c.indexOf("\n") >= 0) ? '"' + c.replace(/"/g, '""') + '"' : c;
      }).join(sep);
    }).join("\r\n");
    var blob = new Blob([txt], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = nama.replace(/\.csv$/i, "") + ".csv";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    if (window.UI) UI.toast("CSV terunduh — buka di Excel", "ok");
  }

  return { struk: struk, invoice: invoice, laporan: laporan, csv: csv, rp: rp, openPrint: openPrint };
})();
