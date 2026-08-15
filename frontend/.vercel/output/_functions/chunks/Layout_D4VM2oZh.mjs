import { t as createComponent } from "./compiler_qaW5CanQ.mjs";
import { T as createAstro, _ as addAttribute, c as renderSlot, d as renderTemplate, g as renderHead, i as renderComponent, v as createRenderInstruction } from "./server_ByxJykQl.mjs";
//#region ../node_modules/astro/dist/runtime/server/render/script.js
async function renderScript(result, id) {
	const inlined = result.inlinedScripts.get(id);
	let content = "";
	if (inlined != null) {
		if (inlined) content = `<script type="module">${inlined}<\/script>`;
	} else {
		const resolved = await result.resolve(id);
		content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
	}
	return createRenderInstruction({
		type: "script",
		id,
		content
	});
}
//#endregion
//#region ../node_modules/astro/components/ClientRouter.astro
createAstro("https://motorsport-platform.com");
var $$ClientRouter = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ClientRouter;
	const { fallback = "animate" } = Astro.props;
	return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>${renderScript($$result, "C:/Users/Admin/Documents/Calender Race/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Admin/Documents/Calender Race/node_modules/astro/components/ClientRouter.astro", void 0);
//#endregion
//#region src/layouts/Layout.astro
createAstro("https://motorsport-platform.com");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Layout;
	const { title, description = "Real-Time Formula 1 & MotoGP Schedule Platform" } = Astro.props;
	const pathname = Astro.url.pathname;
	const isF1 = pathname.startsWith("/f1");
	const isMotoGP = pathname.startsWith("/motogp");
	const isStandings = pathname.endsWith("standings") || pathname.endsWith("standings/");
	const isCalendar = !isStandings && (isF1 || isMotoGP);
	const accentColor = isF1 ? "text-f1-red border-f1-red" : isMotoGP ? "text-motogp-blue border-motogp-blue" : "text-text-primary border-text-primary";
	const basePath = isF1 ? "/f1" : isMotoGP ? "/motogp" : "";
	return renderTemplate`<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} | Motorsport</title><meta name="description"${addAttribute(description, "content")}><meta name="theme-color" content="#ffffff"><!-- SEO and Social tags --><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:type" content="website"><script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Motorsport Platform",
        "url": "https://motorsport-platform.com/"
      }
    <\/script><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/pwa-192x192.png"><link rel="manifest" href="/manifest.webmanifest"><!-- Google Fonts: Outfit (Headings) & Inter (Data/Body) --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;700;900&display=swap" rel="stylesheet">${renderComponent($$result, "ClientRouter", $$ClientRouter, {})}${renderHead($$result)}</head><body class="min-h-screen flex flex-col bg-surface-50 text-text-primary selection:bg-black selection:text-white pb-24 md:pb-0"><!-- Top Navbar --><nav class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-editorial"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"><div class="flex items-center space-x-8"><a href="/" class="text-xl font-bold tracking-tighter uppercase font-heading hover:opacity-70 transition-opacity">Motorsport</a><!-- Desktop Series Links --><div class="hidden md:flex items-center space-x-1"><a href="/f1"${addAttribute(`px-3 py-1.5 text-xs uppercase tracking-widest font-bold rounded-sm transition-colors ${isF1 ? "bg-text-primary text-white" : "text-text-secondary hover:text-text-primary"}`, "class")}>F1</a><a href="/motogp"${addAttribute(`px-3 py-1.5 text-xs uppercase tracking-widest font-bold rounded-sm transition-colors ${isMotoGP ? "bg-text-primary text-white" : "text-text-secondary hover:text-text-primary"}`, "class")}>MotoGP</a></div></div><!-- Contextual Links (Calendar/Standings) -->${(isF1 || isMotoGP) && renderTemplate`<div class="flex items-center space-x-4 sm:space-x-6 h-full"><a${addAttribute(basePath, "href")}${addAttribute(`text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-colors h-full flex items-center border-b-2 ${isCalendar ? accentColor : "text-text-secondary border-transparent hover:text-text-primary"}`, "class")}>Calendar</a><a${addAttribute(`${basePath}/standings`, "href")}${addAttribute(`text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-colors h-full flex items-center border-b-2 ${isStandings ? accentColor : "text-text-secondary border-transparent hover:text-text-primary"}`, "class")}>Standings</a></div>`}</div></nav><!-- Mobile Floating Bottom Navbar --><nav class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-black/10 shadow-2xl rounded-full px-6 py-4 flex items-center justify-around md:hidden"><a href="/" class="flex flex-col items-center group"><svg${addAttribute(`w-5 h-5 mb-1 ${pathname === "/" ? "text-black" : "text-text-tertiary group-hover:text-black"}`, "class")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg><span${addAttribute(`text-[10px] uppercase tracking-widest font-bold ${pathname === "/" ? "text-black" : "text-text-tertiary group-hover:text-black"}`, "class")}>Home</span></a><a href="/f1" class="flex flex-col items-center group"><svg${addAttribute(`w-5 h-5 mb-1 ${isF1 ? "text-f1-red" : "text-text-tertiary group-hover:text-f1-red"}`, "class")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg><span${addAttribute(`text-[10px] uppercase tracking-widest font-bold ${isF1 ? "text-f1-red" : "text-text-tertiary group-hover:text-f1-red"}`, "class")}>F1</span></a><a href="/motogp" class="flex flex-col items-center group"><svg${addAttribute(`w-5 h-5 mb-1 ${isMotoGP ? "text-motogp-blue" : "text-text-tertiary group-hover:text-motogp-blue"}`, "class")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg><span${addAttribute(`text-[10px] uppercase tracking-widest font-bold ${isMotoGP ? "text-motogp-blue" : "text-text-tertiary group-hover:text-motogp-blue"}`, "class")}>MotoGP</span></a></nav><main class="flex-grow bg-surface-50">${renderSlot($$result, $$slots["default"])}</main><footer class="bg-surface-50 border-t border-editorial py-16 mt-20"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center"><span class="text-2xl font-bold tracking-tighter uppercase font-heading block mb-2">Motorsport</span><p class="text-xs text-text-secondary tracking-widest uppercase">Precision Real-Time Data</p></div></footer></body></html>`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/layouts/Layout.astro", void 0);
//#endregion
export { $$Layout as t };
