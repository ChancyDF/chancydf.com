(function () {
  if (window.__tinychancyRunning) return;
  window.__tinychancyRunning = true;

  const BASE_PATH = '/tinychancy';
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000, IDLE_MAX = 10000;
  const SIT_MIN = 10000, SIT_MAX = 60000;
  const Z_INDEX = 99999;

  const G = -2000;
  const SLIDE_FRICTION = 600;
  const MOMENTUM_THRESH = 120;
  const MAX_THROW_SPEED = 1400;
  const MAX_RUNAWAY_SPEED = 2000;
  const MAX_DT = 0.05;

  const REDUCED_MOTION = typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const idleSrc = `${BASE_PATH}/tinychancy_idle.gif`;
  const walkSrc = `${BASE_PATH}/tinychancy_walk.gif`;
  const sitSrc = `${BASE_PATH}/tinychancy_sit.gif`;
  const dangleSrc = `${BASE_PATH}/tinychancy_dangle.gif`;

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const randBetween = (a, b) => Math.random() * (b - a) + a;
  const chance = (p) => Math.random() < p;
  const sign = (n) => (n < 0 ? -1 : n > 0 ? 1 : 0);
  
  function capVec(vx, vy, max) {
    const s = Math.hypot(vx, vy);
    if (s > max && s > 0) {
      const k = max / s;
      return { vx: vx * k, vy: vy * k };
    }
    return { vx, vy };
  }

  let cachedSize = { w: 50, h: 50 };

  const main = document.createElement('img');
  main.id = 'tinychancy';
  main.alt = '';
  main.setAttribute('aria-hidden', 'true');
  main.draggable = false;
  Object.assign(main.style, {
    position: 'fixed',
    bottom: '0',
    left: '0',
    transformOrigin: 'center bottom',
    transform: `scale(${BASE_SCALE}) scaleX(1) translateZ(0)`,
    willChange: 'transform, left, bottom',
    zIndex: String(Z_INDEX),
    pointerEvents: 'auto',
    userSelect: 'none',
    touchAction: 'none',
    cursor: 'grab',
  });

  let clone = null;
  let overlay = null;

  let currentScale = BASE_SCALE;
  let centerX = 0;
  let y = 0;
  let vx = 0, vy = 0;
  let facing = 1;

  let moving = false, direction = 0, targetX = null;
  let lastTime = null, rafId = null;

  let chooseTimer = null, flipBackTimer = null, sitTimer = null;
  let sitting = false, dragging = false, airborne = false, sliding = false;
  let bounced = false, maxYThisAir = 0;

  let dragOffsetX = 0;
  let dragOffsetY = 0;

  const samples = [];
  const SAMPLE_WINDOW_MS = 80;
  let activePointerId = null;

  const preloadList = [idleSrc, walkSrc, sitSrc, dangleSrc].map((src) => {
    const i = new Image();
    i.src = src;
    return i;
  });

  function updateSizeCache() {
    const r = main.getBoundingClientRect();
    if (r && r.width > 0) {
      cachedSize = { w: r.width, h: r.height };
    } else if (preloadList[0].width) {
      cachedSize = {
        w: preloadList[0].width * currentScale,
        h: preloadList[0].height * currentScale
      };
    }
  }

  function renderFromCenter(elRef, cx) {
    elRef.style.left = (cx - cachedSize.w / 2) + 'px';
  }

  function renderBottom(elRef, bottomPx) {
    elRef.style.bottom = bottomPx + 'px';
  }

  function applyScaleAndFacing(elRef) {
    elRef.style.transform = `scale(${currentScale}) scaleX(${facing}) translateZ(0)`;
  }

  function setFacing(newFacing) {
    if (facing === newFacing) return;
    facing = newFacing;
    applyScaleAndFacing(main);
    if (clone) applyScaleAndFacing(clone);
  }

  function adjustScaleForScreen() {
    const w = window.innerWidth;
    const prev = currentScale;
    currentScale = w < 400 ? BASE_SCALE * 0.6 : w < 700 ? BASE_SCALE * 0.8 : BASE_SCALE;
    if (currentScale !== prev) {
      applyScaleAndFacing(main);
      if (clone) applyScaleAndFacing(clone);
      updateSizeCache();
    }
  }

  function clearAllTimers() {
    if (chooseTimer) { clearTimeout(chooseTimer); chooseTimer = null; }
    if (flipBackTimer) { clearTimeout(flipBackTimer); flipBackTimer = null; }
    if (sitTimer) { clearTimeout(sitTimer); sitTimer = null; }
  }

  function startSitting(durationMs) {
    clearAllTimers();
    sitting = true; moving = false; direction = 0; targetX = null;
    airborne = false; sliding = false; vx = 0; vy = 0; y = 0;
    setFacing(1);
    main.src = sitSrc;
    main.style.cursor = 'auto';
    sitTimer = setTimeout(() => {
      sitTimer = null;
      sitting = false;
      startIdleState();
    }, durationMs);
  }

  function startIdleState() {
    clearAllTimers();
    sitting = false; moving = false; direction = 0; targetX = null;
    airborne = false; sliding = false; vx = 0; vy = 0; y = 0;
    main.style.transformOrigin = 'center bottom';
    main.style.cursor = 'grab';
    if (facing === -1) {
      flipBackTimer = setTimeout(() => {
        setFacing(1);
        flipBackTimer = null;
      }, 1000);
    }
    const wait = randBetween(IDLE_MIN, IDLE_MAX);
    chooseTimer = setTimeout(() => {
      chooseTimer = null;
      if (!REDUCED_MOTION && chance(1 / 10)) {
        startSitting(randBetween(SIT_MIN, SIT_MAX));
      } else if (!REDUCED_MOTION) {
        prepareAndStartMove();
      } else {
        startIdleState();
      }
    }, wait);
    main.src = idleSrc;
  }

  function prepareAndStartMove() {
    const w = window.innerWidth;
    targetX = randBetween(w * 0.1, w * 0.9);
    direction = targetX > centerX ? 1 : -1;
    setFacing(direction);
    moving = true; sliding = false; airborne = false; y = 0; vy = 0; vx = 0;
    main.src = walkSrc;
  }

  function stopAndIdleAt(x) {
    moving = false; direction = 0; targetX = null; centerX = x; y = 0; vx = 0; vy = 0;
    renderFromCenter(main, centerX);
    main.src = idleSrc;
    startIdleState();
  }

  function ensureClone() {
    if (clone) return;
    clone = document.createElement('img');
    clone.id = 'tinychancy_clone';
    clone.alt = '';
    clone.setAttribute('aria-hidden', 'true');
    Object.assign(clone.style, {
      position: 'fixed',
      bottom: '0',
      transformOrigin: main.style.transformOrigin,
      pointerEvents: 'none',
      willChange: 'transform, left, bottom',
      zIndex: String(Z_INDEX),
      display: 'none'
    });
    clone.src = main.src;
    applyScaleAndFacing(clone);
    document.body.appendChild(clone);
  }

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: String(Z_INDEX + 2),
      cursor: 'grabbing', background: 'transparent',
      userSelect: 'none', pointerEvents: 'auto',
    });
    overlay.onpointerdown = (e) => { e.preventDefault(); e.stopPropagation(); };
    document.body.appendChild(overlay);
    document.documentElement.style.userSelect = 'none';
  }

  function removeOverlay() {
    if (!overlay) return;
    try { overlay.remove(); } catch (_) { }
    overlay = null;
    document.documentElement.style.userSelect = '';
  }

  function samplePointer(e) {
    const now = performance.now();
    samples.push({ t: now, x: e.clientX, y: e.clientY });
    while (samples.length && now - samples[0].t > SAMPLE_WINDOW_MS) samples.shift();
  }

  function computeReleaseVelocity() {
    if (samples.length < 2) return { vx: 0, vy: 0 };
    const a = samples[0], b = samples[samples.length - 1];
    const dt = (b.t - a.t) / 1000;
    if (dt <= 0) return { vx: 0, vy: 0 };
    const dx = b.x - a.x;
    const dy_screen = b.y - a.y;
    const vy_world = -dy_screen / dt;
    let { vx, vy } = { vx: dx / dt, vy: vy_world };
    ({ vx, vy } = capVec(vx, vy, MAX_THROW_SPEED));
    return { vx, vy };
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();

    activePointerId = e.pointerId;
    try { main.setPointerCapture?.(activePointerId); } catch (_) { }

    dragging = true; moving = false; sitting = false; sliding = false; airborne = false;
    clearAllTimers();
    bounced = false; maxYThisAir = 0;

    const floor = window.innerHeight;
    const currentVisY = floor - y; 
    
    dragOffsetX = centerX - e.clientX;
    dragOffsetY = currentVisY - e.clientY;

    main.src = dangleSrc;
    main.style.transformOrigin = 'center bottom';
    main.style.cursor = 'grabbing';

    ensureOverlay();
    samples.length = 0;
    samplePointer(e);
  }

  function onPointerMove(e) {
    if (!dragging || (activePointerId != null && e.pointerId !== activePointerId)) return;
    e.preventDefault(); e.stopPropagation();

    samplePointer(e);

    const w = window.innerWidth;
    centerX = e.clientX + dragOffsetX;
    
    if (centerX > w) centerX -= w;
    else if (centerX < 0) centerX += w;

    const floor = window.innerHeight;
    const targetVisY = e.clientY + dragOffsetY;
    y = Math.max(0, floor - targetVisY);

    renderFromCenter(main, centerX);
    renderBottom(main, y);
    
    if (clone) clone.style.display = 'none';
  }

  function endDragAndRelease(e) {
    if (!dragging) return;
    if (e) { e.preventDefault(); e.stopPropagation(); }

    if (activePointerId != null) {
      try { main.releasePointerCapture?.(activePointerId); } catch (_) { }
    }
    activePointerId = null;
    dragging = false;
    removeOverlay();
    main.style.transformOrigin = 'center bottom';
    main.style.cursor = 'grab';

    const { vx: rvx, vy: rvy } = computeReleaseVelocity();
    vx = rvx; vy = rvy;
    const speed = Math.hypot(vx, vy);
    if (speed < MOMENTUM_THRESH) { vx = 0; vy = 0; }

    airborne = (y > 0) || vy !== 0;
    sliding = false;
    bounced = false;
    maxYThisAir = y;
    main.src = dangleSrc;
  }

  function onPointerUp(e) { endDragAndRelease(e); }
  function onPointerCancel(e) { endDragAndRelease(e); }

  function rafTick(ts) {
    if (lastTime === null) lastTime = ts;
    const dt = Math.min(MAX_DT, (ts - lastTime) / 1000);
    lastTime = ts;

    const { w } = cachedSize;
    const W = window.innerWidth;

    if (REDUCED_MOTION) {
      y = 0; vx = 0; vy = 0; airborne = false; sliding = false;
      renderBottom(main, y);
      renderFromCenter(main, centerX);
      if (clone) clone.style.display = 'none';
      requestAnimationFrame(rafTick);
      return;
    }

    if (dragging) {
      requestAnimationFrame(rafTick);
      return;
    }

    if (!airborne && !sliding && !sitting) {
      if (moving && direction !== 0) {
        const speed = w;
        centerX += direction * speed * dt;

        if (centerX > W) centerX -= W;
        else if (centerX < 0) centerX += W;

        renderFromCenter(main, centerX);
        renderBottom(main, 0);

        if (targetX !== null) {
            const dist = Math.abs(centerX - targetX);
            const distWrapped = Math.min(dist, W - dist);
            if (distWrapped < 10) {
                stopAndIdleAt(targetX);
            }
        }
      } else {
        renderFromCenter(main, centerX);
        renderBottom(main, 0);
        if (main.src.indexOf(idleSrc) === -1) main.src = idleSrc;
      }
    }

    if (airborne) {
      ({ vx, vy } = capVec(vx, vy, MAX_RUNAWAY_SPEED));
      vy += G * dt;
      centerX += vx * dt;
      let nextY = y + vy * dt;

      if (centerX > W) centerX -= W;
      else if (centerX < 0) centerX += W;

      if (nextY > maxYThisAir) maxYThisAir = nextY;

      if (nextY <= 0) {
        if (!bounced) {
          const hBounce = Math.max(0, 0.25 * Math.max(0, maxYThisAir));
          const vBounce = Math.sqrt(2 * Math.abs(G) * hBounce);
          vy = vBounce;
          y = 0;
          bounced = true;
          main.src = sitSrc;
        } else {
          y = 0; vy = 0; airborne = false; sliding = Math.abs(vx) > 1;
          main.src = sitSrc;
        }
      } else {
        y = nextY;
      }

      if (Math.abs(vx) > 1) setFacing(vx > 0 ? 1 : -1);

      renderFromCenter(main, centerX);
      renderBottom(main, y);
    } else if (sliding) {
      const ax = -SLIDE_FRICTION * sign(vx);
      const nextVx = vx + ax * dt;
      if (sign(vx) !== sign(nextVx) || Math.abs(nextVx) < 5) {
        vx = 0; sliding = false;
        startIdleState();
      } else {
        vx = clamp(nextVx, -MAX_RUNAWAY_SPEED, MAX_RUNAWAY_SPEED);
        centerX += vx * dt;
        
        if (centerX > W) centerX -= W;
        else if (centerX < 0) centerX += W;

        renderFromCenter(main, centerX);
        renderBottom(main, 0);
      }
    }

    ensureClone();
    const half = w / 2;
    if (centerX + half > W) {
      clone.style.display = 'block';
      clone.src = main.src;
      renderFromCenter(clone, centerX - W);
      renderBottom(clone, y);
    } else if (centerX - half < 0) {
      clone.style.display = 'block';
      clone.src = main.src;
      renderFromCenter(clone, centerX + W);
      renderBottom(clone, y);
    } else {
      clone.style.display = 'none';
    }

    requestAnimationFrame(rafTick);
  }

  function initAfterPreload() {
    document.body.appendChild(main);
    updateSizeCache();
    adjustScaleForScreen();

    const w = window.innerWidth;
    centerX = randBetween(w * 0.1, w * 0.9);
    y = 0;

    main.src = idleSrc;

    if (!REDUCED_MOTION && chance(1 / 5)) startSitting(randBetween(SIT_MIN, SIT_MAX));
    else startIdleState();

    setTimeout(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(rafTick);
    }, 50);

    main.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerCancel, { passive: false });

    window.addEventListener('resize', () => {
      adjustScaleForScreen();
      const W = window.innerWidth;
      if (centerX > W) centerX = W - 10;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId) {
        lastTime = null;
        rafId = requestAnimationFrame(rafTick);
      }
    });
  }

  let remaining = preloadList.length;
  const tryInit = () => { if (remaining === 0) initAfterPreload(); };
  preloadList.forEach(img => {
    if (img.complete && img.naturalWidth) { remaining--; tryInit(); }
    else {
      img.addEventListener('load', () => { remaining--; tryInit(); }, { once: true, passive: true });
      img.addEventListener('error', () => { remaining--; tryInit(); }, { once: true, passive: true });
    }
  });
  if (remaining === 0) tryInit();

  window.tinychancyDestroy = function () {
    clearAllTimers();
    if (rafId) cancelAnimationFrame(rafId); rafId = null;
    if (clone) clone.remove();
    if (overlay) overlay.remove();
    try { main.remove(); } catch (_) { }
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerCancel);
    window.__tinychancyRunning = false;
  };
})();
