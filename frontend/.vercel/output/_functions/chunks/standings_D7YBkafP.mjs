import { n as __exportAll, t as createComponent } from "./compiler_qaW5CanQ.mjs";
import { d as renderTemplate, h as maybeRenderHead, i as renderComponent } from "./server_ByxJykQl.mjs";
import { t as $$Layout } from "./Layout_CX4g7U75.mjs";
import { t as API_URL } from "./api_DbqcXWAY.mjs";
import { t as $$ChampionshipTable } from "./ChampionshipTable_DhSphpSq.mjs";
//#region src/pages/motogp/standings.astro
var standings_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Standings,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
var $$Standings = createComponent(async ($$result, $$props, $$slots) => {
	let standingsData = null;
	let error = null;
	try {
		const res = await fetch(`${API_URL}/api/motogp/standings`);
		if (res.ok) standingsData = await res.json();
		else error = "Standings data is temporarily unavailable.";
	} catch (e) {
		console.error("Failed to fetch MotoGP standings", e);
		error = "Championship data temporarily unavailable.";
	}
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "MotoGP Riders Championship" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-editorial animate-fade-up"><div class="flex items-center space-x-3 mb-6"><span class="text-motogp-blue font-bold text-sm tracking-widest uppercase font-sans">MotoGP</span><span class="w-1 h-1 bg-surface-800 rounded-full"></span><span class="text-text-secondary text-sm tracking-widest uppercase font-sans">2026</span></div><h1 class="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-text-primary">Riders<br>Championship</h1></div>${error ? renderTemplate`<div class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-up"><p class="text-xl text-text-secondary font-heading tracking-wide uppercase">${error}</p></div>` : standingsData && standingsData.drivers && standingsData.drivers.length > 0 ? renderTemplate`<div class="py-8">${renderComponent($$result, "ChampionshipTable", $$ChampionshipTable, {
		"title": "",
		"standings": standingsData.drivers,
		"accentColorClass": "text-motogp-blue"
	})}</div>` : renderTemplate`<div class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-up"><p class="text-xl text-text-secondary font-heading tracking-wide uppercase">No championship data available yet.</p></div>`}` })}`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/motogp/standings.astro", void 0);
var $$file = "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/motogp/standings.astro";
var $$url = "/motogp/standings";
//#endregion
//#region \0virtual:astro:page:src/pages/motogp/standings@_@astro
var page = () => standings_exports;
//#endregion
export { page };
