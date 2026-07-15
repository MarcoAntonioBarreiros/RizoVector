const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const PROFILES={
 spore:{neighbor:150,separation:42,cohesion:.10,alignment:.06,repulsion:1.15,target:0,avoid:1.15,max:54,response:4.2},
 fungalHypha:{neighbor:155,separation:58,cohesion:.07,alignment:.04,repulsion:1.05,target:.28,avoid:1.35,max:48,response:2.8},
 oomycete:{neighbor:170,separation:54,cohesion:.18,alignment:.10,repulsion:1.35,target:.95,avoid:1.55,max:118,response:5.4},
 nematode:{neighbor:165,separation:62,cohesion:.08,alignment:.10,repulsion:1.65,target:1.05,avoid:1.7,max:112,response:4.8},
 bacterialColony:{neighbor:185,separation:72,cohesion:.34,alignment:.16,repulsion:1.75,target:.42,avoid:1.45,max:70,response:3.2},
 ironArmored:{neighbor:155,separation:66,cohesion:.09,alignment:.05,repulsion:1.35,target:.18,avoid:1.55,max:52,response:2.7}
};
export class EnemySystem{
 constructor(game){this.game=game;this.steerClock=0}
 update(dt){
  const g=this.game,p=g.player,t=g.time,relief=p.health<30?1.45:p.health<50?1.2:1,active=[],groups=new Map;
  g.enemies.forEachActive(e=>{active.push(e);const key=`${e.type}:${e.groupId??'solo'}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e)});
  this.steerClock-=dt;const refresh=this.steerClock<=0;if(refresh)this.steerClock=.05;
  for(const e of active){
   e.age=(e.age||0)+dt;e.cooldown=(e.cooldown||.7)-dt;e.spin=(e.spin||0)+dt*(e.spinRate||(e.spinRate=.6+Math.random()*1.4));
   const ox=e.x,oy=e.y;
   if(e.type==='rootLatcher'){this.updateRootLatcher(e,dt);e.vx=(e.x-ox)/Math.max(dt,1e-4);e.vy=(e.y-oy)/Math.max(dt,1e-4);continue}
   if(refresh)this.refreshSteering(e,groups.get(`${e.type}:${e.groupId??'solo'}`)||[e]);
   const profile=PROFILES[e.type]||PROFILES.ironArmored,response=profile.response||3;
   e.steerVX=(e.steerVX||0)+((e.desiredVX||0)-(e.steerVX||0))*Math.min(1,dt*response);
   e.steerVY=(e.steerVY||0)+((e.desiredVY||0)-(e.steerVY||0))*Math.min(1,dt*response);
   const base=g.scrollSpeed+e.speed;
   if(e.type==='spore'){
    e.y+=base*dt+Math.sin(t*1.8+e.phase)*8*dt+(e.steerVY||0)*dt*.32;
    e.x+=(Math.sin(t*3+e.phase)*54+Math.cos(t*1.35+e.phase*1.7)*26+(e.steerVX||0))*dt;
    if(Math.random()<dt*8)g.effects.enemyEmission(e.x,e.y,e.color,1);
    if(e.cooldown<=0){e.cooldown=1.35*relief;this.fire(e,0,158,'#ff8297','spore')}
   }else if(e.type==='fungalHypha'){
    e.y+=base*.72*dt+(e.steerVY||0)*dt*.42;e.x+=(Math.sin(t*.9+e.phase)*35+Math.cos(t*1.7+e.phase)*16+(e.steerVX||0))*dt;e.reach=.5+.5*Math.sin(t*1.6+e.phase);
    if(Math.random()<dt*5)g.effects.enemyEmission(e.x,e.y,e.color,2);if(e.cooldown<=0){e.cooldown=1.8*relief;for(const a of[-.24,0,.24])this.fire(e,Math.sin(a)*92,130,'#d85d9d','spore')}
   }else if(e.type==='oomycete'){
    e.y+=base*dt+(e.steerVY||0)*dt*.72;e.dartCd=(e.dartCd||0)-dt;
    if(e.dartCd<=0){e.dartCd=.46+Math.random()*.62;const tx=p.x+p.width/2-e.x+(Math.random()-.5)*80,ty=p.y+p.height/2-e.y+(Math.random()-.5)*50,d=Math.max(1,Math.hypot(tx,ty));e.dartVX=tx/d*(175+Math.random()*85);e.dartVY=ty/d*(70+Math.random()*55)}
    const damping=Math.pow(.018,dt);e.dartVX=(e.dartVX||0)*damping;e.dartVY=(e.dartVY||0)*damping;e.x+=((e.steerVX||0)+(e.dartVX||0))*dt;e.y+=(e.dartVY||0)*dt;
    if(Math.random()<dt*6)g.effects.enemyEmission(e.x,e.y,e.color,1);if(e.cooldown<=0){e.cooldown=1.18*relief;const dx=p.x+p.width/2-e.x,d=Math.max(1,Math.abs(dx));this.fire(e,dx/d*86,195,'#7b6cff','droplet')}
   }else if(e.type==='nematode'){
    const angle=Math.atan2((e.steerVY||1),(e.steerVX||0)),wave=Math.sin(t*5+e.phase)*46;e.x+=((e.steerVX||0)-Math.sin(angle)*wave)*dt;e.y+=(base*.84+(e.steerVY||0)*.54+Math.cos(angle)*wave*.22)*dt;e.wave=Math.sin(t*5+e.phase);if(Math.random()<dt*5)g.effects.enemyEmission(e.x,e.y,e.color,1)
   }else if(e.type==='bacterialColony'){
    e.y+=(base*.68+(e.steerVY||0)*.45)*dt;e.x+=(Math.sin(t*.7+e.phase)*25+(e.steerVX||0))*dt;e.pulse=.5+.5*Math.sin(t*4+e.phase);e.bud=Math.sin(t*2+e.phase);
    if(e.cooldown<=0){e.cooldown=2.05*relief;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;this.fire(e,Math.cos(a)*96,Math.sin(a)*96+82,'#ef625c','toxin')}}
   }else{
    e.y+=(base*.72+(e.steerVY||0)*.35)*dt;e.x+=(Math.sin(t*.55+e.phase)*20+Math.cos(t*1.1+e.phase)*14+(e.steerVX||0))*dt;e.rock=Math.sin(t*1.4+e.phase);if(e.cooldown<=0){e.cooldown=1.65*relief;for(const dx of[-68,0,68])this.fire(e,dx,145,'#ffad67','iron')}
   }
   e.x=clamp(e.x,18,innerWidth-18);e.vx=(e.x-ox)/Math.max(dt,1e-4);e.vy=(e.y-oy)/Math.max(dt,1e-4);if(e.y>innerHeight+100)g.enemies.release(e)
  }
  g.enemyProjectiles.forEachActive(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0||b.y>innerHeight+50||b.x<-50||b.x>innerWidth+50)g.enemyProjectiles.release(b)})
 }
 refreshSteering(e,peers){
  const g=this.game,profile=PROFILES[e.type]||PROFILES.ironArmored;let cx=0,cy=0,avx=0,avy=0,count=0,sx=0,sy=0;
  for(const o of peers){if(o===e)continue;const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy);if(d<=0||d>profile.neighbor)continue;cx+=o.x;cy+=o.y;avx+=o.vx||0;avy+=o.vy||0;count++;if(d<profile.separation){const force=(profile.separation-d)/profile.separation;sx-=dx/d*force;sy-=dy/d*force}}
  let vx=sx*profile.repulsion*profile.max,vy=sy*profile.repulsion*profile.max;
  if(count){vx+=(cx/count-e.x)*profile.cohesion+(avx/count-(e.vx||0))*profile.alignment;vy+=(cy/count-e.y)*profile.cohesion+(avy/count-(e.vy||0))*profile.alignment}
  const target=this.targetFor(e);if(target&&profile.target){const dx=target.x-e.x,dy=target.y-e.y,d=Math.max(1,Math.hypot(dx,dy));vx+=dx/d*profile.target*profile.max;vy+=dy/d*profile.target*profile.max}
  const avoid=this.avoidanceFor(e);vx+=avoid.x*profile.avoid*profile.max;vy+=avoid.y*profile.avoid*profile.max;
  const wander=Math.sin(this.game.time*.7+e.phase*2.1+(e.seed||0)*8);vx+=wander*profile.max*.12;vy+=Math.cos(this.game.time*.53+e.phase)*profile.max*.06;
  const speed=Math.hypot(vx,vy);if(speed>profile.max){vx=vx/speed*profile.max;vy=vy/speed*profile.max}e.desiredVX=vx;e.desiredVY=vy
 }
 targetFor(e){
  const g=this.game,p=g.player;if(e.type==='spore')return null;
  if(e.type==='fungalHypha'||e.type==='nematode'){const pts=g.rootGrowth.points;let best=null,dist=1e9;for(let i=Math.max(0,pts.length-150);i<pts.length;i+=5){const pt=pts[i],d=(pt.x-e.x)**2+(pt.y-e.y)**2;if(d<dist){dist=d;best=pt}}if(best)return best}
  return{x:p.x+p.width/2,y:p.y+p.height*.55}
 }
 avoidanceFor(e){
  const g=this.game;let x=0,y=0;
  g.obstacles.forEachActive(o=>{const dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy),r=(o.radius||25)+82;if(d>0&&d<r){const f=(r-d)/r;x+=dx/d*f;y+=dy/d*f}});
  g.barriers.forEachActive(b=>{const dy=e.y-b.y;if(Math.abs(dy)>105||Math.abs(e.x-b.gapCenter)<b.gapWidth*.5)return;const f=1-Math.abs(dy)/105;x+=Math.sign(b.gapCenter-e.x)*f*1.4;y-=Math.sign(dy||1)*f*.25});
  if(e.x<82)x+=(82-e.x)/82;else if(e.x>innerWidth-82)x-=(e.x-(innerWidth-82))/82;return{x,y}
 }
 updateRootLatcher(e,dt){
  const g=this.game,p=g.player,pts=g.rootGrowth.points;if(!pts.length){e.y+=(g.scrollSpeed+e.speed)*dt;return}
  if(e.attached){const idx=Math.min(pts.length-1,e.anchorIndex||0),anchor=pts[idx];if(!anchor){g.enemies.release(e);return}e.x=anchor.x+Math.cos(g.time*7+e.phase)*3;e.y=anchor.y+Math.sin(g.time*6+e.phase)*3;e.drainTick=(e.drainTick||.45)-dt;if(e.drainTick<=0){e.drainTick=.65;p.carbon=Math.max(0,p.carbon-1);if(p.shield>0)p.shield=Math.max(0,p.shield-3);else p.health=Math.max(0,p.health-1);g.effects.resourceDrain(e.x,e.y,'#c4f36a');g.ui.damage('parasita aderido à raiz',1,Math.atan2(e.y-(p.y+p.height/2),e.x-(p.x+p.width/2)));if(p.health<=0)p.alive=false}return}
  let bestIdx=-1,best=1e9;for(let i=0;i<pts.length-18;i+=3){const pt=pts[i],d=Math.hypot(pt.x-e.x,pt.y-e.y);if(d<best){best=d;bestIdx=i}}
  if(bestIdx>=0&&best<210){const pt=pts[bestIdx],dx=pt.x-e.x,dy=pt.y-e.y,d=Math.max(1,Math.hypot(dx,dy));e.x+=dx/d*dt*132;e.y+=dy/d*dt*132;if(d<18){e.attached=true;e.anchorIndex=bestIdx;e.drainTick=.55;g.effects.ring(e.x,e.y,'#c4f36a',38,.28);return}}
  else{const dx=p.x+p.width/2-e.x;e.x+=Math.sign(dx)*30*dt;e.y+=(g.scrollSpeed+e.speed*.6)*dt}if(e.y>innerHeight+100)g.enemies.release(e)
 }
 fire(e,vx,vy,color,kind){this.game.enemyProjectiles.acquire({x:e.x,y:e.y,vx,vy,radius:kind==='toxin'?5.5:kind==='iron'?5:4,color,kind,sourceType:e.type,life:4})}
}
