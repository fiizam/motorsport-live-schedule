<script lang="ts">
  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { globalTime } from '../stores/timeStore';
  
  export let targetDate: string;
  export let colorClass = "text-f1-red"; 
  
  export let compact = false;
  
  let countdownTarget = new Date(targetDate).getTime();
  
  if (Number.isNaN(countdownTarget)) {
    console.error("LiveCountdown received invalid targetDate:", targetDate);
    countdownTarget = Date.now(); // Prevent NaN errors in UI, but this should be caught upstream
  }
  
  let distance = countdownTarget - $globalTime;
  
  let days = 0, hours = 0, minutes = 0, seconds = 0;
  let isLive = false;
  let eventSource: EventSource | null = null;
  
  // Reactively update when globalTime changes
  $: {
    distance = countdownTarget - $globalTime;
    
    if (distance <= 0) {
      isLive = true;
      distance = 0;
    } else {
      isLive = false;
    }
    
    days = Math.floor(distance / (1000 * 60 * 60 * 24));
    hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }
  
  // We can keep SSE here if we need backend pushes for targetDate changes
  // but it's optional for the scope of the timer itself.
  try {
    eventSource = new EventSource('http://localhost:3000/api/live');
    eventSource.onmessage = (event) => {
      // If we need to dynamically parse data, we do it here.
    };
  } catch (e) {
    console.warn("Could not connect to SSE backend:", e);
  }
  
  onDestroy(() => {
    if (eventSource) eventSource.close();
  });
  
  $: fDays = days.toString().padStart(2, '0');
  $: fHours = hours.toString().padStart(2, '0');
  $: fMins = minutes.toString().padStart(2, '0');
  $: fSecs = seconds.toString().padStart(2, '0');
</script>

<div class="flex flex-col items-end {isLive ? 'animate-pulse' : ''}">
  {#if isLive}
    <div class="{compact ? 'text-2xl md:text-3xl' : 'text-6xl md:text-[8rem]'} font-bold tracking-tighter leading-none {colorClass}">
      ● LIVE
    </div>
  {:else}
    <div class="flex items-baseline {compact ? 'space-x-2 md:space-x-3 text-2xl md:text-3xl' : 'space-x-4 md:space-x-8 text-5xl md:text-[7rem]'} font-medium tracking-tighter tabular-nums leading-none">
      
      <!-- Days -->
      <div class="flex flex-col items-center">
        <div class="relative h-[1em] overflow-hidden w-[1.2em] flex justify-center">
          {#key fDays}
            <span class="absolute" in:fly={{ y: '100%', duration: 400 }} out:fly={{ y: '-100%', duration: 400 }}>
              {fDays}
            </span>
          {/key}
        </div>
        <span class="{compact ? 'text-[8px] mt-1' : 'text-[10px] md:text-xs mt-2 md:mt-4'} text-text-secondary uppercase tracking-widest font-sans">Days</span>
      </div>

      <span class="text-surface-800 {compact ? '-translate-y-2' : '-translate-y-4 md:-translate-y-8'} font-sans">:</span>
      
      <!-- Hours -->
      <div class="flex flex-col items-center">
        <div class="relative h-[1em] overflow-hidden w-[1.2em] flex justify-center">
          {#key fHours}
            <span class="absolute" in:fly={{ y: '100%', duration: 400 }} out:fly={{ y: '-100%', duration: 400 }}>
              {fHours}
            </span>
          {/key}
        </div>
        <span class="{compact ? 'text-[8px] mt-1' : 'text-[10px] md:text-xs mt-2 md:mt-4'} text-text-secondary uppercase tracking-widest font-sans">Hours</span>
      </div>

      <span class="text-surface-800 {compact ? '-translate-y-2' : '-translate-y-4 md:-translate-y-8'} font-sans">:</span>
      
      <!-- Minutes -->
      <div class="flex flex-col items-center">
        <div class="relative h-[1em] overflow-hidden w-[1.2em] flex justify-center">
          {#key fMins}
            <span class="absolute" in:fly={{ y: '100%', duration: 400 }} out:fly={{ y: '-100%', duration: 400 }}>
              {fMins}
            </span>
          {/key}
        </div>
        <span class="{compact ? 'text-[8px] mt-1' : 'text-[10px] md:text-xs mt-2 md:mt-4'} text-text-secondary uppercase tracking-widest font-sans">Mins</span>
      </div>

      <span class="text-surface-800 {compact ? '-translate-y-2' : '-translate-y-4 md:-translate-y-8'} font-sans">:</span>
      
      <!-- Seconds -->
      <div class="flex flex-col items-center">
        <div class={`relative h-[1em] overflow-hidden w-[1.2em] flex justify-center ${colorClass}`}>
          {#key fSecs}
            <span class="absolute" in:fly={{ y: '100%', duration: 400 }} out:fly={{ y: '-100%', duration: 400 }}>
              {fSecs}
            </span>
          {/key}
        </div>
        <span class="{compact ? 'text-[8px] mt-1' : 'text-[10px] md:text-xs mt-2 md:mt-4'} text-text-secondary uppercase tracking-widest font-sans">Secs</span>
      </div>
      
    </div>
  {/if}
</div>

<style>
  /* Ensure container retains height during absolutely positioned transitons */
  .relative {
    display: inline-block;
  }
</style>
