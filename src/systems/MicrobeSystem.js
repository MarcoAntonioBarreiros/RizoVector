import{MICROBES}from'../data/catalog.js';
export class MicrobeSystem{
 constructor(game){this.game=game;this.trichoAngle=0;this.mycoTick=0}
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
  const g=this.game,p=g.player,pseudo=p.modules.pseudomonas||0,myco=p.modules.mycorrhiza||0;this.trichoAngle+=dt*(1.4+.3*(p.modules.trichoderma||0));this.mycoTick=Math.max(0,this.mycoTick-dt);
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
}
