/* wa.js — kirim pesan via WhatsApp (link wa.me, tanpa API, gratis).
   Pakai: WA.send(nomor, teks) · WA.btn(nomor, teks, label) → tombol siap pakai
   Helper teks: WA.struk(o) · WA.tagihan(o) · WA.followup(o) · WA.pengingat(o) */
window.WA = (function () {
  function rp(n) { n = Math.round(Number(n) || 0); return "Rp" + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") ; }
  function tgl(d) { d = d ? new Date(d) : new Date(); return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }

  /* normalisasi nomor Indonesia → 628xxx */
  function norm(no) {
    no = String(no || "").replace(/[^\d+]/g, "");
    if (!no) return "";
    if (no.charAt(0) === "+") no = no.slice(1);
    if (no.charAt(0) === "0") no = "62" + no.slice(1);
    if (no.slice(0, 2) !== "62" && no.charAt(0) === "8") no = "62" + no;
    return no;
  }

  function send(nomor, teks) {
    var n = norm(nomor);
    var url = "https://wa.me/" + (n ? n : "") + "?text=" + encodeURIComponent(teks || "");
    window.open(url, "_blank");
  }

  /* tombol hijau WA seragam (butuh UI) */
  function btn(nomor, teksFn, label) {
    return UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () {
      var t = (typeof teksFn === "function") ? teksFn() : teksFn;
      send(typeof nomor === "function" ? nomor() : nomor, t);
    } }, [UI.icon("brand-whatsapp"), " " + (label || "Kirim WA")]);
  }

  function brandName() { var b = (window.Brain && Brain.get().bisnis) || {}; return b.nama || (window.APP && APP.nama) || ""; }

  /* ---- template teks (ramah, siap kirim) ---- */
  function struk(o) {
    var lines = ["*" + brandName() + "*", "Struk " + (o.no || "") + " · " + tgl(o.tanggal), ""];
    var tot = 0;
    (o.items || []).forEach(function (it) { var j = (it.qty || 1) * (it.harga || 0); tot += j; lines.push((it.qty || 1) + "x " + it.nama + " — " + rp(j)); });
    if (o.diskon) { lines.push("Diskon — -" + rp(o.diskon)); tot -= o.diskon; }
    lines.push("", "*Total: " + rp(tot) + "*", "", o.catatan || "Terima kasih sudah belanja 🙏");
    return lines.join("\n");
  }

  function tagihan(o) {
    /* o: {nama, jumlah, untuk, jatuhTempo, rekening} */
    return ["Halo " + (o.nama || "") + " 👋", "",
      "Pengingat tagihan dari *" + brandName() + "*:",
      "• " + (o.untuk || "Tagihan") + ": *" + rp(o.jumlah) + "*",
      o.jatuhTempo ? "• Jatuh tempo: " + tgl(o.jatuhTempo) : "",
      o.rekening ? "\nPembayaran ke:\n" + o.rekening : "",
      "", "Terima kasih 🙏"].filter(function (s) { return s !== ""; }).join("\n");
  }

  function followup(o) {
    /* o: {nama, konteks, tawaran} */
    return ["Halo " + (o.nama || "") + " 👋", "",
      "Menindaklanjuti " + (o.konteks || "obrolan kita sebelumnya") + ".",
      o.tawaran ? o.tawaran : "Ada yang bisa saya bantu lagi?",
      "", "Salam, " + brandName()].join("\n");
  }

  function pengingat(o) {
    /* o: {nama, acara, tanggal, tempat} */
    return ["Halo " + (o.nama || "") + " 👋", "",
      "Pengingat dari *" + brandName() + "*:",
      "📌 " + (o.acara || "") + (o.tanggal ? "\n🗓 " + tgl(o.tanggal) : "") + (o.tempat ? "\n📍 " + o.tempat : ""),
      "", "Sampai jumpa! 🙏"].join("\n");
  }

  return { send: send, btn: btn, norm: norm, struk: struk, tagihan: tagihan, followup: followup, pengingat: pengingat };
})();
