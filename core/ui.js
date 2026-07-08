/* ui.js v3 — helper UI pakai-ulang: el(), money, esc, toast, modal, spinner
   + komponen data-viz premium: spark(), ringz(), donut(), avatar(), countUp(),
   statCard(), hero(). Vanilla, no-build. */
window.UI = (function () {
  function el(tag, attrs, kids) {
    var e = document.createElement(tag); attrs = attrs || {};
    for (var k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k.slice(0, 2) === "on" && typeof attrs[k] === "function")
        e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) {
      if (c == null) return;
      if (typeof c === "string") e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  }
  function money(n) { n = Math.round(+n || 0); return (n < 0 ? "−" : "") + "Rp" + Math.abs(n).toLocaleString("id-ID"); }
  function esc(s) {
    return (s == null ? "" : String(s)).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function toast(msg, type) {
    var host = document.getElementById("toasts");
    if (!host) { host = el("div", { id: "toasts", class: "toasts" }); document.body.appendChild(host); }
    var t = el("div", { class: "toast " + (type || ""), text: msg });
    host.appendChild(t);
    setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 300); }, 2800);
  }
  function modal(title, contentEl, opts) {
    opts = opts || {};
    var box = el("div", { class: "modal-box" }, [
      el("div", { class: "modal-head" }, [
        el("h3", { text: title }),
        el("button", { class: "x", html: "&times;", onclick: close })
      ]),
      el("div", { class: "modal-body" }, [contentEl])
    ]);
    if (opts.wide) box.classList.add("wide");
    var ov = el("div", { class: "modal-ov", onclick: function (e) { if (e.target === ov) close(); } }, [box]);
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add("show"); });
    function onKey(e) { if (e.key === "Escape") { e.stopPropagation(); close(); } }
    document.addEventListener("keydown", onKey);
    function close() { document.removeEventListener("keydown", onKey); ov.classList.remove("show"); setTimeout(function () { ov.remove(); }, 220); }
    return { close: close, box: box };
  }
  /* empty state premium: {icon, title, text, cta:{label,onClick,icon}} */
  function empty(o) {
    o = o || {};
    var kids = [
      o.icon ? el("div", { class: "empty-ic" }, [icon(o.icon)]) : null,
      o.title ? el("div", { class: "empty-title", text: o.title }) : null,
      el("div", { class: "empty-txt", html: o.text || "" })
    ];
    if (o.cta) {
      var b = el("button", { class: "btn btn-primary btn-sm", style: "margin-top:16px" },
        [o.cta.icon ? icon(o.cta.icon) : null, o.cta.label || "Mulai"]);
      b.addEventListener("click", o.cta.onClick || function () {});
      kids.push(b);
    }
    return el("div", { class: "empty" }, kids);
  }
  /* confetti-lite: rayakan momen menang (target tercapai, closing) */
  function celebrate() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    var host = el("div", { class: "confetti-host" });
    var cols = ["var(--primary)", "var(--accent)", "var(--warn)", "var(--ok)"];
    for (var i = 0; i < 32; i++) {
      var p = el("i", { class: "confetti" });
      p.style.left = (50 + (Math.random() * 60 - 30)) + "%";
      p.style.background = cols[i % cols.length];
      p.style.setProperty("--dx", (Math.random() * 300 - 150) + "px");
      p.style.setProperty("--dr", (Math.random() * 720 - 360) + "deg");
      p.style.animationDelay = (Math.random() * 0.15) + "s";
      host.appendChild(p);
    }
    document.body.appendChild(host);
    setTimeout(function () { host.remove(); }, 1800);
  }
  function spinner(label) {
    return el("div", { class: "spin" }, [el("span", { class: "dot" }), label || "AI sedang berpikir…"]);
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function icon(name, cls) { return el("i", { class: "ti ti-" + name + (cls ? " " + cls : ""), "aria-hidden": "true" }); }

  /* ================= v3: data-viz premium ================= */
  var NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  var uid = 0;

  /* sparkline area-gradient. data: number[]; opsi {w,h,color} */
  function spark(data, o) {
    o = o || {};
    var w = o.w || 200, h = o.h || 34, id = "sg" + (++uid);
    var color = o.color || "var(--primary)";
    var max = Math.max.apply(null, data.concat([1])), min = Math.min.apply(null, data.concat([0]));
    var span = (max - min) || 1;
    var pts = data.map(function (v, i) {
      var x = data.length > 1 ? i / (data.length - 1) * w : w / 2;
      var y = h - 3 - (v - min) / span * (h - 8);
      return [x.toFixed(1), y.toFixed(1)];
    });
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + "," + p[1]; }).join("");
    var area = line + "L" + w + "," + h + "L0," + h + "Z";
    var svg = svgEl("svg", { viewBox: "0 0 " + w + " " + h, preserveAspectRatio: "none" });
    var defs = svgEl("defs", {});
    var grad = svgEl("linearGradient", { id: id, x1: "0", y1: "0", x2: "0", y2: "1" });
    var s1 = svgEl("stop", { offset: "0", "stop-color": color, "stop-opacity": ".34" });
    var s2 = svgEl("stop", { offset: "1", "stop-color": color, "stop-opacity": "0" });
    grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad); svg.appendChild(defs);
    svg.appendChild(svgEl("path", { d: area, fill: "url(#" + id + ")" }));
    svg.appendChild(svgEl("path", { d: line, fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    var last = pts[pts.length - 1];
    if (last) svg.appendChild(svgEl("circle", { cx: last[0], cy: last[1], r: "2.6", fill: color }));
    return svg;
  }

  /* progress ring SVG. pct 0-100; opsi {size,stroke,color,label,of} */
  function ringz(pct, o) {
    o = o || {};
    var size = o.size || 92, st = o.stroke || 8, color = o.color || "var(--primary)";
    var r = (size - st) / 2, c = 2 * Math.PI * r;
    var val = Math.max(0, Math.min(100, +pct || 0));
    var svg = svgEl("svg", { width: size, height: size, viewBox: "0 0 " + size + " " + size });
    svg.appendChild(svgEl("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: "var(--line)", "stroke-width": st }));
    var fg = svgEl("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: color, "stroke-width": st, "stroke-linecap": "round", "stroke-dasharray": c, "stroke-dashoffset": c });
    fg.style.transition = "stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)";
    svg.appendChild(fg);
    var wrap = el("div", { class: "ringz", style: "width:" + size + "px;height:" + size + "px" }, [svg,
      el("div", { class: "lab" }, [
        el("div", { class: "num", style: "font-size:" + Math.round(size * .24) + "px", text: (o.label != null ? o.label : Math.round(val) + "%") }),
        o.of ? el("div", { class: "of", text: o.of }) : null
      ])
    ]);
    requestAnimationFrame(function () { requestAnimationFrame(function () { fg.setAttribute("stroke-dashoffset", c * (1 - val / 100)); }); });
    return wrap;
  }

  /* donut chart. parts: [{v,color,label}] ; opsi {size,stroke} */
  function donut(parts, o) {
    o = o || {};
    var size = o.size || 120, st = o.stroke || 14;
    var r = (size - st) / 2, c = 2 * Math.PI * r;
    var tot = parts.reduce(function (a, p) { return a + (+p.v || 0); }, 0) || 1;
    var svg = svgEl("svg", { width: size, height: size, viewBox: "0 0 " + size + " " + size, style: "transform:rotate(-90deg)" });
    svg.appendChild(svgEl("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: "var(--line)", "stroke-width": st }));
    var off = 0;
    parts.forEach(function (p) {
      var frac = (+p.v || 0) / tot, len = frac * c;
      if (len <= 0) return;
      svg.appendChild(svgEl("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: p.color || "var(--primary)", "stroke-width": st, "stroke-linecap": "butt", "stroke-dasharray": Math.max(0, len - 2) + " " + c, "stroke-dashoffset": -off }));
      off += len;
    });
    return svg;
  }

  /* avatar inisial */
  function avatar(name, o) {
    o = o || {};
    var init = String(name || "?").trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ""; }).join("").toUpperCase();
    return el("span", { class: "avatar", style: o.style || "", text: init || "?" });
  }

  /* animasi angka naik. node target, nilai akhir, formatter opsional */
  function countUp(node, to, fmt, dur) {
    to = +to || 0; fmt = fmt || function (v) { return Math.round(v).toLocaleString("id-ID"); };
    dur = dur || 800;
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = fmt(to * eased);
      if (p < 1) requestAnimationFrame(step); else node.textContent = fmt(to);
    }
    requestAnimationFrame(step);
    return node;
  }

  /* stat card premium: {label, value(num|string), fmt, delta, dir(up|down), icon, spark:[..]} */
  function statCard(o) {
    o = o || {};
    var valEl = el("div", { class: "cval", text: typeof o.value === "string" ? o.value : "" });
    var card = el("div", { class: "card" }, [
      o.icon ? el("span", { class: "icchip" }, [icon(o.icon)]) : null,
      el("div", { class: "clbl", text: o.label || "" }),
      valEl,
      o.delta ? el("div", { class: "cdelta " + (o.dir || ""), text: o.delta }) : null,
      o.spark && o.spark.length > 1 ? el("div", { class: "sparkbox" }, [spark(o.spark, { color: o.color })]) : null
    ]);
    if (typeof o.value === "number") countUp(valEl, o.value, o.fmt);
    return card;
  }

  /* hero panel dashboard: {kick, title(html ok), sub, kpis:[{k,v,d,dir}], right(el), actions:[el]} */
  function hero(o) {
    o = o || {};
    var left = el("div", { style: "flex:1;min-width:230px" }, [
      o.kick ? el("div", { class: "kick", text: o.kick }) : null,
      el("h1", { class: "h1", html: o.title || "" }),
      o.sub ? el("div", { class: "sub", text: o.sub }) : null,
      o.kpis && o.kpis.length ? el("div", { class: "hero-kpis" }, o.kpis.map(function (k) {
        var vEl = el("div", { class: "v", text: typeof k.v === "string" ? k.v : "" });
        if (typeof k.v === "number") countUp(vEl, k.v, k.fmt);
        return el("div", { class: "hkpi" }, [
          el("div", { class: "k", text: k.k }), vEl,
          k.d ? el("div", { class: "d " + (k.dir || ""), text: k.d }) : null
        ]);
      })) : null
    ]);
    var rowKids = [left];
    if (o.right) rowKids.push(el("div", { style: "flex:none;display:flex;align-items:center;gap:14px" }, [o.right]));
    var kids = [el("div", { class: "hero-row" }, rowKids)];
    if (o.actions && o.actions.length) kids.push(el("div", { class: "row gap8", style: "margin-top:16px" }, o.actions));
    return el("section", { class: "hero" }, kids);
  }

  return { el: el, money: money, esc: esc, toast: toast, modal: modal, spinner: spinner, clear: clear, icon: icon,
    spark: spark, ringz: ringz, donut: donut, avatar: avatar, countUp: countUp, statCard: statCard, hero: hero,
    empty: empty, celebrate: celebrate };
})();
