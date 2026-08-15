import { n as __exportAll, t as createComponent } from "./compiler_qaW5CanQ.mjs";
import { d as renderTemplate, h as maybeRenderHead, i as renderComponent } from "./server_ByxJykQl.mjs";
import { t as $$Layout } from "./Layout_D4VM2oZh.mjs";
//#region src/pages/drivers.astro
var drivers_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Drivers,
	file: () => $$file,
	url: () => $$url
});
var $$Drivers = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Drivers Directory",
		"description": "Motorsport drivers directory"
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="bg-surface-50 min-h-screen py-16"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="mb-12"><h1 class="text-4xl md:text-5xl font-black tracking-tighter mb-2">Drivers</h1><p class="text-gray-500 text-lg">Current F1 and MotoGP roster</p></div><div class="glass-panel p-8 rounded-3xl text-center"><p class="text-gray-500">Drivers directory coming soon...</p></div></div></div>` })}`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/drivers.astro", void 0);
var $$file = "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/drivers.astro";
var $$url = "/drivers";
//#endregion
//#region \0virtual:astro:page:src/pages/drivers@_@astro
var page = () => drivers_exports;
//#endregion
export { page };
