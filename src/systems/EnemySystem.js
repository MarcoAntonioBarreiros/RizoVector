export class EnemySystem{
 constructor(game){this.game=game}
 update(dt){
  const g=this.game,p=g.player,t=g.time,relief=p.health<30?1.45:p.health<50?1.2:1;
  const spores=[];g.enemies.forEachActive(e=>{if(e.type==='spore')spores.push(e)});
  g.enemies.forEachActive(e=>{
   e.age=(e.age||0)+dt;e.cooldown=(e.cooldown||.7)-dt;e.spin=(e.spin||0)+dt*(e.spinRate||(e.spinRate=.6+Math.random()*1.4));
   const ox=e.x,oy=e.y;
   if(e.type==='rootLatcher'){this.updateRootLatcher(e,dt);e.vx=(e.x-ox)/Math.max(dt,1e-4);e.vy=(e.y-oy)/Math.max(dt,1e-4);return}
   const base=g.scrollSpeed+e.speed;
   if(e.type==='spore'){
    e.y+=base*dt+Math.sin(t*1.8+e.phase)*8*dt;e.x+=Math.sin(t*3+e.phase)*54*dt+Math.cos(t*1.35+e.phase*1.7)*26*dt;
    // swarm dosado: coesão fraca + separação (cardume vivo, sem virar parede densa)
    let ax=0,cnt=0,sepx=0;
    for(const o of spores){if(o===e)continue;const dx=o.x-e.x;if(Math.abs(dx)<120&&Math.abs(o.y-e.y)<120){ax+=o.x;cnt++;if(Math.abs(dx)<46)sepx-=Math.sign(dx||1)*(46-Math.abs(dx))}}
    if(cnt){let sw=(ax/cnt-e.x)*.8+sepx*1.5;sw=Math.max(-40,Math.min(40,sw));e.x+=sw*dt}
    if(Math.random()<dt*8)g.effects.enemyEmission(e.x,e.y,e.color,1);
    if(e.cooldown<=0){e.cooldown=1.35*relief;this.fire(e,0,158,'#ff8297','spore')}
   }
   else if(e.type==='fungalHypha'){e.y+=base*.72*dt;e.x+=Math.sin(t*.9+e.phase)*35*dt+Math.cos(t*1.7+e.phase)*16*dt;e.reach=.5+.5*Math.sin(t*1.6+e.phase);if(Math.random()<dt*5)g.effects.enemyEmission(e.x,e.y,e.color,2);if(e.cooldown<=0){e.cooldown=1.8*relief;for(const a of[-.24,0,.24])this.fire(e,Math.sin(a)*92,130,'#d85d9d','spore')}}
   else if(e.type==='oomycete'){
    e.y+=base*dt;
    // zoósporo flagelado: deriva com arranques laterais curtos (dardeja)
    e.dartCd=(e.dartCd||0)-dt;if(e.dartCd<=0){e.dartCd=.55+Math.random()*.7;e.dartImp=(Math.random()<.5?-1:1)*(150+Math.random()*90)}
    e.dartImp=(e.dartImp||0)*Math.pow(.015,dt);e.x+=e.dartImp*dt;
    if(Math.random()<dt*6)g.effects.enemyEmission(e.x,e.y,e.color,1);
    if(e.cooldown<=0){e.cooldown=1.18*relief;const dx=(p.x+p.width/2)-e.x,d=Math.max(1,Math.abs(dx));this.fire(e,dx/d*86,195,'#7b6cff','droplet')}
   }
   else if(e.type==='nematode'){const dx=(p.x+p.width/2)-e.x;e.x+=Math.sign(dx)*Math.min(90,Math.abs(dx))*dt*.62;e.x+=Math.cos(t*5+e.phase)*46*dt;e.y+=base*.84*dt+Math.sin(t*5+e.phase)*9*dt;e.wave=Math.sin(t*5+e.phase);if(Math.random()<dt*5)g.effects.enemyEmission(e.x,e.y,e.color,1)}
   else if(e.type==='bacterialColony'){e.y+=base*.68*dt;e.x+=Math.sin(t*.7+e.phase)*25*dt;e.pulse=.5+.5*Math.sin(t*4+e.phase);e.bud=Math.sin(t*2+e.phase);if(e.cooldown<=0){e.cooldown=2.05*relief;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;this.fire(e,Math.cos(a)*96,Math.sin(a)*96+82,'#ef625c','toxin')}}}
   else{e.y+=base*.72*dt;e.x+=Math.sin(t*.55+e.phase)*20*dt+Math.cos(t*1.1+e.phase)*14*dt;e.rock=Math.sin(t*1.4+e.phase);if(e.cooldown<=0){e.cooldown=1.65*relief;for(const dx of[-68,0,68])this.fire(e,dx,145,'#ffad67','iron')}}
   e.vx=(e.x-ox)/Math.max(dt,1e-4);e.vy=(e.y-oy)/Math.max(dt,1e-4);
   if(e.y>innerHeight+100)g.enemies.release(e)
  });
  g.enemyProjectiles.forEachActive(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0||b.y>innerHeight+50||b.x<-50||b.x>innerWidth+50)g.enemyProjectiles.release(b)})
 }
 updateRootLatcher(e,dt){
  const g=this.game,p=g.player,pts=g.rootGrowth.points; if(!pts.length){e.y+=(g.scrollSpeed+e.speed)*dt;return}
  if(e.attached){
   const idx=Math.min(pts.length-1,e.anchorIndex||0),anchor=pts[idx]; if(!anchor){g.enemies.release(e);return}
   e.x=anchor.x+Math.cos(g.time*7+e.phase)*3; e.y=anchor.y+Math.sin(g.time*6+e.phase)*3; e.drainTick=(e.drainTick||.45)-dt;
   if(e.drainTick<=0){e.drainTick=.65; p.carbon=Math.max(0,p.carbon-1); if(p.shield>0)p.shield=Math.max(0,p.shield-3); else p.health=Math.max(0,p.health-1); g.effects.resourceDrain(e.x,e.y,'#c4f36a'); g.ui.damage('parasita aderido à raiz',1,Math.atan2(e.y-(p.y+p.height/2),e.x-(p.x+p.width/2))); if(p.health<=0)p.alive=false}
   return
  }
  let bestIdx=-1,best=1e9;
  for(let i=0;i<pts.length-18;i+=3){const pt=pts[i],d=Math.hypot(pt.x-e.x,pt.y-e.y); if(d<best){best=d;bestIdx=i}}
  if(bestIdx>=0&&best<210){const pt=pts[bestIdx],dx=pt.x-e.x,dy=pt.y-e.y,d=Math.max(1,Math.hypot(dx,dy));e.x+=dx/d*dt*132;e.y+=dy/d*dt*132; if(d<18){e.attached=true;e.anchorIndex=bestIdx;e.drainTick=.55;g.effects.ring(e.x,e.y,'#c4f36a',38,.28);return}}
  else {const dx=(p.x+p.width/2)-e.x;e.x+=Math.sign(dx)*30*dt;e.y+=(g.scrollSpeed+e.speed*.6)*dt}
  if(e.y>innerHeight+100)g.enemies.release(e)
 }
 fire(e,vx,vy,color,kind){this.game.enemyProjectiles.acquire({x:e.x,y:e.y,vx,vy,radius:kind==='toxin'?5.5:kind==='iron'?5:4,color,kind,sourceType:e.type,life:4})}
}
