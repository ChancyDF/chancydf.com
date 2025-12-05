(function() {
  function loadTinyChancy() {
    // Create the image element
    const el = document.createElement('img');
    el.id = 'tinychancy';
    el.src = '/tinychancy/tinychancy_idle.gif';
    el.style.position = 'fixed';
    el.style.bottom = '0';
    el.style.left = '0';
    el.style.transformOrigin = 'center bottom';
    el.style.transform = 'scale(0.36) scaleX(1)';
    el.style.pointerEvents = 'none';
    el.style.willChange = 'left';
    document.body.appendChild(el);

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
      el.style.transform = `scale(0.36) scaleX(${facing})`;
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

    // ---- Idle / Choose next target ----
    function startIdleState() {
      if (chooseTimer) { clearTimeout(chooseTimer); chooseTimer = null; }
      if (flipBackTimer) { clearTimeout(flipBackTimer); flipBackTimer = null; }
      moving = false; direction = 0; targetX = null;

      // flip back to right if facing left
      if (facing === -1) {
        flipBackTimer = setTimeout(() => { setFacing(1); flipBackTimer = null; }, 1000);
      }

      // next walk after random delay
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

    // ---- Main RAF loop ----
    function rafTick(timestamp) {
      if (lastTime === null) lastTime = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
      lastTime = timestamp;

      if (centerX === null) {
        const rect = el.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
      }

      const spriteW = currentSpriteWidth();
      const minCenter = spriteW / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - spriteW / 2);

      // Clamp to visible area
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

    function initWhenLoaded() {
      const w = currentSpriteWidth();
      const minCenter = w / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - w / 2);
      // Random starting x-coordinate
      centerX = Math.random() * (maxCenter - minCenter) + minCenter;
      renderPositionFromCenter();
      startIdleState();
      requestAnimationFrame(rafTick);
    }

    // ---- Robust loading ----
    if (el.complete && el.naturalWidth) {
      initWhenLoaded();
    } else {
      el.addEventListener('load', initWhenLoaded, { passive: true });
    }

    // ---- Handle window resize ----
    window.addEventListener('resize', () => {
      const w = currentSpriteWidth();
      const minCenter = w / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - w / 2);
      if (centerX !== null) centerX = clamp(centerX, minCenter, maxCenter);
      if (targetX !== null) targetX = clamp(targetX, minCenter, maxCenter);
      renderPositionFromCenter();
    });
  }

  // ---- Ensure DOM is ready ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTinyChancy);
  } else {
    loadTinyChancy();
  }
})();
