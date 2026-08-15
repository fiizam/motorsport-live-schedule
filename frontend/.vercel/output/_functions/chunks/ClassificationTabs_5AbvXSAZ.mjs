import { t as createComponent } from "./compiler_qaW5CanQ.mjs";
import { T as createAstro, _ as addAttribute, d as renderTemplate, h as maybeRenderHead } from "./server_ByxJykQl.mjs";
import { i as slot, l as escape_html, n as bind_props, t as attr_class, u as fallback } from "./dev_BVVeOEi_.mjs";
import "./index-server_DKUeno14.mjs";
//#region src/components/LiveIndicator.svelte
function LiveIndicator($$renderer, $$props) {
	let text = fallback($$props["text"], "LIVE");
	let colorClass = fallback($$props["colorClass"], "bg-f1-red");
	$$renderer.push(`<div class="inline-flex items-center space-x-2 glass-panel px-3 py-1 rounded-full border border-white/10"><div class="relative flex h-2 w-2"><span${attr_class(`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass}`)}></span> <span${attr_class(`relative inline-flex rounded-full h-2 w-2 ${colorClass}`)}></span></div> <span class="text-[10px] font-bold tracking-widest uppercase text-white font-sans">${escape_html(text)}</span></div>`);
	bind_props($$props, {
		text,
		colorClass
	});
}
//#endregion
//#region src/components/RaceWinner.astro
createAstro("https://motorsport-platform.com");
var $$RaceWinner = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$RaceWinner;
	const { title, winner, accentColorClass = "text-f1-red", isUpcoming = false } = Astro.props;
	const name = winner ? winner.driverName || winner.riderName || "Unknown" : "To be decided";
	const team = winner ? winner.teamName || "Unknown" : "";
	return renderTemplate`${maybeRenderHead($$result)}<section class="py-6 max-w-4xl px-4 animate-fade-up"><div class="flex flex-col"><div class="flex items-center space-x-3 mb-2"><span class="text-sm font-bold tracking-widest uppercase text-text-primary">${title}</span><span${addAttribute(`text-xs font-black tracking-widest uppercase ${isUpcoming ? "text-text-secondary" : accentColorClass}`, "class")}>${isUpcoming ? "UPCOMING" : "FINAL"}</span></div><div class="flex items-start space-x-6 mt-4"><span${addAttribute(`text-2xl font-black tracking-tighter tabular-nums leading-none ${isUpcoming ? "text-text-secondary" : "text-text-primary"}`, "class")}>${isUpcoming ? "Winner will be determined after the race." : "P1"}</span>${!isUpcoming && renderTemplate`<div class="flex flex-col justify-start"><span class="text-2xl font-black tracking-tighter uppercase leading-none text-text-primary">${name}</span><span class="text-sm text-text-secondary tracking-wide uppercase font-heading mt-1">${team}</span></div>`}</div></div></section>`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/components/RaceWinner.astro", void 0);
//#endregion
//#region src/components/ClassificationTable.astro
createAstro("https://motorsport-platform.com");
var $$ClassificationTable = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ClassificationTable;
	const { title, classification, accentColorClass = "text-f1-red" } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<section class="py-6 max-w-4xl px-4 animate-fade-up">${title && renderTemplate`<div class="mb-4"><h2 class="text-sm font-bold tracking-widest uppercase text-text-primary">${title}</h2></div>`}<div class="flex flex-col border-t border-editorial pt-2">${classification.map((row, index) => {
		const name = row.driverName || row.riderName || "Unknown";
		const isWinner = row.position === 1 || row.position === "1";
		return renderTemplate`<div class="flex items-center justify-between py-2 border-b border-editorial group hover:bg-surface-50 transition-colors px-2"${addAttribute(`animation-delay: ${Math.min(index * 20, 300)}ms;`, "style")}><div${addAttribute(`flex items-center space-x-4 w-full ${isWinner ? "py-4" : ""}`, "class")}><span${addAttribute(`text-sm font-bold tracking-tighter tabular-nums w-6 text-right ${isWinner ? accentColorClass : "text-text-secondary"}`, "class")}>${isWinner ? "P1" : row.position}</span><div class="flex flex-col flex-grow"><span${addAttribute(`font-bold tracking-tighter uppercase transition-colors ${isWinner ? "text-lg text-text-primary" : "text-sm text-text-primary group-hover:opacity-70"}`, "class")}>${name}</span><span${addAttribute(`font-light tracking-wide uppercase ${isWinner ? "text-xs text-text-secondary" : "text-[10px] text-text-tertiary"}`, "class")}>${row.teamName}</span></div><div class="flex items-center space-x-4 text-right"><span class="text-xs font-medium tracking-tighter tabular-nums text-text-secondary w-20">${row.status === "FINISHED" ? row.gapToLeader : row.status}</span><span class="text-sm font-bold tracking-tighter tabular-nums text-text-primary w-12">${row.points} <span class="text-[9px] text-text-tertiary font-sans">PTS</span></span></div></div></div>`;
	})}</div></section>`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/components/ClassificationTable.astro", void 0);
//#endregion
//#region src/components/ClassificationTabs.svelte
function ClassificationTabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let hasSprint = fallback($$props["hasSprint"], false);
		let raceFinished = fallback($$props["raceFinished"], false);
		let sprintFinished = fallback($$props["sprintFinished"], false);
		$$renderer.push(`<div class="w-full"><div class="flex items-center w-full max-w-sm bg-surface-100 p-1 rounded-full mb-8"><button${attr_class(`flex-1 text-center py-2 text-[10px] tracking-widest font-bold uppercase transition-all rounded-full bg-white text-text-primary shadow-sm`)}>Main Race</button> `);
		if (hasSprint) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button${attr_class(`flex-1 text-center py-2 text-[10px] tracking-widest font-bold uppercase transition-all rounded-full text-text-tertiary hover:text-text-primary`)}>Sprint</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="relative min-h-[300px]">`);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="animate-fade-up"><!--[-->`);
		slot($$renderer, $$props, "main-race", {}, null);
		$$renderer.push(`<!--]--></div>`);
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div>`);
		bind_props($$props, {
			hasSprint,
			raceFinished,
			sprintFinished
		});
	});
}
//#endregion
export { LiveIndicator as i, $$ClassificationTable as n, $$RaceWinner as r, ClassificationTabs as t };
