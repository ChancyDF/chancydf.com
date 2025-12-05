(function() {
  function loadTinyChancy() {
    // ---- Config ----
    const PATH = '/tinychancy/';
    const IDLE_GIF = PATH + 'tinychancy_idle.gif';
    const WALK_GIF = PATH + 'tinychancy_walk.gif';
    const SIT_GIF  = PATH + 'tinychancy_sit.gif';

    const IDLE_MIN = 5000;
    const IDLE_MAX = 10000;
    const SIT_MIN_MS = 10_000;    // 10 seconds
    const SIT_MAX_MS = 60_000;    // 60 seconds

    const BASE_SCALE = 0.36;
    const FRONT_Z = 9999;

    // ---- Create element (but don't append until preloads done) ----
    const el = document.createElement('img');
    el.id = 'tinychancy';
    el.style.position = 'fixed';
    el.style.bottom = '0';
    el.style.left = '0';
    el.style.transformOrigin = 'center bottom';
    el.style.transform = `scale(${BASE_SCALE}) scaleX(1)`;
    el.style.pointerEvents = 'none';
    el.style.willChange = 'left';
    el.style.zIndex = String(FRONT_Z);

    // ---- State ----
    let centerX = null;
    let facing = 1;       // 1 = right, -1 = left
    let moving = false;
    let direction = 0;    // 1 or -1 while moving
    let targetX = null;
    let lastTime = null;
    let chooseTimer = null;
    let flipBackTimer = null;
    let sitTimer = null;
    let sitting = false;

    let currentScale = BASE_SCALE;

    // ---- Helpers ----
    function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
    function currentSpriteWidth() {
      const r = el.getBoundingClientRect();
      return (r && r.width) || 50;
    }
    function renderPositionFromCenter() {
      const width = currentSpriteWidth();
      el.style.left = (centerX - width / 2) + 'px';
    }
    function applyTransform() {
      el.style.transform = `scale(${currentScale}) scaleX(${facing})`;
    }
    function setFacing(newFacing) {
      if (facing === newFacing) return;
      facing = newFacing;
      applyTransform();
      renderPositionFromCenter();
    }
    function clampCenterToBounds() {
      const w = currentSpriteWidth();
      const minC = w / 2;
      const maxC = Math.max(minC, window.innerWidth - w / 2);
      centerX = clamp(centerX, minC, maxC);
      if (targetX !== null) targetX = clamp(targetX, minC, maxC);
    }

    // choose a valid target at least 100px away
    function pickTarget() {
      const spriteW = currentSpriteWidth();
      const minCenter = spriteW / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - spriteW / 2);
      let t = centerX;
      let attempts = 0;
      while ((Math.abs(t - centerX) < 100 || t <= minCenter || t >= maxCenter) && attempts < 2000) {
        t = Math.random() * (maxCenter - minCenter) + minCenter;
        attempts++;
      }
      return clamp(t, minCenter, maxCenter);
    }

    function adjustScale() {
      const w = window.innerWidth;
      if (w < 400) currentScale = BASE_SCALE * 0.6;
      else if (w < 700) currentScale = BASE_SCALE * 0.8;
      else currentScale = BASE_SCALE;
      applyTransform();
    }

    // ---- Sitting behavior ----
    function startSitFor(ms) {
      clearAllTimersExceptSit();
      sitting = true;
      moving = false;
      direction = 0;
      targetX = null;

      // sitting always faces right
      setFacing(1);
      el.src = SIT_GIF;

      sitTimer = setTimeout(() => {
        sitTimer = null;
        sitting = false;
        // After sitting, always go to idle
        startIdleState();
      }, ms);
    }

    function clearAllTimersExceptSit() {
      if (chooseTimer) { clearTimeout(chooseTimer); chooseTimer = null; }
      if (flipBackTimer) { clearTimeout(flipBackTimer); flipBackTimer = null; }
      // don't clear sitTimer here (used only when explicitly ending sit)
    }

    // ---- Idle / decision / walk ----
    function startIdleState() {
      // If currently sitting, do not enter idle loop (sit controls itself)
      if (sitting) return;

      clearAllTimersExceptSit();
      moving = false;
      direction = 0;
      targetX = null;

      // If he is facing left when idle begins, flip back after 1s
      if (facing === -1) {
        flipBackTimer = setTimeout(() => { setFacing(1); flipBackTimer = null; }, 1000);
      }

      // show idle sprite
      el.src = IDLE_GIF;

      // schedule next action (walk or sit)
      const wait = Math.random() * (IDLE_MAX - IDLE_MIN) + IDLE_MIN;
      chooseTimer = setTimeout(() => {
        chooseTimer = null;
        chooseActionAfterIdle();
      }, wait);
    }

    function chooseActionAfterIdle() {
      // 1/10 chance to sit instead of walking
      const sitChance = 1 / 10;
      if (Math.random() < sitChance) {
        const ms = Math.random() * (SIT_MAX_MS - SIT_MIN_MS) + SIT_MIN_MS;
        startSitFor(ms);
        return;
      }
      prepareAndStartMove();
    }

    function prepareAndStartMove() {
      // pick target and begin walking
      const w = currentSpriteWidth();
      const minCenter = w / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - w / 2);
      targetX = pickTarget();
      direction = targetX > centerX ? 1 : -1;
      setFacing(direction === 1 ? 1 : -1);
      moving = true;
      el.src = WALK_GIF;
    }

    function stopAndIdleAt(x) {
      moving = false;
      direction = 0;
      targetX = null;
      centerX = x;
      renderPositionFromCenter();
      el.src = IDLE_GIF;
      startIdleState();
    }

    // ---- RAF loop ----
    function rafTick(timestamp) {
      if (lastTime === null) lastTime = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
      lastTime = timestamp;

      const spriteW = currentSpriteWidth();
      const minCenter = spriteW / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - spriteW / 2);

      // If somehow out-of-bounds, snap back to a safe random position and stop current action.
      if (centerX < minCenter || centerX > maxCenter) {
        centerX = Math.random() * (maxCenter - minCenter) + minCenter;
        targetX = null;
        moving = false;
        sitting = false;
        if (sitTimer) { clearTimeout(sitTimer); sitTimer = null; }
        el.src = IDLE_GIF;
        startIdleState();
      }

      if (moving && direction !== 0 && targetX !== null && !sitting) {
        const speed = spriteW; // one width per second
        let nextCenter = centerX + direction * speed * dt;
        nextCenter = clamp(nextCenter, minCenter, maxCenter);

        const passedTarget = (direction === 1 && nextCenter >= targetX) || (direction === -1 && nextCenter <= targetX);
        if (passedTarget) {
          centerX = targetX;
          renderPositionFromCenter();
          stopAndIdleAt(centerX);
        } else {
          centerX = nextCenter;
          renderPositionFromCenter();
        }
      } else {
        // Keep element positioned by center and ensure idle sprite visible when not moving/sitting
        renderPositionFromCenter();
        if (!sitting && el.src.indexOf(IDLE_GIF) === -1 && !moving) {
          el.src = IDLE_GIF;
        }
      }

      requestAnimationFrame(rafTick);
    }

    // ---- Initialization after preload ----
    function initWhenPreloadsDone(initiallySitting) {
      adjustScale();
      const w = currentSpriteWidth();
      const minCenter = w / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - w / 2);
      // pick random safe starting centerX
      centerX = Math.random() * (maxCenter - minCenter) + minCenter;

      // append element after we have sizes available
      document.body.appendChild(el);
      renderPositionFromCenter();

      // if chosen to start sitting, do it now
      if (initiallySitting) {
        const ms = Math.random() * (SIT_MAX_MS - SIT_MIN_MS) + SIT_MIN_MS;
        startSitFor(ms);
      } else {
        startIdleState();
      }

      // start RAF loop slightly delayed so browser paints
      setTimeout(() => requestAnimationFrame(rafTick), 50);
    }

    // ---- Preload images robustly ----
    function loadImage(src) {
      return new Promise((resolve) => {
        const i = new Image();
        i.src = src;
        if (i.complete && i.naturalWidth) {
          resolve();
        } else {
          i.onload = () => resolve();
          i.onerror = () => resolve(); // resolve even if error — still proceed
        }
      });
    }

    // Decide at load whether he should start sitting (1/5 chance)
    const startSittingOnLoad = Math.random() < 1 / 5;

    // Always preload IDLE. If initial sit chosen, preload SIT too before init.
    // Preload WALK in background (non-blocking), but we don't wait for it.
    const preloadPromises = [ loadImage(IDLE_GIF) ];
    if (startSittingOnLoad) preloadPromises.push( loadImage(SIT_GIF) );
    // start walk preload async (not blocking init)
    loadImage(WALK_GIF);

    // Safety timeout: if images never fire load (weird cases), init anyway after 2s
    let timedOut = false;
    const timeoutId = setTimeout(() => { timedOut = true; }, 2000);

    Promise.all(preloadPromises).then(() => {
      if (timedOut) {
        // still proceed; promise resolved after timeout or before
      }
      clearTimeout(timeoutId);
      initWhenPreloadsDone(startSittingOnLoad);
    });

    // ---- Resize handling ----
    window.addEventListener('resize', () => {
      adjustScale();
      // re-clamp center & target
      const w = currentSpriteWidth();
      const minCenter = w / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - w / 2);
      if (centerX !== null) centerX = clamp(centerX, minCenter, maxCenter);
      if (targetX !== null) targetX = clamp(targetX, minCenter, maxCenter);
      renderPositionFromCenter();
    }, { passive: true });
  }

  // DOM ready & run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTinyChancy);
  } else {
    loadTinyChancy();
  }
})();
