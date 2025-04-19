'use client';

import { useEffect, useRef } from 'react';

interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number;  // how fast it moves
  scale?: number;  // how much bigger than the container
}

export function ParallaxImage({
  src,
  alt,
  speed = 0.15,
  scale = 1.3,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number;
    let maxOffset = 0;

    // 1) compute & apply initial centering
    function init() {
      const c = containerRef.current;
      const i = innerRef.current;
      if (!c || !i) return;

      const ch = c.getBoundingClientRect().height;
      const ih = ch * scale;
      maxOffset = (ih - ch) / 2;

      // absolutely position the inner element so it overflows equally top/bottom
      i.style.position = 'absolute';
      i.style.left     = '0';
      i.style.width    = '100%';
      i.style.height   = `${ih}px`;
      i.style.top      = `-${maxOffset}px`;
    }

    // 2) parallax-on‑scroll
    function update() {
      const c = containerRef.current;
      const i = innerRef.current;
      if (!c || !i) return;

      const rect = c.getBoundingClientRect();
      // how far container‑center is from viewport‑center
      const elemCenter     = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const rawOffset      = (elemCenter - viewportCenter) * speed;

      // clamp so you never go past the extra overflow
      const y = Math.max(Math.min(rawOffset,  maxOffset), -maxOffset);
      i.style.transform = `translate3d(0, ${y}px, 0)`;
    }

    init();
    update();
    window.addEventListener('resize', init,    { passive: true });
    window.addEventListener('scroll', () => {
      frame = window.requestAnimationFrame(update);
    }, { passive: true });

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('scroll',  () => {/* nothing */});
      cancelAnimationFrame(frame);
    };
  }, [speed, scale]);

  return (
    <div
      ref={containerRef}
      className="relative h-60 overflow-hidden"
    >
      <div
        ref={innerRef}
        className="will-change-transform"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize:    'cover',
          backgroundPosition:'center center',
        }}
        role="img"
        aria-label={alt}
      />
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
