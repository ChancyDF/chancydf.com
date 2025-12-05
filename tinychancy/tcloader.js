(function(){
const BASE_SCALE=0.36;
const IDLE_MIN=5000;
const IDLE_MAX=10000;
const SIT_MIN=10000;
const SIT_MAX=60000;
const Z_INDEX=1000000;
const GRAVITY=300;
const BOUNCE_FACTOR=0.25;

const idleSrc='/tinychancy/tinychancy_idle.gif';
const walkSrc='/tinychancy/tinychancy_walk.gif';
const sitSrc='/tinychancy/tinychancy_sit.gif';
const dangleSrc='/tinychancy/tinychancy_dangle.gif';

function randBetween(a,b){return Math.random()*(b-a)+a}
function chance(p){return Math.random()<p}
function clamp(v,a,b){return Math.min(Math.max(v,a),b)}
function iround(v){return Math.round(v)}

function loadTinyChancy(){
  const preloadImgs=[idleSrc,walkSrc,sitSrc,dangleSrc].map(s=>{const i=new Image();i.src=s;return i});

  const wrapper=document.createElement('div');
  wrapper.id='tinychancy-wrapper';
  wrapper.style.position='fixed';
  wrapper.style.top='0px';
  wrapper.style.left='0px';
  wrapper.style.transformOrigin='center bottom';
  wrapper.style.pointerEvents='auto';
  wrapper.style.touchAction='none';
  wrapper.style.willChange='left,top,transform';
  wrapper.style.zIndex=String(Z_INDEX);
  wrapper.style.visibility='hidden';
  wrapper.style.userSelect='none';

  const img=document.createElement('img');
  img.id='tinychancy';
  img.src=idleSrc;
  img.style.display='block';
  img.style.pointerEvents='none';
  img.draggable=false;
  img.ondragstart=()=>false;
  img.style.width='100%';
  img.style.height='auto';
  wrapper.appendChild(img);

  let cloneWrapper=null;
  let cloneImg=null;

  let spriteW=0;
  let spriteH=0;
  let scale=BASE_SCALE;
  let facing=1;

  let centerX=null;
  let centerY=null;

  let state='idle';
  let direction=0;
  let targetX=null;
  let chooseTimer=null;
  let sitTimer=null;
  let flipBackTimer=null;
  let lastTime=null;
  let hasBounced=false;

  let wrapActive=false;
  let wrapDirection=0;
  let projectedOffset=0;

  let dragPointerId=null;
  let prevPointer={x:0,y:0,t:0};
  let vx=0,vy=0;

  function updateSpriteSize(){
    const r=wrapper.getBoundingClientRect();
    if(r.width>0 && r.height>0){
      spriteW=r.width;
      spriteH=r.height;
    }
    if(!spriteW||!spriteH){
      spriteW=64*scale;
      spriteH=64*scale;
    }
  }

  function applyTransform(ref){
    ref.style.transform='scale('+scale+') scaleX('+facing+')';
  }

  function render(ref,cx,cy){
    if(!spriteW||!spriteH)return;
    const l=iround(cx-spriteW/2);
    const t=iround(cy-spriteH/2);
    ref.style.left=l+'px';
    ref.style.top=t+'px';
  }

  function clearTimers(){
    if(chooseTimer){clearTimeout(chooseTimer);chooseTimer=null}
    if(sitTimer){clearTimeout(sitTimer);sitTimer=null}
    if(flipBackTimer){clearTimeout(flipBackTimer);flipBackTimer=null}
  }

  function adjustScale(){
    const w=window.innerWidth;
    if(w<400)scale=BASE_SCALE*0.6;
    else if(w<700)scale=BASE_SCALE*0.8;
    else scale=BASE_SCALE;
    applyTransform(wrapper);
    if(cloneWrapper)applyTransform(cloneWrapper);
    updateSpriteSize();
  }

  function setFacing(f){
    if(facing===f)return;
    facing=f;
    applyTransform(wrapper);
    if(cloneWrapper)applyTransform(cloneWrapper);
    if(centerX!=null){
      render(wrapper,centerX,centerY);
      if(cloneWrapper)render(cloneWrapper,centerX-projectedOffset,centerY);
    }
  }

  function enterSit(duration){
    clearTimers();
    state='sit';
    setFacing(1);
    img.src=sitSrc;
    ensureOnFloor();
    sitTimer=setTimeout(()=>{sitTimer=null;enterIdle();},duration);
  }

  function enterIdle(){
    clearTimers();
    state='idle';
    img.src=idleSrc;
    ensureOnFloor();
    if(facing===-1){
      flipBackTimer=setTimeout(()=>{setFacing(1);flipBackTimer=null;},1000);
    }
    const wait=randBetween(IDLE_MIN,IDLE_MAX);
    chooseTimer=setTimeout(()=>{
      chooseTimer=null;
      if(chance(1/10))enterSit(randBetween(SIT_MIN,SIT_MAX));
      else enterWalk();
    },wait);
    hasBounced=false;
  }

  function pickTarget(minC,maxC){
    let t=centerX;
    let attempts=0;
    while((Math.abs(t-centerX)<100 || t<=minC || t>=maxC) && attempts<2000){
      t=randBetween(minC,maxC);
      attempts++;
    }
    return clamp(t,minC,maxC);
  }

  function enterWalk(){
    updateSpriteSize();
    ensureOnFloor();
    const minC=spriteW/2;
    const maxC=Math.max(minC,window.innerWidth-spriteW/2);
    targetX=pickTarget(minC,maxC);
    direction=targetX>centerX?1:-1;
    setFacing(direction===1?1:-1);
    state='walk';
    img.src=walkSrc;
  }

  function stopWalkAt(x){
    centerX=x;
    render(wrapper,centerX,centerY);
    enterIdle();
  }

  function ensureOnFloor(){
    updateSpriteSize();
    const floorY=window.innerHeight-spriteH/2;
    centerY=floorY;
    render(wrapper,centerX,centerY);
  }

  function createClone(){
    if(cloneWrapper)return;
    cloneWrapper=document.createElement('div');
    cloneWrapper.style.position='fixed';
    cloneWrapper.style.top='0px';
    cloneWrapper.style.left='0px';
    cloneWrapper.style.transformOrigin='center bottom';
    cloneWrapper.style.pointerEvents='none';
    cloneWrapper.style.willChange='left,top,transform';
    cloneWrapper.style.zIndex=String(Z_INDEX);
    cloneImg=document.createElement('img');
    cloneImg.style.display='block';
    cloneImg.style.pointerEvents='none';
    cloneImg.draggable=false;
    cloneImg.ondragstart=()=>false;
    cloneImg.style.width='100%';
    cloneImg.style.height='auto';
    cloneWrapper.appendChild(cloneImg);
    document.body.appendChild(cloneWrapper);
    applyTransform(cloneWrapper);
  }

  function removeClone(){
    if(!cloneWrapper)return;
    try{cloneWrapper.remove();}catch(e){}
    cloneWrapper=null;
    cloneImg=null;
    wrapActive=false;
    wrapDirection=0;
    projectedOffset=0;
  }

  function beginWrapIfNeeded(){
    if(!spriteW)return;
    const W=window.innerWidth;
    const left=centerX-spriteW/2;
    const right=centerX+spriteW/2;
    if(!wrapActive && (left<0 || right>W)){
      wrapActive=true;
      wrapDirection=left<0?-1:1;
      projectedOffset=W*wrapDirection;
      createClone();
      if(cloneImg)cloneImg.src=img.src;
      updateSpriteSize();
    }
  }

  function updateWrap(){
    if(!wrapActive||!cloneWrapper||!spriteW)return;
    const W=window.innerWidth;
    const cloneCenter=centerX-projectedOffset;
    render(cloneWrapper,cloneCenter,centerY);
    applyTransform(cloneWrapper);
    const cloneLeft=cloneCenter-spriteW/2;
    const cloneRight=cloneCenter+spriteW/2;
    if(cloneLeft>=0 && cloneRight<=W){
      centerX=cloneCenter;
      render(wrapper,centerX,centerY);
      if(targetX!=null)targetX=clamp(targetX-projectedOffset,spriteW/2,Math.max(spriteW/2,W-spriteW/2));
      removeClone();
    }
  }

  function enterDrag(px,py,id){
    if(dragPointerId!==null)return;
    state='drag';
    dragPointerId=id;
    wrapper.setPointerCapture(id);
    document.body.style.userSelect='none';
    document.body.style.webkitUserSelect='none';
    document.body.style.touchAction='none';
    clearTimers();
    wrapActive=false;
    removeClone();
    vx=0;vy=0;
    img.src=dangleSrc;
    wrapper.style.transformOrigin='center top';
    prevPointer={x:px,y:py,t:performance.now()};
    updateSpriteSize();
    centerX=iround(px);
    centerY=iround(py+spriteH/2);
    render(wrapper,centerX,centerY);
  }

  function updateDrag(px,py){
    if(state!=='drag')return;
    const now=performance.now();
    const dt=Math.max(0.001,(now-prevPointer.t)/1000);
    const dx=px-prevPointer.x;
    const dy=py-prevPointer.y;
    const instVx=dx/dt;
    const instVy=dy/dt;
    vx=vx*0.92+instVx*0.08;
    vy=vy*0.92+instVy*0.08;
    prevPointer={x:px,y:py,t:now};
    updateSpriteSize();
    centerX=iround(px);
    centerY=iround(py+spriteH/2);
    render(wrapper,centerX,centerY);
    beginWrapIfNeeded();
    updateWrap();
  }

  function endDrag(){
    if(state!=='drag')return;
    try{wrapper.releasePointerCapture(dragPointerId);}catch(e){}
    dragPointerId=null;
    document.body.style.userSelect='';
    document.body.style.webkitUserSelect='';
    document.body.style.touchAction='';
    wrapper.style.transformOrigin='center bottom';
    const speed=Math.hypot(vx,vy);
    if(speed<30){
      vy=0;
      enterFall();
    }else{
      enterThrow(vx,vy);
    }
  }

  function enterFall(){
    state='fall';
    img.src=dangleSrc;
    hasBounced=false;
    updateSpriteSize();
  }

  function enterThrow(initVx,initVy){
    state='throw';
    img.src=dangleSrc;
    vx=initVx;
    vy=initVy;
    hasBounced=false;
    updateSpriteSize();
  }

  function handleFall(dt){
    updateSpriteSize();
    vy+=GRAVITY*dt;
    centerY+=vy*dt;
    const floorY=window.innerHeight-spriteH/2;
    if(centerY>=floorY){
      centerY=floorY;
      if(!hasBounced){
        hasBounced=true;
        const dropH=Math.max(0,floorY-(prevPointer.y||floorY));
        const bounceH=dropH*BOUNCE_FACTOR;
        const v0=Math.sqrt(2*GRAVITY*bounceH);
        vy=-v0;
      }else{
        enterSitAfterBounce();
      }
    }
    render(wrapper,centerX,centerY);
  }

  function handleThrow(dt){
    updateSpriteSize();
    vy+=GRAVITY*dt;
    centerX+=vx*dt;
    centerY+=vy*dt;
    beginWrapIfNeeded();
    updateWrap();
    const floorY=window.innerHeight-spriteH/2;
    if(centerY>=floorY){
      centerY=floorY;
      if(!hasBounced){
        hasBounced=true;
        const dropH=0;
        const bounceH=dropH*BOUNCE_FACTOR;
        const v0=Math.sqrt(2*GRAVITY*bounceH);
        vy=-v0;
      }else{
        enterSitAfterBounce();
      }
    }
    render(wrapper,centerX,centerY);
  }

  function enterSitAfterBounce(){
    img.src=sitSrc;
    state='sit';
    ensureOnFloor();
    setTimeout(()=>{enterIdle();},800);
  }

  function handleWalk(dt){
    updateSpriteSize();
    ensureOnFloor();
    const speed=spriteW;
    let nextCenter=centerX+direction*speed*dt;
    const W=window.innerWidth;
    const minC=spriteW/2;
    const maxC=Math.max(minC,W-spriteW/2);
    const leftEdge=nextCenter-spriteW/2;
    const rightEdge=nextCenter+spriteW/2;
    if(!wrapActive && (leftEdge<0 || rightEdge>W)){
      centerX=nextCenter;
      beginWrapIfNeeded();
      updateWrap();
    }else if(wrapActive){
      centerX=nextCenter;
      updateWrap();
    }else{
      const clamped=clamp(nextCenter,minC,maxC);
      if(clamped!==nextCenter){
        centerX=clamped;
        stopWalkAt(centerX);
        return;
      }
      centerX=clamped;
    }
    render(wrapper,centerX,centerY);
    if(targetX!=null){
      const reached=(direction===1 && centerX>=targetX)||(direction===-1 && centerX<=targetX);
      if(reached){
        stopWalkAt(targetX);
      }
    }
  }

  function mainLoop(t){
    if(lastTime==null)lastTime=t;
    const dt=Math.min(0.05,(t-lastTime)/1000);
    lastTime=t;
    adjustScale();
    if(centerX==null || centerY==null){
      updateSpriteSize();
      centerX=iround(randBetween(spriteW/2,Math.max(spriteW/2,window.innerWidth-spriteW/2)));
      centerY=iround(window.innerHeight-spriteH/2);
      render(wrapper,centerX,centerY);
    }
    if(state==='sit'||state==='idle'){
      ensureOnFloor();
    }else if(state==='walk'){
      handleWalk(dt);
    }else if(state==='drag'){
      updateSpriteSize();
    }else if(state==='fall'){
      handleFall(dt);
    }else if(state==='throw'){
      handleThrow(dt);
    }
    requestAnimationFrame(mainLoop);
  }

  function onPointerDown(e){
    if(e.pointerType==='mouse' && e.button!==0)return;
    const rect=wrapper.getBoundingClientRect();
    const px=e.clientX;
    const py=e.clientY;
    if(px<rect.left||px>rect.right||py<rect.top||py>rect.bottom)return;
    e.preventDefault();
    enterDrag(px,py,e.pointerId);
    wrapper.addEventListener('pointermove',onPointerMove);
    wrapper.addEventListener('pointerup',onPointerUp);
    wrapper.addEventListener('pointercancel',onPointerUp);
  }

  function onPointerMove(e){
    if(dragPointerId!==e.pointerId)return;
    e.preventDefault();
    updateDrag(e.clientX,e.clientY);
  }

  function onPointerUp(e){
    if(dragPointerId!==e.pointerId)return;
    e.preventDefault();
    wrapper.removeEventListener('pointermove',onPointerMove);
    wrapper.removeEventListener('pointerup',onPointerUp);
    wrapper.removeEventListener('pointercancel',onPointerUp);
    endDrag();
  }

  function startAfterMeasured(){
    wrapper.style.visibility='visible';
    updateSpriteSize();
    centerX=iround(randBetween(spriteW/2,Math.max(spriteW/2,window.innerWidth-spriteW/2)));
    centerY=iround(window.innerHeight-spriteH/2);
    render(wrapper,centerX,centerY);
    if(chance(1/5))enterSit(randBetween(SIT_MIN,SIT_MAX));
    else enterIdle();
    wrapper.addEventListener('pointerdown',onPointerDown);
    requestAnimationFrame(mainLoop);
  }

  function initAfterPreload(){
    document.body.appendChild(wrapper);
    adjustScale();
    updateSpriteSize();
    requestAnimationFrame(()=>{updateSpriteSize();startAfterMeasured();});
  }

  let remaining=preloadImgs.length;
  preloadImgs.forEach(i=>{
    if(i.complete && (i.naturalWidth||i.width))remaining--;
    else{
      i.addEventListener('load',()=>{remaining--;if(remaining===0)initAfterPreload();},{once:true,passive:true});
      i.addEventListener('error',()=>{remaining--;if(remaining===0)initAfterPreload();},{once:true,passive:true});
    }
  });
  if(remaining===0)initAfterPreload();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadTinyChancy);
else loadTinyChancy();
})();
