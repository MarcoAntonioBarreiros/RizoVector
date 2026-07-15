import{createParticle,PARTICLE_EFFECTS,PARTICLE_EFFECT_NAMES}from'../effects/ParticleLibrary.js';
const TAU=Math.PI*2;
export class EffectsSystem{
 constructor(game){this.game=game;this.activeCount=0;this.lab=new URLSearchParams(location.search).get('particlelab')==='1';this.labTimer=.35;this.labIndex=0;this.timeline=[]}
 loadScale(priority='normal'){
  const n=this.activeCount;if(priority==='critical')return n<1000?1:n<1170?.78:.46;if(priority==='ambient')return n<390?1:n<620?.56:n<840?.26:.07;return n<500?1:n<740?.76:n<960?.48:.22
 }
 emit(preset,x,y,color,count,options={}){
  const scale=this.loadScale(options.priority||'normal'),total=Math.max(1,Math.round(count*scale));
  for(let i=0;i<total;i++){const p=createParticle(preset,x,y,color,{...options,index:i,total}),speed=options.speedScale||1,size=options.sizeScale||1,life=options.lifeScale||1;p.vx*=speed;p.vy*=speed;p.radius*=size;p.length*=size;p.width*=size;p.life*=life;p.maxLife*=life;if(!this.game.particles.acquire(p))break}
 }
 schedule(delay,fn){this.timeline.push({delay,fn})}
 recipe(name,x,y,color='#86efad'){const r=PARTICLE_EFFECTS[name];if(!r)return;this.emit(r.preset,x,y,color,r.count,{priority:'critical',...(r.options||{})})}
 burst(x,y,color,count=18,speed=170){this.emit('spark',x,y,color,Math.round(count*1.12),{priority:'normal',pattern:'radial',speedScale:.86+speed/390,originSpread:4})}
 smoke(x,y,color,count=4){this.emit('dissolve',x,y,color,Math.round(count*1.1),{priority:'ambient',blend:'add',alpha:.5,speedScale:.8,pattern:'cloud',originSpread:16})}
 sporeCloud(x,y,color,count=10){this.emit('spore',x,y,color,Math.round(count*1.15),{priority:'normal',speedScale:1.05,pattern:'cloud',originSpread:12})}
 tracer(x,y,tx,ty,color){this.game.particles.acquire({x,y,tx,ty,life:.28,maxLife:.28,radius:2,color,kind:'tracer',blend:'add',alpha:1,fadePower:1.1,fadeStart:.7,birthFade:.02})}
 walkingTracer(x,y,tx,ty,color,width=2,life=.62){this.game.particles.acquire({x,y,tx,ty,life,maxLife:life,radius:width,color,kind:'walker',blend:'add',alpha:1,fadePower:1.05,fadeStart:.75,birthFade:.02})}
 ring(x,y,color,maxRadius=180,duration=.62){this.game.particles.acquire({x,y,radius:4,maxRadius,life:duration,maxLife:duration,color,kind:'ring',blend:'add',alpha:1,fadePower:1.15,fadeStart:.72,birthFade:.02})}
 beam(x,y,tx,ty,color='#8df0a8',options={}){
  this.game.particles.acquire({x,y,tx,ty,color,kind:'beam',life:options.life||.78,maxLife:options.life||.78,width:options.width||7,curve:options.curve||0,blend:'add',alpha:options.alpha||1,fadePower:.9,fadeStart:.72,birthFade:.025,pulse:options.pulse??1})
 }
 text(x,y,text,color='#ffb7c2'){this.game.particles.acquire({x,y,vx:0,vy:-42,grav:0,life:1.05,maxLife:1.05,radius:0,color,kind:'text',blend:null,alpha:1,text,fadePower:1,fadeStart:.7,birthFade:.02})}
 superDash(x,y){this.game.audio?.dash();this.ring(x,y,'#d5b4ff',160,.68);this.emit('filament',x,y,'#d5b4ff',54,{priority:'critical',pattern:'fan',angle:Math.PI/2,spread:Math.PI*1.35,speedScale:1.42,originSpread:10})}
 rootRibbon(x,y,dir){this.game.audio?.whoosh(x);this.ring(x,y,'#7fd2ff',110,.58);this.emit('filament',x-dir*25,y,'#7fd2ff',30,{priority:'critical',pattern:'fan',angle:dir>0?0:Math.PI,spread:.92,speedScale:1.35,originSpread:14})}
 rootSpark(x,y,color='#7fd2ff'){this.emit('spark',x,y,color,1,{priority:'ambient',pattern:'fan',angle:-Math.PI/2,spread:.8,speedScale:.72,originSpread:10})}
 resourceDrain(x,y,color){this.emit('filament',x,y,color,7,{priority:'normal',pattern:'fan',angle:Math.PI/2,spread:.7,speedScale:.58,blend:null,originSpread:16})}
 crystalDissolve(x,y){this.game.audio?.crystal(x);this.ring(x,y,'#ffd173',125,.72);this.emit('shatter',x,y,'#ffd173',30,{priority:'critical',pattern:'radial',speedScale:1.22,splitPreset:'shatter',splitCount:3,splitAt:.55,splitSize:.3,splitSpeed:.68});this.smoke(x,y,'#ffe3a1',6)}
 hyphaBreak(x,y){this.game.audio?.hypha(x);this.ring(x,y,'#8df0a8',86,.62);this.emit('filament',x,y,'#8df0a8',34,{priority:'critical',pattern:'radial',speedScale:1.12});this.smoke(x,y,'#d85d9d',5)}
 enemyEmission(x,y,color,count=2){this.emit('spore',x,y,color,Math.max(1,count),{priority:'ambient',speedScale:.42,lifeScale:.82,pattern:'cloud',originSpread:10,blend:null,alpha:.68})}
 isrSpectacle(cx,cy,targets=[],projectiles=[]){
  const palette=['#d9ef88','#efffc4','#86efad','#7fd2ff'];
  this.ring(cx,cy,'#d9ef88',Math.max(innerWidth,innerHeight)*.95,.95);
  this.ring(cx,cy,'#efffc4',Math.max(innerWidth,innerHeight)*.55,.72);
  this.emit('vortex',cx,cy,'#d9ef88',38,{priority:'critical',pattern:'vortex',ringRadius:28,vortexDirection:1,speedScale:1.35,palette});
  this.emit('spark',cx,cy,'#efffc4',72,{priority:'critical',pattern:'radial',speedScale:1.55,palette});
  this.emit('bloom',cx,cy,'#86efad',34,{priority:'critical',pattern:'ring',ringRadius:20,speedScale:1.1,palette});
  const ordered=[...targets].sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy));
  ordered.forEach((t,i)=>this.schedule(.06+i*.035,()=>{
   const color=i%3===0?'#efffc4':i%3===1?'#86efad':'#7fd2ff';
   this.ring(t.x,t.y,color,70+(i%4)*14,.48);
   this.emit(i%2?'shatter':'spark',t.x,t.y,color,24+(i%3)*5,{priority:'critical',pattern:'radial',speedScale:1.25,palette:[color,'#ffffff','#d9ef88']});
   this.emit('bloom',t.x,t.y,'#efffc4',10,{priority:'critical',pattern:'ring',ringRadius:8,sizeScale:.85});
  }));
  projectiles.slice(0,70).forEach((q,i)=>this.schedule(.02+(i%12)*.012,()=>this.emit('spark',q.x,q.y,'#d9ef88',5,{priority:'normal',pattern:'radial',speedScale:.75,sizeScale:.7})));
 }
 trichoLance(sx,sy,targets=[]){
  if(!targets.length)return;
  this.ring(sx,sy,'#8df0a8',92,.62);
  this.emit('spiral',sx,sy,'#8df0a8',20,{priority:'critical',pattern:'vortex',ringRadius:15,vortexDirection:1,speedScale:.8,palette:['#8df0a8','#d5b4ff','#effff6']});
  this.emit('bloom',sx,sy,'#effff6',18,{priority:'critical',pattern:'ring',ringRadius:8,sizeScale:1.15,palette:['#effff6','#8df0a8']});
  targets.forEach((t,i)=>{
   const delay=.14+i*.11,curve=(i-(targets.length-1)/2)*24;
   this.schedule(delay,()=>{
    this.beam(sx,sy,t.x,t.y,i%2?'#d5b4ff':'#8df0a8',{life:.82,width:8.5,curve,pulse:1});
    this.emit('spark',sx,sy,'#effff6',12,{priority:'critical',pattern:'fan',angle:Math.atan2(t.y-sy,t.x-sx),spread:.28,speedScale:1.25});
   });
   this.schedule(delay+.34,()=>{
    this.ring(t.x,t.y,'#8df0a8',92,.58);
    this.emit('filament',t.x,t.y,'#8df0a8',30,{priority:'critical',pattern:'radial',speedScale:1.18,palette:['#8df0a8','#d5b4ff','#effff6']});
    this.emit('bloom',t.x,t.y,'#effff6',14,{priority:'critical',pattern:'ring',ringRadius:9,sizeScale:1.1});
   });
  })
 }
 updateLab(dt){
  if(!this.lab||!this.game.running)return;this.labTimer-=dt;if(this.labTimer>0)return;this.labTimer=3.4;this.game.particles.clear();
  const name=PARTICLE_EFFECT_NAMES[this.labIndex++%PARTICLE_EFFECT_NAMES.length],x=innerWidth*.5,y=innerHeight*.48;this.recipe(name,x,y,'#86efad');this.game.ui?.center(`PARTÍCULAS: ${name}`,2.2)
 }
 updateTimeline(dt){
  for(let i=this.timeline.length-1;i>=0;i--){const e=this.timeline[i];e.delay-=dt;if(e.delay<=0){this.timeline.splice(i,1);e.fn()}}
 }
 update(dt){
  this.updateLab(dt);this.updateTimeline(dt);let count=0;const splits=[];
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
