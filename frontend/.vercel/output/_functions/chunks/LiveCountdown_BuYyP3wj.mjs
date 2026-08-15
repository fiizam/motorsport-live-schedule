import { a as store_get, c as readable, l as escape_html, n as bind_props, o as stringify, s as unsubscribe_stores, t as attr_class, u as fallback } from "./dev_BVVeOEi_.mjs";
import { t as onDestroy } from "./index-server_DKUeno14.mjs";
import { t as API_URL } from "./api_DbqcXWAY.mjs";
//#region src/stores/timeStore.ts
var globalTime = readable(Date.now(), (set) => {
	const interval = setInterval(() => {
		set(Date.now());
	}, 1e3);
	return () => clearInterval(interval);
});
//#endregion
//#region src/components/LiveCountdown.svelte
function LiveCountdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let fDays, fHours, fMins, fSecs;
		let targetDate = $$props["targetDate"];
		let colorClass = fallback($$props["colorClass"], "text-f1-red");
		let compact = fallback($$props["compact"], false);
		let countdownTarget = new Date(targetDate).getTime();
		if (Number.isNaN(countdownTarget)) {
			console.error("LiveCountdown received invalid targetDate:", targetDate);
			countdownTarget = Date.now();
		}
		let distance = countdownTarget - store_get($$store_subs ??= {}, "$globalTime", globalTime);
		let days = 0;
		let hours = 0;
		let minutes = 0;
		let seconds = 0;
		let isLive = false;
		let eventSource = null;
		try {
			eventSource = new EventSource(`${API_URL}/api/live`);
			eventSource.onmessage = (event) => {};
		} catch (e) {
			console.warn("Could not connect to SSE backend:", e);
		}
		onDestroy(() => {
			if (eventSource) eventSource.close();
		});
		$: {
			distance = countdownTarget - store_get($$store_subs ??= {}, "$globalTime", globalTime);
			if (distance <= 0) {
				isLive = true;
				distance = 0;
			} else isLive = false;
			days = Math.floor(distance / 864e5);
			hours = Math.floor(distance % 864e5 / 36e5);
			minutes = Math.floor(distance % 36e5 / 6e4);
			seconds = Math.floor(distance % 6e4 / 1e3);
		}
		$: fDays = days.toString().padStart(2, "0");
		$: fHours = hours.toString().padStart(2, "0");
		$: fMins = minutes.toString().padStart(2, "0");
		$: fSecs = seconds.toString().padStart(2, "0");
		$$renderer.push(`<div${attr_class(`flex flex-col items-end ${isLive ? "animate-pulse" : ""}`)}>`);
		if (isLive) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div${attr_class(`${compact ? "text-2xl md:text-3xl" : "text-6xl md:text-[8rem]"} font-bold tracking-tighter leading-none ${stringify(colorClass)}`, "svelte-d3o2u9")}>● LIVE</div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attr_class(`flex items-baseline ${compact ? "space-x-2 md:space-x-3 text-2xl md:text-3xl" : "space-x-4 md:space-x-8 text-5xl md:text-[7rem]"} font-medium tracking-tighter tabular-nums leading-none`)}><div class="flex flex-col items-center"><div class="relative h-[1em] overflow-hidden w-[1.2em] flex justify-center svelte-d3o2u9"><!---->`);
			$$renderer.push(`<span class="absolute">${escape_html(fDays)}</span>`);
			$$renderer.push(`<!----></div> <span${attr_class(`${compact ? "text-[8px] mt-1" : "text-[10px] md:text-xs mt-2 md:mt-4"} text-text-secondary uppercase tracking-widest font-sans`)}>Days</span></div> <span${attr_class(`text-surface-800 ${compact ? "-translate-y-2" : "-translate-y-4 md:-translate-y-8"} font-sans`)}>:</span> <div class="flex flex-col items-center"><div class="relative h-[1em] overflow-hidden w-[1.2em] flex justify-center svelte-d3o2u9"><!---->`);
			$$renderer.push(`<span class="absolute">${escape_html(fHours)}</span>`);
			$$renderer.push(`<!----></div> <span${attr_class(`${compact ? "text-[8px] mt-1" : "text-[10px] md:text-xs mt-2 md:mt-4"} text-text-secondary uppercase tracking-widest font-sans`)}>Hours</span></div> <span${attr_class(`text-surface-800 ${compact ? "-translate-y-2" : "-translate-y-4 md:-translate-y-8"} font-sans`)}>:</span> <div class="flex flex-col items-center"><div class="relative h-[1em] overflow-hidden w-[1.2em] flex justify-center svelte-d3o2u9"><!---->`);
			$$renderer.push(`<span class="absolute">${escape_html(fMins)}</span>`);
			$$renderer.push(`<!----></div> <span${attr_class(`${compact ? "text-[8px] mt-1" : "text-[10px] md:text-xs mt-2 md:mt-4"} text-text-secondary uppercase tracking-widest font-sans`)}>Mins</span></div> <span${attr_class(`text-surface-800 ${compact ? "-translate-y-2" : "-translate-y-4 md:-translate-y-8"} font-sans`)}>:</span> <div class="flex flex-col items-center"><div${attr_class(`relative h-[1em] overflow-hidden w-[1.2em] flex justify-center ${colorClass}`, "svelte-d3o2u9")}><!---->`);
			$$renderer.push(`<span class="absolute">${escape_html(fSecs)}</span>`);
			$$renderer.push(`<!----></div> <span${attr_class(`${compact ? "text-[8px] mt-1" : "text-[10px] md:text-xs mt-2 md:mt-4"} text-text-secondary uppercase tracking-widest font-sans`)}>Secs</span></div></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
		bind_props($$props, {
			targetDate,
			colorClass,
			compact
		});
	});
}
//#endregion
export { LiveCountdown as t };
