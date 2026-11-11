# French Atelier · Lead Sweet Spot

Fourteen-tab executive dashboard for the French Atelier sales team, in the CEO Performance Suite design. Contains internal CRM data (rep names, revenue, media cost); published publicly at the owner's request, marked noindex.

- `index.html` — shell and navigation. Tabs: Strategic Overview, Team Today (rep-by-rep lead plan by scorecard rank, shifts and lead price; Sara Mokla excluded by default), Tier Rule (35 of 100 contacted orders from Tier 1, 70 from Ranks 3–4, tested on 14 scorecard weeks), Two ROIs (new business only vs all registrations including database), Last 6 Weeks, Lead Ladder, Calls per Lead, Weekly Proof, Golden Rule · CRM, Employee Rank, Rep by Rep (calls per contacted order, retries, close rate, follow-on sales, scorecard rows, weekly calls), ROI Scenarios, First vs Follow-on, Data & Method.
- `app.js` — renders every tab. `fa_data3.js` — two-ROI blocks and ladder, tier-rule tests, capacity per scorecard rank, rep profiles. `fa_data2.js` — six-week blocks and weekly series. `fa_data.js` — precomputed figures from the CRM pivots (1 Mar – 10 Nov 2026), media-cost exports and the data team's Employee Rank scorecard (French, 1 Jan – 10 Nov 2026).
- New/database registration split: counted for the five weeks in the weekly funnel workbook (7 Sep – 11 Oct 2026), estimated elsewhere at 1.11 new registrations per acquisition (range 1.00–1.20). Rep ranks on Team Today are a reading of the scorecard's printed rows and are editable on the page.
- `styles.css` — CEO Performance Suite stylesheet. `fa.css` — larger type and page-specific components.
- `rank.html` — redirect to the Employee Rank tab.

Static site, no build step. Design reference: `gitteromri-ux/ceo-performance-suite` (not modified).
