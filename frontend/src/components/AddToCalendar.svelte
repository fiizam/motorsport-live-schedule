<script>
  export let event;
  export let type = 'F1'; // 'F1' or 'MotoGP'

  const mainRace = event?.sessions?.find(s => s.type === 'Race');
  
  function getGCalUrl() {
    if (!mainRace) return '#';
    // Format: YYYYMMDDTHHmmssZ
    const start = new Date(mainRace.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(mainRace.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = `${type} ${event.name} - Main Race`;
    const location = `${event.circuit}, ${event.country}`;
    const url = typeof window !== 'undefined' ? window.location.href : 'https://motorsport-live-schedule.vercel.app';
    const details = `Round ${event.round} of the ${new Date().getFullYear()} ${type} Championship.\n\nLive timing and schedule: ${url}`;
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  }
</script>

{#if mainRace && mainRace.status !== 'FINISHED' && mainRace.status !== 'CANCELLED' && event.status !== 'CANCELLED'}
  <a 
    href={getGCalUrl()} 
    target="_blank" 
    rel="noopener noreferrer" 
    class="flex items-center gap-2 bg-surface-100 hover:bg-surface-800 text-text-primary px-4 py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest border border-editorial transition-all shadow-sm active:scale-95"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    Ingatkan Saya
  </a>
{/if}
