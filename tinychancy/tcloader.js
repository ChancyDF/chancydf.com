/*
  TinyChancy loader (Option A — Balloon Fight style wrap + sitting)

  Place this file at: /tinychancy/tcloader.js
  GIFs expected at:
    /tinychancy/tinychancy_idle.gif
    /tinychancy/tinychancy_walk.gif
    /tinychancy/tinychancy_sit.gif
*/

(function() {
  // CONFIG
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000;
  const IDLE_MAX = 10000;
  const SIT_MIN = 10 * 1000; // 10s
  const SIT_MAX = 60 * 1000; // 60s
  const Z_INDEX = 9999;

  // Utility
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const randBetween = (a, b) => Math.random() * (b - a) + a;
  const chance = (p) => Math.random() < p;

  function loadTinyChancy() {
    // Preload GIFs first to avoid flashes
    const idleSrc = '/tinychancy/tinychancy_idle.gif';
    const walkSrc = '/tinychancy/tinychancy_walk.gif';
    const sitSrc  = '/tinychancy/tinychancy_sit.gif';

    const preloadList = [idleSrc, walkSrc, sitSrc].map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    // Create main element (but don't append until preload done)
    const main = document.createElement('img');
    main.id = 'tinychancy';
    main.style.position = 'fixed';
    main.style.bottom = '0';
    main.style.left = '0';
    main.style.transformOrigin = 'center bottom';
    main.style.transform = `scale(${BASE_SCALE}) scaleX(1)`;
    main.style.pointerEvents = 'none';
    main.style.willChange = 'left';
    main.style.zIndex = String(Z_INDEX);

    // Clone element used during wrap transitions (created lazily)
    let clone = null;

    // State
    let centerX = null;               // authoritative centerX in page coords
    let facing = 1;                   // 1=right, -1=left
    let currentScale = BASE_SCALE;
    let moving = false;
    let direction = 0;
    let targetX = null;
    let lastTime = null;
    let chooseTimer = null;
    let flipBackTimer = null;
    let sitTimer = null;
    let sitting = false;
    let wrapActive = false;           // true while clone exists / in wrap
    let wrapDirection = 0;            // 1 or -1 for wrap
    let projectedOffset = 0;          // windowWidth * sign used for clone center

    // Helpers to measure & render
    function currentSpriteWidth(elRef = main) {
      const r = elRef.getBoundingClientRect();
      return (r && r.width) || (preloadList[0] && preloadList[0].width) || 50;
    }

    function renderFromCenter(elRef, center) {
      const width = currentSpriteWidth(elRef);
      elRef.style.left = (center - width / 2) + 'px';
    }

    function applyScaleAndFacing(elRef) {
      elRef.style.transform = `scale(${currentScale}) scaleX(${facing})`;
    }

    function setFacing(newFacing) {
      if (facing === newFacing) return;
      facing = newFacing;
      applyScaleAndFacing(main);
      if (clone) applyScaleAndFacing(clone);
      // Re-render positions so centerX remains visually stable
      if (centerX !== null) {
        renderFromCenter(main, centerX);
        if (clone) renderFromCenter(clone, centerX - projectedOffset);
      }
    }

    function adjustScaleForScreen() {
      const w = window.innerWidth;
      if (w < 400) currentScale = BASE_SCALE * 0.6;
      else if (w < 700) currentScale = BASE_SCALE * 0.8;
      else currentScale = BASE_SCALE;
      applyScaleAndFacing(main);
      if (clone) applyScaleAndFacing(clone);
    }

    // Sitting logic
    function startSitting(durationMs) {
      clearAllTimers();
      sitting = true;
      moving = false;
      direction = 0;
      targetX = null;
      // Always face right while sitting
      setFacing(1);
      main.src = sitSrc;

      sitTimer = setTimeout(() => {
        sitTimer = null;
        sitting = false;
        // After sitting, go to idle as requested
        startIdleState();
      }, durationMs);
    }

    // Idle/walk logic
    function startIdleState() {
      clearAllTimers();
      moving = false;
      direction = 0;
      targetX = null;

      // If facing left when idle begins, flip back to right after 1s
      if (facing === -1) {
        flipBackTimer = setTimeout(() => { setFacing(1); flipBackTimer = null; }, 1000);
      }

      // Decide next action after 5-10s
      const wait = randBetween(IDLE_MIN, IDLE_MAX);
      chooseTimer = setTimeout(() => {
        chooseTimer = null;
        // 1/10 chance to sit instead of walk
        if (chance(1/10)) {
          const sitDur = randBetween(SIT_MIN, SIT_MAX);
          startSitting(sitDur);
        } else {
          prepareAndStartMove();
        }
      }, wait);

      main.src = idleSrc;
    }

    function prepareAndStartMove() {
      // pick a target at least 100px away within bounds
      const w = currentSpriteWidth();
      const minC = w/2;
      const maxC = Math.max(minC, window.innerWidth - w/2);
      targetX = pickTargetWithin(minC, maxC);
      direction = targetX > centerX ? 1 : -1;
      setFacing(direction === 1 ? 1 : -1);
      moving = true;
      main.src = walkSrc;
    }

    function stopAndIdleAt(x) {
      moving = false;
      direction = 0;
      targetX = null;
      centerX = x;
      renderFromCenter(main, centerX);
      main.src = idleSrc;
      startIdleState();
    }

    function pickTargetWithin(minCenter, maxCenter) {
      let t = centerX;
      let attempts = 0;
      while ((Math.abs(t - centerX) < 100 || t <= minCenter || t >= maxCenter) && attempts < 2000) {
        t = randBetween(minCenter, maxCenter);
        attempts++;
      }
      return clamp(t, minCenter, maxCenter);
    }

    // Wrap/clone helpers
    function createCloneIfNeeded() {
      if (clone) return;
      clone = document.createElement('img');
      clone.id = 'tinychancy_clone';
      clone.style.position = 'fixed';
      clone.style.bottom = '0';
      clone.style.transformOrigin = 'center bottom';
      clone.style.pointerEvents = 'none';
      clone.style.willChange = 'left';
      clone.style.zIndex = String(Z_INDEX);
      // Use same visual state
      clone.src = main.src;
      applyScaleAndFacing(clone);
      document.body.appendChild(clone);
    }

    function removeClone() {
      if (!clone) return;
      try { clone.remove(); } catch(e) {}
      clone = null;
      wrapActive = false;
      wrapDirection = 0;
      projectedOffset = 0;
    }

    // Main RAF loop
    function rafTick(ts) {
      if (lastTime === null) lastTime = ts;
      const dt = Math.min(0.05, (ts - lastTime) / 1000);
      lastTime = ts;

      const spriteW = currentSpriteWidth(main);
      const minCenter = spriteW / 2;
      const maxCenter = Math.max(minCenter, window.innerWidth - spriteW / 2);

      // Safety: if centerX invalid, reinitialize
      if (centerX === null || !isFinite(centerX)) {
        centerX = randBetween(minCenter, maxCenter);
      }

      // Sitting: do nothing but render
      if (sitting) {
        renderFromCenter(main, centerX);
        if (clone) removeClone();
        requestAnimationFrame(rafTick);
        return;
      }

      // Movement
      if (moving && direction !== 0 && targetX !== null) {
        // speed = one sprite width per second
        const speed = spriteW;
        let nextCenter = centerX + direction * speed * dt;

        // When wrap is allowed, we DO NOT clamp nextCenter to min/max.
        // Instead, detect crossing and create a clone projection.
        const W = window.innerWidth;
        const leftEdge = nextCenter - spriteW/2;
        const rightEdge = nextCenter + spriteW/2;

        // detect if we should start wrap (partially offscreen)
        if (!wrapActive && (leftEdge < 0 || rightEdge > W)) {
          // Start wrap: create clone
          wrapActive = true;
          wrapDirection = direction; // 1 or -1
          projectedOffset = W * wrapDirection; // for clone center
          createCloneIfNeeded();
          // sync clone src/frame by setting same src (GIFs can't be frame-synced but this is the best we can do)
          clone.src = main.src;
          applyScaleAndFacing(clone);
        }

        // If wrap active, compute clone center (mirror across viewport)
        if (wrapActive && clone) {
          const cloneCenter = nextCenter - projectedOffset;
          // render both main and clone
          renderFromCenter(main, nextCenter);
          renderFromCenter(clone, cloneCenter);

          // Check if clone is fully in frame -> swap
          const cloneLeft = cloneCenter - spriteW/2;
          const cloneRight = cloneCenter + spriteW/2;
          if (cloneLeft >= 0 && cloneRight <= W) {
            // clone fully visible -> teleport real to clone spot and remove clone
            // The "real" centerX becomes cloneCenter (which is inside bounds),
            // but we want the real to continue walking smoothly from there.
            centerX = cloneCenter;
            // remove clone and continue (leave main.src as walk)
            removeClone();
            // if targetX was outside previously, recompute target relative to new center
            // clamp target to allow final arrival
            const minC = spriteW/2;
            const maxC = Math.max(minC, W - spriteW/2);
            if (targetX !== null) targetX = clamp(targetX - projectedOffset, minC, maxC);
            // If cloned and passed target due to wrap, handle stop
            const passedTarget = (direction === 1 && centerX >= targetX) || (direction === -1 && centerX <= targetX);
            if (targetX !== null && passedTarget) {
              stopAndIdleAt(targetX);
              requestAnimationFrame(rafTick);
              return;
            }
            // continue
            renderFromCenter(main, centerX);
            requestAnimationFrame(rafTick);
            return;
          }

          // Not yet fully in frame: update centerX and continue
          centerX = nextCenter;
          requestAnimationFrame(rafTick);
          return;
        }

        // Normal non-wrap path (not crossing edges)
        // Clamp nextCenter so he doesn't get stuck offscreen (unless wrapActive)
        const clamped = clamp(nextCenter, minCenter, maxCenter);
        // If clamped and differs from nextCenter, we've hit the wall:
        if (clamped !== nextCenter) {
          centerX = clamped;
          // stop and idle
          stopAndIdleAt(centerX);
          // Clean any clone if present
          if (clone) removeClone();
          requestAnimationFrame(rafTick);
          return;
        }

        // Apply movement
        centerX = nextCenter;
        renderFromCenter(main, centerX);

        // Check reached or passed target
        const reached = (direction === 1 && centerX >= targetX) || (direction === -1 && centerX <= targetX);
        if (reached) {
          stopAndIdleAt(targetX);
          if (clone) removeClone();
          requestAnimationFrame(rafTick);
          return;
        }

      } else {
        // Not moving: ensure idle sprite & render main (no clone)
        renderFromCenter(main, centerX);
        if (main.src.indexOf(idleSrc) === -1) main.src = idleSrc;
        if (clone) removeClone();
      }

      requestAnimationFrame(rafTick);
    }

    // Initialize after preload
    function initAfterPreload() {
      // append main to DOM now that images are ready
      document.body.appendChild(main);

      adjustScaleForScreen();

      // compute initial centerX randomly on-screen
      const w = currentSpriteWidth(main);
      const minC = w/2;
      const maxC = Math.max(minC, window.innerWidth - w/2);
      centerX = randBetween(minC, maxC);

      // Starting state: 1/5 chance to start sitting for 10-60s
      if (chance(1/5)) {
        const sitDur = randBetween(SIT_MIN, SIT_MAX);
        startSitting(sitDur);
      } else {
        // start idle loop
        startIdleState();
      }

      // Slight delay to ensure browser painted the image before RAF
      setTimeout(() => {
        requestAnimationFrame(rafTick);
      }, 50);
    }

    function clearAllTimers() {
      if (chooseTimer) { clearTimeout(chooseTimer); chooseTimer = null; }
      if (flipBackTimer) { clearTimeout(flipBackTimer); flipBackTimer = null; }
      if (sitTimer) { clearTimeout(sitTimer); sitTimer = null; }
    }

    // Robust preload: wait until all three images have loaded (or errored)
    let remaining = preloadList.length;
    preloadList.forEach(img => {
      if (img.complete && img.naturalWidth) {
        remaining--;
      } else {
        img.addEventListener('load', () => { remaining--; if (remaining === 0) initAfterPreload(); }, { once: true, passive: true });
        img.addEventListener('error', () => { remaining--; if (remaining === 0) initAfterPreload(); }, { once: true, passive: true });
      }
    });
    if (remaining === 0) initAfterPreload();

    // Resize handler: adjust scale and clamp positions
    window.addEventListener('resize', () => {
      adjustScaleForScreen();
      const w = currentSpriteWidth(main);
      const minC = w/2;
      const maxC = Math.max(minC, window.innerWidth - w/2);
      if (centerX !== null) centerX = clamp(centerX, minC, maxC);
      if (targetX !== null) targetX = clamp(targetX, minC, maxC);
      // If clone exists, update projectedOffset and reposition it
      if (clone && wrapDirection !== 0) {
        projectedOffset = window.innerWidth * wrapDirection;
        applyScaleAndFacing(clone);
        renderFromCenter(clone, centerX - projectedOffset);
      }
      renderFromCenter(main, centerX);
    }, { passive: true });

    // Ensure loader runs after DOM ready
    // (we already appended main in initAfterPreload)
  } // end loadTinyChancy

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTinyChancy);
  } else {
    loadTinyChancy();
  }

})();
