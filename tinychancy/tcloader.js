(function () {
  // --- CONFIG ---------------------------------------------------------
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000;       // idle min wait
  const IDLE_MAX = 10000;      // idle max wait
  const SIT_MIN = 10000;       // random sit min duration
  const SIT_MAX = 60000;       // random sit max duration
  const GRAVITY = 300;         // px/s^2 downward
  const FRICTION = 500;        // ground friction for sliding
  const DROP_SPEED_THRESHOLD = 40;  // below this = simple drop
  const Z_INDEX = 9999;

  const idleSrc   = '/tinychancy/tinychancy_idle.gif';
  const walkSrc   = '/tinychancy/tinychancy_walk.gif';
  const sitSrc    = '/tinychancy/tinychancy_sit.gif';
  const dangleSrc = '/tinychancy/tinychancy_dangle.gif';

  // Preload all animations first
  const preloadImgs = [idleSrc, walkSrc, sitSrc, dangleSrc].map(src => {
    const img = new Image();
    img.src = src;
    return img;
  });

  function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
  }

  function randBetween(a, b) {
    return Math.random() * (b - a) + a;
  }

  function chance(p) {
    return Math.random() < p;
  }

  function loadTinyChancy() {
    // --- MAIN ELEMENT (real TinyChancy) ------------------------------
    const main = document.createElement('img');
    main.id = 'tinychancy';
    main.style.position = 'fixed';
    main.style.top = '0';
    main.style.left = '0';
    main.style.zIndex = String(Z_INDEX);
    main.style.willChange = 'transform, left, top';
    main.style.pointerEvents = 'auto';
    main.style.touchAction = 'none'; // helps dragging on mobile

    // --- CLONE ELEMENT (for Balloon Fight walking wrap) --------------
    let clone = null;

    // --- STATE --------------------------------------------------------
    // anchor = pivot point in screen coords
    // pivotMode: 'bottom' for ground states, 'top' for dangling/airborne
    let anchorX = null;
    let anchorY = null;
    let pivotMode = 'bottom';

    let facing = 1;          // 1 = right, -1 = left
    let currentScale = BASE_SCALE;

    // Modes: 'idle', 'walk', 'sit', 'dangling', 'airborne'
    let mode = 'idle';
    // sitMode: 'random' (timed sit) or 'postFall' (after physics)
    let sitMode = null;

    // Walking / wandering
    let direction = 0; // -1 or 1
    let targetX = null;

    // Wrap clone for walking
    let wrapActive = false;
    let wrapDirection = 0;
    let projectedOffset = 0;

    // Physics (airborne and sliding)
    let velX = 0;
    let velY = 0;
    let groundContacts = 0; // 0 = no impact yet, 1 = after first bounce, 2+ = fully landed
    let sliding = false;

    // Timers
    let chooseTimer = null;
    let flipBackTimer = null;
    let sitTimer = null;

    // RAF timing
    let lastTime = null;

    // Drag / dangle
    let dragging = false;
    let dragPointerId = null;
    let lastDragX = 0;
    let lastDragY = 0;
    let lastDragT = 0;
    let dragVX = 0;
    let dragVY = 0;

    // --- BASIC HELPERS -----------------------------------------------
    function spriteRect(el) {
      return el.getBoundingClientRect();
    }

    function spriteWidth(el) {
      const r = spriteRect(el);
      return r.width || 50;
    }

    function spriteHeight(el) {
      const r = spriteRect(el);
      return r.height || 50;
    }

    function floorY() {
      return window.innerHeight;
    }

    function applyTransform(el) {
      const origin = pivotMode === 'top' ? 'center top' : 'center bottom';
      el.style.transformOrigin = origin;
      el.style.transform = 'scale(' + currentScale + ') scaleX(' + facing + ')';
    }

    function renderAt(el, ax, ay) {
      const w = spriteWidth(el);
      const h = spriteHeight(el);
      let top;
      if (pivotMode === 'top') {
        top = ay;
      } else {
        top = ay - h; // pivot is bottom, so top is bottom - height
      }
      const left = ax - w / 2;
      el.style.left = left + 'px';
      el.style.top = top + 'px';
    }

    function applyScaleForScreen() {
      const w = window.innerWidth;
      if (w < 400) currentScale = BASE_SCALE * 0.6;
      else if (w < 700) currentScale = BASE_SCALE * 0.8;
      else currentScale = BASE_SCALE;
      applyTransform(main);
      if (clone) applyTransform(clone);
    }

    function ensureAnchorsInitialized() {
      if (anchorX == null || anchorY == null) {
        const r = spriteRect(main);
        anchorX = r.left + r.width / 2;
        if (pivotMode === 'top') {
          anchorY = r.top;
        } else {
          anchorY = r.top + r.height; // bottom pivot
        }
      }
    }

    function clearTimers() {
      if (chooseTimer) {
        clearTimeout(chooseTimer);
        chooseTimer = null;
      }
      if (flipBackTimer) {
        clearTimeout(flipBackTimer);
        flipBackTimer = null;
      }
      if (sitTimer) {
        clearTimeout(sitTimer);
        sitTimer = null;
      }
    }

    function resetPhysics() {
      velX = 0;
      velY = 0;
      groundContacts = 0;
      sliding = false;
    }

    function setPivot(modeStr) {
      pivotMode = modeStr;
      applyTransform(main);
      if (clone) applyTransform(clone);
      if (anchorX != null && anchorY != null) {
        renderAt(main, anchorX, anchorY);
        if (clone && wrapActive) {
          const cloneCenter = anchorX - projectedOffset;
          renderAt(clone, cloneCenter, anchorY);
        }
      }
    }

    function setFacing(newFacing) {
      if (facing === newFacing) return;
      facing = newFacing;
      applyTransform(main);
      if (clone) applyTransform(clone);
      if (anchorX != null && anchorY != null) {
        renderAt(main, anchorX, anchorY);
        if (clone && wrapActive) {
          const cloneCenter = anchorX - projectedOffset;
          renderAt(clone, cloneCenter, anchorY);
        }
      }
    }

    function lockToFloorBottomPivot() {
      const h = spriteHeight(main);
      anchorY = floorY(); // bottom pivot at floor
      const top = anchorY - h;
      const r = spriteRect(main);
      const currentTop = r.top;
      if (Math.abs(currentTop - top) > 1) {
        renderAt(main, anchorX, anchorY);
      }
    }

    // --- CLONE HELPERS (walking wrap) -------------------------------
    function createCloneIfNeeded() {
      if (clone) return;
      clone = document.createElement('img');
      clone.id = 'tinychancy_clone';
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.zIndex = String(Z_INDEX);
      clone.style.willChange = 'transform, left, top';
      clone.src = main.src;
      applyTransform(clone);
      document.body.appendChild(clone);
    }

    function removeClone() {
      if (clone) {
        try { clone.remove(); } catch (e) {}
        clone = null;
      }
      wrapActive = false;
      wrapDirection = 0;
      projectedOffset = 0;
    }

    // --- SITTING STATES ---------------------------------------------
    function startRandomSit(durationMs) {
      clearTimers();
      resetPhysics();
      removeClone();
      mode = 'sit';
      sitMode = 'random';
      pivotMode = 'bottom';
      applyTransform(main);
      lockToFloorBottomPivot();
      setFacing(1);
      main.src = sitSrc;
      renderAt(main, anchorX, anchorY);
      sitTimer = setTimeout(function () {
        sitTimer = null;
        startIdle();
      }, durationMs);
    }

    function startPostFallSit() {
      clearTimers();
      mode = 'sit';
      sitMode = 'postFall';
      pivotMode = 'bottom';
      applyTransform(main);
      lockToFloorBottomPivot();
      main.src = sitSrc;
      renderAt(main, anchorX, anchorY);
    }

    // --- IDLE & WALK -------------------------------------------------
    function startIdle() {
      clearTimers();
      resetPhysics();
      removeClone();
      mode = 'idle';
      sitMode = null;
      pivotMode = 'bottom';
      applyTransform(main);
      lockToFloorBottomPivot();
      main.src = idleSrc;
      if (facing === -1) {
        flipBackTimer = setTimeout(function () {
          setFacing(1);
          flipBackTimer = null;
          lockToFloorBottomPivot();
          renderAt(main, anchorX, anchorY);
        }, 1000);
      }
      const wait = randBetween(IDLE_MIN, IDLE_MAX);
      chooseTimer = setTimeout(function () {
        chooseTimer = null;
        if (chance(0.1)) {
          const dur = randBetween(SIT_MIN, SIT_MAX);
          startRandomSit(dur);
        } else {
          startWalk();
        }
      }, wait);
      renderAt(main, anchorX, anchorY);
    }

    function startWalk() {
      clearTimers();
      resetPhysics();
      removeClone();
      mode = 'walk';
      sitMode = null;
      pivotMode = 'bottom';
      applyTransform(main);
      lockToFloorBottomPivot();
      main.src = walkSrc;
      const w = spriteWidth(main);
      const minC = w / 2;
      const maxC = Math.max(minC, window.innerWidth - w / 2);
      let t = anchorX;
      let attempts = 0;
      while ((Math.abs(t - anchorX) < 100 || t <= minC || t >= maxC) && attempts < 2000) {
        t = randBetween(minC, maxC);
        attempts++;
      }
      targetX = clamp(t, minC, maxC);
      direction = targetX > anchorX ? 1 : -1;
      setFacing(direction === 1 ? 1 : -1);
      renderAt(main, anchorX, anchorY);
    }

    function stopWalkAndIdle(x) {
      anchorX = x;
      startIdle();
    }

    function startInitialState() {
      pivotMode = 'bottom';
      applyTransform(main);
      lockToFloorBottomPivot();
      if (chance(0.2)) {
        const dur = randBetween(SIT_MIN, SIT_MAX);
        startRandomSit(dur);
      } else {
        startIdle();
      }
    }

    // --- DANGLING / PICKUP ------------------------------------------
    function startDangling(pointerX, pointerY) {
      clearTimers();
      resetPhysics();
      removeClone();
      mode = 'dangling';
      sitMode = null;
      dragging = true;
      pivotMode = 'top';
      applyTransform(main);
      anchorX = pointerX;
      anchorY = pointerY;
      facing = 1;
      applyTransform(main);
      main.src = dangleSrc;
      renderAt(main, anchorX, anchorY);
    }

    function endDangling() {
      dragging = false;
      dragPointerId = null;
      const speed = Math.sqrt(dragVX * dragVX + dragVY * dragVY);
      resetPhysics();
      pivotMode = 'top';
      applyTransform(main);
      if (speed < DROP_SPEED_THRESHOLD) {
        velX = 0;
        velY = 0;
      } else {
        velX = dragVX;
        velY = dragVY;
      }
      mode = 'airborne';
      groundContacts = 0;
      sliding = false;
      main.src = dangleSrc;
    }

    // --- AIRBORNE PHYSICS (freefall + bounce) -----------------------
    function updateAirborne(dt) {
      const w = spriteWidth(main);
      const h = spriteHeight(main);
      const W = window.innerWidth;
      const F = floorY();

      // gravity
      velY += GRAVITY * dt;

      // move in air
      anchorX += velX * dt;
      anchorY += velY * dt;

      // horizontal wrap while airborne
      if (anchorX > W + w / 2) anchorX -= (W + w);
      if (anchorX < -w / 2) anchorX += (W + w);

      // collision with floor
      const bottom = anchorY + h;
      if (bottom >= F) {
        anchorY = F - h;

        if (groundContacts === 0) {
          // first collision -> bounce
          velY = -Math.abs(velY) * 0.5;
          groundContacts = 1;
        } else {
          // second collision or more -> end airborne, go to sit w/slide
          velY = 0;
          groundContacts = 2;
          startPostFallSit();
          return;
        }
      }

      // airborne uses dangle animation with top pivot
      pivotMode = 'top';
      applyTransform(main);
      main.src = dangleSrc;
      renderAt(main, anchorX, anchorY);
    }

    // --- POST-FALL SITTING + SLIDE ----------------------------------
    function updateSitPostFall(dt) {
      const w = spriteWidth(main);
      const h = spriteHeight(main);
      const W = window.innerWidth;
      const F = floorY();

      // lock Y to floor with bottom pivot
      pivotMode = 'bottom';
      applyTransform(main);
      anchorY = F;
      main.src = sitSrc;

      // horizontal slide with friction
      if (Math.abs(velX) > 0) {
        const sign = velX > 0 ? 1 : -1;
        velX -= sign * FRICTION * dt;
        if (velX * sign < 0) velX = 0;
        anchorX += velX * dt;

        // wrap while sliding
        if (anchorX > W + w / 2) anchorX -= (W + w);
        if (anchorX < -w / 2) anchorX += (W + w);
      }

      renderAt(main, anchorX, anchorY);

      // when completely stationary, return to idle
      if (velX === 0 && velY === 0) {
        startIdle();
      }
    }

    // --- WALKING UPDATE + WRAP (Balloon Fight style) ----------------
    function updateWalk(dt) {
      const w = spriteWidth(main);
      const h = spriteHeight(main);
      const W = window.innerWidth;

      pivotMode = 'bottom';
      applyTransform(main);
      anchorY = floorY();
      main.src = walkSrc;

      const speed = w; // one width per second
      anchorX += direction * speed * dt;

      const left = anchorX - w / 2;
      const right = anchorX + w / 2;

      // Start wrap if leaving the screen
      if (!wrapActive && (left < 0 || right > W)) {
        wrapActive = true;
        wrapDirection = direction;
        projectedOffset = W * wrapDirection;
        createCloneIfNeeded();
        clone.src = main.src;
        applyTransform(clone);
      }

      if (wrapActive && clone) {
        const mainCenter = anchorX;
        const cloneCenter = mainCenter - projectedOffset;
        renderAt(main, mainCenter, anchorY);
        renderAt(clone, cloneCenter, anchorY);

        const cloneLeft = cloneCenter - w / 2;
        const cloneRight = cloneCenter + w / 2;

        // When clone fully in frame -> teleport real to clone
        if (cloneLeft >= 0 && cloneRight <= W) {
          const dx = projectedOffset;
          anchorX = cloneCenter;
          if (targetX != null) targetX -= dx;
          removeClone();

          const reached = (direction === 1 && anchorX >= targetX) ||
                          (direction === -1 && anchorX <= targetX);
          if (reached) {
            stopWalkAndIdle(targetX);
          } else {
            renderAt(main, anchorX, anchorY);
          }
          return;
        }
        return;
      }

      // No wrap active: clamp to screen edges, end walk when reaching target
      const minC = w / 2;
      const maxC = Math.max(minC, W - w / 2);
      anchorX = clamp(anchorX, minC, maxC);

      const reached = (direction === 1 && anchorX >= targetX) ||
                      (direction === -1 && anchorX <= targetX);
      if (reached) {
        stopWalkAndIdle(targetX);
        removeClone();
        return;
      }

      renderAt(main, anchorX, anchorY);
    }

    // --- RAF LOOP ----------------------------------------------------
    function rafTick(ts) {
      if (!document.body.contains(main)) {
        requestAnimationFrame(rafTick);
        return;
      }

      if (lastTime == null) lastTime = ts;
      const dt = Math.min(0.05, (ts - lastTime) / 1000);
      lastTime = ts;

      ensureAnchorsInitialized();

      if (mode === 'dangling') {
        // Just follow the cursor with top pivot
        pivotMode = 'top';
        applyTransform(main);
        main.src = dangleSrc;
        renderAt(main, anchorX, anchorY);
        requestAnimationFrame(rafTick);
        return;
      }

      if (mode === 'airborne') {
        updateAirborne(dt);
        requestAnimationFrame(rafTick);
        return;
      }

      if (mode === 'sit' && sitMode === 'postFall') {
        updateSitPostFall(dt);
        requestAnimationFrame(rafTick);
        return;
      }

      if (mode === 'walk') {
        updateWalk(dt);
        requestAnimationFrame(rafTick);
        return;
      }

      if (mode === 'idle') {
        pivotMode = 'bottom';
        applyTransform(main);
        lockToFloorBottomPivot();
        main.src = idleSrc;
        renderAt(main, anchorX, anchorY);
        if (clone && !wrapActive) removeClone();
        requestAnimationFrame(rafTick);
        return;
      }

      if (mode === 'sit' && sitMode === 'random') {
        pivotMode = 'bottom';
        applyTransform(main);
        lockToFloorBottomPivot();
        main.src = sitSrc;
        renderAt(main, anchorX, anchorY);
        if (clone && !wrapActive) removeClone();
        requestAnimationFrame(rafTick);
        return;
      }

      requestAnimationFrame(rafTick);
    }

    // --- POINTER / DRAG HANDLERS ------------------------------------
    function onPointerDown(e) {
      if (dragging) return;
      dragPointerId = e.pointerId;
      dragging = true;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      lastDragT = performance.now();
      dragVX = 0;
      dragVY = 0;
      main.setPointerCapture(dragPointerId);
      startDangling(e.clientX, e.clientY);
    }

    function onPointerMove(e) {
      if (!dragging || e.pointerId !== dragPointerId) return;
      const now = performance.now();
      const dt = Math.max(0.001, (now - lastDragT) / 1000);
      const dx = e.clientX - lastDragX;
      const dy = e.clientY - lastDragY;
      dragVX = dx / dt;
      dragVY = dy / dt;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      lastDragT = now;
      anchorX = e.clientX;
      anchorY = e.clientY;
      pivotMode = 'top';
      applyTransform(main);
      main.src = dangleSrc;
      renderAt(main, anchorX, anchorY);
    }

    function finishDrag() {
      if (!dragging) return;
      dragging = false;
      const id = dragPointerId;
      dragPointerId = null;
      if (id != null) {
        try { main.releasePointerCapture(id); } catch (e) {}
      }
      endDangling();
    }

    function onPointerUp(e) {
      if (!dragging || e.pointerId !== dragPointerId) return;
      finishDrag();
    }

    function onPointerCancel(e) {
      if (!dragging || e.pointerId !== dragPointerId) return;
      finishDrag();
    }

    // --- INIT AFTER PRELOAD -----------------------------------------
    function initAfterPreload() {
      document.body.appendChild(main);
      main.src = idleSrc;

      applyScaleForScreen();

      // Random starting x on screen, bottom pivot at floor
      pivotMode = 'bottom';
      applyTransform(main);
      const w = spriteWidth(main);
      const minC = w / 2;
      const maxC = Math.max(minC, window.innerWidth - w / 2);
      anchorX = randBetween(minC, maxC);
      anchorY = floorY();
      renderAt(main, anchorX, anchorY);

      main.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerCancel);

      window.addEventListener('resize', function () {
        applyScaleForScreen();
        const w2 = spriteWidth(main);
        const minC2 = w2 / 2;
        const maxC2 = Math.max(minC2, window.innerWidth - w2 / 2);
        if (anchorX != null) anchorX = clamp(anchorX, minC2, maxC2);
        if (mode !== 'dangling' && mode !== 'airborne') {
          anchorY = floorY();
        }
        renderAt(main, anchorX, anchorY);
      });

      startInitialState();

      setTimeout(function () {
        requestAnimationFrame(rafTick);
      }, 50);
    }

    // Wait for all images to preload
    let remaining = preloadImgs.length;
    preloadImgs.forEach(function (img) {
      if (img.complete && img.naturalWidth) {
        remaining--;
        if (remaining === 0) initAfterPreload();
      } else {
        img.addEventListener('load', function () {
          remaining--;
          if (remaining === 0) initAfterPreload();
        }, { once: true });
        img.addEventListener('error', function () {
          remaining--;
          if (remaining === 0) initAfterPreload();
        }, { once: true });
      }
    });
    if (remaining === 0) initAfterPreload();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTinyChancy);
  } else {
    loadTinyChancy();
  }
})();
