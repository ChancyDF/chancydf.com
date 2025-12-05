(function(){
const BASE_SCALE = 0.36;
const IDLE_MIN = 5000;
const IDLE_MAX = 10000;
const SIT_MIN = 10000;
const SIT_MAX = 60000;
const Z_INDEX = 1000000;
const GRAVITY = 300;
const BOUNCE_FACTOR = 0.25;
const SNAP_ROUND = v => Math.round(v);

const idleSrc = '/tinychancy/tinychancy_idle.gif';
const walkSrc = '/tinychancy/tinychancy_walk.gif';
const sitSrc = '/tinychancy/tinychancy_sit.gif';
const dangleSrc = '/tinychancy/tinychancy_dangle.gif';

function randBetween(a,b){return Math.random()*(b-a)+a}
function chance(p){return Math.random()<p}
function clamp(v,a,b){return Math.min(Math.max(v,a),b)}

function loadTinyChancy(){
  const imgs = [idleSrc, walkSrc, sitSrc, dangleSrc].map(s => {
    const i = new Image();
    i.src = s;
    return i;
  });

  let naturalW = 0;
  let naturalH = 0;

  function allLoadedOrErrored(list){
    return list.every(i => i.complete || i.width || i.error);
  }

  function measurePrimaryImage(){
    const img0 = imgs[0];
    naturalW = img0.naturalWidth || img0.width || 64;
    naturalH = img0.naturalHeight || img0.height || 64;
    if (!naturalW || !naturalH) { naturalW = 64; naturalH = 64; }
  }

  const wrapper = document.createElement('div');
  wrapper.id = 'tinychancy-wrapper';
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0px';
  wrapper.style.left = '0px';
  wrapper.style.transformOrigin = 'center bottom';
  wrapper.style.pointerEvents = 'auto';
  wrapper.style.touchAction = 'none';
  wrapper.style.willChange = 'left,top,transform';
  wrapper.style.zIndex = String(Z_INDEX);
  wrapper.style.visibility = 'hidden';
  wrapper.style.userSelect = 'none';

  const img = document.createElement('img');
  img.id = 'tinychancy';
  img.src = idleSrc;
  img.style.display = 'block';
  img.style.pointerEvents = 'none';
  img.draggable = false;
  img.ondragstart = () => false;
  img.style.width = '100%';
  img.style.height = 'auto';
  wrapper.appendChild(img);

  let cloneWrapper = null;
  let cloneImg = null;

  let wrapperW = 0;
  let wrapperH = 0;

  let centerX = null;
  let centerY = null;
  let currentScale = BASE_SCALE;
  let facing = 1;

  let moving = false;
  let direction = 0;
  let targetX = null;

  let lastTime = null;
  let chooseTimer = null;
  let flipBackTimer = null;
  let sitTimer = null;
  let sitting = false;
  let bounceUsed = false;

  let wrapActive = false;
  let wrapDirection = 0;
  let projectedOffset = 0;

  let dangling = false;
  let dragPointerId = null;
  let prevPointer = {x:0,y:0,t:0};
  let vx = 0, vy = 0;

  function setWrapperSizeFromNatural(){
    wrapperW = Math.max(1, Math.round(naturalW * currentScale));
    wrapperH = Math.max(1, Math.round(naturalH * currentScale));
    wrapper.style.width = wrapperW + 'px';
    wrapper.style.height = wrapperH + 'px';
  }

  function applyTransformTo(ref){
    ref.style.transform = `scale(${currentScale}) scaleX(${facing})`;
  }

  function renderWrapper(cx, cy, ref = wrapper){
    const left = SNAP_ROUND(cx - wrapperW/2);
    const top = SNAP_ROUND(cy - wrapperH/2);
    ref.style.left = left + 'px';
    ref.style.top = top + 'px';
  }

  function clearTimers(){
    if(chooseTimer){ clearTimeout(chooseTimer); chooseTimer = null; }
    if(flipBackTimer){ clearTimeout(flipBackTimer); flipBackTimer = null; }
    if(sitTimer){ clearTimeout(sitTimer); sitTimer = null; }
  }

  function adjustScaleForScreen(){
    const w = window.innerWidth;
    if (w < 400) currentScale = BASE_SCALE * 0.6;
    else if (w < 700) currentScale = BASE_SCALE * 0.8;
    else currentScale = BASE_SCALE;
    setWrapperSizeFromNatural();
    applyTransformTo(wrapper);
    if (cloneWrapper) { setWrapperSizeFromNatural(); applyTransformTo(cloneWrapper); }
  }

  function setFacing(f){
    if (facing === f) return;
    facing = f;
    applyTransformTo(wrapper);
    if (cloneWrapper) applyTransformTo(cloneWrapper);
    if (centerX !== null) {
      renderWrapper(centerX, centerY, wrapper);
      if (cloneWrapper) renderWrapper(centerX - projectedOffset, centerY, cloneWrapper);
    }
  }

  function startSitting(duration){
    clearTimers();
    dangling = false;
    sitting = true;
    moving = false;
    direction = 0;
    targetX = null;
    setFacing(1);
    img.src = sitSrc;
    sitTimer = setTimeout(()=>{ sitTimer = null; sitting = false; startIdle(); }, duration);
  }

  function startIdle(){
    clearTimers();
    dangling = false;
    moving = false;
    direction = 0;
    targetX = null;
    if (facing === -1) {
      flipBackTimer = setTimeout(()=>{ setFacing(1); flipBackTimer = null; }, 1000);
    }
    const wait = randBetween(IDLE_MIN, IDLE_MAX);
    chooseTimer = setTimeout(()=>{
      chooseTimer = null;
      if (chance(1/10)) startSitting(randBetween(SIT_MIN,SIT_MAX));
      else beginMove();
    }, wait);
    img.src = idleSrc;
    bounceUsed = false;
  }

  function pickTarget(minC, maxC){
    let t = centerX;
    let attempts = 0;
    while ((Math.abs(t - centerX) < 100 || t <= minC || t >= maxC) && attempts < 2000){
      t = randBetween(minC, maxC);
      attempts++;
    }
    return clamp(t, minC, maxC);
  }

  function beginMove(){
    const minC = wrapperW/2;
    const maxC = Math.max(minC, window.innerWidth - wrapperW/2);
    targetX = pickTarget(minC, maxC);
    direction = targetX > centerX ? 1 : -1;
    setFacing(direction === 1 ? 1 : -1);
    moving = true;
    img.src = walkSrc;
  }

  function stopAndIdleAt(x){
    moving = false;
    direction = 0;
    targetX = null;
    centerX = x;
    renderWrapper(centerX, centerY, wrapper);
    img.src = idleSrc;
    startIdle();
  }

  function createClone(){
    if (cloneWrapper) return;
    cloneWrapper = document.createElement('div');
    cloneWrapper.style.position = 'fixed';
    cloneWrapper.style.top = '0px';
    cloneWrapper.style.left = '0px';
    cloneWrapper.style.transformOrigin = 'center bottom';
    cloneWrapper.style.pointerEvents = 'none';
    cloneWrapper.style.willChange = 'left,top,transform';
    cloneWrapper.style.zIndex = String(Z_INDEX);
    cloneImg = document.createElement('img');
    cloneImg.style.display = 'block';
    cloneImg.style.pointerEvents = 'none';
    cloneImg.draggable = false;
    cloneImg.ondragstart = () => false;
    cloneImg.style.width = '100%';
    cloneImg.style.height = 'auto';
    cloneWrapper.appendChild(cloneImg);
    document.body.appendChild(cloneWrapper);
    applyTransformTo(cloneWrapper);
    cloneWrapper.style.width = wrapperW + 'px';
    cloneWrapper.style.height = wrapperH + 'px';
  }

  function removeClone(){
    if (!cloneWrapper) return;
    try { cloneWrapper.remove(); } catch(e) {}
    cloneWrapper = null;
    cloneImg = null;
    wrapActive = false;
    wrapDirection = 0;
    projectedOffset = 0;
  }

  function startDrag(px, py, id, ev){
    if (dragPointerId !== null) return;
    dangling = true;
    dragPointerId = id;
    wrapper.setPointerCapture(id);
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.touchAction = 'none';
    clearTimers();
    moving = false;
    direction = 0;
    targetX = null;
    sitting = false;
    img.src = dangleSrc;
    wrapper.style.transformOrigin = 'center top';
    vx = 0; vy = 0;
    prevPointer = {x: px, y: py, t: performance.now()};
    centerX = SNAP_ROUND(px);
    centerY = SNAP_ROUND(py + wrapperH/2);
    applyTransformTo(wrapper);
    renderWrapper(centerX, centerY, wrapper);
    bounceUsed = false;
  }

  function updateDrag(px, py, ev){
    if (dragPointerId === null) return;
    const now = performance.now();
    const dt = Math.max(0.001, (now - prevPointer.t)/1000);
    const dx = px - prevPointer.x;
    const dy = py - prevPointer.y;
    const instVx = dx/dt;
    const instVy = dy/dt;
    vx = vx*(1-0.08) + instVx*0.08;
    vy = vy*(1-0.08) + instVy*0.08;
    prevPointer = {x: px, y: py, t: now};
    centerX = SNAP_ROUND(px);
    centerY = SNAP_ROUND(py + wrapperH/2);
    applyTransformTo(wrapper);
    renderWrapper(centerX, centerY, wrapper);
    handleWrapDuringDrag();
  }

  function endDrag(ev){
    if (dragPointerId === null) return;
    try { wrapper.releasePointerCapture(dragPointerId); } catch(e){}
    dragPointerId = null;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.touchAction = '';
    wrapper.style.transformOrigin = 'center bottom';
    if (Math.abs(vx) < 20 && Math.abs(vy) < 20){
      vy = 0;
      dangling = false;
      startFall();
    } else {
      dangling = false;
      startThrow(vx, vy);
    }
  }

  function startFall(){
    let vy_local = 0;
    let startY = centerY;
    let bounced = false;
    function step(ts, last){
      const dt = Math.min(0.05, (ts - last)/1000);
      vy_local += GRAVITY * dt;
      centerY += vy_local * dt;
      centerY = SNAP_ROUND(centerY);
      applyTransformTo(wrapper);
      renderWrapper(centerX, centerY, wrapper);
      const floorY = window.innerHeight - wrapperH/2;
      if (centerY >= floorY){
        centerY = floorY;
        renderWrapper(centerX, centerY, wrapper);
        if (!bounced){
          bounced = true;
          const dropH = Math.max(0, floorY - startY);
          const bounceH = dropH * BOUNCE_FACTOR;
          const v0 = Math.sqrt(2 * GRAVITY * bounceH);
          vy_local = -v0;
          setTimeout(()=>{ finalizeBounceAndSit(); }, Math.max(120, (v0/GRAVITY)*1000 + 40));
          requestAnimationFrame(next => step(next, ts));
        } else {
          finalizeBounceAndSit();
        }
        return;
      }
      requestAnimationFrame(next => step(next, ts));
    }
    requestAnimationFrame(t => step(t, performance.now()));
  }

  function startThrow(initVx, initVy){
    let vx_local = initVx;
    let vy_local = initVy;
    let bounced = false;
    const startY = centerY;
    function step(ts, last){
      const dt = Math.min(0.05, (ts - last)/1000);
      vy_local += GRAVITY * dt;
      centerX += vx_local * dt;
      centerY += vy_local * dt;
      centerX = SNAP_ROUND(centerX);
      centerY = SNAP_ROUND(centerY);
      applyTransformTo(wrapper);
      handleWrapDuringThrow();
      renderWrapper(centerX, centerY, wrapper);
      const floorY = window.innerHeight - wrapperH/2;
      if (centerY >= floorY){
        centerY = floorY;
        renderWrapper(centerX, centerY, wrapper);
        if (!bounced){
          bounced = true;
          const dropH = Math.max(0, floorY - startY);
          const bounceH = dropH * BOUNCE_FACTOR;
          const v0 = Math.sqrt(2 * GRAVITY * bounceH);
          vy_local = -v0;
          setTimeout(()=>{ finalizeBounceAndSit(); }, Math.max(120, (v0/GRAVITY)*1000 + 40));
          requestAnimationFrame(next => step(next, ts));
        } else {
          finalizeBounceAndSit();
        }
        return;
      }
      requestAnimationFrame(next => step(next, ts));
    }
    requestAnimationFrame(t => step(t, performance.now()));
  }

  function finalizeBounceAndSit(){
    if (bounceUsed) return;
    bounceUsed = true;
    img.src = sitSrc;
    sitting = true;
    applyTransformTo(wrapper);
    renderWrapper(centerX, centerY, wrapper);
    setTimeout(()=>{ sitting = false; startIdle(); }, 800);
  }

  function handleWrapDuringDrag(){
    if (!wrapActive && (centerX - wrapperW/2 < 0 || centerX + wrapperW/2 > window.innerWidth)){
      wrapActive = true;
      wrapDirection = centerX - wrapperW/2 < 0 ? -1 : 1;
      projectedOffset = window.innerWidth * wrapDirection;
      createClone();
      if (cloneImg) cloneImg.src = img.src;
      if (cloneWrapper){
        cloneWrapper.style.width = wrapperW + 'px';
        cloneWrapper.style.height = wrapperH + 'px';
        applyTransformTo(cloneWrapper);
      }
    }
    if (wrapActive && cloneWrapper){
      const cloneCenter = centerX - projectedOffset;
      renderWrapper(cloneCenter, centerY, cloneWrapper);
      applyTransformTo(cloneWrapper);
      if (cloneCenter - wrapperW/2 >= 0 && cloneCenter + wrapperW/2 <= window.innerWidth){
        centerX = cloneCenter;
        renderWrapper(centerX, centerY, wrapper);
        removeClone();
      }
    }
  }

  function handleWrapDuringThrow(){
    if (!wrapActive && (centerX - wrapperW/2 < 0 || centerX + wrapperW/2 > window.innerWidth)){
      wrapActive = true;
      wrapDirection = centerX - wrapperW/2 < 0 ? -1 : 1;
      projectedOffset = window.innerWidth * wrapDirection;
      createClone();
      if (cloneImg) cloneImg.src = img.src;
      if (cloneWrapper) applyTransformTo(cloneWrapper);
    }
    if (wrapActive && cloneWrapper){
      const cloneCenter = centerX - projectedOffset;
      renderWrapper(cloneCenter, centerY, cloneWrapper);
      applyTransformTo(cloneWrapper);
      if (cloneCenter - wrapperW/2 >= 0 && cloneCenter + wrapperW/2 <= window.innerWidth){
        centerX = cloneCenter;
        if (targetX !== null) targetX = clamp(targetX - projectedOffset, wrapperW/2, Math.max(wrapperW/2, window.innerWidth - wrapperW/2));
        removeClone();
      }
    }
  }

  function rafLoop(ts){
    if (lastTime === null) lastTime = ts;
    const dt = Math.min(0.05, (ts - lastTime)/1000);
    lastTime = ts;
    adjustScaleForScreen();
    if (centerX === null){
      centerX = SNAP_ROUND(randBetween(wrapperW/2, Math.max(wrapperW/2, window.innerWidth - wrapperW/2)));
      centerY = SNAP_ROUND(window.innerHeight - wrapperH/2);
    }
    if (sitting){
      applyTransformTo(wrapper);
      renderWrapper(centerX, centerY, wrapper);
      requestAnimationFrame(rafLoop);
      return;
    }
    if (dangling){
      applyTransformTo(wrapper);
      renderWrapper(centerX, centerY, wrapper);
      handleWrapDuringDrag();
      requestAnimationFrame(rafLoop);
      return;
    }
    if (moving && direction !== 0 && targetX !== null){
      const speed = wrapperW;
      let nextCenter = centerX + direction * speed * dt;
      const W = window.innerWidth;
      const leftEdge = nextCenter - wrapperW/2;
      const rightEdge = nextCenter + wrapperW/2;
      if (!wrapActive && (leftEdge < 0 || rightEdge > W)){
        wrapActive = true;
        wrapDirection = leftEdge < 0 ? -1 : 1;
        projectedOffset = W * wrapDirection;
        createClone();
        if (cloneImg) cloneImg.src = img.src;
        if (cloneWrapper) { cloneWrapper.style.width = wrapperW + 'px'; cloneWrapper.style.height = wrapperH + 'px'; applyTransformTo(cloneWrapper); }
      }
      if (wrapActive && cloneWrapper){
        const cloneCenter = nextCenter - projectedOffset;
        renderWrapper(nextCenter, centerY, wrapper);
        renderWrapper(cloneCenter, centerY, cloneWrapper);
        applyTransformTo(wrapper);
        applyTransformTo(cloneWrapper);
        const cloneLeft = cloneCenter - wrapperW/2;
        const cloneRight = cloneCenter + wrapperW/2;
        if (cloneLeft >= 0 && cloneRight <= W){
          centerX = cloneCenter;
          if (targetX !== null) targetX = clamp(targetX - projectedOffset, wrapperW/2, Math.max(wrapperW/2, W - wrapperW/2));
          removeClone();
          renderWrapper(centerX, centerY, wrapper);
        } else {
          centerX = SNAP_ROUND(nextCenter);
        }
      } else {
        const minC = wrapperW/2;
        const maxC = Math.max(minC, window.innerWidth - wrapperW/2);
        const clamped = clamp(nextCenter, minC, maxC);
        if (clamped !== nextCenter){
          centerX = clamped;
          stopAndIdleAt(centerX);
          if (cloneWrapper) removeClone();
          requestAnimationFrame(rafLoop);
          return;
        }
        centerX = SNAP_ROUND(nextCenter);
        renderWrapper(centerX, centerY, wrapper);
      }
      const reached = (direction === 1 && centerX >= targetX) || (direction === -1 && centerX <= targetX);
      if (reached){
        stopAndIdleAt(targetX);
        if (cloneWrapper) removeClone();
        requestAnimationFrame(rafLoop);
        return;
      }
      requestAnimationFrame(rafLoop);
      return;
    } else {
      renderWrapper(centerX, centerY, wrapper);
      img.src = idleSrc;
      if (cloneWrapper) removeClone();
    }
    requestAnimationFrame(rafLoop);
  }

  function onPointerDown(e){
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (dragPointerId !== null) return;
    const rect = wrapper.getBoundingClientRect();
    const px = e.clientX;
    const py = e.clientY;
    if (px < rect.left || px > rect.right || py < rect.top || py > rect.bottom) return;
    e.preventDefault();
    startDrag(px, py, e.pointerId, e);
    wrapper.addEventListener('pointermove', onPointerMove, {passive:false});
    wrapper.addEventListener('pointerup', onPointerUp, {passive:false});
    wrapper.addEventListener('pointercancel', onPointerUp, {passive:false});
  }

  function onPointerMove(e){
    if (dragPointerId !== e.pointerId) return;
    e.preventDefault();
    updateDrag(e.clientX, e.clientY, e);
  }

  function onPointerUp(e){
    if (dragPointerId !== e.pointerId) return;
    e.preventDefault();
    try { wrapper.releasePointerCapture(dragPointerId); } catch(e){}
    wrapper.removeEventListener('pointermove', onPointerMove, {passive:false});
    wrapper.removeEventListener('pointerup', onPointerUp, {passive:false});
    wrapper.removeEventListener('pointercancel', onPointerUp, {passive:false});
    endDrag(e);
  }

  function initAfterPreload(){
    measurePrimaryImage();
    adjustScaleForScreen();
    setWrapperSizeFromNatural();
    applyTransformTo(wrapper);
    img.src = idleSrc;
    wrapper.style.width = wrapperW + 'px';
    wrapper.style.height = wrapperH + 'px';
    document.body.appendChild(wrapper);
    wrapper.style.visibility = 'visible';
    centerX = SNAP_ROUND(randBetween(wrapperW/2, Math.max(wrapperW/2, window.innerWidth - wrapperW/2)));
    centerY = SNAP_ROUND(window.innerHeight - wrapperH/2);
    if (chance(1/5)) startSitting(randBetween(SIT_MIN,SIT_MAX)); else startIdle();
    setTimeout(()=>{ requestAnimationFrame(rafLoop); }, 40);
    wrapper.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', ()=> {
      adjustScaleForScreen();
      setWrapperSizeFromNatural();
      wrapper.style.width = wrapperW + 'px';
      wrapper.style.height = wrapperH + 'px';
      if (cloneWrapper){
        cloneWrapper.style.width = wrapperW + 'px';
        cloneWrapper.style.height = wrapperH + 'px';
      }
      const minC = wrapperW/2;
      const maxC = Math.max(minC, window.innerWidth - wrapperW/2);
      if (centerX !== null) centerX = clamp(centerX, minC, maxC);
      if (targetX !== null) targetX = clamp(targetX, minC, maxC);
      if (wrapActive && wrapDirection !== 0) projectedOffset = window.innerWidth * wrapDirection;
      applyTransformTo(wrapper);
      if (cloneWrapper) applyTransformTo(cloneWrapper);
      renderWrapper(centerX, centerY, wrapper);
      if (cloneWrapper) renderWrapper(centerX - projectedOffset, centerY, cloneWrapper);
    }, {passive:true});
  }

  function measurePrimaryImage(){
    const head = imgs[0];
    naturalW = head.naturalWidth || head.width || naturalW || 64;
    naturalH = head.naturalHeight || head.height || naturalH || 64;
    if (!naturalW || !naturalH){ naturalW = naturalW || 64; naturalH = naturalH || 64; }
  }

  let remaining = imgs.length;
  imgs.forEach(i => {
    if (i.complete && (i.naturalWidth || i.width)) remaining--;
    else {
      i.addEventListener('load', ()=>{ remaining--; if (remaining === 0) initAfterPreload(); }, {once:true,passive:true});
      i.addEventListener('error', ()=>{ remaining--; if (remaining === 0) initAfterPreload(); }, {once:true,passive:true});
    }
  });
  if (remaining === 0) initAfterPreload();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadTinyChancy);
else loadTinyChancy();
})();
