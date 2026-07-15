import{createParticle,mixedPreset,PARTICLE_EFFECTS,PARTICLE_EFFECT_NAMES}from'../effects/ParticleLibrary.js';
const TAU=Math.PI*2;
export class EffectsSystem{
 constructor(game){this.game=game;this.activeCount=0;this.lab=new URLSearchParams(location.search).get('particlelab')==='1';this.labTimer=.45;this.labIndex=0}
 loadScale(priority='normal'){
  const n=this.activeCount;if(priority==='critical')return n<1050?1:n<1200?.78:.48;if(priority==='ambient')return n<420?1:n<650?.58:n<850?.28:.08;return n<520?1:n<760?.78:n<980?.52:.24
 }
 emit(preset,x,y,color,count,options={}){
  const scale=this.loadScale(options.priority||'normal'),total=Math.max(1,Math.round(count*scale));for(let i=0;i<total;i++){const name=preset==='mixed'?mixedPreset():preset,p=createParticle(name,x,y,color,options),speed=options.speedScale||1,size=options.sizeScale||1,life=options.lifeScale||1;p.vx*=speed;p.vy*=speed;p.radius*=size;p.length*=size;p.width*=size;p.life*=life;p.maxLife*=life;if(!this.game.particles.acquire(p))break}
 }
 recipe(name,x,y,color='#86efad'){const r=PARTICLE_EFFECTS[name];if(!r)return;this.emit(r.preset,x,y,color,r.count,{priority:'critical',speedScale:1.12,palette:[color,'#effff6','#7fd2ff','#d5b4ff','#ffd173']})}
 burst(x,y,color,count=18,speed=170){this.emit('mixed',x,y,color,Math.round(count*1.28),{priority:'normal',speedScale:.82+speed/360,palette:[color,color,'#effff6'],originSpread:7})}
 smoke(x,y,color,count=4){this.emit('cloud',x,y,color,Math.round(count*1.2),{priority:'ambient',blend:null,alpha:.52,speedScale:.8,originSpread:16})}
 sporeCloud(x,y,color,count=10){this.emit('spore',x,y,color,Math.round(count*1.25),{priority:'normal',speedScale:1.15,originSpread:10})}
 tracer(x,y,tx,ty,color){this.game.particles.acquire({x,y,tx,ty,life:.2,maxLife:.2,radius:2,color,kind:'tracer',blend:'add',alpha:1,fadePower:1.5})}
 walkingTracer(x,y,tx,ty,color,width=2,life=.48){this.game.particles.acquire({x,y,tx,ty,life,maxLife:life,radius:width,color,kind:'walker',blend:'add',alpha:1,fadePower:1.45})}
 ring(x,y,color,maxRadius=180,duration=.45){this.game.particles.acquire({x,y,radius:4,maxRadius,life:duration,maxLife:duration,color,kind:'ring',blend:'add',alpha:1,fadePower:2})}
 text(x,y,text,color='#ffb7c2'){this.game.particles.acquire({x,y,vx:0,vy:-42,grav:0,life:.85,maxLife:.85,radius:0,color,kind:'text',blend:null,alpha:1,text,fadePower:1.2})}
 superDash(x,y){this.game.audio?.dash();this.ring(x,y,'#d5b4ff',145,.4);this.emit('mixed',x,y,'#d5b4ff',88,{priority:'critical',speedScale:1.35,spread:Math.PI*1.45,angle:Math.PI/2,palette:['#d5b4ff','#86efad','#7fd2ff','#effff6'],originSpread:12})}
 rootRibbon(x,y,dir){this.game.audio?.whoosh(x);this.ring(x,y,'#7fd2ff',100,.32);this.emit('filament',x-dir*25,y,'#7fd2ff',34,{priority:'critical',angle:dir>0?0:Math.PI,spread:1.05,speedScale:1.3,palette:['#7fd2ff','#86efad','#d5b4ff'],originSpread:18})}
 rootSpark(x,y,color='#7fd2ff'){this.emit('spark',x,y,color,1,{priority:'ambient',angle:-Math.PI/2,spread:1.1,speedScale:.7,originSpread:14})}
 resourceDrain(x,y,color){this.emit('filament',x,y,color,8,{priority:'normal',angle:Math.PI/2,spread:.9,speedScale:.55,blend:null,originSpread:20})}
 crystalDissolve(x,y){this.game.audio?.crystal(x);this.ring(x,y,'#ffd173',115,.58);this.emit('shatter',x,y,'#ffd173',54,{priority:'critical',speedScale:1.25,palette:['#ffd173','#ffe3a1','#fff8dc']});this.emit('spark',x,y,'#ffe3a1',24,{priority:'critical',speedScale:1.1});this.smoke(x,y,'#ffe3a1',7)}
 hyphaBreak(x,y){this.game.audio?.hypha(x);this.ring(x,y,'#8df0a8',78,.34);this.emit('filament',x,y,'#8df0a8',42,{priority:'critical',speedScale:1.18,palette:['#8df0a8','#d85d9d','#d5b4ff']});this.emit('bio',x,y,'#d85d9d',22,{priority:'normal',speedScale:.9});this.smoke(x,y,'#d85d9d',6)}
 enemyEmission(x,y,color,count=2){this.emit(Math.random()<.35?'filament':'bio',x,y,color,Math.max(1,Math.round(count*1.2)),{priority:'ambient',speedScale:.38,lifeScale:.72,originSpread:12,blend:Math.random()<.45?'add':null,alpha:.72})}
 updateLab(dt){if(!this.lab||!this.game.running)return;this.labTimer-=dt;if(this.labTimer>0)return;this.labTimer=1.35;const name=PARTICLE_EFFECT_NAMES[this.labIndex++%PARTICLE_EFFECT_NAMES.length],x=innerWidth*.5,y=innerHeight*.48;this.recipe(name,x,y,'#86efad');this.game.ui?.center(`PARTÍCULAS: ${name}`,1.05)}
 update(dt){this.updateLab(dt);let count=0;this.game.particles.forEachActive(p=>{
  p.life-=dt;if(p.life<=0){this.game.particles.release(p);return}count++;
  if(p.kind==='spore'){p.wob=(p.wob||0)+dt*(p.wobSpeed||2);p.x+=((p.vx||0)+Math.cos(p.wob)*14)*dt;p.y+=((p.vy||0)+Math.sin(p.wob*.7)*10)*dt}
  else if(p.kind==='smoke'){p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;const drag=Math.pow(p.drag||.982,dt*60);p.vx=(p.vx||0)*drag;p.vy=(p.vy||0)*drag}
  else if(p.kind==='particle'||p.kind==='text'){
   if(p.kind==='particle'&&p.turnRate){const a=p.turnRate*dt,cs=Math.cos(a),sn=Math.sin(a),vx=p.vx||0,vy=p.vy||0;p.vx=vx*cs-vy*sn;p.vy=vx*sn+vy*cs}p.spin=(p.spin||0)+(p.spinSpeed||0)*dt;p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;const drag=Math.pow(p.drag||.984,dt*60);p.vx=(p.vx||0)*drag;p.vy=((p.vy||0)+(p.grav||0)*dt)*drag
  }
  if(p.kind==='ring')p.radius+=(p.maxRadius-p.radius)*Math.min(1,dt*8)
 });this.activeCount=count}
}
