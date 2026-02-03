(function () {
  if (window.__tinychancyRunning) return;
  window.__tinychancyRunning = true;

  const BASE_PATH = '/tinychancy';
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000, IDLE_MAX = 10000;
  const SIT_MIN = 10000, SIT_MAX = 60000;
  const Z_INDEX = 99999;

  // Realistic Physics Constants
  const G = -2500;                // Gravity (px/s^2)
  const BOUNCE_RESTITUTION = 0.4; // Energy kept after bounce (0.0 to 1.0)
  const SLIDE_FRICTION = 800;     // Ground friction
  const MOMENTUM_THRESH = 150;    // Minimum speed to start a slide/arc
  const MAX_THROW_SPEED = 2000;   // Terminal velocity for mouse release
  const MAX_DT = 0.016;           // Physics step cap (60fps)

  const REDUCED_MOTION = typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const idleSrc = `${BASE_PATH}/tinychancy_idle.gif`;
  const walkSrc = `${BASE_PATH}/tinychancy_walk.gif`;
  const sitSrc = `${BASE_PATH}/tinychancy_sit.gif`;
  const dangleSrc = `${BASE_PATH}/tinychancy_dangle.gif`;

  const sign = (n) => (n < 0 ? -1 : n > 0 ? 1 : 0);

  // State
  let cachedSize = { w: 50, h: 50 };
  let centerX = window.innerWidth / 2;
  let y = 0;
  let vx = 0, vy = 0;
  let facing = 1;
  let moving = false, targetX = null;
  let lastTime = null, rafId = null;
  let chooseTimer = null, sitTimer = null;
  let sitting = false, dragging = false, airborne = false, sliding = false;
  let dragOffsetX = 0, dragOffsetY = 0;

  const samples = [];
  const SAMPLE_WINDOW_MS = 100;
  let activePointerId = null;

  // Create Sprites
  const main = document.createElement('img');
  const clone = document.createElement('img');
  [main, clone].forEach(el => {
    el.alt = '';
    el.setAttribute('aria-hidden', 'true');
    el.draggable = false;
    Object.assign(el.style, {
      position: 'fixed', bottom: '0', left: '0',
      transformOrigin: 'center bottom',
      willChange: 'transform, left, bottom',
      zIndex: String(Z_INDEX),
      pointerEvents: 'auto', userSelect: 'none',
      touchAction: 'none', display: 'none' // Hide until loaded
    });
  });
  main.style.cursor = 'grab';
  clone.style.pointerEvents = 'none';

  const preloadList = [idleSrc, walkSrc, sitSrc, dangleSrc].map(src => {
    const i = new Image(); i.src = src; return i;
  });

  function updateSizeCache() {
    const r = main.getBoundingClientRect();
    if (r && r.width > 0) {
      cachedSize = { w: r.width, h: r.height };
    }
  }

  function syncSprites(x, y, src, face) {
    const W = window.innerWidth;
    // Normalize X to stay within [0, W]
    let normalizedX = ((x % W) + W) % W;
    
    [main, clone].forEach(el => {
      el.src = src;
      el.style.bottom = y + 'px';
      el.style.transform = `scale(${BASE_SCALE}) scaleX(${face}) translateZ(0)`;
      el.style.display = 'block';
    });

    main.style.left = (normalizedX - cachedSize.w / 2) + 'px';

    // Portal logic: if overlapping edge, show clone on other side
    if (normalizedX + cachedSize.w / 2 > W) {
      clone.style.left = (normalizedX - W - cachedSize.w / 2) + 'px';
      clone.style.visibility = 'visible';
    } else if (normalizedX - cachedSize.w / 2 < 0) {
      clone.style.left = (normalizedX + W - cachedSize.w / 2) + 'px';
      clone.style.visibility = 'visible';
    } else {
      clone.style.visibility = 'hidden';
    }
    
    return normalizedX;
  }

  function clearAllTimers() {
    clearTimeout(chooseTimer);
    clearTimeout(sitTimer);
  }

  function startIdleState() {
    clearAllTimers();
    sitting = moving = sliding = airborne = false;
    y = vy = vx = 0;
    main.style.cursor = 'grab';
    main.src = idleSrc;
    
    chooseTimer = setTimeout(() => {
      if (REDUCED_MOTION) return startIdleState();
      if (chance(0.15)) {
        sitting = true;
        main.src = sitSrc;
        sitTimer = setTimeout(startIdleState, randBetween(SIT_MIN, SIT_MAX));
      } else {
        moving = true;
        targetX = randBetween(0, window.innerWidth);
        facing = targetX > centerX ? 1 : -1;
        main.src = walkSrc;
      }
    }, randBetween(IDLE_MIN, IDLE_MAX));
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    activePointerId = e.pointerId;
    main.setPointerCapture(e.pointerId);
    
    dragging = true;
    clearAllTimers();
    sitting = moving = sliding = airborne = false;
    
    dragOffsetX = centerX - e.clientX;
    dragOffsetY = (window.innerHeight - y) - e.clientY;
    
    main.src = dangleSrc;
    main.style.cursor = 'grabbing';
    samples.length = 0;
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    centerX = e.clientX + dragOffsetX;
    y = Math.max(0, window.innerHeight - (e.clientY + dragOffsetY));
    samples.push({ t: performance.now(), x: e.clientX, y: e.clientY });
    if (samples.length > 10) samples.shift();
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    main.releasePointerCapture(e.pointerId);
    
    const release = (function() {
      if (samples.length < 2) return { vx: 0, vy: 0 };
      const a = samples[0], b = samples[samples.length - 1];
      const dt = (b.t - a.t) / 1000;
      return { vx: (b.x - a.x) / dt, vy: (a.y - b.y) / dt };
    })();

    vx = clamp(release.vx, -MAX_THROW_SPEED, MAX_THROW_SPEED);
    vy = clamp(release.vy, -MAX_THROW_SPEED, MAX_THROW_SPEED);
    
    if (Math.abs(vy) > 100 || y > 0) airborne = true;
    else if (Math.abs(vx) > MOMENTUM_THRESH) sliding = true;
    else startIdleState();
  }

  function rafTick(ts) {
    if (!lastTime) lastTime = ts;
    const dt = Math.min((ts - lastTime) / 1000, MAX_DT);
    lastTime = ts;

    if (!dragging) {
      if (airborne) {
        vy += G * dt;
        centerX += vx * dt;
        y += vy * dt;

        if (y <= 0) {
          y = 0;
          vy = -vy * BOUNCE_RESTITUTION; // Bounce
          vx *= 0.8; // Air resistance on impact
          if (Math.abs(vy) < 150) {
            vy = 0;
            airborne = false;
            if (Math.abs(vx) > MOMENTUM_THRESH) sliding = true;
            else startIdleState();
          }
        }
        if (Math.abs(vx) > 10) facing = sign(vx);
      } else if (sliding) {
        vx -= sign(vx) * SLIDE_FRICTION * dt;
        centerX += vx * dt;
        if (Math.abs(vx) < 50) startIdleState();
      } else if (moving) {
        const step = cachedSize.w * dt * facing;
        centerX += step;
        const dist = Math.abs(centerX - targetX);
        if (dist < 5) startIdleState();
      }
    }

    centerX = syncSprites(centerX, y, main.src, facing);
    requestAnimationFrame(rafTick);
  }

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  // Initialize
  let loaded = 0;
  preloadList.forEach(img => {
    img.onload = () => {
      if (++loaded === preloadList.length) {
        document.body.appendChild(main);
        document.body.appendChild(clone);
        updateSizeCache();
        adjustScaleForScreen();
        // Set initial position without flash
        centerX = window.innerWidth / 2;
        syncSprites(centerX, 0, idleSrc, 1);
        startIdleState();
        rafId = requestAnimationFrame(rafTick);
      }
    };
  });

  function adjustScaleForScreen() {
    const w = window.innerWidth;
    currentScale = w < 400 ? BASE_SCALE * 0.6 : w < 700 ? BASE_SCALE * 0.8 : BASE_SCALE;
    updateSizeCache();
  }

  main.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', adjustScaleForScreen);

  window.tinychancyDestroy = () => {
    cancelAnimationFrame(rafId);
    clearAllTimers();
    main.remove(); clone.remove();
    window.__tinychancyRunning = false;
  };
})();
