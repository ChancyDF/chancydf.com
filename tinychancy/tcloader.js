(function() {
  function loadTinyChancy() {
    var idleSrc = '/tinychancy/tinychancy_idle.gif';
    var walkSrc = '/tinychancy/tinychancy_walk.gif';
    var sitSrc = '/tinychancy/tinychancy_sit.gif';
    var dangleSrc = '/tinychancy/tinychancy_dangle.gif';

    var BASE_SCALE = 0.36;
    var IDLE_MIN = 5000;
    var IDLE_MAX = 10000;
    var SIT_MIN = 10000;
    var SIT_MAX = 60000;
    var GRAVITY = -300;
    var SLIDE_FRICTION = 600;
    var THROW_SPEED_THRESHOLD = 80;
    var Z_INDEX = 9999;

    function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
    function randBetween(a, b) { return Math.random() * (b - a) + a; }
    function chance(p) { return Math.random() < p; }

    var main = document.createElement('img');
    main.id = 'tinychancy';
    main.style.position = 'fixed';
    main.style.bottom = '0';
    main.style.left = '0';
    main.style.transformOrigin = 'center bottom';
    main.style.transform = 'scale(' + BASE_SCALE + ') scaleX(1)';
    main.style.pointerEvents = 'none';
    main.style.willChange = 'left,bottom';
    main.style.zIndex = String(Z_INDEX);

    var clone = null;

    var worldX = 0;
    var y = 0;
    var vx = 0;
    var vy = 0;

    var mode = 'idle';
    var pose = 'idle';
    var physicsKind = null;
    var hasBounced = false;
    var dropStartHeight = 0;

    var facing = 1;
    var currentScale = BASE_SCALE;

    var chooseTimer = null;
    var sitTimer = null;
    var flipBackTimer = null;

    var lastTime = null;

    var dragging = false;
    var dragPointerId = null;
    var pointerX = 0;
    var pointerY = 0;
    var lastPX = 0;
    var lastPY = 0;
    var lastPTime = 0;
    var dragVX = 0;
    var dragVY = 0;

    function currentSpriteWidth(elRef) {
      if (!elRef) elRef = main;
      var r = elRef.getBoundingClientRect();
      return (r && r.width) || 50;
    }

    function currentSpriteHeight(elRef) {
      if (!elRef) elRef = main;
      var r = elRef.getBoundingClientRect();
      return (r && r.height) || 50;
    }

    function applyScaleAndFacing(elRef) {
      if (!elRef) elRef = main;
      elRef.style.transform = 'scale(' + currentScale + ') scaleX(' + facing + ')';
    }

    function adjustScaleForScreen() {
      var w = window.innerWidth;
      if (w < 400) currentScale = BASE_SCALE * 0.6;
      else if (w < 700) currentScale = BASE_SCALE * 0.8;
      else currentScale = BASE_SCALE;
      applyScaleAndFacing(main);
      if (clone) applyScaleAndFacing(clone);
    }

    function setFacing(newFacing) {
      if (facing === newFacing) return;
      facing = newFacing;
      applyScaleAndFacing(main);
      if (clone) applyScaleAndFacing(clone);
    }

    function setPose(newPose) {
      if (pose === newPose) return;
      pose = newPose;
      if (pose === 'idle') main.src = idleSrc;
      else if (pose === 'walk') main.src = walkSrc;
      else if (pose === 'sit') main.src = sitSrc;
      else if (pose === 'dangle') main.src = dangleSrc;
      if (clone) clone.src = main.src;
    }

    function setAnchorBottom() {
      main.style.transformOrigin = 'center bottom';
      if (clone) clone.style.transformOrigin = 'center bottom';
    }

    function setAnchorTop() {
      main.style.transformOrigin = 'center top';
      if (clone) clone.style.transformOrigin = 'center top';
    }

    function clearTimers() {
      if (chooseTimer) { clearTimeout(chooseTimer); chooseTimer = null; }
      if (sitTimer) { clearTimeout(sitTimer); sitTimer = null; }
      if (flipBackTimer) { clearTimeout(flipBackTimer); flipBackTimer = null; }
    }

    function createClone() {
      if (clone) return;
      clone = document.createElement('img');
      clone.id = 'tinychancy_clone';
      clone.style.position = 'fixed';
      clone.style.bottom = '0';
      clone.style.left = '0';
      clone.style.transformOrigin = main.style.transformOrigin;
      clone.style.pointerEvents = 'none';
      clone.style.willChange = 'left,bottom';
      clone.style.zIndex = String(Z_INDEX);
      clone.src = main.src;
      applyScaleAndFacing(clone);
      document.body.appendChild(clone);
    }

    function hideClone() {
      if (!clone) return;
      clone.style.display = 'none';
    }

    function showClone() {
      if (!clone) return;
      clone.style.display = 'block';
    }

    function updatePortalRender() {
      var W = window.innerWidth || 1;
      var spriteW = currentSpriteWidth(main);
      var displayCenter = ((worldX % W) + W) % W;
      var bottom = y;
      main.style.bottom = bottom + 'px';
      main.style.left = (displayCenter - spriteW / 2) + 'px';
      var needClone = false;
      var cloneCenter = 0;
      if (mode === 'walk' || mode === 'air' || mode === 'slide') {
        if (displayCenter - spriteW / 2 < 0) {
          needClone = true;
          cloneCenter = displayCenter + W;
        } else if (displayCenter + spriteW / 2 > W) {
          needClone = true;
          cloneCenter = displayCenter - W;
        }
      }
      if (needClone) {
        createClone();
        var cloneW = currentSpriteWidth(clone);
        clone.style.bottom = bottom + 'px';
        clone.style.left = (cloneCenter - cloneW / 2) + 'px';
        showClone();
      } else {
        hideClone();
      }
    }

    function renderDangling() {
      var w = currentSpriteWidth(main);
      var h = currentSpriteHeight(main);
      var left = pointerX - w / 2;
      var bottom = window.innerHeight - pointerY - h;
      if (!isFinite(bottom)) bottom = 0;
      main.style.left = left + 'px';
      main.style.bottom = bottom + 'px';
      worldX = pointerX;
      y = Math.max(bottom, 0);
      hideClone();
    }

    function normalizeWorldXToScreen() {
      var W = window.innerWidth || 1;
      var spriteW = currentSpriteWidth(main);
      var displayCenter = ((worldX % W) + W) % W;
      displayCenter = clamp(displayCenter, spriteW / 2, Math.max(spriteW / 2, W - spriteW / 2));
      worldX = displayCenter;
    }

    function pickWalkTarget() {
      var spriteW = currentSpriteWidth(main);
      var W = window.innerWidth || 1;
      var minC = spriteW / 2;
      var maxC = Math.max(minC, W - spriteW / 2);
      var target = worldX;
      var attempts = 0;
      while ((Math.abs(target - worldX) < 100 || target <= minC || target >= maxC) && attempts < 2000) {
        target = randBetween(minC, maxC);
        attempts++;
      }
      return clamp(target, minC, maxC);
    }

    function startIdleLoop() {
      clearTimers();
      mode = 'idle';
      setPose('idle');
      setAnchorBottom();
      if (facing === -1) {
        flipBackTimer = setTimeout(function() {
          setFacing(1);
          flipBackTimer = null;
        }, 1000);
      }
      var wait = randBetween(IDLE_MIN, IDLE_MAX);
      chooseTimer = setTimeout(function() {
        chooseTimer = null;
        if (chance(1 / 10)) {
          startRandomSit();
        } else {
          startWalk();
        }
      }, wait);
    }

    function startRandomSit() {
      clearTimers();
      mode = 'idle';
      setPose('sit');
      setFacing(1);
      setAnchorBottom();
      var dur = randBetween(SIT_MIN, SIT_MAX);
      sitTimer = setTimeout(function() {
        sitTimer = null;
        startIdleLoop();
      }, dur);
    }

    function startWalk() {
      clearTimers();
      mode = 'walk';
      setPose('walk');
      setAnchorBottom();
      normalizeWorldXToScreen();
      var target = pickWalkTarget();
      var dir = target > worldX ? 1 : -1;
      setFacing(dir === 1 ? 1 : -1);
      var speed = currentSpriteWidth(main);
      vx = speed * dir;
      vy = 0;
      physicsKind = 'walk';
      hasBounced = false;
      dropStartHeight = 0;
      var walkTarget = target;
      function updateWalk(dt) {
        worldX += vx * dt;
        if ((dir === 1 && worldX >= walkTarget) || (dir === -1 && worldX <= walkTarget)) {
          worldX = walkTarget;
          mode = 'idle';
          vx = 0;
          startIdleLoop();
        }
      }
      modeWalkUpdate = updateWalk;
    }

    var modeWalkUpdate = null;

    function startDangling(pointerId, x, yScreen) {
      clearTimers();
      dragging = true;
      dragPointerId = pointerId;
      pointerX = x;
      pointerY = yScreen;
      lastPX = x;
      lastPY = yScreen;
      lastPTime = performance.now();
      dragVX = 0;
      dragVY = 0;
      mode = 'dangling';
      physicsKind = null;
      hasBounced = false;
      vx = 0;
      vy = 0;
      setPose('dangle');
      setFacing(1);
      setAnchorTop();
      renderDangling();
    }

    function releaseDangling() {
      dragging = false;
      dragPointerId = null;
      var speed = Math.sqrt(dragVX * dragVX + dragVY * dragVY);
      var w = currentSpriteWidth(main);
      var h = currentSpriteHeight(main);
      var bottom = window.innerHeight - pointerY - h;
      if (!isFinite(bottom)) bottom = 0;
      y = Math.max(bottom, 0);
      worldX = pointerX;
      dropStartHeight = y;
      hasBounced = false;
      setAnchorTop();
      setPose('dangle');
      if (speed < THROW_SPEED_THRESHOLD) {
        mode = 'air';
        physicsKind = 'drop';
        vx = 0;
        vy = 0;
      } else {
        mode = 'air';
        physicsKind = 'throw';
        vx = dragVX;
        vy = -dragVY;
      }
    }

    function handleFloorCollision() {
      if (y <= 0) {
        y = 0;
        if (physicsKind === 'drop') {
          if (!hasBounced) {
            hasBounced = true;
            var dropH = dropStartHeight;
            var bounceH = dropH / 4;
            if (bounceH > 2) {
              var vUp = Math.sqrt(Math.max(0, 2 * Math.abs(GRAVITY) * bounceH));
              vy = vUp;
              setPose('sit');
              setFacing(1);
              setAnchorBottom();
              return;
            }
          }
          vy = 0;
          vx = 0;
          physicsKind = null;
          mode = 'idle';
          setPose('idle');
          setAnchorBottom();
          startIdleLoop();
        } else if (physicsKind === 'throw') {
          if (!hasBounced) {
            hasBounced = true;
            var dropH2 = dropStartHeight;
            var bounceH2 = dropH2 / 4;
            if (bounceH2 > 2) {
              var vUp2 = Math.sqrt(Math.max(0, 2 * Math.abs(GRAVITY) * bounceH2));
              vy = vUp2;
              setPose('sit');
              setFacing(1);
              setAnchorBottom();
              return;
            }
          }
          vy = 0;
          physicsKind = null;
          mode = 'slide';
          setPose('sit');
          setAnchorBottom();
        } else {
          vy = 0;
          vx = 0;
          mode = 'idle';
          setPose('idle');
          setAnchorBottom();
          startIdleLoop();
        }
      }
    }

    function updateAir(dt) {
      vy += GRAVITY * dt;
      worldX += vx * dt;
      y += vy * dt;
      if (y <= 0) {
        handleFloorCollision();
      }
    }

    function updateSlide(dt) {
      worldX += vx * dt;
      if (vx > 0) {
        vx -= SLIDE_FRICTION * dt;
        if (vx < 0) vx = 0;
      } else if (vx < 0) {
        vx += SLIDE_FRICTION * dt;
        if (vx > 0) vx = 0;
      }
      y = 0;
      if (Math.abs(vx) < 5) {
        vx = 0;
        mode = 'idle';
        setPose('idle');
        setAnchorBottom();
        startIdleLoop();
      }
    }

    function loop(timestamp) {
      if (lastTime === null) lastTime = timestamp;
      var dt = (timestamp - lastTime) / 1000;
      if (dt > 0.05) dt = 0.05;
      lastTime = timestamp;

      if (mode === 'walk' && modeWalkUpdate) {
        modeWalkUpdate(dt);
      } else if (mode === 'air') {
        updateAir(dt);
      } else if (mode === 'slide') {
        updateSlide(dt);
      }

      if (mode === 'dangling') {
        renderDangling();
      } else {
        if (y < 0) y = 0;
        updatePortalRender();
      }

      requestAnimationFrame(loop);
    }

    function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      var rect = main.getBoundingClientRect();
      var x = e.clientX;
      var yScreen = e.clientY;
      if (x < rect.left || x > rect.right || yScreen < rect.top || yScreen > rect.bottom) return;
      e.preventDefault();
      main.setPointerCapture(e.pointerId);
      startDangling(e.pointerId, x, yScreen);
    }

    function onPointerMove(e) {
      if (!dragging || e.pointerId !== dragPointerId) return;
      var now = performance.now();
      var dt = (now - lastPTime) / 1000;
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (dt > 0) {
        dragVX = (pointerX - lastPX) / dt;
        dragVY = (pointerY - lastPY) / dt;
      }
      lastPX = pointerX;
      lastPY = pointerY;
      lastPTime = now;
    }

    function onPointerUp(e) {
      if (!dragging || e.pointerId !== dragPointerId) return;
      main.releasePointerCapture(e.pointerId);
      releaseDangling();
    }

    function setupPointerEvents() {
      main.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }

    function initAfterPreload() {
      main.src = idleSrc;
      document.body.appendChild(main);
      adjustScaleForScreen();
      var w = currentSpriteWidth(main);
      var W = window.innerWidth || 1;
      var minC = w / 2;
      var maxC = Math.max(minC, W - w / 2);
      worldX = randBetween(minC, maxC);
      y = 0;
      setPose('idle');
      setFacing(1);
      setAnchorBottom();
      updatePortalRender();
      setupPointerEvents();
      if (chance(1 / 5)) {
        mode = 'idle';
        setPose('sit');
        setFacing(1);
        setAnchorBottom();
        var dur = randBetween(SIT_MIN, SIT_MAX);
        sitTimer = setTimeout(function() {
          sitTimer = null;
          startIdleLoop();
        }, dur);
      } else {
        startIdleLoop();
      }
      setTimeout(function() {
        requestAnimationFrame(loop);
      }, 50);
    }

    var preloadSources = [idleSrc, walkSrc, sitSrc, dangleSrc];
    var remaining = preloadSources.length;
    preloadSources.forEach(function(src) {
      var img = new Image();
      img.src = src;
      if (img.complete && img.naturalWidth) {
        remaining--;
        if (remaining === 0) initAfterPreload();
      } else {
        img.addEventListener('load', function() {
          remaining--;
          if (remaining === 0) initAfterPreload();
        }, { once: true, passive: true });
        img.addEventListener('error', function() {
          remaining--;
          if (remaining === 0) initAfterPreload();
        }, { once: true, passive: true });
      }
    });
    if (remaining === 0) initAfterPreload();

    window.addEventListener('resize', function() {
      adjustScaleForScreen();
      if (mode !== 'dangling') {
        updatePortalRender();
      } else {
        renderDangling();
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTinyChancy);
  } else {
    loadTinyChancy();
  }
})();
