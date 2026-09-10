/* Scroll-driven wireframe scenes with localized pointer displacement. No particles. */
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
  let layoutDirty = true;
  let scrollDirty = true;
  let scenePosition = 0;
  let targetScene = 0;
  let anchors = [];
  let lastColor = '';
  const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim();
  const scenes = [
    { id: 'hero', color: [243, 239, 229], skew: 0.02, waveX: 16, waveY: 12, phase: 0, depth: 0.04 },
    { id: 'about', color: [222, 250, 228], skew: 0.09, waveX: 74, waveY: 38, phase: 0.8, depth: 0.16 },
    { id: 'experience', color: [222, 244, 255], skew: -0.15, waveX: 34, waveY: 100, phase: 1.6, depth: 0.3 },
    { id: 'projects', color: [255, 244, 216], skew: 0.18, waveX: 120, waveY: 62, phase: 2.4, depth: -0.22 },
    { id: 'beyond', color: [211, 251, 246], skew: -0.12, waveX: 66, waveY: 114, phase: 3.2, depth: 0.2 },
    { id: 'contact', color: [243, 239, 229], skew: 0, waveX: 0, waveY: 0, phase: 4, depth: 0 }
  ].map(scene => {
    const element = document.getElementById(scene.id);
    if (!element) throw new Error('Missing background section: ' + scene.id);
    return { ...scene, element };
  });

  function readLayout() {
    anchors = scenes.map(scene => Math.max(0, scene.element.offsetTop - height * 0.3));
    layoutDirty = false;
    scrollDirty = true;
  }

  function readScroll() {
    scrollDirty = false;
    const scroll = Math.max(0, window.scrollY);
    let index = 0;
    while (index < scenes.length - 1 && scroll > 0 && scroll >= anchors[index + 1]) index++;
    const next = Math.min(index + 1, scenes.length - 1);
    const progress = next === index ? 0 : Math.min(1, (scroll - anchors[index]) / Math.max(1, anchors[next] - anchors[index]));
    targetScene = index + Math.max(0, progress);
  }

  function sceneValues() {
    const index = Math.min(scenes.length - 1, Math.floor(scenePosition));
    const from = scenes[index];
    const to = scenes[Math.min(index + 1, scenes.length - 1)];
    const fraction = scenePosition - index;
    const blend = fraction * fraction * (3 - 2 * fraction);
    const mix = (a, b) => a + (b - a) * blend;
    const values = { color: from.color.map((channel, i) => Math.round(mix(channel, to.color[i]))) };
    for (const key of ['skew', 'waveX', 'waveY', 'phase', 'depth']) values[key] = mix(from[key], to[key]);
    return values;
  }

  function vertex(x, y, first, scene) {
    const u = (x - width / 2) / width;
    const v = (y - height / 2) / height;
    x += v * width * scene.skew + Math.sin(v * 4 + scene.phase) * scene.waveX;
    y += Math.sin(u * 5 + scene.phase) * scene.waveY;
    x = width / 2 + (x - width / 2) * (1 + v * scene.depth);
    const dx = x - pointer.x;
    const dy = y - pointer.y;
    const distance = Math.hypot(dx, dy);
    const influence = Math.max(0, 1 - distance / 280);
    const offset = influence * influence * 42 * pointer.strength / Math.max(1, distance);
    const px = x + dx * offset;
    const py = y + dy * offset;
    if (first) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  function draw() {
    const scene = sceneValues();
    const color = scene.color.join(', ');
    if (color !== lastColor) {
      document.documentElement.style.setProperty('--scene-rgb', color);
      lastColor = color;
    }
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = lineColor;
    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 1.65;
    const spacing = Math.max(72, Math.ceil(Math.max(width, height) / 40));
    const segment = spacing / 2;
    const margin = Math.ceil(Math.max(240, width * 0.2, height * 0.2) / spacing) * spacing;
    ctx.beginPath();
    for (let x = -margin; x <= width + margin; x += spacing) {
      for (let y = -margin; y <= height + margin; y += segment) {
        vertex(x, y, y === -margin, scene);
      }
    }
    for (let y = -margin; y <= height + margin; y += spacing) {
      for (let x = -margin; x <= width + margin; x += segment) {
        vertex(x, y, x === -margin, scene);
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
    if (layoutDirty) readLayout();
    if (scrollDirty) readScroll();
    const targetStrength = pointer.active ? 1 : 0;
    const moving = Math.abs(pointer.targetX - pointer.x) > 0.1
      || Math.abs(pointer.targetY - pointer.y) > 0.1
      || Math.abs(targetStrength - pointer.strength) > 0.001;
    const changingScene = Math.abs(targetScene - scenePosition) > 0.001;
    if (changingScene) {
      scenePosition += (targetScene - scenePosition) * ease;
      if (Math.abs(targetScene - scenePosition) <= 0.001) scenePosition = targetScene;
    }
    if (moving || changingScene || dirty) {
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
    layoutDirty = true;
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
      layoutDirty = true;
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
  window.addEventListener('scroll', () => { scrollDirty = true; }, { passive: true });
  new ResizeObserver(() => { layoutDirty = true; }).observe(document.body);
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
