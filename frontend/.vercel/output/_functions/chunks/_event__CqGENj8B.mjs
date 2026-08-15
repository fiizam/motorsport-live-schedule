import { n as __exportAll, t as createComponent } from "./compiler_qaW5CanQ.mjs";
import { T as createAstro, _ as addAttribute, a as Fragment, d as renderTemplate, h as maybeRenderHead, i as renderComponent } from "./server_ByxJykQl.mjs";
import { t as $$Layout } from "./Layout_CX4g7U75.mjs";
import { t as API_URL } from "./api_DbqcXWAY.mjs";
import { t as LiveCountdown } from "./LiveCountdown_BuYyP3wj.mjs";
import { i as LiveIndicator, n as $$ClassificationTable, r as $$RaceWinner, t as ClassificationTabs } from "./ClassificationTabs_5AbvXSAZ.mjs";
import { t as $$ChampionshipTable } from "./ChampionshipTable_DhSphpSq.mjs";
import { a as formatEventWeekday, i as formatEventTime, o as formatRaceWeekendRange, t as formatEventDateShort } from "./timeUtils_Dpgyzh4E.mjs";
//#region src/pages/f1/[event].astro
var _event__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Event,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://motorsport-platform.com");
var $$Event = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Event;
	const { event: round } = Astro.params;
	let eventData = null;
	let targetDate = null;
	let error = null;
	let weekendDates = "TBD";
	let championshipStandings = null;
	try {
		const res = await fetch(`${API_URL}/api/f1/event/${round}`);
		if (res.ok) {
			eventData = await res.json();
			const nextSession = eventData.sessions.find((s) => s.status !== "FINISHED");
			if (nextSession) targetDate = nextSession.startDate;
			try {
				weekendDates = formatRaceWeekendRange(eventData.sessions);
			} catch (e) {
				console.error("Failed to parse weekend dates:", e);
			}
			if (eventData.raceResult && eventData.raceResult.status === "FINISHED") try {
				const standingsRes = await fetch(`${API_URL}/api/f1/standings`);
				if (standingsRes.ok) championshipStandings = await standingsRes.json();
			} catch (e) {
				console.error("Failed to fetch F1 standings", e);
			}
		} else error = "Event not found.";
	} catch (e) {
		console.error("Failed to fetch F1 event", e);
		error = "Live schedule is temporarily unavailable.";
	}
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": eventData ? eventData.name : "Event Not Found" }, { "default": ($$result) => renderTemplate`${error ? renderTemplate`${maybeRenderHead($$result)}<div class="min-h-[80vh] flex items-center justify-center px-4 animate-fade-up"><div class="glass-panel border-red-500/30 text-red-500 px-8 py-6 rounded-3xl max-w-lg text-center"><h1 class="text-2xl font-bold mb-2 font-heading tracking-tight uppercase text-text-primary">Error</h1><p class="font-sans text-sm">${error}</p><a href="/f1" class="mt-8 inline-block border-b border-black/20 pb-1 text-sm font-bold uppercase tracking-widest hover:border-black transition-colors text-text-primary">Return to Calendar</a></div></div>` : eventData ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<!-- Race Control Hero --><section class="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-editorial"><div class="flex flex-col animate-fade-up"><div class="flex items-center space-x-3 mb-4"><span class="text-f1-red font-bold text-sm tracking-widest uppercase font-sans">Round ${eventData.round}</span><span class="w-1 h-1 bg-surface-800 rounded-full"></span><span class="text-text-secondary text-sm tracking-widest uppercase font-sans">${weekendDates}</span></div><h1 class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase mb-6 text-text-primary max-w-[1000px] break-words">${eventData.name}</h1><div class="flex flex-col space-y-2 mb-12"><span class="text-xl md:text-2xl font-light text-text-secondary tracking-wide uppercase font-heading">${eventData.circuit}</span><span class="text-lg text-text-tertiary tracking-widest uppercase font-sans">${eventData.country || "Location"}</span></div><!-- Status Box -->${eventData.status === "CANCELLED" && renderTemplate`<div class="mb-12 inline-block border border-red-500/30 bg-red-500/10 text-red-500 px-4 py-2 rounded"><span class="text-sm font-bold uppercase tracking-widest">Event Cancelled</span><p class="text-[10px] uppercase font-sans mt-1 opacity-80">No replacement date confirmed.</p></div>`}${eventData.status === "RESCHEDULED" && renderTemplate`<div class="mb-12 inline-block border border-amber-500/30 bg-amber-500/10 text-amber-600 px-4 py-2 rounded"><span class="text-sm font-bold uppercase tracking-widest">Rescheduled</span>${eventData.originalDate && renderTemplate`<p class="text-[10px] uppercase font-sans mt-1 opacity-80">Originally scheduled: ${eventData.originalDate}</p>`}</div>`}${eventData.status === "UNDER_REVIEW" && renderTemplate`<div class="mb-12 inline-block border border-editorial bg-surface-100 text-text-secondary px-4 py-2 rounded"><span class="text-sm font-bold uppercase tracking-widest">Under Review</span><p class="text-[10px] uppercase font-sans mt-1 opacity-80">Schedule subject to confirmation.</p></div>`}<div class="w-full flex justify-start"><!-- Real-Time SSE Countdown Island -->${targetDate && eventData.status !== "CANCELLED" && eventData.status !== "UNDER_REVIEW" && eventData.status !== "TBC" && renderTemplate`${renderComponent($$result, "LiveCountdown", LiveCountdown, {
		"client:load": true,
		"targetDate": targetDate,
		"colorClass": "text-f1-red",
		"compact": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/Admin/Documents/Calender Race/frontend/src/components/LiveCountdown.svelte",
		"client:component-export": "default"
	})}`}</div></div></section><!-- Editorial Session Timeline -->${eventData.status !== "CANCELLED" && renderTemplate`<section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="mb-12 animate-fade-up"><h2 class="text-2xl md:text-3xl font-bold tracking-tighter uppercase mb-2 text-text-primary">Race Weekend</h2></div><div class="flex flex-col relative space-y-4">${eventData.sessions.map((session, index) => {
		let dayStr = "TBD";
		let dateStr = "--";
		let timeStr = "--:--";
		try {
			dayStr = formatEventWeekday(session.startDate);
			dateStr = formatEventDateShort(session.startDate);
			timeStr = formatEventTime(session.startDate);
		} catch (e) {
			console.error("Date format error for session:", session.name);
		}
		const isLive = session.status === "LIVE";
		const isFinished = session.status === "FINISHED";
		return renderTemplate`<div${addAttribute(`flex items-center justify-between py-4 border-b border-editorial group animate-fade-up ${isFinished ? "opacity-50" : "opacity-100"}`, "class")}${addAttribute(`animation-delay: ${50 + index * 50}ms;`, "style")}><div class="flex items-center gap-6 md:gap-12 w-full"><div class="w-[100px] md:w-[120px] flex flex-col"><span class="text-xs text-text-tertiary tracking-widest uppercase font-sans">${dayStr} ${dateStr}</span></div><div class="flex-grow flex flex-col md:flex-row md:items-center justify-between"><span class="text-lg md:text-xl font-bold tracking-tighter uppercase transition-colors text-text-primary group-hover:opacity-70">${session.name}</span><div class="flex items-center space-x-6"><span class="text-lg font-medium tracking-tighter tabular-nums font-sans text-text-primary">${timeStr} WIB</span><div class="w-[80px] flex justify-end">${isFinished ? renderTemplate`<span class="text-[10px] font-bold tracking-widest uppercase text-text-tertiary">Finished</span>` : isLive ? renderTemplate`${renderComponent($$result, "LiveIndicator", LiveIndicator, {
			"client:load": true,
			"colorClass": "bg-f1-red",
			"client:component-hydration": "load",
			"client:component-path": "C:/Users/Admin/Documents/Calender Race/frontend/src/components/LiveIndicator.svelte",
			"client:component-export": "default"
		})}` : renderTemplate`<span class="text-[10px] font-bold tracking-widest uppercase text-text-secondary group-hover:text-f1-red transition-colors">Upcoming</span>`}</div></div></div></div></div>`;
	})}</div></section><!-- CLASSIFICATION --><section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="mb-12 animate-fade-up"><h2 class="text-2xl md:text-3xl font-bold tracking-tighter uppercase mb-2 text-text-primary">Classification</h2></div>${renderComponent($$result, "ClassificationTabs", ClassificationTabs, {
		"client:load": true,
		"hasSprint": eventData.hasSprint,
		"raceFinished": eventData.raceResult?.status === "FINISHED" || eventData.raceResult?.status === "ERROR",
		"sprintFinished": eventData.sprintResult?.status === "FINISHED" || eventData.sprintResult?.status === "ERROR",
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/Admin/Documents/Calender Race/frontend/src/components/ClassificationTabs.svelte",
		"client:component-export": "default"
	}, {
		"main-race": ($$result) => renderTemplate`<div>${eventData.raceResult?.status === "ERROR" ? renderTemplate`<div class="text-red-500 text-sm tracking-widest uppercase py-8 border-t border-editorial">Results provider temporarily unavailable.</div>` : eventData.raceResult?.status === "FINISHED" ? renderTemplate`<div class="flex flex-col space-y-8 mt-6">${eventData.raceResult.winner && renderTemplate`${renderComponent($$result, "RaceWinner", $$RaceWinner, {
			"title": "Race Winner",
			"winner": eventData.raceResult.winner,
			"accentColorClass": "text-f1-red"
		})}`}${renderComponent($$result, "ClassificationTable", $$ClassificationTable, {
			"title": "",
			"classification": eventData.raceResult.classification,
			"accentColorClass": "text-f1-red"
		})}</div>` : renderTemplate`<div class="text-text-secondary text-sm tracking-widest uppercase py-8 border-t border-editorial">Main Race has not finished yet.</div>`}</div>`,
		"sprint": ($$result) => renderTemplate`<div>${eventData.hasSprint ? eventData.sprintResult?.status === "ERROR" ? renderTemplate`<div class="text-red-500 text-sm tracking-widest uppercase py-8 border-t border-editorial">Results provider temporarily unavailable.</div>` : eventData.sprintResult?.status === "FINISHED" ? renderTemplate`<div class="flex flex-col space-y-8 mt-6">${eventData.sprintResult.winner && renderTemplate`${renderComponent($$result, "RaceWinner", $$RaceWinner, {
			"title": "Sprint Winner",
			"winner": eventData.sprintResult.winner,
			"accentColorClass": "text-f1-red"
		})}`}${renderComponent($$result, "ClassificationTable", $$ClassificationTable, {
			"title": "",
			"classification": eventData.sprintResult.classification,
			"accentColorClass": "text-f1-red"
		})}</div>` : renderTemplate`<div class="text-text-secondary text-sm tracking-widest uppercase py-8 border-t border-editorial">Sprint has not finished yet.</div>` : null}</div>`
	})}</section>`}${eventData.raceResult && eventData.raceResult.status === "FINISHED" && championshipStandings && championshipStandings.drivers && renderTemplate`${renderComponent($$result, "ChampionshipTable", $$ChampionshipTable, {
		"title": "Drivers Championship",
		"standings": championshipStandings.drivers,
		"accentColorClass": "text-f1-red"
	})}`}` })}` : null}` })}`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/f1/[event].astro", void 0);
var $$file = "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/f1/[event].astro";
var $$url = "/f1/[event]";
//#endregion
//#region \0virtual:astro:page:src/pages/f1/[event]@_@astro
var page = () => _event__exports;
//#endregion
export { page };
