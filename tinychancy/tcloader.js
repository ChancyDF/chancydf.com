// /tinychancy/tcloader.js
(function () {
  if (window.__tinychancyRunning) return;
  window.__tinychancyRunning = true;

  // === CONFIG ===
  const BASE_PATH = '/tinychancy';
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000, IDLE_MAX = 10000;
  const SIT_MIN = 10 * 1000, SIT_MAX = 60 * 1000;
  const Z_INDEX = 9999;

  // Physics
  const G = -300;                 // px/s^2 (down)
  const SLIDE_FRICTION = 600;     // px/s^2 on floor
  const MOMENTUM_THRESH = 120;    // px/s release speed threshold
  const MAX_DT = 0.05;            // s clamp
  const PICK_OFFSET_Y = 6;        // px lift while dangling

  // Motion preference
  const REDUCED_MOTION = typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Assets
  const idleSrc   = `${BASE_PATH}/tinychancy_idle.gif`;
  const walkSrc   = `${BASE_PATH}/tinychancy_walk.gif`;
  const sitSrc    = `${BASE_PATH}/tinychancy_sit.gif`;
  const dangleSrc = `${BASE_PATH}/tinychancy_dangle.gif`;

  // === Utils ===
  const clamp = (v,a,b)=>Math.min(Math.max(v,a),b);
  const randBetween=(a,b)=>Math.random()*(b-a)+a;
  const chance=(p)=>Math.random()<p;
  const sign=(n)=> (n<0?-1:n>0?1:0);
  const hypot=(x,y)=>Math.hypot(x,y);

  // === DOM: main sprite ===
  const main = document.createElement('img');
  main.id = 'tinychancy';
  main.alt = '';
  main.setAttribute('aria-hidden','true');
  main.draggable = false;
  Object.assign(main.style, {
    position:'fixed',
    bottom:'0',
    left:'0',
    transformOrigin:'center bottom',
    transform:`scale(${BASE_SCALE}) scaleX(1) translateZ(0)`,
    willChange:'transform, left, bottom',
    zIndex:String(Z_INDEX),
    pointerEvents:'auto',
    userSelect:'none',
    touchAction:'none',
    cursor:'grab',
  });

  // Debug canvas (highest, non-interactive)
  let debugCanvas = null, debugCtx = null;
  let debugEnabled = false;
  let lastRelease = { vx: 0, vy: 0 };
  // URL opt-in
  try {
    const qp = new URLSearchParams(location.search);
    if (qp.get('tcdebug') === '1') debugEnabled = true;
  } catch (_) {}

  function ensureDebugCanvas() {
    if (debugCanvas) return;
    debugCanvas = document.createElement('canvas');
    debugCanvas.width = window.innerWidth;
    debugCanvas.height = window.innerHeight;
    Object.assign(debugCanvas.style, {
      position: 'fixed',
      inset: '0',
      zIndex: String(Z_INDEX + 2),
      pointerEvents: 'none',
    });
    document.body.appendChild(debugCanvas);
    debugCtx = debugCanvas.getContext('2d');
  }
  function resizeDebugCanvas() {
    if (!debugCanvas) return;
    debugCanvas.width = window.innerWidth;
    debugCanvas.height = window.innerHeight;
  }

  function drawCircle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke(); }
  function drawCross(ctx, x, y, s) {
    ctx.beginPath(); ctx.moveTo(x-s,y); ctx.lineTo(x+s,y); ctx.moveTo(x,y-s); ctx.lineTo(x,y+s); ctx.stroke();
  }

  // Draw modular wrap helper: render X modulo viewport width to keep arcs visible
  function drawWrappedPolyline(ctx, points) {
    const W = window.innerWidth;
    if (points.length < 2) return;
    let prev = points[0];
    for (let i = 1; i < points.length; i++) {
      const cur = points[i];
      const dx = cur.x - prev.x;
      // segment may cross boundary; draw three images (-W, 0, +W)
      const candidates = [-W, 0, W];
      candidates.forEach(shift => {
        ctx.beginPath();
        ctx.moveTo(prev.x + shift, prev.y);
        ctx.lineTo(cur.x + shift, cur.y);
        ctx.stroke();
      });
      prev = cur;
    }
  }

  // === Debug prediction ===
  function predictTrajectory(cx, bottomY, vx0, vy0) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const { w: spriteW, h: spriteH } = currentSpriteSize(main);

    // Time to first ground contact: y(t)=0 => bottomY + vy t + 1/2 g t^2 = 0
    const a = 0.5 * G;
    const b = vy0;
    const c = bottomY;
    let t_land = 0;
    const disc = b*b - 4*a*c;
    if (disc < 0) {
      t_land = 0; // shouldn't happen
    } else {
      const r1 = (-b + Math.sqrt(disc)) / (2*a);
      const r2 = (-b - Math.sqrt(disc)) / (2*a);
      t_land = Math.max(r1, r2, 0);
    }

    // Apex height (world bottom coordinates)
    const y_apex = vy0 > 0 ? bottomY + (vy0*vy0) / (2 * Math.abs(G)) : bottomY;
    const h_drop = Math.max(0, y_apex); // distance to ground from apex
    const h_bounce = 0.25 * h_drop;
    const vy_bounce = Math.sqrt(2 * Math.abs(G) * h_bounce);
    const t_bounce = (vy_bounce * 2) / Math.abs(G);

    // Horizontal motion during arcs
    const x_land = cx + vx0 * t_land;
    const x_bounce_end = x_land + vx0 * t_bounce;

    // Slide distance
    const d_slide = (vx0*vx0) / (2 * SLIDE_FRICTION) * sign(vx0);
    const x_stop = x_bounce_end + d_slide;

    // Sample points for drawing (screen coords: y_screen = H - (bottomY))
    const flight = [];
    const N1 = Math.max(8, Math.ceil(t_land / 0.03));
    for (let i = 0; i <= N1; i++) {
      const t = (i / N1) * t_land;
      const x = cx + vx0 * t;
      const y = bottomY + vy0 * t + 0.5 * G * t * t;
      flight.push({ x: ((x % W) + W) % W, y: H - y });
    }

    const bounce = [];
    const N2 = Math.max(6, Math.ceil(t_bounce / 0.03));
    for (let i = 0; i <= N2; i++) {
      const t = (i / N2) * t_bounce;
      const x = x_land + vx0 * t;
      const y = 0 + vy_bounce * t + 0.5 * G * t * t;
      bounce.push({ x: ((x % W) + W) % W, y: H - y });
    }

    // Slide segment (on ground, straight)
    const slide = [
      { x: ((x_bounce_end % W) + W) % W, y: H - 0 },
      { x: ((x_stop % W) + W) % W, y: H - 0 }
    ];

    return {
      flight, bounce, slide,
      landPoint: { x: ((x_land % W) + W) % W, y: H - 0 },
      stopPoint: { x: ((x_stop % W) + W) % W, y: H - 0 },
      apexY: y_apex
    };
  }

  function drawDebugHUD() {
    if (!debugEnabled) return;
    ensureDebugCanvas();
    resizeDebugCanvas();
    const ctx = debugCtx;
    const W = debugCanvas.width, H = debugCanvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.save();

    // Styles
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.setLineDash([]);

    // Predict from current physical state
    const pred = predictTrajectory(centerX, y, vx, vy);

    // Draw flight arc
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.setLineDash([]);
    drawWrappedPolyline(ctx, pred.flight);

    // Draw bounce arc (dashed)
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.setLineDash([6, 6]);
    drawWrappedPolyline(ctx, pred.bounce);

    // Slide vector (dot-dash)
    ctx.setLineDash([2, 6]);
    drawWrappedPolyline(ctx, pred.slide);

    // Markers: land, stop
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    drawCross(ctx, pred.landPoint.x, pred.landPoint.y, 6);
    drawCircle(ctx, pred.stopPoint.x, pred.stopPoint.y, 5);

    // Draw current AI goal (targetX) when moving
    if (moving && targetX != null) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,150,0,0.7)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(targetX, 0);
      ctx.lineTo(targetX, H);
      ctx.stroke();
      ctx.restore();
    }

    // Status panel
    const panelX = 12, panelY = 12;
    const lines = [
      `mode: ${dragging ? 'drag' : airborne ? 'airborne' : sliding ? 'sliding' : sitting ? 'sitting' : moving ? 'walking' : 'idle'}`,
      `pointerCapture: ${Boolean(activePointerId)}`,
      `pos: x=${centerX.toFixed(1)}, y=${y.toFixed(1)}`,
      `vel: vx=${vx.toFixed(1)}, vy=${vy.toFixed(1)}`,
      `lastRelease: vx=${lastRelease.vx.toFixed(1)}, vy=${lastRelease.vy.toFixed(1)}`,
      `apexHeight: ${pred.apexY.toFixed(1)}px`,
      targetX != null ? `goalX: ${targetX.toFixed(1)}` : `goalX: -`,
      `wrap: ${wrapActive ? 'active' : 'off'}`
    ];
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    const panelW = 230, panelH = 18 * (lines.length + 1);
    ctx.fillRect(panelX - 6, panelY - 6, panelW, panelH);
    ctx.strokeRect(panelX - 6, panelY - 6, panelW, panelH);
    ctx.fillStyle = '#000';
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    lines.forEach((s, i) => ctx.fillText(s, panelX, panelY + 16 * (i + 1)));

    ctx.restore();
  }

  // === Wrap clone ===
  let clone = null;     // wrap clone (never interactive)
  let overlay = null;   // drag shield

  // === State ===
  let currentScale = BASE_SCALE;
  let centerX = null;           // px, center
  let y = 0;                    // px from floor (bottom)
  let vx = 0, vy = 0;           // px/s
  let facing = 1;

  let moving = false, direction = 0, targetX = null;
  let lastTime = null, rafId = null;

  // timers
  let chooseTimer=null, flipBackTimer=null, sitTimer=null;

  // modes
  let sitting=false, dragging=false, airborne=false, sliding=false;

  // wrap
  let wrapActive=false, wrapDirection=0, projectedOffset=0;

  // bounce
  let bounced=false, maxYThisAir=0;

  // pointer samples
  const samples = []; // {t, x, y}
  const SAMPLE_WINDOW_MS = 80;
  let activePointerId = null;

  // === Preload assets ===
  const preloadList = [idleSrc, walkSrc, sitSrc, dangleSrc].map((src)=>{ const i=new Image(); i.src=src; return i; });

  // === Measurements / rendering ===
  function currentSpriteSize(elRef = main) {
    const r = elRef.getBoundingClientRect();
    return {
      w: (r && r.width)  || preloadList[0].width  || 50,
      h: (r && r.height) || preloadList[0].height || 50,
    };
  }
  function renderFromCenter(elRef, cx) {
    const { w } = currentSpriteSize(elRef);
    elRef.style.left = (cx - w/2) + 'px';
  }
  function renderBottom(elRef, bottomPx) { elRef.style.bottom = bottomPx + 'px'; }
  function applyScaleAndFacing(elRef) { elRef.style.transform = `scale(${currentScale}) scaleX(${facing}) translateZ(0)`; }
  function setFacing(newFacing) {
    if (facing === newFacing) return;
    facing = newFacing;
    applyScaleAndFacing(main);
    if (clone) applyScaleAndFacing(clone);
    renderFromCenter(main, centerX);
    if (clone) renderFromCenter(clone, centerX - projectedOffset);
  }
  function adjustScaleForScreen() {
    const w = window.innerWidth;
    const prev = currentScale;
    currentScale = w < 400 ? BASE_SCALE*0.6 : w < 700 ? BASE_SCALE*0.8 : BASE_SCALE;
    if (currentScale !== prev) {
      applyScaleAndFacing(main);
      if (clone) applyScaleAndFacing(clone);
    }
  }
  function clearAllTimers(){
    if (chooseTimer){clearTimeout(chooseTimer); chooseTimer=null;}
    if (flipBackTimer){clearTimeout(flipBackTimer); flipBackTimer=null;}
    if (sitTimer){clearTimeout(sitTimer); sitTimer=null;}
  }

  // === Behaviors (idle/walk/sit) ===
  function startSitting(durationMs){
    clearAllTimers();
    sitting = true; moving=false; direction=0; targetX=null;
    airborne=false; sliding=false; vx=0; vy=0; y=0;
    setFacing(1);
    main.src = sitSrc;
    main.style.cursor = 'auto';
    sitTimer = setTimeout(()=>{ sitTimer=null; sitting=false; startIdleState(); }, durationMs);
  }
  function startIdleState(){
    clearAllTimers();
    sitting=false; moving=false; direction=0; targetX=null;
    airborne=false; sliding=false; vx=0; vy=0; y=0;
    main.style.transformOrigin = 'center bottom';
    main.style.cursor = 'grab';
    if (facing===-1) flipBackTimer = setTimeout(()=>{ setFacing(1); flipBackTimer=null; }, 1000);
    const wait = randBetween(IDLE_MIN, IDLE_MAX);
    chooseTimer = setTimeout(()=>{
      chooseTimer=null;
      if (!REDUCED_MOTION && chance(1/10)) startSitting(randBetween(SIT_MIN,SIT_MAX));
      else if (!REDUCED_MOTION) prepareAndStartMove();
      else startIdleState();
    }, wait);
    main.src = idleSrc;
  }
  function prepareAndStartMove(){
    const { w } = currentSpriteSize();
    const minC = w/2, maxC = Math.max(minC, window.innerWidth - w/2);
    targetX = pickTargetWithin(minC, maxC);
    direction = targetX > centerX ? 1 : -1;
    setFacing(direction === 1 ? 1 : -1);
    moving = true; sliding=false; airborne=false; y=0; vy=0; vx=0;
    main.src = walkSrc;
  }
  function stopAndIdleAt(x){
    moving=false; direction=0; targetX=null; centerX=x; y=0; vx=0; vy=0;
    renderFromCenter(main, centerX);
    main.src = idleSrc;
    startIdleState();
  }
  function pickTargetWithin(minC, maxC){
    let t=centerX, tries=0;
    while ((Math.abs(t-centerX)<100 || t<=minC || t>=maxC) && tries<2000){ t=randBetween(minC,maxC); tries++; }
    return clamp(t, minC, maxC);
  }

  // === Wrap clone ===
  function createCloneIfNeeded(){
    if (clone) return;
    clone = document.createElement('img');
    clone.id='tinychancy_clone'; clone.alt=''; clone.setAttribute('aria-hidden','true');
    Object.assign(clone.style, {
      position:'fixed',
      bottom:'0',
      transformOrigin: main.style.transformOrigin,
      pointerEvents:'none',
      willChange:'transform, left, bottom',
      zIndex:String(Z_INDEX),
    });
    clone.src = main.src;
    applyScaleAndFacing(clone);
    document.body.appendChild(clone);
  }
  function removeClone(){
    if (!clone) return;
    try{ clone.remove(); }catch(_){}
    clone=null; wrapActive=false; wrapDirection=0; projectedOffset=0;
  }

  // === Overlay (blocks page interaction during drag) ===
  function ensureOverlay(){
    if (overlay) return;
    overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position:'fixed', inset:'0', zIndex:String(Z_INDEX+1),
      cursor:'grabbing', background:'transparent',
      userSelect:'none',
      pointerEvents:'auto',
    });
    overlay.onpointerdown = (e)=>{ e.preventDefault(); e.stopPropagation(); };
    document.body.appendChild(overlay);
    document.documentElement.style.userSelect = 'none';
  }
  function removeOverlay(){
    if (!overlay) return;
    try{ overlay.remove(); }catch(_){}
    overlay=null;
    document.documentElement.style.userSelect = '';
  }

  // === Pointer helpers ===
  function cursorToCenterX(e){ return e.clientX; }
  function cursorToBottomY_Dangling(e){
    const { h } = currentSpriteSize(main);
    const viewportBottom = window.innerHeight - e.clientY;
    return viewportBottom - h + PICK_OFFSET_Y;
  }
  function samplePointer(e){
    const now = performance.now();
    samples.push({ t: now, x: e.clientX, y: e.clientY });
    while (samples.length && now - samples[0].t > SAMPLE_WINDOW_MS) samples.shift();
  }
  function computeReleaseVelocity(){
    if (samples.length < 2) return { vx: 0, vy: 0 };
    const a = samples[0], b = samples[samples.length-1];
    const dt = (b.t - a.t) / 1000;
    if (dt <= 0) return { vx: 0, vy: 0 };
    const dx = b.x - a.x;
    const dy_screen = b.y - a.y;
    const vy_world = -dy_screen / dt;
    return { vx: dx/dt, vy: vy_world };
  }

  // === Velocity caps ===
  function capSpeeds() {
    const spriteW = currentSpriteSize(main).w || 50;
    const MAX_VX = 4.0 * spriteW;   // max ~4 sprite-widths per second
    const MAX_VY = 5.0 * spriteW;   // cap vertical too
    vx = clamp(vx, -MAX_VX, MAX_VX);
    vy = clamp(vy, -MAX_VY, MAX_VY);
  }

  // === Pointer event handlers (unified) ===
  let activePointerId = null;
  function onPointerDown(e){
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();

    activePointerId = e.pointerId;
    main.setPointerCapture?.(activePointerId);

    dragging = true; moving=false; sitting=false; sliding=false; airborne=false;
    clearAllTimers();
    bounced=false; maxYThisAir=0;

    main.src = dangleSrc;
    main.style.transformOrigin = 'center top';
    main.style.cursor = 'grabbing';

    ensureOverlay();

    samples.length = 0;
    samplePointer(e);

    centerX = clamp(cursorToCenterX(e), currentSpriteSize().w/2, window.innerWidth - currentSpriteSize().w/2);
    y = Math.max(0, cursorToBottomY_Dangling(e));
    renderFromCenter(main, centerX);
    renderBottom(main, y);
  }
  function onPointerMove(e){
    if (!dragging || (activePointerId != null && e.pointerId !== activePointerId)) return;
    e.preventDefault(); e.stopPropagation();

    samplePointer(e);

    centerX = clamp(cursorToCenterX(e), currentSpriteSize().w/2, window.innerWidth - currentSpriteSize().w/2);
    y = Math.max(0, cursorToBottomY_Dangling(e));

    renderFromCenter(main, centerX);
    renderBottom(main, y);

    if (clone){ renderFromCenter(clone, centerX - projectedOffset); renderBottom(clone, y); }
  }
  function endDragAndRelease(e){
    if (!dragging) return;
    e && (e.preventDefault(), e.stopPropagation());

    if (activePointerId != null) {
      try { main.releasePointerCapture?.(activePointerId); } catch(_) {}
    }
    activePointerId = null;

    dragging = false;
    removeOverlay();
    main.style.transformOrigin = 'center bottom';
    main.style.cursor = 'grab';

    const out = computeReleaseVelocity();
    vx = out.vx; vy = out.vy;
    // Cap NOW
    capSpeeds();
    lastRelease = { vx, vy };

    const speed = hypot(vx, vy);
    if (speed < MOMENTUM_THRESH) { vx = 0; vy = 0; }

    airborne = (y > 0) || vy !== 0;
    sliding = false;
    bounced = false;
    maxYThisAir = y;

    main.src = dangleSrc; // stays dangle until first ground touch
  }
  function onPointerUp(e){ endDragAndRelease(e); }
  function onPointerCancel(e){ endDragAndRelease(e); }

  // === RAF ===
  function rafTick(ts){
    if (lastTime === null) lastTime = ts;
    const dt = Math.min(MAX_DT, (ts - lastTime) / 1000);
    lastTime = ts;

    const { w } = currentSpriteSize(main);
    const minCenter = w/2, maxCenter = Math.max(minCenter, window.innerWidth - w/2);

    if (centerX === null || !isFinite(centerX)) centerX = randBetween(minCenter, maxCenter);

    if (REDUCED_MOTION){
      y = 0; vx=0; vy=0; airborne=false; sliding=false;
      renderBottom(main, y); renderFromCenter(main, centerX);
      if (clone) removeClone();
      drawDebugHUD();
      requestAnimationFrame(rafTick); return;
    }

    if (dragging){
      drawDebugHUD();
      requestAnimationFrame(rafTick);
      return;
    }

    // Legacy ground AI (only when not in physics states)
    if (!airborne && !sliding && !sitting){
      if (moving && direction !== 0 && targetX !== null){
        const speed = currentSpriteSize(main).w;
        let nextCenter = centerX + direction * speed * dt;

        const W = window.innerWidth;
        const leftEdge = nextCenter - w/2, rightEdge = nextCenter + w/2;

        if (!wrapActive && (leftEdge < 0 || rightEdge > W)){
          wrapActive = true; wrapDirection = direction; projectedOffset = W * wrapDirection;
          createCloneIfNeeded(); clone.src = main.src; applyScaleAndFacing(clone);
        }
        if (wrapActive && clone){
          const cloneCenter = nextCenter - projectedOffset;
          renderFromCenter(main, nextCenter); renderBottom(main, 0);
          renderFromCenter(clone, cloneCenter); renderBottom(clone, 0);
          const cloneLeft = cloneCenter - w/2, cloneRight = cloneCenter + w/2;
          if (cloneLeft >= 0 && cloneRight <= W){
            const captured = projectedOffset;
            centerX = cloneCenter;
            if (targetX !== null) targetX = clamp(targetX - captured, w/2, Math.max(w/2, W - w/2));
            removeClone();
          } else {
            centerX = nextCenter;
          }
        } else {
          const clamped = clamp(nextCenter, minCenter, maxCenter);
          if (clamped !== nextCenter){
            centerX = clamped; stopAndIdleAt(centerX);
            if (clone) removeClone();
            renderBottom(main, 0);
            drawDebugHUD();
            requestAnimationFrame(rafTick); return;
          }
          centerX = nextCenter;
        }

        renderFromCenter(main, centerX); renderBottom(main, 0);

        const reached = (direction===1 && centerX >= targetX) || (direction===-1 && centerX <= targetX);
        if (reached){ stopAndIdleAt(targetX); if (clone) removeClone(); }
      } else {
        renderFromCenter(main, centerX); renderBottom(main, 0);
        if (main.src.indexOf(idleSrc) === -1) main.src = idleSrc;
        if (clone) removeClone();
      }
      drawDebugHUD();
      requestAnimationFrame(rafTick); return;
    }

    // === Airborne ===
    if (airborne){
      vy += G * dt;
      // Cap continuous velocities (why: keep physics sane if dt spikes)
      capSpeeds();

      let nextX = centerX + vx * dt;
      let nextY = y + vy * dt;

      if (nextY > maxYThisAir) maxYThisAir = nextY;

      // Horizontal wrap while in air
      const W = window.innerWidth;
      const leftEdge = nextX - w/2, rightEdge = nextX + w/2;
      if (!wrapActive && (leftEdge < 0 || rightEdge > W)){
        wrapActive = true; wrapDirection = vx>=0 ? 1 : -1; projectedOffset = W * wrapDirection;
        createCloneIfNeeded(); clone.src = main.src; applyScaleAndFacing(clone);
      }
      if (wrapActive && clone){
        const cloneCenter = nextX - projectedOffset;
        renderFromCenter(main, nextX); renderBottom(main, nextY);
        renderFromCenter(clone, cloneCenter); renderBottom(clone, nextY);
        const cloneLeft = cloneCenter - w/2, cloneRight = cloneCenter + w/2;
        if (cloneLeft >= 0 && cloneRight <= W){
          centerX = cloneCenter;
          removeClone();
        } else {
          centerX = nextX;
        }
      } else {
        centerX = clamp(nextX, minCenter, maxCenter);
      }

      if (nextY <= 0){
        if (!bounced){
          const hBounce = Math.max(0, 0.25 * Math.max(0, maxYThisAir));
          const vBounce = Math.sqrt(2 * Math.abs(G) * hBounce);
          vy = vBounce;
          y = 0;
          bounced = true;
          main.src = sitSrc; // switch to sit during/after bounce
        } else {
          y = 0; vy = 0; airborne = false; sliding = Math.abs(vx) > 1;
          main.src = sitSrc;
        }
      } else {
        y = nextY;
      }

      if (Math.abs(vx) > 1) setFacing(vx > 0 ? 1 : -1);

      renderFromCenter(main, centerX);
      renderBottom(main, y);
    } else if (sliding){
      const ax = -SLIDE_FRICTION * sign(vx);
      const nextVx = vx + ax * dt;
      if (sign(vx) !== sign(nextVx) || Math.abs(nextVx) < 5){
        vx = 0; sliding = false;
        startIdleState();
      } else {
        vx = nextVx;
        // Cap while sliding too
        capSpeeds();
        centerX = centerX + vx * dt;
        const W = window.innerWidth;
        if (centerX - w/2 < 0){ centerX += W; }
        else if (centerX + w/2 > W){ centerX -= W; }
        renderFromCenter(main, centerX); renderBottom(main, 0);
      }
    }

    drawDebugHUD();
    requestAnimationFrame(rafTick);
  }

  // === Init ===
  function initAfterPreload(){
    document.body.appendChild(main);
    adjustScaleForScreen();

    const { w } = currentSpriteSize(main);
    const minC = w/2, maxC = Math.max(minC, window.innerWidth - w/2);
    centerX = randBetween(minC, maxC);
    y = 0;

    main.src = idleSrc;

    if (!REDUCED_MOTION && chance(1/5)) startSitting(randBetween(SIT_MIN,SIT_MAX));
    else startIdleState();

    setTimeout(()=>{ if (rafId) cancelAnimationFrame(rafId); rafId = requestAnimationFrame(rafTick); }, 50);

    // Pointer Events (single path)
    main.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive:false });
    window.addEventListener('pointerup', onPointerUp, { passive:false });
    window.addEventListener('pointercancel', onPointerCancel, { passive:false });

    // Debug toggle
    window.addEventListener('keydown', (e)=>{
      if (e.key.toLowerCase() === 'd'){
        debugEnabled = !debugEnabled;
        if (debugEnabled) ensureDebugCanvas();
        else if (debugCanvas) debugCtx.clearRect(0,0,debugCanvas.width, debugCanvas.height);
      }
    });

    // Resize
    window.addEventListener('resize', ()=>{
      adjustScaleForScreen();
      const { w } = currentSpriteSize(main);
      const minC = w/2, maxC = Math.max(minC, window.innerWidth - w/2);
      centerX = clamp(centerX, minC, maxC);
      if (targetX !== null) targetX = clamp(targetX, minC, maxC);
      if (clone && wrapDirection !== 0){
        projectedOffset = window.innerWidth * wrapDirection;
        applyScaleAndFacing(clone);
        renderFromCenter(clone, centerX - projectedOffset);
        renderBottom(clone, y);
      }
      renderFromCenter(main, centerX); renderBottom(main, Math.max(0,y));
      resizeDebugCanvas();
      drawDebugHUD();
    }, { passive:true });

    // Visibility pause
    document.addEventListener('visibilitychange', ()=>{
      if (document.hidden){ if (rafId) cancelAnimationFrame(rafId), rafId=null; }
      else if (!rafId){ lastTime=null; rafId=requestAnimationFrame(rafTick); }
    });

    // Enable debug from URL on boot
    if (debugEnabled) ensureDebugCanvas();
  }

  // === Robust preload ===
  let remaining = preloadList.length;
  const tryInit = ()=>{ if (remaining===0) initAfterPreload(); };
  preloadList.forEach(img=>{
    if (img.complete && img.naturalWidth){ remaining--; tryInit(); }
    else {
      img.addEventListener('load', ()=>{ remaining--; tryInit(); }, { once:true, passive:true });
      img.addEventListener('error', ()=>{ remaining--; tryInit(); }, { once:true, passive:true });
    }
  });
  if (remaining===0) tryInit();

  // === Cleanup ===
  function tinychancyDestroy(){
    clearAllTimers();
    if (rafId) cancelAnimationFrame(rafId); rafId=null;
    removeClone(); removeOverlay();
    try{ main.remove(); }catch(_){}
    if (debugCanvas){ try{ debugCanvas.remove(); }catch(_){ } debugCanvas=null; debugCtx=null; }
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerCancel);
    window.__tinychancyRunning = false;
  }
  window.tinychancyDestroy = tinychancyDestroy;
})();
