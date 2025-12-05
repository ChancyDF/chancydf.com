(function(){
const BASE_SCALE = 0.36;
const IDLE_MIN = 5000;
const IDLE_MAX = 10000;
const SIT_MIN = 10000;
const SIT_MAX = 60000;
const Z_INDEX = 1000000;
const GRAVITY = 300;
const BOUNCE_FACTOR = 0.25;

const idleSrc = '/tinychancy/tinychancy_idle.gif';
const walkSrc = '/tinychancy/tinychancy_walk.gif';
const sitSrc = '/tinychancy/tinychancy_sit.gif';
const dangleSrc = '/tinychancy/tinychancy_dangle.gif';

function randBetween(a,b){return Math.random()*(b-a)+a}
function chance(p){return Math.random()<p}
function clamp(v,a,b){return Math.min(Math.max(v,a),b)}
function round(v){return Math.round(v)}

function loadTinyChancy(){
  const preloadPaths = [idleSrc, walkSrc, sitSrc, dangleSrc].map(s => {
    const i = new Image();
    i.src = s;
    return i;
  });

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
  wrapper.style.display = 'block';

  const img = document.createElement('img');
  img.id = 'tinychancy';
  img.src = idleSrc;
  img.style.display = 'block';
  img.style.pointerEvents = 'none';
  img.draggable = false;
  img.ondragstart = () => false;
  wrapper.appendChild(img);

  let cloneWrapper = null;
  let cloneImg = null;

  let centerX = null;
  let centerY = null;
  let facing = 1;
  let currentScale = BASE_SCALE;
  let moving = false;
  let direction = 0;
  let targetX = null;
  let lastTime = null;
  let chooseTimer = null;
  let flipBackTimer = null;
  let sitTimer = null;
  let sitting = false;
  let wrapActive = false;
  let projectedOffset = 0;
  let wrapDirection = 0;
  let dangling = false;
  let dragPointerId = null;
  let prevPointer = {x:0,y:0,time:0};
  let vx = 0, vy = 0;
  let bounceUsed = false;

  function currentWidth(elRef){ const r = elRef.getBoundingClientRect(); return (r && r.width) || (preloadPaths[0] && preloadPaths[0].width) || 50; }
  function currentHeight(elRef){ const r = elRef.getBoundingClientRect(); return (r && r.height) || (preloadPaths[0] && preloadPaths[0].height) || 50; }
  function renderWrapperFromCenter(cx, cy, ref = wrapper){
    const w = currentWidth(ref);
    const h = currentHeight(ref);
    ref.style.left = (round(cx - w/2)) + 'px';
    ref.style.top = (round(cy - h/2)) + 'px';
  }
  function applyTransformToRef(ref){
    ref.style.transform = `scale(${currentScale}) scaleX(${facing})`;
  }
  function setFacing(f){
    if(facing === f) return;
    facing = f;
    applyTransformToRef(wrapper);
    if(cloneWrapper) applyTransformToRef(cloneWrapper);
    if(centerX !== null){
      renderWrapperFromCenter(centerX, centerY, wrapper);
      if(cloneWrapper) renderWrapperFromCenter(centerX - projectedOffset, centerY, cloneWrapper);
    }
  }
  function adjustScaleForScreen(){
    const w = window.innerWidth;
    if(w < 400) currentScale = BASE_SCALE * 0.6;
    else if(w < 700) currentScale = BASE_SCALE * 0.8;
    else currentScale = BASE_SCALE;
    applyTransformToRef(wrapper);
    if(cloneWrapper) applyTransformToRef(cloneWrapper);
  }
  function clearAllTimers(){ if(chooseTimer){ clearTimeout(chooseTimer); chooseTimer = null } if(flipBackTimer){ clearTimeout(flipBackTimer); flipBackTimer = null } if(sitTimer){ clearTimeout(sitTimer); sitTimer = null } }

  function startSitting(duration){
    clearAllTimers();
    dangling = false;
    sitting = true;
    moving = false;
    direction = 0;
    targetX = null;
    setFacing(1);
    img.src = sitSrc;
    sitTimer = setTimeout(()=>{ sitTimer = null; sitting = false; startIdleState() }, duration);
  }

  function startIdleState(){
    clearAllTimers();
    dangling = false;
    moving = false;
    direction = 0;
    targetX = null;
    if(facing === -1){
      flipBackTimer = setTimeout(()=>{ setFacing(1); flipBackTimer = null }, 1000);
    }
    const wait = randBetween(IDLE_MIN, IDLE_MAX);
    chooseTimer = setTimeout(()=>{
      chooseTimer = null;
      if(chance(1/10)) startSitting(randBetween(SIT_MIN, SIT_MAX));
      else prepareAndStartMove();
    }, wait);
    img.src = idleSrc;
    bounceUsed = false;
  }

  function pickTargetWithin(minC, maxC){
    let t = centerX;
    let attempts = 0;
    while((Math.abs(t - centerX) < 100 || t <= minC || t >= maxC) && attempts < 2000){
      t = randBetween(minC, maxC);
      attempts++;
    }
    return clamp(t, minC, maxC);
  }

  function prepareAndStartMove(){
    const w = currentWidth(wrapper);
    const minC = w / 2;
    const maxC = Math.max(minC, window.innerWidth - w / 2);
    targetX = pickTargetWithin(minC, maxC);
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
    renderWrapperFromCenter(centerX, centerY, wrapper);
    img.src = idleSrc;
    startIdleState();
  }

  function createCloneIfNeeded(){
    if(cloneWrapper) return;
    cloneWrapper = document.createElement('div');
    cloneWrapper.id = 'tinychancy-wrapper-clone';
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
    cloneWrapper.appendChild(cloneImg);
    document.body.appendChild(cloneWrapper);
  }
  function removeClone(){
    if(!cloneWrapper) return;
    try{ cloneWrapper.remove(); }catch(e){}
    cloneWrapper = null;
    cloneImg = null;
    wrapActive = false;
    wrapDirection = 0;
    projectedOffset = 0;
  }

  function startDrag(px, py, id){
    dangling = true;
    dragPointerId = id;
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.touchAction = 'none';
    clearAllTimers();
    moving = false;
    direction = 0;
    targetX = null;
    sitting = false;
    img.src = dangleSrc;
    wrapper.style.transformOrigin = 'center top';
    vx = 0;
    vy = 0;
    prevPointer = {x: px, y: py, time: performance.now()};
    const h = currentHeight(wrapper);
    centerX = px;
    centerY = py + h/2;
    applyTransformToRef(wrapper);
    renderWrapperFromCenter(centerX, centerY, wrapper);
    bounceUsed = false;
  }

  function updateDrag(px, py){
    const now = performance.now();
    const dt = (now - prevPointer.time)/1000 || 0.016;
    const dx = px - prevPointer.x;
    const dy = py - prevPointer.y;
    const instantVx = dx/dt;
    const instantVy = dy/dt;
    vx = vx*(1 - 0.08) + instantVx*0.08;
    vy = vy*(1 - 0.08) + instantVy*0.08;
    prevPointer = {x: px, y: py, time: now};
    const h = currentHeight(wrapper);
    centerX = px;
    centerY = py + h/2;
    applyTransformToRef(wrapper);
    renderWrapperFromCenter(centerX, centerY, wrapper);
    handleWrapDuringDrag();
  }

  function endDrag(){
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.touchAction = '';
    dragPointerId = null;
    wrapper.style.transformOrigin = 'center bottom';
    if(Math.abs(vx) < 20 && Math.abs(vy) < 20){
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
    function fallStep(ts, last){
      const dt = Math.min(0.05, (ts - last)/1000);
      vy_local += GRAVITY * dt;
      centerY += vy_local * dt;
      applyTransformToRef(wrapper);
      renderWrapperFromCenter(centerX, centerY, wrapper);
      const h = currentHeight(wrapper);
      const floorY = window.innerHeight - h/2;
      if(centerY >= floorY){
        centerY = floorY;
        renderWrapperFromCenter(centerX, centerY, wrapper);
        if(!bounced){
          bounced = true;
          const dropHeight = Math.max(0, floorY - startY);
          const bounceHeight = dropHeight * BOUNCE_FACTOR;
          const v0 = Math.sqrt(2 * GRAVITY * bounceHeight);
          vy_local = -v0;
          setTimeout(()=>{ finalizeBounceAndSit() }, Math.max(200, (v0/GRAVITY)*1000 + 50));
          requestAnimationFrame(ts2 => fallStep(ts2, ts));
        } else {
          finalizeBounceAndSit();
        }
        return;
      }
      requestAnimationFrame(ts2 => fallStep(ts2, ts));
    }
    requestAnimationFrame(ts => fallStep(ts, performance.now()));
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
      applyTransformToRef(wrapper);
      handleWrapDuringThrow();
      renderWrapperFromCenter(centerX, centerY, wrapper);
      const h = currentHeight(wrapper);
      const floorY = window.innerHeight - h/2;
      if(centerY >= floorY){
        centerY = floorY;
        renderWrapperFromCenter(centerX, centerY, wrapper);
        if(!bounced){
          bounced = true;
          const dropHeight = Math.max(0, floorY - startY);
          const bounceHeight = dropHeight * BOUNCE_FACTOR;
          const v0 = Math.sqrt(2 * GRAVITY * bounceHeight);
          vy_local = -v0;
          setTimeout(()=>{ finalizeBounceAndSit() }, Math.max(200, (v0/GRAVITY)*1000 + 50));
          requestAnimationFrame(ts2 => step(ts2, ts));
        } else {
          finalizeBounceAndSit();
        }
        return;
      }
      requestAnimationFrame(ts2 => step(ts2, ts));
    }
    requestAnimationFrame(ts => step(ts, performance.now()));
  }

  function finalizeBounceAndSit(){
    if(bounceUsed) return;
    bounceUsed = true;
    img.src = sitSrc;
    sitting = true;
    applyTransformToRef(wrapper);
    setTimeout(()=>{ sitting = false; startIdleState() }, 800);
  }

  function handleWrapDuringDrag(){
    if(!wrapActive && (centerX - currentWidth(wrapper)/2 < 0 || centerX + currentWidth(wrapper)/2 > window.innerWidth)){
      wrapActive = true;
      wrapDirection = centerX - currentWidth(wrapper)/2 < 0 ? -1 : 1;
      projectedOffset = window.innerWidth * wrapDirection;
      createCloneDuringDrag();
    }
    if(wrapActive && cloneWrapper){
      const cloneCenter = centerX - projectedOffset;
      renderWrapperFromCenter(cloneCenter, centerY, cloneWrapper);
      applyTransformToRef(cloneWrapper);
      const w = currentWidth(cloneWrapper);
      if(cloneCenter - w/2 >= 0 && cloneCenter + w/2 <= window.innerWidth){
        centerX = cloneCenter;
        renderWrapperFromCenter(centerX, centerY, wrapper);
        removeClone();
      }
    }
  }

  function createCloneDuringDrag(){
    if(cloneWrapper) return;
    cloneWrapper = document.createElement('div');
    cloneWrapper.id = 'tinychancy-wrapper-clone';
    cloneWrapper.style.position = 'fixed';
    cloneWrapper.style.top = '0px';
    cloneWrapper.style.left = '0px';
    cloneWrapper.style.transformOrigin = 'center top';
    cloneWrapper.style.pointerEvents = 'none';
    cloneWrapper.style.willChange = 'left,top,transform';
    cloneWrapper.style.zIndex = String(Z_INDEX);
    cloneImg = document.createElement('img');
    cloneImg.style.display = 'block';
    cloneImg.style.pointerEvents = 'none';
    cloneImg.draggable = false;
    cloneImg.ondragstart = () => false;
    cloneWrapper.appendChild(cloneImg);
    cloneImg.src = img.src;
    applyTransformToRef(cloneWrapper);
    document.body.appendChild(cloneWrapper);
  }

  function handleWrapDuringThrow(){
    if(!wrapActive && (centerX - currentWidth(wrapper)/2 < 0 || centerX + currentWidth(wrapper)/2 > window.innerWidth)){
      wrapActive = true;
      wrapDirection = centerX - currentWidth(wrapper)/2 < 0 ? -1 : 1;
      projectedOffset = window.innerWidth * wrapDirection;
      createCloneIfNeeded();
      if(cloneImg) cloneImg.src = img.src;
      if(cloneWrapper) applyTransformToRef(cloneWrapper);
    }
    if(wrapActive && cloneWrapper){
      const cloneCenter = centerX - projectedOffset;
      renderWrapperFromCenter(cloneCenter, centerY, cloneWrapper);
      applyTransformToRef(cloneWrapper);
      const w = currentWidth(cloneWrapper);
      if(cloneCenter - w/2 >= 0 && cloneCenter + w/2 <= window.innerWidth){
        centerX = cloneCenter;
        if(targetX !== null) targetX = clamp(targetX - projectedOffset, w/2, Math.max(w/2, window.innerWidth - w/2));
        removeClone();
      }
    }
  }

  function rafLoop(ts){
    if(lastTime === null) lastTime = ts;
    const dt = Math.min(0.05, (ts - lastTime)/1000);
    lastTime = ts;
    adjustScaleForScreen();
    if(centerX === null){
      const w = currentWidth(wrapper);
      const minC = w/2; const maxC = Math.max(minC, window.innerWidth - w/2);
      centerX = randBetween(minC, maxC);
      centerY = window.innerHeight - currentHeight(wrapper)/2;
    }
    if(sitting){
      applyTransformToRef(wrapper);
      renderWrapperFromCenter(centerX, centerY, wrapper);
      requestAnimationFrame(rafLoop);
      return;
    }
    if(dangling){
      applyTransformToRef(wrapper);
      renderWrapperFromCenter(centerX, centerY, wrapper);
      handleWrapDuringDrag();
      requestAnimationFrame(rafLoop);
      return;
    }
    if(moving && direction !== 0 && targetX !== null){
      const speed = currentWidth(wrapper);
      let nextCenter = centerX + direction * speed * dt;
      const W = window.innerWidth;
      const w = currentWidth(wrapper);
      const leftEdge = nextCenter - w/2;
      const rightEdge = nextCenter + w/2;
      if(!wrapActive && (leftEdge < 0 || rightEdge > W)){
        wrapActive = true;
        wrapDirection = leftEdge < 0 ? -1 : 1;
        projectedOffset = W * wrapDirection;
        createCloneIfNeeded();
        if(cloneImg) cloneImg.src = img.src;
        if(cloneWrapper) applyTransformToRef(cloneWrapper);
      }
      if(wrapActive && cloneWrapper){
        const cloneCenter = nextCenter - projectedOffset;
        renderWrapperFromCenter(nextCenter, centerY, wrapper);
        renderWrapperFromCenter(cloneCenter, centerY, cloneWrapper);
        applyTransformToRef(wrapper); applyTransformToRef(cloneWrapper);
        const cloneLeft = cloneCenter - w/2; const cloneRight = cloneCenter + w/2;
        if(cloneLeft >= 0 && cloneRight <= W){
          centerX = cloneCenter;
          if(targetX !== null) targetX = clamp(targetX - projectedOffset, w/2, Math.max(w/2, W - w/2));
          removeClone();
          renderWrapperFromCenter(centerX, centerY, wrapper);
        } else {
          centerX = nextCenter;
        }
      } else {
        const minC = w/2; const maxC = Math.max(minC, W - w/2);
        const clamped = clamp(nextCenter, minC, maxC);
        if(clamped !== nextCenter){
          centerX = clamped;
          stopAndIdleAt(centerX);
          if(cloneWrapper) removeClone();
          requestAnimationFrame(rafLoop);
          return;
        }
        centerX = nextCenter;
        renderWrapperFromCenter(centerX, centerY, wrapper);
      }
      const reached = (direction === 1 && centerX >= targetX) || (direction === -1 && centerX <= targetX);
      if(reached){
        stopAndIdleAt(targetX);
        if(cloneWrapper) removeClone();
        requestAnimationFrame(rafLoop);
        return;
      }
      requestAnimationFrame(rafLoop);
      return;
    } else {
      renderWrapperFromCenter(centerX, centerY, wrapper);
      img.src = idleSrc;
      if(cloneWrapper) removeClone();
    }
    requestAnimationFrame(rafLoop);
  }

  function onPointerDown(e){
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    const rect = wrapper.getBoundingClientRect();
    const px = e.clientX;
    const py = e.clientY;
    if(px < rect.left || px > rect.right || py < rect.top || py > rect.bottom) return;
    e.preventDefault();
    startDrag(px, py, e.pointerId);
    document.addEventListener('pointermove', onPointerMove, {passive:false});
    document.addEventListener('pointerup', onPointerUp, {passive:false});
    document.addEventListener('pointercancel', onPointerUp, {passive:false});
  }
  function onPointerMove(e){
    if(dragPointerId !== e.pointerId) return;
    e.preventDefault();
    updateDrag(e.clientX, e.clientY);
  }
  function onPointerUp(e){
    if(dragPointerId !== e.pointerId) return;
    e.preventDefault();
    document.removeEventListener('pointermove', onPointerMove, {passive:false});
    document.removeEventListener('pointerup', onPointerUp, {passive:false});
    document.removeEventListener('pointercancel', onPointerUp, {passive:false});
    endDrag();
  }

  function initAfterPreload(){
    document.body.appendChild(wrapper);
    wrapper.style.visibility = 'visible';
    applyTransformToRef(wrapper);
    adjustScaleForScreen();
    const w = currentWidth(wrapper);
    const minC = w/2; const maxC = Math.max(minC, window.innerWidth - w/2);
    centerX = randBetween(minC, maxC);
    centerY = window.innerHeight - currentHeight(wrapper)/2;
    if(chance(1/5)){
      startSitting(randBetween(SIT_MIN, SIT_MAX));
    } else {
      startIdleState();
    }
    setTimeout(()=>{ requestAnimationFrame(rafLoop) }, 50);
    wrapper.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', ()=>{ adjustScaleForScreen(); const w=currentWidth(wrapper); const minC=w/2; const maxC=Math.max(minC,window.innerWidth-w/2); if(centerX!==null) centerX=clamp(centerX,minC,maxC); if(targetX!==null) targetX=clamp(targetX,minC,maxC); if(cloneWrapper && wrapDirection!==0){ projectedOffset=window.innerWidth*wrapDirection; applyTransformToRef(cloneWrapper); renderWrapperFromCenter(centerX-projectedOffset, centerY, cloneWrapper) } renderWrapperFromCenter(centerX,centerY,wrapper) }, {passive:true});
  }

  let remaining = preloadPaths.length;
  preloadPaths.forEach(imgEl=>{
    if(imgEl.complete && imgEl.naturalWidth) remaining--;
    else { imgEl.addEventListener('load', ()=>{ remaining--; if(remaining===0) initAfterPreload() }, {once:true,passive:true}); imgEl.addEventListener('error', ()=>{ remaining--; if(remaining===0) initAfterPreload() }, {once:true,passive:true}); }
  });
  if(remaining === 0) initAfterPreload();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', loadTinyChancy);
} else {
  loadTinyChancy();
}
})();
