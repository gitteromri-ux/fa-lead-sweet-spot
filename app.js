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
  const todayNote = () => verdict("For today's team", `This tab shows the <b>ceiling</b>: a full-strength team with leads at $20, which lands on <b>100 a day</b>. Today's team is <b>${PT0().n} reps</b> with Sara Mokla leaving, and leads cost about $30: the number is <b>${PT0().L5} a day</b> (${PTS().L5} while she is still in). The rep-by-rep split is on <b>Team Today</b>, the tier rule on <b>Tier Rule</b>, and both ROIs on <b>Two ROIs</b>.`, true);
  const ok = (b, t) => ({ v: (b ? "✓ " : "✗ ") + t, cls: b ? "ok" : "no" });
  const pill = (b, t) => `<span class="pill ${b === true ? "p-ok" : b === false ? "p-no" : "p-q"}">${t}</span>`;
  const view = (html) => { container.innerHTML = `<div class="dashboard-view">${html}</div>`; };
  const Ls = R.map((r) => String(r.L)), iS = Ls.indexOf("100");
  const xL = () => ax("Leads a day (7-day average)", { grid: { display: false } });

  // ===================== OVERVIEW =====================
  function rOverview() {
    const B = X.bands, b20 = X.boot["20"];
    const PT = PT0(), PS = PTS(), P23 = plan(today(), "23"), P20 = plan(today(), "20");
    const RB = {}; RO.B.forEach((b) => { RB[b.k] = b; });
    const L6 = RB.l6, P6 = RB.p6, r75 = RO.lad.find((r) => r.L === PT.L5) || RO.lad.find((r) => r.L === 75), r85 = RO.lad.find((r) => r.L === 85);
    const t1 = PT.reps.filter((r) => r.on && r.rank === 4), r3 = PT.reps.filter((r) => r.on && r.rank === 3), nwr = PT.reps.filter((r) => r.on && r.nw);
    const c100 = comp(4, 4, 0, 3);
    view(
      headline("How many leads a day should French Atelier buy?", `French Atelier call center · CRM 1 Mar – 10 Nov 2026 · 21,753 leads · ${G.tot.acq} new acquisitions · ${n0(G.tot.regs)} registrations · 36 weeks · set by team make-up on the data team's Employee Rank scorecard, and tested on two ROIs`) +
      bottom("Bottom line", `<em>${PT.L5} leads a day once Sara Mokla leaves.</em> ${PS.L5} while she is still on the phones.`, `Today's team is <b>${PT.n} reps</b>: ${PT.n4} in Tier 1 (${t1.map((r) => r.short).join(", ")}), ${PT.n3} in Rank 3, ${PT.nNew} newcomers. They carry <b>${n0(PT.cont)} contacted orders a week</b>, which takes <b>${PT.L5} leads a day</b>. At that level Tier 1 handles <b>${n0(PT.s4)} of every 100</b> contacted orders (rule: 35) and Ranks 3–4 handle <b>${n0(PT.s34)}</b> (rule: 70). The last six weeks ran at <b>${n0(L6.lpd)} a day</b>: Tier 1 fell to <b class="r">${n0(T3.last.r4)} of 100</b> and the leads returned <b class="r">${xx(L6.roiN)} on new business</b> (${xx(L6.roiT)} with database sales). 100 a day is right only with four Tier 1 reps, four in Rank 3 and leads at $20.`) +
      kpis([
        { label: `Today's ${PT.n} reps · per day`, value: String(PT.L5), sub: `<b>${n0(PT.L5 * 7)}</b> a week · ≈ ${n0(PT.L5 * 30.4)} a month. 7-day average. Sara Mokla not counted`, cls: "accent-green", tag: "e" },
        { label: `While Sara is in · ${PS.n} reps`, value: String(PS.L5), sub: `she carries <b>${n1(TEAM.find((t) => t.leaving).load)}</b> contacted orders a week and closes <b>${pc(TEAM.find((t) => t.leaving).rate, 1)}</b>, the best on the team`, tag: "e" },
        { label: `Tier 1 of every 100 contacted · at ${PT.L5} a day`, value: n0(PT.s4), sub: `rule: at least <b>35</b>. Ranks 3–4: <b>${n0(PT.s34)}</b> (rule 70). Last six weeks: <b>${n0(T3.last.r4)}</b> and <b>${n0(T3.last.top)}</b>`, tag: "a" },
        { label: "Never in one day", value: "150+", sub: `Those days sold <b>29% less</b>: ${n1(B[5].acqs)} vs ${n1(B[3].acqs)} acquisitions a day`, cls: "accent-red", tag: "v" },
      ]) +
      kpis([
        { label: "ROI · new business · last 6 weeks", value: xx(L6.roiN), sub: `new registrations ÷ media. Six weeks before <b>${xx(P6.roiN)}</b>. Under 1.00x the leads did not pay back on first sales`, cls: "accent-red", tag: "e" },
        { label: "ROI · all registrations · last 6 weeks", value: xx(L6.roiT), sub: `new plus database registrations ÷ media. Six weeks before <b>${xx(P6.roiT)}</b>`, cls: "accent-amber", tag: "e" },
        { label: `New acquisitions a month at ${PT.L5}`, value: n0(PT.acq), sub: `each rep at their own close rate. With Sara at ${PS.L5}: <b>${n0(PS.acq)}</b>. The 36-week curve gives ${n0(row(PT.L5).acq)} at ${PT.L5} for the period's average team`, tag: "e" },
        { label: "Lead price that pays on new business", value: "$" + n0(r75.beN), sub: `today <b>$${n2(X.last30.cpl)}</b>. At ${PT.L5} a day: ROI new <b>${xx(PT.roiN)}</b> at $29.70 · <b>${xx(P23.roiN)}</b> at $23 · <b>${xx(P20.roiN)}</b> at $20`, cls: "accent-green", tag: "e" },
      ]) +
      sec("The answer, cut the ways you asked") +
      ins([
        { h: "By rep, per shift", big: t1.map((r) => `${r.short} ${n0(r.shift)}`).join(" · ") + " leads a shift", b: `Rank 3: ${r3.map((r) => `${r.short} <b>${n0(r.shift)}</b>`).join(" · ")}. Newcomers <b>${n0(nwr[0].shift)}</b> each. Every rep gets the leads that make the contacted orders they normally carry; 5 shifts a week assumed, editable on the Team Today tab.`, c: C.indigo },
        { h: "By who is in", big: `Today ${PT.L5} · Levy out ${plan(without(["Levy"]), "29.7").L5} · Azizi out ${plan(without(["Azizi"]), "29.7").L5}`, b: `With only two Tier 1 reps left, losing one for a week breaks the 35-of-100 rule unless leads are cut that week. Levite also out: <b>${plan(without(["Levite"]), "29.7").L5}</b>. No newcomers: <b>${plan(TEAM.map((t) => !t.leaving && !t.nw), "29.7").L5}</b>.`, c: C.emerald },
        { h: "By team make-up", big: `4 Tier 1 + 4 Rank 3 → ${c100.L5} a day`, b: `On average reps per rank (scorecard calls per contacted order): 2 Tier 1 + 3 Rank 3 → <b>${comp(2, 3, 0, 3).L5}</b> · 3 + 3 → <b>${comp(3, 3, 0, 3).L5}</b> · 3 + 4 → <b>${comp(3, 4, 0, 3).L5}</b> · 4 + 3 → <b>${comp(4, 3, 0, 3).L5}</b>. Today's named reps reach ${PT.L5} because Levy and Azizi carry more than an average Tier 1 rep. One Tier 1 rep anchors about <b>${n0(D3.rk[3].anchor35)} leads a day</b> under the 35 rule. Full grid on the Team Today tab.`, c: C.cyan },
      ]) +
      sec("The intersect · where sales, ROI and the golden rule meet") +
      `<div class="charts-grid cols-2">` +
      chartCard("ovA", "Sales keep rising, but each extra lead brings less", "Bars: new acquisitions a month. Line: dollars of SOV that come back for each extra $1 of leads at that step, at $20 a lead. Under the $1 line the extra leads lose money.", 400) +
      chartCard("ovB", "More leads push contacted orders away from the top closers", "Share of contacted orders handled by scorecard ranks 3–4 (top) and by rank 1 (lowest), at each lead level.", 400) +
      `</div>` +
      dataTable("Three tests at every 5-lead step, at $20 a lead · the ceiling", "This table is the ceiling: a full-strength team and leads at $20. At $29.70 the same money tests pass at 85; today's reps carry 75 (85 with Sara Mokla). Rows 75, 85 and 100 are highlighted. Test 1: buying 5 more would lose money, so no paying sales are left on the table. Test 2: the last 5 added paid for themselves. Test 3: top ranks still handle 60% or more of contacted orders. All at $20 a lead. Calls per lead and contact rate are whole-week figures, weekends included.",
        ["Leads a day", `Average per rep-shift · ${PT.n} reps`, "New acquisitions / month", "Test 1 · next +5 would bring back", "Test 2 · last +5 brought back", "Test 3 · top ranks' share", "Calls per lead", "Contact rate", "ROI at $20", "Tests passed"],
        R.map((r) => [{ v: r.L, cls: "big" }, n1(r.L * 7 / (PT.n * 5)), n1(r.acq), ok(r.t1, "$" + n2(r.next20)), ok(r.t2, "$" + n2(r.back20)), ok(r.t3, pc(r.top)), n2(r.cpl), pc(r.ctr, 1), xx(r.roi20), { v: r.n + " of 3", cls: r.n === 3 ? "ok" : "mut" }]),
        (i) => (R[i].L === 100 || R[i].L === 85 || R[i].L === 75 ? "hl" : "")) +
      ins([
        { h: "By lead price · all registrations", big: "$20 → 100 · $23 → 95 · $29.70 → 85", b: `The dearer the lead, the earlier the last one stops paying. Leads cost <b>$20–24 from March to September</b> and <b>$${n2(X.last30.cpl)} in the last 30 days</b>. This is the ceiling for a full team, counting database sales.`, c: C.amber },
        { h: "By lead price · new business only", big: `$20 → ${RO.sw["20"].N} · $23 and up → no step pays`, b: `Counting first sales only, the last 5 leads pay for themselves up to <b>${RO.sw["20"].N} a day at $20</b>. At $23 the best step brings back $0.94 per $1; at $29.70, $0.73. Break-even lead price at 85 a day: <b>$${n1(r85.beN)}</b>. Two ROIs tab.`, c: C.pink },
        { h: "By tier rule", big: `Tier 1 under 35 above ${n0(T3.cross.r4_35)} a day`, b: `With the team as it was, Ranks 3–4 dropped under 70 of 100 at about <b>${n0(T3.cross.top_70)}</b> leads a day and Tier 1 under 35 at about <b>${n0(T3.cross.r4_35)}</b>. Weeks that kept the 70 line: ROI on new business <b>${xx(T3.t70.hi.roiN)}</b>; weeks that broke it: <b>${xx(T3.t70.lo.roiN)}</b>. Tier Rule tab.`, c: C.emerald },
      ]) +
      verdict("How sure is this", `<b>Estimated, not measured to the single lead.</b> Today's ${PT.L5} is arithmetic on counted loads: contacted orders a week per rep (verified) ÷ contact rate, with each rep's rank read from the scorecard (assumed, editable). For the 100 ceiling we re-ran the model on 4,000 reshuffles of the 36 weeks. The answer landed between <b>90 and 105 in ${b20.s90_105}%</b> of runs and between <b>80 and 110 in ${b20.s80_110}%</b>; the middle run said ${b20.med}. At 100 the last extra $1 brings back $${n2(S.back20)}, so 100 is break-even on the margin, not a cliff. The 150-a-day ceiling is counted on real days (p = 0.006).`, true)
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
      bottom("Bottom line", `After <em>100 a day</em>, an extra acquisition costs more than it brings in.`, `One new acquisition brings <b>${usd(X.SPA)}</b> of SOV, follow-on registrations included. Going from 95 to 100 buys extra acquisitions at <b>${usd(S.mc20)}</b> each. Going from 100 to 105 buys them at <b class="r">${usd(r105.mc20)}</b> each. Sales still rise above 100, by about ${n1(r105.dA)} a month per step, but at a loss.`) +
      todayNote() +
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
      todayNote() +
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
      todayNote() +
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
      todayNote() +
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
      bottom("Bottom line", `Leads go to the <em>top closers first</em>, newcomers last.`, `Top-5 closers turn <b>${n1(G.top.ac)}%</b> of contacted orders into acquisitions. Everyone else: <b>${n1(G.rest.ac)}%</b>. Newcomers in their first two months: <b class="r">${n1(G.new.ac)}%</b> (${G.new.acq} acquisitions from ${G.new.cont} contacted). A lead handed to a newcomer is worth about ${pc(wN * 100)} of one handed to a senior, so share the leads out in that proportion.`) +
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
      verdict("Where the lead numbers are", `<b>Each rep's leads per shift, for whoever is working today, are on the Team Today tab.</b> Groups here: the five top closers named in the CEO Performance Suite, seniors with 6+ months, newcomers in their first two months. The CRM has no shift or hours log, so “per shift” assumes 5 shifts a week.`, true)
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
      headline("What does each lead level return at $20, $23 and $29.70?", "ROI on this tab = SOV of all registrations (new plus database) ÷ media cost of the leads. The stricter test, new business only, is on the Two ROIs tab. Three lead prices: $20 and $23 as asked, and $29.70, the real cost of the last 30 days.") +
      bottom("Bottom line", `Every level is profitable in total. <em>The last $1 is what changes.</em>`, `At 100 a day and $20 a lead: <b>${usdK(S.med20)} media → ${usdK(S.sov)} SOV = ${xx(S.roi20)}</b>. Pushing to 120 adds ${n1(r120.acq - S.acq)} acquisitions a month for ${usdK(r120.med20 - S.med20)} more media: <b class="r">${usd((r120.med20 - S.med20) / (r120.acq - S.acq))} each</b>, against ${usd(X.SPA)} of SOV. Cutting to 85 saves ${usdK(S.med20 - r85.med20)} and gives up ${n1(S.acq - r85.acq)} acquisitions that were paying for themselves.`) +
      todayNote() +
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
      headline("How much is a first sale, and how much comes after it?", "1 Mar – 10 Nov 2026. New acquisition = a customer's first paid course. Follow-on = every further registration (registrations − acquisitions): second courses sold to new customers, plus sales to the existing database. The course export does not separate those two; the Two ROIs tab does.") +
      bottom("Bottom line", `<em>${pc(T.acq / T.regs * 100)} first sales, ${pc(add / T.regs * 100)} follow-on.</em> About ${pc(RO.tot.dbs)} of all registrations are database sales.`, `Each new acquisition brings <b>${n2(T.regs / T.acq)} registrations</b> and <b>${usd(T.sov / T.acq)}</b> of SOV in total (${n2(X.RPA)} and ${usd(X.SPA)} over the 36 full weeks the ladder uses). At 100 leads a day that is about <b>${n0(S.acq)} new + ${n0(S.add)} add-on = ${n0(S.reg)} registrations a month</b>. Of the ${n0(T.regs)} registrations, about <b>${n0(RO.tot.new)} are new registrations</b> (first courses plus second courses bought by new customers) and about <b>${n0(RO.tot.db)} are database registrations</b> (estimated from Gal's five split weeks, where 40% were database).`) +
      kpis([
        { label: "New acquisitions", value: n0(T.acq), sub: `${pc(T.acq / T.regs * 100)} of ${n0(T.regs)} registrations`, cls: "accent-green", tag: "v" },
        { label: "Follow-on registrations", value: n0(add), sub: `${pc(add / T.regs * 100)} of registrations`, tag: "v" },
        { label: "Let's Speak French", value: n0(lsfAdd), sub: `follow-ons: ${pc(lsfAdd / add * 100)} of all follow-ons · ${usdK(lsfSov)} SOV`, tag: "v" },
        { label: "SOV, all registrations", value: usdK(T.sov), sub: `${usd(T.sov / T.acq)} per new acquisition`, tag: "v" },
      ]) +
      `<div class="charts-grid cols-2">` +
      chartCard("mxA", "First sales and follow-ons, course by course", `Foundation is the door in: ${fnd.acq} of ${T.acq} new acquisitions. Let's Speak French is almost all follow-on.`, 480) +
      chartCard("mxB", "Registrations a month at each lead level", "New acquisitions plus the follow-on registrations, from the ladder on tab 1. Number on top: all registrations.", 480) +
      `</div>` +
      dataTable("By course", "From the by-course export. SOV is 80% of contract value in every row.",
        ["Course", "New acquisitions", "Follow-on registrations", "All registrations", "Follow-on share", "Contract value", "SOV", "SOV per registration"],
        Cs.map((c) => [c.c, c.acq, c.add, { v: c.regs, cls: "big" }, { v: pc(c.add / c.regs * 100), cls: c.add / c.regs > 0.5 ? "cyan-highlight" : "" }, usd(c.contract), usd(c.sov), usd(c.sov / c.regs)]).concat([[{ v: "Total", cls: "big" }, T.acq, add, { v: n0(T.regs), cls: "big" }, pc(add / T.regs * 100), usd(T.contract), usd(T.sov), usd(T.sov / T.regs)]]),
        (i) => (i === Cs.length ? "tot" : "")) +
      verdict("One gap to know about", `<b>The CRM's “Upsells” field is empty in every row.</b> Follow-ons here are counted as registrations minus new acquisitions, the only way the course export allows. Gal's weekly workbook counts Reg New and Reg DB separately for five weeks: 107 new, 72 database, 96 acquisitions. Cultural Capsules show ${capReg} registrations so far. With a true upsell flag from the data team this split can be confirmed in minutes.`, true)
    );
    mkChart("mxA", { type: "bar", data: { labels: Cs.map((c) => short(c.c)), datasets: [
      { label: "New acquisitions", data: Cs.map((c) => c.acq), backgroundColor: C.emerald, stack: "s", borderRadius: 3 },
      { label: "Follow-on registrations", data: Cs.map((c) => c.add), backgroundColor: C.indigo, stack: "s", borderRadius: 3 },
    ] }, options: base({ indexAxis: "y", plugins: { legend: leg, tooltip: tip }, scales: { x: ax("Registrations", { stacked: true, beginAtZero: true }), y: ax("", { stacked: true, grid: { display: false }, ticks: { color: C.text, font: { size: 13 } } }) } }) });
    mkChart("mxB", { type: "bar", data: { labels: Ls, datasets: [
      { label: "New acquisitions", data: R.map((r) => r.acq), backgroundColor: C.emerald, stack: "s" },
      { label: "Follow-on registrations", data: R.map((r) => r.add), backgroundColor: C.indigo, stack: "s", borderRadius: 3, datalabels: dl("#fff", (v, c) => Math.round(R[c.dataIndex].reg), { anchor: "end" }) },
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
        { h: "Assumed", big: "A choice, stated openly", b: "Lead prices of $20 and $23. 5 shifts a week per rep. Rank 4 = Tier 1 = highest. Each rep's rank. The tier rules: 35 of 100 from Tier 1, 70 from Ranks 3–4. Change the assumption on the Team Today tab and the answer recalculates.", c: C.red },
      ]) +
      dataTable("Sources", "",
        ["File", "What it holds", "Period", "Used for"],
        [
          ["By-Day pivot (CRM)", "Leads, calls, contacted, acquisitions, registrations, SOV per day", "1 Mar – 10 Nov 2026", "Ladder, calls per lead, weekly proof"],
          ["by-Rep pivot (CRM)", "Contacted, acquisitions, registrations, calls, retries, % cash, SOV per rep", "1 Mar – 10 Nov 2026", "Rep by Rep, Team Today, capacity per rep"],
          ["Gal's weekly workbook · Funnel breakdown", "Spend, leads, Reg New, Acq, Reg DB, revenue, mROI and mROI (New) by week", "5 weeks, 7 Sep – 11 Oct 2026", "Two ROIs: the new/database split"],
          ["by-Course pivot (CRM)", "Acquisitions, registrations, contract value, SOV per course", "1 Mar – 10 Nov 2026", "First vs follow-on"],
          ["mCost · last 13 months and last 30 days", "Media cost and leads by month and by day", "to 10 Nov 2026", "Real cost per lead, monthly ROI"],
          ["Employee Rank · French (data team, Sisense PDF)", "Calls, contacted, SOV by rank 1–4; weekly shares and Reg ÷ contacted by rank", "1 Jan – 10 Nov 2026", "Golden rule, definition of top closers, cross-check"],
          ["CEO Performance Suite · French tab", "Rep-level weeks: calls and contacted by rep", "5 weeks, Aug – Nov 2026", "Calls per rep-week, second check on the golden rule"],
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
          [{ v: "8 · Today's team", cls: "big" }, "For each rep not disabled in the CRM: contacted orders a week ÷ contact rate = leads. The answer is the lowest of four limits: the reps' normal load, Tier 1 at 35 of 100, Ranks 3–4 at 70 of 100, and the lead-price step from the ladder. Sara Mokla is left out.", "Ties the number to who is working today, rep by rep."],
          [{ v: "10 · Two ROIs", cls: "big" }, "Checked that the CRM's Regs equals Reg New + Reg DB in each of the five weeks Gal's workbook splits. Elsewhere: new registrations = acquisitions × 1.11 (range 1.00–1.20), capped at all registrations; new SOV = SOV × new ÷ all registrations, the workbook's method. Ladder re-run with new-business SOV only.", "Separates what the leads bring from what the database brings."],
          [{ v: "11 · Tier rule", cls: "big" }, "Joined the scorecard's 14 weekly rank shares to CRM leads, acquisitions, SOV and media. Split the weeks at each cut-off (13 tried) and compared acquisitions per 100 leads (chi-square) and weekly ROI (rank test). Regressed each rank's share on leads a day.", "Tests the 35-of-100 claim and finds where it breaks."],
          [{ v: "12 · Team make-up", cls: "big" }, "Capacity per rank = 412 calls per rep-week (CEO Suite, five weeks) ÷ the scorecard's calls per contacted order. For any mix of ranks, the lead count is the lowest of load, the two tier rules and the price step.", "Answers “how many leads for how many reps in which rank”."],
          [{ v: "9 · Last six weeks", cls: "big" }, "Compared 28 Sep – 8 Nov with the two six-week blocks before it; chi-square tests on acquisitions per lead and per contacted order; weekly media from the daily cost file from 13 Oct, monthly cost shared by leads before that.", "Shows what changed recently and whether the change is firm."],
        ]) +
      dataTable("What is still missing", "Each gap, and what would close it.",
        ["Gap", "Effect today", "What would close it"],
        [
          ["No shift or hours log", "“Per rep per shift” is an assumption (5 shifts a week), and today's team is taken as the reps not disabled in the CRM, minus Sara Mokla", "A weekly roster by rep"],
          ["No rep-by-day export", "The golden rule by day and by rep cannot be computed; weekly rank shares are used", "CRM rep pivot split by day or week"],
          ["No last-30-day rep export", "“Top reps in the past 30 days” uses the scorecard's 60-day ranks", "By-Rep pivot filtered to the last 30 days"],
          ["No new/database flag on registrations", "New and database registrations are counted in five weeks of Gal's workbook and estimated everywhere else (1.11 new registrations per acquisition, range 1.00–1.20)", "A new/database flag per registration, or the weekly split for all 36 weeks"],
          ["Scorecard rep rows printed for Rank 1 and part of Rank 2 only", "Each rep's rank on the Team Today tab is a reading, editable on the page", "The scorecard's rep list for Ranks 3 and 4"],
          ["Leads are not assigned to a rep in any export", "Calls per lead by rep is estimated from calls per contacted order; leads per rep are derived from contacted orders", "CRM lead-owner field in the by-rep pivot"],
          ["Scorecard PDF shows rep rows for rank 1 and part of rank 2", "Ranks 3–4 used as groups, not by name", "Full export of the rep table"],
          ["SOV and calls are on a different basis in the scorecard and the CRM export", "ROI uses CRM SOV; on the scorecard's basis the sweet spot would be lower", "The data team's definition of SOV and calls in each report"],
        ]) +
      verdict("Honest limits", `36 weeks is a small sample for a curve, which is why the answer is a 90–105 zone with 100 at its centre and not a single lead. The weeks were not an experiment: lead volume, lead price, team make-up and season all moved together. The clean test with today's team is to hold 75 a day for four weeks, then 80 for four, with the same team and no day at 150 or more, and compare new acquisitions per 100 leads.`, true)
    );
  }

  // ── Router ──
  // ===================== TEAM TODAY (rep by rep, by scorecard rank) =====================
  const D2 = window.X2, D3 = window.X3, T3 = D3.tier, RO = D3.roi;
  const CTR = X.cap.ctr / 100;                      // contacted orders ÷ leads, whole export
  const CAP = { "20": 100, "23": 95, "29.7": 85 };  // sweet spot by lead price on all-registrations ROI, from the ladder
  const PLAB = { "20": "$20", "23": "$23", "29.7": "$29.70" }, PNUM = { "20": 20, "23": 23, "29.7": 29.7 };
  const NEWLOAD = 14;                               // contacted a week per newcomer: 42–43 a week between three (CEO Suite weeks)
  const R35 = 0.35, R70 = 0.70;                     // tier rules: Rank 4 share, Ranks 3–4 share of contacted orders
  const RKN = { 4: "Rank 4 · Tier 1", 3: "Rank 3", 2: "Rank 2", 1: "Rank 1" };
  const TEAM = D3.reps.filter((r) => r.st !== "left").map((r) => {
    const nw = r.rank === 1;
    return { name: r.name, short: r.short, rank: r.rank, leaving: r.st === "leaving", nw, top: r.rank === 4, load: nw ? NEWLOAD : r.cw, rate: nw ? G.new.ac : r.ac, cpc: r.cpc, d: r };
  });
  const today = () => TEAM.map((t) => !t.leaving);                  // today's roster: Sara Mokla out
  const allOn = today;                                              // older tabs call the default roster "allOn"
  const withAll = () => TEAM.map(() => true);
  const without = (names) => TEAM.map((t) => !t.leaving && !names.some((n) => t.name.indexOf(n) === 0));
  const defRank = () => TEAM.map((t) => t.rank), defShift = () => TEAM.map(() => 5);
  let teamOn = today(), teamPrice = "29.7", teamRank = defRank(), teamShift = defShift();
  function plan(on, price, rk, sh) {
    rk = rk || defRank(); sh = sh || defShift();
    const base = TEAM.map((t, i) => (on[i] ? (t.load * sh[i]) / 5 : 0));
    const sum = (arr, f) => arr.reduce((a, v, i) => a + (f(i) ? v : 0), 0);
    const load = sum(base, () => true), t1 = sum(base, (i) => rk[i] === 4), top = sum(base, (i) => rk[i] >= 3), low = load - top;
    const n = on.filter(Boolean).length;
    const byLoad = load / CTR / 7, by35 = t1 / R35 / CTR / 7, by70 = top / R70 / CTR / 7, byPrice = CAP[price];
    let k = base.map(() => 1), a70 = false, a35 = false, aP = false;
    if (low > 0 && top / load < R70) { const f = (top * (1 - R70)) / R70 / low; k = k.map((v, i) => (rk[i] <= 2 ? v * f : v)); a70 = true; }   // Ranks 1–2 trimmed until Ranks 3–4 hold 70
    let c = base.map((v, i) => v * k[i]), tot = sum(c, () => true);
    if (t1 > 0 && tot - t1 > 0 && t1 / tot < R35) { const f = (t1 * (1 - R35)) / R35 / (tot - t1); k = k.map((v, i) => (rk[i] !== 4 ? v * f : v)); a35 = true; }   // everyone but Rank 4 trimmed until Rank 4 holds 35
    c = base.map((v, i) => v * k[i]); tot = sum(c, () => true);
    let L = tot / CTR / 7;
    if (L > byPrice) { const f = byPrice / L; k = k.map((v) => v * f); aP = true; L = byPrice; }
    c = base.map((v, i) => v * k[i]); tot = sum(c, () => true);
    const bind = !n ? "none" : aP ? "price" : a35 ? "t35" : a70 ? "t70" : "load";
    const reps = TEAM.map((t, i) => { const cont = c[i], wk = cont / CTR; return Object.assign({}, t, { on: on[i], rank: rk[i], shifts: sh[i], cont, wk, shift: sh[i] ? wk / sh[i] : 0, day: wk / 7, acq: ((cont * t.rate) / 100) * MO }); });
    const acq = reps.reduce((a, r) => a + r.acq, 0), L5 = Math.round(L / 5) * 5, med = L5 * 30.4 * PNUM[price];
    const acq5 = L ? (acq * L5) / L : 0;
    return { n, n4: on.filter((v, i) => v && rk[i] === 4).length, n3: on.filter((v, i) => v && rk[i] === 3).length, nLow: on.filter((v, i) => v && rk[i] <= 2).length, nNew: on.filter((v, i) => v && TEAM[i].nw).length,
      load, byLoad, by35, by70, byPrice, L, L5, bind, reps, cont: tot, fail35: n > 0 && t1 === 0,
      s4: tot ? (sum(c, (i) => rk[i] === 4) / tot) * 100 : 0, s34: tot ? (sum(c, (i) => rk[i] >= 3) / tot) * 100 : 0, s1: tot ? (sum(c, (i) => rk[i] === 1) / tot) * 100 : 0,
      share: tot ? (sum(c, (i) => rk[i] >= 3) / tot) * 100 : 0, nTop: on.filter((v, i) => v && rk[i] === 4).length,
      acq, med, roiT: med ? (acq5 * X.SPA) / med : 0, roiN: med ? (acq5 * RO.NPA) / med : 0, cpa: acq5 ? med / acq5 : 0 };
  }
  const BINDTXT = { load: "Reps' normal load", t35: "Tier 1 rule · 35", t70: "Ranks 3–4 rule · 70", price: "Lead price", none: "—" };
  const PT0 = () => plan(today(), "29.7"), PTS = () => plan(withAll(), "29.7");
  // generic team by scorecard rank: average rep in each rank (412 calls a week ÷ the rank's calls per contacted order)
  function comp(n4, n3, n2, n1) {
    const c = D3.rk, cap = (r) => c[r - 1].cap, t1 = n4 * cap(4), top = t1 + n3 * cap(3); let low = n2 * cap(2) + n1 * cap(1), r3 = n3 * cap(3), bind = "load";
    if (low > 0 && top / (top + low) < R70) { low = (top * (1 - R70)) / R70; bind = "t70"; }
    let tot = t1 + r3 + low;
    if (t1 > 0 && tot - t1 > 0 && t1 / tot < R35) { tot = t1 / R35; bind = "t35"; }
    if (t1 === 0) bind = "none";
    let L = tot / CTR / 7; if (L > 100) { L = 100; bind = "price"; }
    return { L, L5: Math.round(L / 5) * 5, bind, s4: tot ? (t1 / tot) * 100 : 0 };
  }

  function rTeam() {
    const P = plan(teamOn, teamPrice, teamRank, teamShift), act = P.reps.filter((r) => r.on), sara = TEAM.findIndex((t) => t.leaving);
    const why = P.bind === "load" ? `These reps normally carry <b>${n0(P.load)} contacted orders a week</b>. At the team's ${pc(CTR * 100, 1)} contact rate that takes <b>${n0(P.L * 7)} leads a week</b>. Buy more and the extra leads wait, get fewer calls, or land on the lowest ranks.`
      : P.bind === "t35" ? `With this roster Tier 1 (Rank 4) would handle <b>under 35 of every 100</b> contacted orders. The total is cut until Tier 1 is back at 35: the other reps get fewer leads, Tier 1 keeps theirs.`
      : P.bind === "t70" ? `With this roster Ranks 3 and 4 together would handle <b>under 70 of every 100</b> contacted orders. Ranks 1–2 get fewer leads until the top two ranks are back at 70.`
      : P.bind === "price" ? `These reps could carry ${n0(P.byLoad)} a day, but at <b>${PLAB[teamPrice]} a lead</b> the last leads stop paying above <b>${P.byPrice} a day</b> (Ladder tab).`
      : "Tick at least one rep.";
    const scen = [["Today · Sara Mokla out", today()], ["With Sara Mokla (until she leaves)", withAll()], ["Sara out, Levite also out (the 2–8 Nov roster)", without(["Levite"])], ["Sara out, Levy out for a week", without(["Levy"])], ["Sara out, Azizi out for a week", without(["Azizi"])], ["Sara out, no newcomers", TEAM.map((t) => !t.leaving && !t.nw)]];
    const sel = (i) => `<select class="rk" data-rk="${i}" aria-label="Scorecard rank for ${TEAM[i].short}">${[4, 3, 2, 1].map((r) => `<option value="${r}"${teamRank[i] === r ? " selected" : ""}>${r}</option>`).join("")}</select>`;
    const shf = (i) => `<input class="sh" type="number" min="0" max="7" step="1" value="${teamShift[i]}" data-sh="${i}" aria-label="Shifts a week for ${TEAM[i].short}">`;
    const grid = [1, 2, 3, 4].map((n4) => [{ v: n4 + " Tier 1 rep" + (n4 > 1 ? "s" : ""), cls: "big" }].concat([0, 1, 2, 3, 4].map((n3) => { const g = comp(n4, n3, 0, 3); return { v: `${g.L5}<small class="gs">${g.bind === "t35" ? "Tier 1 rule" : g.bind === "t70" ? "70 rule" : g.bind === "price" ? "price cap" : "load"}</small>`, cls: g.bind === "load" ? "big" : g.bind === "price" ? "ok" : "no" }; })));
    const of100 = (v) => n0(v) + " of 100";
    view(
      headline("How many leads for the team we have today, rep by rep?", `The reps not marked disabled in the CRM on 10 Nov 2026. Sara Mokla is leaving, so she starts unticked. Tick who is working, set each rep's scorecard rank and shifts a week, pick the lead price. Every number below recalculates.`) +
      `<div class="ctl"><div class="ctl-row"><div class="ctl-l">Who is in</div><div class="chips">${TEAM.map((t, i) => `<button class="chip${teamOn[i] ? " on" : ""}${t.nw ? " nw" : teamRank[i] === 4 ? " tp" : ""}" data-i="${i}" aria-pressed="${teamOn[i]}">${t.short}<small>${t.leaving ? "Leaving · " : ""}Rank ${teamRank[i]}</small></button>`).join("")}</div></div>` +
      `<div class="ctl-row"><div class="ctl-l">Lead price</div><div class="chips">${["20", "23", "29.7"].map((p) => `<button class="chip pr${teamPrice === p ? " on" : ""}" data-p="${p}" aria-pressed="${teamPrice === p}">${PLAB[p]}<small>${p === "29.7" ? "last 30 days" : "target"}</small></button>`).join("")}</div></div></div>` +
      bottom("Bottom line · this roster", `<em>${P.L5} leads a day</em> for ${P.n} rep${P.n === 1 ? "" : "s"}. ${n0(P.L5 * 7)} a week.`, why + (P.fail35 ? ` <b class="r">No Tier 1 rep is in: the 35-of-100 rule cannot be met at any volume.</b>` : "")) +
      kpis([
        { label: "Leads a day · this roster", value: String(P.L5), sub: `exact ${n1(P.L)}, rounded to the nearest 5 · <b>${n0(P.L5 * 7)}</b> a week`, cls: "accent-green", tag: "e" },
        { label: "From Tier 1 · of every 100 contacted", value: n0(P.s4), sub: `rule: at least <b>35</b>. ${P.n4} Tier 1 rep${P.n4 === 1 ? "" : "s"} in`, cls: P.s4 < 34.95 ? "accent-red" : "", tag: "a" },
        { label: "From Ranks 3–4 · of every 100", value: n0(P.s34), sub: `rule: at least <b>70</b>. Rank 1 handles <b>${n0(P.s1)}</b>`, cls: P.s34 < 69.95 ? "accent-red" : "", tag: "a" },
        { label: "New acquisitions a month", value: n0(P.acq), sub: "each rep at their own close rate", tag: "e" },
      ]) +
      kpis([
        { label: "Media a month at " + PLAB[teamPrice], value: usdK(P.med), sub: `${P.L5} a day × 30.4 days`, tag: "e" },
        { label: "ROI · new business only", value: xx(P.roiN), sub: `new registrations ÷ media. Under 1.00x the leads do not pay back on first sales`, cls: P.roiN < 1 ? "accent-red" : "accent-green", tag: "e" },
        { label: "ROI · all registrations", value: xx(P.roiT), sub: "new plus database registrations ÷ media", cls: P.roiT < 1 ? "accent-red" : "", tag: "e" },
        { label: "Media per new acquisition", value: usd(P.cpa), sub: `an acquisition brings <b>${usd(RO.NPA)}</b> new SOV, <b>${usd(X.SPA)}</b> with database sales`, tag: "e" },
      ]) +
      dataTable("The plan, rep by rep", `Change a rank or the shifts and the plan recalculates. Contacted orders a week = what each rep carried on average from 1 Mar to 10 Nov, absences included, scaled by shifts ÷ 5. Leads = contacted orders ÷ ${pc(CTR * 100, 1)} contact rate. Newcomers: ${NEWLOAD} contacted a week each and the group's ${pc(G.new.ac, 1)} close rate. Ranks are a reading of the scorecard and the CRM (assumed): the scorecard's printed pages name reps for Rank 1 and part of Rank 2 only.`,
        ["Rep", "In", "Scorecard rank", "Shifts a week", "Calls per contacted", "Close rate", "Contacted orders a week", "Leads a week", "Leads per shift", "Leads a day (7-day)", "New acquisitions a month"],
        P.reps.map((r, i) => [r.short + (r.leaving ? ' <span class="pill p-no">Leaving</span>' : ""), r.on ? { v: "✓", cls: "ok" } : { v: "out", cls: "mut" }, sel(i), shf(i), n1(r.cpc), pc(r.rate, 1), r.on ? n1(r.cont) : "—", r.on ? n0(r.wk) : "—", r.on ? { v: n0(r.shift), cls: "big" } : "—", r.on ? n1(r.day) : "—", r.on ? n1(r.acq) : "—"])
          .concat([[{ v: "This roster", cls: "big" }, `${P.n} reps`, "", n0(act.reduce((a, r) => a + r.shifts, 0)), "", pc(P.cont ? (P.acq / MO / P.cont) * 100 : 0, 1), n0(P.cont), n0(P.L * 7), act.length ? n1((P.L * 7) / act.reduce((a, r) => a + r.shifts, 0)) : "—", n1(P.L), n0(P.acq)]]),
        (i) => (i === TEAM.length ? "tot" : !P.reps[i].on ? "off" : "")) +
      dataTable("Four limits. The lowest one is the answer.", "Each limit is a separate test. The roster above is checked against all four.",
        ["Limit", "What it means", "Leads a day", "Sets the answer?"],
        [["What these reps normally carry", `${n0(P.load)} contacted orders a week ÷ ${pc(CTR * 100, 1)} contact rate ÷ 7 days`, n1(P.byLoad), P.bind === "load"],
         ["Tier 1 rule · 35 of 100", "Rank 4 reps keep at least 35 of every 100 contacted orders", P.n4 ? n1(P.by35) : "cannot be met", P.bind === "t35"],
         ["Ranks 3–4 rule · 70 of 100", "Ranks 3 and 4 together keep at least 70 of every 100 contacted orders", P.n4 + P.n3 ? n1(P.by70) : "cannot be met", P.bind === "t70"],
         ["Lead price " + PLAB[teamPrice], "The step where the last 5 leads still pay for themselves on all registrations (Ladder tab)", String(P.byPrice), P.bind === "price"]]
          .map((r) => [{ v: r[0], cls: "big" }, r[1], r[2], r[3] ? { v: "✓ this one", cls: "ok" } : { v: "no", cls: "mut" }]),
        (i) => ((i === 0 && P.bind === "load") || (i === 1 && P.bind === "t35") || (i === 2 && P.bind === "t70") || (i === 3 && P.bind === "price") ? "hl" : "")) +
      dataTable("The same sum for other rosters", "Fixed examples with the default ranks and 5 shifts each, so the room can see how the answer moves with who is in.",
        ["Roster", "Reps", "Leads a day at $29.70", "At $23 · $20", "What sets it", "Tier 1 of 100", "Ranks 3–4 of 100", "New acquisitions a month"],
        scen.map(([n, on]) => { const a = plan(on, "29.7"), b = plan(on, "23"), c = plan(on, "20"); return [{ v: n, cls: "big" }, a.n, { v: a.L5, cls: "big" }, `${b.L5} · ${c.L5}`, BINDTXT[a.bind], a.s4 < 34.95 ? { v: n0(a.s4), cls: "no" } : n0(a.s4), a.s34 < 69.95 ? { v: n0(a.s34), cls: "no" } : n0(a.s34), n0(a.acq)]; }),
        (i) => (i === 0 ? "hl" : "")) +
      sec("The same answer by how many reps you have in each rank") +
      dataTable("Leads a day by team make-up · average rep in each rank", `For hiring and planning. Columns: Rank 3 reps. Every cell also has 3 Rank 1 newcomers, as today. An average rep makes ${n0(D3.crw)} calls a week (CEO Performance Suite, 5 weeks); the scorecard's calls per contacted order by rank turn that into ${D3.rk.slice().reverse().map((r) => `<b>${n0(r.cap)}</b> (Rank ${r.r})`).join(", ")} contacted orders a week. Red = a tier rule sets the number. Capped at 100, the ceiling at $20 a lead. Today's named team is 2 Tier 1 + 3 Rank 3 + 3 newcomers: ${comp(2, 3, 0, 3).L5} on averages, ${PT0().L5} on the reps' own loads, because Levy and Azizi carry more than an average Rank 4 rep.`,
        ["", "0 Rank 3", "1 Rank 3", "2 Rank 3", "3 Rank 3", "4 Rank 3"], grid, (i) => (i === 1 ? "hl" : "")) +
      dataTable("What one rep in each rank adds", `Scorecard rows as printed (calls, contacted, Jan–Nov) and ${n0(D3.crw)} calls a week per rep. One Tier 1 rep lets the whole team take ${n0(D3.rk[3].anchor35)} leads a day before Tier 1 drops under 35 of 100.`,
        ["Scorecard rank", "Calls per contacted order", "Contacted orders a week", "Leads a day (7-day)", "Leads per shift · 5 shifts", "Reg ÷ contacted (scorecard)", "SOV per call (scorecard)"],
        D3.rk.slice().reverse().map((r) => [{ v: RKN[r.r], cls: "big" }, n1(r.cpc), n0(r.cap), { v: n1(r.lpd), cls: "big" }, n0(r.lps), pc(r.conv, 1), "$" + n2(r.spcall)]), (i) => (i === 0 ? "hl" : "")) +
      ins([
        { h: "Sara Mokla leaving", big: `${PTS().L5} → ${PT0().L5} leads a day`, b: `She carries <b>${n1(TEAM[sara].load)} contacted orders a week</b> at an <b>${pc(TEAM[sara].rate, 1)}</b> close rate, the highest on the team: about <b>${n1(TEAM[sara].d.am)} new acquisitions a month</b>. Without her the team's normal load is ${n0(PT0().load)} contacted orders a week. Keep buying ${PTS().L5} and her orders land on Rank 1.`, c: C.red },
        { h: "Two Tier 1 reps left", big: `Levy out: ${plan(without(["Levy"]), "29.7").L5} a day`, b: `After Sara, Tier 1 is Levy and Azizi. If Levy is off for a week the 35-of-100 rule allows <b>${plan(without(["Levy"]), "29.7").L5}</b> leads a day; if Azizi is off, <b>${plan(without(["Azizi"]), "29.7").L5}</b>. Cut the leads that week, or the lower ranks take Tier 1's orders.`, c: C.amber },
        { h: "What it takes to reach 100", big: "4 Tier 1 + 4 Rank 3", b: `On average loads, 100 a day needs <b>four Tier 1 and four Rank 3 reps</b> next to three newcomers, and leads back at $20. Today that is two more Tier 1 reps and one more Rank 3. Levite works at Tier 1 speed (${n1(TEAM.find((t) => t.short === "Levite").cpc)} calls per contacted order) and is the nearest candidate.`, c: C.cyan },
      ]) +
      verdict("What is assumed here", `<b>No file says who is on shift, how many shifts each rep works, or which rank each rep holds today.</b> So all three are yours to set above. Starting points: the roster is “in the CRM, not disabled”, minus Sara Mokla; 5 shifts a week each; ranks from the scorecard's printed rows and the CRM rep table. Loads are whole-period averages by rep; a rep-by-week export would replace them with counted weeks. The newcomer load is a group estimate; Lemma carries most of it today.`, true)
    );
    const keep = (fn) => { const y = window.scrollY; fn(); rTeam(); window.scrollTo(0, y); };
    document.querySelectorAll(".chip[data-i]").forEach((b) => b.addEventListener("click", () => keep(() => { const i = +b.dataset.i; teamOn[i] = !teamOn[i]; })));
    document.querySelectorAll(".chip[data-p]").forEach((b) => b.addEventListener("click", () => keep(() => { teamPrice = b.dataset.p; })));
    document.querySelectorAll("select[data-rk]").forEach((b) => b.addEventListener("change", () => keep(() => { teamRank[+b.dataset.rk] = +b.value; })));
    document.querySelectorAll("input[data-sh]").forEach((b) => b.addEventListener("change", () => keep(() => { teamShift[+b.dataset.sh] = Math.max(0, Math.min(7, Math.round(+b.value || 0))); })));
  }

  // ===================== LAST 6 WEEKS =====================
  function rDecline() {
    const B = {}; D2.B.forEach((b) => { B[b.k] = b; });
    const s6 = B.s6, p6 = B.p6, l6 = B.l6, a3 = B.l6a, b3 = B.l6b, st = D2.st;
    const RB = {}; RO.B.forEach((b) => { RB[b.k] = b; });
    const W = D2.wk.filter((w) => w.n === 7), last6 = W.slice(-6), part = D2.wk[D2.wk.length - 1];
    const chg = (a, b, goodUp, pts) => { const d = pts ? a - b : (a / b - 1) * 100, good = goodUp ? d > 0 : d < 0, flat = Math.abs(d) < (pts ? 0.25 : 2.5); return { v: (d > 0 ? "+" : "−") + (pts ? Math.abs(d).toFixed(1) + " pts" : Math.abs(d).toFixed(0) + "%"), cls: flat ? "mut" : good ? "ok" : "no" }; };
    const M = [
      ["Leads a day", (b) => n1(b.lpd), "lpd", null], ["Media a week", (b) => usd(b.cost), "cost", false], ["Media per lead", (b) => "$" + n2(b.lcost), "lcost", false],
      ["Calls per lead", (b) => n2(b.cpl), "cpl", true], ["Contact rate (contacted ÷ leads)", (b) => pc(b.ctr, 1), "ctr", true, true], ["Contacted orders a week", (b) => n0(b.cont), "cont", true],
      ["New acquisitions a week", (b) => n1(b.acq), "acq", true], ["Close rate (acquisitions ÷ contacted)", (b) => pc(b.ac, 1), "ac", true, true], ["New acquisitions per 100 leads", (b) => n2(b.a100), "a100", true],
      ["Media per new acquisition", (b) => usd(b.cpa), "cpa", false], ["Registrations a week", (b) => n1(b.regs), "regs", true], ["of which follow-on (registrations − acquisitions)", (b) => n1(b.add), "add", true],
      ["SOV a week", (b) => usd(b.sov), "sov", true], ["ROI (SOV ÷ media)", (b) => xx(b.roi), "roi", true], ["Days with 150+ leads", (b) => String(b.d150), "d150", null],
    ];
    const erTop = {}; ER.wk.forEach((w) => { erTop[w.s] = w.top; });
    const sunBefore = (s) => { const d = new Date(s + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); };
    const NOTE = { "2026-09-28": "All five in", "2026-10-05": "Levite 89 calls (others 273–674)", "2026-11-02": "Levite and Mokla: no calls" };
    const gap6 = last6.reduce((a, w) => a + w.exp, 0), act6 = last6.reduce((a, w) => a + w.acq, 0), lw = last6[5];
    view(
      headline("What happened in the last six weeks?", `${l6.lab} 2026 against the six weeks before (${p6.lab}) and the summer six (${s6.lab}). Full Monday–Sunday weeks from the CRM by-day export and the media-cost exports.`) +
      bottom("Bottom line", `<em class="r">${pc((l6.lpd / p6.lpd - 1) * 100)} more leads. ${pc((l6.cost / p6.cost - 1) * 100)} more media. ${pc((1 - l6.acq / p6.acq) * 100)} fewer new acquisitions.</em>`, `Each new acquisition cost <b>${usd(l6.cpa)}</b> in media, against <b>${usd(p6.cpa)}</b> in the six weeks before and <b>${usd(s6.cpa)}</b> in the summer. ROI fell from <b>${xx(p6.roi)}</b> to <b>${xx(l6.roi)}</b>, and to <b>${xx(b3.roi)}</b> in the last three weeks. The team was fed <b>${n0(l6.lpd)} leads a day</b>. On new business alone the ROI went from <b>${xx(RB.p6.roiN)}</b> to <b class="r">${xx(RB.l6.roiN)}</b>. Today's team carries <b>${PT0().L5}</b> a day (${PTS().L5} while Sara Mokla is in).`) +
      kpis([
        { label: "Leads a day", value: n0(l6.lpd), sub: `six weeks before <b>${n0(p6.lpd)}</b> · summer <b>${n0(s6.lpd)}</b>`, cls: "accent-amber", tag: "v" },
        { label: "New acquisitions a week", value: n1(l6.acq), sub: `six weeks before <b>${n1(p6.acq)}</b> · summer <b>${n1(s6.acq)}</b>`, cls: "accent-red", tag: "v" },
        { label: "Media per new acquisition", value: usd(l6.cpa), sub: `six weeks before <b>${usd(p6.cpa)}</b> · summer <b>${usd(s6.cpa)}</b>`, cls: "accent-red", tag: "e" },
        { label: "ROI · SOV ÷ media", value: xx(l6.roi), sub: `six weeks before <b>${xx(p6.roi)}</b> · summer <b>${xx(s6.roi)}</b>`, cls: "accent-red", tag: "e" },
      ]) +
      kpis([
        { label: "New acquisitions per 100 leads", value: n2(l6.a100), sub: `six weeks before <b>${n2(p6.a100)}</b> · summer <b>${n2(s6.a100)}</b> (${pv(st.a100_l6_s6)} vs summer)`, tag: "v" },
        { label: "Contact rate", value: pc(l6.ctr, 1), sub: `six weeks before <b>${pc(p6.ctr, 1)}</b> (${pv(st.ctr_l6_p6)})`, tag: "v" },
        { label: "Close rate · last 3 weeks", value: pc(b3.ac, 1), sub: `first three of the six <b>${pc(a3.ac, 1)}</b> · summer <b>${pc(s6.ac, 1)}</b>`, cls: "accent-red", tag: "v" },
        { label: "Media per lead · last 3 weeks", value: "$" + n2(b3.lcost), sub: `first three of the six <b>$${n2(a3.lcost)}</b> · six weeks before <b>$${n2(p6.lcost)}</b>`, cls: "accent-red", tag: "v" },
      ]) +
      kpis([
        { label: "ROI · new business only", value: xx(RB.l6.roiN), sub: `six weeks before <b>${xx(RB.p6.roiN)}</b> · summer <b>${xx(RB.s6.roiN)}</b> · last three weeks <b>${xx(RB.l3.roiN)}</b>`, cls: "accent-red", tag: "e" },
        { label: "ROI · all registrations", value: xx(RB.l6.roiT), sub: `six weeks before <b>${xx(RB.p6.roiT)}</b> · summer <b>${xx(RB.s6.roiT)}</b>. Database share of registrations <b>${pc(RB.l6.dbs)}</b>`, cls: "accent-amber", tag: "e" },
        { label: "Tier 1 of every 100 contacted", value: n0(T3.last.r4), sub: `rule: at least 35. Eight weeks to 26 Sep <b>${n0(T3.pre.r4)}</b>. Kept in <b>${T3.last.ge35} of ${T3.last.n}</b> weeks`, cls: "accent-red", tag: "v" },
        { label: "Ranks 3–4 of every 100 contacted", value: n0(T3.last.top), sub: `rule: at least 70. Eight weeks to 26 Sep <b>${n0(T3.pre.top)}</b>. Rank 1 went from ${n0(T3.pre.r1)} to <b>${n0(T3.last.r1)}</b>`, cls: "accent-red", tag: "v" },
      ]) +
      `<div class="charts-grid cols-2">` +
      chartCard("dcA", "More leads in, fewer new acquisitions out of each 100", "Bars: leads a day, week by week (red = the last six weeks). Line: new acquisitions per 100 leads.", 400) +
      chartCard("dcB", "ROI fell as the lead price rose", "Line: SOV ÷ media, week by week. Bars: media per lead. Before 13 Oct the weekly media is the month's cost shared out by leads.", 400) +
      `</div>` +
      dataTable("Three six-week blocks, side by side", "Weekly averages. Green = better than the comparison block, red = worse. Media before 13 Oct is the monthly cost shared out by leads (estimated); from 13 Oct it is the daily cost file.",
        ["Measure", "Summer six · " + s6.lab, "Six before · " + p6.lab, "Last six · " + l6.lab, "Last six vs six before", "Last six vs summer"],
        M.map((m) => [{ v: m[0], cls: "big" }, m[1](s6), m[1](p6), { v: m[1](l6), cls: "big" }, m[3] === null ? { v: m[2] === "lpd" ? "+" + pc((l6.lpd / p6.lpd - 1) * 100) : "+" + (l6.d150 - p6.d150), cls: "mut" } : chg(l6[m[2]], p6[m[2]], m[3], m[4]), m[3] === null ? { v: m[2] === "lpd" ? "+" + pc((l6.lpd / s6.lpd - 1) * 100) : "+" + (l6.d150 - s6.d150), cls: "mut" } : chg(l6[m[2]], s6[m[2]], m[3], m[4])]),
        (i) => (M[i][2] === "acq" || M[i][2] === "cpa" || M[i][2] === "roi" ? "hl" : "")) +
      dataTable("The six weeks, one by one", "“Curve expected” = what the 36-week model gives at that week's lead volume. Top ranks' share is from the Employee Rank scorecard, whose weeks start on the Sunday. Top-closer notes are from the CEO Performance Suite, for the weeks it covers.",
        ["Week", "Leads a day", "Biggest day", "Contact rate", "New acquisitions", "Curve expected", "Close rate", "Per 100 leads", "Registrations", "SOV", "Media per lead", "ROI", "Top ranks' share", "Top closers"],
        last6.map((w) => { const t = erTop[sunBefore(w.s)]; return [dt(w.s), n0(w.lpd), w.mx >= 150 ? { v: w.mx, cls: "no" } : w.mx, pc(w.ctr, 1), w.acq < 15 ? { v: w.acq, cls: "no" } : w.acq, n0(w.exp), w.ac < 8 ? { v: pc(w.ac, 1), cls: "no" } : pc(w.ac, 1), n2(w.a100), w.regs, usdK(w.sov), "$" + n2(w.lc), w.roi < 1.5 ? { v: xx(w.roi), cls: "no" } : xx(w.roi), t == null ? "—" : t < 59 ? { v: pc(t), cls: "no" } : t < 61 ? pc(t) : { v: pc(t), cls: "ok" }, NOTE[w.s] || "—"]; })
          .concat([[`${dt(part.s)} (2 days)`, n0(part.lpd), part.mx, pc(part.ctr, 1), part.acq, "—", pc(part.ac, 1), n2(part.a100), part.regs, usdK(part.sov), "$" + n2(part.lc), xx(part.roi), "—", "—"]]),
        (i) => (i === 6 ? "off" : "")) +
      sec("Three things changed at once") +
      ins([
        { h: "1 · Volume above the team", big: `4 of 6 weeks at 109–116 a day`, b: `Against <b>${n0(p6.lpd)}</b> a day in the six weeks before. Four days brought 150 or more leads, one of them <b>252</b>. Calls per lead fell from ${n2(p6.cpl)} to ${n2(l6.cpl)} and the contact rate from ${pc(p6.ctr, 1)} to ${pc(l6.ctr, 1)}.`, c: C.amber },
        { h: "2 · Price", big: `$${n2(p6.lcost)} → $${n2(b3.lcost)} a lead`, b: `Media per lead was $${n2(a3.lcost)} in the first three of the six weeks and <b>$${n2(b3.lcost)}</b> in the last three. At that price a new acquisition cost <b>${usd(b3.cpa)}</b> in media, more than the ${usd(X.SPA)} of SOV an average new acquisition brings.`, c: C.red },
        { h: "3 · People", big: "Top ranks at or under 60% for 5 weeks", b: `The scorecard's ranks 3–4 handled 42–60% of contacted orders in the five weeks from 27 Sep to 31 Oct. Rank 4's close rate went from 10.9% to 4.0% after 18 Oct (p = 0.008). In 2–8 Nov Levite and Mokla logged no calls and the week closed <b>${lw.acq}</b>.`, c: C.pink },
      ]) +
      ins([
        { h: "What did not fall", big: `SOV held at ${usdK(l6.sov)} a week`, b: `Registrations stayed at <b>${n1(l6.regs)}</b> a week (${n1(p6.regs)} before) because follow-on and database registrations rose from ${n1(p6.add)} to <b>${n1(l6.add)}</b> a week. New customers are what fell, and they are what the leads are bought for.`, c: C.emerald },
        { h: "Was the curve wrong?", big: `Expected ${n0(gap6)}, got ${act6}`, b: `Over the six weeks the 36-week curve expected ${n0(gap6)} new acquisitions at these volumes; the team closed ${act6}. Five weeks were on the curve. The last week expected ${n0(lw.exp)} and closed <b>${lw.acq}</b>: that gap is roster, not volume.`, c: C.cyan },
        { h: "How firm is it", big: "Firm against summer. Not yet against the six before.", b: `New acquisitions per 100 leads: last six vs summer ${pv(st.a100_l6_s6)}; vs the six before ${pv(st.a100_l6_p6)}, so not yet firm. Close rate fell about <b>1 point a week</b> across the six (${pv(st.ac_slope_p)}). The last week alone is below every other week (${pv(st.ac_last_rest)}).`, c: C.indigo },
      ]) +
      verdict("What to do this week", `<b>Buy ${PT0().L5} a day for today's ${PT0().n} reps (${PTS().L5} until Sara Mokla's last day), not 100+.</b> Keep every single day under 150. Give Tier 1 its leads first, so it handles at least 35 of every 100 contacted orders (Team Today tab gives each rep's number). Push the lead price back toward $23: at $${n2(b3.lcost)} a new acquisition costs more in media than it returns. Then step up 5 a day at a time and watch new acquisitions per 100 leads: it should be back above ${n1(p6.a100)}.`)
    );
    mkChart("dcA", { data: { labels: W.map((w) => dt(w.s)), datasets: [
      { type: "line", label: "New acquisitions per 100 leads", data: W.map((w) => w.a100), borderColor: C.amber, backgroundColor: C.amber, yAxisID: "y1", tension: 0.25, pointRadius: 4, borderWidth: 3 },
      { type: "bar", label: "Leads a day", data: W.map((w) => w.lpd), backgroundColor: W.map((w, i) => (i >= W.length - 6 ? "rgba(239,68,68,0.75)" : "rgba(99,102,241,0.55)")), borderRadius: 4, datalabels: dl("#fff", (v) => Math.round(v), { anchor: "start", align: "end", rotation: -90, font: { size: 12, weight: "700" } }) },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { s: hline(85, "85 a day", C.cyan) } } }, scales: { x: ax("Week starting", { grid: { display: false }, ticks: { color: C.textSec, font: { size: 12 }, maxRotation: 60, minRotation: 45 } }), y: ax("Leads a day", { beginAtZero: true, max: 140 }), y1: ax("New acquisitions per 100 leads", { position: "right", beginAtZero: true, max: 7, grid: { display: false }, ticks: tk((v) => v, C.amber) }) } }) });
    mkChart("dcB", { data: { labels: W.map((w) => dt(w.s)), datasets: [
      { type: "line", label: "ROI (SOV ÷ media)", data: W.map((w) => w.roi), borderColor: C.emerald, backgroundColor: C.emerald, tension: 0.25, pointRadius: 4, borderWidth: 3 },
      { type: "bar", label: "Media per lead", data: W.map((w) => w.lc), yAxisID: "y1", backgroundColor: W.map((w, i) => (i >= W.length - 6 ? "rgba(239,68,68,0.6)" : "rgba(148,163,184,0.3)")), borderRadius: 4 },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { s: hline(1, "1.0x = media only just paid back", C.red) } } }, scales: { x: ax("Week starting", { grid: { display: false }, ticks: { color: C.textSec, font: { size: 12 }, maxRotation: 60, minRotation: 45 } }), y: ax("ROI", { beginAtZero: true, max: 4, ticks: tk((v) => v.toFixed(1) + "x") }), y1: ax("Media per lead", { position: "right", beginAtZero: true, max: 40, grid: { display: false }, ticks: tk((v) => "$" + v) }) } }) });
  }
  // ===================== TIER RULE (scorecard ranks × CRM outcomes) =====================
  function rTier() {
    const t35 = T3.t35, t70 = T3.t70, r15 = T3.r15, cx = T3.cross, W = T3.wk, P = PT0();
    const firm = (p) => (p < 0.05 ? "Firm" : p < 0.1 ? "Leaning" : "Not firm");
    const G1 = (v) => `<b style="color:${C.emerald}">${v}</b>`, R1 = (v) => `<b style="color:${C.red}">${v}</b>`;
    const vs = (a, b, f, hiGood) => { const good = hiGood ? a > b : a < b; return `${good ? G1(f(a)) : f(a)}<br><span class="mut">vs</span> ${good ? R1(f(b)) : f(b)}`; };
    const tr = (name, t) => [{ v: name, cls: "big" }, `${t.hi.n} <span class="mut">vs</span> ${t.lo.n}`, vs(t.hi.lpd, t.lo.lpd, n0, false), vs(t.hi.a100, t.lo.a100, n2, true), vs(t.hi.ac, t.lo.ac, (v) => pc(v, 1), true), vs(t.hi.roiN, t.lo.roiN, xx, true), vs(t.hi.roiT, t.lo.roiT, xx, true), vs(t.hi.cpa, t.lo.cpa, usd, false), vs(t.hi.lc, t.lo.lc, (v) => "$" + n2(v), false), { v: `${firm(t.p_roiN)} · ${pv(t.p_roiN)}`, cls: t.p_roiN < 0.1 ? "ok" : "mut" }];
    const wkT = Math.round(P.cont);
    view(
      headline("Is 35 of every 100 contacted orders from Tier 1 the right rule?", `Tier 1 = Rank 4 on the data team's Employee Rank scorecard (assumed highest: fewest calls per contacted order, largest share of SOV). The scorecard's 14 full weeks, 2 Aug – 7 Nov 2026, joined week by week to CRM leads, acquisitions, SOV and media cost.`) +
      bottom("Bottom line", `<em>Keep the 35 rule, and add a second one:</em> 70 of every 100 from Ranks 3 and 4.`, `In the eight weeks to 26 Sep, Tier 1 handled 35 or more of every 100 contacted orders in <b>${T3.pre.ge35} of ${T3.pre.n} weeks</b>. In the last six weeks it did so in <b class="r">${T3.last.ge35} of ${T3.last.n}</b>: between ${n0(T3.last.lo)} and ${n0(T3.last.hi)}. Weeks with Ranks 3–4 at 70 or more returned <b>${n2(t70.hi.a100)}</b> new acquisitions per 100 leads and <b>${xx(t70.hi.roiN)}</b> on new business. Weeks under 70: <b>${n2(t70.lo.a100)}</b> and <b class="r">${xx(t70.lo.roiN)}</b>. With the team as it was, Tier 1 drops under 35 at about <b>${n0(cx.r4_35)} leads a day</b> and Ranks 3–4 under 70 at about <b>${n0(cx.top_70)}</b>. Your 35 line points the right way (${xx(t35.hi.roiN)} against ${xx(t35.lo.roiN)}) but 14 weeks do not prove it alone; the 70 line is the one the data backs best (${pv(t70.p_roiN)}).`) +
      kpis([
        { label: "Tier 1 of every 100 · eight weeks to 26 Sep", value: n0(T3.pre.r4), sub: `35 or more in <b>${T3.pre.ge35} of ${T3.pre.n}</b> weeks. Ranks 3–4: <b>${n0(T3.pre.top)}</b>`, cls: "accent-green", tag: "v" },
        { label: "Tier 1 of every 100 · last six weeks", value: n0(T3.last.r4), sub: `35 or more in <b>${T3.last.ge35} of ${T3.last.n}</b> weeks. Ranks 3–4: <b>${n0(T3.last.top)}</b> · Rank 1: <b>${n0(T3.last.r1)}</b>`, cls: "accent-red", tag: "v" },
        { label: "Where Tier 1 drops under 35", value: n0(cx.r4_35) + " a day", sub: `every +10 leads a day takes <b>${n1(Math.abs(cx.r4_slope10))}</b> of 100 away from Tier 1 (rank test ${pv(T3.cor.r4_lpd.p)})`, tag: "e" },
        { label: "Where Ranks 3–4 drop under 70", value: n0(cx.top_70) + " a day", sub: `every +10 leads a day takes <b>${n1(Math.abs(cx.top_slope10))}</b> of 100 away (rank test ${pv(T3.cor.top_lpd.p)})`, tag: "e" },
      ]) +
      dataTable("The rules, in contacted orders", `What each rule means for 100 contacted orders, for 50, and for the ${wkT} a week today's roster carries (Team Today tab). Shares before and after are from the scorecard's weekly chart; today's roster uses the ranks set on the Team Today tab (assumed).`,
        ["Rule", "Of every 100", "Of every 50", `Of today's ${wkT} a week`, "Eight weeks to 26 Sep", "Last six weeks", "Today's roster"],
        [[{ v: "Tier 1 (Rank 4) · at least", cls: "big" }, { v: "35", cls: "big" }, "18", n0(wkT * 0.35), { v: n0(T3.pre.r4), cls: "ok" }, { v: n0(T3.last.r4), cls: "no" }, { v: n0(P.s4), cls: P.s4 >= 35 ? "ok" : "no" }],
         [{ v: "Ranks 3 and 4 together · at least", cls: "big" }, { v: "70", cls: "big" }, "35", n0(wkT * 0.7), { v: n0(T3.pre.top), cls: "ok" }, { v: n0(T3.last.top), cls: "no" }, { v: n0(P.s34), cls: P.s34 >= 70 ? "ok" : "no" }],
         [{ v: "Rank 1 · no more than", cls: "big" }, { v: "15", cls: "big" }, "7", n0(wkT * 0.15), { v: n0(T3.pre.r1), cls: "ok" }, { v: n0(T3.last.r1), cls: "no" }, { v: n0(P.s1), cls: P.s1 <= 15 ? "ok" : "no" }]]) +
      `<div class="charts-grid cols-2">` +
      chartCard("trA", "Tier 1 lost its share as the leads went up", "Lines: of every 100 contacted orders, how many Tier 1 handled and how many Ranks 3–4 handled, week by week (scorecard). Bars: leads a day (CRM).", 420) +
      chartCard("trB", "Weeks that kept the rule returned more on new business", "ROI on new business only (new registrations ÷ media), weeks that kept each rule against weeks that broke it. Under 1.00x the media was not paid back by first sales.", 420) +
      `</div>` +
      dataTable("Each rule tested on the 14 weeks", `Every cell reads “weeks that kept the rule vs weeks that broke it”. ROI uses the media-cost exports; new business is estimated from Gal's weekly split (Two ROIs tab). “How firm” is a rank test on weekly ROI on new business. ${T3.nscan} cut-offs were tried in all; these three are the ones that matter.`,
        ["Rule", "Weeks kept vs broken", "Leads a day", "New acquisitions per 100 leads", "Close rate", "ROI · new business", "ROI · all registrations", "Media per acquisition", "Media per lead", "How firm"],
        [tr("Tier 1 at 35+ of 100", t35), tr("Ranks 3–4 at 70+ of 100", t70), tr("Rank 1 at 15 or less of 100", r15)],
        (i) => (i === 1 ? "hl" : "")) +
      dataTable("The 14 weeks, one by one", "Scorecard weeks start on the Sunday. Shares are read from the scorecard's weekly chart. Red = rule broken that week. The last six rows (27 Sep on) are the last six weeks.",
        ["Week from", "Leads a day", "Tier 1 of 100", "Ranks 3–4 of 100", "Rank 1 of 100", "New acquisitions", "Per 100 leads", "Close rate", "ROI · new business", "ROI · all registrations", "Media per lead", "Media per acquisition"],
        W.map((w) => [{ v: w.lab, cls: "big" }, n0(w.lpd), { v: n0(w.r4), cls: w.r4 >= 35 ? "ok" : "no" }, { v: n0(w.top), cls: w.top >= 70 ? "ok" : "no" }, { v: n0(w.r1), cls: w.r1 <= 15 ? "ok" : "no" }, w.acq, n2(w.a100), pc(w.ac, 1), { v: xx(w.roiN), cls: w.roiN >= 1 ? "" : "no" }, xx(w.roiT), "$" + n2(w.lc), usd(w.cpa)]),
        (i) => "") +
      sec("What this means for the lead count") +
      ins([
        { h: "The rule is a capacity rule", big: `${n1(D3.rk[3].cpc)} calls per contacted order`, b: `A Rank 4 rep needs <b>${n1(D3.rk[3].cpc)}</b> calls to reach one contacted order; Rank 1 needs <b>${n1(D3.rk[0].cpc)}</b> (scorecard, as printed). Tier 1 can only carry so many orders a week. Every lead above that goes to a lower rank, so more leads means a smaller Tier 1 share.`, c: C.emerald },
        { h: "Where it lands", big: `${n0(cx.top_70)}–${n0(cx.r4_35)} leads a day, team as it was`, b: `Both rules break in the same place, and it is the same number the money tests gave at today's lead price: <b>85</b>. With Sara Mokla gone the team carries less, and the number is <b>${P.L5}</b> (Team Today tab).`, c: C.cyan },
        { h: "What Rank 1 costs", big: `${pc(ER.conv["1"][0], 1)} against ${pc(ER.conv["234"][0], 1)}`, b: `Rank 1 turns ${pc(ER.conv["1"][0], 1)} of contacted orders into registrations; Ranks 2–4 turn ${pc(ER.conv["234"][0], 1)} (scorecard weekly chart; the gap is firm: ${n1(ER.conv.gap[1])}–${n1(ER.conv.gap[2])} points). In the last six weeks Rank 1 handled <b>${n0(T3.last.r1)} of every 100</b> contacted orders, against ${n0(T3.pre.r1)} before.`, c: C.pink },
      ]) +
      verdict("How sure is this", `<b>Firm:</b> more leads push contacted orders away from Tier 1 (rank test ${pv(T3.cor.r4_lpd.p)}) and onto Rank 1 (${pv(T3.cor.r1_lpd.p)}); Rank 1 closes less than the other ranks. <b>Leaning, not proven:</b> that keeping the 70 line by itself lifts ROI (${pv(t70.p_roiN)}, and it is the best of ${T3.nscan} cut-offs tried). <b>Not firm:</b> the 35 line taken alone (${pv(t35.p_roiN)}). The weeks that broke the rules were also the weeks leads cost more ($${n2(t70.lo.lc)} against $${n2(t70.hi.lc)}), so 14 weeks cannot separate the two causes. The scorecard's printed pages do not name the reps in Ranks 3 and 4; with that list this becomes a rep-level test.`, true)
    );
    mkChart("trA", { data: { labels: W.map((w) => w.lab), datasets: [
      { type: "line", label: "Tier 1 (Rank 4) of every 100 contacted", data: W.map((w) => w.r4), borderColor: C.emerald, backgroundColor: C.emerald, yAxisID: "y", tension: 0.25, pointRadius: 5, borderWidth: 3, datalabels: dl(C.emerald, (v) => Math.round(v)) },
      { type: "line", label: "Ranks 3–4 of every 100", data: W.map((w) => w.top), borderColor: C.cyan, backgroundColor: C.cyan, yAxisID: "y", tension: 0.25, pointRadius: 4, borderWidth: 2, datalabels: dl(C.cyan, (v) => Math.round(v)) },
      { type: "bar", label: "Leads a day", data: W.map((w) => w.lpd), backgroundColor: W.map((w) => (w.w >= 39 ? "rgba(239,68,68,0.45)" : "rgba(99,102,241,0.35)")), borderRadius: 4, yAxisID: "y1" },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { a: hline(35, "Tier 1 rule: 35", C.emerald), b: hline(70, "Ranks 3–4 rule: 70", C.cyan) } } }, scales: { x: ax("", { grid: { display: false }, ticks: { color: C.textSec, font: { size: 12 }, maxRotation: 50, minRotation: 35 } }), y: ax("Of every 100 contacted orders", { min: 0, max: 100 }), y1: ax("Leads a day", { position: "right", min: 0, max: 240, grid: { drawOnChartArea: false } }) } }) });
    const RL = ["Tier 1 at 35+", "Ranks 3–4 at 70+", "Rank 1 at 15 or less"], TT = [t35, t70, r15];
    mkChart("trB", { type: "bar", data: { labels: RL, datasets: [
      { label: "Weeks that kept the rule", data: TT.map((t) => t.hi.roiN), backgroundColor: C.emerald, borderRadius: 4, datalabels: dl("#fff", (v) => v.toFixed(2) + "x", { anchor: "end", align: "top", font: { size: 14, weight: "700" } }) },
      { label: "Weeks that broke it", data: TT.map((t) => t.lo.roiN), backgroundColor: C.red, borderRadius: 4, datalabels: dl("#fff", (v) => v.toFixed(2) + "x", { anchor: "end", align: "top", font: { size: 14, weight: "700" } }) },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { one: hline(1, "1.00x = media paid back", C.amber) } } }, scales: { x: ax("", { grid: { display: false }, ticks: { color: C.text, font: { size: 13 } } }), y: ax("ROI on new business", { min: 0, max: 1.8, ticks: tk((v) => v.toFixed(1) + "x") }) } }) });
  }

  // ===================== TWO ROIs (new business vs all registrations) =====================
  function rTwo() {
    const B = {}; RO.B.forEach((b) => { B[b.k] = b; });
    const all = B.all, s6 = B.s6, p6 = B.p6, l6 = B.l6, l3 = B.l3, l1 = B.l1, W = RO.wk, LD = RO.lad, SW = RO.sw;
    const gT = RO.gal.reduce((a, g) => ({ rn: a.rn + g.rn, acq: a.acq + g.acq, db: a.db + g.db }), { rn: 0, acq: 0, db: 0 });
    const r85 = LD.find((r) => r.L === 85), r75 = LD.find((r) => r.L === 75), r100 = LD.find((r) => r.L === 100);
    const best = (k) => LD.reduce((a, r) => (r["backN" + k] != null && r["backN" + k] > a["backN" + k] ? r : a), LD[0]);
    const swN = (k) => (SW[k].N ? { v: SW[k].N + " a day", cls: "big" } : { v: `none · best step ${best(k).L} brings back $${n2(best(k)["backN" + k])}`, cls: "no" });
    const rc = (v) => ({ v: xx(v), cls: v >= 1 ? "" : "no" });
    view(
      headline("Two ROIs: new business alone, and everything including the database", `Same two measures as Gal's weekly workbook. ROI · all registrations (mROI) = new plus database registrations ÷ media. ROI · new business (mROI New) = new registrations only ÷ media. Money here is SOV; the workbook uses contract price, which is SOV ÷ 0.8.`) +
      bottom("Bottom line", `Last six weeks: <em class="r">${xx(l6.roiN)} on new business.</em> ${xx(l6.roiT)} with the database.`, `Leads are bought to bring new customers. Database registrations are sold to customers already in the base, so they are not paid for by this week's leads. Over the whole period the leads returned <b>${xx(all.roiT)}</b> with database sales and <b>${xx(all.roiN)}</b> on new business alone. In the summer six it was ${xx(s6.roiT)} and ${xx(s6.roiN)}. In the last three weeks <b class="r">${xx(l3.roiN)}</b>. In 2–8 Nov the team closed ${n0(l1.acq)} new acquisitions and ${n0(l1.regs)} registrations: ${xx(l1.roiT)} in total, <b class="r">${xx(l1.roiN)}</b> on new business. The total hid the fall.`) +
      kpis([
        { label: "ROI · new business · last 6 weeks", value: xx(l6.roiN), sub: `six weeks before <b>${xx(p6.roiN)}</b> · summer <b>${xx(s6.roiN)}</b>. Range ${xx(l6.roiNlo)}–${xx(l6.roiNhi)}`, cls: "accent-red", tag: "e" },
        { label: "ROI · all registrations · last 6 weeks", value: xx(l6.roiT), sub: `six weeks before <b>${xx(p6.roiT)}</b> · summer <b>${xx(s6.roiT)}</b>`, cls: "accent-amber", tag: "e" },
        { label: "Database share of registrations", value: pc(RO.tot.dbs), sub: `about <b>${n0(RO.tot.db)}</b> of ${n0(RO.tot.regs)}. Last six weeks <b>${pc(l6.dbs)}</b> · 2–8 Nov <b>${pc(l1.dbs)}</b>`, tag: "e" },
        { label: "Lead price that pays on new business", value: "$" + n0(r85.beN), sub: `at 85 a day the last 5 leads pay back on first sales only at <b>$${n1(r85.beN)}</b> or less (range $${n0(r85.beNlo)}–$${n0(r85.beNhi)}). With database sales: $${n0(r85.beT)}`, cls: "accent-green", tag: "e" },
      ]) +
      `<div class="charts-grid cols-2">` +
      chartCard("twA", "The two ROIs, week by week", "Green: all registrations ÷ media. Pink: new business only ÷ media. Under the 1.00x line the media was not paid back. Last 18 full weeks.", 420) +
      chartCard("twB", "Who the registrations came from", "Bars: new registrations and database registrations a week. Solid weeks are counted in Gal's workbook; the others are estimated at " + n2(RO.K) + " new registrations per acquisition.", 420) +
      `</div>` +
      dataTable("Both ROIs, block by block", `Weekly averages over full Monday–Sunday weeks. New registrations = acquisitions × ${n2(RO.K)}, the ratio in the five weeks Gal's workbook splits (range ${n2(RO.KLO)}–${n2(RO.KHI)}); those five weeks use the counted figures. New SOV = SOV × new ÷ all registrations, the workbook's own method (one average price per sale).`,
        ["Block", "Leads a day", "New acquisitions a week", "New registrations a week", "Database registrations a week", "Database share", "Media a week", "ROI · all registrations", "ROI · new business", "Range · new business"],
        [all, s6, p6, l6, l3, l1].map((b, i) => [{ v: ["Whole period", "Summer six", "Six before", "Last six", "Last three", "Last week"][i] + `<br><small class="gs">${b.lab} · ${b.n} ${b.n === 1 ? "week" : "weeks"}</small>`, cls: "big" }, n0(b.lpd), n1(b.acq), n1(b.new), n1(b.db), pc(b.dbs), usd(b.cost), { v: xx(b.roiT), cls: "big" }, { v: xx(b.roiN), cls: b.roiN >= 1 ? "big ok" : "big no" }, `${xx(b.roiNlo)}–${xx(b.roiNhi)}`]),
        (i) => (i === 3 ? "hl" : "")) +
      dataTable("The five weeks Gal's workbook splits, as printed", `These are the only weeks where new and database registrations are counted separately. The CRM's “Regs” column is their sum in every one of the five (${RO.gal.map((g) => g.crm_regs).join(", ")}). Workbook mROI is on contract price and the workbook's own spend; the last two columns restate it on SOV with the same spend.`,
        ["Week", "Media (workbook)", "Leads", "Reg New", "Acq", "Reg DB", "Reg New ÷ Acq", "Database share", "Revenue (contract)", "mROI · as printed", "mROI (New) · as printed", "On SOV · all", "On SOV · new"],
        RO.gal.map((g) => [{ v: g.lab, cls: "big" }, usd(g.spend), n0(g.leads), g.rn, g.acq, g.db, n2(g.ratio), pc(g.dbs), usd(g.rev), { v: xx(g.mroi), cls: "big" }, { v: xx(g.mroin), cls: "big" }, xx(g.sovT), rc(g.sovN)])
          .concat([[{ v: "Five weeks", cls: "big" }, usd(RO.gal.reduce((a, g) => a + g.spend, 0)), n0(RO.gal.reduce((a, g) => a + g.leads, 0)), gT.rn, gT.acq, gT.db, n2(gT.rn / gT.acq), pc((gT.db / (gT.rn + gT.db)) * 100), usd(RO.gal.reduce((a, g) => a + g.rev, 0)), "", "", "", ""]]),
        (i) => (i === RO.gal.length ? "tot" : "")) +
      sec("The sweet spot under each ROI") +
      dataTable("Where the last 5 leads still pay for themselves", `The ladder from the Ladder tab, tested twice: on all registrations (${usd(X.SPA)} of SOV per new acquisition) and on new business only (${usd(RO.NPA)}, range ${usd(RO.NPAlo)}–${usd(RO.NPAhi)}).`,
        ["Lead price", "Sweet spot · all registrations", "Sweet spot · new business only", "ROI at 85 a day · all", "ROI at 85 a day · new", "What it means"],
        [[{ v: "$20", cls: "big" }, { v: SW["20"].T + " a day", cls: "big" }, swN("20"), xx(r85.roiT20), rc(r85.roiN20), "Both tests pass at 85. Up to 100 only the database sales pay for the extra leads."],
         [{ v: "$23", cls: "big" }, { v: SW["23"].T + " a day", cls: "big" }, swN("23"), xx(r85.roiT23), rc(r85.roiN23), "New business still covers the media in total, but every extra lead loses a little on first sale."],
         [{ v: "$29.70", cls: "big" }, { v: SW["297"].T + " a day", cls: "big" }, swN("297"), xx(r85.roiT297), rc(r85.roiN297), "New business does not pay back the media at any volume. The price is the problem, not the count."]],
        (i) => (i === 0 ? "hl" : "")) +
      dataTable("Both ROIs at every 5-lead step", "“Last 5 bring back” = SOV added by the last 5 leads a day ÷ their media. “Break-even lead price” = the most a lead can cost for the last 5 to pay for themselves at that step.",
        ["Leads a day", "New acquisitions / month", "ROI all · $20", "ROI new · $20", "Last 5 bring back · all · $20", "Last 5 bring back · new · $20", "ROI all · $23", "ROI new · $23", "ROI all · $29.70", "ROI new · $29.70", "Break-even lead price · all", "Break-even lead price · new"],
        LD.map((r) => [{ v: r.L, cls: "big" }, n1(r.acq), xx(r.roiT20), rc(r.roiN20), { v: "$" + n2(r.backT20), cls: r.backT20 >= 1 ? "ok" : "no" }, { v: "$" + n2(r.backN20), cls: r.backN20 >= 1 ? "ok" : "no" }, xx(r.roiT23), rc(r.roiN23), xx(r.roiT297), rc(r.roiN297), "$" + n1(r.beT), { v: "$" + n1(r.beN), cls: "big" }]),
        (i) => (LD[i].L === 85 || LD[i].L === 75 ? "hl" : "")) +
      ins([
        { h: "Why two ROIs", big: "Leads buy new customers", b: `Total ROI gives this week's leads the credit for sales to the existing database. New-business ROI is the strict test of the lead budget. The truth sits between: today's new customers become next year's database.`, c: C.cyan },
        { h: "What the last six weeks really returned", big: `${xx(l6.roiN)} on new business`, b: `Media went from ${usd(p6.cost)} to <b>${usd(l6.cost)}</b> a week. New registrations went from ${n1(p6.new)} to <b>${n1(l6.new)}</b>. Database registrations rose from ${n1(p6.db)} to ${n1(l6.db)} a week and held total SOV up.`, c: C.red },
        { h: "The lever", big: `$${n0(r85.beN)} a lead, not $30`, b: `At 85 a day the last leads pay back on first sales at <b>$${n1(r85.beN)}</b> a lead or less; at 75 a day, $${n1(r75.beN)}. At 100 a day it would take <b>$${n1(r100.beN)}</b>. The last 30 days cost $${n2(X.last30.cpl)}.`, c: C.amber },
      ]) +
      verdict("What is counted and what is estimated", `<b>Counted:</b> acquisitions, all registrations, SOV and media, every week; the new/database split in five weeks (7 Sep – 11 Oct: ${gT.rn} new, ${gT.db} database, ${gT.acq} acquisitions). <b>Estimated:</b> the split in every other week, at ${n2(RO.K)} new registrations per acquisition. If the true ratio is anywhere between ${n2(RO.KLO)} and ${n2(RO.KHI)}, the last six weeks' new-business ROI is ${xx(l6.roiNlo)}–${xx(l6.roiNhi)}: under 1.00x either way. The by-rep export also holds ${D3.rrow.regs} registrations (${usd(D3.rrow.sov)} SOV) on “R” rows with no calls and no acquisitions, which are database sales by construction. A new/database flag on each registration from the data team would turn every estimate on this tab into a count.`, true)
    );
    mkChart("twA", { type: "line", data: { labels: W.map((w) => w.lab), datasets: [
      { label: "ROI · all registrations", data: W.map((w) => w.roiT), borderColor: C.emerald, backgroundColor: C.emerald, tension: 0.25, pointRadius: 4, borderWidth: 3 },
      { label: "ROI · new business only", data: W.map((w) => w.roiN), borderColor: C.pink, backgroundColor: C.pink, tension: 0.25, pointRadius: 5, borderWidth: 3, datalabels: dl(C.pink, (v) => v.toFixed(2), { align: "bottom", display: (c) => c.chart.width > 420 && (W[c.dataIndex].roiN < 1 || c.dataIndex === 0) }) },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip, annotation: { annotations: { one: hline(1, "1.00x = media paid back", C.amber) } } }, scales: { x: ax("Week from (Monday)", { grid: { display: false }, ticks: { color: C.textSec, font: { size: 12 }, maxRotation: 50, minRotation: 35 } }), y: ax("ROI (SOV ÷ media)", { min: 0, max: 4, ticks: tk((v) => v.toFixed(1) + "x") }) } }) });
    mkChart("twB", { type: "bar", data: { labels: W.map((w) => w.lab), datasets: [
      { label: "New registrations", data: W.map((w) => w.new), backgroundColor: W.map((w) => (w.split ? C.emerald : "rgba(16,185,129,0.45)")), stack: "s" },
      { label: "Database registrations", data: W.map((w) => w.db), backgroundColor: W.map((w) => (w.split ? C.indigo : "rgba(99,102,241,0.45)")), stack: "s", borderRadius: 3, datalabels: dl("#fff", (v, c) => W[c.dataIndex].regs, { anchor: "end", align: "top" }) },
    ] }, options: base({ plugins: { legend: leg, tooltip: tip }, scales: { x: ax("Week from (Monday)", { stacked: true, grid: { display: false }, ticks: { color: C.textSec, font: { size: 12 }, maxRotation: 50, minRotation: 35 } }), y: ax("Registrations a week", { stacked: true, beginAtZero: true, max: 65 }) } }) });
  }

  // ===================== REP BY REP (behaviour) =====================
  function rRepDeep() {
    const RP = D3.reps, now = RP.filter((r) => r.st !== "left"), TM = D3.team, sara = RP.find((r) => r.st === "leaving"), by = (k) => RP.find((r) => r.short === k);
    const levy = by("Levy"), azizi = by("Azizi"), levite = by("Levite"), dm = by("de Montclair"), petit = by("Petit");
    const nws = RP.filter((r) => r.rank === 1), nwC = nws.reduce((a, r) => a + r.cont, 0), nwA = nws.reduce((a, r) => a + r.acq, 0), nwCalls = nws.reduce((a, r) => a + r.calls, 0);
    const t1 = [levy, azizi], t1ac = (t1.reduce((a, r) => a + r.acq, 0) / t1.reduce((a, r) => a + r.cont, 0)) * 100;
    const lw = sara.cw, lossA = lw * (sara.ac - t1ac) / 100 * MO, lossB = lw * (sara.ac - G.new.ac) / 100 * MO, lossC = sara.am;
    const sLeads = lw / CTR, sMed = sLeads * MO * 29.7, sSov = sara.am * sara.spa, sNew = (sara.am * sara.sov * sara.new) / sara.regs / sara.acq;
    const rkc = (r) => (r.st === "left" ? { v: "left", cls: "mut" } : { v: r.rank === 4 ? "4 · Tier 1" : String(r.rank), cls: r.rank === 4 ? "ok" : r.rank === 1 ? "no" : "" });
    const nm = (r) => r.name + (r.st === "leaving" ? ' <span class="pill p-no">Leaving</span>' : "");
    const erc = (e) => (e ? `${n0(e[0])} ${e[0] === 1 ? "call" : "calls"} · ${e[1]} contacted` : "—");
    const WKS = ["Aug week", "31 Aug – 6 Sep", "28 Sep – 4 Oct", "5 – 11 Oct", "2 – 8 Nov"];
    view(
      headline("How does each rep work, and what do they bring?", "Every rep in the CRM by-rep export, 1 Mar – 10 Nov 2026: calls, calls per contacted order, retries, close rate, follow-on registrations, cash, SOV. Next to it, each rep's rows on the Employee Rank scorecard as printed, and their calls week by week from the CEO Performance Suite.") +
      bottom("Bottom line", `<em>Two reps carry the team after Sara: Levy and Azizi.</em>`, `Between them: <b>${pc(levy.sh + azizi.sh)}</b> of all contacted orders and <b>${pc(((levy.acq + azizi.acq) / TM.acq) * 100)}</b> of new acquisitions. Sara Mokla closes <b>${pc(sara.ac, 1)}</b>, the best on the team, and brings about <b>${n1(sara.am)} new acquisitions a month</b>. Levy reaches a contacted order in <b>${n1(levy.cpc)} calls</b>; the three newcomers need <b>${n0(nwCalls / nwC)}</b> and close <b>${pc((nwA / nwC) * 100, 1)}</b>. De Montclair and Levite sell the most to existing customers. Petit closes well but sells one course and stops.`) +
      kpis([
        { label: "Fastest to a contacted order", value: n1(levy.cpc) + " calls", sub: `Levy. Team <b>${n1(TM.cpc)}</b> · newcomers <b>${n0(nwCalls / nwC)}</b>`, cls: "accent-green", tag: "v" },
        { label: "Best close rate", value: pc(sara.ac, 1), sub: `Sara Mokla, leaving. Then Azizi <b>${pc(azizi.ac, 1)}</b> · Petit <b>${pc(petit.ac, 1)}</b>. Team <b>${pc(TM.ac, 1)}</b>`, cls: "accent-red", tag: "v" },
        { label: "Most registrations per acquisition", value: n2(dm.ratio), sub: `de Montclair. Levite <b>${n2(levite.ratio)}</b> · Azizi <b>${n2(azizi.ratio)}</b> · Petit <b>${n2(petit.ratio)}</b>`, tag: "v" },
        { label: "Calls per lead · team", value: n2(TM.cpl), sub: `${n0(TM.calls)} calls ÷ 21,753 leads. By rep it is estimated: leads are not assigned to a rep in any export`, tag: "v" },
      ]) +
      chartCard("rdA", "Speed against close rate, rep by rep", "Left = fewer calls to reach a contacted order. Up = more of those orders closed. Bubble size = contacted orders a week. Green = Tier 1 (assumed), cyan = Rank 3, pink = newcomers, grey = left the team.", 460) +
      dataTable("How each rep works the phone", `Calls a week and contacted a week are whole-period averages over ${n1(G.weeks)} weeks, absences included. Calls per lead by rep = calls per contacted order × the team's ${pc(CTR * 100, 1)} contact rate (estimated). Shifts are not in any export.`,
        ["Rep", "Scorecard rank (assumed)", "Calls", "Calls a week", "Calls per contacted order", "Contacted per 100 calls", "Retries per contacted order", "Calls per lead (est.)", "Contacted orders", "Contacted a week", "Share of team"],
        RP.map((r) => [nm(r), rkc(r), n0(r.calls), n0(r.callw), { v: n1(r.cpc), cls: r.cpc <= 14 ? "ok" : r.cpc >= 25 ? "no" : "" }, n1(r.c100), n1(r.rpc), n1(r.ecpl), n0(r.cont), n1(r.cw), pc(r.sh, 1)])
          .concat([[{ v: "Team total", cls: "big" }, "", n0(TM.calls), n0(TM.calls / G.weeks), n1(TM.cpc), n1(TM.c100), n1(TM.rpc), n2(TM.cpl), n0(TM.cont), n0(TM.cont / G.weeks), "100%"]]),
        (i) => (i === RP.length ? "tot" : RP[i].st === "left" ? "off" : RP[i].st === "leaving" ? "hl" : "")) +
      dataTable("What each rep brings", `New and database registrations by rep are estimated at ${n2(RO.K)} new registrations per acquisition (Two ROIs tab). “R” rows in the export hold another ${D3.rrow.rows.map((x) => `${x.regs} (${x.name})`).join(", ")} registrations with no calls and no acquisitions.`,
        ["Rep", "Close rate", "New acquisitions", "New acquisitions a month", "Registrations", "Registrations per acquisition", "Database registrations (est.)", "% cash", "SOV", "SOV per contacted order", "SOV per call", "SOV per acquisition"],
        RP.map((r) => [nm(r), { v: pc(r.ac, 1), cls: r.ac >= 10 ? "ok" : r.ac < 6.5 ? "no" : "" }, r.acq, n1(r.am), r.regs, { v: n2(r.ratio), cls: r.ratio >= 1.7 ? "ok" : "" }, r.db, pc(r.cash, 1), usd(r.sov), usd(r.spc), "$" + n2(r.spcall), usd(r.spa)])
          .concat([[{ v: "Team total", cls: "big" }, pc(TM.ac, 1), TM.acq, n1((TM.acq / G.weeks) * MO), n0(TM.regs), n2(TM.ratio), RO.tot.db, pc(TM.cash, 1), usd(TM.sov), usd(TM.spc), "$" + n2(TM.spcall), usd(TM.sov / TM.acq)]]),
        (i) => (i === RP.length ? "tot" : RP[i].st === "left" ? "off" : RP[i].st === "leaving" ? "hl" : "")) +
      sec("Rep by rep, in one line each") +
      ins([
        { h: "Levy · Tier 1", big: `${n1(levy.cpc)} calls per contacted order`, b: `Half the team's ${n1(TM.cpc)}. Most contacted orders (<b>${n0(levy.cont)}</b>) and most new acquisitions (<b>${levy.acq}</b>). Close rate ${pc(levy.ac, 1)}, at team average. Few follow-on sales: ${n2(levy.ratio)} registrations per acquisition.`, c: C.emerald },
        { h: "Azizi · Tier 1", big: `${pc(azizi.ac, 1)} close · ${usdK(azizi.sov)} SOV`, b: `Most calls (<b>${n0(azizi.calls)}</b>) and the most SOV on the team. ${n2(azizi.ratio)} registrations per acquisition. No row in the scorecard's Rank 1 or Rank 2 lists.`, c: C.emerald },
        { h: "Mokla · Tier 1 · leaving", big: `${pc(sara.ac, 1)} close rate`, b: `Best closer, fewest retries (<b>${n1(sara.rpc)}</b> per contacted order). Lowest volume of the seniors: ${n0(sara.cw)} contacted orders and ${n0(sara.callw)} calls a week. No calls logged in 2–8 Nov.`, c: C.red },
      ]) +
      ins([
        { h: "Levite · Rank 3", big: `Tier 1 speed, ${pc(levite.ac, 1)} close`, b: `${n1(levite.cpc)} calls per contacted order. Strong on follow-on sales: <b>${n2(levite.ratio)}</b> registrations per acquisition, plus 29 on his “R” row. Logged 89 calls in 5–11 Oct and none in 2–8 Nov.`, c: C.cyan },
        { h: "de Montclair · Rank 3", big: `${n2(dm.ratio)} registrations per acquisition`, b: `The database seller: ${pc(dm.cash, 1)} cash, plus 45 registrations on her “R” row. On new leads she closes <b>${pc(dm.ac, 1)}</b>, the lowest of the seniors. Handled 3 orders in 2–8 Nov against 30–37 in the other weeks (CEO Performance Suite).`, c: C.cyan },
        { h: "Petit · Rank 3", big: `${pc(petit.ac, 1)} close, ${n1(petit.cpc)} calls per order`, b: `Closes like Tier 1 but needs almost three times Levy's calls, and sells one course and stops: <b>${n2(petit.ratio)}</b> registrations per acquisition. ${petit.er1[1]} of her contacted orders on the scorecard sit in Rank 1.`, c: C.amber },
      ]) +
      ins([
        { h: "Lemma, Lacroix, Stefaoui · newcomers", big: `${n0(nwCalls / nwC)} calls per order · ${pc((nwA / nwC) * 100, 1)} close`, b: `<b>${nwA}</b> new acquisitions from ${n0(nwC)} contacted orders and ${n0(nwCalls)} calls between the three (${pc(G.new.ac, 1)} counting a fourth newcomer who has left). In 2–8 Nov they made 57% of the team's calls for 1 acquisition (CEO Performance Suite).`, c: C.pink },
        { h: "Delacroix · left", big: `${pc(by("Delacroix").ac, 1)} close, ${n1(by("Delacroix").cpc)} calls per order`, b: `Carried ${n1(by("Delacroix").cw)} contacted orders a week and closed like the top group. On the scorecard his orders sit in Ranks 1 and 2 (${by("Delacroix").er1[1]} and ${by("Delacroix").er2[1]} contacted). His load has not been replaced.`, c: "#94A3B8" },
        { h: "What the scorecard adds", big: "Speed is what ranks", b: `Rank 4 reaches a contacted order in ${n1(D3.rk[3].cpc)} calls, Rank 1 in ${n1(D3.rk[0].cpc)}. Close rate by itself does not separate the ranks; calls per contacted order does. That is why Petit and Delacroix close well and still sit low.`, c: C.indigo },
      ]) +
      sec("Sara Mokla is leaving · what it costs and how to cover it") +
      dataTable("Three ways to handle her 19 contacted orders a week", `She carries ${n1(lw)} contacted orders a week (${n0(sLeads)} leads) and closes ${pc(sara.ac, 1)}: ${n1(sara.am)} new acquisitions a month. At $29.70 her leads cost about ${usd(sMed)} a month and bring ${usd(sSov)} of SOV (${xx(sSov / sMed)}), of which about ${usd(sNew)} is new business (${xx(sNew / sMed)}).`,
        ["Option", "Leads a day", "Who takes her orders", "Close rate on those orders", "New acquisitions lost a month", "What to watch"],
        [[{ v: "Buy fewer leads", cls: "big" }, { v: String(PT0().L5), cls: "big" }, "Nobody. Her leads are not bought.", "—", { v: n1(lossC), cls: "no" }, `Her own leads are ${n0(sLeads / 7)} a day, about ${usd(sMed)} of media a month. In 5-lead steps the plan goes from ${PTS().L5} to ${PT0().L5}. Every other rep keeps their normal load.`],
         [{ v: "Keep buying, Tier 1 absorbs", cls: "big" }, String(PTS().L5), "Levy and Azizi, +25% each", pc(t1ac, 1), { v: n1(lossA), cls: "" }, "Only works if they have the hours. No shift log to confirm it."],
         [{ v: "Keep buying, newcomers absorb", cls: "big" }, String(PTS().L5), "Lemma, Lacroix, Stefaoui", pc(G.new.ac, 1), { v: n1(lossB), cls: "no" }, "Same media bill, most of her sales gone. In 2–8 Nov she logged no calls and newcomers handled 42 contacted orders (CEO Performance Suite)."]],
        (i) => (i === 0 ? "hl" : "")) +
      `<div class="charts-grid cols-2">` +
      dataTable("Scorecard rows, as printed", "Employee Rank · French, Jan–Nov 2026. The printed pages name reps for Rank 1 and for Rank 2 up to Levite (alphabetical); Ranks 3 and 4 are totals only. “Not printed” = the rep's name falls after the cut.",
        ["Rep", "Rank 1 row", "Rank 2 row", "Reading"],
        now.concat([by("Delacroix")]).map((r) => [r.name, erc(r.er1), r.er2 ? erc(r.er2) : r.er2cut ? { v: "not printed", cls: "mut" } : "—",
          r.short === "Azizi" ? "No Rank 1 or 2 row: Ranks 3–4 all year" : r.short === "Levy" ? "1 call in Rank 1: top ranks all year" : r.short === "Mokla" ? "22 orders in Rank 1 of 694 in the CRM" : r.short === "Levite" ? "139 orders in Ranks 1–2 of 913" : r.short === "de Montclair" ? "184 orders in Ranks 1–2 of 992" : r.short === "Petit" ? "213 orders in Rank 1 of 647" : r.short === "Delacroix" ? "All of his orders in Ranks 1–2" : "Rank 1"])) +
      dataTable("Calls a week, top closers", "CEO Performance Suite · French tab, the five weeks it covers (the suite labels its first one “Aug week”). 0 = no calls logged that week.",
        ["Rep"].concat(WKS),
        RP.filter((r) => r.suite).map((r) => [nm(r)].concat(r.suite.map((v) => (v < 100 ? { v: String(v), cls: "no" } : n0(v)))))
          .concat([[{ v: "Whole team", cls: "big" }].concat(D3.suite.calls.map((v) => n0(v))), [{ v: "Reps who logged calls", cls: "big" }].concat(D3.suite.reps.map(String))]),
        (i) => (i >= RP.filter((r) => r.suite).length ? "tot" : "")) +
      `</div>` +
      verdict("What the exports do not hold", `<b>Shifts and hours:</b> no file has them, so “per shift” anywhere on this site is leads a week ÷ the shifts you enter on the Team Today tab. <b>Leads by rep:</b> leads are not assigned to a rep in any export, so calls per lead by rep is an estimate; calls per contacted order is counted. <b>Rep by week:</b> only the five CEO Suite weeks. <b>Ranks 3 and 4 by name:</b> not on the scorecard's printed pages, so the ranks here are a reading of the printed rows and can be changed on the Team Today tab.`, true)
    );
    const col = (r) => (r.st === "left" ? "rgba(148,163,184,0.55)" : r.rank === 4 ? C.emerald : r.rank === 3 ? C.cyan : C.pink);
    mkChart("rdA", { type: "bubble", data: { datasets: [{ label: "Reps", data: RP.map((r) => ({ x: r.cpc, y: r.ac, r: Math.max(6, Math.sqrt(r.cw) * 4.2), n: r.short })), backgroundColor: RP.map((r) => col(r)), borderColor: "rgba(15,23,42,0.9)", borderWidth: 1,
      datalabels: { display: true, color: "#F1F5F9", font: { size: 12, weight: "700" }, align: (c) => ({ Petit: "left", Delacroix: "right", Levite: "bottom", Azizi: "right", Mokla: "left", Levy: "left" }[c.dataset.data[c.dataIndex].n] || "top"), offset: 8, formatter: (v) => v.n } }] },
      options: base({ plugins: { legend: { display: false }, tooltip: Object.assign({}, tip, { callbacks: { label: (c) => `${c.raw.n}: ${c.raw.x} calls per contacted, ${c.raw.y}% close` } }), annotation: { annotations: { a: hline(TM.ac, "Team close rate " + n1(TM.ac) + "%", C.amber), b: vline(TM.cpc, "Team " + n1(TM.cpc) + " calls", C.textSec) } } },
        scales: { x: ax("Calls per contacted order (fewer is faster)", { min: 0, max: 45 }), y: ax("Close rate · acquisitions ÷ contacted", { min: 0, max: 14, ticks: tk((v) => v + "%") }) } }) });
  }

  const VIEWS = { overview: rOverview, team: rTeam, tier: rTier, two: rTwo, decline: rDecline, ladder: rLadder, calls: rCalls, weekly: rWeekly, golden: rGolden, rank: rRank, reps: rRepDeep, roi: rRoi, mix: rMix, method: rMethod };
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
