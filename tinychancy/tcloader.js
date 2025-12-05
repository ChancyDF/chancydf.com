(function() {
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000;
  const IDLE_MAX = 10000;
  const SIT_MIN = 10000;
  const SIT_MAX = 60000;
  const GRAVITY = 300;
  const DROP_SPEED_THRESHOLD = 10;
  const FRICTION = 600;
  const Z_INDEX = 9999;

  const idleSrc = '/tinychancy/tinychancy_idle.gif';
  const walkSrc = '/tinychancy/tinychancy_walk.gif';
  const sitSrc = '/tinychancy/tinychancy_sit.gif';
  const dangleSrc = '/tinychancy/tinychancy_dangle.gif';

  const preloadImgs = [idleSrc, walkSrc, sitSrc, dangleSrc].map(function(src) {
    const img = new Image();
    img.src = src;
    return img;
  });

  function loadTinyChancy() {
    const main = document.createElement('img');
    main.id = 'tinychancy';
    main.style.position = 'fixed';
    main.style.top = '0';
    main.style.left = '0';
    main.style.transformOrigin = 'center bottom';
    main.style.transform = 'scale(' + BASE_SCALE + ') scaleX(1)';
    main.style.zIndex = String(Z_INDEX);
    main.style.willChange = 'transform,left,top';
    main.style.pointerEvents = 'auto';

    let clone = null;

    let anchorX = null;
    let anchorY = null;
    let facing = 1;
    let currentScale = BASE_SCALE;

    let mode = 'idle';
    let sitKind = null;

    let direction = 0;
    let targetX = null;

    let wrapActive = false;
    let wrapDirection = 0;
    let projectedOffset = 0;

    let velX = 0;
    let velY = 0;
    let hasBounced = false;

    let chooseTimer = null;
    let flipBackTimer = null;
    let sitTimer = null;

    let lastTime = null;

    let dragging = false;
    let dragPointerId = null;
    let lastDragX = 0;
    let lastDragY = 0;
    let lastDragT = 0;
    let dragVX = 0;
    let dragVY = 0;

    function clamp(v, a, b) {
      return Math.min(Math.max(v, a), b);
    }

    function randBetween(a, b) {
      return Math.random() * (b - a) + a;
    }

    function chance(p) {
      return Math.random() < p;
    }

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

    function applyTransform(el, originTop) {
      el.style.transformOrigin = originTop ? 'center top' : 'center bottom';
      el.style.transform = 'scale(' + currentScale + ') scaleX(' + facing + ')';
    }

    function renderAt(el, ax, ay) {
      const w = spriteWidth(el);
      el.style.left = (ax - w / 2) + 'px';
      el.style.top = ay + 'px';
    }

    function floorY() {
      return window.innerHeight;
    }

    function applyScaleForScreen() {
      const w = window.innerWidth;
      if (w < 400) currentScale = BASE_SCALE * 0.6;
      else if (w < 700) currentScale = BASE_SCALE * 0.8;
      else currentScale = BASE_SCALE;
      applyTransform(main, mode === 'dangling' || mode === 'airborne' || mode === 'sitAfterPhysics');
      if (clone) applyTransform(clone, mode === 'dangling' || mode === 'airborne' || mode === 'sitAfterPhysics');
    }

    function lockToFloor() {
      const h = spriteHeight(main);
      anchorY = floorY() - h;
    }

    function setFacing(newFacing) {
      if (facing === newFacing) return;
      facing = newFacing;
      applyTransform(main, mode === 'dangling' || mode === 'airborne' || mode === 'sitAfterPhysics');
      if (clone) applyTransform(clone, mode === 'dangling' || mode === 'airborne' || mode === 'sitAfterPhysics');
      if (anchorX != null && anchorY != null) {
        renderAt(main, anchorX, anchorY);
        if (clone && wrapActive) {
          const cloneCenter = anchorX - projectedOffset;
          renderAt(clone, cloneCenter, anchorY);
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
      hasBounced = false;
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

    function createCloneIfNeeded() {
      if (clone) return;
      clone = document.createElement('img');
      clone.id = 'tinychancy_clone';
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.zIndex = String(Z_INDEX);
      clone.style.willChange = 'transform,left,top';
      clone.src = main.src;
      applyTransform(clone, false);
      document.body.appendChild(clone);
    }

    function startIdle() {
      clearTimers();
      resetPhysics();
      removeClone();
      mode = 'idle';
      sitKind = null;
      lockToFloor();
      main.src = idleSrc;
      if (facing === -1) {
        flipBackTimer = setTimeout(function() {
          setFacing(1);
          flipBackTimer = null;
          lockToFloor();
          renderAt(main, anchorX, anchorY);
        }, 1000);
      }
      const wait = randBetween(IDLE_MIN, IDLE_MAX);
      chooseTimer = setTimeout(function() {
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

    function startRandomSit(duration) {
      clearTimers();
      resetPhysics();
      removeClone();
      mode = 'sitRandom';
      sitKind = 'random';
      lockToFloor();
      setFacing(1);
      applyTransform(main, false);
      main.src = sitSrc;
      renderAt(main, anchorX, anchorY);
      sitTimer = setTimeout(function() {
        sitTimer = null;
        startIdle();
      }, duration);
    }

    function startInitialState() {
      lockToFloor();
      if (chance(0.2)) {
        const dur = randBetween(SIT_MIN, SIT_MAX);
        startRandomSit(dur);
      } else {
        startIdle();
      }
    }

    function startWalk() {
      clearTimers();
      resetPhysics();
      removeClone();
      mode = 'walk';
      sitKind = null;
      lockToFloor();
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
      main.src = walkSrc;
      applyTransform(main, false);
      renderAt(main, anchorX, anchorY);
    }

    function stopWalkAndIdle(x) {
      anchorX = x;
      startIdle();
    }

    function startPostPhysicsSit() {
      clearTimers();
      mode = 'sitAfterPhysics';
      sitKind = 'postPhysics';
      main.src = sitSrc;
      applyTransform(main, false);
      lockToFloor();
      renderAt(main, anchorX, anchorY);
    }

    function startDangling(px, py) {
      clearTimers();
      resetPhysics();
      removeClone();
      mode = 'dangling';
      sitKind = null;
      dragging = true;
      facing = 1;
      main.src = dangleSrc;
      applyTransform(main, true);
      anchorX = px;
      anchorY = py;
      renderAt(main, anchorX, anchorY);
    }

    function endDangling() {
      dragging = false;
      dragPointerId = null;
      const speed = Math.sqrt(dragVX * dragVX + dragVY * dragVY);
      resetPhysics();
      if (speed < DROP_SPEED_THRESHOLD) {
        velX = 0;
        velY = 0;
      } else {
        velX = dragVX;
        velY = dragVY;
      }
      mode = 'airborne';
      sitKind = null;
      main.src = dangleSrc;
      applyTransform(main, true);
    }

    function updateAirborne(dt) {
      const w = spriteWidth(main);
      const h = spriteHeight(main);
      velY += GRAVITY * dt;
      anchorX += velX * dt;
      anchorY += velY * dt;
      const W = window.innerWidth;
      const left = anchorX - w / 2;
      const right = anchorX + w / 2;
      if (right < 0) {
        anchorX += W + w;
      } else if (left > W) {
        anchorX -= W + w;
      }
      const fy = floorY();
      const bottom = anchorY + h;
      if (bottom >= fy) {
        anchorY = fy - h;
        if (!hasBounced && velY > 0) {
          velY = -Math.abs(velY) * 0.5;
          hasBounced = true;
        } else if (hasBounced) {
          velY = 0;
          startPostPhysicsSit();
        }
      }
      main.src = dangleSrc;
      applyTransform(main, true);
      renderAt(main, anchorX, anchorY);
    }

    function updateSitAfterPhysics(dt) {
      const w = spriteWidth(main);
      const h = spriteHeight(main);
      const W = window.innerWidth;
      const fy = floorY();
      anchorY = fy - h;
      if (Math.abs(velX) > 0) {
        const sign = velX > 0 ? 1 : -1;
        velX -= sign * FRICTION * dt;
        if (velX * sign < 0) velX = 0;
        anchorX += velX * dt;
        const left = anchorX - w / 2;
        const right = anchorX + w / 2;
        if (right < 0) {
          anchorX += W + w;
        } else if (left > W) {
          anchorX -= W + w;
        }
      }
      main.src = sitSrc;
      applyTransform(main, false);
      renderAt(main, anchorX, anchorY);
      if (Math.abs(velX) === 0) {
        startIdle();
      }
    }

    function updateWalk(dt) {
      const w = spriteWidth(main);
      const h = spriteHeight(main);
      lockToFloor();
      const speed = w;
      anchorX += direction * speed * dt;
      const W = window.innerWidth;
      const left = anchorX - w / 2;
      const right = anchorX + w / 2;
      if (!wrapActive && (left < 0 || right > W)) {
        wrapActive = true;
        wrapDirection = direction;
        projectedOffset = W * wrapDirection;
        createCloneIfNeeded();
        clone.src = main.src;
        applyTransform(clone, false);
      }
      if (wrapActive && clone) {
        const mainCenter = anchorX;
        const cloneCenter = mainCenter - projectedOffset;
        renderAt(main, mainCenter, anchorY);
        renderAt(clone, cloneCenter, anchorY);
        const cloneLeft = cloneCenter - w / 2;
        const cloneRight = cloneCenter + w / 2;
        if (cloneLeft >= 0 && cloneRight <= W) {
          anchorX = cloneCenter;
          const dx = projectedOffset;
          if (targetX != null) targetX -= dx;
          removeClone();
          const reached = (direction === 1 && anchorX >= targetX) || (direction === -1 && anchorX <= targetX);
          if (reached) {
            stopWalkAndIdle(targetX);
          } else {
            renderAt(main, anchorX, anchorY);
          }
          return;
        }
        return;
      }
      anchorX = clamp(anchorX, w / 2, Math.max(w / 2, window.innerWidth - w / 2));
      const reached = (direction === 1 && anchorX >= targetX) || (direction === -1 && anchorX <= targetX);
      if (reached) {
        stopWalkAndIdle(targetX);
        removeClone();
        return;
      }
      renderAt(main, anchorX, anchorY);
    }

    function rafTick(ts) {
      if (!document.body.contains(main)) {
        requestAnimationFrame(rafTick);
        return;
      }
      if (lastTime == null) lastTime = ts;
      const dt = Math.min(0.05, (ts - lastTime) / 1000);
      lastTime = ts;

      if (anchorX == null || anchorY == null) {
        const r = spriteRect(main);
        anchorX = r.left + r.width / 2;
        anchorY = r.top;
      }

      if (mode === 'dangling') {
        main.src = dangleSrc;
        applyTransform(main, true);
        renderAt(main, anchorX, anchorY);
        requestAnimationFrame(rafTick);
        return;
      }

      if (mode === 'airborne') {
        updateAirborne(dt);
        requestAnimationFrame(rafTick);
        return;
      }

      if (mode === 'sitAfterPhysics') {
        updateSitAfterPhysics(dt);
        requestAnimationFrame(rafTick);
        return;
      }

      if (mode === 'walk') {
        main.src = walkSrc;
        applyTransform(main, false);
        updateWalk(dt);
      } else if (mode === 'idle') {
        lockToFloor();
        main.src = idleSrc;
        applyTransform(main, false);
        renderAt(main, anchorX, anchorY);
      } else if (mode === 'sitRandom') {
        lockToFloor();
        main.src = sitSrc;
        applyTransform(main, false);
        renderAt(main, anchorX, anchorY);
      }

      if (clone && !wrapActive) {
        removeClone();
      }

      requestAnimationFrame(rafTick);
    }

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
      main.src = dangleSrc;
      applyTransform(main, true);
      renderAt(main, anchorX, anchorY);
    }

    function onPointerUp(e) {
      if (!dragging || e.pointerId !== dragPointerId) return;
      main.releasePointerCapture(dragPointerId);
      endDangling();
    }

    function onPointerCancel(e) {
      if (!dragging || e.pointerId !== dragPointerId) return;
      main.releasePointerCapture(dragPointerId);
      endDangling();
    }

    function initAfterPreload() {
      document.body.appendChild(main);
      main.src = idleSrc;
      applyScaleForScreen();
      const w = spriteWidth(main);
      const minC = w / 2;
      const maxC = Math.max(minC, window.innerWidth - w / 2);
      anchorX = randBetween(minC, maxC);
      lockToFloor();
      renderAt(main, anchorX, anchorY);

      main.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerCancel);

      window.addEventListener('resize', function() {
        applyScaleForScreen();
        const w2 = spriteWidth(main);
        const minC2 = w2 / 2;
        const maxC2 = Math.max(minC2, window.innerWidth - w2 / 2);
        if (anchorX != null) anchorX = clamp(anchorX, minC2, maxC2);
        if (mode !== 'dangling' && mode !== 'airborne') {
          lockToFloor();
        }
        renderAt(main, anchorX, anchorY);
      });

      startInitialState();
      setTimeout(function() {
        requestAnimationFrame(rafTick);
      }, 50);
    }

    let remaining = preloadImgs.length;
    preloadImgs.forEach(function(img) {
      if (img.complete && img.naturalWidth) {
        remaining--;
        if (remaining === 0) initAfterPreload();
      } else {
        img.addEventListener('load', function() {
          remaining--;
          if (remaining === 0) initAfterPreload();
        }, { once: true });
        img.addEventListener('error', function() {
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
