const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const lerp=(a,b,t)=>a+(b-a)*t;
const smoothstep=(a,b,value)=>{const t=clamp((value-a)/(b-a));return t*t*(3-2*t)};
const easeOutCubic=t=>1-Math.pow(1-clamp(t),3);
const easeInOutCubic=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const TAU=Math.PI*2;

export class IntroSequence{
 constructor({overlay,canvas,caption,eyebrow,skipButton,app}){
  this.overlay=overlay;
  this.canvas=canvas;
  this.ctx=canvas.getContext('2d');
  this.caption=caption;
  this.eyebrow=eyebrow;
  this.skipButton=skipButton;
  this.app=app;
  this.active=false;
  this.width=innerWidth;
  this.height=innerHeight;
  this.dpr=1;
  this.lastCaption='';
  this.skipStartedAt=0;
  this.revealStarted=false;
  this.beforeReveal=null;
  this.resolvePlay=null;
  this._frame=this._frame.bind(this);
  this._resize=this._resize.bind(this);
  this._requestSkip=this._requestSkip.bind(this);
  this._keyDown=this._keyDown.bind(this);
  addEventListener('resize',this._resize,{passive:true});
  this._resize();
 }

 play({beforeReveal}={}){
  if(this.active)return Promise.resolve();
  this.active=true;
  this.beforeReveal=beforeReveal;
  this.revealStarted=false;
  this.skipStartedAt=0;
  this.startedAt=performance.now();
  this.lastCaption='';
  this.overlay.style.opacity='1';
  this.overlay.classList.add('visible');
  this.overlay.setAttribute('aria-hidden','false');
  this.app.classList.add('intro-playing');
  this.skipButton.addEventListener('click',this._requestSkip);
  addEventListener('keydown',this._keyDown);
  this._resize();
  requestAnimationFrame(this._frame);
  return new Promise(resolve=>{this.resolvePlay=resolve});
 }

 _keyDown(event){
  if(['Escape','Enter','Space'].includes(event.code)){
   event.preventDefault();
   this._requestSkip();
  }
 }

 _requestSkip(){
  if(!this.active||this.skipStartedAt)return;
  this.skipStartedAt=performance.now();
  this._beginReveal();
 }

 _beginReveal(){
  if(this.revealStarted)return;
  this.revealStarted=true;
  try{this.beforeReveal?.()}catch(error){console.error('Falha ao iniciar o jogo sob a intro:',error)}
 }

 _resize(){
  const rect=this.canvas.getBoundingClientRect();
  this.width=Math.max(1,rect.width||innerWidth);
  this.height=Math.max(1,rect.height||innerHeight);
  this.dpr=Math.min(devicePixelRatio||1,2);
  this.canvas.width=Math.round(this.width*this.dpr);
  this.canvas.height=Math.round(this.height*this.dpr);
  this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
 }

 _frame(now){
  if(!this.active)return;
  const elapsed=(now-this.startedAt)/1000;
  const cinematicTime=Math.min(elapsed,6.15);
  this._draw(cinematicTime);

  if(this.skipStartedAt){
   const fade=clamp((now-this.skipStartedAt)/360);
   this.overlay.style.opacity=String(1-easeOutCubic(fade));
   if(fade>=1){this._finish();return}
  }else{
   if(elapsed>=5.95)this._beginReveal();
   if(elapsed>=5.95){
    const fade=smoothstep(5.95,6.75,elapsed);
    this.overlay.style.opacity=String(1-fade);
   }
   if(elapsed>=6.75){this._finish();return}
  }
  requestAnimationFrame(this._frame);
 }

 _finish(){
  this._beginReveal();
  this.active=false;
  this.overlay.classList.remove('visible');
  this.overlay.setAttribute('aria-hidden','true');
  this.overlay.style.opacity='';
  this.app.classList.remove('intro-playing');
  this.skipButton.removeEventListener('click',this._requestSkip);
  removeEventListener('keydown',this._keyDown);
  const resolve=this.resolvePlay;
  this.resolvePlay=null;
  resolve?.();
 }

 _draw(time){
  const c=this.ctx,w=this.width,h=this.height;
  c.setTransform(this.dpr,0,0,this.dpr,0,0);
  c.clearRect(0,0,w,h);

  const germination=smoothstep(.72,3.08,time);
  const zoomProgress=smoothstep(3.12,4.48,time);
  const rotationProgress=smoothstep(4.42,5.78,time);
  const rootLength=lerp(5,h*.39,easeOutCubic(germination));
  const scene=this._sceneGeometry(rootLength);
  const zoom=lerp(1,4.75,easeInOutCubic(zoomProgress));
  const rotation=Math.PI*easeInOutCubic(rotationProgress);
  const focusX=lerp(w*.5,scene.tipX,easeInOutCubic(zoomProgress));
  const focusY=lerp(h*.48,scene.tipY,easeInOutCubic(zoomProgress));
  const anchorY=lerp(h*.5,h*.70,easeInOutCubic(rotationProgress));

  c.save();
  c.translate(w*.5,anchorY);
  c.scale(zoom,zoom);
  c.rotate(rotation);
  c.translate(-focusX,-focusY);
  this._drawWorld(c,time,germination,scene);
  c.restore();

  this._drawCinematicOverlay(c,time,zoomProgress,rotationProgress);
  this._updateCaption(time);
 }

 _sceneGeometry(rootLength){
  const w=this.width,h=this.height;
  const seedX=w*.5,seedY=h*.33;
  const startX=seedX-3,startY=seedY+18;
  const tipX=seedX+Math.sin(rootLength*.016)*Math.min(22,w*.04);
  const tipY=startY+rootLength;
  return{seedX,seedY,startX,startY,tipX,tipY,rootLength};
 }

 _drawWorld(c,time,germination,scene){
  const w=this.width,h=this.height;
  const surfaceY=h*.19;
  const sky=c.createLinearGradient(0,0,0,surfaceY+25);
  sky.addColorStop(0,'#071714');
  sky.addColorStop(1,'#163527');
  c.fillStyle=sky;c.fillRect(-w,-h,w*3,surfaceY+h);

  const soil=c.createLinearGradient(0,surfaceY,0,h*1.08);
  soil.addColorStop(0,'#4a3522');
  soil.addColorStop(.22,'#2e241b');
  soil.addColorStop(.58,'#1c1914');
  soil.addColorStop(1,'#0c1410');
  c.fillStyle=soil;c.fillRect(-w,surfaceY,w*3,h*1.4);

  this._drawSoilSurface(c,surfaceY,w);
  this._drawStrata(c,surfaceY,w,h,time);
  this._drawSoilDetails(c,surfaceY,w,h,time);
  this._drawSeed(c,time,germination,scene);
  this._drawRoot(c,time,germination,scene);
  this._drawTipMicroenvironment(c,time,germination,scene);
 }

 _drawSoilSurface(c,y,w){
  c.fillStyle='rgba(141,105,63,.52)';
  c.beginPath();c.moveTo(-w,y+5);
  for(let x=-w;x<=w*2;x+=28)c.lineTo(x,y+Math.sin(x*.031)*5+Math.sin(x*.093)*2);
  c.lineTo(w*2,y+20);c.lineTo(-w,y+20);c.closePath();c.fill();
  c.strokeStyle='rgba(220,186,125,.18)';c.lineWidth=1.4;c.stroke();
 }

 _drawStrata(c,surfaceY,w,h,time){
  const bands=[
   {y:surfaceY+h*.15,color:'rgba(121,84,47,.13)',width:17,amp:12},
   {y:surfaceY+h*.35,color:'rgba(156,116,67,.08)',width:24,amp:17},
   {y:surfaceY+h*.59,color:'rgba(92,119,91,.065)',width:31,amp:21},
   {y:surfaceY+h*.79,color:'rgba(171,141,90,.045)',width:35,amp:25}
  ];
  for(let index=0;index<bands.length;index++){
   const band=bands[index];
   c.strokeStyle=band.color;c.lineWidth=band.width;c.lineCap='round';
   c.beginPath();
   for(let x=-w;x<=w*2;x+=24){
    const y=band.y+Math.sin(x*.012+index*1.7)*band.amp+Math.sin(x*.031-time*.05)*4;
    x===-w?c.moveTo(x,y):c.lineTo(x,y);
   }
   c.stroke();
  }
 }

 _drawSoilDetails(c,surfaceY,w,h,time){
  for(let i=0;i<125;i++){
   const rx=this._hash(i*13.17),ry=this._hash(i*29.61+7),r=this._hash(i*9.31+3);
   const x=-w*.1+rx*w*1.2,y=surfaceY+18+ry*(h-surfaceY+80);
   const mineral=i%11===0,organic=i%7===0;
   c.fillStyle=mineral?'rgba(255,207,112,.20)':organic?'rgba(111,169,119,.12)':'rgba(221,196,151,.075)';
   c.beginPath();c.ellipse(x,y,1.4+r*4.5,.9+r*2.3,r*TAU,0,TAU);c.fill();
  }
  for(let i=0;i<16;i++){
   const x=this._hash(i*41.4+2)*w,y=surfaceY+40+this._hash(i*18.8+11)*(h-surfaceY);
   c.strokeStyle='rgba(175,151,113,.075)';c.lineWidth=.7+this._hash(i)*1.1;c.beginPath();c.moveTo(x,y);
   c.bezierCurveTo(x-22,y+34,x+24,y+65,x-9,y+115);c.stroke();
  }
  c.fillStyle=`rgba(140,225,178,${.018+.008*Math.sin(time*.7)})`;c.fillRect(-w,surfaceY,w*3,h);
 }

 _drawSeed(c,time,germination,scene){
  const split=easeOutCubic(smoothstep(1.12,2.55,time));
  const swell=smoothstep(.3,1.18,time);
  const pulse=1+Math.sin(time*3.2)*.012*swell;
  const x=scene.seedX,y=scene.seedY;
  c.save();c.translate(x,y);c.rotate(-.13);c.scale(pulse,pulse);

  c.shadowBlur=18;c.shadowColor='rgba(255,186,95,.22)';
  const seedGradient=c.createRadialGradient(-12,-9,3,0,0,39);
  seedGradient.addColorStop(0,'#d9a45c');
  seedGradient.addColorStop(.48,'#ad6f37');
  seedGradient.addColorStop(1,'#633c22');
  c.fillStyle=seedGradient;
  c.beginPath();
  c.moveTo(-33+split*2,-1);
  c.bezierCurveTo(-29,-23,-5,-27,12,-20-split*2);
  c.bezierCurveTo(34,-13,35,11,17,22+split*2);
  c.bezierCurveTo(-3,31,-29,20,-33+split*2,-1);
  c.closePath();c.fill();
  c.shadowBlur=0;

  c.strokeStyle='rgba(255,226,178,.34)';c.lineWidth=1.4;
  c.beginPath();c.moveTo(-20,-14);c.bezierCurveTo(-3,-7,2,7,17,14);c.stroke();

  if(split>0){
   c.strokeStyle=`rgba(67,37,21,${.45+split*.45})`;c.lineWidth=1.7;
   c.beginPath();c.moveTo(3,-18);c.lineTo(1,-8);c.lineTo(7,-1);c.lineTo(2,8);c.lineTo(8,18);c.stroke();
   c.fillStyle=`rgba(244,217,166,${split*.82})`;
   c.beginPath();c.ellipse(5,0,3+split*4,13*split,.15,0,TAU);c.fill();
  }

  const hilumAlpha=.45+.2*Math.sin(time*2);
  c.fillStyle=`rgba(245,218,170,${hilumAlpha})`;c.beginPath();c.ellipse(-25,4,5,2.2,-.35,0,TAU);c.fill();
  c.restore();

  if(germination>.32){
   const shoot=smoothstep(1.85,3.05,time);
   c.strokeStyle='rgba(154,205,116,.70)';c.lineWidth=4;c.lineCap='round';
   c.beginPath();c.moveTo(x-3,y-14);c.quadraticCurveTo(x-12,y-29-shoot*12,x-4,y-42*shoot);c.stroke();
   if(shoot>.65){
    c.fillStyle=`rgba(133,199,101,${(shoot-.65)/.35})`;
    c.beginPath();c.ellipse(x-10,y-41*shoot,9,4,-.55,0,TAU);c.fill();
   }
  }
 }

 _rootPath(c,scene){
  const bend=Math.min(34,this.width*.06);
  c.beginPath();
  c.moveTo(scene.startX,scene.startY);
  c.bezierCurveTo(
   scene.startX-bend*.55,scene.startY+scene.rootLength*.23,
   scene.tipX+bend,scene.startY+scene.rootLength*.63,
   scene.tipX,scene.tipY
  );
 }

 _drawRoot(c,time,germination,scene){
  if(germination<=.015)return;
  c.save();c.lineCap='round';c.lineJoin='round';
  c.strokeStyle='rgba(73,49,29,.78)';c.lineWidth=12;this._rootPath(c,scene);c.stroke();
  const rootGradient=c.createLinearGradient(scene.startX,scene.startY,scene.tipX,scene.tipY);
  rootGradient.addColorStop(0,'#d8bc86');rootGradient.addColorStop(.62,'#ead7ab');rootGradient.addColorStop(1,'#f4e7c6');
  c.strokeStyle=rootGradient;c.lineWidth=8;this._rootPath(c,scene);c.stroke();
  c.strokeStyle='rgba(255,249,220,.34)';c.lineWidth=1.6;this._rootPath(c,scene);c.stroke();

  const hairStart=smoothstep(1.5,2.75,time);
  if(hairStart>0){
   for(let i=0;i<23;i++){
    const u=.10+i/28;
    if(u>.72*germination)continue;
    const point=this._rootPoint(scene,u),tangent=this._rootTangent(scene,u),side=i%2?-1:1;
    const normal={x:-tangent.y,y:tangent.x};
    const length=(5+(i%5)*1.8)*hairStart;
    c.strokeStyle=`rgba(228,217,184,${.12+hairStart*.23})`;c.lineWidth=.65;
    c.beginPath();c.moveTo(point.x,point.y);
    c.quadraticCurveTo(point.x+normal.x*length*.55*side+tangent.x*3,point.y+normal.y*length*.55*side+tangent.y*3,point.x+normal.x*length*side,point.y+normal.y*length*side);c.stroke();
   }
  }
  c.restore();

  const tangent=this._rootTangent(scene,1),angle=Math.atan2(tangent.y,tangent.x);
  c.save();c.translate(scene.tipX,scene.tipY);c.rotate(angle-Math.PI/2);
  c.shadowBlur=13;c.shadowColor='rgba(244,231,198,.48)';
  const cap=c.createLinearGradient(0,-12,0,12);cap.addColorStop(0,'#f6ebcf');cap.addColorStop(1,'#b9915e');
  c.fillStyle=cap;c.beginPath();c.moveTo(-5,-10);c.quadraticCurveTo(0,-16,5,-10);c.lineTo(6,5);c.quadraticCurveTo(0,12,-6,5);c.closePath();c.fill();
  c.shadowBlur=0;c.strokeStyle='rgba(255,250,226,.42)';c.lineWidth=1;c.stroke();c.restore();
 }

 _rootPoint(scene,u){
  const p0={x:scene.startX,y:scene.startY};
  const bend=Math.min(34,this.width*.06);
  const p1={x:scene.startX-bend*.55,y:scene.startY+scene.rootLength*.23};
  const p2={x:scene.tipX+bend,y:scene.startY+scene.rootLength*.63};
  const p3={x:scene.tipX,y:scene.tipY};
  const m=1-u;
  return{x:m*m*m*p0.x+3*m*m*u*p1.x+3*m*u*u*p2.x+u*u*u*p3.x,y:m*m*m*p0.y+3*m*m*u*p1.y+3*m*u*u*p2.y+u*u*u*p3.y};
 }

 _rootTangent(scene,u){
  const p0={x:scene.startX,y:scene.startY};
  const bend=Math.min(34,this.width*.06);
  const p1={x:scene.startX-bend*.55,y:scene.startY+scene.rootLength*.23};
  const p2={x:scene.tipX+bend,y:scene.startY+scene.rootLength*.63};
  const p3={x:scene.tipX,y:scene.tipY};
  const m=1-u;
  const x=3*m*m*(p1.x-p0.x)+6*m*u*(p2.x-p1.x)+3*u*u*(p3.x-p2.x);
  const y=3*m*m*(p1.y-p0.y)+6*m*u*(p2.y-p1.y)+3*u*u*(p3.y-p2.y);
  const d=Math.max(1e-5,Math.hypot(x,y));return{x:x/d,y:y/d};
 }

 _drawTipMicroenvironment(c,time,germination,scene){
  const activation=smoothstep(3.55,5.7,time)*germination;
  if(activation<=0)return;
  c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<22;i++){
   const phase=i*2.399,timePhase=time*(.55+(i%4)*.08),radius=8+(i%6)*3.5+activation*8;
   const x=scene.tipX+Math.cos(phase+timePhase)*radius;
   const y=scene.tipY+Math.sin(phase+timePhase)*radius*.76;
   const color=i%3===0?'127,210,255':i%3===1?'134,239,173':'213,180,255';
   const alpha=activation*(.10+(i%5)*.018);
   c.fillStyle=`rgba(${color},${alpha})`;c.beginPath();c.arc(x,y,1+(i%3)*.45,0,TAU);c.fill();
  }
  const halo=c.createRadialGradient(scene.tipX,scene.tipY,0,scene.tipX,scene.tipY,42);
  halo.addColorStop(0,`rgba(239,255,246,${activation*.12})`);halo.addColorStop(.45,`rgba(134,239,173,${activation*.055})`);halo.addColorStop(1,'rgba(134,239,173,0)');
  c.fillStyle=halo;c.beginPath();c.arc(scene.tipX,scene.tipY,42,0,TAU);c.fill();c.restore();
 }

 _drawCinematicOverlay(c,time,zoomProgress,rotationProgress){
  const w=this.width,h=this.height;
  const vignette=c.createRadialGradient(w*.5,h*.5,Math.min(w,h)*.18,w*.5,h*.5,Math.max(w,h)*.72);
  vignette.addColorStop(.5,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,8,5,.72)');
  c.fillStyle=vignette;c.fillRect(0,0,w,h);

  const bars=Math.max(0,1-smoothstep(3.3,4.5,time));
  if(bars>0){c.fillStyle=`rgba(1,8,5,${bars*.38})`;c.fillRect(0,0,w,h*.055);c.fillRect(0,h*.945,w,h*.055)}

  if(rotationProgress>.12){
   const a=smoothstep(.12,.75,rotationProgress)*(1-smoothstep(.82,1,rotationProgress));
   c.strokeStyle=`rgba(213,180,255,${a*.32})`;c.lineWidth=1.2;c.setLineDash([5,9]);
   c.beginPath();c.arc(w*.5,lerp(h*.5,h*.70,rotationProgress),Math.min(w,h)*.12,-Math.PI*.3,Math.PI*1.1);c.stroke();c.setLineDash([]);
  }

  const flash=smoothstep(5.52,5.82,time)*(1-smoothstep(5.82,6.12,time));
  if(flash>0){c.fillStyle=`rgba(220,255,236,${flash*.14})`;c.fillRect(0,0,w,h)}

  if(time<.65){const fade=1-smoothstep(0,.65,time);c.fillStyle=`rgba(0,7,5,${fade})`;c.fillRect(0,0,w,h)}
 }

 _updateCaption(time){
  let eyebrow='CICLO DO FEIJOEIRO',caption='Uma semente repousa no solo.';
  if(time>=.8){eyebrow='GERMINAÇÃO';caption='A radícula rompe o tegumento e cresce em direção à gravidade.'}
  if(time>=3.08){eyebrow='MERISTEMA RADICULAR';caption='A câmera se aproxima da ponta que explora a rizosfera.'}
  if(time>=4.42){eyebrow='ORIENTAÇÃO DE JOGO';caption='A perspectiva gira 180°: agora o crescimento segue para cima.'}
  if(time>=5.75){eyebrow='RIZOVETOR';caption='Assuma o controle da ponta radicular.'}
  const key=`${eyebrow}|${caption}`;
  if(key===this.lastCaption)return;
  this.lastCaption=key;
  this.eyebrow.textContent=eyebrow;
  this.caption.textContent=caption;
 }

 _hash(value){const x=Math.sin(value*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
}
