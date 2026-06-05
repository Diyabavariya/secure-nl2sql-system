import React, { useRef, useEffect } from 'react';

const PARTICLE_COUNT = 24;
const COLORS = ['#00eefc', '#b3c5ff', '#7df4ff'];

export default function NeuralBackground({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 2 + 1;

      Object.assign(particle.style, {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: COLORS[i % COLORS.length],
        borderRadius: '50%',
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: String(Math.random() * 0.4 + 0.1),
        pointerEvents: 'none',
        zIndex: '1',
      });

      container.appendChild(particle);
      particles.push(particle);

      particle.animate(
        [
          { transform: 'translate(0, 0)', opacity: particle.style.opacity },
          {
            transform: `translate(${Math.random() * 80 - 40}px, ${Math.random() * 80 - 40}px)`,
            opacity: '0',
          },
        ],
        {
          duration: Math.random() * 8000 + 10000,
          iterations: Infinity,
          direction: 'alternate',
          easing: 'ease-in-out',
        }
      );
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full neural-bg overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary-container/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
