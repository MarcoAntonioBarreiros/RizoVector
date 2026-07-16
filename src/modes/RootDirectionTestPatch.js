import{CONFIG}from'../data/config.js';
import{InputManager}from'../core/InputManager.js';
import{Game}from'../core/Game.js';
import{PlayerShip}from'../entities/PlayerShip.js';
import{IntroSequence}from'../intro/IntroSequence.js';
import{EnhancedRenderer}from'../rendering/EnhancedRenderer.js';

const query=new URLSearchParams(location.search);
const ROOT_DOWN=query.get('rootDirection')==='down';

if(ROOT_DOWN){
 document.documentElement.dataset.rootDirection='down';

 const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
 const lerp=(a,b,t)=>a+(b-a)*t;
 const smoothstep=(a,b,value)=>{const t=clamp((value-a)/(b-a));return t*t*(3-2*t)};
 const easeOutCubic=t=>1-Math.pow(1-clamp(t),3);
 const easeInOutCubic=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

 /* Mantém seta, botão e gesto para baixo correspondendo ao movimento visual para baixo. */
 const axisY=Object.getOwnPropertyDescriptor(InputManager.prototype,'axisY');
 if(axisY?.get){
  Object.defineProperty(InputManager.prototype,'axisY',{
   configurable:true,
   get(){return-axisY.get.call(this)}
  });
 }

 /*
  * A física continua em suas coordenadas originais, mas a ponta passa a
  * ocupar a metade inferior depois do espelhamento vertical do mundo.
  */
 PlayerShip.prototype.update=function(dt,input,bounds,effects,status){
  const speed=CONFIG.player.speed*(status?.speedMultiplier||1);
  this.vx+=(input.axisX*speed-this.vx)*Math.min(1,dt*12);
  this.vy+=(input.axisY*speed-this.vy)*Math.min(1,dt*12);
  this.dashCooldown=Math.max(0,this.dashCooldown-dt);
  this.rootCooldown=Math.max(0,this.rootCooldown-dt);
  this.rootTrail=Math.max(0,this.rootTrail-dt);
  this.invulnerability=Math.max(0,this.invulnerability-dt);
  this.resistanceTimer=Math.max(0,this.resistanceTimer-dt);

  if(input.dashPressed&&this.modules.mycorrhiza&&this.dashCooldown<=0){
   this.dashTimer=CONFIG.player.dashDuration;
   this.dashCooldown=Math.max(.38,CONFIG.player.dashCooldown-(this.modules.mycorrhiza-1)*.14);
   this.invulnerability=Math.max(this.invulnerability,.42);
   effects.superDash(this.x+this.width/2,this.y+this.height/2);
  }
  if(input.rootPressed&&this.modules.azospirillum&&this.rootCooldown<=0){
   const dir=input.axisX<-.2?-1:input.axisX>.2?1:(this.x<bounds.width/2?1:-1);
   this.x+=dir*(145+this.modules.azospirillum*28);
   this.x=Math.max(14,Math.min(bounds.width-this.width-14,this.x));
   this.rootCooldown=Math.max(.34,.84-(this.modules.azospirillum-1)*.11);
   this.rootTrail=.48;
   this.invulnerability=Math.max(this.invulnerability,.32);
   effects.rootRibbon(this.x+this.width/2,this.y+this.height/2,dir);
  }
  if(this.dashTimer>0){this.dashTimer-=dt;this.vy=-CONFIG.player.dashSpeed}

  this.x+=this.vx*dt;
  this.y+=this.vy*dt;
  this.x=Math.max(14,Math.min(bounds.width-this.width-14,this.x));
  this.y=Math.max(14,Math.min(bounds.height*.57-this.height,this.y));

  if(this.biofilmTimer>0){
   this.biofilmTimer=Math.max(0,this.biofilmTimer-dt);
   const bacillus=this.modules.bacillus||0;
   this.shield=Math.max(0,Math.min(this.maxShield,this.shield+dt*(2.2+bacillus*.55)-dt*3.5));
  }else this.shield=Math.max(0,this.shield-dt*18);
 };

 /* Começa com a coifa na região inferior, deixando o corpo radicular acima. */
 const originalStart=Game.prototype.start;
 Game.prototype.start=function(){
  originalStart.call(this);
  this.player.y=Math.max(18,this.viewportHeight*.22);
  this.player.vy=0;
  this.rootGrowth.reset();
 };

 /* A aproximação ocorre sem a rotação de 180 graus. */
 IntroSequence.prototype._draw=function(time){
  const c=this.ctx,w=this.width,h=this.height;
  c.setTransform(this.dpr,0,0,this.dpr,0,0);
  c.clearRect(0,0,w,h);

  const germination=smoothstep(.72,3.08,time);
  const zoomProgress=smoothstep(3.12,4.48,time);
  const transitionProgress=smoothstep(4.42,5.78,time);
  const rootLength=lerp(5,h*.39,easeOutCubic(germination));
  const scene=this._sceneGeometry(rootLength);
  const zoom=lerp(1,4.75,easeInOutCubic(zoomProgress));
  const focusX=lerp(w*.5,scene.tipX,easeInOutCubic(zoomProgress));
  const focusY=lerp(h*.48,scene.tipY,easeInOutCubic(zoomProgress));
  const anchorY=lerp(h*.5,h*.72,easeInOutCubic(transitionProgress));

  c.save();
  c.translate(w*.5,anchorY);
  c.scale(zoom,zoom);
  c.translate(-focusX,-focusY);
  this._drawWorld(c,time,germination,scene);
  c.restore();

  // Passar zero remove também o arco gráfico que indicava a rotação.
  this._drawCinematicOverlay(c,time,zoomProgress,0);
  this._updateCaption(time);
 };

 /*
  * Espelha somente o mundo. HUD e controles permanecem normais. Os textos
  * desenhados no canvas recebem uma contra-inversão para continuarem legíveis.
  */
 EnhancedRenderer.prototype.render=function(){
  const c=this.ctx,g=this.game,screenWidth=this.width,screenHeight=this.height;
  c.setTransform(this.dpr,0,0,this.dpr,0,0);
  this.background(c);
  if(!g.segmentManager)return;

  c.save();
  c.translate(0,screenHeight);
  c.scale(1,-1);

  const scale=g.viewScale||1,anchorY=screenHeight*.74,cameraX=g.cameraX||0;
  c.translate(0,anchorY);
  c.scale(scale,scale);
  c.translate(-cameraX,-anchorY);
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
   g.flow?.render(c,this.width,screenHeight/scale+180);
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

 console.info('RizoVetor: modo de teste com crescimento radicular para baixo ativo.');
}
