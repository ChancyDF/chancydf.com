<!-- tinychancy-loader.js -->
<script>
/*
  TinyChancy loader — portal wrap + velocity cap + top-center dangling
  - Seamless portal wrap (teleport after fully off-screen)
  - Velocity cap: 1000 px/s on both axes
  - Dangling aligns cursor to sprite top-center (optional fine-tune offset)
  - Pointer Events + ShadowRoot isolation
*/

(function () {
  // ---------------- CONFIG ----------------
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000;
  const IDLE_MAX = 10000;
  const SIT_MIN = 10 * 1000;
  const SIT_MAX = 60 * 1000;
  const GRAVITY = -300;          // px/s^2
  const Z_INDEX = 2147483647;
  const NO_MOMENTUM_SPEED = 40;
  const FRICTION = 400;
  const EPS_V = 5;
  const V_MAX = 1000;            // px/s hard cap
  const HANG_OFFSET_Y = 0;       // px fine-tune for art; positive pulls sprite DOWN from cursor

  const idleSrc   = "/tinychancy/tinychancy_idle.gif";
  const walkSrc   = "/tinychancy/tinychancy_walk.gif";
  const sitSrc    = "/tinychancy/tinychancy_sit.gif";
  const dangleSrc = "/tinychancy/tinychancy_dangle.gif";

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const randBetween = (a, b) => Math.random() * (b - a) + a;
  const chance = (p) => Math.random() < p;

  function loadTinyChancy() {
    // Preload
    const sources = [idleSrc, walkSrc, sitSrc, dangleSrc];
    const preloadImgs = sources.map((src) => { const i = new Image(); i.src = src; return i; });
    let remaining = preloadImgs.length;
    const done = () => (--remaining === 0 && init());
    preloadImgs.forEach((img) => {
      if (img.complete && img.naturalWidth) done();
      else { img.addEventListener("load", done, { once: true }); img.addEventListener("error", done, { once: true }); }
    });
    if (remaining === 0) init();

    function init() {
      // Shadow host isolation
      const host = document.createElement("div");
      host.style.position = "fixed";
      host.style.inset = "0 auto auto 0";
      host.style.width = "0";
      host.style.height = "0";
      host.style.zIndex = String(Z_INDEX);
      document.documentElement.appendChild(host);

      const shadow = host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
        :host { all: initial; }
        #tinychancy, #tinychancy_clone {
          position: fixed;
          bottom: 0;
          left: 0;
          transform-origin: center bottom;
          will-change: left, bottom;
          z-index: ${Z_INDEX};
          image-rendering: pixelated;
          user-select: none;
          -webkit-user-drag: none;
          touch-action: none;
        }
        #tinychancy { pointer-events: auto; }
        #tinychancy_clone { pointer-events: none; } /* never steals input */
      `;
      shadow.appendChild(style);

      const main = document.createElement("img");
      main.id = "tinychancy";
      main.alt = "TinyChancy";
      main.src = idleSrc;
      main.draggable = false;
      shadow.appendChild(main);

      const clone = document.createElement("img");
      clone.id = "tinychancy_clone";
      clone.style.display = "none";
      clone.draggable = false;
      shadow.appendChild(clone);

      // ----- STATE -----
      const state = {
        x: 0, y: 0, vx: 0, vy: 0,
        facing: 1, scale: BASE_SCALE, mode: "idle",
        idleTimer: null, sitTimer: null, flipBackTimer: null,
        maxHeight: 0, bounceCount: 0, lastTime: null, walkTargetX: null,
        dragging: false, dragLastX: 0, dragLastY: 0, dragLastTime: 0, activePointerId: null
      };

      // ---------- HELPERS ----------
      const sizeFrom = (el) => {
        const r = el.getBoundingClientRect();
        const w = r.width || el.naturalWidth || 50;
        const h = r.height || el.naturalHeight || 50;
        return { w, h };
      };
      const spriteWidth  = (el = main) => sizeFrom(el).w;
      const spriteHeight = (el = main) => sizeFrom(el).h;

      const applyScaleAndFacing = () => {
        const tf = `scale(${state.scale}) scaleX(${state.facing})`;
        main.style.transform = tf;
        clone.style.transform = tf;
      };

      const adjustScaleForScreen = () => {
        const w = window.innerWidth || 0;
        if (w < 400) state.scale = BASE_SCALE * 0.6;
        else if (w < 700) state.scale = BASE_SCALE * 0.8;
        else state.scale = BASE_SCALE;
        applyScaleAndFacing();
      };

      const setFacing = (dir) => {
        if (state.facing === dir) return;
        state.facing = dir;
        applyScaleAndFacing();
      };

      // Choose world X nearest to current when pointer crosses edges (no jumps)
      const nearestWorldX = (mouseX) => {
        const W = window.innerWidth || 1;
        const k = Math.round((state.x - mouseX) / W);
        return mouseX + k * W;
      };

      // Portal teleport once fully off-screen
      const portalWrapIfNeeded = () => {
        const W = window.innerWidth || 1;
        const w = spriteWidth(main);
        const screenX = ((state.x % W) + W) % W;
        const left = screenX - w / 2;
        const right = left + w;
        if (right < 0) { state.x += W; }
        else if (left > W) { state.x -= W; }
      };

      // Render with clone for straddling
      function renderSprites() {
        const W = window.innerWidth || 1;
        const w = spriteWidth(main);
        const h = spriteHeight(main);

        let screenX = state.x % W;
        if (screenX < 0) screenX += W;

        const left = screenX - w / 2;
        const bottom = state.y;

        main.style.left = left + "px";
        main.style.bottom = bottom + "px";

        // Clone on opposite edge when straddling
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

      const clearIdle = () => { if (state.idleTimer) { clearTimeout(state.idleTimer); state.idleTimer = null; } };
      const clearSit  = () => { if (state.sitTimer)  { clearTimeout(state.sitTimer);  state.sitTimer  = null; } };
      const clearFlip = () => { if (state.flipBackTimer) { clearTimeout(state.flipBackTimer); state.flipBackTimer = null; } };
      const clearAll  = () => { clearIdle(); clearSit(); clearFlip(); };

      // ---------- BEHAVIOR ----------
      const scheduleNextFromIdle = () => {
        clearIdle();
        const wait = randBetween(IDLE_MIN, IDLE_MAX);
        state.idleTimer = setTimeout(() => {
          state.idleTimer = null;
          if (state.mode !== "idle") return;
          if (chance(1/10)) startSitting(randBetween(SIT_MIN, SIT_MAX));
          else startWalking();
        }, wait);
      };

      function startIdle() {
        clearAll();
        state.mode = "idle";
        state.vx = state.vy = 0; state.y = 0;
        state.bounceCount = 0; state.maxHeight = 0;
        main.src = idleSrc;
        main.style.transformOrigin = "center bottom";
        if (state.facing === -1) {
          state.flipBackTimer = setTimeout(() => { setFacing(1); state.flipBackTimer = null; }, 1000);
        }
        scheduleNextFromIdle();
      }

      function startSitting(ms) {
        clearAll();
        state.mode = "sitting";
        state.vx = state.vy = 0; state.y = 0;
        state.bounceCount = 0; state.maxHeight = 0;
        setFacing(1);
        main.src = sitSrc;
        main.style.transformOrigin = "center bottom";
        state.sitTimer = setTimeout(() => { state.sitTimer = null; startIdle(); }, ms);
      }

      function startWalking() {
        clearAll();
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
        if (e.pointerType === "mouse" && e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        clearAll();
        state.dragging = true;
        state.mode = "dangling";
        state.vx = 0; state.vy = 0;
        state.bounceCount = 0; state.maxHeight = 0;
        state.activePointerId = e.pointerId;

        main.src = dangleSrc;
        main.style.transformOrigin = "center top"; // crucial for top-center grip
        try { main.setPointerCapture(e.pointerId); } catch (_) {}

        const root = document.documentElement;
        root.style.cursor = "grabbing";
        root.style.userSelect = "none";
        root.style.webkitUserSelect = "none";

        const now = performance.now();
        state.dragLastTime = now;

        const { h } = sizeFrom(main);

        // Align world position so top-center == cursor (with optional offset)
        const mouseX = e.clientX;
        const mouseY = e.clientY + HANG_OFFSET_Y;
        const bottom = window.innerHeight - mouseY - h;
        state.x = nearestWorldX(mouseX);
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

        const { h } = sizeFrom(main);

        const mouseX = e.clientX;
        const mouseY = e.clientY + HANG_OFFSET_Y;

        const bottom = window.innerHeight - mouseY - h;

        const newX = nearestWorldX(mouseX);
        const newY = Math.max(0, bottom);

        // Component-wise capped velocity
        let vx = (newX - state.dragLastX) / dt;
        let vy = (newY - state.dragLastY) / dt;
        vx = clamp(vx, -V_MAX, V_MAX);
        vy = clamp(vy, -V_MAX, V_MAX);

        state.vx = vx;
        state.vy = vy;

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

        const root = document.documentElement;
        root.style.cursor = "";
        root.style.userSelect = "";
        root.style.webkitUserSelect = "";

        main.style.transformOrigin = "center bottom";

        const speed = Math.hypot(state.vx, state.vy);
        state.maxHeight = state.y;
        state.bounceCount = 0;

        if (speed < NO_MOMENTUM_SPEED) state.vx = 0;

        main.src = dangleSrc;
        state.mode = "airborne";
      }

      main.addEventListener("pointerdown", beginDrag);
      window.addEventListener("pointermove", onDragMove, { passive: false });
      window.addEventListener("pointerup", onDragEnd, { passive: false });
      window.addEventListener("pointercancel", onDragEnd, { passive: false });
      window.addEventListener("lostpointercapture", (e) => { if (state.dragging) onDragEnd(e); });

      // ---------- PHYSICS ----------
      function updatePhysics(dt) {
        const capVel = () => {
          state.vx = clamp(state.vx, -V_MAX, V_MAX);
          state.vy = clamp(state.vy, -V_MAX, V_MAX);
        };

        switch (state.mode) {
          case "idle":
          case "sitting":
            state.y = 0; state.vx = 0; state.vy = 0;
            break;

          case "walking": {
            const speed = spriteWidth(main); // px/s
            const dir = state.facing;
            state.x += dir * speed * dt;
            state.y = 0; state.vy = 0;
            portalWrapIfNeeded();
            if (state.walkTargetX != null) {
              const reached = (dir === 1 && state.x >= state.walkTargetX) || (dir === -1 && state.x <= state.walkTargetX);
              if (reached) startIdle();
            }
            break;
          }

          case "dangling":
            state.y = Math.max(0, state.y);
            portalWrapIfNeeded();
            break;

          case "airborne": {
            state.vy += GRAVITY * dt;
            capVel(); // cap after gravity
            state.x += state.vx * dt;
            state.y += state.vy * dt;
            portalWrapIfNeeded();
            if (state.y > state.maxHeight) state.maxHeight = state.y;

            if (state.y <= 0 && state.vy < 0) {
              state.y = 0;
              if (state.bounceCount === 0) {
                const hDrop = Math.max(0, state.maxHeight);
                const bounceH = hDrop / 4;
                let vyBounce = 0;
                if (bounceH > 0) vyBounce = Math.sqrt(2 * Math.abs(GRAVITY) * bounceH);
                state.vy = clamp(vyBounce, -V_MAX, V_MAX);
                state.bounceCount = 1;
                main.src = sitSrc;
                setFacing(1);
              } else {
                state.y = 0; state.vy = 0; state.bounceCount = 2;
                if (Math.abs(state.vx) > EPS_V) {
                  state.mode = "sliding";
                  main.src = sitSrc; setFacing(1);
                } else {
                  state.vx = 0; state.mode = "sitting";
                  main.src = sitSrc; setFacing(1);
                  clearSit();
                  state.sitTimer = setTimeout(() => { state.sitTimer = null; startIdle(); }, randBetween(2000, 4000));
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
              state.vx = 0; state.mode = "sitting";
              main.src = sitSrc; setFacing(1);
              clearSit();
              state.sitTimer = setTimeout(() => { state.sitTimer = null; startIdle(); }, randBetween(2000, 4000));
            } else {
              state.vx -= decel * sign;
              capVel();
              state.x += state.vx * dt;
              portalWrapIfNeeded();
            }
            break;
          }
        }
        if (state.mode !== "dangling" && state.y < 0) state.y = 0;
      }

      // ---------- RAF ----------
      function rafLoop(ts) {
        if (state.lastTime == null) state.lastTime = ts;
        const dt = Math.min(0.05, (ts - state.lastTime) / 1000);
        state.lastTime = ts;

        if (!state.dragging) updatePhysics(dt);
        renderSprites();
        requestAnimationFrame(rafLoop);
      }

      // ---------- INIT ----------
      adjustScaleForScreen();

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

      window.addEventListener("resize", () => { adjustScaleForScreen(); renderSprites(); }, { passive: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadTinyChancy, { once: true });
  } else {
    loadTinyChancy();
  }
})();
</script>
