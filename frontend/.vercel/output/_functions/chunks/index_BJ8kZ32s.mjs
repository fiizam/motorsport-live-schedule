import { n as __exportAll, t as createComponent } from "./compiler_qaW5CanQ.mjs";
import { _ as addAttribute, d as renderTemplate, h as maybeRenderHead, i as renderComponent } from "./server_ByxJykQl.mjs";
import { t as $$Layout } from "./Layout_D4VM2oZh.mjs";
import { t as API_URL } from "./api_DbqcXWAY.mjs";
import { t as LiveCountdown } from "./LiveCountdown_BuYyP3wj.mjs";
import { i as formatEventTime, t as formatEventDateShort } from "./timeUtils_Dpgyzh4E.mjs";
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	let f1Upcoming = null;
	let motogpUpcoming = null;
	let f1Recent = null;
	let motogpRecent = null;
	let f1Standings = null;
	let motogpStandings = null;
	try {
		const [f1Res, mgpRes] = await Promise.all([fetch(`${API_URL}/api/f1/upcoming`).then((r) => r.ok ? r.json() : null), fetch(`${API_URL}/api/motogp/upcoming`).then((r) => r.ok ? r.json() : null)]);
		f1Upcoming = f1Res;
		motogpUpcoming = mgpRes;
		const [f1Cal, mgpCal] = await Promise.all([fetch(`${API_URL}/api/f1/calendar`).then((r) => r.ok ? r.json() : []), fetch(`${API_URL}/api/motogp/calendar`).then((r) => r.ok ? r.json() : [])]);
		if (Array.isArray(f1Cal)) {
			const finishedF1 = f1Cal.filter((e) => e.sessions?.find((s) => s.type === "Race")?.status === "FINISHED");
			if (finishedF1.length > 0) {
				f1Recent = finishedF1[finishedF1.length - 1];
				const resultsRes = await fetch(`${API_URL}/api/f1/event/${f1Recent.id}/results`).then((r) => r.ok ? r.json() : null);
				if (resultsRes) f1Recent.raceResult = resultsRes.race;
			}
		}
		if (Array.isArray(mgpCal)) {
			const finishedMgp = mgpCal.filter((e) => e.sessions?.find((s) => s.type === "Race")?.status === "FINISHED");
			if (finishedMgp.length > 0) {
				motogpRecent = finishedMgp[finishedMgp.length - 1];
				const resultsRes = await fetch(`${API_URL}/api/motogp/event/${motogpRecent.id}/results`).then((r) => r.ok ? r.json() : null);
				if (resultsRes) motogpRecent.raceResult = resultsRes.raceResult;
			}
		}
		const [f1Std, mgpStd] = await Promise.all([fetch(`${API_URL}/api/f1/standings`).then((r) => r.ok ? r.json() : null), fetch(`${API_URL}/api/motogp/standings`).then((r) => r.ok ? r.json() : null)]);
		f1Standings = f1Std;
		motogpStandings = mgpStd;
	} catch (e) {
		console.error("Failed to fetch homepage data", e);
	}
	const upcomingEvents = [];
	if (f1Upcoming) upcomingEvents.push({
		...f1Upcoming,
		series: "F1",
		basePath: "/f1",
		color: "f1-red",
		dateObj: f1Upcoming.sessions.find((s) => s.status !== "FINISHED")?.startDate
	});
	if (motogpUpcoming) upcomingEvents.push({
		...motogpUpcoming,
		series: "MotoGP",
		basePath: "/motogp",
		color: "motogp-blue",
		dateObj: motogpUpcoming.sessions.find((s) => s.status !== "FINISHED")?.startDate
	});
	upcomingEvents.sort((a, b) => {
		const aLive = a.sessions.some((s) => s.status === "LIVE");
		const bLive = b.sessions.some((s) => s.status === "LIVE");
		if (aLive && !bLive) return -1;
		if (!aLive && bLive) return 1;
		return new Date(a.dateObj || 0).getTime() - new Date(b.dateObj || 0).getTime();
	});
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Next Race" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24"><!-- Hero Introduction --><section class="animate-fade-up"><h1 class="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4 text-text-primary font-heading">Motorsport</h1><p class="text-text-secondary tracking-widest uppercase text-sm max-w-2xl leading-relaxed">The unified, real-time schedule and results platform for Formula 1 and MotoGP.</p></section><!-- NEXT UP --><section class="animate-fade-up" style="animation-delay: 100ms;"><div class="flex items-center space-x-4 mb-8"><h2 class="text-xs uppercase tracking-widest font-black text-text-tertiary">Next Up</h2><div class="h-[1px] bg-editorial flex-grow"></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-8">${upcomingEvents.map((event) => {
		const nextSession = event.sessions.find((s) => s.status !== "FINISHED");
		const isLive = event.sessions.some((s) => s.status === "LIVE");
		const dateStr = nextSession ? formatEventDateShort(nextSession.startDate) : "--";
		const timeStr = nextSession ? formatEventTime(nextSession.startDate) : "--:--";
		return renderTemplate`<a${addAttribute(`${event.basePath}/${event.id || event.round}`, "href")} class="group block glass-panel rounded-3xl p-6 md:p-8 hover:border-black/20 hover:shadow-lg transition-all duration-300"><div class="flex justify-between items-start mb-12"><span${addAttribute(`text-xs uppercase tracking-widest font-bold text-${event.color}`, "class")}>${event.series}</span>${isLive ? renderTemplate`<span${addAttribute(`text-[10px] font-bold tracking-widest uppercase text-${event.color} animate-pulse border border-${event.color}/30 px-2 py-1 rounded`, "class")}>Live Now</span>` : nextSession ? renderTemplate`<span class="text-[10px] font-bold tracking-widest uppercase text-text-tertiary border border-editorial px-2 py-1 rounded">Upcoming</span>` : null}</div><h3 class="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-2 group-hover:opacity-70 transition-opacity text-text-primary">${event.name}</h3><p class="text-sm text-text-secondary tracking-widest uppercase mb-8">${event.circuit}</p><div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-editorial pt-6"><div class="flex flex-col"><span class="text-sm text-text-tertiary tracking-widest uppercase mb-1">${nextSession?.name || "Session"}</span><span class="text-xl font-bold tracking-tighter uppercase text-text-primary">${dateStr} — ${timeStr} WIB</span></div>${nextSession?.startDate && !isLive && event.status !== "UNDER_REVIEW" && event.status !== "TBC" && renderTemplate`<div class="text-right"><span class="text-[10px] text-text-tertiary tracking-widest uppercase block mb-1">Starts In</span>${renderComponent($$result, "LiveCountdown", LiveCountdown, {
			"client:load": true,
			"targetDate": nextSession.startDate,
			"colorClass": `text-${event.color}`,
			"compact": true,
			"client:component-hydration": "load",
			"client:component-path": "C:/Users/Admin/Documents/Calender Race/frontend/src/components/LiveCountdown.svelte",
			"client:component-export": "default"
		})}</div>`}${(event.status === "UNDER_REVIEW" || event.status === "TBC") && renderTemplate`<div class="text-right"><span class="px-2 py-0.5 border border-editorial text-text-secondary text-[10px] uppercase tracking-widest font-bold bg-surface-100 rounded">Under Review</span></div>`}</div></a>`;
	})}${upcomingEvents.length === 0 && renderTemplate`<div class="col-span-2 text-text-secondary text-sm tracking-widest uppercase">No upcoming events found.</div>`}</div></section><!-- RECENT RESULTS --><section class="animate-fade-up" style="animation-delay: 200ms;"><div class="flex items-center space-x-4 mb-8"><h2 class="text-xs uppercase tracking-widest font-black text-text-tertiary">Recent Results</h2><div class="h-[1px] bg-editorial flex-grow"></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-8">${[{
		data: f1Recent,
		series: "F1",
		color: "f1-red",
		basePath: "/f1"
	}, {
		data: motogpRecent,
		series: "MotoGP",
		color: "motogp-blue",
		basePath: "/motogp"
	}].map((item) => {
		if (!item.data) return null;
		const winner = item.data.raceResult?.winner;
		const raceSession = item.data.sessions?.find((s) => s.type === "Race");
		const dateStr = raceSession ? formatEventDateShort(raceSession.startDate) : "";
		return renderTemplate`<a${addAttribute(`${item.basePath}/${item.data.id || item.data.round}`, "href")} class="flex flex-col group"><div class="flex items-center justify-between border-b border-editorial pb-4 mb-4"><div class="flex items-center space-x-3"><span${addAttribute(`w-2 h-2 rounded-full bg-${item.color}`, "class")}></span><span class="text-xs uppercase tracking-widest font-bold text-text-secondary">${item.series}</span></div><span class="text-xs text-text-tertiary tracking-widest uppercase">${dateStr}</span></div><span class="text-xl font-bold tracking-tighter uppercase mb-1 group-hover:opacity-70 transition-opacity text-text-primary">${item.data.name}</span>${winner ? renderTemplate`<div class="mt-4 glass-panel rounded-2xl p-4 flex justify-between items-center group-hover:border-black/10 hover:shadow-md transition-all"><div class="flex flex-col"><span class="text-[10px] text-text-tertiary tracking-widest uppercase mb-1">Winner</span><span class="text-sm font-bold tracking-wider uppercase text-text-primary">${winner.driverName || winner.riderName}</span><span class="text-xs text-text-secondary tracking-widest uppercase">${winner.teamName}</span></div><span class="text-2xl font-black text-surface-800">P1</span></div>` : renderTemplate`<div class="mt-4 text-xs text-text-tertiary tracking-widest uppercase">Results Temporarily Unavailable</div>`}</a>`;
	})}</div></section><!-- CHAMPIONSHIP PREVIEW --><section class="animate-fade-up" style="animation-delay: 300ms;"><div class="flex items-center space-x-4 mb-8"><h2 class="text-xs uppercase tracking-widest font-black text-text-tertiary">Championship</h2><div class="h-[1px] bg-editorial flex-grow"></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-8">${[{
		data: f1Standings,
		series: "F1",
		color: "f1-red",
		basePath: "/f1/standings",
		label: "Drivers"
	}, {
		data: motogpStandings,
		series: "MotoGP",
		color: "motogp-blue",
		basePath: "/motogp/standings",
		label: "Riders"
	}].map((item) => {
		const list = item.data?.drivers?.slice(0, 3) || [];
		if (list.length === 0) return null;
		return renderTemplate`<div class="flex flex-col"><div class="flex items-center justify-between border-b border-editorial pb-4 mb-4"><span${addAttribute(`text-xs uppercase tracking-widest font-bold text-${item.color}`, "class")}>${item.series} ${item.label}</span><a${addAttribute(item.basePath, "href")} class="text-[10px] tracking-widest uppercase font-bold text-text-tertiary hover:text-text-primary transition-colors">View Full &rarr;</a></div><div class="flex flex-col space-y-2">${list.map((driver) => renderTemplate`<div class="flex items-center justify-between p-3 glass-panel rounded-2xl mb-2 hover:bg-surface-100 hover:shadow-md transition-all"><div class="flex items-center space-x-4"><span class="text-xs font-bold text-text-tertiary w-4">${driver.position}</span><div class="flex flex-col"><span class="text-sm font-bold tracking-wider uppercase text-text-primary">${driver.driverName || driver.riderName}</span></div></div><span class="text-xs font-bold tracking-widest tabular-nums text-text-primary">${driver.points} PTS</span></div>`)}</div></div>`;
	})}</div></section></div>` })}`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/index.astro", void 0);
var $$file = "C:/Users/Admin/Documents/Calender Race/frontend/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
