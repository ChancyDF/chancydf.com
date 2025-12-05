(function(){
const BASE_SCALE=0.36;
const IDLE_MIN=5000;
const IDLE_MAX=10000;
const SIT_MIN=10000;
const SIT_MAX=60000;
const Z_INDEX=1000000;
const GRAVITY=300;
const MAX_ROT=Math.PI/2;
const ROT_EASE=8;
const DRAG_VEL_SMOOTH=0.08;
const BOUNCE_FACTOR=0.25;

const idleSrc='/tinychancy/tinychancy_idle.gif';
const walkSrc='/tinychancy/tinychancy_walk.gif';
const sitSrc='/tinychancy/tinychancy_sit.gif';
const dangleSrc='/tinychancy/tinychancy_dangle.gif';

function randBetween(a,b){return Math.random()*(b-a)+a}
function chance(p){return Math.random()<p}
function clamp(v,a,b){return Math.min(Math.max(v,a),b)}

function loadTinyChancy(){
  const preloadPaths=[idleSrc,walkSrc,sitSrc,dangleSrc].map(s=>{const i=new Image();i.src=s;return i});
  const main=document.createElement('img');
  main.id='tinychancy';
  main.style.position='fixed';
  main.style.top='0px';
  main.style.left='0px';
  main.style.transformOrigin='center bottom';
  main.style.transform=`scale(${BASE_SCALE}) scaleX(1) rotate(0rad)`;
  main.style.pointerEvents='auto';
  main.style.willChange='left,top,transform';
  main.style.zIndex=String(Z_INDEX);
  main.draggable=false;
  main.ondragstart=()=>false;

  let clone=null;

  let centerX=null;
  let centerY=null;
  let facing=1;
  let currentScale=BASE_SCALE;
  let moving=false;
  let direction=0;
  let targetX=null;
  let lastTime=null;
  let chooseTimer=null;
  let flipBackTimer=null;
  let sitTimer=null;
  let sitting=false;
  let wrapActive=false;
  let projectedOffset=0;
  let wrapDirection=0;
  let dangling=false;
  let dragPointerId=null;
  let prevPointer={x:0,y:0,time:0};
  let vx=0,vy=0;
  let rot=0,rotVel=0;
  let bounceUsed=false;

  function currentWidth(elRef){const r=elRef.getBoundingClientRect();return (r&&r.width)||50}
  function currentHeight(elRef){const r=elRef.getBoundingClientRect();return (r&&r.height)||50}
  function render(elRef,cx,cy){const w=currentWidth(elRef);const h=currentHeight(elRef);elRef.style.left=(cx-w/2)+'px';elRef.style.top=(cy-h/2)+'px'}
  function applyVis(elRef){elRef.style.transform=`scale(${currentScale}) scaleX(${facing}) rotate(${rot}rad)`}
  function setFacing(f){if(facing===f) return; facing=f; applyVis(main); if(clone) applyVis(clone); if(centerX!==null){render(main,centerX,centerY); if(clone) render(clone,centerX-projectedOffset,centerY)}}
  function adjustScale(){const w=window.innerWidth; if(w<400) currentScale=BASE_SCALE*0.6; else if(w<700) currentScale=BASE_SCALE*0.8; else currentScale=BASE_SCALE; applyVis(main); if(clone) applyVis(clone)}
  function clearAllTimers(){ if(chooseTimer){clearTimeout(chooseTimer); chooseTimer=null} if(flipBackTimer){clearTimeout(flipBackTimer); flipBackTimer=null} if(sitTimer){clearTimeout(sitTimer); sitTimer=null} }

  function startSitting(duration){
    clearAllTimers();
    dangling=false;
    sitting=true;
    moving=false;
    direction=0;
    targetX=null;
    setFacing(1);
    main.src=sitSrc;
    sitTimer=setTimeout(()=>{ sitTimer=null; sitting=false; startIdleState() }, duration);
  }

  function startIdleState(){
    clearAllTimers();
    dangling=false;
    moving=false;
    direction=0;
    targetX=null;
    if(facing===-1){ flipBackTimer=setTimeout(()=>{ setFacing(1); flipBackTimer=null },1000) }
    const wait=randBetween(IDLE_MIN,IDLE_MAX);
    chooseTimer=setTimeout(()=>{
      chooseTimer=null;
      if(chance(1/10)) startSitting(randBetween(SIT_MIN,SIT_MAX));
      else prepareAndStartMove();
    }, wait);
    main.src=idleSrc;
    bounceUsed=false;
  }

  function pickTarget(minC,maxC){
    let t=centerX; let attempts=0;
    while((Math.abs(t-centerX)<100 || t<=minC || t>=maxC) && attempts<2000){ t=randBetween(minC,maxC); attempts++ }
    return clamp(t,minC,maxC);
  }

  function prepareAndStartMove(){
    const w=currentWidth(main); const minC=w/2; const maxC=Math.max(minC,window.innerWidth-w/2);
    targetX=pickTarget(minC,maxC);
    direction = targetX>centerX?1:-1;
    setFacing(direction===1?1:-1);
    moving=true;
    main.src=walkSrc;
  }

  function stopAndIdleAt(x){
    moving=false; direction=0; targetX=null;
    centerX=x;
    render(main,centerX,centerY);
    main.src=idleSrc;
    startIdleState();
  }

  function createClone(){
    if(clone) return;
    clone=document.createElement('img');
    clone.id='tinychancy_clone';
    clone.style.position='fixed';
    clone.style.top='0px';
    clone.style.left='0px';
    clone.style.transformOrigin='center bottom';
    clone.style.pointerEvents='none';
    clone.style.willChange='left,top,transform';
    clone.style.zIndex=String(Z_INDEX);
    clone.src=main.src;
    applyVis(clone);
    document.body.appendChild(clone);
  }

  function removeClone(){ if(!clone) return; try{clone.remove()}catch(e){} clone=null; wrapActive=false; wrapDirection=0; projectedOffset=0 }

  function startDrag(px,py,id){
    dangling=true;
    dragPointerId=id;
    document.body.style.userSelect='none';
    document.body.style.webkitUserSelect='none';
    document.body.style.touchAction='none';
    clearAllTimers();
    moving=false; direction=0; targetX=null; sitting=false;
    main.src=dangleSrc;
    main.style.transformOrigin='center top';
    rot=0; rotVel=0; vx=0; vy=0;
    prevPointer={x:px,y:py,time:performance.now()};
    const h=currentHeight(main);
    centerX=px;
    centerY=py + h/2;
    applyVis(main);
    render(main,centerX,centerY);
    bounceUsed=false;
  }

  function updateDrag(px,py){
    const now=performance.now();
    const dt=(now-prevPointer.time)/1000 || 0.016;
    const dx=px-prevPointer.x; const dy=py-prevPointer.y;
    const instantVx=dx/dt; const instantVy=dy/dt;
    vx = vx*(1-DRAG_VEL_SMOOTH) + instantVx*DRAG_VEL_SMOOTH;
    vy = vy*(1-DRAG_VEL_SMOOTH) + instantVy*DRAG_VEL_SMOOTH;
    prevPointer={x:px,y:py,time:now};
    const h=currentHeight(main);
    centerX=px;
    centerY=py + h/2;
    rotVel = rotVel*0.8 + clamp(-vx/800,-1,1)*0.2;
    rot += rotVel * dt;
    rot = clamp(rot,-MAX_ROT,MAX_ROT);
    applyVis(main);
    render(main,centerX,centerY);
    handleWrapDuringDrag();
  }

  function endDrag(){
    document.body.style.userSelect='';
    document.body.style.webkitUserSelect='';
    document.body.style.touchAction='';
    dragPointerId=null;
    main.style.transformOrigin='center bottom';
    if(Math.abs(vx)<20 && Math.abs(vy)<20){
      vy=0;
      dangling=false;
      startFall();
    } else {
      dangling=false;
      startThrow(vx,vy);
    }
  }

  function startFall(){
    let vy_local=0;
    let startY=centerY;
    let bounced=false;
    function fallStep(ts, last){
      const dt=Math.min(0.05,(ts-last)/1000);
      vy_local += GRAVITY*dt;
      centerY += vy_local*dt;
      rot += (vy_local/1000)*dt;
      rot = clamp(rot,-MAX_ROT,MAX_ROT);
      applyVis(main);
      render(main,centerX,centerY);
      const h=currentHeight(main);
      const floorY=window.innerHeight - h/2;
      if(centerY >= floorY){
        centerY = floorY;
        render(main,centerX,centerY);
        if(!bounced){
          bounced=true;
          const dropHeight = Math.max(0, floorY - startY);
          const bounceHeight = dropHeight * BOUNCE_FACTOR;
          const v0 = Math.sqrt(2*GRAVITY*bounceHeight);
          vy_local = -v0;
          setTimeout(()=>{ finalizeBounceAndSit() }, Math.max(200, (v0/GRAVITY)*1000 + 50));
          requestAnimationFrame(ts2=>fallStep(ts2,ts));
        } else {
          finalizeBounceAndSit();
        }
        return;
      }
      requestAnimationFrame(ts2=>fallStep(ts2,ts));
    }
    requestAnimationFrame(ts=>fallStep(ts,performance.now()));
  }

  function startThrow(initVx, initVy){
    let vx_local=initVx;
    let vy_local=initVy;
    let bounced=false;
    const startY=centerY;
    function step(ts,last){
      const dt=Math.min(0.05,(ts-last)/1000);
      vy_local += GRAVITY*dt;
      centerX += vx_local*dt;
      centerY += vy_local*dt;
      rot += (vx_local/2000)*dt;
      applyVis(main);
      handleWrapDuringThrow();
      render(main,centerX,centerY);
      const h=currentHeight(main);
      const floorY=window.innerHeight - h/2;
      if(centerY >= floorY){
        centerY = floorY;
        render(main,centerX,centerY);
        if(!bounced){
          bounced=true;
          const dropHeight = Math.max(0, floorY - startY);
          const bounceHeight = dropHeight * BOUNCE_FACTOR;
          const v0 = Math.sqrt(2*GRAVITY*bounceHeight);
          vy_local = -v0;
          setTimeout(()=>{ finalizeBounceAndSit() }, Math.max(200,(v0/GRAVITY)*1000+50));
          requestAnimationFrame(ts2=>step(ts2,ts));
        } else {
          finalizeBounceAndSit();
        }
        return;
      }
      requestAnimationFrame(ts2=>step(ts2,ts));
    }
    requestAnimationFrame(ts=>step(ts,performance.now()));
  }

  function finalizeBounceAndSit(){
    main.src=sitSrc;
    sitting=true;
    bounceUsed=true;
    rot=0;
    applyVis(main);
    setTimeout(()=>{ sitting=false; startIdleState() }, 800);
  }

  function handleWrapDuringDrag(){
    if(!wrapActive && (centerX - currentWidth(main)/2 < 0 || centerX + currentWidth(main)/2 > window.innerWidth)){
      wrapActive=true;
      wrapDirection = centerX - currentWidth(main)/2 < 0 ? -1 : 1;
      projectedOffset = window.innerWidth * wrapDirection;
      createCloneDuringDrag();
    }
    if(wrapActive && clone){
      const cloneCenter = centerX - projectedOffset;
      render(clone, cloneCenter, centerY);
      applyVis(clone);
      const w=currentWidth(clone);
      if(cloneCenter - w/2 >=0 && cloneCenter + w/2 <= window.innerWidth){
        centerX = cloneCenter;
        render(main,centerX,centerY);
        removeClone();
      }
    }
  }

  function createCloneDuringDrag(){
    if(clone) return;
    clone=document.createElement('img');
    clone.id='tinychancy_clone';
    clone.style.position='fixed';
    clone.style.top='0px';
    clone.style.left='0px';
    clone.style.transformOrigin='center top';
    clone.style.pointerEvents='none';
    clone.style.willChange='left,top,transform';
    clone.style.zIndex=String(Z_INDEX);
    clone.src=main.src;
    clone.style.transform=`scale(${currentScale}) scaleX(${facing}) rotate(${rot}rad)`;
    document.body.appendChild(clone);
  }

  function handleWrapDuringThrow(){
    if(!wrapActive && (centerX - currentWidth(main)/2 < 0 || centerX + currentWidth(main)/2 > window.innerWidth)){
      wrapActive=true;
      wrapDirection = centerX - currentWidth(main)/2 < 0 ? -1 : 1;
      projectedOffset = window.innerWidth * wrapDirection;
      createClone();
      clone.src = main.src;
      applyVis(clone);
    }
    if(wrapActive && clone){
      const cloneCenter = centerX - projectedOffset;
      render(clone, cloneCenter, centerY);
      applyVis(clone);
      const w=currentWidth(clone);
      if(cloneCenter - w/2 >=0 && cloneCenter + w/2 <= window.innerWidth){
        centerX = cloneCenter;
        if(targetX!==null) targetX = clamp(targetX - projectedOffset, w/2, Math.max(w/2,window.innerWidth - w/2));
        removeClone();
      }
    }
  }

  function rafLoop(ts){
    if(lastTime===null) lastTime=ts;
    const dt=Math.min(0.05,(ts-lastTime)/1000);
    lastTime=ts;
    adjustScale();
    if(centerX===null){
      const w=currentWidth(main);
      const minC=w/2; const maxC=Math.max(minC,window.innerWidth-w/2);
      centerX=randBetween(minC,maxC); centerY=window.innerHeight - currentHeight(main)/2;
    }
    if(sitting){ applyVis(main); render(main,centerX,centerY); requestAnimationFrame(rafLoop); return }
    if(dangling){ applyVis(main); render(main,centerX,centerY); handleWrapDuringDrag(); requestAnimationFrame(rafLoop); return }
    if(moving && direction!==0 && targetX!==null){
      const speed=currentWidth(main);
      let nextCenter=centerX + direction * speed * dt;
      const W=window.innerWidth;
      const w=currentWidth(main);
      const leftEdge=nextCenter - w/2;
      const rightEdge=nextCenter + w/2;
      if(!wrapActive && (leftEdge < 0 || rightEdge > W)){
        wrapActive=true;
        wrapDirection = leftEdge < 0 ? -1 : 1;
        projectedOffset = W * wrapDirection;
        createClone();
        clone.src = main.src;
        applyVis(clone);
      }
      if(wrapActive && clone){
        const cloneCenter = nextCenter - projectedOffset;
        render(main,nextCenter,centerY);
        render(clone,cloneCenter,centerY);
        applyVis(main); applyVis(clone);
        const cloneLeft = cloneCenter - w/2; const cloneRight = cloneCenter + w/2;
        if(cloneLeft >=0 && cloneRight <= W){
          centerX = cloneCenter;
          if(targetX!==null) targetX = clamp(targetX - projectedOffset, w/2, Math.max(w/2,W-w/2));
          removeClone();
          render(main,centerX,centerY);
        } else {
          centerX = nextCenter;
        }
      } else {
        const minC=w/2; const maxC=Math.max(minC,W-w/2);
        const clamped=clamp(nextCenter,minC,maxC);
        if(clamped!==nextCenter){
          centerX=clamped;
          stopAndIdleAt(centerX);
          if(clone) removeClone();
          requestAnimationFrame(rafLoop);
          return;
        }
        centerX=nextCenter;
        render(main,centerX,centerY);
      }
      const reached = (direction===1 && centerX>=targetX) || (direction===-1 && centerX<=targetX);
      if(reached){ stopAndIdleAt(targetX); if(clone) removeClone(); requestAnimationFrame(rafLoop); return }
      requestAnimationFrame(rafLoop); return;
    } else {
      render(main,centerX,centerY);
      main.src = idleSrc;
      if(clone) removeClone();
    }
    requestAnimationFrame(rafLoop);
  }

  function onPointerDown(e){
    if(e.pointerType==='mouse' && e.button!==0) return;
    const rect=main.getBoundingClientRect();
    const px=e.clientX;
    const py=e.clientY;
    if(px < rect.left || px > rect.right || py < rect.top || py > rect.bottom) return;
    e.preventDefault();
    startDrag(px,py,e.pointerId);
    document.addEventListener('pointermove', onPointerMove, {passive:false});
    document.addEventListener('pointerup', onPointerUp, {passive:false});
    document.addEventListener('pointercancel', onPointerUp, {passive:false});
  }

  function onPointerMove(e){
    if(dragPointerId!==e.pointerId) return;
    e.preventDefault();
    updateDrag(e.clientX, e.clientY);
  }

  function onPointerUp(e){
    if(dragPointerId!==e.pointerId) return;
    e.preventDefault();
    document.removeEventListener('pointermove', onPointerMove, {passive:false});
    document.removeEventListener('pointerup', onPointerUp, {passive:false});
    document.removeEventListener('pointercancel', onPointerUp, {passive:false});
    endDrag();
  }

  function initAfterPreload(){
    document.body.appendChild(main);
    applyVis(main);
    adjustScale();
    const w=currentWidth(main);
    const minC=w/2; const maxC=Math.max(minC,window.innerWidth - w/2);
    centerX=randBetween(minC,maxC);
    centerY=window.innerHeight - currentHeight(main)/2;
    if(chance(1/5)){
      startSitting(randBetween(SIT_MIN,SIT_MAX));
    } else {
      startIdleState();
    }
    setTimeout(()=>{ requestAnimationFrame(rafLoop) },50);
    main.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', ()=>{ adjustScale(); const w=currentWidth(main); const minC=w/2; const maxC=Math.max(minC,window.innerWidth-w/2); if(centerX!==null) centerX=clamp(centerX,minC,maxC); if(targetX!==null) targetX=clamp(targetX,minC,maxC); if(clone && wrapDirection!==0){ projectedOffset=window.innerWidth*wrapDirection; applyVis(clone); render(clone, centerX-projectedOffset, centerY)} render(main,centerX,centerY) }, {passive:true});
  }

  let remaining=preloadPaths.length;
  preloadPaths.forEach(img=>{
    if(img.complete && img.naturalWidth) remaining--;
    else { img.addEventListener('load', ()=>{ remaining--; if(remaining===0) initAfterPreload() }, {once:true,passive:true}); img.addEventListener('error', ()=>{ remaining--; if(remaining===0) initAfterPreload() }, {once:true,passive:true}); }
  });
  if(remaining===0) initAfterPreload();
}

if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', loadTinyChancy) } else { loadTinyChancy() }
})();
