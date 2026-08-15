import { n as __exportAll, t as createComponent } from "./compiler_qaW5CanQ.mjs";
import { _ as addAttribute, d as renderTemplate, h as maybeRenderHead, i as renderComponent } from "./server_ByxJykQl.mjs";
import { t as $$Layout } from "./Layout_CX4g7U75.mjs";
import { t as API_URL } from "./api_DbqcXWAY.mjs";
import { n as formatEventDay, r as formatEventMonth } from "./timeUtils_Dpgyzh4E.mjs";
import { t as ChampionshipSwitcher } from "./ChampionshipSwitcher_Cxx_7z1n.mjs";
//#region src/pages/f1.astro
var f1_exports = /* @__PURE__ */ __exportAll({
	default: () => $$F1,
	file: () => $$file,
	url: () => "/f1"
});
var $$F1 = createComponent(async ($$result, $$props, $$slots) => {
	let calendar = [];
	let error = null;
	let currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	try {
		const res = await fetch(`${API_URL}/api/f1/calendar`);
		if (res.ok) calendar = await res.json();
		else error = "Failed to load the Formula 1 calendar.";
	} catch (e) {
		console.error("Failed to fetch F1 calendar", e);
		error = "Live schedule is temporarily unavailable.";
	}
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Formula 1 Calendar",
		"description": "Complete Formula 1 race calendar and schedules"
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="min-h-screen pt-24 pb-32 bg-surface-50"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><!-- Header --><div class="flex flex-col md:flex-row md:items-end justify-between mb-24 animate-fade-up"><div><div class="mb-8">${renderComponent($$result, "ChampionshipSwitcher", ChampionshipSwitcher, {
		"client:load": true,
		"current": "f1",
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/Admin/Documents/Calender Race/frontend/src/components/ChampionshipSwitcher.svelte",
		"client:component-export": "default"
	})}</div><h1 class="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-4 text-text-primary leading-none">Formula 1</h1><p class="text-text-secondary text-xl font-heading tracking-wide uppercase">${currentYear} Season Calendar</p></div></div>${error ? renderTemplate`<div class="glass-panel border-red-500/30 text-red-500 px-6 py-4 rounded animate-fade-up">${error}</div>` : renderTemplate`<div class="relative border-l border-editorial ml-4 md:ml-12">${calendar.map((event, index) => {
		const raceSession = event.sessions.find((s) => s.type === "Race");
		const isFinished = raceSession?.status === "FINISHED";
		const isCancelled = event.status === "CANCELLED";
		const isRescheduled = event.status === "RESCHEDULED";
		const isUnderReview = event.status === "UNDER_REVIEW";
		if (!raceSession && !isCancelled) return null;
		let month = "TBD";
		let day = "--";
		try {
			if (raceSession) {
				month = formatEventMonth(raceSession.startDate);
				day = formatEventDay(raceSession.startDate);
			}
		} catch (e) {
			console.error("Format error on calendar card:", e);
		}
		const cardOpacity = isFinished || isCancelled ? "opacity-60 hover:opacity-100" : "opacity-100";
		return renderTemplate`<a${addAttribute(`/f1/${event.id}`, "href")}${addAttribute(`block group relative pl-8 md:pl-16 py-12 border-b border-editorial animate-fade-up ${cardOpacity} transition-opacity duration-300`, "class")}${addAttribute(`animation-delay: ${index * 50}ms;`, "style")}><!-- Timeline Marker --><div class="absolute left-0 top-16 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-editorial group-hover:border-f1-red transition-colors duration-300"><div class="absolute inset-[3px] bg-transparent rounded-full group-hover:bg-f1-red transition-colors duration-300"></div></div><div class="flex flex-col md:flex-row gap-8"><!-- Date Block --><div class="flex flex-col min-w-[100px] shrink-0"><span class="text-xs font-bold text-f1-red uppercase tracking-widest mb-2 font-sans">Round ${event.round}</span><span${addAttribute(`text-5xl font-bold tracking-tighter tabular-nums font-sans leading-none transition-colors duration-300 ${isCancelled ? "line-through decoration-red-500/50" : "text-text-primary"}`, "class")}>${day}</span><span class="text-lg font-bold text-text-tertiary tracking-widest uppercase mt-1 font-sans">${month}</span></div><!-- Info Block --><div class="flex flex-col justify-center w-full"><div class="flex items-center flex-wrap gap-3 mb-2"><h2${addAttribute(`text-3xl md:text-5xl font-black tracking-tighter uppercase transition-colors ${isCancelled ? "line-through text-text-secondary decoration-red-500/50" : "text-text-primary"}`, "class")}>${event.name}</h2>${isFinished && !isCancelled && renderTemplate`<span class="px-2 py-0.5 border border-f1-red/20 text-f1-red text-[10px] uppercase tracking-widest font-bold bg-f1-red/5 rounded ml-2">Result</span>`}${!isFinished && !isCancelled && !isUnderReview && renderTemplate`<span class="px-2 py-0.5 border border-editorial text-text-secondary text-[10px] uppercase tracking-widest font-bold bg-surface-100 rounded ml-2">Upcoming</span>`}${isCancelled && renderTemplate`<span class="px-2 py-0.5 border border-red-500/30 text-red-500 text-[10px] uppercase tracking-widest font-bold bg-red-500/10 rounded">Cancelled</span>`}${isRescheduled && renderTemplate`<span class="px-2 py-0.5 border border-amber-500/30 text-amber-500 text-[10px] uppercase tracking-widest font-bold bg-amber-500/10 rounded">Rescheduled</span>`}${isUnderReview && renderTemplate`<span class="px-2 py-0.5 border border-editorial text-text-secondary text-[10px] uppercase tracking-widest font-bold bg-surface-100 rounded">Under Review</span>`}</div><div class="flex flex-col space-y-1"><span${addAttribute(`text-lg font-light text-text-secondary uppercase tracking-widest font-heading ${isCancelled ? "line-through" : ""}`, "class")}>${event.circuit}</span><span${addAttribute(`text-sm font-bold text-text-tertiary uppercase tracking-widest font-sans ${isCancelled ? "line-through" : ""}`, "class")}>${event.country || "Location"}</span>${isRescheduled && event.originalDate && renderTemplate`<span class="text-[10px] text-text-tertiary font-sans mt-2">Originally scheduled: ${event.originalDate}</span>`}</div></div></div></a>`;
	})}</div>`}</div></div>` })}`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/f1.astro", void 0);
var $$file = "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/f1.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/f1@_@astro
var page = () => f1_exports;
//#endregion
export { page };
