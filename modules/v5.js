/* v5.js — Pusat Pengingat EduSphere: kelas terdekat & pembayaran murid. */
(function () {
  if (!window.Remind) return;
  Remind.provide(function () {
    var out = [];
    (Store.get("edu_jadwal", []) || []).forEach(function (j) {
      var d = Remind.daysTo(j.tanggal);
      if (d != null && d >= 0 && d <= 1) out.push({
        icon: "calendar-time", level: d === 0 ? "warn" : "info",
        text: "Kelas: " + j.topik, sub: (j.kelas || "") + " · " + (d === 0 ? "HARI INI" : "besok") + " " + (j.jam || ""),
        go: "jadwal", label: "Lihat"
      });
    });
    var nunggak = (Store.get("edu_murid", []) || []).filter(function (m) { return m.bayar && m.bayar !== "lunas"; });
    if (nunggak.length) out.push({
      icon: "cash-banknote", level: "warn", text: nunggak.length + " murid belum lunas",
      sub: nunggak.slice(0, 3).map(function (m) { return m.nama; }).join(", "), go: "murid", label: "Tagih"
    });
    return out;
  });
})();
