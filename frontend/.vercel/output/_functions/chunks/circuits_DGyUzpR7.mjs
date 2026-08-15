import { n as __exportAll, t as createComponent } from "./compiler_qaW5CanQ.mjs";
import { d as renderTemplate, h as maybeRenderHead, i as renderComponent } from "./server_ByxJykQl.mjs";
import { t as $$Layout } from "./Layout_D4VM2oZh.mjs";
//#region src/pages/circuits.astro
var circuits_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Circuits,
	file: () => $$file,
	url: () => $$url
});
var $$Circuits = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Circuit Explorer",
		"description": "Explore all Motorsport circuits"
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="bg-surface-50 min-h-screen py-16"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="mb-12"><h1 class="text-4xl md:text-5xl font-black tracking-tighter mb-2">Circuit Explorer</h1><p class="text-gray-500 text-lg">Detailed information on every track</p></div><div class="glass-panel p-8 rounded-3xl text-center"><p class="text-gray-500">Live circuit directory integration coming soon...</p></div></div></div>` })}`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/circuits.astro", void 0);
var $$file = "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/circuits.astro";
var $$url = "/circuits";
//#endregion
//#region \0virtual:astro:page:src/pages/circuits@_@astro
var page = () => circuits_exports;
//#endregion
export { page };
