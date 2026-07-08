/* image.js — gambar gratis tanpa key (Pollinations). */
window.Img = (function () {
  function url(prompt, opt) {
    opt = opt || {};
    var w = opt.w || 768, h = opt.h || 768;
    var seed = opt.seed == null ? Math.floor(Math.random() * 1e6) : opt.seed;
    return "https://image.pollinations.ai/prompt/" +
      encodeURIComponent(prompt) + "?width=" + w + "&height=" + h +
      "&seed=" + seed + "&nologo=true";
  }
  return { url: url };
})();
