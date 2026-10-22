// Lightweight, zero-dependency DOM-based celebratory confetti effect
export function fireConfetti() {
  const count = 60;
  const colors = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '99999';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  const particles = [];
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight * 0.45;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.floor(Math.random() * 8) + 6;
    const isCircle = Math.random() > 0.5;

    el.style.position = 'absolute';
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.width = `${size}px`;
    el.style.height = isCircle ? `${size}px` : `${size * 1.5}px`;
    el.style.backgroundColor = color;
    el.style.borderRadius = isCircle ? '50%' : '2px';
    el.style.transform = `translate3d(0, 0, 0)`;
    el.style.transition = 'all 1.8s cubic-bezier(0.1, 0.9, 0.2, 1)';
    el.style.opacity = '1';

    container.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 450 + 150;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity + 150; // gravity
    const rotation = Math.random() * 720 - 360;

    particles.push({ el, destX, destY, rotation });
  }

  // Trigger animation next tick
  requestAnimationFrame(() => {
    particles.forEach(({ el, destX, destY, rotation }) => {
      el.style.transform = `translate3d(${destX}px, ${destY}px, 0) rotate(${rotation}deg)`;
      el.style.opacity = '0';
    });
  });

  setTimeout(() => {
    container.remove();
  }, 2200);
}
