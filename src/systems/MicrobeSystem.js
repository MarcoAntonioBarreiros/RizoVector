import{MICROBES}from'../data/catalog.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const SWARM_SPEED={bacillus:72,rhizobium:58,mycorrhiza:50,azospirillum:88,pgpb:46,pseudomonas:82,isr:66,trichoderma:54};
export class MicrobeSystem{
 constructor(game){this.game=game;this.trichoAngle=0;this.mycoTick=0;this.swarmClock=0}
 collect(id){
  const p=this.game.player;p.modules[id]=Math.min(3,(p.modules[id]||0)+1);
  if(id==='bacillus'){p.activateBiofilm(70);this.game.status.clear('toxin');this.game.status.reduce('infection',3);this.game.ui.toast('Enxame de Bacillus recrutado','O biofilme agora é temporário: protege e se regenera por alguns segundos, mas se esgota com o tempo e com impactos.')}
  if(id==='rhizobium'){this.game.addNitrogen(24);this.game.ui.toast('Rhizobium simbiótico','O nitrogênio alimenta crescimento, biomassa e evolução dos disparos — não uma explosão.')}
  if(id==='mycorrhiza'){this.game.status.clear('slow');this.game.ui.toast('Rede micorrízica conectada','Espaço ativa o superimpulso; hifas guiadas também caminham em direção a fungos próximos.')}
  if(id==='azospirillum'){this.game.status.clear('drain');this.game.ui.toast('Swarm de Azospirillum associado','Shift realiza o desvio lateral e aumenta a formação de raízes secundárias.')}
  if(id==='pgpb')this.game.ui.toast('Colônia solubilizadora recrutada','As células aderem aos cristais, criam fissuras e liberam fósforo.')
  if(id==='pseudomonas')this.game.ui.toast('Swarm de Pseudomonas recrutado','Sideróforos fluorescentes removem a carapaça dos competidores marcados com Fe.')
  if(id==='isr'){p.isrCharge=Math.min(100,p.isrCharge+100);this.game.ui.toast('PGPB indutora de resistência recrutada','A barra ISR foi carregada. Pressione E para limpar penalidades, projéteis e parasitas aderidos.')}
  if(id==='trichoderma'){p.trichoCharge=Math.min(100,p.trichoCharge+100);this.game.status.clear('infection');this.game.ui.toast('Trichoderma recrutado','A barra micoparasítica foi carregada. Pressione Q perto de uma barreira para degradar suas hifas estruturais.')}
  this.game.audio.recruit(p.x+p.width/2);this.game.addShake(3);this.game.effects.ring(p.x+p.width/2,p.y+p.height/2,MICROBES[id].color,150,.55);this.game.ui.updateModules(p.modules)
 }
 update(dt){
  const g=this.game,p=g.player,pseudo=p.modules.pseudomonas||0,myco=p.modules.mycorrhiza||0;this.trichoAngle+=dt*(1.4+.3*(p.modules.trichoderma||0));this.mycoTick=Math.max(0,this.mycoTick-dt);this.updateFreeSwarms(dt);
  if(pseudo)g.enemies.forEachActive(e=>{if(e.armor<=0)return;const dx=e.x-(p.x+p.width/2),dy=e.y-p.y,r=390+pseudo*100;if(dx*dx+dy*dy<r*r){e.armor=Math.max(0,e.armor-dt*(28+pseudo*19));if(Math.random()<dt*18)g.effects.tracer(p.x+p.width/2,p.y,e.x,e.y,'#b9f36f')}});
  if(myco){
   g.pickups.forEachActive(o=>{const dx=p.x+p.width/2-o.x,dy=p.y+p.height/2-o.y,d=Math.hypot(dx,dy),r=185+myco*82;if(d>0&&d<r){o.x+=dx/d*dt*(175+myco*88);o.y+=dy/d*dt*(175+myco*88)}});
   let target=null,best=1e9;
   g.enemies.forEachActive(e=>{if(!e.fungal)return;const d=Math.hypot(e.x-(p.x+p.width/2),e.y-(p.y+p.height/2));if(d<best){best=d;target={x:e.x,y:e.y,enemy:e}}});
   g.barriers.forEachActive(b=>{const d=Math.hypot(b.gapCenter-(p.x+p.width/2),b.y-p.y);if(d<best){best=d;target={x:b.gapCenter,y:b.y,barrier:b}}});
   if(target&&best<360){if(this.mycoTick<=0){this.mycoTick=.14;g.effects.walkingTracer(p.x+p.width/2,p.y+p.height*.25,target.x,target.y,'#d9c0ff',2.4,.55);g.effects.walkingTracer(p.x+p.width/2,p.y+p.height*.35,target.x,target.y,'#c39cff',1.8,.42)}if(target.enemy)target.enemy.health-=dt*(.18+.1*myco);if(target.barrier)target.barrier.growth=Math.max(0,target.barrier.growth-dt*.03)}
  }
  if(p.modules.trichoderma){let target=null,best=1e9;g.enemies.forEachActive(e=>{if(!e.fungal)return;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<best){best=d;target=e}});if(target&&best<350){target.health-=dt*(2.3+p.modules.trichoderma*1.35);if(Math.random()<dt*16)g.effects.tracer(p.x+p.width/2+Math.cos(this.trichoAngle)*34,p.y+p.height/2+Math.sin(this.trichoAngle)*24,target.x,target.y,'#8df0a8')}}
 }
 updateFreeSwarms(dt){
  const g=this.game,swarms=[];g.pickups.forEachActive(o=>{if(o.kind==='microbe')swarms.push(o)});if(!swarms.length)return;
  this.swarmClock-=dt;const refresh=this.swarmClock<=0;if(refresh)this.swarmClock=.06;
  for(const o of swarms){
   const max=SWARM_SPEED[o.type]||60;if(refresh){let vx=0,vy=0,cx=0,cy=0,count=0,sx=0,sy=0;
    for(const q of swarms){if(q===o)continue;const dx=q.x-o.x,dy=q.y-o.y,d=Math.hypot(dx,dy);if(d>0&&d<68){const f=(68-d)/68;sx-=dx/d*f;sy-=dy/d*f}if(q.type===o.type&&d>0&&d<230){cx+=q.x;cy+=q.y;count++}}
    vx+=sx*max*1.7;vy+=sy*max*1.7;if(count){vx+=(cx/count-o.x)*.12;vy+=(cy/count-o.y)*.12}
    const target=this.swarmTarget(o),dx=target.x-o.x,dy=target.y-o.y,d=Math.max(1,Math.hypot(dx,dy)),arrival=clamp((d-45)/190,.18,1);vx+=dx/d*max*arrival;vy+=dy/d*max*arrival;
    g.obstacles.forEachActive(a=>{const ax=o.x-a.x,ay=o.y-a.y,ad=Math.hypot(ax,ay),r=(a.radius||25)+62;if(ad>0&&ad<r){const f=(r-ad)/r;vx+=ax/ad*max*f*1.5;vy+=ay/ad*max*f*1.5}});
    g.enemies.forEachActive(e=>{const ax=o.x-e.x,ay=o.y-e.y,ad=Math.hypot(ax,ay),r=(e.radius||18)+78;if(ad>0&&ad<r){const f=(r-ad)/r;vx+=ax/ad*max*f*1.9;vy+=ay/ad*max*f*1.9}});
    const phase=o.swarmPhase??o.phase??0;vx+=Math.sin(g.time*.8+phase)*max*.16;vy+=Math.cos(g.time*.63+phase*1.3)*max*.09;const speed=Math.hypot(vx,vy);if(speed>max){vx=vx/speed*max;vy=vy/speed*max}o.swarmTargetVX=vx;o.swarmTargetVY=vy
   }
   o.swarmVX=(o.swarmVX||0)+((o.swarmTargetVX||0)-(o.swarmVX||0))*Math.min(1,dt*4.5);o.swarmVY=(o.swarmVY||0)+((o.swarmTargetVY||0)-(o.swarmVY||0))*Math.min(1,dt*4.5);o.x=clamp(o.x+o.swarmVX*dt,28,innerWidth-28);o.y+=o.swarmVY*dt
  }
 }
 swarmTarget(o){
  const g=this.game,p=g.player,root={x:p.x+p.width/2,y:p.y+p.height*.48};let niche=null,best=1e9;
  if(o.type==='pgpb')g.obstacles.forEachActive(a=>{const d=(a.x-o.x)**2+(a.y-o.y)**2;if(d<best&&d<360*360){best=d;niche=a}});
  else if(o.type==='pseudomonas')g.enemies.forEachActive(e=>{if(e.armor<=0)return;const d=(e.x-o.x)**2+(e.y-o.y)**2;if(d<best&&d<390*390){best=d;niche=e}});
  else if(o.type==='mycorrhiza'||o.type==='trichoderma'){
   g.enemies.forEachActive(e=>{if(!e.fungal)return;const d=(e.x-o.x)**2+(e.y-o.y)**2;if(d<best&&d<370*370){best=d;niche=e}});g.barriers.forEachActive(b=>{const d=(b.gapCenter-o.x)**2+(b.y-o.y)**2;if(d<best&&d<370*370){best=d;niche={x:b.gapCenter,y:b.y}}})
  }
  else if(o.type==='rhizobium'||o.type==='azospirillum'){const pts=g.rootGrowth.points;for(let i=Math.max(0,pts.length-130);i<pts.length;i+=7){const pt=pts[i],d=(pt.x-o.x)**2+(pt.y-o.y)**2;if(d<best){best=d;niche=pt}}}
  if(!niche)return root;return{x:root.x*.68+niche.x*.32,y:root.y*.68+niche.y*.32}
 }
}
