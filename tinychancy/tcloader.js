/*
  TinyChancy loader with pick-up / dangle / physics & portal wrap (Option A).
  Place at: /tinychancy/tcloader.js
  Requires GIFs:
    /tinychancy/tinychancy_idle.gif
    /tinychancy/tinychancy_walk.gif
    /tinychancy/tinychancy_sit.gif
    /tinychancy/tinychancy_dangle.gif
*/

(function() {
  /* ---------- CONFIG ---------- */
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000;
  const IDLE_MAX = 10000;
  const SIT_MIN = 10 * 1000;
  const SIT_MAX = 60 * 1000;
  const Z_INDEX = 9999;

  // physics
  const GRAVITY = 300; // px / s^2 downward
  const MAX_ROT_DEG = 90; // clamp rotation deg while dangling
  const ANGULAR_DAMPING = 8.0; // damping when dangling / after release
  const LINEAR_AIR_DRAG = 0.98; // small drag each frame while airborne
  const BOUNCE_ENERGY_FACTOR = 0.5; // corresponds to bounce height = (factor^2) * dropHeight; we compute properly below

  const IDLE_SIT_CHANCE_ON_ACTION = 1/10; // 1/10 chance to sit instead of walking
  const START_SIT_CHANCE = 1/5; // 1/5 chance to start sitting on page load

  /* ---------- UTILS ---------- */
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const randBetween = (a, b) => Math.random() * (b - a) + a;
  const chance = p => Math.random() < p;

  /* ---------- LOAD ---------- */
  function loadTinyChancy() {
    const idleSrc = '/tinychancy/tinychancy_idle.gif';
    const walkSrc = '/tinychancy/tinychancy_walk.gif';
    const sitSrc  = '/tinychancy/tinychancy_sit.gif';
    const dangleSrc = '/tinychancy/tinychancy_dangle.gif';

    // Preload images
    const preloadList = [idleSrc, walkSrc, sitSrc, dangleSrc].map(src => {
      const i = new Image();
      i.src = src;
      return i;
    });

    // Main element (created but appended after preload)
    const main = document.createElement('img');
    main.id = 'tinychancy';
    main.style.position = 'fixed';
    main.style.bottom = '0'; // initial; will be controlled via coordinates
    main.style.left = '0';
    main.style.transformOrigin = 'center bottom';
    main.style.transform = `scale(${BASE_SCALE}) scaleX(1) rotate(0deg)`;
    main.style.pointerEvents = 'none';
    main.style.willChange = 'left, top';
    main.style.zIndex = String(Z_INDEX);

    // Clone element for portal wrap (created lazily)
    let clone = null;

    /* ---------- STATE ---------- */
    let currentScale = BASE_SCALE;
    let facing = 1;           // 1 = right, -1 = left
    let centerX = null;       // authoritative x center
    let centerY = null;       // authoritative y center (vertical center)
    let mode = 'idle';        // 'idle','walking','sitting','dangle','airborne'
    // walking state
    let moving = false;
    let direction = 0; // 1 or -1
    let targetX = null;
    // physics while airborne/dropped
    let vx = 0; // px/s horizontal velocity (positive = right)
    let vy = 0; // px/s vertical velocity (positive = down)
    let lastTime = null;
    // rotation while dangling
    let angleDeg = 0;
    let angularVel = 0; // deg/s

    // timers
    let chooseTimer = null;
    let flipBackTimer = null;
    let sitTimer = null;

    // drag state
    let dragging = false;
    let lastPointerX = null;
    let lastPointerY = null;
    let pointerHistory = []; // recent positions for velocity calc
    const POINTER_HISTORY_MS = 120; // track last 120ms

    // wrap state
    let wrapActive = false;
    let wrapDirection = 0; // 1 or -1
    let projectedOffset = 0; // window.innerWidth * wrapDirection

    // bounce guard: only one bounce per airborne event
    let hasBounced = false;
    let dropStartY = null; // to compute bounce height

    /* ---------- HELPERS ---------- */
    function currentSpriteRect(elRef = main) {
      return elRef.getBoundingClientRect();
    }
    function currentSpriteWidth(elRef = main) {
      const r = currentSpriteRect(elRef);
      return (r && r.width) || (preloadList[0] && preloadList[0].width) || 50;
    }
    function currentSpriteHeight(elRef = main) {
      const r = currentSpriteRect(elRef);
      return (r && r.height) || (preloadList[0] && preloadList[0].height) || 50;
    }

    // Render depending on mode: for most modes, element is anchored center-bottom.
    // While dangling, anchor should be center-top.
    function renderAll() {
      if (!main) return;
      if (mode === 'dangle') {
        // transform-origin center top
        main.style.transformOrigin = 'center top';
        // compute top-left so that top-center is at pointer position (centerX, centerY represents center)
        // We set centerX/centerY such that top-center aligns to pointer: centerY = top + height/2
        const h = currentSpriteHeight(main);
        const left = centerX - currentSpriteWidth(main) / 2;
        const top = centerY - h / 2; // centerY stored as top + h/2
        main.style.left = left + 'px';
        main.style.top = top + 'px';
        // apply scale/flip/rotation
        main.style.transform = `scale(${currentScale}) scaleX(${facing}) rotate(${angleDeg}deg)`;
      } else {
        // normal anchor: center-bottom at centerY. We'll treat centerY as center; but we want bottom at window.innerHeight by default
        main.style.transformOrigin = 'center bottom';
        const h = currentSpriteHeight(main);
        const left = centerX - currentSpriteWidth(main) / 2;
        const top = centerY - h / 2;
        main.style.left = left + 'px';
        main.style.top = top + 'px';
        main.style.transform = `scale(${currentScale}) scaleX(${facing}) rotate(0deg)`;
      }

      // If clone exists, position it symmetrically across projectedOffset
      if (clone) {
        clone.style.transformOrigin = (mode === 'dangle') ? 'center top' : 'center bottom';
        clone.style.transform = (mode === 'dangle')
          ? `scale(${currentScale}) scaleX(${facing}) rotate(${angleDeg}deg)`
          : `scale(${currentScale}) scaleX(${facing}) rotate(0deg)`;

        // clone center = centerX - projectedOffset
        const cloneCenterX = centerX - projectedOffset;
        if (mode === 'dangle') {
          const h = currentSpriteHeight(clone);
          const leftC = cloneCenterX - currentSpriteWidth(clone) / 2;
          const topC = centerY - h / 2;
          clone.style.left = leftC + 'px';
          clone.style.top = topC + 'px';
        } else {
          const h = currentSpriteHeight(clone);
          const leftC = cloneCenterX - currentSpriteWidth(clone) / 2;
          const topC = centerY - h / 2;
          clone.style.left = leftC + 'px';
          clone.style.top = topC + 'px';
        }
      }
    }

    function setFacing(newFacing) {
      if (facing === newFacing) return;
      facing = newFacing;
      // update transforms on render
      renderAll();
    }

    function adjustScaleForScreen() {
      const w = window.innerWidth;
      if (w < 400) currentScale = BASE_SCALE * 0.6;
      else if (w < 700) currentScale = BASE_SCALE * 0.8;
      else currentScale = BASE_SCALE;
      renderAll();
    }

    function createCloneIfNeeded() {
      if (clone) return;
      clone = document.createElement('img');
      clone.id = 'tinychancy_clone';
      clone.style.position = 'fixed';
      clone.style.pointerEvents = 'none';
      clone.style.willChange = 'left, top';
      clone.style.zIndex = String(Z_INDEX);
      // Start clone src same as main to visually mimic
      clone.src = main.src;
      document.body.appendChild(clone);
      applyScaleAndFacing(clone);
    }

    function applyScaleAndFacing(elRef) {
      elRef.style.transform = `scale(${currentScale}) scaleX(${facing}) rotate(0deg)`;
    }

    function removeClone() {
      if (!clone) return;
      try { clone.remove(); } catch (e) {}
      clone = null;
      wrapActive = false;
      wrapDirection = 0;
      projectedOffset = 0;
    }

    /* ---------- TIMERS / STATES ---------- */
    function clearAllTimers() {
      if (chooseTimer) { clearTimeout(chooseTimer); chooseTimer = null; }
      if (flipBackTimer) { clearTimeout(flipBackTimer); flipBackTimer = null; }
      if (sitTimer) { clearTimeout(sitTimer); sitTimer = null; }
    }

    function startIdleState() {
      clearAllTimers();
      mode = 'idle';
      moving = false;
      direction = 0;
      targetX = null;
      vx = 0; vy = 0;
      hasBounced = false;

      // flip back to right after 1s if facing left
      if (facing === -1) {
        flipBackTimer = setTimeout(() => {
          setFacing(1);
          flipBackTimer = null;
        }, 1000);
      }

      // schedule next action 5-10s
      const wait = randBetween(IDLE_MIN, IDLE_MAX);
      chooseTimer = setTimeout(() => {
        chooseTimer = null;
        // 1/10 chance to sit instead of walk
        if (chance(IDLE_SIT_CHANCE_ON_ACTION)) {
          const dur = randBetween(SIT_MIN, SIT_MAX);
          startSitting(dur);
        } else {
          prepareAndStartMove();
        }
      }, wait);

      main.src = idleSrc;
      // ensure anchor normal
      main.style.transformOrigin = 'center bottom';
      renderAll();
    }

    function startSitting(durationMs) {
      clearAllTimers();
      mode = 'sitting';
      sitting = true;
      moving = false;
      direction = 0;
      targetX = null;
      vx = 0; vy = 0;
      hasBounced = false;
      // sitting always faces right
      setFacing(1);
      main.src = sitSrc;
      main.style.transformOrigin = 'center bottom';
      // schedule end of sit
      sitTimer = setTimeout(() => {
        sitTimer = null;
        sitting = false;
        startIdleState();
      }, durationMs);
    }

    function prepareAndStartMove() {
      // pick target at least 100px away
      mode = 'walking';
      main.style.transformOrigin = 'center bottom';
      main.src = walkSrc;

      const w = currentSpriteWidth(main);
      const minC = w/2;
      const maxC = Math.max(minC, window.innerWidth - w/2);
      targetX = pickTargetWithin(minC, maxC);
      direction = targetX > centerX ? 1 : -1;
      setFacing(direction === 1 ? 1 : -1);
      moving = true;
      vx = 0; vy = 0;
      hasBounced = false;
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

    /* ---------- DRAG / POINTER HANDLING ---------- */
    // helper to get pointer coordinates
    function getPointerEvent(e) {
      if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.changedTouches && e.changedTouches[0]) {
        return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      } else {
        return { x: e.clientX, y: e.clientY };
      }
    }

    // start drag if pointer down on main element (or anywhere? we'll allow anywhere near sprite)
    function onPointerDown(e) {
      const p = getPointerEvent(e);
      // detect if pointer is within main bounding box at press
      const rect = currentSpriteRect(main);
      if (!rect) return;
      // allow small tolerance
      if (p.x < rect.left - 10 || p.x > rect.right + 10 || p.y < rect.top - 10 || p.y > rect.bottom + 10) {
        // clicked outside sprite -> ignore pickup
        return;
      }
      e.preventDefault && e.preventDefault();

      // start dragging: change mode to dangle
      clearAllTimers();
      if (clone) removeClone();
      mode = 'dangle';
      dragging = true;
      // ensure dangle sprite is used
      main.src = dangleSrc;
      main.style.transformOrigin = 'center top';

      // record pointer history for momentum
      pointerHistory = [];
      lastPointerX = p.x;
      lastPointerY = p.y;
      pushPointerHistory(p.x, p.y, performance.now());

      // set center such that top-center is at pointer (top = pointer.y)
      const h = currentSpriteHeight(main);
      centerX = p.x;
      centerY = p.y + h/2; // centerY stored as center; but render uses top = centerY - h/2
      // reset angular velocity and angle small
      angularVel = 0;
      angleDeg = 0;

      // attach move/up listeners on window
      window.addEventListener('mousemove', onPointerMove, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('mouseup', onPointerUp, { passive: false });
      window.addEventListener('touchend', onPointerUp, { passive: false });

      // we want to show immediately
      renderAll();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const p = getPointerEvent(e);
      e.preventDefault && e.preventDefault();

      // update pointer history
      const t = performance.now();
      pushPointerHistory(p.x, p.y, t);

      // compute small pointer delta to set centerX/centerY instantly
      const dx = p.x - lastPointerX;
      const dy = p.y - lastPointerY;
      lastPointerX = p.x;
      lastPointerY = p.y;

      // update center so top-center stays at pointer (centerY = pointer.y + h/2)
      const h = currentSpriteHeight(main);
      centerX = p.x;
      centerY = p.y + h/2;

      // angular response: angularVel gets influenced by horizontal pointer motion
      const ANGLE_FACTOR = 0.6; // tuning constant: px -> deg/s influence
      angularVel += dx * ANGLE_FACTOR;

      // clamp angularVel a bit
      angularVel = clamp(angularVel, -2000, 2000);

      // limit angle (will be clamped in update)
      renderAll();
    }

    function pushPointerHistory(x, y, t) {
      pointerHistory.push({x,y,t});
      // remove old entries
      while (pointerHistory.length > 0 && (t - pointerHistory[0].t) > POINTER_HISTORY_MS) {
        pointerHistory.shift();
      }
    }

    function computePointerVelocity() {
      // returns {vx, vy} in px/s based on pointerHistory
      if (pointerHistory.length < 2) return { vx: 0, vy: 0 };
      const first = pointerHistory[0];
      const last = pointerHistory[pointerHistory.length - 1];
      const dt = (last.t - first.t) / 1000;
      if (dt <= 0) return { vx: 0, vy: 0 };
      const vx = (last.x - first.x) / dt;
      const vy = (last.y - first.y) / dt;
      return { vx, vy };
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      // remove listeners
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);

      // compute momentum from pointer history
      const m = computePointerVelocity();
      // small threshold: if momentum is tiny -> "no momentum" drop
      const SPEED_THRESHOLD = 80; // px/s
      const speed = Math.hypot(m.vx, m.vy);

      // set angularVel to continue (some) momentum, will decay
      angularVel = clamp(angularVel, -2000, 2000);

      // Switch to airborne with physics
      mode = 'airborne';
      // anchor returns to center-bottom for rendering while airborne (but we keep centerY as vertical center)
      main.style.transformOrigin = 'center bottom';
      // convert pointer-derived centerY(top) to center-based: centerY already stored as top + h/2, so fine.

      // If speed is below threshold => drop with no initial velocity (vy=0)
      if (speed < SPEED_THRESHOLD) {
        vx = 0;
        vy = 0;
      } else {
        // use pointer velocity: v positive downwards
        vx = m.vx;
        vy = m.vy;
      }

      // record drop start height for bounce calc
      dropStartY = centerY;

      // set main src remains dangle until hitting ground (per spec)
      main.src = dangleSrc;

      // prepare for wrap if needed (wrapActive may be triggered in raf loop)
      pointerHistory = [];
    }

    /* ---------- AIRBORNE / DROP BOUNCE LOGIC ---------- */
    function handleLanding(impactY) {
      // Called when centerY reaches ground center (touches floor).
      // We compute drop height h = groundY - dropStartY
      // ground center Y = window.innerHeight - spriteHeight/2
      const spriteH = currentSpriteHeight(main);
      const groundCenterY = window.innerHeight - spriteH / 2;
      const h = Math.max(0, groundCenterY - (dropStartY || groundCenterY));
      // compute rebound height = h / 4 (spec)
      const reboundH = h / 4;
      // compute impact velocity (positive down) = sqrt(2*g*h)
      const impactV = Math.sqrt(2 * GRAVITY * h || 0);
      // rebound velocity up (negative vy) = sqrt(2*g*reboundH) = impactV * (1/2)
      const reboundV = impactV * 0.5;

      // If thrown with momentum, we might have incoming vy; use same formula but ensure single bounce
      if (hasBounced) {
        // already bounced once: directly go to sitting (no second bounce)
        finishLandingToSit();
        return;
      }

      // Set vy to -reboundV (upwards), set hasBounced true
      hasBounced = true;
      vy = -reboundV;
      // After rebound upward motion completes and falls back to ground, we should then slide/come to rest and sit.
      // To ensure single bounce, we will detect next contact and then finishLandingToSit.
    }

    function finishLandingToSit() {
      // Called after final collision + bounce or when thrown with momentum and hits ground.
      // Ensure we only do this once per event.
      mode = 'sitting';
      moving = false;
      vx = 0;
      vy = 0;
      hasBounced = false;
      // face right while sitting
      setFacing(1);
      main.src = sitSrc;
      main.style.transformOrigin = 'center bottom';
      // on landing slide -> we call startSitting for a short sit then idle
      // We'll sit for a fixed short time (e.g., 2s) then return to idle (spec said go to sitting; then once stationary go to idling)
      const sitShort = 2000;
      if (sitTimer) { clearTimeout(sitTimer); sitTimer = null; }
      sitTimer = setTimeout(() => {
        sitTimer = null;
        startIdleState();
      }, sitShort);
    }

    /* ---------- RAF LOOP ---------- */
    function rafTick(ts) {
      if (lastTime === null) lastTime = ts;
      const dt = Math.min(0.05, (ts - lastTime) / 1000);
      lastTime = ts;

      // safety ensure we have centerX/Y
      if (centerX === null) {
        // initial compute using sprite size and random start (centerX random, centerY at ground)
        const w = currentSpriteWidth(main);
        const h = currentSpriteHeight(main);
        const minC = w/2;
        const maxC = Math.max(minC, window.innerWidth - w/2);
        centerX = randBetween(minC, maxC);
        centerY = window.innerHeight - h/2; // ground center
      }

      adjustScaleForScreen(); // ensure scale updated if needed

      // compute sprite sizes & ground center each frame
      const spriteW = currentSpriteWidth(main);
      const spriteH = currentSpriteHeight(main);
      const minCenterX = spriteW / 2;
      const maxCenterX = Math.max(minCenterX, window.innerWidth - spriteW / 2);
      const groundCenterY = window.innerHeight - spriteH / 2;

      // HANDLE MODES
      if (mode === 'dangle' && dragging) {
        // Dangling: angle integrates angularVel and damps; rotation limited to ±90
        // angularVel already influenced by pointer movement; apply damping
        angleDeg += angularVel * dt;
        // clamp angle
        angleDeg = clamp(angleDeg, -MAX_ROT_DEG, MAX_ROT_DEG);
        // apply angular damping to approach settle when dragging stops (but while dragging we want momentum)
        angularVel *= Math.exp(-ANGULAR_DAMPING * dt); // exponential damping

        // centerX/centerY already updated by pointer moves; if not, keep them clamped when needed
        // Keep top-center anchored to pointer during dragging; render handles top anchor
        renderAll();
        requestAnimationFrame(rafTick);
        return;
      }

      if (mode === 'dangle' && !dragging) {
        // Released but mode still dangle — actually we set mode to airborne on release, so this branch rarely used.
        // We'll just fall through.
      }

      if (mode === 'airborne') {
        // Airborne physics: integrate velocities with gravity
        // apply gravity to vy
        vy += GRAVITY * dt;
        // apply air drag to vx slightly
        vx *= Math.pow(LINEAR_AIR_DRAG, dt * 60); // normalized per-frame
        // update centers
        centerX += vx * dt;
        centerY += vy * dt;

        // Wrap handling: if centerX +/- half width out of screen, use clone projection strategy
        const leftEdge = centerX - spriteW / 2;
        const rightEdge = centerX + spriteW / 2;
        const W = window.innerWidth;

        // If we are partly offscreen horizontally and no wrap yet, create clone
        if (!wrapActive && (leftEdge < 0 || rightEdge > W)) {
          wrapActive = true;
          wrapDirection = (centerX < W/2) ? 1 : -1; // direction to create clone
          projectedOffset = wrapDirection * W;
          createCloneIfNeeded();
          if (clone) clone.src = main.src;
        }

        if (wrapActive && clone) {
          const cloneCenterX = centerX - projectedOffset;
          renderFromCenter(main, centerX);
          // for airborne, render top/bottom the same way (centerY used)
          renderFromCenter(clone, cloneCenterX);
          // When clone fully visible, swap real to clone position
          const cloneLeft = cloneCenterX - spriteW / 2;
          const cloneRight = cloneCenterX + spriteW / 2;
          if (cloneLeft >= 0 && cloneRight <= W) {
            // teleport real to clone center
            centerX = cloneCenterX;
            // also wrap targetX if had one
            if (targetX !== null) targetX = targetX - projectedOffset;
            removeClone();
            // continue physics as usual
          }
        } else {
          // normal render
          renderFromCenter(main, centerX);
        }

        // Landing detection: when centerY reaches groundCenterY or beyond
        if (centerY >= groundCenterY) {
          // landed/impact
          // Ensure centerY is clamped to ground
          centerY = groundCenterY;
          renderFromCenter(main, centerX);

          // If we haven't bounced yet, compute bounce and set vy upward
          if (!hasBounced) {
            // If vy downward small (dropped no momentum), treat as drop from dropStartY
            // if vy is small and dropStartY null, set dropStartY to ground (no bounce)
            // compute h = groundCenterY - dropStartY
            // but dropStartY may be null if airborne started elsewhere; default to ground
            const h = Math.max(0, (dropStartY != null ? (groundCenterY - dropStartY) : 0));
            if (h <= 1 && Math.abs(vy) < 10) {
              // minimal drop: no bounce, go to sit
              finishLandingToSit();
            } else {
              // compute impact velocity ~ vy (positive down). Use formula to set rebound height = h/4
              // If dropStartY known: compute h and reboundV = sqrt(2*g*h/4)
              let reboundV = 0;
              if (dropStartY != null && dropStartY < groundCenterY) {
                const dropH = groundCenterY - dropStartY;
                reboundV = Math.sqrt(2 * GRAVITY * (dropH / 4));
              } else {
                // fallback: use current vy to make a small bounce proportional
                reboundV = Math.abs(vy) * 0.5;
              }
              // set vy upward
              vy = -reboundV;
              hasBounced = true;
              // preserve vx (sliding)
            }
            requestAnimationFrame(rafTick);
            return;
          } else {
            // already bounced once — finish to sit
            finishLandingToSit();
            requestAnimationFrame(rafTick);
            return;
          }
        }

        requestAnimationFrame(rafTick);
        return;
      } // end airborne

      // WALKING / IDLE / SITTING modes
      if (mode === 'walking' && moving && direction !== 0 && targetX != null) {
        // move centerX at speed = spriteW px/s
        const speed = spriteW;
        let nextCenter = centerX + direction * speed * dt;

        // detect wrap start: if nextCenter edges go offscreen...
        const leftEdge = nextCenter - spriteW/2;
        const rightEdge = nextCenter + spriteW/2;
        const W = window.innerWidth;
        if (!wrapActive && (leftEdge < 0 || rightEdge > W)) {
          wrapActive = true;
          wrapDirection = (nextCenter < W/2) ? 1 : -1;
          projectedOffset = wrapDirection * W;
          createCloneIfNeeded();
          if (clone) clone.src = main.src;
        }

        if (wrapActive && clone) {
          const cloneCenter = nextCenter - projectedOffset;
          // render both
          renderFromCenter(main, nextCenter);
          renderFromCenter(clone, cloneCenter);
          // if clone fully visible, swap
          const cloneLeft = cloneCenter - spriteW/2;
          const cloneRight = cloneCenter + spriteW/2;
          if (cloneLeft >= 0 && cloneRight <= W) {
            centerX = cloneCenter;
            // adjust targetX
            if (targetX != null) targetX = targetX - projectedOffset;
            removeClone();
            renderFromCenter(main, centerX);
            // check reach
            const reached = (direction === 1 && centerX >= targetX) || (direction === -1 && centerX <= targetX);
            if (reached) {
              stopAndIdleAt(targetX);
              requestAnimationFrame(rafTick);
              return;
            }
            requestAnimationFrame(rafTick);
            return;
          } else {
            centerX = nextCenter;
            requestAnimationFrame(rafTick);
            return;
          }
        }

        // normal non-wrap: clamp within screen
        const clamped = clamp(nextCenter, minCenterX, maxCenterX);
        if (clamped !== nextCenter) {
          // hit wall -> stop
          centerX = clamped;
          stopAndIdleAt(centerX);
          requestAnimationFrame(rafTick);
          return;
        }

        centerX = nextCenter;
        renderFromCenter(main, centerX);

        // arrival?
        const reached = (direction === 1 && centerX >= targetX) || (direction === -1 && centerX <= targetX);
        if (reached) {
          stopAndIdleAt(targetX);
          requestAnimationFrame(rafTick);
          return;
        }

        requestAnimationFrame(rafTick);
        return;
      }

      // not moving: idle or sitting — ensure main visible and clone removed
      renderFromCenter(main, centerX);
      if (clone) removeClone();

      requestAnimationFrame(rafTick);
    } // end rafTick

    /* ---------- LANDING finalization ---------- */
    function finishLandingToSit() {
      // finalize: snap to ground centerY and go to sitting, then idle
      const spriteH = currentSpriteHeight(main);
      const groundC = window.innerHeight - spriteH / 2;
      centerY = groundC;
      centerX = clamp(centerX, spriteW/2, Math.max(spriteW/2, window.innerWidth - spriteW/2));
      main.src = sitSrc;
      main.style.transformOrigin = 'center bottom';
      mode = 'sitting';
      moving = false;
      vx = 0; vy = 0;
      // one short sit then idle
      if (sitTimer) { clearTimeout(sitTimer); sitTimer = null; }
      sitTimer = setTimeout(() => { sitTimer = null; startIdleState(); }, 2000);
    }

    /* ---------- POINTERS: attach to main after preload ---------- */
    function onLoadAttachPointers() {
      // Listen for pointerdown on whole document; only start if click/touch on sprite region
      window.addEventListener('mousedown', onPointerDown, { passive: false });
      window.addEventListener('touchstart', onPointerDown, { passive: false });
    }

    function onPointerDown(e) {
      const p = (e.touches && e.touches[0]) ? { x: e.touches[0].clientX, y: e.touches[0].clientY } :
                { x: e.clientX, y: e.clientY };
      const rect = currentSpriteRect(main);
      if (!rect) return;
      if (p.x < rect.left - 10 || p.x > rect.right + 10 || p.y < rect.top - 10 || p.y > rect.bottom + 10) {
        return; // not clicking on sprite
      }
      e.preventDefault && e.preventDefault();

      // start drag
      clearAllTimers();
      if (clone) removeClone();
      dragging = true;
      mode = 'dangle';
      main.src = dangleSrc;
      main.style.transformOrigin = 'center top';
      // init pointer history
      pointerHistory = [];
      const tnow = performance.now();
      pointerHistory.push({ x: p.x, y: p.y, t: tnow });
      lastPointerX = p.x; lastPointerY = p.y;
      // position top-center at pointer
      const h = currentSpriteHeight(main);
      centerX = p.x;
      centerY = p.y + h/2;
      angleDeg = 0; angularVel = 0;

      // attach move/end
      window.addEventListener('mousemove', onPointerMove, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('mouseup', onPointerUp, { passive: false });
      window.addEventListener('touchend', onPointerUp, { passive: false });

      renderAll();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const p = (e.touches && e.touches[0]) ? { x: e.touches[0].clientX, y: e.touches[0].clientY } :
                { x: e.clientX, y: e.clientY };
      e.preventDefault && e.preventDefault();
      const tnow = performance.now();
      // push history and trim to last POINTER_HISTORY_MS
      pointerHistory.push({ x: p.x, y: p.y, t: tnow });
      while (pointerHistory.length > 2 && (tnow - pointerHistory[0].t) > 120) pointerHistory.shift();

      // compute dx to influence angularVel
      const dx = p.x - lastPointerX;
      angularVel += dx * 0.6; // tuning constant
      angularVel = clamp(angularVel, -3000, 3000);

      lastPointerX = p.x; lastPointerY = p.y;

      // update center to keep top-center at pointer
      const h = currentSpriteHeight(main);
      centerX = p.x;
      centerY = p.y + h/2;

      // update render
      renderAll();
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      // compute momentum from pointerHistory
      const ph = pointerHistory;
      if (ph.length >= 2) {
        const first = ph[0];
        const last = ph[ph.length - 1];
        const dt = (last.t - first.t) / 1000;
        if (dt > 0) {
          const pvx = (last.x - first.x) / dt;
          const pvy = (last.y - first.y) / dt;
          const speed = Math.hypot(pvx, pvy);
          const SPEED_THRESHOLD = 80;
          if (speed < SPEED_THRESHOLD) {
            // no momentum drop
            vx = 0; vy = 0;
          } else {
            vx = pvx;
            vy = pvy;
          }
        } else {
          vx = 0; vy = 0;
        }
      } else {
        vx = 0; vy = 0;
      }

      // Set mode to airborne; keep dangle sprite until landing
      mode = 'airborne';
      main.src = dangleSrc;
      // restore transform-origin to bottom for normal airborne anchoring
      main.style.transformOrigin = 'center bottom';
      // cleanup pointer listeners
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);

      // record drop start for bounce calculation
      dropStartY = centerY;

      // pointer history clear
      pointerHistory = [];
      renderAll();
    }

    /* ---------- PRELOAD & INIT ---------- */
    let remaining = preloadList.length;
    preloadList.forEach(img => {
      if (img.complete && img.naturalWidth) {
        remaining--;
      } else {
        img.addEventListener('load', () => {
          remaining--;
          if (remaining === 0) initAfterPreload();
        }, { once: true, passive: true });
        img.addEventListener('error', () => {
          remaining--;
          if (remaining === 0) initAfterPreload();
        }, { once: true, passive: true });
      }
    });
    if (remaining === 0) initAfterPreload();

    function initAfterPreload() {
      // append main to DOM
      document.body.appendChild(main);

      // set initial scale & facing
      adjustScaleForScreen();
      setFacing(1);

      // initial centerX random on-screen, centerY at ground
      const w = currentSpriteWidth(main);
      const h = currentSpriteHeight(main);
      const minC = w/2;
      const maxC = Math.max(minC, window.innerWidth - w/2);
      centerX = randBetween(minC, maxC);
      centerY = window.innerHeight - h/2; // ground center

      // initial state: 1/5 chance to start sitting for 10-60s
      if (chance(START_SIT_CHANCE)) {
        const dur = randBetween(SIT_MIN, SIT_MAX);
        startSitting(dur);
      } else {
        startIdleState();
      }

      // attach pointer handlers (global)
      onLoadAttachPointers();

      // small delay to ensure DOM painted; then RAF
      setTimeout(() => {
        requestAnimationFrame(rafTick);
      }, 60);
    }

    function onLoadAttachPointers() {
      window.addEventListener('mousedown', onPointerDown, { passive: false });
      window.addEventListener('touchstart', onPointerDown, { passive: false });
    }

    // resize handling
    window.addEventListener('resize', () => {
      adjustScaleForScreen();
      const w = currentSpriteWidth(main);
      const h = currentSpriteHeight(main);
      const minC = w/2;
      const maxC = Math.max(minC, window.innerWidth - w/2);
      if (centerX !== null) centerX = clamp(centerX, minC, maxC);
      if (targetX !== null) targetX = clamp(targetX, minC, maxC);
      // if clone exists update projectedOffset
      if (clone && wrapDirection !== 0) {
        projectedOffset = wrapDirection * window.innerWidth;
        renderAll();
      }
      renderAll();
    }, { passive: true });

  } // end loadTinyChancy

  // start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTinyChancy);
  } else {
    loadTinyChancy();
  }

})();
