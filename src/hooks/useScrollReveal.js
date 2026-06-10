import { useEffect } from "react";

/**
 * Custom hook that automatically observes elements with the class `.reveal-on-scroll`.
 * When they enter the viewport, the class `.revealed` is added.
 * Uses a MutationObserver to ensure dynamically loaded elements are also caught.
 * 
 * @param {any} dependency Optional dependency to force-rebind the observer
 */
export default function useScrollReveal(dependency = null) {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -50px 0px", // Trigger when element is 50px into the viewport
      threshold: 0.05, // Trigger as soon as 5% of the element is visible
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const observeExisting = () => {
      const elements = document.querySelectorAll(".reveal-on-scroll:not(.revealed)");
      elements.forEach((el) => {
        revealObserver.observe(el);
      });
    };

    // Initial check
    observeExisting();

    // MutationObserver to observe DOM changes for dynamically loaded sections/cards
    const mutationObserver = new MutationObserver(() => {
      observeExisting();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      revealObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [dependency]);
}
