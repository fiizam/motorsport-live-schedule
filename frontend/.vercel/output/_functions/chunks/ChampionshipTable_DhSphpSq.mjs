import { t as createComponent } from "./compiler_qaW5CanQ.mjs";
import { T as createAstro, _ as addAttribute, d as renderTemplate, h as maybeRenderHead } from "./server_ByxJykQl.mjs";
//#region src/components/ChampionshipTable.astro
createAstro("https://motorsport-platform.com");
var $$ChampionshipTable = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ChampionshipTable;
	const { title, standings, accentColorClass = "text-f1-red" } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<section class="max-w-4xl px-4 animate-fade-up">${title && renderTemplate`<div class="mb-8"><h2 class="text-xl font-bold tracking-widest uppercase text-text-primary">${title}</h2></div>`}<div class="flex flex-col">${standings.map((row, index) => {
		const isLeader = index === 0;
		const name = row.driverName || row.riderName || "Unknown";
		return renderTemplate`<div${addAttribute(`flex items-center justify-between py-4 px-2 border-b border-editorial animate-fade-up group hover:bg-surface-50 transition-colors ${isLeader ? "pt-8" : ""}`, "class")}${addAttribute(`animation-delay: ${Math.min(index * 20, 300)}ms;`, "style")}><div class="flex items-center space-x-6 w-full"><span${addAttribute(`text-xl font-black tracking-tighter tabular-nums w-8 ${isLeader ? accentColorClass : "text-text-tertiary"}`, "class")}>${row.position.toString().padStart(2, "0")}</span><div class="flex flex-col flex-grow"><span${addAttribute(`text-lg uppercase tracking-wide ${isLeader ? "font-black text-text-primary" : "font-bold text-text-primary group-hover:opacity-70"} transition-opacity`, "class")}>${name}</span><span class="text-xs font-light text-text-secondary tracking-widest uppercase mt-0.5">${row.teamName}</span></div><span class="text-lg font-bold tracking-tighter tabular-nums text-text-primary w-20 text-right">${row.points} <span class="text-[10px] text-text-tertiary font-sans tracking-widest ml-1">PTS</span></span></div></div>`;
	})}</div></section>`;
}, "C:/Users/Admin/Documents/Calender Race/frontend/src/components/ChampionshipTable.astro", void 0);
//#endregion
export { $$ChampionshipTable as t };
