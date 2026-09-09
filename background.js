/* A drafting grid with localized pointer displacement. No particles or ambient animation. */
(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('Interactive grid unavailable; using the static CSS grid.');
    return;
  }

  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canAnimate = () => !motionQuery.matches && window.SiteMotion.enabled();
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, active: false };
  let width = 0;
  let height = 0;
  let frameId = null;
  let previousTime = 0;
  let dirty = true;
  const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim();

  function vertex(x, y, first) {
    const dx = x - pointer.x;
    const dy = y - pointer.y;
    const distance = Math.hypot(dx, dy);
    const influence = Math.max(0, 1 - distance / 220);
    const offset = influence * influence * 18 * pointer.strength / Math.max(1, distance);
    const px = x + dx * offset;
    const py = y + dy * offset;
    if (first) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = lineColor;
    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 0.65;
    const spacing = Math.max(72, Math.ceil(Math.max(width, height) / 40));
    const segment = spacing / 2;
    ctx.beginPath();
    for (let x = 0; x <= width + spacing; x += spacing) {
      for (let y = -spacing; y <= height + spacing; y += segment) {
        vertex(x, y, y === -spacing);
      }
    }
    for (let y = 0; y <= height + spacing; y += spacing) {
      for (let x = -spacing; x <= width + spacing; x += segment) {
        vertex(x, y, x === -spacing);
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    dirty = false;
  }

  function stop() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
  }

  function frame(now) {
    if (!canAnimate() || document.hidden) {
      stop();
      window.SiteMotion.refresh();
      return;
    }
    frameId = requestAnimationFrame(frame);
    const delta = previousTime ? Math.min(3, (now - previousTime) / 16.667) : 1;
    previousTime = now;
    const ease = 1 - Math.pow(0.82, delta);
    const targetStrength = pointer.active ? 1 : 0;
    const moving = Math.abs(pointer.targetX - pointer.x) > 0.1
      || Math.abs(pointer.targetY - pointer.y) > 0.1
      || Math.abs(targetStrength - pointer.strength) > 0.001;
    if (moving || dirty) {
      pointer.x += (pointer.targetX - pointer.x) * ease;
      pointer.y += (pointer.targetY - pointer.y) * ease;
      pointer.strength += (targetStrength - pointer.strength) * ease;
      draw();
    }
  }

  function start() {
    if (frameId !== null || !canAnimate() || document.hidden) return;
    previousTime = 0;
    frameId = requestAnimationFrame(frame);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = true;
    draw();
  }

  function resetPointer() {
    pointer.active = false;
  }

  function syncMotion() {
    resetPointer();
    if (!canAnimate()) {
      stop();
      pointer.strength = 0;
      draw();
    } else {
      start();
    }
  }

  window.addEventListener('pointermove', event => {
    if (!canAnimate() || !hoverQuery.matches || event.pointerType === 'touch') return;
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
    pointer.active = true;
  }, { passive: true });
  document.addEventListener('pointerleave', resetPointer);
  window.addEventListener('pointercancel', resetPointer);
  window.addEventListener('blur', resetPointer);
  window.addEventListener('resize', resize);
  hoverQuery.addEventListener('change', resetPointer);
  motionQuery.addEventListener('change', syncMotion);
  document.addEventListener('motionchange', syncMotion);
  document.addEventListener('visibilitychange', () => {
    resetPointer();
    if (document.hidden) stop();
    else start();
  });

  resize();
  document.documentElement.classList.add('grid-ready');
  syncMotion();
})();
