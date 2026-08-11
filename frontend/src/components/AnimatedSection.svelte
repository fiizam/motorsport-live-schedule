<script>
  import { onMount } from 'svelte';

  export let delay = 0;
  export let animation = 'fade-up'; // fade-up, slide-in, etc.
  
  let sectionRef;
  let isVisible = false;

  onMount(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      isVisible = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible = true;
            // Only trigger once
            observer.unobserve(sectionRef);
          }
        });
      },
      {
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      }
    );

    if (sectionRef) {
      observer.observe(sectionRef);
    }

    return () => {
      if (sectionRef) observer.unobserve(sectionRef);
    };
  });
</script>

<div
  bind:this={sectionRef}
  class={`transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1) ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0'
  }`}
  style={`
    ${animation === 'fade-up' && !isVisible ? 'transform: translateY(30px);' : ''}
    transition-delay: ${delay}ms;
  `}
>
  <slot />
</div>
