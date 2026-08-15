import { n as __exportAll, t as createComponent } from "./compiler_qaW5CanQ.mjs";
import { T as createAstro, _ as addAttribute, a as Fragment, d as renderTemplate, h as maybeRenderHead, i as renderComponent } from "./server_ByxJykQl.mjs";
import { t as $$Layout } from "./Layout_D4VM2oZh.mjs";
import { t as API_URL } from "./api_DbqcXWAY.mjs";
import { t as LiveCountdown } from "./LiveCountdown_BuYyP3wj.mjs";
import { i as LiveIndicator, n as $$ClassificationTable, r as $$RaceWinner, t as ClassificationTabs } from "./ClassificationTabs_5AbvXSAZ.mjs";
import { t as $$ChampionshipTable } from "./ChampionshipTable_DhSphpSq.mjs";
import { a as formatEventWeekday, i as formatEventTime, o as formatRaceWeekendRange, t as formatEventDateShort } from "./timeUtils_Dpgyzh4E.mjs";
//#region src/pages/motogp/[event].astro
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
	const { event: slug } = Astro.params;
	let eventData = null;
	let targetDate = null;
	let error = null;
	let weekendDates = "TBD";
	let championshipStandings = null;
	try {
		const res = await fetch(`${API_URL}/api/motogp/event/${slug}`);
		if (res.ok) {
			eventData = await res.json();
			const nextSession = eventData.sessions.find((s) => s.status !== "FINISHED");
			if (nextSession) targetDate = nextSession.startDate;
			try {
				weekendDates = formatRaceWeekendRange(eventData.sessions);
			} catch (e) {
				console.error("Failed to parse weekend dates:", e);
			}
			if (eventData.sessions.some((s) => s.type === "Race" && s.status === "FINISHED")) try {
				const standingsRes = await fetch(`${API_URL}/api/motogp/standings`);
				if (standingsRes.ok) championshipStandings = await standingsRes.json();
			} catch (e) {
				console.error("Failed to fetch MotoGP standings", e);
			}
		} else error = "Event not found.";
	} catch (e) {
		console.error("Failed to fetch MotoGP event", e);
		error = "Live schedule is temporarily unavailable.";
	}
	const hasSprint = eventData && eventData.sessions.some((s) => s.type === "Sprint");
	const sprintSession = eventData && eventData.sessions.find((s) => s.type === "Sprint");
	const raceSession = eventData && eventData.sessions.find((s) => s.type === "Race");
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": eventData ? eventData.name : "Event Not Found" }, { "default": ($$result) => renderTemplate`${error ? renderTemplate`${maybeRenderHead($$result)}<div class="min-h-[80vh] flex items-center justify-center px-4 animate-fade-up"><div class="glass-panel border-red-500/30 text-red-500 px-8 py-6 rounded-3xl max-w-lg text-center"><h1 class="text-2xl font-bold mb-2 font-heading tracking-tight uppercase text-text-primary">Error</h1><p class="font-sans text-sm">${error}</p><a href="/motogp" class="mt-8 inline-block border-b border-black/20 pb-1 text-sm font-bold uppercase tracking-widest hover:border-black transition-colors text-text-primary">Return to Calendar</a></div></div>` : eventData ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<!-- Race Control Hero --><section class="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-editorial"><div class="flex flex-col animate-fade-up"><div class="flex items-center space-x-3 mb-4"><span class="text-motogp-blue font-bold text-sm tracking-widest uppercase font-sans">Round ${eventData.round}</span><span class="w-1 h-1 bg-surface-800 rounded-full"></span><span class="text-text-secondary text-sm tracking-widest uppercase font-sans">${weekendDates}</span></div><h1 class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase mb-6 text-text-primary max-w-[1000px] break-words">${eventData.name}</h1><div class="flex flex-col space-y-2 mb-12"><span class="text-xl md:text-2xl font-light text-text-secondary tracking-wide uppercase font-heading">${eventData.circuit}</span><span class="text-lg text-text-tertiary tracking-widest uppercase font-sans">${eventData.country || "Location"}</span></div><div class="w-full flex justify-start"><!-- Real-Time SSE Countdown Island -->${targetDate && renderTemplate`${renderComponent($$result, "LiveCountdown", LiveCountdown, {
		"client:load": true,
		"targetDate": targetDate,
		"colorClass": "text-motogp-blue",
		"compact": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/Admin/Documents/Calender Race/frontend/src/components/LiveCountdown.svelte",
		"client:component-export": "default"
	})}`}</div></div></section><!-- Editorial Session Timeline --><section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="mb-12 animate-fade-up"><h2 class="text-2xl md:text-3xl font-bold tracking-tighter uppercase mb-2 text-text-primary">Race Weekend</h2></div><div class="flex flex-col relative space-y-4">${eventData.sessions.map((session, index) => {
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
			"colorClass": "bg-motogp-blue",
			"client:component-hydration": "load",
			"client:component-path": "C:/Users/Admin/Documents/Calender Race/frontend/src/components/LiveIndicator.svelte",
			"client:component-export": "default"
		})}` : renderTemplate`<span class="text-[10px] font-bold tracking-widest uppercase text-text-secondary group-hover:text-motogp-blue transition-colors">Upcoming</span>`}</div></div></div></div></div>`;
	})}</div></section><!-- CLASSIFICATION --><section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="mb-12 animate-fade-up"><h2 class="text-2xl md:text-3xl font-bold tracking-tighter uppercase mb-2 text-text-primary">Classification</h2></div>${renderComponent($$result, "ClassificationTabs", ClassificationTabs, {
		"client:load": true,
		"hasSprint": hasSprint,
		"raceFinished": raceSession?.status === "FINISHED",
		"sprintFinished": sprintSession?.status === "FINISHED",
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/Admin/Documents/Calender Race/frontend/src/components/ClassificationTabs.svelte",
		"client:component-export": "default"
	}, {
		"main-race": ($$result) => renderTemplate`<div>${raceSession?.status === "FINISHED" ? eventData.raceResult ? renderTemplate`<div class="flex flex-col space-y-8 mt-6">${eventData.raceResult.winner && renderTemplate`${renderComponent($$result, "RaceWinner", $$RaceWinner, {
			"title": "Race Winner",
			"winner": eventData.raceResult.winner,
			"accentColorClass": "text-motogp-blue"
		})}`}${renderComponent($$result, "ClassificationTable", $$ClassificationTable, {
			"title": "",
			"classification": eventData.raceResult.classification,
			"accentColorClass": "text-motogp-blue"
		})}</div>` : renderTemplate`<div class="text-red-500 text-sm tracking-widest uppercase py-8 border-t border-editorial">Results provider temporarily unavailable.</div>` : renderTemplate`<div class="text-text-secondary text-sm tracking-widest uppercase py-8 border-t border-editorial">Main Race has not finished yet.</div>`}</div>`,
		"sprint": ($$result) => renderTemplate`<div>${hasSprint ? sprintSession?.status === "FINISHED" ? eventData.sprintResult ? renderTemplate`<div class="flex flex-col space-y-8 mt-6">${eventData.sprintResult.winner && renderTemplate`${renderComponent($$result, "RaceWinner", $$RaceWinner, {
			"title": "Sprint Winner",
			"winner": eventData.sprintResult.winner,
			"accentColorClass": "text-motogp-blue"
		})}`}${renderComponent($$result, "ClassificationTable", $$ClassificationTable, {
			"title": "",
			"classification": eventData.sprintResult.classification,
			"accentColorClass": "text-motogp-blue"
		})}</div>` : renderTemplate`<div class="text-red-500 text-sm tracking-widest uppercase py-8 border-t border-editorial">Results provider temporarily unavailable.</div>` : renderTemplate`<div class="text-text-secondary text-sm tracking-widest uppercase py-8 border-t border-editorial">Sprint has not finished yet.</div>` : null}</div>`
	})}</section>${raceSession?.status === "FINISHED" && championshipStandings && championshipStandings.drivers && renderTemplate`${renderComponent($$result, "ChampionshipTable", $$ChampionshipTable, {
		"title": "Riders Championship",
		"standings": championshipStandings.drivers,
		"accentColorClass": "text-motogp-blue"
	})}`}` })}` : null}` })}`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/motogp/[event].astro", void 0);
var $$file = "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/motogp/[event].astro";
var $$url = "/motogp/[event]";
//#endregion
//#region \0virtual:astro:page:src/pages/motogp/[event]@_@astro
var page = () => _event__exports;
//#endregion
export { page };
