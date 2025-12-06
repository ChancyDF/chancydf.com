// /tinychancy/tcloader.js
(function () {
  if (window.__tinychancyRunning) return;
  window.__tinychancyRunning = true;

  // CONFIG
  const BASE_PATH = '/tinychancy';
  const BASE_SCALE = 0.36;
  const IDLE_MIN = 5000, IDLE_MAX = 10000;
  const SIT_MIN = 10 * 1000, SIT_MAX = 60 * 1000;
  const Z_INDEX = 9999;

  // Physics
  const G = -300;                 // px/s^2 (down)
  const SLIDE_FRICTION = 600;     // px/s^2 on floor
  const MOMENTUM_THRESH = 120;    // px/s release speed to consider "momentum" (tune)
  const MAX_DT = 0.05;            // s clamp
  const PICK_OFFSET_Y = 6;        // px visual tweak while dangling

  const REDUCED_MOTION = typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Assets
  const idleSrc = `${BASE_PATH}/tinychancy_idle.gif`;
  const walkSrc = `${BASE_PATH}/tinychancy_walk.gif`;
  const sitSrc  = `${BASE_PATH}/tinychancy_sit.gif`;
  const dangleSrc = `${BASE_PATH}/tinychancy_dangle.gif`;

  // Util
  const clamp = (v,a,b)=>Math.min(Math.max(v,a),b);
  const randBetween=(a,b)=>Math.random()*(b-a)+a;
  const chance=(p)=>Math.random()<p;
  const sign=(n)=> (n<0?-1:n>0?1:0);

  // DOM
  const main = document.createElement('img');
  main.id = 'tinychancy';
  main.alt = '';
  main.setAttribute('aria-hidden','true');
  Object.assign(main.style, {
    position:'fixed', bottom:'0', left:'0',
    transformOrigin:'center bottom',
    transform:`scale(${BASE_SCALE}) scaleX(1) translateZ(0)`,
    willChange:'transform, left, bottom',
    zIndex:String(Z_INDEX),
    // Allow picking the character
    pointerEvents:'auto',
    userSelect:'none', // prevent selecting the image itself
  });

  let clone = null;
  let overlay = null; // drag shield

  // State
  let currentScale = BASE_SCALE;
  let centerX = null;           // px, page coords
  let y = 0;                    // px from floor (bottom)
  let vx = 0, vy = 0;           // px/s
  let facing = 1;
  let moving = false, direction = 0;
  let targetX = null;
  let lastTime = null, rafId = null;

  // Timers
  let chooseTimer=null, flipBackTimer=null, sitTimer=null;

  // Modes
  let sitting=false, dragging=false, airborne=false, sliding=false;
  let wrapActive=false, wrapDirection=0, projectedOffset=0;

  // Bounce bookkeeping (one bounce max per airborne episode)
  let bounced=false, maxYThisAir=0;

  // Momentum sampler during drag
  const samples = []; // {t, x, y}
  const SAMPLE_WINDOW_MS = 80;

  // Preload
  const preloadList = [idleSrc,walkSrc,sitSrc,dangleSrc].map(src=>{const i=new Image(); i.src=src; return i;});

  // Helpers
  function currentSpriteSize(elRef = main) {
    const r = elRef.getBoundingClientRect();
    return {
      w: (r && r.width) || preloadList[0].width || 50,
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
  }
  function clearAllTimers(){
    if (chooseTimer){clearTimeout(chooseTimer); chooseTimer=null;}
    if (flipBackTimer){clearTimeout(flipBackTimer); flipBackTimer=null;}
    if (sitTimer){clearTimeout(sitTimer); sitTimer=null;}
  }

  // Behaviors
  function startSitting(durationMs){
    clearAllTimers();
    sitting = true; moving=false; direction=0; targetX=null;
    airborne=false; sliding=false; vx=0; vy=0; y=0;
    setFacing(1);
    main.src = sitSrc;
    sitTimer = setTimeout(()=>{ sitTimer=null; sitting=false; startIdleState(); }, durationMs);
  }
  function startIdleState(){
    clearAllTimers();
    sitting=false; moving=false; direction=0; targetX=null;
    airborne=false; sliding=false; vx=0; vy=0; y=0;
    main.style.transformOrigin = 'center bottom';
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

  // Clone for horizontal wrap
  function createCloneIfNeeded(){
    if (clone) return;
    clone = document.createElement('img');
    clone.id='tinychancy_clone'; clone.alt=''; clone.setAttribute('aria-hidden','true');
    Object.assign(clone.style, {
      position:'fixed', bottom:'0', transformOrigin: main.style.transformOrigin,
      pointerEvents:'none', willChange:'transform, left, bottom',
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

  // Drag overlay
  function ensureOverlay(){
    if (overlay) return;
    overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position:'fixed', inset:'0', zIndex:String(Z_INDEX+1),
      cursor:'grabbing', background:'transparent',
      // block interactions + selection
      userSelect:'none',
    });
    overlay.onmousedown = (e)=> e.preventDefault();
    document.body.appendChild(overlay);
    document.documentElement.style.userSelect = 'none';
  }
  function removeOverlay(){
    if (!overlay) return;
    try{ overlay.remove(); }catch(_){}
    overlay=null;
    document.documentElement.style.userSelect = '';
  }

  // Mouse <-> world conversions (use center for X; top for dangling Y)
  function cursorToCenterX(e){
    const { w } = currentSpriteSize(main);
    return e.clientX;
  }
  function cursorToBottomY_Dangling(e){
    const { h } = currentSpriteSize(main);
    // Cursor pinches the top-center; convert to bottom coordinate
    const viewportBottom = window.innerHeight - e.clientY;
    return viewportBottom - (h) + PICK_OFFSET_Y;
  }

  // Drag handlers
  function onPointerDown(e){
    if (dragging) return;
    e.preventDefault();
    main.setPointerCapture?.(e.pointerId || 1);
    dragging = true; moving=false; sitting=false; sliding=false; airborne=false;
    clearAllTimers();
    bounced=false; maxYThisAir=0;
    main.src = dangleSrc;
    main.style.transformOrigin = 'center top';
    ensureOverlay();
    samples.length = 0;
    sampleMouse(e);
  }
  function onPointerMove(e){
    if (!dragging) return;
    e.preventDefault();
    sampleMouse(e);
    centerX = clamp(cursorToCenterX(e), currentSpriteSize().w/2, window.innerWidth - currentSpriteSize().w/2);
    y = Math.max(0, cursorToBottomY_Dangling(e));
    renderFromCenter(main, centerX);
    renderBottom(main, y);
    if (clone) { // keep clone in sync if exists for any reason
      clone.src = main.src;
      renderFromCenter(clone, centerX - projectedOffset);
      renderBottom(clone, y);
    }
  }
  function onPointerUp(e){
    if (!dragging) return;
    e.preventDefault();
    dragging = false;
    removeOverlay();
    main.style.transformOrigin = 'center bottom';
    // Compute release momentum
    const { vx: rvx, vy: rvy } = computeReleaseVelocity();
    vx = rvx; vy = rvy;
    // If below threshold, drop straight down
    const speed = Math.hypot(vx, vy);
    if (speed < MOMENTUM_THRESH) { vx = 0; vy = 0; }
    // Enter airborne if not on floor
    airborne = (y > 0) || vy !== 0;
    sliding = false;
    bounced = false;
    maxYThisAir = y; // starting height
    // Keep dangle sprite while falling/flying until first floor contact
    main.src = dangleSrc;
  }

  function sampleMouse(e){
    const now = performance.now();
    samples.push({ t: now, x: e.clientX, y: e.clientY });
    // prune
    while (samples.length && now - samples[0].t > SAMPLE_WINDOW_MS) samples.shift();
  }
  function computeReleaseVelocity(){
    if (samples.length < 2) return { vx: 0, vy: 0 };
    const a = samples[0], b = samples[samples.length-1];
    const dt = (b.t - a.t) / 1000;
    if (dt <= 0) return { vx: 0, vy: 0 };
    // Convert screen deltas to our world: +y up (bottom grows up), mouse y increases down
    const dx = b.x - a.x;
    const dy_screen = b.y - a.y;
    const vy_world = -dy_screen / dt;
    return { vx: dx/dt, vy: vy_world };
  }

  // RAF
  function rafTick(ts){
    if (lastTime === null) lastTime = ts;
    const dt = Math.min(MAX_DT, (ts - lastTime) / 1000);
    lastTime = ts;

    const { w } = currentSpriteSize(main);
    const minCenter = w/2, maxCenter = Math.max(minCenter, window.innerWidth - w/2);

    if (centerX === null || !isFinite(centerX)) centerX = randBetween(minCenter, maxCenter);

    // Dragging: render and loop
    if (dragging){
      requestAnimationFrame(rafTick);
      return;
    }

    // Reduce motion: lock to idle on floor
    if (REDUCED_MOTION){
      y = 0; vx=0; vy=0; airborne=false; sliding=false;
      renderBottom(main, y); renderFromCenter(main, centerX);
      if (clone) removeClone();
      requestAnimationFrame(rafTick); return;
    }

    // Legacy walking AI only when not airborne/sliding/sitting
    if (!airborne && !sliding && !sitting){
      // Movement along X with possible wrap (as before)
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
      requestAnimationFrame(rafTick); return;
    }

    // Airborne / sliding physics
    if (airborne){
      // Integrate velocities
      vy += G * dt;
      let nextX = centerX + vx * dt;
      let nextY = y + vy * dt; // y grows up, floor at 0

      // Track apex height for bounce
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
          const captured = projectedOffset;
          centerX = cloneCenter;
          removeClone();
          // nextX already applied via centerX
        } else {
          centerX = nextX;
        }
      } else {
        // Clamp horizontally if no wrap
        centerX = clamp(nextX, minCenter, maxCenter);
      }

      // Ground collision
      if (nextY <= 0){
        // First contact: decide bounce
        if (!bounced){
          const hBounce = Math.max(0, 0.25 * Math.max(0, maxYThisAir)); // target height
          const vBounce = Math.sqrt(2 * Math.abs(G) * hBounce);
          vy = vBounce; // up
          y = 0;
          bounced = true;
          main.src = sitSrc; // sit while bouncing/landing
        } else {
          // After first bounce → stick to ground, begin sliding if vx != 0
          y = 0; vy = 0; airborne = false; sliding = Math.abs(vx) > 1;
          main.src = sitSrc;
        }
      } else {
        y = nextY;
      }

      // Face direction while flying
      if (Math.abs(vx) > 1) setFacing(vx > 0 ? 1 : -1);

      renderFromCenter(main, centerX);
      renderBottom(main, y);
    } else if (sliding){
      // Ground friction until stop
      const ax = -SLIDE_FRICTION * sign(vx);
      const nextVx = vx + ax * dt;
      // Discrete stop when crossing zero
      if (sign(vx) !== sign(nextVx) || Math.abs(nextVx) < 5){
        vx = 0; sliding = false; // fully stationary → idle
        startIdleState();
      } else {
        vx = nextVx;
        centerX = centerX + vx * dt;
        // Horizontal wrap while sliding
        const W = window.innerWidth;
        if (centerX - w/2 < 0){ centerX += W; }
        else if (centerX + w/2 > W){ centerX -= W; }
        renderFromCenter(main, centerX); renderBottom(main, 0);
      }
    }

    requestAnimationFrame(rafTick);
  }

  // Init after preload
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

    // Pointer events
    main.addEventListener('mousedown', (e)=> onPointerDown(e));
    main.addEventListener('mousemove', (e)=> onPointerMove(e));
    window.addEventListener('mousemove', (e)=> dragging && onPointerMove(e));
    window.addEventListener('mouseup', (e)=> onPointerUp(e));
    // Touch support → map to mouse semantics
    main.addEventListener('touchstart', (e)=>{ const t=e.touches[0]; onPointerDown({ ...e, clientX:t.clientX, clientY:t.clientY, preventDefault:()=>e.preventDefault() }); }, { passive:false });
    window.addEventListener('touchmove', (e)=>{ if(!dragging) return; const t=e.touches[0]; onPointerMove({ ...e, clientX:t.clientX, clientY:t.clientY, preventDefault:()=>e.preventDefault() }); }, { passive:false });
    window.addEventListener('touchend', (e)=> onPointerUp({ ...e, clientX:0, clientY:0, preventDefault:()=>e.preventDefault() }), { passive:false });

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
    }, { passive:true });

    // Visibility pause to save CPU (no behavior change)
    document.addEventListener('visibilitychange', ()=>{ if (document.hidden){ if (rafId) cancelAnimationFrame(rafId); rafId=null; } else if (!rafId){ lastTime=null; rafId=requestAnimationFrame(rafTick); } });
  }

  // Robust preload
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

  // Public cleanup
  window.tinychancyDestroy = function(){
    clearAllTimers();
    if (rafId) cancelAnimationFrame(rafId); rafId=null;
    removeClone(); removeOverlay();
    try{ main.remove(); }catch(_){}
    window.__tinychancyRunning = false;
  };
})();
