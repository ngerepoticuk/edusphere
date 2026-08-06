/* ai.js — lapisan AI BYOK (1 pintu). Default Gemini (ramah browser/CORS,
   key gratis dari Google AI Studio). Modul panggil AI.ask(), tak sentuh API. */
window.AI = (function () {
  function key() { return Store.get("apikey", ""); }
  function provider() { return (APP.ai && APP.ai.provider) || "gemini"; }
  function model() { return (APP.ai && APP.ai.model) || "gemini-3.6-flash"; }

  async function gemini(k, o) {
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" +
      model() + ":generateContent?key=" + encodeURIComponent(k);
    var parts = [{ text: o.prompt || "" }];
    if (o.image) { /* o.image = dataURL — vision (foto struk, dokumen, dll.) */
      var m = String(o.image).match(/^data:([^;]+);base64,(.+)$/);
      if (m) parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
    }
    var body = { contents: [{ role: "user", parts: parts }] };
    if (o.system) body.systemInstruction = { parts: [{ text: o.system }] };
    if (o.json) body.generationConfig = { responseMimeType: "application/json" };
    var r = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      var t = await r.text();
      var msg = "AI error " + r.status;
      try { msg = JSON.parse(t).error.message || msg; } catch (e) {}
      throw new Error(msg);
    }
    var d = await r.json();
    var parts = (((d.candidates || [])[0] || {}).content || {}).parts;
    var txt = parts && parts[0] ? parts[0].text : "";
    if (o.json) { try { return JSON.parse(txt); } catch (e) { return txt; } }
    return txt;
  }

  async function ask(o) {
    o = o || {};
    var k = key();
    if (!k) { var e = new Error("Belum ada API key. Buka Pengaturan."); e.code = "NO_KEY"; throw e; }
    return gemini(k, o);   // provider abstrak; tambah openai/groq di sini bila perlu
  }

  /* pilih foto → kompres ≤1024px → dataURL. Utk fitur vision (foto struk dsb). */
  function pickImage() {
    return new Promise(function (res, rej) {
      var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
      inp.onchange = function () {
        var f = inp.files && inp.files[0]; if (!f) return rej(new Error("Batal"));
        var r = new FileReader();
        r.onload = function () {
          var img = new Image();
          img.onload = function () {
            var mx = 1024, sc = Math.min(1, mx / Math.max(img.width, img.height));
            var c = document.createElement("canvas");
            c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
            c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
            res(c.toDataURL("image/jpeg", 0.85));
          };
          img.onerror = function () { rej(new Error("Gambar tidak terbaca")); };
          img.src = r.result;
        };
        r.readAsDataURL(f);
      };
      inp.click();
    });
  }

  return { ask: ask, hasKey: function () { return !!key(); }, pickImage: pickImage };
})();
