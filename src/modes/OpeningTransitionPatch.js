import{Game}from'../core/Game.js';
import{IntroSequence}from'../intro/IntroSequence.js';
import{EnhancedRenderer}from'../rendering/EnhancedRenderer.js';

const query=new URLSearchParams(location.search);
const ROOT_DOWN=query.get('rootDirection')!=='up';

if(ROOT_DOWN){
 const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
 const lerp=(a,b,t)=>a+(b-a)*t;
 const smoothstep=(a,b,value)=>{const t=clamp((value-a)/(b-a));return t*t*(3-2*t)};
 const easeOutCubic=t=>1-Math.pow(1-clamp(t),3);
 const easeInOutCubic=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 const TAU=Math.PI*2;

 /*
  * O jogo começa no mesmo tipo de close da última frame da germinação.
  * A intro já está desaparecendo quando o Game.start é chamado, portanto
  * há uma pequena espera antes do afastamento para evitar um salto de escala.
  */
 const directionStart=Game.prototype.start;
 Game.prototype.start=function(){
  directionStart.call(this);
  this.openingCamera={
   elapsed:0,
   hold:.92,
   duration:1.55,
   startScale:this.mobilePortrait?1.72:1.86
  };
 };

 const directionUpdate=Game.prototype.update;
 Game.prototype.update=function(dt){
  directionUpdate.call(this,dt);
  if(this.openingCamera)this.openingCamera.elapsed+=dt;
 };

 /*
  * Mantém a composição da frame aprovada, mas reduz discretamente o close
  * final para aproximá-lo da escala inicial do gameplay.
  */
 IntroSequence.prototype._draw=function(time){
  const c=this.ctx,w=this.width,h=this.height;
  c.setTransform(this.dpr,0,0,this.dpr,0,0);
  c.clearRect(0,0,w,h);

  const germination=smoothstep(.72,3.08,time);
  const zoomProgress=smoothstep(3.12,4.48,time);
  const transitionProgress=smoothstep(4.42,5.78,time);
  const rootLength=lerp(5,h*.39,easeOutCubic(germination));
  const scene=this._sceneGeometry(rootLength);
  const zoom=lerp(1,4.32,easeInOutCubic(zoomProgress));
  const focusX=lerp(w*.5,scene.tipX,easeInOutCubic(zoomProgress));
  const focusY=lerp(h*.48,scene.tipY-8,easeInOutCubic(zoomProgress));
  const anchorY=lerp(h*.5,h*.69,easeInOutCubic(transitionProgress));

  c.save();
  c.translate(w*.5,anchorY);
  c.scale(zoom,zoom);
  c.translate(-focusX,-focusY);
  this._drawWorld(c,time,germination,scene);
  c.restore();

  this._drawCinematicOverlay(c,time,zoomProgress,0);
  this._updateCaption(time);
 };

 EnhancedRenderer.prototype._openingScale=function(){
  const opening=this.game.openingCamera;
  if(!opening)return 1;
  if(opening.elapsed<=opening.hold)return opening.startScale;
  const t=clamp((opening.elapsed-opening.hold)/opening.duration);
  if(t>=1){this.game.openingCamera=null;return 1}
  return lerp(opening.startScale,1,easeInOutCubic(t));
 };

 EnhancedRenderer.prototype._surfaceY=function(){
  return this.game.mobilePortrait
   ?Math.max(126,this.height*.205)
   :Math.max(112,this.height*.285);
 };

 EnhancedRenderer.prototype._surfaceAlpha=function(){
  const time=this.game.time||0;
  return 1-smoothstep(4.6,6.5,time);
 };

 EnhancedRenderer.prototype._rootOriginScreenX=function(baseScale,openingScale){
  const g=this.game,p=g.player;
  const points=g.rootGrowth?.points||[];
  let anchor=null;
  for(const point of points)if(!anchor||point.y>anchor.y)anchor=point;
  const anchorX=anchor?.x??(p.x+p.width/2);
  const focusX=p.x+p.width/2;
  const zoomedX=focusX+(anchorX-focusX)*openingScale;
  return baseScale*(zoomedX-(g.cameraX||0));
 };

 EnhancedRenderer.prototype._drawSurfaceAndShoot=function(c,baseScale,openingScale){
  const alpha=this._surfaceAlpha();
  if(alpha<=.005)return;

  const w=this.width,h=this.height,surfaceY=this._surfaceY();
  const x=this._rootOriginScreenX(baseScale,openingScale);
  const sway=Math.sin((this.game.time||0)*1.55)*2.5;

  c.save();
  c.globalAlpha=alpha;

  const sky=c.createLinearGradient(0,0,0,surfaceY+12);
  sky.addColorStop(0,'rgba(6,20,17,.99)');
  sky.addColorStop(.68,'rgba(12,35,25,.98)');
  sky.addColorStop(1,'rgba(27,53,37,.94)');
  c.fillStyle=sky;
  c.fillRect(0,0,w,surfaceY+5);

  const surfacePath=()=>{
   c.beginPath();
   c.moveTo(-20,surfaceY);
   for(let px=-20;px<=w+30;px+=24){
    const py=surfaceY+Math.sin(px*.027)*4+Math.sin(px*.081)*1.6;
    c.lineTo(px,py);
   }
  };

  const topsoil=c.createLinearGradient(0,surfaceY-4,0,surfaceY+45);
  topsoil.addColorStop(0,'rgba(111,77,43,.98)');
  topsoil.addColorStop(.45,'rgba(75,52,31,.98)');
  topsoil.addColorStop(1,'rgba(42,34,25,.12)');
  surfacePath();
  c.lineTo(w+30,surfaceY+48);
  c.lineTo(-20,surfaceY+48);
  c.closePath();
  c.fillStyle=topsoil;
  c.fill();

  surfacePath();
  c.strokeStyle='rgba(231,201,147,.32)';
  c.lineWidth=2;
  c.stroke();

  for(let i=0;i<30;i++){
   const px=(i*83.17)%w;
   const py=surfaceY+7+(i*17.31)%31;
   c.fillStyle=i%5===0?'rgba(214,170,95,.24)':'rgba(173,145,103,.13)';
   c.beginPath();
   c.ellipse(px,py,1.3+(i%4),.8+(i%3)*.5,(i*.7)%TAU,0,TAU);
   c.fill();
  }

  c.lineCap='round';
  c.lineJoin='round';

  const collar=c.createLinearGradient(x,surfaceY+38,x,surfaceY-5);
  collar.addColorStop(0,'rgba(225,211,176,.98)');
  collar.addColorStop(.48,'rgba(199,198,139,.98)');
  collar.addColorStop(1,'rgba(113,171,88,.98)');
  c.strokeStyle=collar;
  c.lineWidth=8.5;
  c.beginPath();
  c.moveTo(x,surfaceY+42);
  c.bezierCurveTo(x-2,surfaceY+24,x+1,surfaceY+8,x+sway*.12,surfaceY-12);
  c.stroke();

  const stem=c.createLinearGradient(x,surfaceY-4,x,surfaceY-132);
  stem.addColorStop(0,'#79ad60');
  stem.addColorStop(1,'#9bd875');
  c.strokeStyle=stem;
  c.lineWidth=6.2;
  c.beginPath();
  c.moveTo(x+sway*.12,surfaceY-8);
  c.bezierCurveTo(x-3,surfaceY-42,x+4+sway*.35,surfaceY-82,x+sway,surfaceY-130);
  c.stroke();

  const cotY=surfaceY-66;
  const cot=c.createRadialGradient(x-8,cotY-3,2,x,cotY,30);
  cot.addColorStop(0,'#dda961');
  cot.addColorStop(.56,'#a96734');
  cot.addColorStop(1,'#63391d');
  c.fillStyle=cot;
  c.save();c.translate(x-17+sway*.2,cotY);c.rotate(-.24);c.beginPath();c.ellipse(0,0,22,10.5,0,0,TAU);c.fill();c.restore();
  c.save();c.translate(x+17+sway*.2,cotY);c.rotate(.24);c.beginPath();c.ellipse(0,0,22,10.5,0,0,TAU);c.fill();c.restore();

  const leaf=(side,y,scale)=>{
   const baseX=x+sway;
   const tipX=baseX+side*(33+9*scale);
   c.fillStyle=side<0?'#79bd5e':'#8dcc6b';
   c.beginPath();
   c.moveTo(baseX,y);
   c.bezierCurveTo(baseX+side*14,y-14*scale,tipX-side*7,y-12*scale,tipX,y);
   c.bezierCurveTo(tipX-side*9,y+14*scale,baseX+side*10,y+13*scale,baseX,y);
   c.closePath();
   c.fill();
   c.strokeStyle='rgba(229,250,204,.27)';
   c.lineWidth=1;
   c.beginPath();c.moveTo(baseX,y);c.lineTo(tipX,y);c.stroke();
  };

  leaf(-1,surfaceY-116,1);
  leaf(1,surfaceY-101,.88);
  c.fillStyle='#b8df87';
  c.beginPath();
  c.ellipse(x+sway,surfaceY-135,6.5,10.5,0,0,TAU);
  c.fill();

  c.restore();
 };

 EnhancedRenderer.prototype.render=function(){
  const c=this.ctx,g=this.game,screenWidth=this.width,screenHeight=this.height;
  c.setTransform(this.dpr,0,0,this.dpr,0,0);
  this.background(c);
  if(!g.segmentManager)return;

  const baseScale=g.viewScale||1;
  const openingScale=this._openingScale();
  const anchorY=screenHeight*.74;
  const cameraX=g.cameraX||0;
  const focusX=g.player.x+g.player.width/2;
  const focusY=g.player.y+g.player.height/2;

  c.save();
  c.translate(0,screenHeight);
  c.scale(1,-1);
  c.translate(0,anchorY);
  c.scale(baseScale,baseScale);
  c.translate(-cameraX,-anchorY);

  if(openingScale>1.0001){
   c.translate(focusX,focusY);
   c.scale(openingScale,openingScale);
   c.translate(-focusX,-focusY);
  }

  const shake=g.shake||0;
  if(shake)c.translate((Math.random()*2-1)*shake,(Math.random()*2-1)*shake);

  const nativeFillText=c.fillText;
  c.fillText=function(text,x,y,maxWidth){
   c.save();
   c.translate(x,y);
   c.scale(1,-1);
   if(maxWidth===undefined)nativeFillText.call(c,text,0,0);
   else nativeFillText.call(c,text,0,0,maxWidth);
   c.restore();
  };

  const originalWidth=this.width;
  this.width=g.worldWidth||screenWidth;
  try{
   for(const segment of g.segmentManager.segments)this.segment(c,segment);
   g.flow?.render(c,this.width,screenHeight/(baseScale*openingScale)+180);
   this.rootBody(c);
   g.channels.forEachActive(item=>this.channel(c,item));
   g.barriers.forEachActive(item=>this.fungalBarrier(c,item));
   g.obstacles.forEachActive(item=>this.obstacle(c,item));
   g.pickups.forEachActive(item=>this.pickup(c,item));
   g.enemies.forEachActive(item=>this.enemy(c,item));
   g.enemyProjectiles.forEachActive(item=>this.enemyProjectile(c,item));
   g.projectiles.forEachActive(item=>this.projectile(c,item));
   this.player(c,g.player);
   g.particles.forEachActive(item=>this.particle(c,item));
  }finally{
   this.width=originalWidth;
   c.fillText=nativeFillText;
  }
  c.restore();

  this._drawSurfaceAndShoot(c,baseScale,openingScale);

  if(g.screenFlash>0){c.fillStyle=`rgba(213,180,255,${g.screenFlash*.48})`;c.fillRect(0,0,screenWidth,screenHeight)}
  if(g.hitFlash>0){
   const hit=c.createRadialGradient(screenWidth/2,screenHeight/2,screenHeight*.25,screenWidth/2,screenHeight/2,Math.max(screenWidth,screenHeight)*.72);
   hit.addColorStop(.55,'#0000');
   hit.addColorStop(1,`rgba(255,60,82,${g.hitFlash*.38})`);
   c.fillStyle=hit;c.fillRect(0,0,screenWidth,screenHeight);
  }
  const vignette=c.createRadialGradient(screenWidth/2,screenHeight/2,screenHeight*.16,screenWidth/2,screenHeight/2,Math.max(screenWidth,screenHeight)*.75);
  vignette.addColorStop(.55,'#0000');
  vignette.addColorStop(1,'#000c');
  c.fillStyle=vignette;c.fillRect(0,0,screenWidth,screenHeight);
 };
}
