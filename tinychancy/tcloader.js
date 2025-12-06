<!-- tinychancy-loader.js -->
<script>
/*
  TinyChancy loader — pointer-event safe
  - ShadowRoot isolation (no page CSS interference)
  - Pointer Events API (mouse/touch/pen)
  - setPointerCapture for reliable dragging
  - Idle/walk/sit loop + physics, wrap clone
*/

(function () {
  // ---------------- CONFIG ----------------
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000;
  const IDLE_MAX = 10000;
  const SIT_MIN = 10 * 1000; // 10s
  const SIT_MAX = 60 * 1000; // 60s
  const GRAVITY = -300;      // px/s^2
  const Z_INDEX = 2147483647; // top-most
  const NO_MOMENTUM_SPEED = 40; // below this => "no momentum" drop
  const FRICTION = 400;         // horizontal slow-down px/s^2
  const EPS_V = 5;              // when |vx| < this => stop sliding

  const idleSrc   = "/tinychancy/tinychancy_idle.gif";
  const walkSrc   = "/tinychancy/tinychancy_walk.gif";
  const sitSrc    = "/tinychancy/tinychancy_sit.gif";
  const dangleSrc = "/tinychancy/tinychancy_dangle.gif";

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const randBetween = (a, b) => Math.random() * (b - a) + a;
  const chance = (p) => Math.random() < p;

  // -------------- MAIN LOADER --------------
  function loadTinyChancy() {
    // Preload all GIFs
    const sources = [idleSrc, walkSrc, sitSrc, dangleSrc];
    const preloadImgs = sources.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    let remaining = preloadImgs.length;
    const onPreloadDone = () => {
      if (--remaining === 0) initAfterPreload();
    };
    preloadImgs.forEach((img) => {
      if (img.complete && img.naturalWidth) {
        onPreloadDone();
      } else {
        img.addEventListener("load", onPreloadDone, { once: true });
        img.addEventListener("error", onPreloadDone, { once: true });
      }
    });
    if (remaining === 0) initAfterPreload();

    // -------------- INIT AFTER PRELOAD --------------
    function initAfterPreload() {
      // Host + Shadow to isolate styles and avoid site CSS
      const host = document.createElement("div");
      // Zero-size host so it doesn't block clicks itself
      host.style.position = "fixed";
      host.style.inset = "0 0 auto auto";
      host.style.width = "0";
      host.style.height = "0";
      host.style.zIndex = String(Z_INDEX);
      document.documentElement.appendChild(host);

      const shadow = host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
        :host { all: initial; }
        img {
          position: fixed;
          bottom: 0;
          left: 0;
          transform-origin: center bottom;
          will-change: left, bottom;
          z-index: ${Z_INDEX};
          image-rendering: pixelated;
          user-select: none;
          -webkit-user-drag: none;
          touch-action: none; /* important: allow drag, disable native panning */
          pointer-events: auto; /* important: sprite is clickable */
        }
      `;
      shadow.appendChild(style);

      // Main sprite
      const main = document.createElement("img");
      main.id = "tinychancy";
      main.alt = "TinyChancy";
      main.src = idleSrc;
      main.draggable = false;
      shadow.appendChild(main);

      // Clone for horizontal wrap
      const clone = document.createElement("img");
      clone.id = "tinychancy_clone";
      clone.style.display = "none";
      clone.draggable = false;
      shadow.appendChild(clone);

      // ----- STATE -----
      const state = {
        x: 0, y: 0, vx: 0, vy: 0,
        facing: 1,
        scale: BASE_SCALE,
        mode: "idle",
        idleTimer: null,
        sitTimer: null,
        flipBackTimer: null,
        maxHeight: 0,
        bounceCount: 0,
        lastTime: null,
        walkTargetX: null,
        dragging: false,
        dragLastX: 0,
        dragLastY: 0,
        dragLastTime: 0,
        activePointerId: null
      };

      // ---------- HELPERS ----------
      function sizeFrom(el) {
        // prefer rendered size, else natural size, else fallback
        const r = el.getBoundingClientRect();
        const w = r.width || el.naturalWidth || 50;
        const h = r.height || el.naturalHeight || 50;
        return { w, h };
      }
      function spriteWidth(el = main) { return sizeFrom(el).w; }
      function spriteHeight(el = main) { return sizeFrom(el).h; }

      function applyScaleAndFacing() {
        const tf = `scale(${state.scale}) scaleX(${state.facing})`;
        main.style.transform = tf;
        clone.style.transform = tf;
      }

      function adjustScaleForScreen() {
        const w = window.innerWidth || 0;
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

      // Render main + clone (Balloon Fight wrap)
      function renderSprites() {
        const W = window.innerWidth || 1;
        const h = spriteHeight(main);

        let screenX = state.x % W;
        if (screenX < 0) screenX += W;

        const w = spriteWidth(main);
        const left = screenX - w / 2;
        const bottom = state.y;

        main.style.left = left + "px";
        main.style.bottom = bottom + "px";

        // Opposite-side clone if crossing edges
        clone.style.display = "none";
        const right = left + w;
        if (left < 0) {
          clone.src = main.src;
          clone.style.bottom = bottom + "px";
          clone.style.left = (left + W) + "px";
          clone.style.display = "block";
        } else if (right > W) {
          clone.src = main.src;
          clone.style.bottom = bottom + "px";
          clone.style.left = (left - W) + "px";
          clone.style.display = "block";
        }
      }

      function clearIdleTimer() { if (state.idleTimer) { clearTimeout(state.idleTimer); state.idleTimer = null; } }
      function clearSitTimer()  { if (state.sitTimer)  { clearTimeout(state.sitTimer);  state.sitTimer  = null; } }
      function clearFlipBackTimer(){ if (state.flipBackTimer){ clearTimeout(state.flipBackTimer); state.flipBackTimer = null; } }
      function clearAllTimers() { clearIdleTimer(); clearSitTimer(); clearFlipBackTimer(); }

      // ---------- BEHAVIOR: IDLE / WALK / SIT ----------
      function scheduleNextFromIdle() {
        clearIdleTimer();
        const wait = randBetween(IDLE_MIN, IDLE_MAX);
        state.idleTimer = setTimeout(() => {
          state.idleTimer = null;
          if (state.mode !== "idle") return;
          if (chance(1/10)) startSitting(randBetween(SIT_MIN, SIT_MAX));
          else startWalking();
        }, wait);
      }

      function startIdle() {
        clearAllTimers();
        state.mode = "idle";
        state.vx = 0; state.vy = 0; state.y = 0;
        state.bounceCount = 0; state.maxHeight = 0;
        main.src = idleSrc;
        main.style.transformOrigin = "center bottom";

        if (state.facing === -1) {
          state.flipBackTimer = setTimeout(() => {
            setFacing(1);
            state.flipBackTimer = null;
          }, 1000);
        }
        scheduleNextFromIdle();
      }

      function startSitting(ms) {
        clearAllTimers();
        state.mode = "sitting";
        state.vx = 0; state.vy = 0; state.y = 0;
        state.bounceCount = 0; state.maxHeight = 0;
        setFacing(1);
        main.src = sitSrc;
        main.style.transformOrigin = "center bottom";
        state.sitTimer = setTimeout(() => {
          state.sitTimer = null; startIdle();
        }, ms);
      }

      function startWalking() {
        clearAllTimers();
        state.mode = "walking";
        state.y = 0; state.vy = 0;
        state.bounceCount = 0; state.maxHeight = 0;
        main.src = walkSrc;
        main.style.transformOrigin = "center bottom";

        const W = window.innerWidth || 1;
        const w = spriteWidth(main);
        const minDist = 100;
        const maxDist = Math.max(minDist, W - w);
        const dist = randBetween(minDist, maxDist);
        const dir = Math.random() < 0.5 ? -1 : 1;
        state.walkTargetX = state.x + dir * dist;
        state.vx = 0;
        setFacing(dir);
      }

      // ---------- POINTER DRAG / DANGLE / THROW ----------
      function beginDrag(e) {
        // allow only primary button when mouse
        if (e.pointerType === "mouse" && e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        clearAllTimers();
        state.dragging = true;
        state.mode = "dangling";
        state.vx = 0; state.vy = 0;
        state.bounceCount = 0; state.maxHeight = 0;
        state.activePointerId = e.pointerId;

        main.src = dangleSrc;
        main.style.transformOrigin = "center top";

        // Keep delivering pointer events to this element during drag
        try { main.setPointerCapture(e.pointerId); } catch (_) {}

        // UI feedback during drag
        const rootDoc = document.documentElement;
        rootDoc.style.cursor = "grabbing";
        rootDoc.style.userSelect = "none";
        rootDoc.style.webkitUserSelect = "none";

        const now = performance.now();
        state.dragLastTime = now;

        const { w, h } = sizeFrom(main);
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const top = mouseY;
        const bottom = (window.innerHeight - top - h);

        state.x = mouseX;
        state.y = Math.max(0, bottom);

        state.dragLastX = state.x;
        state.dragLastY = state.y;

        renderSprites();
      }

      function onDragMove(e) {
        if (!state.dragging || e.pointerId !== state.activePointerId) return;

        e.preventDefault();
        e.stopPropagation();

        const now = performance.now();
        const dt = Math.max((now - state.dragLastTime) / 1000, 0.001);

        const { w, h } = sizeFrom(main);
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const top = mouseY;
        const bottom = window.innerHeight - top - h;

        const newX = mouseX;
        const newY = Math.max(0, bottom);

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
        if (!state.dragging || e.pointerId !== state.activePointerId) return;

        e.preventDefault();
        e.stopPropagation();

        state.dragging = false;
        state.activePointerId = null;

        const rootDoc = document.documentElement;
        rootDoc.style.cursor = "";
        rootDoc.style.userSelect = "";
        rootDoc.style.webkitUserSelect = "";

        main.style.transformOrigin = "center bottom";

        const speed = Math.hypot(state.vx, state.vy);
        state.maxHeight = state.y;
        state.bounceCount = 0;

        if (speed < NO_MOMENTUM_SPEED) {
          state.vx = 0; // drop straight down
        }

        main.src = dangleSrc;
        state.mode = "airborne";
      }

      // Attach pointer handlers (mouse + touch + pen)
      main.addEventListener("pointerdown", beginDrag);
      window.addEventListener("pointermove", onDragMove, { passive: false });
      window.addEventListener("pointerup", onDragEnd, { passive: false });
      window.addEventListener("pointercancel", onDragEnd, { passive: false });
      window.addEventListener("lostpointercapture", (e) => {
        // Safety: if capture is lost mid-drag, end gracefully
        if (state.dragging) onDragEnd(e);
      });

      // ---------- PHYSICS UPDATE ----------
      function updatePhysics(dt) {
        switch (state.mode) {
          case "idle":
          case "sitting":
            state.y = 0; state.vx = 0; state.vy = 0;
            break;

          case "walking": {
            const speed = spriteWidth(main); // one width per second
            const dir = state.facing;
            state.x += dir * speed * dt;
            state.y = 0; state.vy = 0;

            if (state.walkTargetX != null) {
              const reached = (dir === 1 && state.x >= state.walkTargetX) || (dir === -1 && state.x <= state.walkTargetX);
              if (reached) startIdle();
            }
            break;
          }

          case "dangling":
            state.y = Math.max(0, state.y);
            break;

          case "airborne": {
            state.vy += GRAVITY * dt;
            state.x += state.vx * dt;
            state.y += state.vy * dt;
            if (state.y > state.maxHeight) state.maxHeight = state.y;

            if (state.y <= 0 && state.vy < 0) {
              state.y = 0;

              if (state.bounceCount === 0) {
                const hDrop = Math.max(0, state.maxHeight);
                const bounceH = hDrop / 4;
                let vyBounce = 0;
                if (bounceH > 0) vyBounce = Math.sqrt(2 * Math.abs(GRAVITY) * bounceH);
                state.vy = vyBounce;
                state.bounceCount = 1;
                main.src = sitSrc;
                setFacing(1);
              } else {
                state.y = 0; state.vy = 0; state.bounceCount = 2;

                if (Math.abs(state.vx) > EPS_V) {
                  state.mode = "sliding";
                  main.src = sitSrc;
                  setFacing(1);
                } else {
                  state.vx = 0;
                  state.mode = "sitting";
                  main.src = sitSrc;
                  setFacing(1);
                  clearSitTimer();
                  state.sitTimer = setTimeout(() => {
                    state.sitTimer = null; startIdle();
                  }, randBetween(2000, 4000));
                }
              }
            }
            break;
          }

          case "sliding": {
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
                state.sitTimer = null; startIdle();
              }, randBetween(2000, 4000));
            } else {
              state.vx -= decel * sign;
              state.x += state.vx * dt;
            }
            break;
          }
        }

        if (state.mode !== "dangling" && state.y < 0) state.y = 0;
      }

      // ---------- MAIN RAF LOOP ----------
      function rafLoop(ts) {
        if (state.lastTime == null) state.lastTime = ts;
        const dt = Math.min(0.05, (ts - state.lastTime) / 1000);
        state.lastTime = ts;

        if (!state.dragging) updatePhysics(dt);
        renderSprites();
        requestAnimationFrame(rafLoop);
      }

      // ---------- INITIAL SETUP ----------
      adjustScaleForScreen();

      // Start at random X
      const W = window.innerWidth || 1;
      const initW = spriteWidth(main);
      const minC = initW / 2;
      const maxC = Math.max(minC, W - initW / 2);
      state.x = randBetween(minC, maxC);
      state.y = 0;

      renderSprites();

      if (chance(1/5)) startSitting(randBetween(SIT_MIN, SIT_MAX));
      else startIdle();

      setTimeout(() => requestAnimationFrame(rafLoop), 50);

      // ---------- RESIZE HANDLER ----------
      window.addEventListener("resize", () => {
        adjustScaleForScreen();
        renderSprites();
      }, { passive: true });
    }
  }

  // Ensure DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadTinyChancy, { once: true });
  } else {
    loadTinyChancy();
  }
})();
</script>
