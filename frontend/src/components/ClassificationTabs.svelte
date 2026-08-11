<script lang="ts">
  import { onMount } from 'svelte';

  export let hasSprint = false;
  export let raceFinished = false;
  export let sprintFinished = false;
  
  interface $$Slots {
    'main-race': Record<string, never>;
    'sprint': Record<string, never>;
  }

  // Determine default tab
  let activeTab = 'MAIN RACE';
  
  onMount(() => {
    if (raceFinished) {
      activeTab = 'MAIN RACE';
    } else if (hasSprint && sprintFinished && !raceFinished) {
      activeTab = 'SPRINT';
    } else {
      activeTab = 'MAIN RACE';
    }
  });

  function setTab(tab) {
    activeTab = tab;
  }
</script>

<div class="w-full">
  <!-- Segmented Control Tab Header -->
  <div class="flex items-center w-full max-w-sm bg-surface-100 p-1 rounded-full mb-8">
    <button 
      class={`flex-1 text-center py-2 text-[10px] tracking-widest font-bold uppercase transition-all rounded-full ${activeTab === 'MAIN RACE' ? 'bg-white text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
      on:click={() => setTab('MAIN RACE')}
    >
      Main Race
    </button>
    
    {#if hasSprint}
      <button 
        class={`flex-1 text-center py-2 text-[10px] tracking-widest font-bold uppercase transition-all rounded-full ${activeTab === 'SPRINT' ? 'bg-white text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
        on:click={() => setTab('SPRINT')}
      >
        Sprint
      </button>
    {/if}
  </div>

  <!-- Tab Content (Respects prefers-reduced-motion via CSS) -->
  <div class="relative min-h-[300px]">
    {#if activeTab === 'MAIN RACE'}
      <div class="animate-fade-up">
        <slot name="main-race" />
      </div>
    {/if}

    {#if activeTab === 'SPRINT'}
      <div class="animate-fade-up">
        <slot name="sprint" />
      </div>
    {/if}
  </div>
</div>
