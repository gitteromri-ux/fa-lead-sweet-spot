/* French Atelier · Lead Sweet Spot — built on the CEO Performance Suite shell */
(function () {
  "use strict";
  Chart.register(ChartDataLabels);
  try { const an = window["chartjs-plugin-annotation"]; if (an) Chart.register(an); } catch (e) {}
  Chart.defaults.font.family = "Inter";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = "#94A3B8";
  Chart.defaults.plugins.datalabels.display = false;
  Chart.defaults.animation = false;

  const C = { indigo: "#6366F1", cyan: "#06B6D4", amber: "#F59E0B", emerald: "#10B981", red: "#EF4444", purple: "#A855F7", pink: "#FF2D95", text: "#F1F5F9", textSec: "#94A3B8", textMuted: "#64748B", gridLine: "rgba(148,163,184,0.08)" };
  const X = window.X, R = X.rows, G = X.groups, ER = X.er;
  const $ = (s) => document.querySelector(s);
  const container = $("#dashboardContainer");
  const n0 = (v) => Math.round(v).toLocaleString("en-US");
  const n1 = (v) => (+v).toFixed(1);
  const n2 = (v) => (+v).toFixed(2);
  const usd = (v) => "$" + n0(v);
  const usdK = (v) => "$" + (v / 1000).toFixed(v >= 100000 ? 0 : 1) + "K";
  const pc = (v, d) => (+v).toFixed(d == null ? 0 : d) + "%";
  const xx = (v) => (+v).toFixed(2) + "x";
  const pv = (p) => (p < 0.001 ? "p < 0.001" : "p = " + (p < 0.01 ? p.toFixed(3) : p.toFixed(2)));
  const row = (L) => R.find((r) => r.L === L);
  const S = row(100), S23 = row(95), S29 = row(85);
  const MO = 30.4 / 7;
  const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dt = (s) => { const d = new Date(s + "T00:00:00Z"); return d.getUTCDate() + " " + MN[d.getUTCMonth()]; };
  const TAG = { v: '<span class="kpi-tag tg-v">Verified</span>', e: '<span class="kpi-tag tg-e">Estimated</span>', a: '<span class="kpi-tag tg-a">Assumed</span>' };
  const wN = G.new.ac / G.sen.ac; // value of a newcomer lead relative to a senior lead

  let charts = [];
  const destroyCharts = () => { charts.forEach((c) => { try { c.destroy(); } catch (e) {} }); charts = []; };
  const mkChart = (id, cfg) => { const el = document.getElementById(id); if (!el) return null; const c = new Chart(el.getContext("2d"), cfg); charts.push(c); return c; };
  const tip = { backgroundColor: "rgba(15,23,42,0.97)", titleColor: "#F1F5F9", bodyColor: "#CBD5E1", borderColor: "rgba(148,163,184,0.25)", borderWidth: 1, titleFont: { size: 14, weight: "600" }, bodyFont: { size: 13 }, padding: 12, cornerRadius: 8 };
  const leg = { labels: { color: C.textSec, font: { size: 13 }, boxWidth: 14, boxHeight: 14, padding: 16 } };
  const tk = (cb, col) => ({ color: col || C.textSec, font: { size: 13 }, callback: cb });
  const ax = (title, o) => Object.assign({ title: { display: !!title, text: title || "", color: C.textSec, font: { size: 13, weight: "600" } }, ticks: { color: C.textSec, font: { size: 13 } }, grid: { color: C.gridLine } }, o || {});
  const vline = (v, label, color) => ({ type: "line", xMin: v, xMax: v, borderColor: color || C.cyan, borderWidth: 2, borderDash: [6, 5], label: { display: !!label, content: label, position: "start", backgroundColor: color || C.cyan, color: "#04121a", font: { size: 12, weight: "700" }, padding: 5 } });
  const hline = (v, label, color, axis) => ({ type: "line", yMin: v, yMax: v, yScaleID: axis || "y", borderColor: color || C.amber, borderWidth: 2, borderDash: [6, 5], label: { display: !!label, content: label, position: "start", backgroundColor: color || C.amber, color: "#0b1120", font: { size: 12, weight: "700" }, padding: 5 } });
  const dl = (col, fmt, o) => Object.assign({ display: (c) => c.chart.width > 420, color: col, align: "top", font: { size: 12, weight: "700" }, formatter: fmt }, o || {});
  const base = (o) => Object.assign({ responsive: true, maintainAspectRatio: false }, o);

  // ── HTML builders (same components as the CEO Suite) ──
  const headline = (t, s) => `<div class="strategic-headline">${t}</div><div class="strategic-subtitle">${s}</div>`;
  const bottom = (label, text, sub) => `<div class="bl"><div class="bl-label">${label}</div><div class="bl-text">${text}</div>${sub ? `<div class="bl-sub">${sub}</div>` : ""}</div>`;
  function kpis(items) {
    const n = items.length, g = n <= 3 ? "cols-3" : n <= 4 ? "cols-4" : n <= 5 ? "cols-5" : "cols-6";
    return `<div class="kpi-row ${g}">${items.map((k) => `<div class="kpi-card${k.cls ? " " + k.cls : ""}"><div class="kpi-label">${k.label}</div><div class="kpi-value">${k.value}</div>${k.sub ? `<div class="kpi-sub">${k.sub}</div>` : ""}${k.tag ? TAG[k.tag] : ""}</div>`).join("")}</div>`;
  }
  const chartCard = (id, title, note, h) => `<div class="chart-card"><div class="chart-card-title">${title}</div>${note ? `<div class="chart-note">${note}</div>` : ""}<div class="chart-wrap" style="height:${h || 380}px"><canvas id="${id}"></canvas></div></div>`;
  function dataTable(title, note, headers, rows, rowCls) {
    const wrap = rows.some((r) => r.some((c) => String(c && typeof c === "object" ? c.v : c).replace(/<[^>]+>/g, "").length > 42));
    return `<div class="data-table-card"><div class="chart-card-title">${title}</div>${note ? `<div class="chart-note">${note}</div>` : ""}<div class="data-table-wrap"><table class="data-table${wrap ? " wrap" : ""}${headers.length >= 8 ? " dense" : ""}"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, ri) => `<tr${rowCls && rowCls(ri) ? ` class="${rowCls(ri)}"` : ""}>${r.map((c) => { const o = c && typeof c === "object"; return `<td${o && c.cls ? ` class="${c.cls}"` : ""}>${o ? c.v : c}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div></div>`;
  }
  const verdict = (label, text, amber) => `<div class="verdict-banner${amber ? " amber" : ""}"><div class="verdict-label">${label}</div><div class="verdict-text">${text}</div></div>`;
  const ins = (items, cls) => `<div class="ins${cls ? " " + cls : ""}">${items.map((i) => `<div class="in" style="--ac:${i.c || C.cyan}"><div class="in-h">${i.h}</div><div class="in-big">${i.big}</div><div class="in-b">${i.b}</div></div>`).join("")}</div>`;
  const sec = (t) => `<div class="sec">${t}</div>`;
  const ok = (b, t) => ({ v: (b ? "✓ " : "✗ ") + t, cls: b ? "ok" : "no" });
  const pill = (b, t) => `<span class="pill ${b === true ? "p-ok" : b === false ? "p-no" : "p-q"}">${t}</span>`;
  const view = (html) => { container.innerHTML = `<div class="dashboard-view">${html}</div>`; };
  const Ls = R.map((r) => String(r.L)), iS = Ls.indexOf("100");
  const xL = () => ax("Leads a day (7-day average)", { grid: { display: false } });

  // ===================== OVERVIEW =====================
  function rOverview() {
    const B = X.bands, b20 = X.boot["20"];
    view(
      headline("How many leads a day should French Atelier buy?", `French Atelier call center · CRM 1 Mar – 10 Nov 2026 · 21,753 leads · ${G.tot.acq} new acquisitions · ${n0(G.tot.regs)} registrations · 36 weeks · cross-checked with the data team's Employee Rank scorecard`) +
      bottom("Bottom line", `<em>100 leads a day.</em> 700 a week. 20 per rep per shift.`, `100 is the only step on the 5-lead ladder where three things meet: <b>the last extra leads still pay for themselves</b>, <b>the next ones don't</b>, and <b>the top-ranked closers still handle 60% of contacted orders</b>. That is at $20 a lead. At $23 the answer is <b>95</b>. At today's real cost of $29.70 it is <b>85</b>.`) +
      kpis([
        { label: "Whole team · per day", value: "100", sub: "7-day average, weekends included", cls: "accent-green", tag: "e" },
        { label: "Per week · per month", value: "700", sub: `<b>≈ ${n0(S.mo)}</b> leads a month`, tag: "e" },
        { label: "Per rep · per shift", value: "20", sub: "700 ÷ 35 rep-shifts (7 reps × 5 shifts). No shift log exists.", tag: "a" },
        { label: "Never in one day", value: "150+", sub: `Those days sold <b>29% less</b>: ${n1(B[5].acqs)} vs ${n1(B[3].acqs)} acquisitions a day`, cls: "accent-red", tag: "v" },
      ]) +
      kpis([
        { label: "New acquisitions / month", value: n0(S.acq), sub: `95% range <b>${n0(S.lo)}–${n0(S.hi)}</b>`, tag: "e" },
        { label: "All registrations / month", value: n0(S.reg), sub: `<b>${n0(S.acq)}</b> new + <b>${n0(S.add)}</b> add-on`, tag: "e" },
        { label: "ROI at $20 a lead", value: xx(S.roi20), sub: `${usdK(S.sov)} SOV ÷ ${usdK(S.med20)} media. <b>${xx(S.roi23)}</b> at $23`, tag: "e" },
        { label: "Top ranks' share of contacted", value: pc(S.top), sub: "Ranks 3–4 on the scorecard. Golden rule floor: 60%", tag: "e" },
      ]) +
      sec("The intersect · where sales, ROI and the golden rule meet") +
      `<div class="charts-grid cols-2">` +
      chartCard("ovA", "Sales keep rising, but each extra lead brings less", "Bars: new acquisitions a month. Line: dollars of SOV that come back for each extra $1 of leads at that step, at $20 a lead. Under the $1 line the extra leads lose money.", 400) +
      chartCard("ovB", "More leads push contacted orders away from the top closers", "Share of contacted orders handled by scorecard ranks 3–4 (top) and by rank 1 (lowest), at each lead level.", 400) +
      `</div>` +
      dataTable("Three tests at every 5-lead step · only one step passes all three", "Test 1: buying 5 more would lose money, so no paying sales are left on the table. Test 2: the last 5 added paid for themselves. Test 3: top ranks still handle 60% or more of contacted orders. All at $20 a lead. Calls per lead and contact rate are whole-week figures, weekends included.",
        ["Leads a day", "Per rep per shift", "New acquisitions / month", "Test 1 · next +5 would bring back", "Test 2 · last +5 brought back", "Test 3 · top ranks' share", "Calls per lead", "Contact rate", "ROI at $20", "Tests passed"],
        R.map((r) => [{ v: r.L, cls: "big" }, r.ps, n1(r.acq), ok(r.t1, "$" + n2(r.next20)), ok(r.t2, "$" + n2(r.back20)), ok(r.t3, pc(r.top)), n2(r.cpl), pc(r.ctr, 1), xx(r.roi20), { v: r.n + " of 3", cls: r.n === 3 ? "ok" : "mut" }]),
        (i) => (R[i].L === 100 ? "hl" : "")) +
      sec("The same answer, cut the ways you asked") +
      ins([
        { h: "By lead price", big: "$20 → 100 · $23 → 95 · $29.70 → 85", b: `The dearer the lead, the earlier the last one stops paying. Leads cost <b>$20–24 from March to September</b> and <b>$${n2(X.last30.cpl)} in the last 30 days</b>. Getting the price back to $20 is worth 15 leads a day.`, c: C.amber },
        { h: "By seniority", big: "Seniors 24 a shift. Newcomers 10.", b: `Seniors close <b>${n1(G.sen.ac)}%</b> of contacted orders. Newcomers in their first two months close <b>${n1(G.new.ac)}%</b>. A lead given to a newcomer is worth about ${pc(wN * 100)} of one given to a senior. Split shown for 5 seniors + 2 newcomers.`, c: C.indigo },
        { h: "By team strength", big: "20 leads a day per top closer", b: `5 top closers working → about <b>100</b>. 4 → about <b>80</b>. 3 → about <b>60</b>. When a top closer is out, cut leads that week or the golden rule breaks.`, c: C.emerald },
      ]) +
      verdict("How sure is this", `<b>Estimated, not measured to the single lead.</b> We re-ran the model on 4,000 reshuffles of the 36 weeks. The answer landed between <b>90 and 105 in ${b20.s90_105}%</b> of runs and between <b>80 and 110 in ${b20.s80_110}%</b>; the middle run said ${b20.med}. At 100 the last extra $1 brings back $${n2(S.back20)}, so 100 is break-even on the margin, not a cliff. The 150-a-day ceiling is counted on real days (p = 0.006).`, true)
    );
    mkChart("ovA", { data: { labels: Ls, datasets: [
      { type: "line", label: "Extra $ back per extra $1 of leads", data: R.map((r) => r.back20), borderColor: C.amber, backgroundColor: C.amber, yAxisID: "y1", tension: 0.3, pointRadius: 5, borderWidth: 3, datalabels: dl(C.amber, (v) => "$" + n2(v)) },
      { type: "bar", label: "New acquisitions a month", data: R.map((r) => r.acq), backgroundColor: R.map((r) => (r.L === 100 ? C.cyan : "rgba(99,102,241,0.5)")), borderRadius: 4, yAxisID: "y", datalabels: dl("#fff", (v) => Math.round(v), { anchor: "start", align: "end" }) },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { one: hline(1, "$1 = break-even", C.red, "y1") } } }, scales: { x: xL(), y: ax("New acquisitions a month", { beginAtZero: true, max: 200 }), y1: ax("$ back per extra $1", { position: "right", min: 0, max: 2, grid: { drawOnChartArea: false }, ticks: tk((v) => "$" + v.toFixed(1), C.amber) }) } }) });
    mkChart("ovB", { type: "line", data: { labels: Ls, datasets: [
      { label: "Top ranks (3–4) share of contacted", data: R.map((r) => r.top), borderColor: C.emerald, backgroundColor: C.emerald, tension: 0.2, pointRadius: 5, borderWidth: 3, datalabels: dl(C.emerald, (v) => Math.round(v) + "%") },
      { label: "Rank 1 (lowest) share of contacted", data: R.map((r) => r.r1), borderColor: C.pink, backgroundColor: C.pink, tension: 0.2, pointRadius: 4, borderWidth: 2, datalabels: dl(C.pink, (v) => Math.round(v) + "%") },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { g: hline(60, "Golden rule floor 60%", C.amber), s: vline(iS, "100 a day") } } }, scales: { x: xL(), y: ax("% of contacted orders", { min: 0, max: 100, ticks: tk((v) => v + "%") }) } }) });
  }

  // ===================== 1 LADDER =====================
  function rLadder() {
    const b20 = X.boot["20"], b23 = X.boot["23"], b29 = X.boot["29.7"], ks = Object.keys(b20.dist).filter((k) => +k >= 60 && +k <= 120), r105 = row(105), r120 = row(120);
    view(
      headline("At which lead does one more stop paying for itself?", "A ladder in steps of 5 leads a day, from 60 to 120. Each row: what the team sells there, and what the last 5 leads cost per extra acquisition.") +
      bottom("Bottom line", `After <em>100 a day</em>, an extra acquisition costs more than it brings in.`, `One new acquisition brings <b>${usd(X.SPA)}</b> of SOV, add-ons included. Going from 95 to 100 buys extra acquisitions at <b>${usd(S.mc20)}</b> each. Going from 100 to 105 buys them at <b class="r">${usd(r105.mc20)}</b> each. Sales still rise above 100, by about ${n1(r105.dA)} a month per step, but at a loss.`) +
      kpis([
        { label: "Sweet spot at $20 a lead", value: "100", sub: `${n0(S.acq)} new acquisitions a month`, cls: "accent-green", tag: "e" },
        { label: "Last extra acquisition costs", value: usd(S.mc20), sub: `against the ${usd(X.SPA)} of SOV it brings`, tag: "e" },
        { label: "The next one, at 105", value: usd(r105.mc20), sub: `${pc((r105.mc20 / X.SPA - 1) * 100)} more than it brings`, cls: "accent-red", tag: "e" },
        { label: "Given up vs 120 a day", value: n1(r120.acq - S.acq), sub: `acquisitions a month, for <b>${usdK(r120.med20 - S.med20)}</b> less media`, tag: "e" },
      ]) +
      `<div class="charts-grid cols-2">` +
      chartCard("ldA", "New acquisitions a month at each step", "Line: best estimate. Shaded band: 95% range from 4,000 reshuffles of the 36 weeks.", 400) +
      chartCard("ldB", "What each extra acquisition costs at that step", `Bars at $20 a lead, line at $23. Above the ${usd(X.SPA)} line, the extra acquisition costs more than its SOV.`, 400) +
      `</div>` +
      dataTable("The full ladder · every 5 leads a day", `SOV per new acquisition is ${usd(X.SPA)} over the 36 full weeks (${usd(X.groups.tot.sov / X.groups.tot.acq)} over the whole export) and does not change with volume (p = 0.76). “Extra $ back” = SOV from the acquisitions added by the last 5 leads ÷ what those leads cost.`,
        ["Leads a day", "Leads a week", "Leads a month", "New acquisitions / month", "95% range", "All registrations / month", "Added by last +5", "Cost per extra acquisition · $20", "Extra $ back per $1 · $20", "Extra $ back · $23", "Extra $ back · $29.70", "% of the 120-a-day sales"],
        R.map((r) => [{ v: r.L, cls: "big" }, n0(r.wk), n0(r.mo), n1(r.acq), `${n0(r.lo)}–${n0(r.hi)}`, n0(r.reg), "+" + n1(r.dA), { v: usd(r.mc20), cls: r.mc20 <= X.SPA ? "ok" : "no" }, { v: "$" + n2(r.back20), cls: r.back20 >= 1 ? "ok" : "no" }, { v: "$" + n2(r.back23), cls: r.back23 >= 1 ? "ok" : "no" }, { v: "$" + n2(r.back297), cls: r.back297 >= 1 ? "ok" : "no" }, pc(r.pct)]),
        (i) => (R[i].L === 100 ? "hl" : "")) +
      `<div class="charts-grid cols-2">` +
      chartCard("ldC", "How often each step came out as the answer", "4,000 reshuffles of the 36 weeks. Taller bar = that step was the sweet spot more often.", 400) +
      ins([
        { h: "At $20 a lead", big: `Middle run ${b20.med} · half the runs ${b20.q1}–${b20.q3}`, b: `${b20.s90_105}% of runs landed on 90–105 and ${b20.s80_110}% on 80–110. The single most frequent answer is <b>100</b>, in ${b20.dist["100"]}% of runs.`, c: C.cyan },
        { h: "At $23 and at $29.70", big: `${b23.med} (${b23.q1}–${b23.q3}) · ${b29.med} (${b29.q1}–${b29.q3})`, b: `Dearer leads move the answer down and make it less certain: at $29.70, ${b29.dist["55"]}% of runs said to go below the bottom of the ladder.`, c: C.amber },
      ], "c1") +
      `</div>` +
      dataTable("What the real weeks did, grouped by leads a day", "No model here, just the 36 weeks sorted into groups. Small groups jump around: the 100–109 group is 3 weeks.",
        ["Leads a day", "Weeks", "Avg leads a day", "New acquisitions / month pace", "Registrations / month pace", "Calls per lead", "Contact rate", "Acquisitions ÷ contacted", "Acquisitions per 100 leads", "SOV / month pace"],
        X.obs.map((o) => [{ v: o.band, cls: "big" }, o.n, n1(o.lpd), n1(o.acqm), n0(o.regs), n2(o.cpl), pc(o.ctr, 1), pc(o.ac, 1), n2(o.a100), usdK(o.sov)])) +
      verdict("Read it straight", `The curve is nearly flat between 95 and 105: ${n1(S23.acq)}, ${n1(S.acq)} and ${n1(r105.acq)} acquisitions a month. <b>100 is the centre of a 90–105 zone</b>, not a point the data can pin to a single lead. What is clear: under 85 leaves paying sales on the table, and over 105 buys sales at a loss.`)
    );
    mkChart("ldA", { type: "line", data: { labels: Ls, datasets: [
      { label: "Upper 95%", data: R.map((r) => r.hi), borderColor: "transparent", backgroundColor: "rgba(6,182,212,0.16)", pointRadius: 0, fill: "+1" },
      { label: "Lower 95%", data: R.map((r) => r.lo), borderColor: "transparent", pointRadius: 0, fill: false },
      { label: "New acquisitions a month", data: R.map((r) => r.acq), borderColor: C.cyan, backgroundColor: C.cyan, borderWidth: 3, pointRadius: 5, tension: 0.3, datalabels: dl("#fff", (v) => Math.round(v)) },
    ] }, options: base({ plugins: { legend: { labels: Object.assign({}, leg.labels, { filter: (i) => i.text.indexOf("95%") < 0 }) }, tooltip: tip, annotation: { annotations: { s: vline(iS, "100 a day") } } }, scales: { x: xL(), y: ax("New acquisitions a month", { min: 40, max: 115 }) } }) });
    mkChart("ldB", { data: { labels: Ls, datasets: [
      { type: "line", label: "At $23 a lead", data: R.map((r) => r.mc23), borderColor: C.amber, backgroundColor: C.amber, borderWidth: 3, pointRadius: 4, tension: 0.3 },
      { type: "bar", label: "At $20 a lead", data: R.map((r) => r.mc20), backgroundColor: R.map((r) => (r.mc20 <= X.SPA ? "rgba(16,185,129,0.7)" : "rgba(239,68,68,0.7)")), borderRadius: 4, datalabels: dl("#fff", (v) => (v >= 1000 ? "$" + (v / 1000).toFixed(1) + "K" : "$" + n0(v)), { anchor: "start", align: "end", rotation: -90, font: { size: 12, weight: "700" } }) },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { one: hline(X.SPA, usd(X.SPA) + " SOV per acquisition", C.cyan) } } }, scales: { x: xL(), y: ax("Cost per extra acquisition", { beginAtZero: true, max: 3600, ticks: tk((v) => "$" + n0(v)) }) } }) });
    mkChart("ldC", { type: "bar", data: { labels: ks, datasets: [
      { label: "$20 a lead", data: ks.map((k) => b20.dist[k]), backgroundColor: C.cyan, borderRadius: 3 },
      { label: "$23 a lead", data: ks.map((k) => b23.dist[k]), backgroundColor: C.amber, borderRadius: 3 },
      { label: "$29.70 a lead", data: ks.map((k) => b29.dist[k]), backgroundColor: C.red, borderRadius: 3 },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip }, scales: { x: ax("Sweet spot picked (leads a day)", { grid: { display: false } }), y: ax("% of 4,000 runs", { beginAtZero: true, ticks: tk((v) => v + "%") }) } }) });
  }

  // ===================== 2 CALLS =====================
  function rCalls() {
    const B = X.bands, D = X.daily, P = X.pts, cr = D.cpl_reg, kr = D.calls_reg, sw = X.sup;
    const crs = B.map((b) => b.contr * 100), xs = [30, 190];
    view(
      headline("Do more leads mean fewer calls per lead and fewer contacts?", `${D.n} open weekdays, 1 Mar – 10 Nov 2026. Calls, contacted orders and acquisitions on the same day as the leads.`) +
      bottom("Bottom line", `Yes on calls. The team makes about <em>${D.calls_mean} calls a day</em> and adds only ${n1(kr.b)} per extra lead.`, `So every extra lead takes calls from the others: calls per lead fall from <b>${n1(B[0].cpl)}</b> on days under 60 leads to <b>${n1(B[3].cpl)}</b> on 100–119 days and <b class="r">${n1(B[5].cpl)}</b> on 150+ days. The contact rate barely moves (${pc(Math.min(...crs))}–${pc(Math.max(...crs))} in every band). What breaks on 150+ days is closing: <b class="r">${pc(B[5].acq_cont * 100, 1)}</b> of contacted orders buy, against ${pc(B[3].acq_cont * 100, 1)} on 100–119 days.`) +
      kpis([
        { label: "Calls a day · average", value: n0(D.calls_mean), sub: `${n0(G.tot.calls)} calls in the whole period`, tag: "v" },
        { label: "Extra calls per extra lead", value: "+" + n1(kr.b), sub: `calls = ${n0(kr.a)} + ${n2(kr.b)} × leads · ${pv(kr.p)}`, tag: "v" },
        { label: "Calls per lead · 100–119 days", value: n1(B[3].cpl), sub: `<b>${n1(B[2].cpl)}</b> on 80–99 days · <b>${n1(B[0].cpl)}</b> under 60`, tag: "v" },
        { label: "On 150+ lead days", value: n1(B[5].cpl), sub: `calls per lead, and only <b>${n1(B[5].acqs)}</b> acquisitions a day`, cls: "accent-red", tag: "v" },
      ]) +
      `<div class="charts-grid cols-2">` +
      chartCard("clA", "Calls per lead, day by day", `Each dot is one open weekday. Calls per lead drop ${n2(-cr.b * 10)} for every 10 extra leads that day (${pv(cr.p)}).`, 400) +
      chartCard("clB", "Total calls a day barely grow with leads", `Each dot is one open weekday. The line rises ${n0(kr.b * 10)} calls per 10 extra leads. Leads explain only ${pc(kr.r2 * 100)} of the day-to-day change in calls.`, 400) +
      `</div>` +
      chartCard("clC", "New acquisitions a day and close rate, by daily lead band", "Bars: new acquisitions a day. Line: share of contacted orders that bought. Sales peak at 120–149 leads in a day and fall hard at 150+.", 380) +
      dataTable("Every daily lead band, side by side", "Open weekdays only. Leads, calls and sales on the same calendar day. These same-day figures run higher than the whole-week calls per lead on the Overview, which include weekend leads.",
        ["Leads that day", "Days", "Avg leads", "Calls a day", "Calls per lead", "Contacted a day", "Contact rate", "New acquisitions a day", "95% range", "Acquisitions ÷ contacted", "Acquisitions per 100 leads", "Registrations a day", "SOV a day"],
        B.map((b) => [{ v: b.band, cls: "big" }, b.n, n1(b.leads), n0(b.calls), n2(b.cpl), n1(b.cont), pc(b.contr * 100, 1), { v: n2(b.acqs), cls: b.band === "150+" ? "no" : "" }, `${n1(b.ci[0])}–${n1(b.ci[1])}`, { v: pc(b.acq_cont * 100, 1), cls: b.band === "150+" ? "no" : "" }, n2(b.acq100), n2(b.regs), usd(b.sov)]),
        (i) => (B[i].band === "100–119" ? "hl" : "")) +
      ins([
        { h: "Week by week it is softer", big: `Calls per lead: ${n2(row(60).cpl)} at 60 → ${n2(row(120).cpl)} at 120`, b: `Across the 36 weeks the team does add calls when leads rise: <b>+${n0(sw.calls.b)} calls a week per extra lead a day</b> (${pv(sw.calls.p)}). The weekly drop in calls per lead is small and not statistically firm (${pv(sw.cpl.p)}).`, c: C.indigo },
        { h: "Contact rate", big: `${pc(row(60).ctr, 1)} at 60 → ${pc(row(120).ctr, 1)} at 120`, b: `Contact rate slips about 0.7 points per 10 extra leads a day. The trend is not statistically firm (${pv(sw.ctr.p)}). Overall <b>${pc(X.cap.ctr, 1)}</b> of leads become contacted orders (${n0(G.tot.cont)} of 21,753).`, c: C.cyan },
        { h: "What it means", big: "Spread the leads. Don't spike them.", b: `The same 700 leads a week sell more as seven days of 100 than as one 170 day and quiet days after. The ${B[5].n} days with 150+ leads had the lowest close rate of any band (p = 0.006).`, c: C.red },
      ])
    );
    const sc = (id, key, ylab, reg, col) => mkChart(id, { data: { datasets: [
      { type: "line", label: "Trend", data: xs.map((x) => ({ x, y: reg.a + reg.b * x })), borderColor: C.amber, borderWidth: 3, pointRadius: 0 },
      { type: "scatter", label: "One open weekday", data: P.map((p) => ({ x: p.l, y: p[key] })), backgroundColor: col, pointRadius: 4 },
    ] }, options: base({ plugins: { legend: leg, tooltip: Object.assign({}, tip, { callbacks: { label: (c) => `${c.raw.x} leads · ${ylab.toLowerCase()} ${n1(c.raw.y)}` } }), annotation: { annotations: { s: vline(100, "100"), m: vline(150, "150 ceiling", C.red) } } }, scales: { x: ax("Leads that day", { type: "linear", min: 20, max: 200 }), y: ax(ylab, { beginAtZero: true }) } }) });
    sc("clA", "cpl", "Calls per lead", cr, "rgba(6,182,212,0.55)");
    sc("clB", "c", "Calls that day", kr, "rgba(129,140,248,0.65)");
    mkChart("clC", { data: { labels: B.map((b) => b.band + " leads"), datasets: [
      { type: "line", label: "Acquisitions ÷ contacted", data: B.map((b) => +(b.acq_cont * 100).toFixed(1)), borderColor: C.amber, backgroundColor: C.amber, yAxisID: "y1", borderWidth: 3, pointRadius: 5, datalabels: dl(C.amber, (v) => v + "%") },
      { type: "bar", label: "New acquisitions a day", data: B.map((b) => b.acqs), backgroundColor: B.map((b) => (b.band === "150+" ? "rgba(239,68,68,0.75)" : b.band === "100–119" ? C.cyan : "rgba(99,102,241,0.5)")), borderRadius: 4, yAxisID: "y", datalabels: dl("#fff", (v) => n2(v), { anchor: "start", align: "end", font: { size: 13, weight: "700" } }) },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip }, scales: { x: ax("", { grid: { display: false } }), y: ax("New acquisitions a day", { beginAtZero: true, max: 8 }), y1: ax("Acquisitions ÷ contacted", { position: "right", min: 0, max: 12, grid: { drawOnChartArea: false }, ticks: tk((v) => v + "%", C.amber) }) } }) });
  }

  // ===================== 3 WEEKLY =====================
  function rWeekly() {
    const W = X.weeks, best = X.obs[4], hi = X.obs[5], last = W[W.length - 1];
    view(
      headline("What did the 36 real weeks actually deliver?", "Every full week from 2 Mar to 8 Nov 2026. No model in the table: leads in, calls made, orders contacted, sales closed.") +
      bottom("Bottom line", `The best real weeks sat at <em>100–109 leads a day</em>: a pace of ${n0(best.acqm)} acquisitions a month.`, `Weeks at 110–119 fell back to a pace of <b>${n0(hi.acqm)}</b>, with the close rate down from ${pc(best.ac, 1)} to <b class="r">${pc(hi.ac, 1)}</b> of contacted orders. The 100–109 group is only ${best.n} weeks, so the model on tab 1 puts 100 a day at a more careful <b>${n0(S.acq)}</b> a month.`) +
      kpis([
        { label: "Average week", value: n1(X.avg.lpd), sub: `leads a day. Lowest week ${n1(X.avg.min)}, highest ${n1(X.avg.max)}`, tag: "v" },
        { label: "Weeks at 100–109 a day", value: n0(best.acqm), sub: `acquisitions a month pace · ${best.n} weeks`, cls: "accent-green", tag: "v" },
        { label: "Weeks at 110–119 a day", value: n0(hi.acqm), sub: `acquisitions a month pace · ${hi.n} weeks`, cls: "accent-amber", tag: "v" },
        { label: "Last 30 days", value: n1(X.last30.lpd), sub: `leads a day · ${X.last30.acq} acquisitions · ${X.last30.regs} registrations`, tag: "v" },
      ]) +
      `<div class="charts-grid cols-2">` +
      chartCard("wkA", "New acquisitions a week against leads a day", "Each dot is one week. Line: the model from tab 1.", 400) +
      chartCard("wkB", "Leads a day and acquisitions, week by week", "Bars: leads a day (cyan = 100 or more). Line: new acquisitions that week.", 400) +
      `</div>` +
      dataTable("All 36 weeks", "“Biggest day” is the largest single-day lead count in that week. Red = 150 or more.",
        ["Week", "Leads", "Leads a day", "Biggest day", "Calls", "Calls per lead", "Contacted", "Contact rate", "New acquisitions", "Acquisitions ÷ contacted", "Acquisitions per 100 leads", "Registrations", "SOV"],
        W.map((w) => [`${dt(w.s)} – ${dt(w.e)}`, n0(w.leads), { v: n1(w.lpd), cls: w.lpd >= 95 && w.lpd < 105 ? "cyan-highlight" : "" }, { v: w.mx, cls: w.mx >= 150 ? "no" : "" }, n0(w.calls), n2(w.cpl), w.cont, pc(w.ctr, 1), { v: w.acq, cls: w.acq >= 24 ? "ok" : w.acq <= 10 ? "no" : "" }, pc(w.ac, 1), n2(w.a100), w.regs, usd(w.sov)])) +
      verdict("What to watch", `The last full week (${dt(last.s)} – ${dt(last.e)}) closed <b>${last.acq} acquisitions on ${n0(last.leads)} leads</b>: ${pc(last.ac, 1)} of contacted orders, the weakest close rate of the 36 weeks, with a ${last.mx}-lead day in it. One week is not a trend, but it lines up with the rank drop on tab 5.`, true)
    );
    mkChart("wkA", { data: { datasets: [
      { type: "line", label: "Model", data: R.map((r) => ({ x: r.L, y: r.acq / MO })), borderColor: C.amber, borderWidth: 3, pointRadius: 0, tension: 0.3 },
      { type: "scatter", label: "One week", data: W.map((w) => ({ x: w.lpd, y: w.acq, s: w.s })), backgroundColor: "rgba(6,182,212,0.7)", pointRadius: 6 },
    ] }, options: base({ plugins: { legend: leg, tooltip: Object.assign({}, tip, { callbacks: { label: (c) => (c.raw.s ? `Week of ${dt(c.raw.s)} · ${c.raw.x} leads a day · ${c.raw.y} acquisitions` : `Model: ${n1(c.raw.y)} a week`) } }), annotation: { annotations: { s: vline(100, "100 a day") } } }, scales: { x: ax("Leads a day (7-day average)", { type: "linear", min: 50, max: 125 }), y: ax("New acquisitions that week", { beginAtZero: true }) } }) });
    mkChart("wkB", { data: { labels: W.map((w) => dt(w.s)), datasets: [
      { type: "line", label: "New acquisitions", data: W.map((w) => w.acq), borderColor: C.amber, backgroundColor: C.amber, yAxisID: "y1", borderWidth: 3, pointRadius: 3, tension: 0.25 },
      { type: "bar", label: "Leads a day", data: W.map((w) => w.lpd), backgroundColor: W.map((w) => (w.lpd >= 100 ? C.cyan : "rgba(99,102,241,0.5)")), borderRadius: 3, yAxisID: "y" },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { s: hline(100, "100 a day", C.cyan) } } }, scales: { x: ax("Week starting", { grid: { display: false }, ticks: { color: C.textSec, font: { size: 12 }, maxRotation: 60, autoSkip: true } }), y: ax("Leads a day", { beginAtZero: true }), y1: ax("New acquisitions", { position: "right", beginAtZero: true, grid: { drawOnChartArea: false }, ticks: tk(undefined, C.amber) }) } }) });
  }

  // ===================== 4 GOLDEN RULE =====================
  function rGolden() {
    const W = ER.wk, ft = ER.ft, cross = (ft.a - 60) / -ft.b, T = X.cap.tbl, t60 = T.find((t) => t.g === 60), t75 = T.find((t) => t.g === 75);
    view(
      headline("How many leads can the top closers carry before the golden rule breaks?", "Golden rule = the share of contacted orders handled by the team's top closers. Here: ranks 3–4 on the data team's Employee Rank scorecard, 14 full weeks, 2 Aug – 7 Nov 2026.") +
      bottom("Bottom line", `About <em>100 a day</em>. Past that, top closers handle under 60% of contacted orders.`, `Every 10 extra leads a day takes <b>${n1(-ft.b * 10)} points</b> off the top ranks' share (${pv(ft.p)}). The line crosses 60% at <b>${n0(cross)} leads a day</b>. The reason is simple: top closers handle about <b>${n0(X.cap.er)} contacted orders a week whatever the volume</b>, so everything extra lands on ranks 1–2.`) +
      kpis([
        { label: "Top ranks' share at 100 a day", value: pc(S.top), sub: `<b>${pc(row(80).top)}</b> at 80 · <b>${pc(row(120).top)}</b> at 120`, cls: "accent-green", tag: "e" },
        { label: "Top closers' weekly capacity", value: n0(X.cap.er), sub: `contacted orders a week. Does not grow with leads (${pv(ER.fn34.p)})`, tag: "v" },
        { label: "Where the extra leads go", value: "+" + n1(ER.fn12.b), sub: `contacted a week to ranks 1–2, per extra lead a day (${pv(ER.fn12.p)})`, cls: "accent-amber", tag: "v" },
        { label: "Leads a day per top closer", value: "≈ 20", sub: "to hold a 60% golden rule with 5 top closers", tag: "e" },
      ]) +
      `<div class="charts-grid cols-2">` +
      chartCard("gdA", "Top ranks' share of contacted orders against leads a day", `Each dot is one week. Trend: share = ${n1(ft.a)} − ${n2(-ft.b)} × leads a day · R² = ${n2(ft.r2)}.`, 400) +
      chartCard("gdB", "Who handled the contacted orders, week by week", "Share of contacted orders by scorecard rank. Green = top ranks 3–4. Labels: week start · leads a day.", 400) +
      `</div>` +
      dataTable("Pick your golden rule · get your maximum leads a day", `Three independent routes. CRM: the top-5 closers handle ${n0(X.cap.crm)} contacted orders a week. Scorecard: ranks 3–4 handle ${n0(X.cap.er)}. Trend: the line in the chart above. Formula: capacity ÷ golden rule ÷ ${pc(X.cap.ctr, 1)} contact rate ÷ 7 days.`,
        ["Golden rule target", "Max leads a day · CRM top-5", "Max leads a day · scorecard ranks 3–4", "Max leads a day · weekly trend", "Standard"],
        T.map((t) => [{ v: t.g + "%", cls: "big" }, t.crm, t.er, t.regr, t.g === 75 ? "Rosen standard in the CEO Suite" : t.g === 60 ? "IIBS standard in the CEO Suite · used here" : ""]),
        (i) => (T[i].g === 60 ? "hl" : "")) +
      dataTable("The 14 scorecard weeks", "Weeks start on Sunday, as in the scorecard. Shares are of contacted orders. Green = golden rule held (60% or more).",
        ["Week starting", "Leads", "Leads a day", "Contacted", "Rank 1", "Rank 2", "Rank 3", "Rank 4", "Top ranks 3–4", "Contacted by ranks 3–4", "Contacted by ranks 1–2", "New acquisitions", "Acquisitions ÷ contacted"],
        W.map((w) => [dt(w.s), n0(w.leads), n1(w.lpd), w.cont, pc(w.c[0]), pc(w.c[1]), pc(w.c[2]), pc(w.c[3]), { v: pc(w.top), cls: w.top >= 60 ? "ok" : "no" }, w.n34, w.n12, w.acq, pc(w.ac, 1)])) +
      dataTable("The same rule in the CEO Suite: top-5 closers by name", "Rep-level weeks from the French tab of the CEO Performance Suite. Taken from rep exports pulled on other dates, so leads and acquisitions can differ by a few from the CRM weeks on tab 3.",
        ["Week", "Leads", "Leads a day", "Contacted", "By top-5 closers", "Golden rule", "By newcomers", "New acquisitions"],
        X.suite.map((s) => [{ v: s.n, cls: "big" }, s.leads, n0(s.leads / 7), s.cont, s.top, { v: pc(s.top / s.cont * 100), cls: "neon-pct" }, s.new, s.acq])) +
      ins([
        { h: "The capacity formula", big: "Max leads = capacity ÷ rule ÷ contact rate ÷ 7", b: `${n0(X.cap.er)} contacted a week ÷ 60% ÷ ${pc(X.cap.ctr, 1)} ÷ 7 = <b>${t60.er} leads a day</b>. Lose one of five top closers and capacity drops a fifth: about <b>80</b>. Lose two: about <b>60</b>.`, c: C.cyan },
        { h: "What the data does not show", big: "Share alone did not predict the week's close rate", b: `In these 14 weeks the top ranks' share and the weekly acquisitions ÷ contacted were unrelated (ρ = +${n2(ER.top_ac.rho)}, ${pv(ER.top_ac.p)}). The rule rests on who converts over the whole period (tabs 5 and 6), not on week-to-week swings.`, c: C.amber },
        { h: "Two cautions", big: "60% is a chosen floor. And time is tangled in.", b: `60% is the IIBS standard; Rosen uses 75%, which would mean about ${t75.regr} leads a day. Leads also grew over these weeks while ranks were re-set: holding the calendar constant, the effect is ${n2(-ER.trend.b)} points per lead (${pv(ER.trend.p)}).`, c: C.red },
      ])
    );
    mkChart("gdA", { data: { datasets: [
      { type: "line", label: "Trend", data: [65, 120].map((x) => ({ x, y: ft.a + ft.b * x })), borderColor: C.amber, borderWidth: 3, pointRadius: 0 },
      { type: "scatter", label: "One week", data: W.map((w) => ({ x: w.lpd, y: w.top, s: w.s })), backgroundColor: "rgba(16,185,129,0.85)", pointRadius: 7 },
    ] }, options: base({ plugins: { legend: leg, tooltip: Object.assign({}, tip, { callbacks: { label: (c) => (c.raw.s ? `Week of ${dt(c.raw.s)} · ${c.raw.x} leads a day · top ranks ${c.raw.y}%` : `Trend ${n0(c.raw.y)}%`) } }), annotation: { annotations: { g: hline(60, "Golden rule floor 60%", C.red), s: vline(100, "100 a day") } } }, scales: { x: ax("Leads a day (7-day average)", { type: "linear", min: 65, max: 120 }), y: ax("Top ranks' share of contacted", { min: 30, max: 100, ticks: tk((v) => v + "%") }) } }) });
    const rc = ["rgba(255,45,149,0.8)", "rgba(245,158,11,0.8)", "rgba(16,185,129,0.55)", "rgba(16,185,129,0.95)"];
    mkChart("gdB", { type: "bar", data: { labels: W.map((w) => dt(w.s) + " · " + n0(w.lpd)), datasets: [0, 1, 2, 3].map((i) => ({ label: "Rank " + (i + 1), data: W.map((w) => w.c[i]), backgroundColor: rc[i], stack: "s" })) }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { g: hline(40, "Ranks 1–2 above this line = rule broken", C.red) } } }, scales: { x: ax("", { stacked: true, grid: { display: false }, ticks: { color: C.textSec, font: { size: 12 }, maxRotation: 60, minRotation: 45 } }), y: ax("% of contacted orders", { stacked: true, min: 0, max: 100, ticks: tk((v) => v + "%") }) } }) });
  }

  // ===================== 5 EMPLOYEE RANK =====================
  function rRank() {
    const K = ER.rank, cv = ER.conv, lt = ER.late, g = ER.grp;
    const PC = ["1.36K", "1.3K", "2.39K", "3.42K"], PS = ["$39.99K", "$72.13K", "$104.8K", "$186K"];
    const t34c = K[2].contsh + K[3].contsh, t34s = K[2].sovsh + K[3].sovsh;
    const crmAc = G.tot.acq / G.tot.cont * 100;
    view(
      headline("What does the data team's Employee Rank scorecard say about the sweet spot?", "Employee Rank · French (data team, Sisense) · ranks 1–4 set on each rep's past 60 days · filter “This & last 10 months” = 1 Jan – 10 Nov 2026. Scorecard figures are shown exactly as printed.") +
      bottom("Bottom line", `The scorecard <em>confirms the sweet spot</em> and is the reference for who counts as a top closer.`, `Ranks 3–4 handle <b>${pc(t34c, 1)}</b> of contacted orders and bring <b>${pc(t34s)}</b> of SOV. The CRM export shows the same picture for its top-5 closers. Every extra lead above 100 a day moves contacted orders from ranks 3–4 to ranks 1–2. Three totals are <b>measured on a different basis</b> in the two reports (SOV, calls, week start) and should be aligned with the data team before they are shown side by side.`) +
      kpis([
        { label: "Ranks 3–4 · share of contacted", value: pc(t34c, 1), sub: `scorecard: 28.2% + 40.4%. They bring <b>${pc(t34s)}</b> of SOV`, cls: "accent-green", tag: "v" },
        { label: "Rank 4 · calls → SOV", value: `${pc(K[3].callsh)} → ${pc(K[3].sovsh)}`, sub: `of team calls → of team SOV. Rank 1: ${pc(K[0].callsh)} → ${pc(K[0].sovsh)}`, tag: "v" },
        { label: "Close rate · ranks 2–4 vs rank 1", value: `${pc(cv["234"][0], 1)} vs ${pc(cv["1"][0], 1)}`, sub: `Reg ÷ contacted. Gap ${n1(cv.gap[0])} pts (95% range ${n1(cv.gap[1])}–${n1(cv.gap[2])})`, tag: "e" },
        { label: "Rank 4 since 18 Oct", value: `${pc(lt["4"].early, 1)} → ${pc(lt["4"].late, 1)}`, sub: `Reg ÷ contacted, last 3 weeks vs 11 before (${pv(lt["4"].p)})`, cls: "accent-amber", tag: "e" },
      ]) +
      `<div class="charts-grid cols-2">` +
      chartCard("rkA", "Each rank makes about a quarter of the calls. The results differ.", "Each rank's share of team calls, contacted orders and SOV, from the scorecard's rank table.", 400) +
      chartCard("rkB", "Reg ÷ contacted, by rank", "From the scorecard's weekly “French Reg Contacted” series. Cyan line: the CRM team average for the same measure.", 400) +
      `</div>` +
      dataTable("The scorecard, rank by rank", "Calls, contacted, contacted contribution and SOV are as printed in the scorecard (contacted and SOV are printed rounded, e.g. 1.3K). Shares of calls and SOV and the per-contacted columns are computed from those prints, so they are accurate to about ±1%, and ±4% for rank 2. We read rank 4 as the highest and rank 1 as the lowest: newcomers sit in rank 1 and the biggest sellers have almost no rows there.",
        ["Rank", "Calls", "Share of calls", "Contacted", "Contacted contribution", "Calls per contacted", "SOV", "Share of SOV", "SOV per contacted", "SOV per call", "Reg ÷ contacted", "95% range"],
        K.map((k, i) => [{ v: "Rank " + k.r, cls: "big" }, n0(k.calls), pc(k.callsh, 1), PC[i], { v: pc(k.contsh, 1), cls: "neon-pct" }, n1(k.cpc), PS[i], pc(k.sovsh, 1), usd(k.spc), "$" + n2(k.spcall), pc(cv[k.r][0], 1), `${n1(cv[k.r][1])}–${n1(cv[k.r][2])}%`]).concat([[{ v: "Grand total", cls: "big" }, "175,774", "100%", "8.47K", "100.0%", n1(175774 / 8470), "$403.0K", "100%", usd(403000 / 8470), "$" + n2(403000 / 175774), "", ""]]),
        (i) => (i === 4 ? "tot" : "")) +
      dataTable("Scorecard next to CRM export, line by line", "The scorecard is the data team's report. Where the two differ, the cause is scope or definition, listed in the last column. The scorecard covers January and February; the CRM export starts 1 March.",
        ["What", "Employee Rank scorecard", "CRM export", "Status", "Why, and what to do"],
        [
          ["Top group's share of contacted orders", `${pc(t34c, 1)} (ranks 3–4)`, `${pc(G.top.sh, 1)} (top-5 closers)`, pill(true, "Same picture"), "Two independent sources, same golden-rule reading."],
          ["Top group's share of the result", `${pc(t34s, 1)} of SOV`, `${pc(G.top.ash, 1)} of new acquisitions`, pill(true, "Same picture"), "The top group brings over 70% either way."],
          ["Weekly close rate", "“Reg ÷ contacted” by week", "Acquisitions ÷ contacted by week", pill(true, "Same · r = 0.95"), "The two series move together once week starts are aligned. The scorecard's “Reg” tracks new acquisitions."],
          ["More leads → more goes to lower ranks", `Rank 4's share ${pc(g.lo.r4)} → ${pc(g.hi.r4)} in weeks of 650+ leads`, "Newcomers took 26% of contacted in 2–8 Nov", pill(true, "Same picture"), "Extra volume lands on the lower ranks. This is the core of the sweet spot."],
          ["Contacted orders", "8.47K (Jan–Nov)", `${n0(G.tot.cont)} (Mar–Nov)`, pill(null, "Different period"), "Two extra months in the scorecard account for the gap."],
          ["SOV", "$403.0K (Jan–Nov)", `${usdK(G.tot.sov)} (Mar–Nov)`, pill(null, "Different basis"), "The two reports count SOV differently. Ask the data team which SOV definition each one uses before quoting ROI from either."],
          ["Calls", "175,774 (Jan–Nov)", `${n0(G.tot.calls)} (Mar–Nov)`, pill(null, "Different basis"), "Two extra months explain part of it. The rest is likely a different call definition (for example all dials vs. dials on leads)."],
          ["Week start", "Sunday", "Monday", pill(null, "Align first"), "Shift by one week before putting weekly numbers side by side."],
        ]) +
      `<div class="charts-grid cols-2">` +
      dataTable("Since 18 Oct, by rank", "Reg ÷ contacted in the three weeks from 18 Oct against the 11 weeks before, from the scorecard's weekly series.",
        ["Rank", "Before 18 Oct", "Since 18 Oct", "Change", "Contacted since", "Statistically firm?"],
        K.map((k) => { const l = lt[k.r]; return [{ v: "Rank " + k.r, cls: "big" }, pc(l.early, 1), { v: pc(l.late, 1), cls: l.late < l.early ? "no" : "ok" }, (l.late - l.early > 0 ? "+" : "") + n1(l.late - l.early) + " pts", l.n1, l.p < 0.05 ? pill(false, "Yes · " + pv(l.p)) : pill(null, "Not yet · " + pv(l.p))]; })) +
      dataTable("Low-lead weeks against high-lead weeks", "Share of contacted orders by rank, scorecard weeks split at 650 leads a week (about 93 a day).",
        ["Weeks", "Count", "Avg leads a week", "Rank 1", "Rank 2", "Rank 3", "Rank 4", "New acquisitions a week", "Acquisitions ÷ contacted"],
        [[{ v: "Under 650", cls: "big" }, g.lo.n, n0(g.lo.leads), pc(g.lo.r1), pc(g.lo.r2), pc(g.lo.r3), { v: pc(g.lo.r4), cls: "ok" }, n1(g.lo.acq), pc(g.lo.ac, 1)], [{ v: "650 or more", cls: "big" }, g.hi.n, n0(g.hi.leads), { v: pc(g.hi.r1), cls: "no" }, pc(g.hi.r2), pc(g.hi.r3), { v: pc(g.hi.r4), cls: "no" }, n1(g.hi.acq), pc(g.hi.ac, 1)]]) +
      `</div>` +
      ins([
        { h: "How the scorecard sets the sweet spot", big: "Above 100 a day, rank 1 takes the overflow", b: `Rank 1 needs <b>${n0(K[0].cpc)} calls per contacted order</b> against ${n0(K[3].cpc)} for rank 4, and closes ${pc(cv["1"][0], 1)} against ${pc(cv["234"][0], 1)} for ranks 2–4. At 100 leads a day rank 1 handles about ${pc(S.r1)} of contacted orders; at 120 about ${pc(row(120).r1)}.`, c: C.emerald },
        { h: "One question for the data team", big: "Which SOV should ROI use?", b: `The ladder uses the CRM export's ${usd(X.SPA)} of SOV per new acquisition, because it is tied to the same lead dates. The scorecard's SOV is on a smaller basis. If ROI should use that basis, the sweet spot moves lower. Settling the definition is the first follow-up.`, c: C.amber },
        { h: "What the rank measures", big: "Total output, not close rate alone", b: `SOV and contacted orders rise in order from rank 1 to rank 4. Close rates for ranks 2, 3 and 4 are ${pc(cv["2"][0], 1)}, ${pc(cv["3"][0], 1)} and ${pc(cv["4"][0], 1)} with overlapping ranges, so the clear line is between rank 1 and the rest.`, c: C.cyan },
      ]) +
      verdict("Limits of this cross-check", `The scorecard PDF lists rep names for rank 1 and part of rank 2 only, so ranks 3–4 are used as groups, not by name. Weekly values are read from the scorecard's charts, which print whole percentages. Counts behind “since 18 Oct” are therefore estimated. Nothing here changes a scorecard figure.`, true)
    );
    mkChart("rkA", { type: "bar", data: { labels: K.map((k) => "Rank " + k.r), datasets: [
      { label: "Share of calls", data: K.map((k) => k.callsh), backgroundColor: "rgba(148,163,184,0.55)", borderRadius: 4 },
      { label: "Share of contacted", data: K.map((k) => k.contsh), backgroundColor: C.cyan, borderRadius: 4 },
      { label: "Share of SOV", data: K.map((k) => k.sovsh), backgroundColor: C.emerald, borderRadius: 4 },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip, datalabels: dl("#fff", (v) => Math.round(v) + "%", { anchor: "end" }) }, scales: { x: ax("", { grid: { display: false }, ticks: { color: C.text, font: { size: 14, weight: "600" } } }), y: ax("% of team total", { beginAtZero: true, max: 55, ticks: tk((v) => v + "%") }) } }) });
    mkChart("rkB", { type: "bar", data: { labels: K.map((k) => "Rank " + k.r), datasets: [
      { label: "Reg ÷ contacted", data: K.map((k) => cv[k.r][0]), backgroundColor: [C.pink, C.amber, "rgba(16,185,129,0.6)", C.emerald], borderRadius: 4, datalabels: dl("#fff", (v) => n1(v) + "%", { anchor: "end", font: { size: 14, weight: "700" } }) },
    ] }, options: base({ plugins: { legend: { display: false }, tooltip: tip, annotation: { annotations: { t: hline(crmAc, "CRM team average " + n1(crmAc) + "%", C.cyan) } } }, scales: { x: ax("", { grid: { display: false }, ticks: { color: C.text, font: { size: 14, weight: "600" } } }), y: ax("Reg ÷ contacted", { beginAtZero: true, max: 14, ticks: tk((v) => v + "%") }) } }) });
  }

  // ===================== 6 REPS =====================
  function rReps() {
    const P = X.reps.filter((r) => r.g !== "Other");
    const alloc = (s, n) => { const a = 700 / (s * 5 + n * 5 * wN); return [Math.round(a), Math.round(a * wN)]; };
    const comps = [[5, 2], [6, 1], [6, 2], [6, 4], [5, 0]];
    const gc = (g) => (g.indexOf("Top") === 0 ? "ok" : g.indexOf("New") === 0 ? "no" : g.indexOf("Left") === 0 ? "mut" : "");
    const T5 = P.filter((r) => r.g.indexOf("Top") === 0).sort((a, b) => b.acq - a.acq);
    const topN = [3, 4, 5].map((k) => { const s = T5.slice(0, k), c = s.reduce((a, r) => a + r.cont, 0), q = s.reduce((a, r) => a + r.acq, 0); return [{ v: "Top " + k, cls: "big" }, s.map((r) => r.name.split(" ")[0]).join(", "), n0(c), { v: pc(c / G.tot.cont * 100, 1), cls: "neon-pct" }, q, pc(q / G.tot.acq * 100, 1), pc(q / c * 100, 1), n0(c / G.weeks)]; });
    view(
      headline("Who should get the leads?", "Every rep in the CRM export, 1 Mar – 10 Nov 2026: contacted orders handled, new acquisitions closed, calls made.") +
      bottom("Bottom line", `Give seniors <em>24 leads a shift</em> and newcomers <em>10</em>.`, `Top-5 closers turn <b>${n1(G.top.ac)}%</b> of contacted orders into acquisitions. Everyone else: <b>${n1(G.rest.ac)}%</b>. Newcomers in their first two months: <b class="r">${n1(G.new.ac)}%</b> (${G.new.acq} acquisitions from ${G.new.cont} contacted). A lead handed to a newcomer is worth about ${pc(wN * 100)} of one handed to a senior, so share the leads out in that proportion.`) +
      kpis([
        { label: "Top-5 closers · share of contacted", value: pc(G.top.sh, 1), sub: `and <b>${pc(G.top.ash, 1)}</b> of all new acquisitions`, cls: "accent-green", tag: "v" },
        { label: "Top-5 close rate", value: pc(G.top.ac, 2), sub: `acquisitions ÷ contacted. Rest of team <b>${pc(G.rest.ac, 2)}</b>`, tag: "v" },
        { label: "Newcomer close rate", value: pc(G.new.ac, 2), sub: `first two months. ${n0(G.new.calls)} calls for ${G.new.acq} acquisitions`, cls: "accent-red", tag: "v" },
        { label: "Top-5 capacity", value: n0(G.top.cw), sub: "contacted orders a week between the five", tag: "v" },
      ]) +
      chartCard("rpA", "Contacted orders handled and close rate, rep by rep", "Bars: contacted orders (green = top-5 closer, cyan = senior, pink = newcomer, grey = left the team). Dots: acquisitions ÷ contacted.", 440) +
      dataTable("The golden rule if you count the top 3, 4 or 5", "The five top closers are the ones named in the CEO Performance Suite, listed here by new acquisitions. De Montclair Camille has 68 new acquisitions (2 more than Petit) at a 6.9% close rate against Petit's 10.2%; she is counted as a senior. Share of all contacted orders in the CRM export, whole period.",
        ["Group", "Who", "Contacted", "Golden rule (share of contacted)", "New acquisitions", "Share of acquisitions", "Close rate", "Contacted a week"],
        topN, (i) => (i === 2 ? "hl" : "")) +
      dataTable("Every rep", "Sorted by contacted orders. “Left the team” = disabled in the CRM.",
        ["Rep", "Group", "Contacted", "Share of team", "Contacted a week", "New acquisitions", "Acquisitions ÷ contacted", "Registrations", "Calls", "Calls per contacted", "SOV", "SOV per contacted"],
        P.map((r) => [r.name, { v: r.g, cls: gc(r.g) }, n0(r.cont), pc(r.sh, 1), n1(r.cw), r.acq, { v: pc(r.ac, 1), cls: "neon-pct" }, r.regs, n0(r.calls), n1(r.cpc), usd(r.sov), usd(r.spc)]).concat([[{ v: "Team total", cls: "big" }, "", n0(G.tot.cont), "100%", n1(G.tot.cont / G.weeks), G.tot.acq, { v: pc(G.tot.acq / G.tot.cont * 100, 1), cls: "neon-pct" }, n0(G.tot.regs), n0(G.tot.calls), n1(G.tot.calls / G.tot.cont), usd(G.tot.sov), usd(G.tot.sov / G.tot.cont)]]),
        (i) => (i === P.length ? "tot" : "")) +
      `<div class="charts-grid cols-2">` +
      dataTable("Leads per rep per shift, by who is on the team", "100 leads a day = 700 a week, shared in proportion to close rate. Assumes 5 shifts a week per rep.",
        ["Team", "Rep-shifts a week", "Leads per senior shift", "Leads per newcomer shift", "Plain average"],
        comps.map(([s, n]) => { const a = alloc(s, n); return [{ v: `${s} seniors + ${n} new`, cls: "big" }, (s + n) * 5, { v: a[0], cls: "ok" }, n ? { v: a[1], cls: "no" } : "—", n1(700 / ((s + n) * 5))]; }),
        (i) => (i === 0 ? "hl" : "")) +
      dataTable("Team leads a day, by top closers working", "20 leads a day per top closer keeps the golden rule at 60% (tab 4).",
        ["Top closers working", "Team leads a day", "Leads a week", "New acquisitions / month"],
        [5, 4, 3].map((k) => { const L = k * 20, r = row(L); return [{ v: k, cls: "big" }, L, L * 7, n0(r.acq)]; }),
        (i) => (i === 0 ? "hl" : "")) +
      `</div>` +
      verdict("What is assumed here", `<b>The CRM has no shift or hours log.</b> “Per shift” assumes each rep works 5 shifts a week; 20 a shift is 700 leads ÷ 35 rep-shifts. Groups: the five top closers named in the CEO Performance Suite, seniors with 6+ months, newcomers in their first two months. With a shift roster these become counted numbers.`, true)
    );
    const colr = (g) => (g.indexOf("Top") === 0 ? C.emerald : g.indexOf("New") === 0 ? C.pink : g.indexOf("Senior") === 0 ? C.cyan : "rgba(148,163,184,0.45)");
    mkChart("rpA", { data: { labels: P.map((r) => r.name), datasets: [
      { type: "line", label: "Acquisitions ÷ contacted", data: P.map((r) => r.ac), borderColor: C.amber, backgroundColor: C.amber, yAxisID: "y1", pointRadius: 7, showLine: false, datalabels: dl(C.amber, (v) => n1(v) + "%") },
      { type: "bar", label: "Contacted orders", data: P.map((r) => r.cont), backgroundColor: P.map((r) => colr(r.g)), borderRadius: 4, yAxisID: "y" },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip }, scales: { x: ax("", { grid: { display: false }, ticks: { color: C.textSec, font: { size: 12 }, maxRotation: 50, minRotation: 35 } }), y: ax("Contacted orders", { beginAtZero: true }), y1: ax("Acquisitions ÷ contacted", { position: "right", min: 0, max: 14, grid: { drawOnChartArea: false }, ticks: tk((v) => v + "%", C.amber) }) } }) });
  }

  // ===================== 7 ROI =====================
  function rRoi() {
    const M = X.months, SC = X.scen, r120 = row(120), r85 = row(85), oct = M.find((m) => m.m === "2026-10");
    const mn = (m) => (m.m === "2026-11" ? "Nov 1–10" : MN[+m.m.slice(5) - 1]);
    view(
      headline("What does each lead level return at $20, $23 and $29.70?", "ROI = SOV (new sales plus the add-ons that follow them) ÷ media cost of the leads. Three lead prices: $20 and $23 as asked, and $29.70, the real cost of the last 30 days.") +
      bottom("Bottom line", `Every level is profitable in total. <em>The last $1 is what changes.</em>`, `At 100 a day and $20 a lead: <b>${usdK(S.med20)} media → ${usdK(S.sov)} SOV = ${xx(S.roi20)}</b>. Pushing to 120 adds ${n1(r120.acq - S.acq)} acquisitions a month for ${usdK(r120.med20 - S.med20)} more media: <b class="r">${usd((r120.med20 - S.med20) / (r120.acq - S.acq))} each</b>, against ${usd(X.SPA)} of SOV. Cutting to 85 saves ${usdK(S.med20 - r85.med20)} and gives up ${n1(S.acq - r85.acq)} acquisitions that were paying for themselves.`) +
      kpis([
        { label: "$20 a lead · 100 a day", value: xx(S.roi20), sub: `${usd(S.cpa20)} per acquisition · ${usdK(S.med20)} media a month`, cls: "accent-green", tag: "e" },
        { label: "$23 a lead · 95 a day", value: xx(S23.roi23), sub: `${usd(S23.cpa23)} per acquisition · ${usdK(S23.med23)} media a month`, tag: "e" },
        { label: "$29.70 a lead · 85 a day", value: xx(S29.roi297), sub: `${usd(S29.cpa297)} per acquisition · ${usdK(S29.med297)} media a month`, cls: "accent-amber", tag: "e" },
        { label: "Real cost, last 30 days", value: "$" + n2(X.last30.cpl), sub: `${usd(X.last30.cost)} ÷ ${n0(X.last30.cost_leads)} leads, 13 Oct – 10 Nov`, cls: "accent-red", tag: "v" },
      ]) +
      `<div class="charts-grid cols-2">` +
      chartCard("roA", "Overall ROI at each lead level", "SOV ÷ media, at three lead prices. Overall ROI falls gently, because every level is profitable in total.", 400) +
      chartCard("roB", "What the last extra $1 of leads brings back", "Under $1, the extra leads at that step cost more than the SOV they add. Each price crosses at a different step.", 400) +
      `</div>` +
      dataTable("ROI scenarios at every 5-lead step", `Media = leads a month × price. SOV = new acquisitions × ${usd(X.SPA)}. Highlighted cells: the sweet spot at that price.`,
        ["Leads a day", "New acquisitions / month", "SOV / month", "Media · $20", "ROI · $20", "Cost per acquisition · $20", "Media · $23", "ROI · $23", "Cost per acquisition · $23", "Media · $29.70", "ROI · $29.70", "Cost per acquisition · $29.70"],
        R.map((r) => [{ v: r.L, cls: "big" }, n1(r.acq), usdK(r.sov), usdK(r.med20), { v: xx(r.roi20), cls: r.L === 100 ? "neon-pct" : "" }, usd(r.cpa20), usdK(r.med23), { v: xx(r.roi23), cls: r.L === 95 ? "neon-pct" : "" }, usd(r.cpa23), usdK(r.med297), { v: xx(r.roi297), cls: r.L === 85 ? "neon-pct" : "" }, usd(r.cpa297)])) +
      dataTable("Four scenarios from the real weeks", "The 36 weeks grouped by weekly lead volume. “Extra acquisition costs” = extra media ÷ extra acquisitions against the scenario above it, at $20 a lead.",
        ["Scenario", "Leads a week", "Weeks", "Leads / month", "New acquisitions / month", "95% range (per week)", "SOV / month", "ROI · $20", "ROI · $23", "ROI · $29.70", "Cost per acquisition · $20", "Extra acquisition costs · $20"],
        SC.map((s) => [{ v: s.name, cls: "big" }, s.band, s.n, n0(s.ml), n1(s.ma), `${n1(s.ci[0])}–${n1(s.ci[1])}`, usdK(s.sov), xx(s.roi["20"]), xx(s.roi["23"]), xx(s.roi["29.7"]), usd(s.cpa["20"]), s.marg ? { v: usd(s.marg["20"]), cls: s.marg["20"] <= X.SPA ? "ok" : "no" } : "—"])) +
      dataTable("What actually happened, month by month", "Media cost from the mCost export. November is 1–10 only. Red = cost per lead above $24.",
        ["Month", "Leads", "Leads a day", "New acquisitions", "Registrations", "Media cost", "Cost per lead", "Cost per acquisition", "SOV", "ROI"],
        M.map((m) => [{ v: mn(m), cls: "big" }, n0(m.l), n1(m.l / m.days), m.a, m.r, usd(m.cost), { v: "$" + n2(m.cpl), cls: m.cpl > 24 ? "no" : "" }, usd(m.cpa), usd(m.sov), { v: xx(m.roi), cls: m.roi >= 1.9 ? "ok" : "" }])) +
      verdict("The two levers", `<b>Volume and price.</b> October ran ${n0(oct.l / oct.days)} leads a day at $${n2(oct.cpl)}: the right volume at the wrong price. July to September ran 82–89 a day at $21–24 and returned 1.9x–2.3x. At 100 a day, each $1 off the lead price is worth about ${usdK(S.mo)} a month. Price is the bigger lever today.`)
    );
    const ln = (lab, key, col) => ({ label: lab, data: R.map((r) => r[key]), borderColor: col, backgroundColor: col, borderWidth: 3, pointRadius: 4, tension: 0.3 });
    mkChart("roA", { type: "line", data: { labels: Ls, datasets: [ln("$20 a lead", "roi20", C.emerald), ln("$23 a lead", "roi23", C.amber), ln("$29.70 a lead", "roi297", C.red)] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { one: hline(1, "1.0x = media paid back", C.textSec) } } }, scales: { x: xL(), y: ax("ROI (SOV ÷ media)", { min: 0.8, max: 2.4, ticks: tk((v) => v.toFixed(1) + "x") }) } }) });
    mkChart("roB", { type: "line", data: { labels: Ls, datasets: [ln("$20 a lead", "back20", C.emerald), ln("$23 a lead", "back23", C.amber), ln("$29.70 a lead", "back297", C.red)] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { one: hline(1, "$1 = break-even", C.cyan) } } }, scales: { x: xL(), y: ax("$ back per extra $1", { min: 0, max: 1.8, ticks: tk((v) => "$" + v.toFixed(1)) }) } }) });
  }

  // ===================== 8 MIX =====================
  function rMix() {
    const Cs = X.courses.filter((c) => c.c !== "Grand Total" && c.regs > 0).map((c) => ({ c: c.c.trim(), acq: c.acq, add: c.regs - c.acq, regs: c.regs, sov: c.sov, contract: c.contract })).sort((a, b) => b.regs - a.regs);
    const T = X.courses.find((c) => c.c === "Grand Total"), add = T.regs - T.acq;
    const lsf = Cs.filter((c) => c.c.indexOf("Let's Speak") === 0), lsfAdd = lsf.reduce((a, c) => a + c.add, 0), lsfSov = lsf.reduce((a, c) => a + c.sov, 0);
    const capReg = Cs.filter((c) => c.c.indexOf("Cultural") === 0).reduce((a, c) => a + c.regs, 0);
    const fnd = Cs.find((c) => c.c === "French Atelier: Foundation");
    const short = (s) => s.replace("French Atelier: ", "FA ").replace("Let's Speak French", "LSF").replace("Cultural Capsule: ", "Capsule ").replace("The French Atelier", "FA").replace("LSF: ", "LSF ");
    view(
      headline("How much is new sales, and how much is add-ons?", "1 Mar – 10 Nov 2026. New acquisition = a customer's first paid course. Add-on = every further registration (registrations − acquisitions).") +
      bottom("Bottom line", `<em>${pc(T.acq / T.regs * 100)} new, ${pc(add / T.regs * 100)} add-on.</em> ${T.acq} new acquisitions and ${add} add-on registrations.`, `Each new acquisition brings <b>${n2(T.regs / T.acq)} registrations</b> and <b>${usd(T.sov / T.acq)}</b> of SOV in total (${n2(X.RPA)} and ${usd(X.SPA)} over the 36 full weeks the ladder uses). At 100 leads a day that is about <b>${n0(S.acq)} new + ${n0(S.add)} add-on = ${n0(S.reg)} registrations a month</b>. Leads drive the new sales; the add-ons follow them.`) +
      kpis([
        { label: "New acquisitions", value: n0(T.acq), sub: `${pc(T.acq / T.regs * 100)} of ${n0(T.regs)} registrations`, cls: "accent-green", tag: "v" },
        { label: "Add-on registrations", value: n0(add), sub: `${pc(add / T.regs * 100)} of registrations`, tag: "v" },
        { label: "Let's Speak French", value: n0(lsfAdd), sub: `add-ons: ${pc(lsfAdd / add * 100)} of all add-ons · ${usdK(lsfSov)} SOV`, tag: "v" },
        { label: "SOV, all registrations", value: usdK(T.sov), sub: `${usd(T.sov / T.acq)} per new acquisition`, tag: "v" },
      ]) +
      `<div class="charts-grid cols-2">` +
      chartCard("mxA", "New acquisitions and add-ons, course by course", `Foundation is the door in: ${fnd.acq} of ${T.acq} new acquisitions. Let's Speak French is almost all add-on.`, 480) +
      chartCard("mxB", "Registrations a month at each lead level", "New acquisitions plus the add-ons that follow, from the ladder on tab 1. Number on top: all registrations.", 480) +
      `</div>` +
      dataTable("By course", "From the by-course export. SOV is 80% of contract value in every row.",
        ["Course", "New acquisitions", "Add-on registrations", "All registrations", "Add-on share", "Contract value", "SOV", "SOV per registration"],
        Cs.map((c) => [c.c, c.acq, c.add, { v: c.regs, cls: "big" }, { v: pc(c.add / c.regs * 100), cls: c.add / c.regs > 0.5 ? "cyan-highlight" : "" }, usd(c.contract), usd(c.sov), usd(c.sov / c.regs)]).concat([[{ v: "Total", cls: "big" }, T.acq, add, { v: n0(T.regs), cls: "big" }, pc(add / T.regs * 100), usd(T.contract), usd(T.sov), usd(T.sov / T.regs)]]),
        (i) => (i === Cs.length ? "tot" : "")) +
      verdict("One gap to know about", `<b>The CRM's “Upsells” field is empty in every row.</b> Add-ons here are counted as registrations minus new acquisitions, the only way the exports allow. Cultural Capsules show ${capReg} registrations so far. With a true upsell flag from the data team this split can be confirmed in minutes.`, true)
    );
    mkChart("mxA", { type: "bar", data: { labels: Cs.map((c) => short(c.c)), datasets: [
      { label: "New acquisitions", data: Cs.map((c) => c.acq), backgroundColor: C.emerald, stack: "s", borderRadius: 3 },
      { label: "Add-on registrations", data: Cs.map((c) => c.add), backgroundColor: C.indigo, stack: "s", borderRadius: 3 },
    ] }, options: base({ indexAxis: "y", plugins: { legend: leg, tooltip: tip }, scales: { x: ax("Registrations", { stacked: true, beginAtZero: true }), y: ax("", { stacked: true, grid: { display: false }, ticks: { color: C.text, font: { size: 13 } } }) } }) });
    mkChart("mxB", { type: "bar", data: { labels: Ls, datasets: [
      { label: "New acquisitions", data: R.map((r) => r.acq), backgroundColor: C.emerald, stack: "s" },
      { label: "Add-on registrations", data: R.map((r) => r.add), backgroundColor: C.indigo, stack: "s", borderRadius: 3, datalabels: dl("#fff", (v, c) => Math.round(R[c.dataIndex].reg), { anchor: "end" }) },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { s: vline(iS, "100 a day") } } }, scales: { x: Object.assign(xL(), { stacked: true }), y: ax("Registrations a month", { stacked: true, beginAtZero: true, max: 190 }) } }) });
  }

  // ===================== METHOD =====================
  function rMethod() {
    const T = X.cap.tbl.find((t) => t.g === 60);
    view(
      headline("Where does every number come from?", "Sources, method, what is verified, what is estimated, what is assumed, and what is still missing.") +
      bottom("In one line", `36 weeks of real CRM data, one curve, 4,000 stress tests, and the data team's scorecard as the second source.`, `No benchmark or outside figure is used. Every number comes from the files you sent, and every number carries one of three labels.`) +
      ins([
        { h: "Verified", big: "Counted straight from the files", b: "Totals, daily bands, rep table, scorecard table, monthly costs, the 150+ day result. Anyone with the same export gets the same number.", c: C.emerald },
        { h: "Estimated", big: "Comes out of a statistical model", b: "The ladder, the sweet spot, the golden-rule trend, ROI by step. Each has a 95% range or a p-value next to it.", c: C.amber },
        { h: "Assumed", big: "A choice, stated openly", b: "Lead prices of $20 and $23. 5 shifts a week per rep. The 60% golden-rule floor. Rank 4 = highest. Change the assumption and the tables show the new answer.", c: C.red },
      ]) +
      dataTable("Sources", "",
        ["File", "What it holds", "Period", "Used for"],
        [
          ["By-Day pivot (CRM)", "Leads, calls, contacted, acquisitions, registrations, SOV per day", "1 Mar – 10 Nov 2026", "Ladder, calls per lead, weekly proof"],
          ["by-Rep pivot (CRM)", "Contacted, acquisitions, registrations, calls, SOV per rep", "1 Mar – 10 Nov 2026", "Reps & seniority, golden-rule capacity"],
          ["by-Course pivot (CRM)", "Acquisitions, registrations, contract value, SOV per course", "1 Mar – 10 Nov 2026", "New vs add-on"],
          ["mCost · last 13 months and last 30 days", "Media cost and leads by month and by day", "to 10 Nov 2026", "Real cost per lead, monthly ROI"],
          ["Employee Rank · French (data team, Sisense PDF)", "Calls, contacted, SOV by rank 1–4; weekly shares and Reg ÷ contacted by rank", "1 Jan – 10 Nov 2026", "Golden rule, definition of top closers, cross-check"],
          ["CEO Performance Suite · French tab", "Rep-level weeks: contacted by top-5 closers", "4 weeks, Aug – Nov 2026", "Second check on the golden rule"],
        ]) +
      dataTable("Method, step by step", "",
        ["Step", "What we did", "Why"],
        [
          [{ v: "1 · Weekly curve", cls: "big" }, "Fitted new acquisitions a week against leads a day over 36 weeks with Poisson regressions: one “flattens out at K” model for every K from 60 to 120, plus a smooth diminishing-returns model. Averaged them by how well each fits (AIC weights).", "No single curve shape is forced on the data. The data decides where it bends."],
          [{ v: "2 · Ladder", cls: "big" }, "Read the curve at every 5 leads a day from 60 to 120. For each step: extra acquisitions from the last 5 leads, and their media cost at $20, $23 and $29.70.", "A sweet spot in steps of 5, not a wide band."],
          [{ v: "3 · Decision rule", cls: "big" }, "The sweet spot is the highest step where the last 5 leads still bring back at least $1 of SOV per $1 of media, and the top ranks still handle 60% of contacted orders.", "The most sales without buying any at a loss."],
          [{ v: "4 · Stress test", cls: "big" }, "Re-drew the 36 weeks 4,000 times with replacement and re-ran steps 1–3 each time.", "Shows how far the answer moves with different weeks: 90–105 in half the runs."],
          [{ v: "5 · Daily check", cls: "big" }, "182 open weekdays grouped by same-day leads; calls, contact rate and close rate per band; linear trends with p-values.", "Finds the daily ceiling the weekly view cannot see."],
          [{ v: "6 · Golden rule", cls: "big" }, "Regressed the top ranks' weekly share of contacted orders on leads a day (14 scorecard weeks), then repeated with capacity from the CRM rep table.", `Three routes to one number: ${T.crm}, ${T.er} and ${T.regr} leads a day at 60%.`],
          [{ v: "7 · Cross-check", cls: "big" }, "Put the scorecard next to the CRM export line by line. Weekly close rates correlate at r = 0.95 after aligning week starts.", "Two independent sources agree on who sells. Three totals are on a different basis and are flagged."],
        ]) +
      dataTable("What is still missing", "Each gap, and what would close it.",
        ["Gap", "Effect today", "What would close it"],
        [
          ["No shift or hours log", "“Per rep per shift” is an assumption (5 shifts a week)", "A weekly roster by rep"],
          ["No rep-by-day export", "The golden rule by day and by rep cannot be computed; weekly rank shares are used", "CRM rep pivot split by day or week"],
          ["No last-30-day rep export", "“Top reps in the past 30 days” uses the scorecard's 60-day ranks", "By-Rep pivot filtered to the last 30 days"],
          ["“Upsells” field empty", "Add-ons counted as registrations − acquisitions", "A true upsell flag from the data team"],
          ["Scorecard PDF shows rep rows for rank 1 and part of rank 2", "Ranks 3–4 used as groups, not by name", "Full export of the rep table"],
          ["SOV and calls are on a different basis in the scorecard and the CRM export", "ROI uses CRM SOV; on the scorecard's basis the sweet spot would be lower", "The data team's definition of SOV and calls in each report"],
        ]) +
      verdict("Honest limits", `36 weeks is a small sample for a curve, which is why the answer is a 90–105 zone with 100 at its centre and not a single lead. The weeks were not an experiment: lead volume, lead price, team make-up and season all moved together. The clean test is to hold 100 a day for four weeks, then 110 for four, with the same team, and compare.`, true)
    );
  }

  // ── Router ──
  const VIEWS = { overview: rOverview, ladder: rLadder, calls: rCalls, weekly: rWeekly, golden: rGolden, rank: rRank, reps: rReps, roi: rRoi, mix: rMix, method: rMethod };
  const navItems = document.querySelectorAll(".nav-item");
  const sidebar = $("#sidebar"), overlay = $("#sidebarOverlay"), menuToggle = $("#menuToggle");
  const closeMobile = () => { sidebar.classList.remove("open"); overlay.classList.remove("active"); };
  function render(db) {
    if (!VIEWS[db]) db = "overview";
    destroyCharts();
    navItems.forEach((b) => b.classList.toggle("active", b.dataset.db === db));
    VIEWS[db]();
    window.scrollTo(0, 0);
  }
  navItems.forEach((btn) => btn.addEventListener("click", () => { const db = btn.dataset.db; closeMobile(); if (location.hash !== "#" + db) location.hash = db; else render(db); }));
  if (menuToggle) menuToggle.addEventListener("click", () => { sidebar.classList.toggle("open"); overlay.classList.toggle("active"); });
  if (overlay) overlay.addEventListener("click", closeMobile);
  window.addEventListener("hashchange", () => render(location.hash.slice(1)));
  render(location.hash.slice(1) || "overview");
})();
