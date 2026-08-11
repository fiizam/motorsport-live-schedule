<script>
  export let text = "LIVE";
  export let colorClass = "bg-f1-red"; // default to F1 red, can pass bg-motogp-blue
</script>

<div class="inline-flex items-center space-x-2 glass-panel px-3 py-1 rounded-full border border-white/10">
  <div class="relative flex h-2 w-2">
    <span class={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass}`}></span>
    <span class={`relative inline-flex rounded-full h-2 w-2 ${colorClass}`}></span>
  </div>
  <span class="text-[10px] font-bold tracking-widest uppercase text-white font-sans">{text}</span>
</div>
