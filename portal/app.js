(function(){
"use strict";
const DATA = JSON.parse(document.getElementById("portal-data").textContent);
const R = DATA.R, H = DATA.H, M = DATA.M, GEO = DATA.geo, NAT = DATA.nat;
let LANG = "en";
const LI = () => (LANG === "zh" ? 1 : 0);

/* ---------- formatting ---------- */
const MINUS = "−";
const f1 = x => (x == null || isNaN(x)) ? "–" : (+x).toFixed(1).replace("-", MINUS);
const f2 = x => (+x).toFixed(2).replace("-", MINUS);
const f0 = x => Math.round(x).toString().replace("-", MINUS);
const sg = (x, d = 1) => (x < 0 ? MINUS : x > 0 ? "+" : "") + Math.abs(x).toFixed(d);
const thou = x => Math.round(x).toLocaleString("en-US");
const pct = (x, d = 1) => (x == null ? "–" : (+x).toFixed(d) + "%");

/* ---------- derived numbers used in copy ---------- */
const P = R.prev_arm, PW = R.prev_ward, D = R.did, META = R.meta;
const sum = (keys, f) => keys.reduce((a, k) => a + f(META[k]), 0);
const ALLK = ["0_0", "0_1", "1_0", "1_1"];
const het = (g, i) => R.het.filter(h => h.group === g)[i];
const wr = R.wealth.rdt;
const gap = k => wr[k][0].p - wr[k][4].p;
const fsH = H.fsat_tot.high, fsL = H.fsat_tot.low;
const visit = (a, v) => H.fsat_visits.find(x => x.area === a && x.visit === v);
const facSum = (blk) => H[blk].reduce((a, r) => [a[0] + r.susp, a[1] + r.pos], [0, 0]);
const hfL = facSum("hf_low"), hfH = facSum("hf_high");
const q1share = s => { const a = R.wealth_dist[s + "_0"][0] * META[s + "_0"].households, b = R.wealth_dist[s + "_1"][0] * META[s + "_1"].households; return (a + b) / (META[s + "_0"].households + META[s + "_1"].households); };
const FP = R.footprint;
const N = {
  b_int: f1(P["0_1"].p), b_ctl: f1(P["0_0"].p), e_int: f1(P["1_1"].p), e_ctl: f1(P["1_0"].p),
  cf: f1(R.counterfactual.expected), cf_red: f0(R.counterfactual.reduction), cf_red_s: MINUS + f0(R.counterfactual.reduction) + "%",
  people: thou(sum(ALLK, m => m.people)), tested: thou(sum(ALLK, m => m.tested)), hh: thou(sum(ALLK, m => m.households)),
  vill: String(FP.common.length + FP.baseline_only.length + FP.endline_only.length),
  n_common: String(FP.common.length), n_bonly: String(FP.baseline_only.length), n_eonly: String(FP.endline_only.length),
  or_adj: f2(D.logit_adj.inter.est), or_adj_lo: f2(D.logit_adj.inter.lo), or_adj_hi: f2(D.logit_adj.inter.hi),
  or_com: f2(D.logit_adj_common.inter.est), or_crude: f2(D.logit_crude.inter.est),
  b_ch: f1(PW["0_Chumbi"].p), e_ch: f1(PW["1_Chumbi"].p), did_ch_abs: Math.abs(D.lpm_adj_Chumbi.inter.est).toFixed(1), or_ik: f2(D.logit_adj_Ikwiriri.inter.est),
  b_514: f1(het("age", 1).base_int), did_514: sg(het("age", 1).did), did_u5: sg(het("age", 0).did), did_15: sg(het("age", 2).did),
  q1_b: f1(wr["0_1"][0].p), q5_b: f1(wr["0_1"][4].p), gap_int_b: f1(gap("0_1")), gap_int_e: f1(gap("1_1")), gap_ctl_e: f1(gap("1_0")),
  ratio_int_e: (wr["1_1"][0].p / wr["1_1"][4].p).toFixed(1),
  net_e_int: f0(R.nets.slept_net["1_1"].p), net_gain_ctl: f1(R.nets.slept_net["1_0"].p - R.nets.slept_net["0_0"].p), net_gain_int: f1(R.nets.slept_net["1_1"].p - R.nets.slept_net["0_1"].p),
  uga_min: String(Math.floor(Math.min(...ALLK.map(k => R.nets.use_given_access[k].p)))),
  fev_b_int: f1(R.rdt_by_fever["0_1_1"].p), fev_e_int: f1(R.rdt_by_fever["1_1_1"].p), fev_b_ctl: f1(R.rdt_by_fever["0_0_1"].p), fev_e_ctl: f1(R.rdt_by_fever["1_0_1"].p),
  fsat_scr: thou(fsH.screened + fsL.screened), fsat_pos: thou(fsH.pos + fsL.pos), fsat_tpr: f1(100 * (fsH.pos + fsL.pos) / (fsH.screened + fsL.screened)),
  fsat_rounds: String(parseInt(fsH.rounds_stated) + parseInt(fsL.rounds_stated)), fsat_ham: String(fsH.hamlets + fsL.hamlets),
  rv_h1: f1(visit("high", 1).tpr), rv_h3: f1(visit("high", 3).tpr),
  trav_or: R.travel_or.est.toFixed(1), trav_lo: f2(R.travel_or.lo), trav_hi: f2(R.travel_or.hi),
  trav_int_y: f1(R.travel["1_1"].p), trav_int_n: f1(R.travel["1_0"].p), trav_n_int: String(R.travel["1_1"].n),
  mda_hh: f0(R.mda.hh_part.p), mda_ind: f0(R.mda.ind_took.p), mda_nhh: String(R.mda.asked_hh), mda_took: f1(R.mda.rdt_by_took["1"].p), mda_not: f1(R.mda.rdt_by_took["0"].p),
  mic_tp: String(R.micro_rdt["1"].tp), mic_exp: f0(R.micro_rdt["1"].expected_overlap), mic_k1: R.micro_rdt["1"].kappa.toFixed(3), mic_k0: R.micro_rdt["0"].kappa.toFixed(2),
  gps_ward: f1(R.link_gps.ward_agree_pct), q1sh_b: f0(q1share("0")), q1sh_e: f0(q1share("1")),
  amelab: f0(H.hf_low_complete["AMELAB"]),
  b_people: thou(META["0_0"].people + META["0_1"].people), b_hh: thou(META["0_0"].households + META["0_1"].households),
  e_people: thou(META["1_0"].people + META["1_1"].people), e_hh: thou(META["1_0"].households + META["1_1"].households),
};
const t = k => { const v = T[k]; if (!v) return k; return v[LI()].replace(/\{(\w+)\}/g, (m, x) => (N[x] != null ? N[x] : m)); };

/* ---------- tokens ---------- */
let K = {};
function readTokens() {
  const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue("--" + n).trim();
  const names = ["bg","surface","surface-2","ink","ink-2","muted","line","line-2","accent","int","int-soft","ctl","ctl-soft","ctl-ink","hi-area","lo-area","care-1","care-2","care-3","care-4","care-o","land","land-line","water","night","night-2","on-night","on-night-2","night-line","n-int","n-ctl","good","critical","warning","serious"];
  K = {}; names.forEach(n => K[n] = g(n));
  K.heat = [0,1,2,3,4,5,6].map(i => g("heat-" + i)); K.teal = [0,1,2,3,4,5,6].map(i => g("teal-" + i));
}

/* ---------- tooltip ---------- */
const tip = document.getElementById("tip");
function tipShow(x, y, title, rows, note) {
  tip.replaceChildren();
  if (title) { const d = document.createElement("div"); d.className = "tt"; d.textContent = title; tip.appendChild(d); }
  (rows || []).forEach(r => {
    const d = document.createElement("div"); d.className = "tr";
    const i = document.createElement("i"); i.style.borderTopColor = r.c || "transparent"; if (r.dash) i.style.borderTopStyle = "dashed";
    const b = document.createElement("b"); b.textContent = r.v;
    const s = document.createElement("span"); s.textContent = r.l || "";
    d.append(i, b, s); tip.appendChild(d);
  });
  if (note) { const d = document.createElement("div"); d.className = "tn"; d.textContent = note; tip.appendChild(d); }
  tip.classList.add("on");
  const W = window.innerWidth, Hh = window.innerHeight, bw = tip.offsetWidth, bh = tip.offsetHeight;
  let L = x + 14, Tp = y + 14;
  if (L + bw > W - 8) L = x - bw - 14; if (L < 8) L = 8;
  if (Tp + bh > Hh - 8) Tp = y - bh - 14; if (Tp < 8) Tp = 8;
  tip.style.left = L + "px"; tip.style.top = Tp + "px";
}
const tipHide = () => tip.classList.remove("on");
function bindTip(sel, fn) {
  sel.on("pointermove", function (ev, d) { const c = fn.call(this, d, ev); if (c) tipShow(ev.clientX, ev.clientY, c[0], c[1], c[2]); })
     .on("pointerleave", tipHide)
     .on("focus", function (ev, d) { const c = fn.call(this, d, ev); const b = this.getBoundingClientRect(); if (c) tipShow(b.right, b.top, c[0], c[1], c[2]); })
     .on("blur", tipHide);
}
window.addEventListener("scroll", tipHide, { passive: true });

/* ---------- card scaffolding ---------- */
const CARDS = [];
function seg(container, opts, get, set) {
  container.replaceChildren();
  opts.forEach(o => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = t(o.k); b.setAttribute("aria-pressed", get() === o.v ? "true" : "false");
    b.addEventListener("click", () => { set(o.v); });
    container.appendChild(b);
  });
}
function makeCard(id, spec) {
  const root = document.getElementById(id);
  const c = { root, spec, tableOpen: false, state: Object.assign({}, spec.state || {}) };
  root.innerHTML = '<div class="card-h"><div><h3></h3><div class="sub"></div></div><div class="ctrls"></div></div><div class="legend"></div><div class="chart"></div><div class="note"></div><div class="card-foot"><span></span><button type="button" class="tbtn"></button></div><div class="tview" hidden></div>';
  c.h = root.querySelector("h3"); c.sub = root.querySelector(".sub"); c.ctrls = root.querySelector(".ctrls"); c.legend = root.querySelector(".legend");
  c.chart = root.querySelector(".chart"); c.note = root.querySelector(".note"); c.tv = root.querySelector(".tview"); c.tb = root.querySelector(".tbtn");
  c.tb.addEventListener("click", () => { c.tableOpen = !c.tableOpen; c.renderTable(); });
  c.renderTable = () => {
    c.tb.textContent = t(c.tableOpen ? "hide_table" : "show_table");
    c.tv.hidden = !c.tableOpen; if (!c.tableOpen) return;
    const tb = spec.table(c.state); const tbl = document.createElement("table");
    const thead = document.createElement("thead"), tr = document.createElement("tr");
    tb.head.forEach(h => { const th = document.createElement("th"); th.textContent = h; tr.appendChild(th); }); thead.appendChild(tr); tbl.appendChild(thead);
    const tbody = document.createElement("tbody");
    tb.rows.forEach(r => { const tr2 = document.createElement("tr"); r.forEach(v => { const td = document.createElement("td"); td.textContent = v; tr2.appendChild(td); }); tbody.appendChild(tr2); });
    tbl.appendChild(tbody); c.tv.replaceChildren(tbl);
  };
  c.draw = () => { const w = c.chart.clientWidth; if (w < 50) return; c.lastW = w; c.chart.replaceChildren(); spec.draw(c.chart, w, c.state); };
  c.render = () => {
    c.h.textContent = t(spec.title); c.sub.textContent = spec.sub ? t(spec.sub) : "";
    c.ctrls.replaceChildren();
    (spec.controls || []).forEach(ct => { const s = document.createElement("div"); s.className = "seg"; s.setAttribute("role", "group"); c.ctrls.appendChild(s);
      seg(s, ct.opts, () => c.state[ct.key], v => { c.state[ct.key] = v; c.render(); }); });
    c.legend.replaceChildren(); if (spec.legend) spec.legend(c.legend, c.state); c.legend.hidden = !spec.legend;
    const nt = spec.note ? (typeof spec.note === "function" ? spec.note(c.state) : t(spec.note)) : ""; c.note.textContent = nt; c.note.hidden = !nt;
    c.draw(); c.renderTable();
  };
  new ResizeObserver(() => { if (Math.abs(c.chart.clientWidth - (c.lastW || 0)) > 2) c.draw(); }).observe(c.chart);
  CARDS.push(c); return c;
}
function legendItems(el, items) {
  items.forEach(it => { const s = document.createElement("span"); const i = document.createElement("i"); i.className = it.cls;
    if (it.cls === "lk-line" || it.cls === "lk-dash") i.style.borderTopColor = it.c; else if (it.cls === "lk-ring") i.style.borderColor = it.c; else i.style.background = it.c;
    s.appendChild(i); s.appendChild(document.createTextNode(it.l)); el.appendChild(s); });
}
const svgEl = (el, w, h, label) => d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("width", "100%").attr("height", h).attr("role", "img").attr("aria-label", label || "").style("overflow", "visible").style("display", "block");
function yGrid(g, y, x0, x1, ticks, fmt, color, tcolor) {
  ticks.forEach(v => { g.append("line").attr("x1", x0).attr("x2", x1).attr("y1", Math.round(y(v)) + .5).attr("y2", Math.round(y(v)) + .5).attr("stroke", color).attr("stroke-width", 1);
    g.append("text").attr("x", x0 - 8).attr("y", y(v)).attr("dy", "0.32em").attr("text-anchor", "end").attr("font-size", 11.5).attr("fill", tcolor).style("font-variant-numeric", "tabular-nums").text(fmt(v)); });
}
function spread(items, minGap, lo, hi) {
  items.sort((a, b) => a.y - b.y);
  for (let i = 1; i < items.length; i++) if (items[i].ly - items[i - 1].ly < minGap) items[i].ly = items[i - 1].ly + minGap;
  const over = items.length ? items[items.length - 1].ly - hi : 0; if (over > 0) items.forEach(it => it.ly -= over);
  for (let i = items.length - 2; i >= 0; i--) if (items[i + 1].ly - items[i].ly < minGap) items[i].ly = items[i + 1].ly - minGap;
  if (items.length && items[0].ly < lo) { const d = lo - items[0].ly; items.forEach(it => it.ly += d); }
  return items;
}
const ciTxt = (lo, hi, d) => d === 2 ? `${f2(lo)}–${f2(hi)}` : `${f1(lo)}, ${f1(hi)}`;

/* ---------- slope chart ---------- */
function slope(el, w, d, o) {
  const night = !!o.night;
  const C = night ? { int: K["n-int"], ctl: K["n-ctl"], ink: K["on-night"], ink2: K["on-night-2"], grid: K["night-line"], ring: K["night"] }
                  : { int: K.int, ctl: K.ctl, ink: K.ink, ink2: K["ink-2"], grid: K.line, ring: K.surface };
  const h = o.h || 300, narrow = w < 460;
  const m = { l: 38, r: narrow ? 112 : 138, t: 26, b: 34 };
  const x0 = m.l + 22, x1 = w - m.r;
  const top = Math.max(d.bi.hi, d.bc.hi, d.ei.hi, d.ec.hi);
  const ymax = Math.ceil(top / 10) * 10;
  const y = d3.scaleLinear([0, ymax], [h - m.b, m.t]);
  const svg = svgEl(el, w, h, o.aria), g = svg.append("g");
  yGrid(g, y, m.l, x1 + 6, d3.range(0, ymax + 1, ymax > 30 ? 10 : 5), v => v + "%", C.grid, C.ink2);
  [[x0, t("s_base")], [x1, t("s_end")]].forEach(([x, l]) => g.append("text").attr("x", x).attr("y", h - 10).attr("text-anchor", "middle").attr("font-size", 12).attr("fill", C.ink2).text(l));
  // counterfactual
  g.append("line").attr("x1", x0).attr("y1", y(d.bi.p)).attr("x2", x1).attr("y2", y(d.cf)).attr("stroke", C.int).attr("stroke-width", 2).attr("stroke-dasharray", "5 5").attr("opacity", .75);
  const lines = [["ctl", d.bc, d.ec, C.ctl, -4], ["int", d.bi, d.ei, C.int, 4]];
  lines.forEach(([k, a, b, col]) => g.append("line").attr("x1", x0).attr("y1", y(a.p)).attr("x2", x1).attr("y2", y(b.p)).attr("stroke", col).attr("stroke-width", 2.5).attr("stroke-linecap", "round"));
  if (!night) { const red = Math.round(100 * (1 - d.ei.p / d.cf));
    const bt = g.append("text").attr("x", x0 + 4).attr("y", y(Math.min(4, ymax * 0.1)) - 4).attr("fill", C.ink);
    bt.append("tspan").attr("font-size", 20).attr("font-weight", 600).text(MINUS + red + "%");
    bt.append("tspan").attr("dx", 8).attr("font-size", 12).attr("fill", C.ink2).text(t("below_exp_long"));
 }
  // whiskers + dots
  const pts = [];
  lines.forEach(([k, a, b, col, off]) => { [[x0, a, "s_base"], [x1, b, "s_end"]].forEach(([x, v, rk]) => pts.push({ k, x: x + off, v, col, rk })); });
  pts.forEach(p => { g.append("line").attr("x1", p.x).attr("x2", p.x).attr("y1", y(p.v.lo)).attr("y2", y(p.v.hi)).attr("stroke", p.col).attr("stroke-width", 1.5).attr("opacity", .8); });
  g.append("circle").attr("cx", x1).attr("cy", y(d.cf)).attr("r", 4.5).attr("fill", C.ring).attr("stroke", C.int).attr("stroke-width", 2);
  const dots = g.selectAll(".dt").data(pts).join("circle").attr("cx", p => p.x).attr("cy", p => y(p.v.p)).attr("r", 5.5).attr("fill", p => p.col).attr("stroke", C.ring).attr("stroke-width", 2);
  // labels
  const lab = spread([
    { y: y(d.ec.p), ly: y(d.ec.p), a: t("s_ctl"), b: pct(d.ec.p), col: C.ctl },
    { y: y(d.cf), ly: y(d.cf), a: t("s_cf_short"), b: pct(d.cf), col: C.int, dash: true },
    { y: y(d.ei.p), ly: y(d.ei.p), a: t("s_int"), b: pct(d.ei.p), col: C.int },
  ], 30, m.t + 8, h - m.b - 4);
  lab.forEach(L => {
    const lx = x1 + 26;
    g.append("path").attr("d", `M${x1 + 9},${L.y}C${x1 + 18},${L.y} ${x1 + 14},${L.ly} ${lx - 4},${L.ly}`).attr("fill", "none").attr("stroke", C.grid).attr("stroke-width", 1);
    const tx = g.append("text").attr("x", lx).attr("y", L.ly).attr("font-size", 12).attr("fill", C.ink2);
    tx.append("tspan").attr("x", lx).attr("dy", "-0.35em").text(L.a);
    tx.append("tspan").attr("x", lx).attr("dy", "1.2em").attr("font-weight", 600).attr("fill", C.ink).attr("font-size", 13.5).text(L.b);
  });
  g.append("text").attr("x", 0).attr("y", 10).attr("font-size", 11).attr("fill", C.ink2).text(o.ylab || "");
  // hover
  const hits = g.selectAll(".hit").data(pts).join("circle").attr("class", "hit").attr("cx", p => p.x).attr("cy", p => y(p.v.p)).attr("r", 14).attr("tabindex", 0);
  bindTip(hits, p => [t(p.k === "int" ? "s_int" : "s_ctl") + " · " + t(p.rk), [{ c: p.col, v: pct(p.v.p), l: `95% CI ${f1(p.v.lo)}–${f1(p.v.hi)}` }], `n = ${thou(p.v.n)} · ${thou(p.v.k)} +`]);
}

/* ---------- forest plot ---------- */
function forest(el, w, rows, o) {
  const narrow = w < 420, rowH = 30, hdrH = 28, axisH = 40;
  const labelW = Math.min(Math.max(w * 0.36, 120), 240), textW = narrow ? 92 : 124, extraW = o.extra ? (narrow ? 46 : 64) : 0;
  const x0 = labelW + 8, x1 = w - textW - extraW - 8;
  let yy = o.extra ? 22 : 6; rows.forEach(r => { r._y = yy + (r.h ? hdrH : rowH) / 2 + (r.h ? 2 : 0); yy += r.h ? hdrH : rowH; });
  const h = yy + axisH;
  const x = o.log ? d3.scaleLog(o.domain, [x0, x1]).clamp(true) : d3.scaleLinear(o.domain, [x0, x1]).clamp(true);
  const svg = svgEl(el, w, h, o.aria), g = svg.append("g");
  const ticks = o.ticks || x.ticks(6);
  ticks.forEach(v => g.append("line").attr("x1", Math.round(x(v)) + .5).attr("x2", Math.round(x(v)) + .5).attr("y1", 4).attr("y2", yy).attr("stroke", K.line));
  g.append("line").attr("x1", Math.round(x(o.ref)) + .5).attr("x2", Math.round(x(o.ref)) + .5).attr("y1", 2).attr("y2", yy + 2).attr("stroke", K["line-2"]).attr("stroke-width", 1.5);
  ticks.forEach(v => g.append("text").attr("x", x(v)).attr("y", yy + 16).attr("text-anchor", "middle").attr("font-size", 11.5).attr("fill", K.muted).style("font-variant-numeric", "tabular-nums").text(o.tickFmt ? o.tickFmt(v) : v));
  g.append("text").attr("x", (x0 + x1) / 2).attr("y", yy + 34).attr("text-anchor", "middle").attr("font-size", 11.5).attr("fill", K["ink-2"]).text(o.xlab);
  if (o.extra) g.append("text").attr("x", w - 4).attr("y", 12).attr("text-anchor", "end").attr("font-size", 11).attr("fill", K.muted).text(o.extra);
  rows.forEach(r => {
    if (r.h) { g.append("text").attr("x", 0).attr("y", r._y).attr("dy", "0.32em").attr("font-size", 11).attr("font-weight", 600).attr("fill", K.muted).style("letter-spacing", ".06em").style("text-transform", "uppercase").style("font-family", "var(--f-mono)").text(r.label);
      g.append("line").attr("x1", 0).attr("x2", w).attr("y1", r._y - hdrH / 2 + 1.5).attr("y2", r._y - hdrH / 2 + 1.5).attr("stroke", K.line); return; }
    const col = r.color || K.int;
    const lt = g.append("text").attr("x", 0).attr("y", r._y).attr("dy", "0.32em").attr("font-size", narrow ? 12 : 13).attr("fill", r.muted ? K.muted : K.ink).text(r.label);
    if (r.label.length * (narrow ? 6.6 : 7.2) > labelW) lt.attr("textLength", labelW - 4).attr("lengthAdjust", "spacingAndGlyphs");
    g.append("line").attr("x1", x(r.lo)).attr("x2", x(r.hi)).attr("y1", r._y).attr("y2", r._y).attr("stroke", col).attr("stroke-width", 2).attr("stroke-linecap", "round").attr("opacity", r.muted ? .6 : 1);
    g.append(r.diamond ? "path" : "circle").call(s => r.diamond ? s.attr("d", `M${x(r.est)},${r._y - 6}l6,6l-6,6l-6,-6z`) : s.attr("cx", x(r.est)).attr("cy", r._y).attr("r", 5.5))
      .attr("fill", r.hollow ? K.surface : col).attr("stroke", r.hollow ? col : K.surface).attr("stroke-width", 2);
    g.append("text").attr("x", w - extraW - 4).attr("y", r._y).attr("dy", "0.32em").attr("text-anchor", "end").attr("font-size", narrow ? 11.5 : 12.5).attr("fill", r.sig === false ? K.muted : K.ink).style("font-variant-numeric", "tabular-nums")
      .text(o.fmt(r.est) + (narrow ? "" : ` (${o.ciFmt(r.lo, r.hi)})`));
    if (o.extra && r.extra != null) g.append("text").attr("x", w - 4).attr("y", r._y).attr("dy", "0.32em").attr("text-anchor", "end").attr("font-size", 12).attr("fill", K["ink-2"]).style("font-variant-numeric", "tabular-nums").text(r.extra);
  });
  const hits = g.selectAll(".hit").data(rows.filter(r => !r.h)).join("rect").attr("class", "hit").attr("x", 0).attr("width", w).attr("y", r => r._y - rowH / 2).attr("height", rowH).attr("tabindex", 0);
  bindTip(hits, r => [r.label, [{ c: r.color || K.int, v: o.fmt(r.est), l: `95% CI ${o.ciFmt(r.lo, r.hi)}` }], r.tipNote]);
}

/* ---------- small-multiple lines ---------- */
function smLines(el, w, panels, o) {
  const cols = w >= 500 ? panels.length : 1, gapX = 28, pw = (w - gapX * (cols - 1)) / cols, ph = o.h || 230;
  const rowsN = Math.ceil(panels.length / cols), h = rowsN * (ph + 30);
  const svg = svgEl(el, w, h, o.aria);
  panels.forEach((pn, i) => {
    const ox = (i % cols) * (pw + gapX), oy = Math.floor(i / cols) * (ph + 30);
    const g = svg.append("g").attr("transform", `translate(${ox},${oy})`);
    const m = { l: 36, r: 12, t: 26, b: 34 };
    const xs = d3.scalePoint(o.xLabels.map((_, j) => j), [m.l + 10, pw - m.r - 10]);
    const y = d3.scaleLinear([0, o.ymax], [ph - m.b, m.t]);
    g.append("text").attr("x", 0).attr("y", 12).attr("font-size", 13).attr("font-weight", 600).attr("fill", K.ink).text(pn.title);
    yGrid(g, y, m.l, pw - m.r, d3.range(0, o.ymax + 1, o.ystep), v => v + "%", K.line, K.muted);
    o.xLabels.forEach((l, j) => { const show = pw > 330 || j % 2 === 0 || j === o.xLabels.length - 1;
      if (show) g.append("text").attr("x", xs(j)).attr("y", ph - m.b + 17).attr("text-anchor", "middle").attr("font-size", 11).attr("fill", K.muted).text(l); });
    if (o.xlab) g.append("text").attr("x", (m.l + pw - m.r) / 2).attr("y", ph - 2).attr("text-anchor", "middle").attr("font-size", 11).attr("fill", K["ink-2"]).text(o.xlab);
    pn.series.forEach(s => {
      const pts = s.vals.map((v, j) => v ? [xs(j), y(v.p)] : null).filter(Boolean);
      g.append("path").attr("d", d3.line()(pts)).attr("fill", "none").attr("stroke", s.color).attr("stroke-width", 2).attr("stroke-linejoin", "round").attr("stroke-linecap", "round");
      g.selectAll(null).data(s.vals.map((v, j) => ({ v, j })).filter(d => d.v)).join("circle").attr("cx", d => xs(d.j)).attr("cy", d => y(d.v.p)).attr("r", 4).attr("fill", s.hollow ? K.surface : s.color).attr("stroke", s.hollow ? s.color : K.surface).attr("stroke-width", 2);
    });
    const cross = g.append("line").attr("y1", m.t).attr("y2", ph - m.b).attr("stroke", K["line-2"]).attr("opacity", 0);
    const ov = g.append("rect").attr("x", m.l).attr("y", m.t).attr("width", pw - m.l - m.r).attr("height", ph - m.t - m.b).attr("fill", "transparent").attr("tabindex", 0).attr("aria-label", pn.title);
    const at = (j, cx, cy) => { cross.attr("x1", xs(j)).attr("x2", xs(j)).attr("opacity", 1);
      tipShow(cx, cy, pn.title + " · " + o.xLabels[j], pn.series.map(s => ({ c: s.color, v: s.vals[j] ? pct(s.vals[j].p) : "–", l: s.label + (s.vals[j] ? ` (${f1(s.vals[j].lo)}–${f1(s.vals[j].hi)})` : "") })), o.tipNote ? o.tipNote(j) : null); };
    ov.on("pointermove", ev => { const [mx] = d3.pointer(ev); let best = 0, bd = 1e9; o.xLabels.forEach((_, j) => { const dd = Math.abs(xs(j) - mx); if (dd < bd) { bd = dd; best = j; } }); at(best, ev.clientX, ev.clientY); })
      .on("pointerleave", () => { cross.attr("opacity", 0); tipHide(); })
      .on("focus", function () { const b = this.getBoundingClientRect(); at(0, b.left + 40, b.top + 20); }).on("blur", () => { cross.attr("opacity", 0); tipHide(); });
  });
}

/* ---------- dumbbell ---------- */
function dumbbell(el, w, rows, o) {
  const narrow = w < 520, labelW = Math.min(Math.max(w * 0.3, 110), 200), rowH = 50, axisH = 38;
  const x0 = labelW + 12, x1 = w - 30;
  const x = d3.scaleLinear([0, o.xmax || 100], [x0, x1]);
  const h = rows.length * rowH + axisH + 6;
  const svg = svgEl(el, w, h, o.aria), g = svg.append("g");
  const ticks = d3.range(0, (o.xmax || 100) + 1, o.xstep || 20);
  ticks.forEach(v => { g.append("line").attr("x1", Math.round(x(v)) + .5).attr("x2", Math.round(x(v)) + .5).attr("y1", 0).attr("y2", rows.length * rowH).attr("stroke", K.line);
    g.append("text").attr("x", x(v)).attr("y", rows.length * rowH + 16).attr("text-anchor", "middle").attr("font-size", 11.5).attr("fill", K.muted).text(v + "%"); });
  g.append("text").attr("x", (x0 + x1) / 2).attr("y", rows.length * rowH + 33).attr("text-anchor", "middle").attr("font-size", 11.5).attr("fill", K["ink-2"]).text(o.xlab || "");
  const all = [];
  rows.forEach((r, i) => {
    const cy = i * rowH + rowH / 2;
    const lt = g.append("text").attr("x", 0).attr("y", cy).attr("dy", "0.32em").attr("font-size", narrow ? 12 : 13).attr("fill", K.ink).text(r.label);
    if (r.label.length * 7 > labelW) lt.attr("textLength", labelW - 2).attr("lengthAdjust", "spacingAndGlyphs");
    r.pairs.forEach((p, j) => {
      const py = cy + (r.pairs.length > 1 ? (j === 0 ? -8 : 8) : 0);
      g.append("line").attr("x1", x(p.a.p)).attr("x2", x(p.b.p)).attr("y1", py).attr("y2", py).attr("stroke", p.color).attr("stroke-width", 2).attr("opacity", .5);
      g.append("circle").attr("cx", x(p.a.p)).attr("cy", py).attr("r", 4.5).attr("fill", K.surface).attr("stroke", p.color).attr("stroke-width", 2);
      g.append("circle").attr("cx", x(p.b.p)).attr("cy", py).attr("r", 5).attr("fill", p.color).attr("stroke", K.surface).attr("stroke-width", 2);
      const right = p.b.p >= p.a.p, tx = x(p.b.p) + (right ? 10 : -10);
      g.append("text").attr("x", tx).attr("y", py).attr("dy", "0.32em").attr("text-anchor", right ? "start" : "end").attr("font-size", 11.5).attr("font-weight", 600).attr("fill", K.ink).style("font-variant-numeric", "tabular-nums").text(pct(p.b.p, 0));
      all.push({ r, p, py });
    });
  });
  const hits = g.selectAll(".hit").data(all).join("rect").attr("class", "hit").attr("x", x0 - 8).attr("width", x1 - x0 + 16).attr("y", d => d.py - 8).attr("height", 16).attr("tabindex", 0);
  bindTip(hits, d => [d.r.label + " · " + d.p.name, [{ c: d.p.color, v: pct(d.p.a.p), l: t("s_base_s") + ` (n=${thou(d.p.a.n)})` }, { c: d.p.color, v: pct(d.p.b.p), l: t("s_end_s") + ` (n=${thou(d.p.b.n)})` }], `${t("pn_change")}: ${sg(d.p.b.p - d.p.a.p)} ${t("pts")}`]);
}

/* ---------- stacked bars ---------- */
function stacked(el, w, rows, cats, o) {
  const labelW = Math.min(Math.max(w * 0.26, 110), 170), barH = 22, rowH = 40, x0 = labelW + 10, x1 = w - 4;
  const x = d3.scaleLinear([0, 100], [x0, x1]), h = rows.length * rowH + 26;
  const svg = svgEl(el, w, h, o.aria), g = svg.append("g");
  [0, 25, 50, 75, 100].forEach(v => g.append("text").attr("x", x(v)).attr("y", h - 6).attr("text-anchor", v === 0 ? "start" : v === 100 ? "end" : "middle").attr("font-size", 11).attr("fill", K.muted).text(v + "%"));
  const segs = [];
  rows.forEach((r, i) => {
    const cy = i * rowH + 8;
    g.append("text").attr("x", 0).attr("y", cy + barH / 2).attr("dy", "0.32em").attr("font-size", 12.5).attr("fill", K.ink).text(r.label);
    let acc = 0; const parts = cats.filter(c => (r.vals[c.k] || 0) > 0);
    parts.forEach((c, j) => { const v = r.vals[c.k]; const xa = x(acc), xb = x(acc + v) - (j < parts.length - 1 ? 2 : 0); acc += v;
      const rr = g.append("rect").attr("x", xa).attr("y", cy).attr("width", Math.max(0, xb - xa)).attr("height", barH).attr("fill", c.color).attr("rx", j === parts.length - 1 ? 3 : 0);
      segs.push({ r, c, v, xa, xb, cy });
      if (xb - xa > 34) g.append("text").attr("x", (xa + xb) / 2).attr("y", cy + barH / 2).attr("dy", "0.34em").attr("text-anchor", "middle").attr("font-size", 11).attr("font-weight", 600).attr("fill", c.dark ? "#0b0b0b" : "#ffffff").style("pointer-events", "none").text(Math.round(v) + "%");
    });
  });
  const hits = g.selectAll(".hit").data(segs).join("rect").attr("class", "hit").attr("x", d => d.xa).attr("y", d => d.cy - 4).attr("width", d => Math.max(4, d.xb - d.xa)).attr("height", barH + 8).attr("tabindex", 0);
  bindTip(hits, d => [d.r.label, [{ c: d.c.color, v: pct(d.v), l: t(d.c.l) }], `n = ${d.r.n}`]);
}

/* ---------- time series ---------- */
function tsChart(el, w, o) {
  const narrow = w < 560, h = narrow ? 280 : 320, m = { l: 40, r: 12, t: 22, b: 30 };
  const x = d3.scaleTime([new Date(2015, 10, 1), new Date(2016, 9, 22)], [m.l, w - m.r]);
  const y = d3.scaleLinear([0, 80], [h - m.b, m.t]);
  const svg = svgEl(el, w, h, o.aria), g = svg.append("g");
  const s0 = x(new Date(2016, 4, 1)), s1 = x(new Date(2016, 7, 31));
  g.append("rect").attr("x", s0).attr("y", m.t).attr("width", s1 - s0).attr("height", h - m.t - m.b).attr("fill", K["surface-2"]);
  g.append("text").attr("x", s0 + 6).attr("y", m.t + 13).attr("font-size", 11).attr("fill", K.muted).text(t("season"));
  yGrid(g, y, m.l, w - m.r, [0, 20, 40, 60, 80], v => v + "%", K.line, K.muted);
  const months = d3.timeMonth.range(new Date(2015, 10, 1), new Date(2016, 9, 2));
  months.forEach((d, i) => { if (narrow && i % 2) return; g.append("text").attr("x", x(d)).attr("y", h - 10).attr("text-anchor", "start").attr("font-size", 11).attr("fill", K.muted)
    .text(LANG === "zh" ? `${d.getMonth() + 1}月` : d.toLocaleString("en-US", { month: "short" }) + (d.getMonth() === 0 || i === 0 ? " " + String(d.getFullYear()).slice(2) : "")); });
  const prep = (rows, col, area) => rows.map(r => { const s = new Date(r.start), e = new Date(r.end); return { d: new Date((+s + +e) / 2), r, col, area }; });
  const SH = prep(H.hf_high, K["hi-area"], "hi"), SL = prep(H.hf_low, K["lo-area"], "lo");
  [SL, SH].forEach(S => { g.append("path").attr("d", d3.line().x(p => x(p.d)).y(p => y(p.r.tpr)).curve(d3.curveMonotoneX)(S)).attr("fill", "none").attr("stroke", S[0].col).attr("stroke-width", 2).attr("stroke-linejoin", "round"); });
  const flag = SH.find(p => p.r.label.indexOf("7-13.12") === 0);
  if (flag) g.append("circle").attr("cx", x(flag.d)).attr("cy", y(flag.r.tpr)).attr("r", 7).attr("fill", "none").attr("stroke", K.ink).attr("stroke-width", 1.2).attr("stroke-dasharray", "2 2");
  const FS = H.fsat_monthly.map(r => { const [yy, mm] = r.month.split("-").map(Number); return { d: new Date(yy, mm - 1, 15), r, col: r.area === "high" ? K["hi-area"] : K["lo-area"], area: r.area }; });
  g.selectAll(null).data(FS).join("circle").attr("cx", p => x(p.d)).attr("cy", p => y(p.r.tpr)).attr("r", 5).attr("fill", p => p.col).attr("stroke", K.surface).attr("stroke-width", 2);
  g.selectAll(null).data(FS).join("rect").attr("x", p => x(p.d) - 6).attr("y", p => y(p.r.tpr) - 6).attr("width", 12).attr("height", 12).attr("transform", p => `rotate(45 ${x(p.d)} ${y(p.r.tpr)})`).attr("fill", "none").attr("stroke", "none");
  const cross = g.append("line").attr("y1", m.t).attr("y2", h - m.b).attr("stroke", K["line-2"]).attr("opacity", 0);
  const near = (S, dt) => S.reduce((a, b) => Math.abs(b.d - dt) < Math.abs(a.d - dt) ? b : a);
  const ov = g.append("rect").attr("x", m.l).attr("y", m.t).attr("width", w - m.l - m.r).attr("height", h - m.t - m.b).attr("fill", "transparent").attr("tabindex", 0).attr("aria-label", t("k_ts_h"));
  const show = (dt, cx, cy) => {
    const a = near(SH, dt), b = near(SL, dt); cross.attr("x1", x(a.d)).attr("x2", x(a.d)).attr("opacity", 1);
    const rows = [{ c: a.col, v: pct(a.r.tpr), l: t("a_hi_s") + ` · ${thou(a.r.pos)}/${thou(a.r.susp)}` }, { c: b.col, v: pct(b.r.tpr), l: t("a_lo_s") + ` · ${thou(b.r.pos)}/${thou(b.r.susp)}` }];
    const mo = `${a.d.getFullYear()}-${String(a.d.getMonth() + 1).padStart(2, "0")}`;
    FS.filter(f => f.r.month === mo).forEach(f => rows.push({ c: f.col, v: pct(f.r.tpr), l: t("lk_fsat") + " · " + (f.area === "high" ? t("a_hi_s") : t("a_lo_s")), dash: true }));
    tipShow(cx, cy, a.r.label, rows, a === flag ? t("flag_dup") : null);
  };
  ov.on("pointermove", ev => { const [mx] = d3.pointer(ev); show(x.invert(mx), ev.clientX, ev.clientY); }).on("pointerleave", () => { cross.attr("opacity", 0); tipHide(); })
    .on("focus", function () { const b = this.getBoundingClientRect(); show(new Date(2016, 5, 10), b.left + b.width * .6, b.top + 30); }).on("blur", () => { cross.attr("opacity", 0); tipHide(); });
}

/* ---------- horizontal bars ---------- */
function hbars(el, w, rows, o) {
  const labelW = Math.min(Math.max(w * 0.4, 130), 230), rowH = 26, hdrH = 28, x0 = labelW + 8, x1 = w - 46;
  let yy = 0; rows.forEach(r => { r._y = yy + (r.h ? hdrH : rowH) / 2; yy += r.h ? hdrH : rowH; });
  const h = yy + 26, x = d3.scaleLinear([0, o.xmax], [x0, x1]);
  const svg = svgEl(el, w, h, o.aria), g = svg.append("g");
  [0, 25, 50, 75].forEach(v => { g.append("line").attr("x1", Math.round(x(v)) + .5).attr("x2", Math.round(x(v)) + .5).attr("y1", 0).attr("y2", yy).attr("stroke", K.line);
    g.append("text").attr("x", x(v)).attr("y", yy + 16).attr("text-anchor", "middle").attr("font-size", 11).attr("fill", K.muted).text(v + "%"); });
  rows.forEach(r => {
    if (r.h) { g.append("text").attr("x", 0).attr("y", r._y + 3).attr("dy", "0.32em").attr("font-size", 11).attr("font-weight", 600).attr("fill", K.muted).style("letter-spacing", ".05em").style("font-family", "var(--f-mono)").style("text-transform", "uppercase").text(r.label); return; }
    const lt = g.append("text").attr("x", 0).attr("y", r._y).attr("dy", "0.32em").attr("font-size", 12.5).attr("fill", K.ink).text(r.label);
    if (r.label.length * 6.8 > labelW) lt.attr("textLength", labelW - 2).attr("lengthAdjust", "spacingAndGlyphs");
    const bw = Math.max(1, x(r.v) - x0);
    g.append("path").attr("d", `M${x0},${r._y - 7}h${bw - 4}a4,4 0 0 1 4,4v6a4,4 0 0 1 -4,4h${-(bw - 4)}z`).attr("fill", r.color);
    g.append("text").attr("x", x0 + bw + 6).attr("y", r._y).attr("dy", "0.32em").attr("font-size", 12).attr("font-weight", 600).attr("fill", K.ink).style("font-variant-numeric", "tabular-nums").text(pct(r.v));
  });
  const hits = g.selectAll(".hit").data(rows.filter(r => !r.h)).join("rect").attr("class", "hit").attr("x", 0).attr("width", w).attr("y", r => r._y - rowH / 2).attr("height", rowH).attr("tabindex", 0);
  bindTip(hits, r => [r.label, [{ c: r.color, v: pct(r.v), l: r.tipL }], r.tipN]);
}

/* ---------- grouped columns ---------- */
function columns(el, w, groups, series, o) {
  const h = 260, m = { l: 40, r: 8, t: 14, b: 44 };
  const x = d3.scaleBand(groups.map((_, i) => i), [m.l, w - m.r]).padding(0.38);
  const y = d3.scaleLinear([0, o.ymax], [h - m.b, m.t]);
  const svg = svgEl(el, w, h, o.aria), g = svg.append("g");
  yGrid(g, y, m.l, w - m.r, d3.range(0, o.ymax + 1, 10), v => v + "%", K.line, K.muted);
  const bw = Math.min(24, (x.bandwidth() - 4) / series.length);
  const marks = [];
  groups.forEach((gl, i) => {
    const cx = x(i) + x.bandwidth() / 2, tot = bw * series.length + 4 * (series.length - 1);
    series.forEach((s, j) => { const v = s.vals[i]; const bx = cx - tot / 2 + j * (bw + 4), top = y(v.tpr), base = y(0);
      g.append("path").attr("d", `M${bx},${base}V${top + 4}a4,4 0 0 1 4,-4h${bw - 8}a4,4 0 0 1 4,4V${base}z`).attr("fill", s.color);
      g.append("text").attr("x", bx + bw / 2).attr("y", top - 6).attr("text-anchor", "middle").attr("font-size", 11.5).attr("font-weight", 600).attr("fill", K.ink).text(f1(v.tpr));
      marks.push({ s, v, gl, bx, top, base }); });
    g.append("text").attr("x", cx).attr("y", h - m.b + 18).attr("text-anchor", "middle").attr("font-size", 12).attr("fill", K["ink-2"]).text(gl);
  });
  g.append("text").attr("x", (m.l + w - m.r) / 2).attr("y", h - 6).attr("text-anchor", "middle").attr("font-size", 11.5).attr("fill", K["ink-2"]).text(o.xlab);
  const hits = g.selectAll(".hit").data(marks).join("rect").attr("class", "hit").attr("x", d => d.bx - 2).attr("width", bw + 4).attr("y", d => d.top - 18).attr("height", d => d.base - d.top + 18).attr("tabindex", 0);
  bindTip(hits, d => [d.s.name + " · " + d.gl, [{ c: d.s.color, v: pct(d.v.tpr), l: `${thou(d.v.pos)} / ${thou(d.v.scr)}` }], `${d.v.k} ${LANG === "zh" ? "次村组筛查" : "hamlet visits"}`]);
}

/* ================= CARDS ================= */
const SUBS = {
  all: () => ({ bi: P["0_1"], ei: P["1_1"], bc: P["0_0"], ec: P["1_0"] }),
  hi: () => ({ bi: PW["0_Chumbi"], ei: PW["1_Chumbi"], bc: P["0_0"], ec: P["1_0"] }),
  lo: () => ({ bi: PW["0_Ikwiriri"], ei: PW["1_Ikwiriri"], bc: P["0_0"], ec: P["1_0"] }),
  com: () => ({ bi: R.prev_arm_common["0_1"], ei: R.prev_arm_common["1_1"], bc: R.prev_arm_common["0_0"], ec: R.prev_arm_common["1_0"] }),
};
const subData = k => { const d = SUBS[k](); d.cf = d.bi.p * d.ec.p / d.bc.p; return d; };
let SUB = "all";
function renderSubSeg() { seg(document.getElementById("seg-sub"), [{ v: "all", k: "sub_all" }, { v: "hi", k: "sub_hi" }, { v: "lo", k: "sub_lo" }, { v: "com", k: "sub_com" }], () => SUB, v => { SUB = v; renderSubSeg(); cSlope.render(); }); }

const cSlope = makeCard("k-slope", {
  title: "k_slope_h", sub: "k_slope_s",
  legend: el => legendItems(el, [{ cls: "lk-line", c: K.int, l: t("s_int") }, { cls: "lk-line", c: K.ctl, l: t("s_ctl") }, { cls: "lk-dash", c: K.int, l: t("s_cf") }]),
  note: () => t("k_slope_note_" + SUB),
  draw: (el, w) => slope(el, w, subData(SUB), { h: 320, ylab: t("y_rdt"), aria: t("k_slope_h") }),
  table: () => { const d = subData(SUB); return { head: [t("th_group"), t("s_base"), t("s_end"), "n (2015 / 2018)"],
    rows: [[t("s_int"), `${pct(d.bi.p)} (${f1(d.bi.lo)}–${f1(d.bi.hi)})`, `${pct(d.ei.p)} (${f1(d.ei.lo)}–${f1(d.ei.hi)})`, `${thou(d.bi.n)} / ${thou(d.ei.n)}`],
           [t("s_ctl"), `${pct(d.bc.p)} (${f1(d.bc.lo)}–${f1(d.bc.hi)})`, `${pct(d.ec.p)} (${f1(d.ec.lo)}–${f1(d.ec.hi)})`, `${thou(d.bc.n)} / ${thou(d.ec.n)}`],
           [t("s_cf"), "", pct(d.cf), ""]] }; },
});
const robRows = sc => {
  const L = sc === "or";
  const spec = L ? [["r_crude", "logit_crude"], ["r_adj", "logit_adj"], ["r_com", "logit_adj_common"], ["r_hi", "logit_adj_Chumbi"], ["r_lo", "logit_adj_Ikwiriri"]]
                 : [["r_crude", "lpm_crude"], ["r_adj", "lpm_adj"], ["r_com", "lpm_adj_common"], ["r_hi", "lpm_adj_Chumbi"], ["r_lo", "lpm_adj_Ikwiriri"]];
  const rows = spec.map(([k, m]) => { const e = D[m].inter; return { label: t(k), est: e.est, lo: e.lo, hi: e.hi, sig: e.p < 0.05, tipNote: `p ${e.p < 0.001 ? "< 0.001" : "= " + e.p.toFixed(3)} · n = ${thou(D[m]._n)} · ${thou(D[m]._clusters)} ${LANG === "zh" ? "户" : "households"}`, color: e.p < 0.05 ? K.int : K.ctl }; });
  if (L) rows.push({ label: t("r_pub"), est: 0.34, lo: 0.26, hi: 0.44, hollow: true, color: K["ink-2"], muted: true });
  return rows;
};
const cRob = makeCard("k-robust", {
  title: "k_rob_h", sub: "k_rob_s", state: { sc: "or" },
  controls: [{ key: "sc", opts: [{ v: "or", k: "sc_or" }, { v: "pp", k: "sc_pp" }] }], note: "rob_note",
  draw: (el, w, s) => s.sc === "or"
    ? forest(el, w, robRows("or"), { log: true, domain: [0.1, 1.6], ticks: [0.1, 0.2, 0.5, 1], ref: 1, fmt: f2, ciFmt: (a, b) => `${f2(a)}–${f2(b)}`, xlab: t("x_or"), aria: t("k_rob_h") })
    : forest(el, w, robRows("pp"), { domain: [-25, 6], ticks: [-25, -20, -15, -10, -5, 0, 5], ref: 0, fmt: v => sg(v), ciFmt: (a, b) => `${f1(a)}, ${f1(b)}`, tickFmt: v => String(v).replace("-", MINUS), xlab: t("x_pp"), aria: t("k_rob_h") }),
  table: s => ({ head: [t("th_group"), t("th_est"), t("th_ci")], rows: robRows(s.sc).map(r => [r.label, s.sc === "or" ? f2(r.est) : sg(r.est), s.sc === "or" ? `${f2(r.lo)}–${f2(r.hi)}` : `${f1(r.lo)}, ${f1(r.hi)}`]) }),
});
const hetRows = sc => {
  const out = []; const groups = [["age", "g_age"], ["sex", "g_sex"], ["wealth", "g_wealth"], ["net", "g_net"], ["ward", "g_ward"]];
  groups.forEach(([g, k]) => { out.push({ h: true, label: t(k) });
    R.het.filter(h => h.group === g).forEach(h => { const L = sc === "or"; const sig = h.p < 0.05;
      out.push({ label: g === "ward" ? t(h.en.indexOf("High") === 0 ? "sub_hi" : "sub_lo") : (LANG === "zh" ? h.zh : h.en), est: L ? h.or : h.did, lo: L ? h.orlo : h.lo, hi: L ? h.orhi : h.hi, sig: L ? h.orhi < 1 : sig, extra: pct(h.base_int, 0), color: (L ? h.orhi < 1 : sig) ? K.int : K.ctl,
        tipNote: `${t("s_int")}: ${pct(h.base_int)} → ${pct(h.end_int)} · ${t("s_ctl")}: ${pct(h.base_ctl)} → ${pct(h.end_ctl)} · n = ${thou(h.n)}` }); }); });
  return out;
};
const cHet = makeCard("k-het", {
  title: "k_het_h", sub: "k_het_s", state: { sc: "pp" },
  controls: [{ key: "sc", opts: [{ v: "pp", k: "sc_pp" }, { v: "or", k: "sc_or" }] }],
  draw: (el, w, s) => s.sc === "or"
    ? forest(el, w, hetRows("or"), { log: true, domain: [0.1, 1.6], ticks: [0.1, 0.2, 0.5, 1], ref: 1, fmt: f2, ciFmt: (a, b) => `${f2(a)}–${f2(b)}`, xlab: t("x_or"), extra: t("col_base"), aria: t("k_het_h") })
    : forest(el, w, hetRows("pp"), { domain: [-25, 6], ticks: [-20, -10, 0], ref: 0, fmt: v => sg(v), ciFmt: (a, b) => `${f1(a)}, ${f1(b)}`, tickFmt: v => String(v).replace("-", MINUS), xlab: t("x_pp"), extra: t("col_base"), aria: t("k_het_h") }),
  table: s => ({ head: [t("th_group"), t("th_est"), t("th_ci"), t("col_base"), "n"], rows: hetRows(s.sc).filter(r => !r.h).map(r => [r.label, s.sc === "or" ? f2(r.est) : sg(r.est), s.sc === "or" ? `${f2(r.lo)}–${f2(r.hi)}` : `${f1(r.lo)}, ${f1(r.hi)}`, r.extra, ""]) }),
});
const twoRoundPanels = (src) => [
  { title: t("s_ctl"), series: [{ label: t("s_base_s"), color: K["ctl-soft"], vals: src["0_0"] }, { label: t("s_end_s"), color: K["ctl-ink"], vals: src["1_0"] }] },
  { title: t("s_int"), series: [{ label: t("s_base_s"), color: K["int-soft"], vals: src["0_1"] }, { label: t("s_end_s"), color: K.int, vals: src["1_1"] }] },
];
const roundLegend = el => legendItems(el, [{ cls: "lk-line", c: K["ctl-soft"], l: t("s_ctl") + " · 2015" }, { cls: "lk-line", c: K["ctl-ink"], l: t("s_ctl") + " · 2018" }, { cls: "lk-line", c: K["int-soft"], l: t("s_int") + " · 2015" }, { cls: "lk-line", c: K.int, l: t("s_int") + " · 2018" }]);
const cAge = makeCard("k-age", {
  title: "k_age_h", sub: "k_age_s", legend: roundLegend,
  draw: (el, w) => smLines(el, w, twoRoundPanels(R.age_curve.data), { xLabels: R.age_curve.labels, ymax: 50, ystep: 10, xlab: t("x_age"), aria: t("k_age_h") }),
  table: () => ({ head: [t("x_age"), "2015 " + t("arm_ctl"), "2018 " + t("arm_ctl"), "2015 " + t("arm_int"), "2018 " + t("arm_int")], rows: R.age_curve.labels.map((l, j) => [l, ...["0_0", "1_0", "0_1", "1_1"].map(k => pct(R.age_curve.data[k][j].p))]) }),
});
const wq = () => ["Q1", "Q2", "Q3", "Q4", "Q5"].map((q, i) => i === 0 ? t("q1l") : i === 4 ? t("q5l") : q);
const cWealth = makeCard("k-wealth", {
  title: "k_wealth_h", sub: "k_wealth_s", state: { m: "rdt" }, legend: roundLegend,
  controls: [{ key: "m", opts: [{ v: "rdt", k: "m_prev" }, { v: "slept_net", k: "m_net" }] }],
  draw: (el, w, s) => smLines(el, w, twoRoundPanels(R.wealth[s.m]), { xLabels: wq(), ymax: s.m === "rdt" ? 50 : 100, ystep: s.m === "rdt" ? 10 : 20, xlab: t("x_wq"), aria: t("k_wealth_h") }),
  table: s => ({ head: [t("x_wq"), "2015 " + t("arm_ctl"), "2018 " + t("arm_ctl"), "2015 " + t("arm_int"), "2018 " + t("arm_int")], rows: wq().map((l, j) => [l, ...["0_0", "1_0", "0_1", "1_1"].map(k => pct(R.wealth[s.m][k][j].p))]) }),
});
const netRows = () => [["n_hh", "hh_net"], ["n_has", "has_net"], ["n_slept", "slept_net"], ["n_uga", "use_given_access"]].map(([k, v]) => ({ label: t(k),
  pairs: [{ name: t("s_ctl"), color: K.ctl, a: R.nets[v]["0_0"], b: R.nets[v]["1_0"] }, { name: t("s_int"), color: K.int, a: R.nets[v]["0_1"], b: R.nets[v]["1_1"] }] }));
const cNets = makeCard("k-nets", {
  title: "k_nets_h", sub: "k_nets_s",
  legend: el => legendItems(el, [{ cls: "lk-dot", c: K.ctl, l: t("s_ctl") }, { cls: "lk-dot", c: K.int, l: t("s_int") }, { cls: "lk-ring", c: K["ink-2"], l: "2015" }, { cls: "lk-dot", c: K["ink-2"], l: "2018" }]),
  draw: (el, w) => dumbbell(el, w, netRows(), { xmax: 100, xstep: 20, xlab: t("x_pct"), aria: t("k_nets_h") }),
  table: () => ({ head: [t("th_group"), "2015 " + t("arm_ctl"), "2018 " + t("arm_ctl"), "2015 " + t("arm_int"), "2018 " + t("arm_int")], rows: netRows().map(r => [r.label, pct(r.pairs[0].a.p), pct(r.pairs[0].b.p), pct(r.pairs[1].a.p), pct(r.pairs[1].b.p)]) }),
});
const riskRows = () => {
  const rk = R.risk, mk = (k, key) => { const e = rk[key]; return { label: t(k), est: e.est, lo: e.lo, hi: e.hi, color: (e.hi < 1 || e.lo > 1) ? K.int : K.ctl, sig: (e.hi < 1 || e.lo > 1), tipNote: `p ${e.p < 0.001 ? "< 0.001" : "= " + e.p.toFixed(3)}` }; };
  return [{ h: true, label: t("g_person") }, mk("rk_age514", "age5_14"), mk("rk_age15", "age15"), mk("rk_male", "male"), mk("rk_net", "slept_net"),
          { h: true, label: t("g_wealth2") }, mk("rk_wq2", "wq=2"), mk("rk_wq3", "wq=3"), mk("rk_wq4", "wq=4"), mk("rk_wq5", "wq=5"),
          { h: true, label: t("g_house") }, mk("rk_eaves", "eaves_open"), mk("rk_screen", "screened"), mk("rk_floor", "floor_imp"), mk("rk_roof", "roof_imp"), mk("rk_wall", "wall_imp")];
};
const cRisk = makeCard("k-risk", {
  title: "k_risk_h", sub: "k_risk_s",
  draw: (el, w) => forest(el, w, riskRows(), { log: true, domain: [0.12, 3], ticks: [0.2, 0.5, 1, 2], ref: 1, fmt: f2, ciFmt: (a, b) => `${f2(a)}–${f2(b)}`, xlab: t("x_or2"), aria: t("k_risk_h") }),
  table: () => ({ head: [t("th_group"), t("th_est"), t("th_ci")], rows: riskRows().filter(r => !r.h).map(r => [r.label, f2(r.est), `${f2(r.lo)}–${f2(r.hi)}`]) }),
});
const feverRows = () => [["fv_yes", "1"], ["fv_no", "0"]].map(([k, f]) => ({ label: t(k),
  pairs: [{ name: t("s_ctl"), color: K.ctl, a: R.rdt_by_fever["0_0_" + f], b: R.rdt_by_fever["1_0_" + f] }, { name: t("s_int"), color: K.int, a: R.rdt_by_fever["0_1_" + f], b: R.rdt_by_fever["1_1_" + f] }] }));
const cFever = makeCard("k-fever", {
  title: "k_fever_h", sub: "k_fever_s",
  legend: el => legendItems(el, [{ cls: "lk-dot", c: K.ctl, l: t("s_ctl") }, { cls: "lk-dot", c: K.int, l: t("s_int") }, { cls: "lk-ring", c: K["ink-2"], l: "2015" }, { cls: "lk-dot", c: K["ink-2"], l: "2018" }]),
  draw: (el, w) => dumbbell(el, w, feverRows(), { xmax: 60, xstep: 10, xlab: t("y_rdt"), aria: t("k_fever_h") }),
  table: () => ({ head: [t("th_group"), "2015 " + t("arm_ctl"), "2018 " + t("arm_ctl"), "2015 " + t("arm_int"), "2018 " + t("arm_int")], rows: feverRows().map(r => [r.label, pct(r.pairs[0].a.p), pct(r.pairs[0].b.p), pct(r.pairs[1].a.p), pct(r.pairs[1].b.p)]) }),
});
const careCats = () => [{ k: "public", l: "w_public", color: K["care-1"] }, { k: "private", l: "w_private", color: K["care-2"], dark: true }, { k: "drugshop", l: "w_drugshop", color: K["care-3"] }, { k: "shop", l: "w_shop", color: K["care-4"] }, { k: "other", l: "w_other", color: K["care-o"], dark: true }];
const whereRows = () => [["row_b_ctl", "0_0"], ["row_b_int", "0_1"], ["row_e_ctl", "1_0"], ["row_e_int", "1_1"]].map(([k, s]) => { const v = Object.assign({}, R.where[s]); v.other = (v.community || 0) + (v.traditional || 0); return { label: t(k), vals: v, n: R.where_n[s] }; });
const cWhere = makeCard("k-where", {
  title: "k_where_h", sub: "k_where_s",
  legend: el => legendItems(el, careCats().map(c => ({ cls: "lk-box", c: c.color, l: t(c.l) }))),
  draw: (el, w) => stacked(el, w, whereRows(), careCats(), { aria: t("k_where_h") }),
  table: () => ({ head: [t("th_group"), ...careCats().map(c => t(c.l)), "n"], rows: whereRows().map(r => [r.label, ...careCats().map(c => pct(r.vals[c.k] || 0)), String(r.n)]) }),
});
const cTs = makeCard("k-ts", {
  title: "k_ts_h", sub: "k_ts_s",
  legend: el => legendItems(el, [{ cls: "lk-line", c: K["hi-area"], l: t("a_hi") }, { cls: "lk-line", c: K["lo-area"], l: t("a_lo") }, { cls: "lk-line", c: K["ink-2"], l: t("lk_fac") }, { cls: "lk-dot", c: K["ink-2"], l: t("lk_fsat") }]),
  draw: (el, w) => tsChart(el, w, { aria: t("k_ts_h") }),
  table: () => ({ head: [LANG === "zh" ? "周期" : "Period", t("a_hi_s") + " %", t("tt_tested"), t("a_lo_s") + " %", t("tt_tested")], rows: H.hf_high.map((r, i) => [r.label, pct(r.tpr), thou(r.susp), H.hf_low[i] ? pct(H.hf_low[i].tpr) : "", H.hf_low[i] ? thou(H.hf_low[i].susp) : ""]) }),
});
const facRows = () => {
  const mk = (blk, comp, col) => Object.keys(H[blk][0].fac).map(f => ({ f, v: H.fac_tot[f].tpr, c: comp[f] })).sort((a, b) => b.v - a.v).map(r => ({ label: r.f + (r.c < 100 ? ` · ${r.c}%` : ""), v: r.v, color: col, tipL: `${thou(H.fac_tot[r.f].pos)} / ${thou(H.fac_tot[r.f].susp)}`, tipN: r.c < 100 ? `${r.c}% ${t("wk_rep")}` : null }));
  return [{ h: true, label: t("a_hi_s") }, ...mk("hf_high", H.hf_high_complete, K["hi-area"]), { h: true, label: t("a_lo_s") }, ...mk("hf_low", H.hf_low_complete, K["lo-area"])];
};
const cFac = makeCard("k-facbars", {
  title: "k_fb_h", sub: "k_fb_s",
  draw: (el, w) => hbars(el, w, facRows(), { xmax: 75, aria: t("k_fb_h") }),
  table: () => ({ head: [t("th_group"), "%", t("tt_tested")], rows: facRows().filter(r => !r.h).map(r => [r.label, pct(r.v), r.tipL]) }),
});
const cVis = makeCard("k-visits", {
  title: "k_vis_h", sub: "k_vis_s",
  legend: el => legendItems(el, [{ cls: "lk-box", c: K["hi-area"], l: t("a_hi_s") }, { cls: "lk-box", c: K["lo-area"], l: t("a_lo_s") }]),
  draw: (el, w) => columns(el, w, [t("vis_1"), t("vis_2"), t("vis_3")], [{ name: t("a_hi_s"), color: K["hi-area"], vals: [1, 2, 3].map(v => visit("high", v)) }, { name: t("a_lo_s"), color: K["lo-area"], vals: [1, 2, 3].map(v => visit("low", v)) }], { ymax: 50, xlab: t("x_vis"), aria: t("k_vis_h") }),
  table: () => ({ head: [t("x_vis"), t("a_hi_s"), t("a_lo_s")], rows: [1, 2, 3].map((v, i) => [[t("vis_1"), t("vis_2"), t("vis_3")][i], `${pct(visit("high", v).tpr)} (${thou(visit("high", v).scr)})`, `${pct(visit("low", v).tpr)} (${thou(visit("low", v).scr)})`]) }),
});

/* ---------- hero ---------- */
let heroW = 0;
function drawHero() { const el = document.getElementById("c-hero"); const w = el.clientWidth; if (w < 50) return; heroW = w; el.replaceChildren(); slope(el, w, subData("all"), { night: true, h: 300, ylab: t("y_rdt"), aria: t("hero_h1") }); }
new ResizeObserver(() => { const el = document.getElementById("c-hero"); if (Math.abs(el.clientWidth - heroW) > 2) drawHero(); }).observe(document.getElementById("c-hero"));

/* ================= MAP ================= */
const MAP = { view: "survey", metric: "prev", round: "1", fac: false, sel: null };
const feats = GEO.features, byId = {}; feats.forEach(f => byId[f.properties.id] = f);
const PREV_BINS = [5, 10, 15, 20, 30, 40], NET_BINS = [40, 50, 60, 70, 80, 90];
let mapSvg, mapG, zoomB, mapProj, mapPath, mapW = 0, curK = 1;
const FAC = H.facilities.filter(f => f.lat && f.lon);
const isHC = f => /health cent|hospital|hospitali/i.test(f.type);
function mapValue(id) { const m = M[id]; if (!m || !m[MAP.round]) return null; return MAP.metric === "prev" ? m[MAP.round].prev : m[MAP.round].net; }
function binColor(v) { if (v == null) return null; const bins = MAP.metric === "prev" ? PREV_BINS : NET_BINS, ramp = MAP.metric === "prev" ? K.heat : K.teal; let i = 0; while (i < bins.length && v >= bins[i]) i++; return ramp[i]; }
function fillFor(f) {
  const p = f.properties;
  if (MAP.view === "survey") { if (M[p.id]) { const c = binColor(mapValue(p.id)); return c || "url(#hatch)"; } return K.land; }
  const a = p[MAP.view === "p1" ? "p1" : "p2"]; return a === 1 ? K.int : a === 0 ? K.ctl : K.land;
}
const GROUPS = {
  survey: [["area_Ikwiriri", ids => ids.filter(i => M[i] && M[i].area === "Ikwiriri")], ["area_Chumbi", ids => ids.filter(i => M[i] && M[i].area === "Chumbi")], ["area_Kibiti", ids => ids.filter(i => M[i] && M[i].area === "Kibiti")], ["area_Bungu", ids => ids.filter(i => M[i] && M[i].area === "Bungu")]],
};
const wardGroups = view => (view === "p1"
  ? [["Ikwiriri · Umwe · Mgomba", ["Ikwiriri", "Umwe", "Mgomba"]], ["Chumbi (Mohoro)", ["Chumbi"]], ["Kibiti · Dimani · Mtawanya", ["Kibiti", "Dimani", "Mtawanya"]], ["Bungu · Mjawa", ["Bungu", "Mjawa"]]]
  : [["Ikwiriri · Umwe · Mgomba", ["Ikwiriri", "Umwe", "Mgomba"]], ["Chumbi", ["Chumbi"]], ["Kibiti · Dimani · Mtawanya", ["Kibiti", "Dimani", "Mtawanya"]], ["Bungu · Mjawa", ["Bungu", "Mjawa"]], ["Ngorongo", ["Ngorongo"]], ["Ruaruke", ["Ruaruke"]],
     ["Tingi · Miteja · Kinjumbi", ["Tingi", "Miteja", "Kinjumbi"]], ["Chumo · Mingumbi", ["Chumo", "Mingumbi"]], ["Pande", ["Pande"]], ["Njinjo · Mitole · Miguruwe · Kandawale", ["Njinjo", "Mitole", "Miguruwe", "Kandawale"]]]);
function groupCentroid(fs) { let A = 0, x = 0, y = 0; fs.forEach(f => { const a = Math.max(f.properties.area, 0.01); A += a; x += f.properties.c[0] * a; y += f.properties.c[1] * a; }); return [x / A, y / A]; }
function mapTarget() {
  const pick = MAP.view === "survey" ? feats.filter(f => M[f.properties.id]) : feats.filter(f => f.properties[MAP.view === "p1" ? "p1" : "p2"] != null);
  return { type: "FeatureCollection", features: pick };
}
function drawMap() {
  const stage = document.getElementById("map-stage"); const w = stage.clientWidth; if (w < 50) return; mapW = w;
  const h = w < 560 ? Math.round(w * 1.05) : Math.round(Math.min(640, Math.max(420, w * 0.62)));
  mapSvg = d3.select("#map-svg").attr("viewBox", `0 0 ${w} ${h}`).attr("height", h); mapSvg.selectAll("*").remove();
  const defs = mapSvg.append("defs");
  const pat = defs.append("pattern").attr("id", "hatch").attr("patternUnits", "userSpaceOnUse").attr("width", 6).attr("height", 6).attr("patternTransform", "rotate(45)");
  pat.append("rect").attr("width", 6).attr("height", 6).attr("fill", K.land); pat.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6).attr("stroke", K["line-2"]).attr("stroke-width", 1.5);
  mapSvg.append("rect").attr("width", w).attr("height", h).attr("fill", K.water);
  const ext = w >= 760 ? [[262, 22], [w - 58, h - 22]] : w >= 560 ? [[24, 190], [w - 56, h - 20]] : [[16, 16], [w - 52, h - 16]];
  mapProj = d3.geoIdentity().reflectY(true).fitExtent(ext, mapTarget());
  mapPath = d3.geoPath(mapProj);
  mapG = mapSvg.append("g");
  const vis = mapG.append("g");
  vis.selectAll("path").data(feats).join("path").attr("d", mapPath).attr("fill", fillFor).attr("stroke", K["land-line"]).attr("stroke-width", 0.7).attr("vector-effect", "non-scaling-stroke")
    .attr("fill-rule", "evenodd").attr("tabindex", f => (MAP.view === "survey" && M[f.properties.id]) ? 0 : null).attr("data-id", f => f.properties.id).style("cursor", f => M[f.properties.id] ? "pointer" : "default")
    .on("click", (ev, f) => { selectVillage(f.properties.id); })
    .on("keydown", (ev, f) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); selectVillage(f.properties.id); } });
  bindTip(vis.selectAll("path"), f => mapTip(f));
  if (MAP.view === "survey") {
    const sv = feats.filter(f => M[f.properties.id]);
    mapG.append("g").selectAll("path").data(sv).join("path").attr("d", mapPath).attr("fill", "none").attr("stroke", f => M[f.properties.id].arm === 1 ? K.int : K["ctl-ink"]).attr("stroke-width", 1.6).attr("vector-effect", "non-scaling-stroke").style("pointer-events", "none");
  }
  const selL = mapG.append("g").attr("class", "sel-layer");
  if (MAP.sel && byId[MAP.sel]) selL.append("path").attr("d", mapPath(byId[MAP.sel])).attr("fill", "none").attr("stroke", K.ink).attr("stroke-width", 3).attr("vector-effect", "non-scaling-stroke").style("pointer-events", "none");
  // facilities
  if (MAP.fac) {
    const fg = mapG.append("g").attr("class", "fac");
    const fc = fg.selectAll("circle").data(FAC).join("circle").attr("cx", f => mapProj([f.lon, f.lat])[0]).attr("cy", f => mapProj([f.lon, f.lat])[1]).attr("r", f => (isHC(f) ? 4.5 : 3) / curK)
      .attr("fill", f => isHC(f) ? K.ink : K.surface).attr("stroke", f => isHC(f) ? K.surface : K.ink).attr("stroke-width", 1.4).attr("vector-effect", "non-scaling-stroke");
    bindTip(fc, f => [f.name, [{ c: K.ink, v: f.type, l: "" }], `${f.ward} · ${f.council} · ${f.own}`]);
  }
  // labels
  const lg = mapG.append("g").attr("class", "labels").style("pointer-events", "none");
  const ids = feats.map(f => f.properties.id);
  const labs = MAP.view === "survey"
    ? GROUPS.survey.map(([k, fn]) => [t(k), groupCentroid(fn(ids).map(i => byId[i]))])
    : wardGroups(MAP.view).map(([l, wards]) => [l, groupCentroid(feats.filter(f => wards.includes(f.properties.ward) && f.properties[MAP.view === "p1" ? "p1" : "p2"] != null))]).filter(d => !isNaN(d[1][0]));
  labs.forEach(([l, c]) => { const [px, py] = mapProj(c);
    lg.append("text").attr("x", px).attr("y", py).attr("text-anchor", "middle").attr("font-size", 12 / curK).attr("font-weight", 650).attr("fill", K.ink).attr("stroke", K.surface).attr("stroke-width", 3.2 / curK).attr("paint-order", "stroke").attr("stroke-linejoin", "round").text(l); });
  zoomB = d3.zoom().scaleExtent([1, 14]).translateExtent([[-w * .5, -h * .5], [w * 1.5, h * 1.5]])
    .filter(ev => ev.type === "wheel" ? (ev.ctrlKey || ev.metaKey) : (ev.type === "touchstart" ? ev.touches.length > 1 : !ev.button))
    .on("zoom", ev => { curK = ev.transform.k; mapG.attr("transform", ev.transform); mapG.selectAll(".labels text").attr("font-size", 12 / curK).attr("stroke-width", 3.2 / curK);
      mapG.selectAll(".fac circle").attr("r", f => (isHC(f) ? 4.5 : 3) / Math.sqrt(curK)); });
  mapSvg.call(zoomB).on("dblclick.zoom", null); mapSvg.style("touch-action", "pan-y");
  curK = 1;
  drawLegend(); drawInset(); renderPanel(); renderVTable();
}
function mapTip(f) {
  const p = f.properties, m = M[p.id];
  const title = p.vil + " · " + p.ward;
  if (MAP.view !== "survey") { const a = p[MAP.view === "p1" ? "p1" : "p2"]; return [title, [{ c: a === 1 ? K.int : a === 0 ? K.ctl : K["line-2"], v: a === 1 ? t("lg_p_int") : a === 0 ? t("lg_p_ctl") : t("lg_p_out"), l: "" }], p.dist]; }
  if (!m) return [title, [], t("pn_notin")];
  const rows = [];
  ["0", "1"].forEach(s => { const r = m[s]; const v = r ? (MAP.metric === "prev" ? r.prev : r.net) : null;
    rows.push({ c: r ? binColor(v) : K["line-2"], v: r ? pct(v) : "–", l: (s === "0" ? "2015" : "2018") + (r ? ` · n=${r.n}` : " · " + t("pn_ns")) }); });
  return [m.names.join(", "), rows, `${p.ward} · ${m.arm === 1 ? t("arm_int") : t("arm_ctl")}`];
}
function drawLegend() {
  const el = document.getElementById("map-legend"); el.replaceChildren();
  const add = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; el.appendChild(e); return e; };
  if (MAP.view === "survey") {
    add("div", "ttl", t(MAP.metric === "prev" ? "lg_prev" : "lg_net") + " · " + (MAP.round === "0" ? "2015" : "2018"));
    const ramp = add("div", "ramp"); (MAP.metric === "prev" ? K.heat : K.teal).forEach(c => { const s = document.createElement("span"); s.style.background = c; ramp.appendChild(s); });
    const tk = add("div", "ramp-t"); ["", ...(MAP.metric === "prev" ? PREV_BINS : NET_BINS), ""].forEach((v, i, a) => { const s = document.createElement("span"); s.textContent = i === 0 ? "0" : i === a.length - 1 ? (MAP.metric === "prev" ? "" : "100") : v; tk.appendChild(s); });
    const r1 = add("div", "row"); r1.innerHTML = `<svg width="18" height="12"><rect x="1" y="1" width="16" height="10" fill="url(#hatchL)" stroke="${K["line-2"]}"/><defs><pattern id="hatchL" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)"><rect width="5" height="5" fill="${K.land}"/><line x1="0" y1="0" x2="0" y2="5" stroke="${K["line-2"]}" stroke-width="1.4"/></pattern></defs></svg>`; r1.appendChild(document.createTextNode(t("lg_nodata")));
    const r2 = add("div", "row"); r2.innerHTML = `<svg width="18" height="12"><rect x="1" y="1" width="16" height="10" fill="none" stroke="${K.int}" stroke-width="2"/></svg>`; r2.appendChild(document.createTextNode(t("lg_int_o")));
    const r3 = add("div", "row"); r3.innerHTML = `<svg width="18" height="12"><rect x="1" y="1" width="16" height="10" fill="none" stroke="${K["ctl-ink"]}" stroke-width="2"/></svg>`; r3.appendChild(document.createTextNode(t("lg_ctl_o")));
  } else {
    add("div", "ttl", t(MAP.view === "p1" ? "p1_title" : "p2_title"));
    [[K.int, "lg_p_int"], [K.ctl, "lg_p_ctl"], [K.land, "lg_p_out"]].forEach(([c, k]) => { const r = add("div", "row"); r.innerHTML = `<svg width="18" height="12"><rect x="1" y="1" width="16" height="10" rx="2" fill="${c}" stroke="${K["line-2"]}"/></svg>`; r.appendChild(document.createTextNode(t(k))); });
    if (MAP.view === "p2") { const n = add("div", null, t("p2_note")); n.style.marginTop = "8px"; n.style.fontSize = "11.5px"; n.style.color = "var(--muted)"; n.style.lineHeight = "1.4"; }
  }
  if (MAP.fac) { const r = add("div", "row"); r.innerHTML = `<svg width="18" height="12"><circle cx="5" cy="6" r="4" fill="${K.ink}" stroke="${K.surface}" stroke-width="1.4"/><circle cx="14" cy="6" r="3" fill="${K.surface}" stroke="${K.ink}" stroke-width="1.4"/></svg>`; r.appendChild(document.createTextNode(t("fac_hc") + " · " + t("fac_disp"))); }
}
function drawInset() {
  const s = d3.select("#inset-svg"); s.selectAll("*").remove();
  const pr = d3.geoIdentity().reflectY(true).fitSize([108, 108], NAT), pth = d3.geoPath(pr);
  const hi = MAP.view === "p2" ? ["Rufiji DC", "Kibiti DC", "Kilwa DC"] : ["Rufiji DC", "Kibiti DC"];
  s.selectAll("path").data(NAT.features).join("path").attr("d", pth).attr("fill", f => hi.includes(f.properties.n) ? K.int : K.land).attr("stroke", K["land-line"]).attr("stroke-width", .3);
}
function selectVillage(id) { MAP.sel = id; const L = mapG.select(".sel-layer"); L.selectAll("*").remove();
  if (byId[id]) L.append("path").attr("d", mapPath(byId[id])).attr("fill", "none").attr("stroke", K.ink).attr("stroke-width", 3).attr("vector-effect", "non-scaling-stroke").style("pointer-events", "none");
  renderPanel(); renderVTable(); }
function renderPanel() {
  const el = document.getElementById("panel"); el.replaceChildren();
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const id = MAP.sel, f = id && byId[id];
  if (!f) { el.appendChild(mk("div", "eyebrow", t("ctl_view") + " · " + t(MAP.view === "survey" ? "v_survey" : MAP.view === "p1" ? "v_p1" : "v_p2"))); el.appendChild(mk("p", "empty", t("pn_empty")));
    const s = mk("div", "pv"); [["s_base", P["0_1"], P["0_0"]], ["s_end", P["1_1"], P["1_0"]]].forEach(([k, a, b]) => { const bx = mk("div", "box"); bx.appendChild(mk("div", "k", t(k))); bx.appendChild(mk("div", "v", pct(a.p))); bx.appendChild(mk("div", "n", t("s_int") + " · " + t("s_ctl") + " " + pct(b.p))); s.appendChild(bx); }); el.appendChild(s); return; }
  const p = f.properties, m = M[id];
  el.appendChild(mk("div", "eyebrow", p.dist));
  el.appendChild(mk("h3", null, p.vil));
  el.appendChild(mk("div", "meta", `${t("pn_ward")}: ${p.ward}`));
  if (!m) { el.appendChild(mk("p", "empty", t("pn_notin"))); return; }
  const pill = mk("span", "armpill"); const dot = mk("i"); dot.style.background = m.arm === 1 ? K.int : K.ctl; pill.append(dot, document.createTextNode(m.arm === 1 ? t("arm_int") : t("arm_ctl"))); el.appendChild(pill);
  const pv = mk("div", "pv");
  [["0", "s_base"], ["1", "s_end"]].forEach(([s, k]) => { const r = m[s]; const bx = mk("div", "box"); bx.appendChild(mk("div", "k", t(k)));
    bx.appendChild(mk("div", "v", r ? pct(r.prev) : "–")); bx.appendChild(mk("div", "n", r ? `${thou(r.n)} ${t("pn_tested")} · ${thou(r.hh)} ${t("pn_hh")}` : t("pn_ns"))); pv.appendChild(bx); });
  el.appendChild(pv);
  const pv2 = mk("div", "pv");
  const chg = (m["0"] && m["1"]) ? sg(m["1"].prev - m["0"].prev) + " " + t("pts") : "–";
  [[t("pn_change"), chg, t("m_prev")], [t("pn_net"), `${m["0"] ? pct(m["0"].net, 0) : "–"} → ${m["1"] ? pct(m["1"].net, 0) : "–"}`, "2015 → 2018"]].forEach(([k, v, n]) => { const bx = mk("div", "box"); bx.appendChild(mk("div", "k", k)); const vv = mk("div", "v", v); vv.style.fontSize = "18px"; bx.appendChild(vv); bx.appendChild(mk("div", "n", n)); pv2.appendChild(bx); });
  el.appendChild(pv2);
  if (m.names.length > 1 || m.names[0] !== p.vil) { el.appendChild(mk("div", "meta", t("pn_survey_names") + ": " + m.names.join(", "))); }
}
let VSORT = { k: "b", dir: -1 };
function renderVTable() {
  const el = document.getElementById("vtable"); el.replaceChildren();
  const rows = Object.entries(M).map(([id, m]) => ({ id, name: m.names.join(", "), area: t("area_" + m.area), arm: m.arm, b: m["0"] ? m["0"].prev : null, e: m["1"] ? m["1"].prev : null, n: (m["0"] ? m["0"].n : 0) + (m["1"] ? m["1"].n : 0) }));
  rows.forEach(r => r.d = (r.b != null && r.e != null) ? r.e - r.b : null);
  const key = VSORT.k; rows.sort((a, b) => { const va = a[key], vb = b[key]; if (va == null && vb == null) return 0; if (va == null) return 1; if (vb == null) return -1; return (typeof va === "string" ? va.localeCompare(vb) : va - vb) * VSORT.dir; });
  const tbl = document.createElement("table"), th = document.createElement("thead"), tr = document.createElement("tr");
  [["name", "tb_vil"], ["area", "tb_area"], ["arm", "tb_arm"], ["b", "tb_b"], ["e", "tb_e"], ["d", "tb_d"], ["n", "tb_n"]].forEach(([k, l]) => { const h = document.createElement("th"); h.textContent = t(l) + (VSORT.k === k ? (VSORT.dir < 0 ? " ↓" : " ↑") : ""); h.tabIndex = 0; h.setAttribute("aria-sort", VSORT.k === k ? (VSORT.dir < 0 ? "descending" : "ascending") : "none");
    const go = () => { VSORT = { k, dir: VSORT.k === k ? -VSORT.dir : (typeof rows[0][k] === "string" ? 1 : -1) }; renderVTable(); }; h.addEventListener("click", go); h.addEventListener("keydown", ev => { if (ev.key === "Enter") go(); }); tr.appendChild(h); });
  th.appendChild(tr); tbl.appendChild(th);
  const tb = document.createElement("tbody");
  rows.forEach(r => { const row = document.createElement("tr"); if (r.id === MAP.sel) row.className = "sel"; row.tabIndex = 0;
    const cell = (txt) => { const td = document.createElement("td"); td.textContent = txt; row.appendChild(td); return td; };
    cell(r.name); cell(r.area); cell(r.arm === 1 ? t("arm_int") : t("arm_ctl")); cell(r.b != null ? f1(r.b) : "–");
    const te = cell(r.e != null ? f1(r.e) : "–"); if (r.e != null) { const b = document.createElement("span"); b.className = "bar-cell"; b.style.width = Math.max(2, r.e * 1.4) + "px"; b.style.background = binColor0(r.e); te.appendChild(b); }
    cell(r.d != null ? sg(r.d) : "–"); cell(thou(r.n));
    const go = () => { if (MAP.view !== "survey") { MAP.view = "survey"; renderMapCtrls(); drawMap(); } selectVillage(r.id); };
    row.addEventListener("click", go); row.addEventListener("keydown", ev => { if (ev.key === "Enter") go(); }); tb.appendChild(row); });
  tbl.appendChild(tb); el.appendChild(tbl);
}
const binColor0 = v => { let i = 0; while (i < PREV_BINS.length && v >= PREV_BINS[i]) i++; return K.heat[Math.max(2, i)]; };
function renderMapCtrls() {
  seg(document.getElementById("seg-view"), [{ v: "survey", k: "v_survey" }, { v: "p1", k: "v_p1" }, { v: "p2", k: "v_p2" }], () => MAP.view, v => { MAP.view = v; if (v !== "survey") MAP.sel = null; renderMapCtrls(); drawMap(); });
  seg(document.getElementById("seg-metric"), [{ v: "prev", k: "m_prev" }, { v: "net", k: "m_net" }], () => MAP.metric, v => { MAP.metric = v; renderMapCtrls(); drawMap(); });
  seg(document.getElementById("seg-round"), [{ v: "0", k: "s_base" }, { v: "1", k: "s_end" }], () => MAP.round, v => { MAP.round = v; renderMapCtrls(); drawMap(); });
  document.getElementById("ctl-metric").hidden = MAP.view !== "survey"; document.getElementById("ctl-round").hidden = MAP.view !== "survey";
}
document.getElementById("chk-fac").addEventListener("change", e => { MAP.fac = e.target.checked; drawMap(); });
document.getElementById("zin").addEventListener("click", () => mapSvg.transition().duration(250).call(zoomB.scaleBy, 1.6));
document.getElementById("zout").addEventListener("click", () => mapSvg.transition().duration(250).call(zoomB.scaleBy, 1 / 1.6));
document.getElementById("zreset").addEventListener("click", () => mapSvg.transition().duration(300).call(zoomB.transform, d3.zoomIdentity));
new ResizeObserver(() => { const w = document.getElementById("map-stage").clientWidth; if (Math.abs(w - mapW) > 2) drawMap(); }).observe(document.getElementById("map-stage"));

/* ================= STATIC BLOCKS ================= */
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
const FIND = [
  ["cat_impact", "--int", "f1", N.or_adj, "#impact"], ["cat_trans", "--hi-area", "f2", MINUS + N.did_ch_abs, "#impact"], ["cat_child", "--care-1", "f3", N.did_514, "#who"],
  ["cat_equity", "--care-3", "f4", N.gap_int_e, "#prevention"], ["cat_prev", "--teal-4", "f5", N.uga_min + "%+", "#prevention"], ["cat_care", "--care-2", "f6", N.fev_e_int + "%", "#care"],
  ["cat_surv", "--lo-area", "f7", N.rv_h3 + "%", "#facilities"], ["cat_travel", "--ctl", "f8", N.trav_or + "×", "#care"], ["cat_co", "--care-4", "f9", N.mda_hh + "%", "#quality"], ["cat_dq", "--ink-2", "f10", N.mic_k1, "#quality"]];
function renderStatic() {
  const fg = document.getElementById("fgrid"); fg.replaceChildren();
  FIND.forEach(([cat, cc, k, v, href]) => { const a = el("a", "find"); a.href = href;
    const chip = el("span", "chip"); chip.style.setProperty("--cc", `var(${cc})`); chip.textContent = t(cat); a.appendChild(chip);
    const h = el("h3"); h.textContent = t(k + "_h"); a.appendChild(h);
    const st = el("div", "stat"); const sv = el("div", "v"); sv.textContent = v; const su = el("div", "u"); su.textContent = t(k + "_u"); st.append(sv, su); a.appendChild(st);
    const p = el("p"); p.textContent = t(k + "_p"); a.appendChild(p); const mo = el("div", "more"); mo.textContent = t("more"); a.appendChild(mo); fg.appendChild(a); });
  const tile = (box, l, v, d) => { const x = el("div", "tile"); const a = el("div", "l"); a.textContent = l; const b = el("div", "v"); b.textContent = v; const c = el("div", "d"); c.textContent = d; x.append(a, b, c); box.appendChild(x); };
  const ct = document.getElementById("care-tiles"); ct.replaceChildren();
  const shop = k => (R.where[k].drugshop || 0) + (R.where[k].shop || 0);
  tile(ct, t("t_fever"), `${pct(R.fever["1_1"].p)} · ${pct(R.fever["1_0"].p)}`, t("t_int_ctl"));
  tile(ct, t("t_seek"), `${pct(R.seek["1_1"].p, 0)} · ${pct(R.seek["1_0"].p, 0)}`, t("t_int_ctl"));
  tile(ct, t("t_shop"), `${pct(shop("1_1"), 0)} · ${pct(shop("1_0"), 0)}`, t("t_int_ctl"));
  tile(ct, t("t_travel"), `${pct(R.travel_share["1.0"])} · ${pct(R.travel_share["0.0"])}`, t("t_int_ctl"));
  const ft = document.getElementById("fac-tiles"); ft.replaceChildren();
  tile(ft, t("t_hf_tested"), thou(hfH[0] + hfL[0]), `${thou(hfH[0])} · ${thou(hfL[0])} (${t("t_hl")})`);
  tile(ft, t("t_hf_tpr"), `${pct(100 * hfH[1] / hfH[0])} · ${pct(100 * hfL[1] / hfL[0])}`, t("t_hl"));
  tile(ft, t("t_fsat_scr"), N.fsat_scr, t("t_rounds"));
  tile(ft, t("t_fsat_tpr"), `${pct(fsH.tpr)} · ${pct(fsL.tpr)}`, t("t_hl"));
  const imp = document.getElementById("imp"); imp.replaceChildren();
  ["i1", "i2", "i3", "i4", "i5", "i6"].forEach(k => { const d = el("div"); const h = el("h3"); h.textContent = t(k + "_h"); const p = el("p"); p.textContent = t(k + "_p"); d.append(h, p); imp.appendChild(d); });
  // data quality
  const dq = document.getElementById("dq"); dq.replaceChildren();
  const SEV = { high: ["sev_high", "critical", "M8 1.5 15 14H1z"], med: ["sev_med", "serious", "M8 1 15 8 8 15 1 8z"], low: ["sev_low", "warning", null], ok: ["sev_ok", "good", null] };
  [["high", "dq1"], ["high", "dq2"], ["med", "dq3"], ["med", "dq4"], ["low", "dq5"], ["low", "dq6"], ["ok", "dq7"]].forEach(([s, k]) => {
    const row = el("div", "dq-row"); const sv = SEV[s];
    const sevEl = el("div", "sev"); let icon;
    if (s === "high" || s === "med") icon = `<svg width="16" height="16" viewBox="0 0 16 16"><path d="${sv[2]}" fill="${K[sv[1]]}"/><text x="8" y="${s === "high" ? 12.2 : 11.6}" text-anchor="middle" font-size="9" font-weight="700" fill="#0b0b0b">!</text></svg>`;
    else if (s === "low") icon = `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="${K.warning}"/><rect x="7.1" y="4" width="1.8" height="5" rx=".9" fill="#0b0b0b"/><circle cx="8" cy="11.4" r="1" fill="#0b0b0b"/></svg>`;
    else icon = `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="${K.good}"/><path d="M4.6 8.2 7 10.5l4.4-4.8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    sevEl.innerHTML = icon; sevEl.appendChild(document.createTextNode(t(sv[0])));
    const mid = el("div"); const h = el("h3"); h.textContent = t(k + "_h"); const p = el("p"); p.textContent = t(k + "_p"); mid.append(h, p);
    if (k === "dq1") { const cm = el("div", "cm"); ["0", "1"].forEach(s2 => { const m = R.micro_rdt[s2]; const box = el("div"); const cap = el("div", "m"); cap.textContent = t(s2 === "0" ? "cm_b" : "cm_e") + ` · κ = ${m.kappa.toFixed(3)}`; box.appendChild(cap);
      const tb = document.createElement("table"); tb.innerHTML = `<tr><th></th><th>${t("cm_mic")} +</th><th>${t("cm_mic")} −</th></tr><tr><th>${t("cm_rdt")} +</th><td>${thou(m.tp)}</td><td>${thou(m.fp)}</td></tr><tr><th>${t("cm_rdt")} −</th><td>${thou(m.fn)}</td><td>${thou(m.tn)}</td></tr>`; box.appendChild(tb); cm.appendChild(box); }); mid.appendChild(cm); }
    const fx = el("div", "fix"); const fb = el("b"); fb.textContent = t("fix"); fx.appendChild(fb); fx.appendChild(document.createTextNode(t(k + "_f")));
    row.append(sevEl, mid, fx); dq.appendChild(row); });
  const tl = document.getElementById("tl"); tl.replaceChildren();
  ["e1", "e2", "e4", "e3"].forEach(k => { const d = el("div"); const y = el("div", "yr"); y.textContent = t(k + "_y"); const h = el("h3"); h.textContent = t(k + "_h"); const p = el("p"); p.textContent = t(k + "_p"); const c = el("div", "cite"); c.textContent = t(k + "_c"); d.append(y, h, p, c);
    if (T[k + "_here"]) { const hr = el("span", "here"); hr.textContent = t(k + "_here"); d.appendChild(hr); } tl.appendChild(d); });
  const mb = document.getElementById("methods-body"); mb.replaceChildren();
  ["m1", "m2", "m3", "m4"].forEach(k => { const d = el("div"); const h = el("h3"); h.textContent = t(k + "_h"); const ul = el("ul"); t(k + "_l").split("|").forEach(li => { const l = el("li"); l.textContent = li; ul.appendChild(l); }); d.append(h, ul); mb.appendChild(d); });
  ["m5", "m6"].forEach(k => { const d = el("div"); const h = el("h3"); h.textContent = t(k + "_h"); const p = el("p", null, t(k + "_p")); d.append(h, p); mb.appendChild(d); });
}

/* ================= LANGUAGE / THEME ================= */
function applyText() {
  document.querySelectorAll("[data-t]").forEach(e => e.textContent = t(e.getAttribute("data-t")));
  document.querySelectorAll("[data-th]").forEach(e => e.innerHTML = t(e.getAttribute("data-th")));
  document.querySelectorAll("[data-n]").forEach(e => e.textContent = N[e.getAttribute("data-n")]);
  document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === LANG ? "true" : "false"));
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  document.title = LANG === "zh" ? "1,7-mRCTR 证据门户" : "1,7-mRCTR Evidence Portal";
}
function renderAll() { readTokens(); applyText(); renderStatic(); renderSubSeg(); CARDS.forEach(c => c.render()); drawHero(); renderMapCtrls(); drawMap(); }
function setLang(l) { LANG = l; try { localStorage.setItem("portal-lang", l); } catch (e) {} renderAll(); }
document.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
let rt; const reTheme = () => { clearTimeout(rt); rt = setTimeout(renderAll, 30); };
try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", reTheme); } catch (e) {}
new MutationObserver(reTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
// nav highlight
const navA = [...document.querySelectorAll(".nav a")];
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) navA.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-40% 0px -55% 0px" });
navA.forEach(a => { const s = document.querySelector(a.getAttribute("href")); if (s) io.observe(s); });

(function init() {
  const hsh = (location.hash || "").replace("#", "");
  let l = null; if (hsh === "zh" || hsh === "en") l = hsh;
  if (!l) { try { l = localStorage.getItem("portal-lang"); } catch (e) {} }
  if (!l) l = (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
  LANG = l; renderAll();
  window.addEventListener("hashchange", () => { const x = location.hash.replace("#", ""); if (x === "zh" || x === "en") setLang(x); });
})();
})();
