/*
  TinyChancy loader with:
  - Idle/walk/sit loop
  - Sitting chance (1/10 from idle, 1/5 on load)
  - Balloon Fight–style horizontal wrap using a clone
  - Y-coordinate with physics (gravity, bounce, slide)
  - Click/drag "dangle" with throw/drop behavior
*/

(function () {
  // ---------------- CONFIG ----------------
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000;
  const IDLE_MAX = 10000;
  const SIT_MIN = 10 * 1000; // 10s
  const SIT_MAX = 60 * 1000; // 60s
  const GRAVITY = -300;      // px/s^2 (downward, since y=bottom-from-floor)
  const Z_INDEX = 9999;
  const NO_MOMENTUM_SPEED = 40; // below this => "no momentum" drop
  const FRICTION = 400;         // horizontal slow-down px/s^2
  const EPS_V = 5;              // when |vx| < this => stop sliding

  const idleSrc  = "/tinychancy/tinychancy_idle.gif";
  const walkSrc  = "/tinychancy/tinychancy_walk.gif";
  const sitSrc   = "/tinychancy/tinychancy_sit.gif";
  const dangleSrc= "/tinychancy/tinychancy_dangle.gif";

  function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
  function randBetween(a, b) { return Math.random() * (b - a) + a; }
  function chance(p) { return Math.random() < p; }

  // -------------- MAIN LOADER --------------
  function loadTinyChancy() {
    // Preload all GIFs to avoid flashes
    const sources = [idleSrc, walkSrc, sitSrc, dangleSrc];
    const preloadImgs = sources.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    let remaining = preloadImgs.length;
    const onPreloadDone = () => {
      if (--remaining === 0) initAfterPreload();
    };
    preloadImgs.forEach(img => {
      if (img.complete && img.naturalWidth) {
        onPreloadDone();
      } else {
        img.addEventListener("load", onPreloadDone, { once: true, passive: true });
        img.addEventListener("error", onPreloadDone, { once: true, passive: true });
      }
    });
    if (remaining === 0) initAfterPreload();

    // -------------- INIT AFTER PRELOAD --------------
    function initAfterPreload() {
      // Create main sprite
      const main = document.createElement("img");
      main.id = "tinychancy";
      main.src = idleSrc;
      main.style.position = "fixed";
      main.style.bottom = "0";
      main.style.left = "0";
      main.style.transformOrigin = "center bottom";
      main.style.transform = `scale(${BASE_SCALE}) scaleX(1)`;
      main.style.pointerEvents = "auto";
      main.style.willChange = "left, bottom";
      main.style.zIndex = String(Z_INDEX);
      main.style.imageRendering = "pixelated";
      main.draggable = false;
      document.body.appendChild(main);

      // Clone used for horizontal wrap
      const clone = document.createElement("img");
      clone.id = "tinychancy_clone";
      clone.style.position = "fixed";
      clone.style.bottom = "0";
      clone.style.left = "0";
      clone.style.transformOrigin = "center bottom";
      clone.style.transform = `scale(${BASE_SCALE}) scaleX(1)`;
      clone.style.pointerEvents = "none";
      clone.style.willChange = "left, bottom";
      clone.style.zIndex = String(Z_INDEX);
      clone.style.imageRendering = "pixelated";
      clone.style.display = "none";
      clone.draggable = false;
      document.body.appendChild(clone);

      // ----- STATE -----
      const state = {
        // world position: x is unbounded; y is bottom from floor (0=floor)
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        facing: 1,         // 1 or -1
        scale: BASE_SCALE,
        mode: "idle",      // "idle"|"walking"|"sitting"|"dangling"|"airborne"|"sliding"
        idleTimer: null,
        sitTimer: null,
        flipBackTimer: null,
        maxHeight: 0,
        bounceCount: 0,
        lastTime: null,
        walkTargetX: null,
        // drag state
        dragging: false,
        dragLastX: 0,
        dragLastY: 0,
        dragLastTime: 0
      };

      // ---------- HELPERS ----------
      function spriteWidth(el = main) {
        const r = el.getBoundingClientRect();
        return (r && r.width) || (preloadImgs[0] && preloadImgs[0].width) || 50;
      }
      function spriteHeight(el = main) {
        const r = el.getBoundingClientRect();
        return (r && r.height) || (preloadImgs[0] && preloadImgs[0].height) || 50;
      }

      function applyScaleAndFacing() {
        main.style.transform = `scale(${state.scale}) scaleX(${state.facing})`;
        clone.style.transform = `scale(${state.scale}) scaleX(${state.facing})`;
      }

      function adjustScaleForScreen() {
        const w = window.innerWidth;
        if (w < 400) state.scale = BASE_SCALE * 0.6;
        else if (w < 700) state.scale = BASE_SCALE * 0.8;
        else state.scale = BASE_SCALE;
        applyScaleAndFacing();
      }

      function setFacing(dir) {
        if (state.facing === dir) return;
        state.facing = dir;
        applyScaleAndFacing();
      }

      // Render main + clone from world position (Balloon Fight wrap)
      function renderSprites() {
        const W = window.innerWidth || 1;
        const h = spriteHeight(main);

        // screenX is world x modulo viewport width
        let screenX = state.x % W;
        if (screenX < 0) screenX += W;

        const w = spriteWidth(main);
        const left = screenX - w / 2;
        const bottom = state.y; // bottom from floor

        main.style.left = left + "px";
        main.style.bottom = bottom + "px";

        // Determine if we need a clone on the opposite side
        clone.style.display = "none";

        const right = left + w;
        // If left < 0, show a clone on the right side
        if (left < 0) {
          clone.src = main.src;
          clone.style.bottom = bottom + "px";
          clone.style.left = (left + W) + "px";
          clone.style.display = "block";
        } else if (right > W) {
          // right > W means show clone on left
          clone.src = main.src;
          clone.style.bottom = bottom + "px";
          clone.style.left = (left - W) + "px";
          clone.style.display = "block";
        }
      }

      function clearIdleTimer() {
        if (state.idleTimer) {
          clearTimeout(state.idleTimer);
          state.idleTimer = null;
        }
      }
      function clearSitTimer() {
        if (state.sitTimer) {
          clearTimeout(state.sitTimer);
          state.sitTimer = null;
        }
      }
      function clearFlipBackTimer() {
        if (state.flipBackTimer) {
          clearTimeout(state.flipBackTimer);
          state.flipBackTimer = null;
        }
      }
      function clearAllTimers() {
        clearIdleTimer();
        clearSitTimer();
        clearFlipBackTimer();
      }

      // ---------- BEHAVIOR: IDLE / WALK / SIT ----------
      function scheduleNextFromIdle() {
        clearIdleTimer();
        const wait = randBetween(IDLE_MIN, IDLE_MAX);
        state.idleTimer = setTimeout(() => {
          state.idleTimer = null;
          if (state.mode !== "idle") return;

          // 1/10 chance to sit instead of walk
          if (chance(1 / 10)) {
            startSitting(randBetween(SIT_MIN, SIT_MAX));
          } else {
            startWalking();
          }
        }, wait);
      }

      function startIdle() {
        clearAllTimers();
        state.mode = "idle";
        state.vx = 0;
        state.vy = 0;
        state.y = 0;
        state.bounceCount = 0;
        state.maxHeight = 0;
        main.src = idleSrc;
        main.style.transformOrigin = "center bottom";

        // If facing left at idle start, flip back after 1s
        if (state.facing === -1) {
          state.flipBackTimer = setTimeout(() => {
            setFacing(1);
            state.flipBackTimer = null;
          }, 1000);
        }

        scheduleNextFromIdle();
      }

      function startSitting(durationMs) {
        clearAllTimers();
        state.mode = "sitting";
        state.vx = 0;
        state.vy = 0;
        state.y = 0;
        state.bounceCount = 0;
        state.maxHeight = 0;
        // Always face right when sitting
        setFacing(1);
        main.src = sitSrc;
        main.style.transformOrigin = "center bottom";

        state.sitTimer = setTimeout(() => {
          state.sitTimer = null;
          // Sitting always followed by idle
          startIdle();
        }, durationMs);
      }

      function startWalking() {
        clearAllTimers();
        state.mode = "walking";
        state.y = 0;
        state.vy = 0;
        state.bounceCount = 0;
        state.maxHeight = 0;
        main.src = walkSrc;
        main.style.transformOrigin = "center bottom";

        const W = window.innerWidth || 1;
        const w = spriteWidth(main);
        const minDist = 100;
        const maxDist = Math.max(minDist, W - w);
        const dist = randBetween(minDist, maxDist);
        const dir = Math.random() < 0.5 ? -1 : 1;
        state.walkTargetX = state.x + dir * dist;
        state.vx = 0; // horizontal is driven by speed, not vx here
        setFacing(dir);
      }

      // ---------- DRAG / DANGLE / THROW ----------
      function getClientXY(e) {
        if (e.touches && e.touches.length) {
          return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
      }

      function beginDrag(e) {
        e.preventDefault();
        e.stopPropagation();

        clearAllTimers();
        state.dragging = true;
        state.mode = "dangling";
        state.vx = 0;
        state.vy = 0;
        state.bounceCount = 0;
        state.maxHeight = 0;
        main.src = dangleSrc;
        main.style.transformOrigin = "center top";

        document.body.style.userSelect = "none";
        document.body.style.webkitUserSelect = "none";
        document.body.style.cursor = "grabbing";

        const now = performance.now();
        state.dragLastTime = now;

        const rect = main.getBoundingClientRect();
        const w = rect.width || spriteWidth(main);
        const h = rect.height || spriteHeight(main);

        // Position under cursor (dangling by sweater: top-center at cursor)
        const { x: mouseX, y: mouseY } = getClientXY(e);

        const left = mouseX - w / 2;
        const top = mouseY;
        const bottom = (window.innerHeight - top - h);

        state.x = mouseX;
        state.y = Math.max(0, bottom);

        state.dragLastX = state.x;
        state.dragLastY = state.y;

        renderSprites();

        window.addEventListener("mousemove", onDragMove, { passive: false });
        window.addEventListener("mouseup", onDragEnd, { passive: false });
      }

      function onDragMove(e) {
        e.preventDefault();
        e.stopPropagation();

        const now = performance.now();
        const dt = Math.max((now - state.dragLastTime) / 1000, 0.001);

        const w = spriteWidth(main);
        const h = spriteHeight(main);

        const { x: mouseX, y: mouseY } = getClientXY(e);

        const left = mouseX - w / 2;
        const top = mouseY;
        const bottom = window.innerHeight - top - h;

        const newX = mouseX;
        const newY = Math.max(0, bottom);

        // velocities in our world coords
        state.vx = (newX - state.dragLastX) / dt;
        state.vy = (newY - state.dragLastY) / dt;

        state.x = newX;
        state.y = newY;

        state.dragLastX = newX;
        state.dragLastY = newY;
        state.dragLastTime = now;

        renderSprites();
      }

      function onDragEnd(e) {
        e.preventDefault();
        e.stopPropagation();

        state.dragging = false;
        window.removeEventListener("mousemove", onDragMove);
        window.removeEventListener("mouseup", onDragEnd);
        window.removeEventListener("touchmove", onDragMove);
        window.removeEventListener("touchend", onDragEnd);

        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
        document.body.style.cursor = "";

        main.style.transformOrigin = "center bottom";

        // Determine if this is a "drop" or "throw"
        const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);

        state.maxHeight = state.y;
        state.bounceCount = 0;

        // If no momentum => straight drop (vx = 0)
        if (speed < NO_MOMENTUM_SPEED) {
          state.vx = 0;
        }

        // He stays in dangle animation WHILE falling until first floor hit
        main.src = dangleSrc;
        state.mode = "airborne";
      }

      main.addEventListener("mousedown", function (e) {
        // only start drag if left-click
        if (e.button !== 0) return;
        beginDrag(e);
      });
      main.addEventListener("touchstart", function (e) {
        beginDrag(e);
        window.addEventListener("touchmove", onDragMove, { passive: false });
        window.addEventListener("touchend", onDragEnd, { passive: false });
      }, { passive: false });

      // ---------- PHYSICS UPDATE ----------
      function updatePhysics(dt) {
        const W = window.innerWidth || 1;
        const w = spriteWidth(main);

        switch (state.mode) {
          case "idle":
          case "sitting":
            state.y = 0;
            state.vx = 0;
            state.vy = 0;
            break;

          case "walking": {
            const speed = spriteWidth(main); // one width per second
            const dir = state.facing;
            state.x += dir * speed * dt;
            state.y = 0;
            state.vy = 0;

            if (state.walkTargetX != null) {
              const reached =
                (dir === 1 && state.x >= state.walkTargetX) ||
                (dir === -1 && state.x <= state.walkTargetX);
              if (reached) {
                startIdle();
              }
            }
            break;
          }

          case "dangling":
            // position already driven by drag; we just keep him above floor
            state.y = Math.max(0, state.y);
            break;

          case "airborne": {
            // Under gravity
            state.vy += GRAVITY * dt;
            state.x += state.vx * dt;
            state.y += state.vy * dt;
            if (state.y > state.maxHeight) state.maxHeight = state.y;

            if (state.y <= 0 && state.vy < 0) {
              // floor collision
              state.y = 0;

              if (state.bounceCount === 0) {
                // first bounce: height is maxHeight
                const hDrop = Math.max(0, state.maxHeight);
                const bounceH = hDrop / 4;
                let vyBounce = 0;
                if (bounceH > 0) {
                  vyBounce = Math.sqrt(2 * Math.abs(GRAVITY) * bounceH);
                }

                state.vy = vyBounce; // bounce up
                state.bounceCount = 1;

                // switch to sitting animation as he bounces/slides
                main.src = sitSrc;
                setFacing(1); // sitting always faces right
              } else {
                // second contact: settle to sliding or sitting
                state.y = 0;
                state.vy = 0;
                state.bounceCount = 2;

                if (Math.abs(state.vx) > EPS_V) {
                  state.mode = "sliding";
                  main.src = sitSrc;
                  setFacing(1);
                } else {
                  state.vx = 0;
                  state.mode = "sitting";
                  main.src = sitSrc;
                  setFacing(1);
                  // sit a bit, then idle
                  clearSitTimer();
                  state.sitTimer = setTimeout(() => {
                    state.sitTimer = null;
                    startIdle();
                  }, randBetween(2000, 4000));
                }
              }
            }
            break;
          }

          case "sliding": {
            // On the floor; slide horizontally with friction
            state.y = 0;
            const sign = Math.sign(state.vx);
            const decel = FRICTION * dt;
            const absV = Math.abs(state.vx);

            if (absV <= decel || absV < EPS_V) {
              state.vx = 0;
              state.mode = "sitting";
              main.src = sitSrc;
              setFacing(1);
              clearSitTimer();
              state.sitTimer = setTimeout(() => {
                state.sitTimer = null;
                startIdle();
              }, randBetween(2000, 4000));
            } else {
              state.vx -= decel * sign;
              state.x += state.vx * dt;
            }
            break;
          }
        }

        // Horizontal wrap is handled visually in renderSprites()
        // For vertical, keep him above the "floor"
        if (state.mode !== "dangling") {
          if (state.y < 0) state.y = 0;
        }
      }

      // ---------- MAIN RAF LOOP ----------
      function rafLoop(timestamp) {
        if (state.lastTime == null) state.lastTime = timestamp;
        const dt = Math.min(0.05, (timestamp - state.lastTime) / 1000);
        state.lastTime = timestamp;

        if (!state.dragging) {
          updatePhysics(dt);
        }

        renderSprites();
        requestAnimationFrame(rafLoop);
      }

      // ---------- INITIAL SETUP ----------
      adjustScaleForScreen();

      // Initial random X on screen
      const W = window.innerWidth || 1;
      const initW = spriteWidth(main);
      const minC = initW / 2;
      const maxC = Math.max(minC, W - initW / 2);
      const screenStartX = randBetween(minC, maxC);
      state.x = screenStartX; // treat as world x
      state.y = 0;

      renderSprites();

      // 1/5 chance to start sitting (10-60s), otherwise idle->loop
      if (chance(1 / 5)) {
        startSitting(randBetween(SIT_MIN, SIT_MAX));
      } else {
        startIdle();
      }

      setTimeout(() => {
        requestAnimationFrame(rafLoop);
      }, 50);

      // ---------- RESIZE HANDLER ----------
      window.addEventListener(
        "resize",
        () => {
          adjustScaleForScreen();
          renderSprites();
        },
        { passive: true }
      );
    }
  }

  // Ensure DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadTinyChancy);
  } else {
    loadTinyChancy();
  }
})();
