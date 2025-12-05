(function() {
  function loadTinyChancy() {
    // ---- Create the image element ----
    const el = document.createElement('img');
    el.id = 'tinychancy';
    el.style.position = 'fixed';
    el.style.bottom = '0';
    el.style.left = '0';
    el.style.transformOrigin = 'center bottom';
    el.style.transform = 'scale(0.36) scaleX(1)';
    el.style.pointerEvents = 'none';
    el.style.willChange = 'left';
    el.style.zIndex = '9999';

    // ---- State ----
    let centerX = null;
    let facing = 1;
    let moving = false;
    let direction = 0;
    let targetX = null;
    let lastTime = null;
    let chooseTimer = null;
    let flipBackTimer = null;

    const IDLE_MIN = 5000;
    const IDLE_MAX = 10000;
    const BASE_SCALE = 0.36;
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
    function setFacing(newFacing) {
      if (facing === newFacing) return;
      facing = newFacing;
      el.style.transform = `scale(${currentScale}) scaleX(${facing})`;
      renderPositionFromCenter();
    }
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
      el.style.transform = `scale(${currentScale}) scaleX(${facing})`;
    }

    // ---- Idle / Walk ----
    function startIdleState() {
      if (chooseTimer) { clearTimeout(chooseTimer); chooseTimer = null; }
      if (flipBackTimer) { clearTimeout(flipBackTimer); flipBackTimer = null; }
      moving = false; direction = 0; targetX = null;

      if (facing === -1) {
        flipBackTimer = setTimeout(() => { setFacing(1); flipBackTimer = null; }, 1000);
      }

      const wait = Math.random() * (IDLE_MAX - IDLE_MIN) + IDLE_MIN;
      chooseTimer = setTimeout(() => {
        chooseTimer = null;
        prepareAndStartMove();
      }, wait);

      el.src = '/tinychancy/tinychancy_idle.gif';
    }

    function prepareAndStartMove() {
      const w = currentSpriteWidth();
      const minCenter = w / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - w / 2);
      targetX = pickTarget();
      direction = targetX > centerX ? 1 : -1;
      setFacing(direction === 1 ? 1 : -1);
      moving = true;
      el.src = '/tinychancy/tinychancy_walk.gif';
    }

    function stopAndIdleAt(x) {
      moving = false; direction = 0; targetX = null;
      centerX = x;
      renderPositionFromCenter();
      el.src = '/tinychancy/tinychancy_idle.gif';
      startIdleState();
    }

    // ---- Animation Loop ----
    function rafTick(timestamp) {
      if (lastTime === null) lastTime = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
      lastTime = timestamp;

      const spriteW = currentSpriteWidth();
      const minCenter = spriteW / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - spriteW / 2);

      // Safety clamp
      if (centerX < minCenter || centerX > maxCenter) {
        centerX = Math.random() * (maxCenter - minCenter) + minCenter;
        targetX = null;
        moving = false;
        el.src = '/tinychancy/tinychancy_idle.gif';
      }

      if (moving && direction !== 0 && targetX !== null) {
        let nextCenter = centerX + direction * spriteW * dt;
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
        renderPositionFromCenter();
        if (el.src.indexOf('tinychancy_idle.gif') === -1) el.src = '/tinychancy/tinychancy_idle.gif';
      }

      requestAnimationFrame(rafTick);
    }

    // ---- Initialize after preloading GIF ----
    function initWhenLoaded() {
      adjustScale();

      const w = currentSpriteWidth();
      const minCenter = w / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - w / 2);
      centerX = Math.random() * (maxCenter - minCenter) + minCenter;

      document.body.appendChild(el); // add only after load
      renderPositionFromCenter();
      startIdleState();

      // slight delay ensures browser renders
      setTimeout(() => requestAnimationFrame(rafTick), 50);
    }

    // ---- Preload GIF for robust load ----
    const preload = new Image();
    preload.src = '/tinychancy/tinychancy_idle.gif';
    if (preload.complete && preload.naturalWidth) {
      initWhenLoaded();
    } else {
      preload.onload = initWhenLoaded;
    }

    // ---- Handle resize ----
    window.addEventListener('resize', () => {
      adjustScale();
      const w = currentSpriteWidth();
      const minCenter = w / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - w / 2);
      if (centerX !== null) centerX = clamp(centerX, minCenter, maxCenter);
      if (targetX !== null) targetX = clamp(targetX, minCenter, maxCenter);
      renderPositionFromCenter();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTinyChancy);
  } else {
    loadTinyChancy();
  }
})();
