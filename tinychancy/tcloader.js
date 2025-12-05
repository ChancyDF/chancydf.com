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

// PATCHED: fallback min width/height on load
function currentWidth(elRef){ 
  const r = elRef.getBoundingClientRect(); 
  if(r && r.width && r.width > 20) return r.width;
  if(preloadPaths[0] && preloadPaths[0].width && preloadPaths[0].width > 20) return preloadPaths[0].width;
  return 50;
}
function currentHeight(elRef){ 
  const r = elRef.getBoundingClientRect(); 
  if(r && r.height && r.height > 20) return r.height;
  if(preloadPaths[0] && preloadPaths[0].height && preloadPaths[0].height > 20) return preloadPaths[0].height;
  return 50;
}

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

  // ... (rest of unchanged code) ...

  function initAfterPreload(){
    document.body.appendChild(wrapper);
    wrapper.style.visibility = 'visible';
    applyTransformToRef(wrapper);
    adjustScaleForScreen();
    // PATCHED: fallback min width/height on initial position
    let w = currentWidth(wrapper);
    if(!w || w < 20) w = 50;
    const minC = w/2; const maxC = Math.max(minC, window.innerWidth - w/2);
    centerX = randBetween(minC, maxC);

    let h = currentHeight(wrapper);
    if(!h || h < 20) h = 50;
    centerY = window.innerHeight - h/2;

    if(chance(1/5)){
      startSitting(randBetween(SIT_MIN, SIT_MAX));
    } else {
      startIdleState();
    }
    setTimeout(()=>{ requestAnimationFrame(rafLoop) }, 50);
    wrapper.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', ()=>{ adjustScaleForScreen(); let w=currentWidth(wrapper); if(!w||w<20) w=50; let minC=w/2; let maxC=Math.max(minC,window.innerWidth-w/2); if(centerX!==null) centerX=clamp(centerX,minC,maxC); let h=currentHeight(wrapper); if(!h||h<20) h=50; centerY=clamp(centerY,h/2,window.innerHeight-h/2); renderWrapperFromCenter(centerX,centerY,wrapper); });
  }

  // ... (rest of unchanged code) ...
  // (No change required for the rest of the logic!)

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
