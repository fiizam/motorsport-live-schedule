<script>
  export let current = 'f1'; // 'f1' or 'motogp'
</script>

<div class="inline-flex relative p-1 rounded-full glass-panel border-editorial overflow-hidden">
  <!-- Sliding indicator -->
  <div 
    class={`absolute top-1 bottom-1 w-1/2 rounded-full transition-transform duration-500 cubic-bezier(0.22, 1, 0.36, 1) ${current === 'f1' ? 'translate-x-0 bg-f1-red' : 'translate-x-[96%] bg-motogp-blue'}`}
  ></div>
  
  <a 
    href="/f1" 
    class={`relative z-10 px-6 py-2 text-xs font-bold tracking-widest uppercase transition-colors duration-300 ${current === 'f1' ? 'text-white' : 'text-text-secondary hover:text-white'}`}
  >
    Formula 1
  </a>
  <a 
    href="/motogp" 
    class={`relative z-10 px-6 py-2 text-xs font-bold tracking-widest uppercase transition-colors duration-300 ${current === 'motogp' ? 'text-white' : 'text-text-secondary hover:text-white'}`}
  >
    MotoGP
  </a>
</div>
