import React, { useEffect } from "react";

// Global animated golden orbs background with subtle parallax
function GlobalBackgroundOrbs() {
  useEffect(() => {
    const wraps = document.querySelectorAll('[data-orb-speed]');
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      wraps.forEach((wrap) => {
        const speed = parseFloat(wrap.getAttribute('data-orb-speed')) || 0;
        wrap.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="parallax-wrap orb-wrap-a" data-orb-speed="0.020">
        <div className="gold-orb" />
      </div>
      <div className="parallax-wrap orb-wrap-b" data-orb-speed="0.015">
        <div className="gold-orb" />
      </div>
      <div className="parallax-wrap orb-wrap-c" data-orb-speed="0.025">
        <div className="gold-orb" />
      </div>
      <div className="parallax-wrap orb-wrap-d" data-orb-speed="0.018">
        <div className="gold-orb" />
      </div>
      <div className="parallax-wrap orb-wrap-e" data-orb-speed="0.022">
        <div className="gold-orb" />
      </div>
      <div className="parallax-wrap orb-wrap-f" data-orb-speed="0.019">
        <div className="gold-orb" />
      </div>
      <div className="parallax-wrap orb-wrap-g" data-orb-speed="0.024">
        <div className="gold-orb" />
      </div>
      <div className="parallax-wrap orb-wrap-h" data-orb-speed="0.021">
        <div className="gold-orb" />
      </div>
    </div>
  );
}

export default GlobalBackgroundOrbs;