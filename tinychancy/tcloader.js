(function() {
  function loadTinyChancy() {
    var main = document.createElement('img');
    var clone = document.createElement('img');
    var idleSrc = '/tinychancy/tinychancy_idle.gif';
    var walkSrc = '/tinychancy/tinychancy_walk.gif';
    var sitSrc = '/tinychancy/tinychancy_sit.gif';
    var dangleSrc = '/tinychancy/tinychancy_dangle.gif';

    main.id = 'tinychancy';
    main.style.position = 'fixed';
    main.style.bottom = '0';
    main.style.left = '0';
    main.style.transformOrigin = 'center bottom';
    main.style.transform = 'scale(0.36) scaleX(1)';
    main.style.pointerEvents = 'auto';
    main.style.willChange = 'transform,left,bottom';
    main.style.zIndex = '9999';
    main.style.imageRendering = 'pixelated';
    main.style.touchAction = 'none';

    clone.style.position = 'fixed';
    clone.style.bottom = '0';
    clone.style.left = '0';
    clone.style.transformOrigin = 'center bottom';
    clone.style.transform = 'scale(0.36) scaleX(1)';
    clone.style.pointerEvents = 'auto';
    clone.style.willChange = 'transform,left,bottom';
    clone.style.zIndex = '9999';
    clone.style.imageRendering = 'pixelated';
    clone.style.touchAction = 'none';
    clone.style.display = 'none';

    var worldX = 0;
    var worldY = 0;
    var velX = 0;
    var velY = 0;
    var facing = 1;
    var baseScale = 0.36;
    var currentScale = baseScale;
    var state = 'idle';
    var walkingTargetX = null;
    var idleTimer = null;
    var sittingTimer = null;
    var lastTime = null;
    var firstActionDone = false;

    var dragActive = false;
    var dragLastTime = null;
    var dragLastWorldX = 0;
    var dragLastWorldY = 0;
    var dragVelX = 0;
    var dragVelY = 0;

    var airborneStartHeight = 0;
    var airborneHasBounced = false;

    var GRAVITY = -300;
    var SLIDE_FRICTION = 400;
    var ZERO_SPEED_EPS = 40;

    function clamp(v, a, b) {
      return Math.min(Math.max(v, a), b);
    }

    function randRange(min, max) {
      return min + Math.random() * (max - min);
    }

    function adjustScale() {
      var w = window.innerWidth;
      if (w < 400) currentScale = baseScale * 0.6;
      else if (w < 700) currentScale = baseScale * 0.8;
      else currentScale = baseScale;
      main.style.transform = 'scale(' + currentScale + ') scaleX(' + facing + ')';
      clone.style.transform = 'scale(' + currentScale + ') scaleX(' + facing + ')';
    }

    function currentSpriteWidth() {
      var r = main.getBoundingClientRect();
      return (r && r.width) || 50;
    }

    function currentSpriteHeight() {
      var r = main.getBoundingClientRect();
      return (r && r.height) || 50;
    }

    function setFacing(newFacing) {
      facing = newFacing;
      main.style.transform = 'scale(' + currentScale + ') scaleX(' + facing + ')';
      clone.style.transform = 'scale(' + currentScale + ') scaleX(' + facing + ')';
    }

    function syncSpriteSrc(src) {
      if (main.src !== location.origin + src && !main.src.endsWith(src)) {
        main.src = src;
      } else {
        main.src = src;
      }
      clone.src = src;
    }

    function renderSprites() {
      var w = window.innerWidth || 1;
      var spriteW = currentSpriteWidth();
      var cx = ((worldX % w) + w) % w;
      var bottom = worldY;

      main.style.bottom = bottom + 'px';
      main.style.left = (cx - spriteW / 2) + 'px';

      clone.style.display = 'none';

      var leftEdge = cx - spriteW / 2;
      var rightEdge = cx + spriteW / 2;

      if (leftEdge < 0) {
        var cloneCx = cx + w;
        clone.style.bottom = bottom + 'px';
        clone.style.left = (cloneCx - spriteW / 2) + 'px';
        clone.style.display = 'block';
      } else if (rightEdge > w) {
        var cloneCx2 = cx - w;
        clone.style.bottom = bottom + 'px';
        clone.style.left = (cloneCx2 - spriteW / 2) + 'px';
        clone.style.display = 'block';
      }
    }

    function clearTimers() {
      if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
      if (sittingTimer) {
        clearTimeout(sittingTimer);
        sittingTimer = null;
      }
    }

    function enterIdle() {
      state = 'idle';
      velX = 0;
      velY = 0;
      worldY = 0;
      clearTimers();
      syncSpriteSrc(idleSrc);
      var wait = randRange(5000, 10000);
      idleTimer = setTimeout(function() {
        idleTimer = null;
        decideNextActionFromIdle();
      }, wait);
    }

    function decideNextActionFromIdle() {
      if (!firstActionDone) {
        firstActionDone = true;
      }
      var sitRoll = Math.random();
      if (sitRoll < 0.1) {
        enterRandomSit();
      } else {
        startWalking();
      }
    }

    function enterRandomSit(initialOnly) {
      state = 'sitting';
      velX = 0;
      velY = 0;
      worldY = 0;
      clearTimers();
      setFacing(1);
      syncSpriteSrc(sitSrc);
      var dur = randRange(10000, 60000);
      sittingTimer = setTimeout(function() {
        sittingTimer = null;
        enterIdle();
      }, dur);
    }

    function startWalking() {
      state = 'walking';
      worldY = 0;
      velY = 0;
      var spriteW = currentSpriteWidth();
      var dir = Math.random() < 0.5 ? -1 : 1;
      setFacing(dir);
      var screenW = window.innerWidth || 1;
      var maxDist = Math.max(100, screenW - spriteW);
      var dist = randRange(100, maxDist);
      walkingTargetX = worldX + dir * dist;
      syncSpriteSrc(walkSrc);
    }

    function startInitialState() {
      var spriteW = currentSpriteWidth();
      var minCenter = spriteW / 2;
      var maxCenter = Math.max(minCenter, window.innerWidth - spriteW / 2);
      worldX = randRange(minCenter, maxCenter);
      worldY = 0;
      renderSprites();
      var firstSitRoll = Math.random();
      if (firstSitRoll < 0.2) {
        firstActionDone = true;
        state = 'sitting';
        setFacing(1);
        syncSpriteSrc(sitSrc);
        var dur = randRange(10000, 60000);
        sittingTimer = setTimeout(function() {
          sittingTimer = null;
          enterIdle();
        }, dur);
      } else {
        enterIdle();
      }
    }

    function enterDangling(pointerX, pointerY) {
      clearTimers();
      state = 'dangling';
      velX = 0;
      velY = 0;
      airborneHasBounced = false;
      airborneStartHeight = 0;
      main.style.transformOrigin = 'center top';
      clone.style.transformOrigin = 'center top';
      syncSpriteSrc(dangleSrc);
      var spriteH = currentSpriteHeight();
      var bottom = window.innerHeight - pointerY - spriteH;
      if (bottom < 0) bottom = 0;
      worldY = bottom;
      worldX = pointerX;
      dragLastTime = performance.now();
      dragLastWorldX = worldX;
      dragLastWorldY = worldY;
      dragVelX = 0;
      dragVelY = 0;
      renderSprites();
    }

    function updateDangling(pointerX, pointerY) {
      var now = performance.now();
      var dt = (now - dragLastTime) / 1000;
      if (dt < 0.001) dt = 0.001;
      var spriteH = currentSpriteHeight();
      var bottom = window.innerHeight - pointerY - spriteH;
      if (bottom < 0) bottom = 0;
      var newWorldX = pointerX;
      var newWorldY = bottom;
      var vx = (newWorldX - dragLastWorldX) / dt;
      var vy = (newWorldY - dragLastWorldY) / dt;
      dragVelX = vx;
      dragVelY = vy;
      worldX = newWorldX;
      worldY = newWorldY;
      dragLastWorldX = newWorldX;
      dragLastWorldY = newWorldY;
      dragLastTime = now;
      renderSprites();
    }

    function releaseDangling() {
      main.style.transformOrigin = 'center bottom';
      clone.style.transformOrigin = 'center bottom';
      state = 'airborne';
      velX = dragVelX;
      velY = dragVelY;
      airborneStartHeight = worldY;
      airborneHasBounced = false;
      var speed = Math.sqrt(velX * velX + velY * velY);
      if (speed < ZERO_SPEED_EPS) {
        velX = 0;
        velY = 0;
      }
      syncSpriteSrc(dangleSrc);
    }

    function handleAirborne(dt) {
      velY += GRAVITY * dt;
      worldY += velY * dt;
      var spriteH = currentSpriteHeight();
      if (worldY < 0) worldY = 0;
      var groundHit = worldY <= 0 && velY < 0;
      if (!groundHit) {
        return;
      }
      worldY = 0;
      if (!airborneHasBounced) {
        var bounceHeight = Math.max(airborneStartHeight / 4, 0);
        var v0 = Math.sqrt(2 * 300 * bounceHeight);
        velY = v0;
        airborneHasBounced = true;
        syncSpriteSrc(sitSrc);
      } else {
        velY = 0;
        if (Math.abs(velX) > ZERO_SPEED_EPS) {
          state = 'sliding';
          syncSpriteSrc(sitSrc);
        } else {
          state = 'idle';
          syncSpriteSrc(idleSrc);
          enterIdle();
        }
      }
    }

    function handleSliding(dt) {
      var sign = velX > 0 ? 1 : velX < 0 ? -1 : 0;
      if (sign !== 0) {
        var decel = SLIDE_FRICTION * dt;
        var newSpeed = Math.max(0, Math.abs(velX) - decel);
        velX = newSpeed * sign;
      }
      worldX += velX * dt;
      if (Math.abs(velX) <= ZERO_SPEED_EPS) {
        velX = 0;
        state = 'idle';
        syncSpriteSrc(idleSrc);
        enterIdle();
      }
    }

    function handleWalking(dt) {
      var spriteW = currentSpriteWidth();
      var speed = spriteW;
      worldX += facing * speed * dt;
      if (walkingTargetX != null) {
        if ((facing === 1 && worldX >= walkingTargetX) || (facing === -1 && worldX <= walkingTargetX)) {
          walkingTargetX = null;
          enterIdle();
        }
      }
    }

    function rafLoop(timestamp) {
      if (lastTime == null) lastTime = timestamp;
      var dt = (timestamp - lastTime) / 1000;
      if (dt > 0.05) dt = 0.05;
      lastTime = timestamp;

      var spriteW = currentSpriteWidth();
      var screenW = window.innerWidth || 1;
      var minCenter = -screenW;
      var maxCenter = screenW * 2;
      if (worldX < minCenter) worldX += screenW * 3;
      if (worldX > maxCenter) worldX -= screenW * 3;

      if (state === 'walking') {
        handleWalking(dt);
      } else if (state === 'airborne') {
        handleAirborne(dt);
      } else if (state === 'sliding') {
        handleSliding(dt);
      }

      renderSprites();
      requestAnimationFrame(rafLoop);
    }

    function pointerWithinSprite(x, y) {
      var rectMain = main.getBoundingClientRect();
      if (x >= rectMain.left && x <= rectMain.right && y >= rectMain.top && y <= rectMain.bottom) return true;
      var rectClone = clone.getBoundingClientRect();
      if (clone.style.display !== 'none') {
        if (x >= rectClone.left && x <= rectClone.right && y >= rectClone.top && y <= rectClone.bottom) return true;
      }
      return false;
    }

    function onPointerDown(e) {
      var x = e.clientX;
      var y = e.clientY;
      if (!pointerWithinSprite(x, y)) return;
      e.preventDefault();
      dragActive = true;
      clearTimers();
      state = 'dangling';
      enterDangling(x, y);
      try {
        main.setPointerCapture(e.pointerId);
      } catch (err) {}
    }

    function onPointerMove(e) {
      if (!dragActive) return;
      var x = e.clientX;
      var y = e.clientY;
      e.preventDefault();
      updateDangling(x, y);
    }

    function onPointerUp(e) {
      if (!dragActive) return;
      dragActive = false;
      e.preventDefault();
      try {
        main.releasePointerCapture(e.pointerId);
      } catch (err) {}
      releaseDangling();
    }

    function onResize() {
      adjustScale();
      renderSprites();
    }

    var preload = new Image();
    preload.src = idleSrc;

    function startAfterPreload() {
      main.src = idleSrc;
      clone.src = idleSrc;
      document.body.appendChild(main);
      document.body.appendChild(clone);
      adjustScale();
      requestAnimationFrame(function() {
        startInitialState();
        requestAnimationFrame(rafLoop);
      });
      window.addEventListener('resize', onResize);
      window.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }

    if (preload.complete && preload.naturalWidth) {
      startAfterPreload();
    } else {
      preload.onload = startAfterPreload;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTinyChancy);
  } else {
    loadTinyChancy();
  }
})();
