import { n as __exportAll, t as createComponent } from "./compiler_qaW5CanQ.mjs";
import { d as renderTemplate, h as maybeRenderHead, i as renderComponent } from "./server_ByxJykQl.mjs";
import { t as $$Layout } from "./Layout_D4VM2oZh.mjs";
//#region src/pages/standings.astro
var standings_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Standings,
	file: () => $$file,
	url: () => $$url
});
var $$Standings = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Standings",
		"description": "Current Championship Standings"
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="bg-surface-50 min-h-screen py-16"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="mb-12"><h1 class="text-4xl md:text-5xl font-black tracking-tighter mb-2">Standings</h1><p class="text-gray-500 text-lg">Championship rankings</p></div><div class="glass-panel p-8 rounded-3xl text-center"><p class="text-gray-500">Live standings integration coming soon...</p></div></div></div>` })}`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/standings.astro", void 0);
var $$file = "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/standings.astro";
var $$url = "/standings";
//#endregion
//#region \0virtual:astro:page:src/pages/standings@_@astro
var page = () => standings_exports;
//#endregion
export { page };
