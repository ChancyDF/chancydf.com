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
  const SLIDE_FRICTION = 600;     // px/s^2 (ground)
  const MOMENTUM_THRESH = 120;    // px/s (speed)
  const MAX_THROW_SPEED = 1400;   // px/s (cap throw; tune)
  const MAX_RUNAWAY_SPEED = 2000; // px/s (safety cap during sim)
  const MAX_DT = 0.05;            // s clamp

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
  function capVec(vx, vy, max) {
    const s = Math.hypot(vx, vy);
    if (s > max && s > 0) {
      const k = max / s;
      return { vx: vx * k, vy: vy * k };
    }
    return { vx, vy };
  }

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

  // Debug canvas (hidden by default)
  const dbg = document.createElement('canvas');
  Object.assign(dbg.style, {
    position:'fixed', inset:'0', zIndex:String(Z_INDEX+1),
    pointerEvents:'none',
    display:'none',
  });
  document.body.appendChild(dbg);
  const debug = {
    enabled: false,
    lastRelease: { vx: 0, vy: 0, speed: 0 },
    seq: [],
  };

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
  function renderBottom(elRef, bottomPx) {
    elRef.style.bottom = bottomPx + 'px';
  }
  function applyScaleAndFacing(elRef) {
    elRef.style.transform = `scale(${currentScale}) scaleX(${facing}) translateZ(0)`;
  }
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
    resizeDebugCanvas();
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
      position:'fixed', inset:'0', zIndex:String(Z_INDEX+2),
      cursor:'grabbing', background:'transparent',
      userSelect:'none', pointerEvents:'auto',
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
    // Top-center of GIF must align with cursor: bottom = viewportBottom - spriteHeight
    const { h } = currentSpriteSize(main);
    const viewportBottom = window.innerHeight - e.clientY;
    return viewportBottom - h;
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
    let { vx, vy } = { vx: dx/dt, vy: vy_world };
    // Cap throw magnitude
    ({ vx, vy } = capVec(vx, vy, MAX_THROW_SPEED));
    return { vx, vy };
  }

  // === Pointer event handlers (unified) ===
  let hasCapture = false;
  function onPointerDown(e){
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();

    activePointerId = e.pointerId;
    try { main.setPointerCapture?.(activePointerId); hasCapture = true; } catch(_) {}

    dragging = true; moving=false; sitting=false; sliding=false; airborne=false;
    clearAllTimers();
    bounced=false; maxYThisAir=0;

    main.src = dangleSrc;
    main.style.transformOrigin = 'center bottom';
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
    hasCapture = false;
    activePointerId = null;

    dragging = false;
    removeOverlay();
    main.style.transformOrigin = 'center bottom';
    main.style.cursor = 'grab';

    const { vx: rvx, vy: rvy } = computeReleaseVelocity();
    vx = rvx; vy = rvy;
    const speed = Math.hypot(vx, vy);
    if (speed < MOMENTUM_THRESH) { vx = 0; vy = 0; }
    debug.lastRelease = { vx, vy, speed: Math.hypot(vx, vy) };

    airborne = (y > 0) || vy !== 0;
    sliding = false;
    bounced = false;
    maxYThisAir = y;

    main.src = dangleSrc; // stays until first ground contact
  }
  function onPointerUp(e){ endDragAndRelease(e); }
  function onPointerCancel(e){ endDragAndRelease(e); }

  // === Debug toggling (type "DEBUG") ===
  function onKeyDown(e){
    const ch = (e.key || '').toUpperCase();
    if (!ch || ch.length !== 1) return;
    debug.seq.push(ch);
    if (debug.seq.length > 5) debug.seq.shift();
    if (debug.seq.join('') === 'DEBUG') {
      debug.enabled = !debug.enabled;
      dbg.style.display = debug.enabled ? 'block' : 'none';
      debug.seq.length = 0;
      resizeDebugCanvas();
      drawDebug(); // immediate
    }
  }

  // === Debug canvas drawing ===
  function resizeDebugCanvas(){
    if (!dbg) return;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    dbg.width = Math.floor(window.innerWidth * dpr);
    dbg.height = Math.floor(window.innerHeight * dpr);
    dbg.style.width = window.innerWidth + 'px';
    dbg.style.height = window.innerHeight + 'px';
  }

  function drawDebug(){
    if (!debug.enabled) return;
    const ctx = dbg.getContext('2d');
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,dbg.width/dpr,dbg.height/dpr);

    // HUD
    const mode =
      dragging ? 'dragging' :
      airborne ? (bounced ? 'airborne (post-bounce)' : 'airborne') :
      sliding ? 'sliding' :
      sitting ? 'sitting' :
      moving ? 'walking' : 'idle';

    ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(10,10,310,80);
    ctx.fillStyle = 'white';
    ctx.fillText(`mode: ${mode}`, 20, 30);
    ctx.fillText(`vx, vy: ${vx.toFixed(1)}, ${vy.toFixed(1)} (|v|=${Math.hypot(vx,vy).toFixed(1)})`, 20, 48);
    ctx.fillText(`capture: ${hasCapture ? 'yes' : 'no'}  y=${y.toFixed(1)}  bounced=${bounced}`, 20, 66);
    ctx.fillText(`last release: vx=${debug.lastRelease.vx.toFixed(0)} vy=${debug.lastRelease.vy.toFixed(0)}`, 20, 84);

    // Target marker when walking
    if (moving && targetX != null) {
      ctx.strokeStyle = 'rgba(0,128,255,0.9)';
      ctx.setLineDash([4,4]);
      ctx.beginPath();
      ctx.moveTo(targetX, 0);
      ctx.lineTo(targetX, window.innerHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Arc prediction (landing + one bounce)
    // Frame origin: bottom=0 at page floor; convert to canvas coords (yCanvas = H - bottom)
    const H = window.innerHeight;
    const px = centerX;
    const py = y;
    const vxc = vx;
    const vyc = vy;

    // Predict time to impact solving py + vy*t + 0.5*G*t^2 = 0
    function impactTime(y0, vy0) {
      // t = (-vy - sqrt(vy^2 - 2*G*y)) / G   (choose positive root)
      const a = 0.5*G, b = vy0, c = y0;
      const disc = b*b - 4*a*c;
      if (disc < 0) return 0;
      const t1 = (-b - Math.sqrt(disc)) / (2*a);
      const t2 = (-b + Math.sqrt(disc)) / (2*a);
      const t = Math.max(t1, t2);
      return t > 0 ? t : 0;
    }

    // Path draw helper
    function drawParabola(x0, y0, vx0, vy0, tEnd, color){
      const steps = 40;
      ctx.strokeStyle = color;
      ctx.beginPath();
      for (let i=0;i<=steps;i++){
        const t = (i/steps) * tEnd;
        const x = x0 + vx0 * t;
        const yb = y0 + vy0 * t + 0.5 * G * t * t; // bottom coords
        const yCanvas = H - Math.max(0, yb);
        if (i===0) ctx.moveTo(x, yCanvas);
        else ctx.lineTo(x, yCanvas);
      }
      ctx.stroke();
    }

    // First arc until ground
    const tHit = impactTime(py, vyc);
    if (tHit > 0) {
      drawParabola(px, py, vxc, vyc, tHit, 'rgba(255,0,0,0.9)');

      // One-bounce prediction
      const yPeak = vyc > 0 ? (py + (vyc*vyc)/(2*Math.abs(G))) : py;
      const hBounce = Math.max(0, 0.25 * Math.max(0, yPeak));
      const vyBounce = Math.sqrt(2 * Math.abs(G) * hBounce);
      const tBounce = (2 * vyBounce) / Math.abs(G);
      // After impact, x continues with same vx
      drawParabola(px + vxc * tHit, 0, vxc, vyBounce, tBounce, 'rgba(255,165,0,0.9)');
    }

    // Wrap hint if crossing edges in current frame
    ctx.setLineDash([6,4]);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.moveTo(0,0); ctx.lineTo(0,H);
    ctx.moveTo(window.innerWidth,0); ctx.lineTo(window.innerWidth,H);
    ctx.stroke();
    ctx.setLineDash([]);
  }

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
      if (debug.enabled) drawDebug();
      requestAnimationFrame(rafTick); return;
    }

    if (dragging){
      if (debug.enabled) drawDebug();
      requestAnimationFrame(rafTick);
      return;
    }

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
            if (debug.enabled) drawDebug();
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
      if (debug.enabled) drawDebug();
      requestAnimationFrame(rafTick); return;
    }

    // Airborne
    if (airborne){
      ({ vx, vy } = capVec(vx, vy, MAX_RUNAWAY_SPEED)); // safety cap
      vy += G * dt;
      let nextX = centerX + vx * dt;
      let nextY = y + vy * dt;

      if (nextY > maxYThisAir) maxYThisAir = nextY;

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
          main.src = sitSrc;
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
        vx = clamp(nextVx, -MAX_RUNAWAY_SPEED, MAX_RUNAWAY_SPEED);
        centerX = centerX + vx * dt;
        const W = window.innerWidth;
        if (centerX - w/2 < 0){ centerX += W; }
        else if (centerX + w/2 > W){ centerX -= W; }
        renderFromCenter(main, centerX); renderBottom(main, 0);
      }
    }

    if (debug.enabled) drawDebug();
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

    // Keyboard for debug
    window.addEventListener('keydown', onKeyDown, { passive:true });

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
      if (debug.enabled) drawDebug();
    }, { passive:true });

    // Visibility pause
    document.addEventListener('visibilitychange', ()=>{
      if (document.hidden){ if (rafId) cancelAnimationFrame(rafId), rafId=null; }
      else if (!rafId){ lastTime=null; rafId=requestAnimationFrame(rafTick); }
    });
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
    try{ dbg.remove(); }catch(_){}
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerCancel);
    window.removeEventListener('keydown', onKeyDown);
    window.__tinychancyRunning = false;
  }
  window.tinychancyDestroy = tinychancyDestroy;
})();
