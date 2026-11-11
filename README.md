# French Atelier · Lead Sweet Spot

Ten-tab executive dashboard for the French Atelier sales team, in the CEO Performance Suite design. Contains internal CRM data (rep names, revenue, media cost); published publicly at the owner's request, marked noindex.

- `index.html` — shell and navigation. Tabs: Strategic Overview, Lead Ladder, Calls per Lead, Weekly Proof, Golden Rule, Employee Rank, Reps & Seniority, ROI Scenarios, New vs Add-on, Data & Method.
- `app.js` — renders every tab. `fa_data.js` — precomputed figures from the CRM pivots (1 Mar – 10 Nov 2026), media-cost exports and the data team's Employee Rank scorecard (French, 1 Jan – 10 Nov 2026).
- `styles.css` — CEO Performance Suite stylesheet. `fa.css` — larger type and page-specific components.
- `rank.html` — redirect to the Employee Rank tab.

Static site, no build step. Design reference: `gitteromri-ux/ceo-performance-suite` (not modified).
