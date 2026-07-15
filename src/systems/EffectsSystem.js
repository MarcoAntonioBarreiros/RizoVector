import{createParticle,PARTICLE_EFFECTS,PARTICLE_EFFECT_NAMES}from'../effects/ParticleLibrary.js';
const TAU=Math.PI*2;
export class EffectsSystem{
 constructor(game){this.game=game;this.activeCount=0;this.lab=new URLSearchParams(location.search).get('particlelab')==='1';this.labTimer=.35;this.labIndex=0}
 loadScale(priority='normal'){
  const n=this.activeCount;if(priority==='critical')return n<1000?1:n<1170?.78:.46;if(priority==='ambient')return n<390?1:n<620?.56:n<840?.26:.07;return n<500?1:n<740?.76:n<960?.48:.22
 }
 emit(preset,x,y,color,count,options={}){
  const scale=this.loadScale(options.priority||'normal'),total=Math.max(1,Math.round(count*scale));
  for(let i=0;i<total;i++){const p=createParticle(preset,x,y,color,{...options,index:i,total}),speed=options.speedScale||1,size=options.sizeScale||1,life=options.lifeScale||1;p.vx*=speed;p.vy*=speed;p.radius*=size;p.length*=size;p.width*=size;p.life*=life;p.maxLife*=life;if(!this.game.particles.acquire(p))break}
 }
 recipe(name,x,y,color='#86efad'){const r=PARTICLE_EFFECTS[name];if(!r)return;this.emit(r.preset,x,y,color,r.count,{priority:'critical',...(r.options||{})})}
 burst(x,y,color,count=18,speed=170){this.emit('spark',x,y,color,Math.round(count*1.12),{priority:'normal',pattern:'radial',speedScale:.86+speed/390,originSpread:4})}
 smoke(x,y,color,count=4){this.emit('dissolve',x,y,color,Math.round(count*1.1),{priority:'ambient',blend:'add',alpha:.5,speedScale:.8,pattern:'cloud',originSpread:16})}
 sporeCloud(x,y,color,count=10){this.emit('spore',x,y,color,Math.round(count*1.15),{priority:'normal',speedScale:1.05,pattern:'cloud',originSpread:12})}
 tracer(x,y,tx,ty,color){this.game.particles.acquire({x,y,tx,ty,life:.28,maxLife:.28,radius:2,color,kind:'tracer',blend:'add',alpha:1,fadePower:1.1,fadeStart:.7,birthFade:.02})}
 walkingTracer(x,y,tx,ty,color,width=2,life=.62){this.game.particles.acquire({x,y,tx,ty,life,maxLife:life,radius:width,color,kind:'walker',blend:'add',alpha:1,fadePower:1.05,fadeStart:.75,birthFade:.02})}
 ring(x,y,color,maxRadius=180,duration=.62){this.game.particles.acquire({x,y,radius:4,maxRadius,life:duration,maxLife:duration,color,kind:'ring',blend:'add',alpha:1,fadePower:1.15,fadeStart:.72,birthFade:.02})}
 text(x,y,text,color='#ffb7c2'){this.game.particles.acquire({x,y,vx:0,vy:-42,grav:0,life:1.05,maxLife:1.05,radius:0,color,kind:'text',blend:null,alpha:1,text,fadePower:1,fadeStart:.7,birthFade:.02})}
 superDash(x,y){this.game.audio?.dash();this.ring(x,y,'#d5b4ff',160,.68);this.emit('filament',x,y,'#d5b4ff',54,{priority:'critical',pattern:'fan',angle:Math.PI/2,spread:Math.PI*1.35,speedScale:1.42,originSpread:10})}
 rootRibbon(x,y,dir){this.game.audio?.whoosh(x);this.ring(x,y,'#7fd2ff',110,.58);this.emit('filament',x-dir*25,y,'#7fd2ff',30,{priority:'critical',pattern:'fan',angle:dir>0?0:Math.PI,spread:.92,speedScale:1.35,originSpread:14})}
 rootSpark(x,y,color='#7fd2ff'){this.emit('spark',x,y,color,1,{priority:'ambient',pattern:'fan',angle:-Math.PI/2,spread:.8,speedScale:.72,originSpread:10})}
 resourceDrain(x,y,color){this.emit('filament',x,y,color,7,{priority:'normal',pattern:'fan',angle:Math.PI/2,spread:.7,speedScale:.58,blend:null,originSpread:16})}
 crystalDissolve(x,y){this.game.audio?.crystal(x);this.ring(x,y,'#ffd173',125,.72);this.emit('shatter',x,y,'#ffd173',30,{priority:'critical',pattern:'radial',speedScale:1.22,splitPreset:'shatter',splitCount:3,splitAt:.55,splitSize:.3,splitSpeed:.68});this.smoke(x,y,'#ffe3a1',6)}
 hyphaBreak(x,y){this.game.audio?.hypha(x);this.ring(x,y,'#8df0a8',86,.62);this.emit('filament',x,y,'#8df0a8',34,{priority:'critical',pattern:'radial',speedScale:1.12});this.smoke(x,y,'#d85d9d',5)}
 enemyEmission(x,y,color,count=2){this.emit('spore',x,y,color,Math.max(1,count),{priority:'ambient',speedScale:.42,lifeScale:.82,pattern:'cloud',originSpread:10,blend:null,alpha:.68})}
 updateLab(dt){
  if(!this.lab||!this.game.running)return;this.labTimer-=dt;if(this.labTimer>0)return;this.labTimer=3.4;this.game.particles.clear();
  const name=PARTICLE_EFFECT_NAMES[this.labIndex++%PARTICLE_EFFECT_NAMES.length],x=innerWidth*.5,y=innerHeight*.48;this.recipe(name,x,y,'#86efad');this.game.ui?.center(`PARTÍCULAS: ${name}`,2.2)
 }
 update(dt){
  this.updateLab(dt);let count=0;const splits=[];
  this.game.particles.forEachActive(p=>{
   p.life-=dt;if(p.life<=0){this.game.particles.release(p);return}count++;
   if(p.kind==='particle'&&p.splitPreset&&!p.splitDone&&p.life/p.maxLife<=p.splitAt){p.splitDone=true;splits.push({x:p.x,y:p.y,color:p.color,preset:p.splitPreset,count:p.splitCount,size:p.splitSize,speed:p.splitSpeed})}
   if(p.kind==='particle'&&p.motion==='wobble'){p.wob=(p.wob||0)+dt*(p.wobSpeed||2);p.x+=((p.vx||0)+Math.cos(p.wob)*18)*dt;p.y+=((p.vy||0)+Math.sin(p.wob*.72)*14)*dt}
   else if(p.kind==='smoke'){p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;const drag=Math.pow(p.drag||.99,dt*60);p.vx=(p.vx||0)*drag;p.vy=((p.vy||0)+(p.grav||0)*dt)*drag}
   else if(p.kind==='particle'||p.kind==='text'){
    if(p.kind==='particle'&&p.turnRate){const a=p.turnRate*dt,cs=Math.cos(a),sn=Math.sin(a),vx=p.vx||0,vy=p.vy||0;p.vx=vx*cs-vy*sn;p.vy=vx*sn+vy*cs}
    p.spin=(p.spin||0)+(p.spinSpeed||0)*dt;p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;const drag=Math.pow(p.drag||.99,dt*60);p.vx=(p.vx||0)*drag;p.vy=((p.vy||0)+(p.grav||0)*dt)*drag
   }
   if(p.kind==='ring')p.radius+=(p.maxRadius-p.radius)*Math.min(1,dt*6.5)
  });
  for(const s of splits)this.emit(s.preset,s.x,s.y,s.color,s.count,{priority:'critical',pattern:'radial',sizeScale:s.size,speedScale:s.speed,lifeScale:.72,noSplit:true,glowScale:.8});
  this.activeCount=count
 }
}
