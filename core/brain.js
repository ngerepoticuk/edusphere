/* brain.js — Brand Brain: profil bisnis + Voice DNA. Diisi sekali,
   dipakai SEMUA modul lewat ctx.brain. Inti "moat" produk. */
window.Brain = (function () {
  var DEF = {
    bisnis: { nama: "", niche: "", produk: [], target: "", lokasi: "" },
    voice: { tone: "santai & ramah", sapaan: "kamu", contoh: "" },
    riwayat: [],
    meta: {}
  };
  function get() {
    var b = Store.get("brain", null);
    if (!b) return JSON.parse(JSON.stringify(DEF));
    b.bisnis = b.bisnis || {}; b.voice = b.voice || {}; b.riwayat = b.riwayat || [];
    return b;
  }
  function set(b) { b.meta = b.meta || {}; b.meta.diupdate = Date.now(); Store.set("brain", b); }
  function isSet() { var b = get(); return !!(b.bisnis && b.bisnis.nama); }
  function summary() {
    var b = get();
    if (!b.bisnis.nama) return "";
    return b.bisnis.nama + (b.bisnis.niche ? " · " + b.bisnis.niche : "");
  }
  function context() {
    var b = get();
    return [
      "Profil bisnis untuk konteks AI:",
      "- Nama: " + (b.bisnis.nama || "-"),
      "- Bidang/niche: " + (b.bisnis.niche || "-"),
      "- Produk: " + ((b.bisnis.produk || []).join(", ") || "-"),
      "- Target pasar: " + (b.bisnis.target || "-"),
      "- Lokasi: " + (b.bisnis.lokasi || "-"),
      "Gaya bahasa: " + (b.voice.tone || "santai") + ', sapaan "' + (b.voice.sapaan || "kamu") + '".' +
      (b.voice.contoh ? " Contoh gaya: " + b.voice.contoh : "")
    ].join("\n");
  }
  function logResult(entry) {
    var b = get(); b.riwayat.unshift(Object.assign({ t: Date.now() }, entry));
    b.riwayat = b.riwayat.slice(0, 60); set(b);
  }
  return { get: get, set: set, isSet: isSet, summary: summary, context: context, logResult: logResult };
})();
