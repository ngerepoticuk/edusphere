/* store.js — localStorage ber-namespace per produk. Versioned. */
window.Store = (function () {
  var ns = (window.APP && APP.id) || "app";
  function k(key) { return ns + ":" + key; }
  return {
    get: function (key, def) {
      try {
        var v = localStorage.getItem(k(key));
        return v == null ? (def === undefined ? null : def) : JSON.parse(v);
      } catch (e) { return def === undefined ? null : def; }
    },
    set: function (key, val) {
      try { localStorage.setItem(k(key), JSON.stringify(val)); return true; }
      catch (e) { return false; }
    },
    del: function (key) { try { localStorage.removeItem(k(key)); } catch (e) {} },
    push: function (key, item) {
      var arr = this.get(key, []); if (!Array.isArray(arr)) arr = [];
      arr.push(item); this.set(key, arr); return arr;
    },
    keys: function () { var out = []; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(ns + ":") === 0) out.push(k); } return out; },
    clearAll: function () { this.keys().forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); },

    /* ---- Backup pintar ---- */
    exportAll: function () {
      var data = {}; this.keys().forEach(function (k) { try { data[k.slice(ns.length + 1)] = JSON.parse(localStorage.getItem(k)); } catch (e) {} });
      return { app: ns, versi: 1, tanggal: new Date().toISOString(), data: data };
    },
    download: function () {
      var obj = this.exportAll();
      var blob = new Blob([JSON.stringify(obj, null, 1)], { type: "application/json" });
      var a = document.createElement("a");
      var d = new Date(), pad = function (n) { return (n < 10 ? "0" : "") + n; };
      a.href = URL.createObjectURL(blob);
      a.download = "backup-" + ns + "-" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + ".json";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
      this.set("__lastBackup", Date.now());
      if (window.UI) UI.toast("Backup terunduh — simpan baik-baik 🔒", "ok");
    },
    restore: function (obj) {
      if (!obj || !obj.data) return false;
      var self = this, pin = this.get("__pin"), key = this.get("apikey");
      this.clearAll();
      for (var k in obj.data) self.set(k, obj.data[k]);
      if (pin && !this.get("__pin")) this.set("__pin", pin);
      if (key && !this.get("apikey")) this.set("apikey", key);
      this.set("__seeded", 1);
      return true;
    },
    restoreFromFile: function (onDone) {
      var self = this;
      var inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
      inp.onchange = function () {
        var f = inp.files && inp.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          try {
            var obj = JSON.parse(r.result);
            if (obj.app && obj.app !== ns && window.UI && !confirm("Backup ini dari app lain (" + obj.app + "). Tetap pulihkan?")) return;
            if (self.restore(obj)) { if (window.UI) UI.toast("Data dipulihkan ✔", "ok"); if (onDone) onDone(); else location.reload(); }
          } catch (e) { if (window.UI) UI.toast("File backup tidak valid", "warn"); }
        };
        r.readAsText(f);
      };
      inp.click();
    },
    /* peringatan bila data ada tapi lama tak backup (7 hari) */
    backupDue: function () {
      if (this.keys().length < 4) return false;
      var last = this.get("__lastBackup", 0);
      return (Date.now() - last) > 7 * 864e5;
    }
  };
})();
