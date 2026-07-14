import{CONFIG}from'../data/config.js';
export class FungalBarrierSystem{
 constructor(game){this.game=game}
 create(source){
  // Cada ramo é um nó de infecção local que brota um tufo de hifas (micélio radial),
  // colonizando célula a célula e deixando o corredor da abertura sempre livre.
  const rand=()=>this.game.random.next(),branches=[],cell=72,gapL=source.gapCenter-source.gapWidth*.5,gapR=source.gapCenter+source.gapWidth*.5;
  for(let x=18;x<source.width-18;x+=cell){
   const x0=x,x1=Math.min(source.width-18,x+cell+18),center=(x0+x1)/2;
   if(center>gapL-6&&center<gapR+6)continue;
   const cy=(rand()-.5)*18,gapDir=center<source.gapCenter?1:-1,tendrils=this.buildCluster(center,cy,gapDir,gapL,gapR,rand);
   branches.push({x0,x1,offset:cy,tendrils,phase:rand()*6.28,tipSeed:rand()*6.28,health:7,maxHealth:7,cleared:false,trichoMarked:false});
  }
  return{...source,branches,contactCooldown:0,shotNotice:0,trichoTimer:0,announced:false,corePulse:rand()*6.28,sporeTick:0};
 }
 // Um nó de infecção brota um tufo de hifas curtas irradiando em várias direções
 // (micélio local, sem atravessar a cena). Uma delas pende levemente para a abertura.
 buildCluster(cx,cy,gapDir,gapL,gapR,rand){
  const tendrils=[],count=4+Math.floor(rand()*3);
  for(let i=0;i<count;i++){
   const ang=i===0?(gapDir>0?.15:Math.PI-.15):(-Math.PI/2)+(rand()-.5)*Math.PI*1.4,len=24+rand()*40,nodes=this.buildStrand(cx,cy,ang,len,gapDir,gapL,gapR,rand),{cum,total}=this.pathMetrics(nodes);
   tendrils.push({nodes,cum,total,delay:rand()*1.2,rate:.9+rand()*.8});
  }
  return tendrils;
 }
 buildStrand(x0,y0,ang,len,gapDir,gapL,gapR,rand){
  const steps=3+Math.floor(rand()*3),nodes=[{x:x0,dy:y0}];let a=ang,px=x0,py=y0;
  for(let i=1;i<=steps;i++){a+=(rand()-.5)*.7;const seg=len/steps;px+=Math.cos(a)*seg;py+=Math.sin(a)*seg*.7;px=gapDir>0?Math.min(px,gapL-4):Math.max(px,gapR+4);nodes.push({x:px,dy:py})}
  return nodes;
 }
 pathMetrics(nodes){const cum=[0];let total=0;for(let i=1;i<nodes.length;i++){total+=Math.hypot(nodes[i].x-nodes[i-1].x,nodes[i].dy-nodes[i-1].dy);cum.push(total)}return{cum,total}}
 static pointAt(nodes,cum,dist){for(let i=1;i<nodes.length;i++)if(cum[i]>=dist){const a=nodes[i-1],b=nodes[i],seg=cum[i]-cum[i-1]||1,u=(dist-cum[i-1])/seg;return{x:a.x+(b.x-a.x)*u,dy:a.dy+(b.dy-a.dy)*u}}const l=nodes[nodes.length-1];return{x:l.x,dy:l.dy}}
 activate(){
  const p=this.game.player,level=p.modules.trichoderma||0;
  if(!level){this.game.ui.center('MICOPARASITISMO — REQUER TRICHODERMA',1.6);return false}
  if(p.trichoCharge<CONFIG.powers.trichoCost){this.game.ui.center('POTENCIAL MICOPARASÍTICO INSUFICIENTE',1.6);return false}
  let target=null,best=1e9;
  this.game.barriers.forEachActive(b=>{const d=Math.abs(b.y-(p.y+p.height/2));if(d<best&&d<470){best=d;target=b}});
  if(!target){this.game.ui.center('NENHUMA BARREIRA AO ALCANCE',1.4);return false}
  const candidates=target.branches.filter(br=>!br.cleared).sort((a,b)=>Math.abs((a.x0+a.x1)/2-(p.x+p.width/2))-Math.abs((b.x0+b.x1)/2-(p.x+p.width/2))).slice(0,Math.min(5,2+level));
  if(!candidates.length)return false;
  p.trichoCharge-=CONFIG.powers.trichoCost;target.trichoTimer=3.1;target.announced=true
  for(const br of target.branches)br.trichoMarked=false;for(const br of candidates)br.trichoMarked=true;
  this.game.effects.ring(p.x+p.width/2,p.y,'#8df0a8',125,.42);this.game.audio.tricho(p.x+p.width/2);this.game.addShake(4);
  this.game.ui.toast('Micoparasitismo ativado','Hifas verdes reconhecem, caminham e degradam as ramificações marcadas. Tiros comuns não rompem a parede estrutural.',4.8);
  return true
 }
 update(dt){
  const p=this.game.player;
  this.game.barriers.forEachActive(b=>{
   b.y+=this.game.scrollSpeed*dt;b.growth=Math.min(1.7,b.growth+dt*.2);b.contactCooldown=Math.max(0,b.contactCooldown-dt);b.shotNotice=Math.max(0,b.shotNotice-dt);b.trichoTimer=Math.max(0,b.trichoTimer-dt);
   if(b.y>innerHeight+140){this.game.barriers.release(b);return}
   b.sporeTick-=dt;
   if(b.sporeTick<=0&&b.y>-60&&b.y<innerHeight+60){
    b.sporeTick=b.growth<1?.1:.6;
    const live=b.branches.filter(br=>!br.cleared);
    if(live.length){const br=live[(Math.random()*live.length)|0],td=br.tendrils[(Math.random()*br.tendrils.length)|0],g=Math.max(0,Math.min(1,(b.growth-td.delay)*td.rate));if(g>.05){const pt=FungalBarrierSystem.pointAt(td.nodes,td.cum,g*td.total);this.game.effects.sporeCloud(pt.x,b.y+pt.dy,'#d85d9d',2)}}
   }
   if(b.trichoTimer>0){
    for(const br of b.branches){
     if(!br.trichoMarked||br.cleared)continue;br.health-=dt*(3.4+(p.modules.trichoderma||1)*1.25);
     if(Math.random()<dt*18){const targetX=(br.x0+br.x1)/2,targetY=b.y+br.offset;this.game.effects.walkingTracer(p.x+p.width/2,p.y+p.height*.25,targetX,targetY,'#8df0a8',2.2,.46)}
     if(br.health<=0){br.cleared=true;br.trichoMarked=false;this.game.effects.hyphaBreak((br.x0+br.x1)/2,b.y+br.offset);p.score+=16;p.trichoCharge=Math.min(100,p.trichoCharge+5)}
    }
   }else for(const br of b.branches)br.trichoMarked=false;
  })
 }
 collideProjectiles(){
  this.game.projectiles.forEachActive(bullet=>{this.game.barriers.forEachActive(barrier=>{if(!bullet.active||Math.abs(bullet.y-barrier.y)>66)return;for(const br of barrier.branches){if(br.cleared)continue;const x=(br.x0+br.x1)/2;if(Math.abs(bullet.x-x)<(br.x1-br.x0)*.54){this.game.projectiles.release(bullet);this.game.effects.enemyEmission(bullet.x,bullet.y,'#d85d9d',4);if(barrier.shotNotice<=0){barrier.shotNotice=2.2;this.game.ui.center('HIFA ESTRUTURAL RESISTE — USE Q / TRICHODERMA',1.5)}break}}})})
 }
 collidePlayer(){
  const p=this.game.player,cx=p.x+p.width/2,cy=p.y+p.height/2;
  this.game.barriers.forEachActive(b=>{if(b.contactCooldown>0||Math.abs(cy-b.y)>40)return;for(const br of b.branches){if(br.cleared)continue;if(cx>br.x0-10&&cx<br.x1+10){b.contactCooldown=.95;this.game.hitPlayer(7,'barreira fúngica',cx,b.y,'infection');p.vy=180;return}}})
 }
}
