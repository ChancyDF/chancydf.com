(function () {
  if (window.__tinychancyRunning) return;
  window.__tinychancyRunning = true;

  const BASE_PATH = '/tinychancy';
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000, IDLE_MAX = 10000;
  const SIT_MIN = 10000, SIT_MAX = 60000;
  const Z_INDEX = 99999;

  // Physics Constants - Adjusted for "weighty" arcing
  const G = -2500;                // Gravity (px/s^2)
  const BOUNCE_RESTITUTION = 0.4; // Energy kept after bounce (40%)
  const SLIDE_FRICTION = 800;     // Ground friction
  const MOMENTUM_THRESH = 150;    // Min speed to keep moving
  const MAX_THROW_SPEED = 1800;   
  const MAX_DT = 0.033;           // 30fps floor for physics stability

  const REDUCED_MOTION = typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const idleSrc = `${BASE_PATH}/tinychancy_idle.gif`;
  const walkSrc = `${BASE_PATH}/tinychancy_walk.gif`;
  const sitSrc = `${BASE_PATH}/tinychancy_sit.gif`;
  const dangleSrc = `${BASE_PATH}/tinychancy_dangle.gif`;

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const randBetween = (a, b) => Math.random() * (b - a) + a;
  const sign = (n) => (n < 0 ? -1 : n > 0 ? 1 : 0);
  
  let cachedSize = { w: 50, h: 50 };

  const main = document.createElement('img');
  main.id = 'tinychancy';
  main.setAttribute('aria-hidden', 'true');
  main.draggable = false;
  Object.assign(main.style, {
    position: 'fixed', bottom: '0', left: '0',
    transformOrigin: 'center bottom',
    willChange: 'transform, left, bottom',
    zIndex: String(Z_INDEX),
    pointerEvents: 'auto', userSelect: 'none', touchAction: 'none', cursor: 'grab',
  });

  let clone = null;
  let overlay = null;

  let currentScale = BASE_SCALE;
  let centerX = window.innerWidth / 2;
  let y = 0;
  let vx = 0, vy = 0;
  let facing = 1;

  let moving = false, direction = 0, targetX = null;
  let lastTime = null, rafId = null;
  let chooseTimer = null, sitTimer = null;
  let sitting = false, dragging = false, airborne = false, sliding = false;
  
  let dragOffsetX = 0, dragOffsetY = 0;
  const samples = [];
  const SAMPLE_WINDOW_MS = 80;
  let activePointerId = null;

  const preloadList = [idleSrc, walkSrc, sitSrc, dangleSrc].map(src => {
    const i = new Image(); i.src = src; return i;
  });

  function updateSizeCache() {
    const r = main.getBoundingClientRect();
    if (r && r.width > 0) cachedSize = { w: r.width, h: r.height };
  }

  function render(el, cx, cy) {
    el.style.left = (cx - cachedSize.w / 2) + 'px';
    el.style.bottom = cy + 'px';
    el.style.transform = `scale(${currentScale}) scaleX(${facing}) translateZ(0)`;
  }

  function ensureClone() {
    if (clone) return;
    clone = document.createElement('img');
    clone.setAttribute('aria-hidden', 'true');
    Object.assign(clone.style, {
      position: 'fixed', transformOrigin: 'center bottom',
      pointerEvents: 'none', zIndex: String(Z_INDEX), display: 'none'
    });
    document.body.appendChild(clone);
  }

  function startIdleState() {
    if (sitTimer || chooseTimer) return;
    moving = false; airborne = false; sliding = false; y = 0;
    main.src = idleSrc;
    chooseTimer = setTimeout(() => {
      chooseTimer = null;
      if (!REDUCED_MOTION && Math.random() < 0.2) {
        sitting = true;
        main.src = sitSrc;
        sitTimer = setTimeout(() => { sitTimer = null; sitting = false; startIdleState(); }, randBetween(SIT_MIN, SIT_MAX));
      } else {
        moving = true;
        targetX = randBetween(0, window.innerWidth);
        direction = targetX > centerX ? 1 : -1;
        facing = direction;
        main.src = walkSrc;
      }
    }, randBetween(IDLE_MIN, IDLE_MAX));
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    activePointerId = e.pointerId;
    main.setPointerCapture?.(e.pointerId);
    dragging = true; moving = false; sitting = false; airborne = false;
    clearTimeout(chooseTimer); clearTimeout(sitTimer);
    dragOffsetX = centerX - e.clientX;
    dragOffsetY = (window.innerHeight - y) - e.clientY;
    main.src = dangleSrc;
    samples.length = 0;
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    const now = performance.now();
    samples.push({ t: now, x: e.clientX, y: e.clientY });
    while (samples.length && now - samples[0].t > SAMPLE_WINDOW_MS) samples.shift();

    centerX = e.clientX + dragOffsetX;
    y = Math.max(0, window.innerHeight - (e.clientY + dragOffsetY));
    
    // Immediate wrap during drag
    const W = window.innerWidth;
    centerX = ((centerX % W) + W) % W;
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    const release = (() => {
      if (samples.length < 2) return { vx: 0, vy: 0 };
      const a = samples[0], b = samples[samples.length - 1];
      const dt = (b.t - a.t) / 1000;
      return dt <= 0 ? { vx: 0, vy: 0 } : { vx: (b.x - a.x) / dt, vy: (a.y - b.y) / dt };
    })();
    
    const v = capVec(release.vx, release.vy, MAX_THROW_SPEED);
    vx = v.vx; vy = v.vy;
    airborne = true;
  }

  function capVec(vx, vy, max) {
    const s = Math.hypot(vx, vy);
    return s > max ? { vx: (vx / s) * max, vy: (vy / s) * max } : { vx, vy };
  }

  function rafTick(ts) {
    if (!lastTime) lastTime = ts;
    const dt = Math.min(MAX_DT, (ts - lastTime) / 1000);
    lastTime = ts;

    const W = window.innerWidth;

    if (!dragging) {
      if (airborne) {
        vy += G * dt;
        centerX += vx * dt;
        y += vy * dt;

        // Bounce Logic
        if (y <= 0) {
          y = 0;
          vy = Math.abs(vy) * BOUNCE_RESTITUTION;
          vx *= 0.8; // Air-to-ground friction hit
          if (vy < 200) { 
            vy = 0; 
            airborne = false; 
            sliding = Math.abs(vx) > 50; 
            if (!sliding) startIdleState();
          }
        }
      } else if (sliding) {
        vx -= sign(vx) * SLIDE_FRICTION * dt;
        centerX += vx * dt;
        if (Math.abs(vx) < 10) { vx = 0; sliding = false; startIdleState(); }
      } else if (moving) {
        centerX += direction * (cachedSize.w * 1.5) * dt;
        const dist = Math.abs(centerX - targetX);
        if (dist < 10 && !((centerX + cachedSize.w/2) > W || (centerX - cachedSize.w/2) < 0)) {
          moving = false; startIdleState();
        }
      }

      // Screen Wrap Modulo
      centerX = ((centerX % W) + W) % W;
    }

    render(main, centerX, y);

    // Visual Portal Mirroring
    ensureClone();
    const half = cachedSize.w / 2;
    if (centerX + half > W) {
      clone.style.display = 'block';
      clone.src = main.src;
      facing = main.style.transform.includes('scaleX(-1)') ? -1 : 1;
      render(clone, centerX - W, y);
    } else if (centerX - half < 0) {
      clone.style.display = 'block';
      clone.src = main.src;
      render(clone, centerX + W, y);
    } else {
      clone.style.display = 'none';
    }

    rafId = requestAnimationFrame(rafTick);
  }

  function init() {
    document.body.appendChild(main);
    updateSizeCache();
    adjustScaleForScreen();
    startIdleState();
    main.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    rafId = requestAnimationFrame(rafTick);
  }

  // Preload and Start
  let rem = preloadList.length;
  preloadList.forEach(img => {
    img.onload = img.onerror = () => { if (--rem === 0) init(); };
  });

  window.tinychancyDestroy = () => {
    cancelAnimationFrame(rafId);
    main.remove(); if (clone) clone.remove();
    window.__tinychancyRunning = false;
  };
})();
