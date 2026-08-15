import { n as bind_props, t as attr_class, u as fallback } from "./dev_BVVeOEi_.mjs";
//#region src/components/ChampionshipSwitcher.svelte
function ChampionshipSwitcher($$renderer, $$props) {
	let current = fallback($$props["current"], "f1");
	$$renderer.push(`<div class="inline-flex relative p-1 rounded-full glass-panel border-editorial overflow-hidden"><div${attr_class(`absolute top-1 bottom-1 w-1/2 rounded-full transition-transform duration-500 cubic-bezier(0.22, 1, 0.36, 1) ${current === "f1" ? "translate-x-0 bg-f1-red" : "translate-x-[96%] bg-motogp-blue"}`)}></div> <a href="/f1"${attr_class(`relative z-10 px-6 py-2 text-xs font-bold tracking-widest uppercase transition-colors duration-300 ${current === "f1" ? "text-white" : "text-text-secondary hover:text-white"}`)}>Formula 1</a> <a href="/motogp"${attr_class(`relative z-10 px-6 py-2 text-xs font-bold tracking-widest uppercase transition-colors duration-300 ${current === "motogp" ? "text-white" : "text-text-secondary hover:text-white"}`)}>MotoGP</a></div>`);
	bind_props($$props, { current });
}
//#endregion
export { ChampionshipSwitcher as t };
