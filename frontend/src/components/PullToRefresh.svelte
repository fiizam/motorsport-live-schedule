<script>
  import { onMount } from 'svelte';
  
  let startY = 0;
  let currentY = 0;
  let isPulling = false;
  let refreshing = false;
  let pullDistance = 0;
  const THRESHOLD = 70;

  onMount(() => {
    // Only enable pull to refresh on mobile devices / touch
    if (!('ontouchstart' in window)) return;

    const handleTouchStart = (e) => {
      // Only start if we are at the very top of the page
      if (window.scrollY <= 10) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling || refreshing) return;
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      
      if (diff > 0 && window.scrollY <= 10) {
        // Prevent default scrolling only when pulling down from the top
        if (e.cancelable) e.preventDefault();
        
        // Add some resistance (damping)
        pullDistance = Math.min(diff * 0.4, THRESHOLD + 20); 
      } else {
        isPulling = false;
        pullDistance = 0;
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance >= THRESHOLD && !refreshing) {
        refreshing = true;
        pullDistance = THRESHOLD;
        // Trigger a hard reload
        window.location.reload();
      } else {
        isPulling = false;
        pullDistance = 0;
      }
    };

    // Use passive: false for touchmove to allow preventDefault
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  });
</script>

{#if pullDistance > 0}
  <div 
    class="fixed left-0 w-full z-50 flex justify-center pointer-events-none transition-transform" 
    style="top: 0px; transform: translateY({Math.max(0, pullDistance - 20)}px);"
  >
    <div 
      class="bg-surface-50 border border-editorial rounded-full shadow-lg p-2 flex items-center justify-center {refreshing ? 'animate-spin' : ''}" 
      style="width: 36px; height: 36px; opacity: {Math.min(pullDistance / THRESHOLD, 1)}; transform: rotate({pullDistance * 2}deg);"
    >
      <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>
  </div>
{/if}
