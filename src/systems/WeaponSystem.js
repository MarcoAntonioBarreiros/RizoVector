import{CONFIG}from'../data/config.js';
export class WeaponSystem{
 constructor(game){this.game=game}
 update(dt){
  const p=this.game.player,growth=p.growthLevel||0;p.fireTimer-=dt;
  const interval=Math.max(.048,(CONFIG.player.fireInterval-p.phosphate*.00036)*(1-growth*.075)*this.game.status.fireIntervalMultiplier);
  if(p.fireTimer<=0){
   p.fireTimer=interval;this.game.audio.shoot(p.x+p.width/2);let spread=[0];
   if(growth===2)spread=[-.065,.065];
   if(growth===3)spread=[-.14,0,.14];
   if(growth>=4)spread=[-.2,-.07,.07,.2];
   if(p.phosphate>=35&&!spread.includes(0))spread.push(0);
   const damage=1+growth*.28+(p.phosphate>=55?.6:0);
   for(const a of spread)this.game.projectiles.acquire({x:p.x+p.width/2,y:p.y-8,vx:Math.sin(a)*205,vy:-620-growth*22,radius:3.1+growth*.28,damage,color:p.phosphate>=28?'#ffd173':'#91f7dc',life:2});
   if(p.modules.azospirillum)for(const dir of[-1,1])this.game.projectiles.acquire({x:p.x+p.width/2+dir*12,y:p.y+5,vx:dir*(145+25*p.modules.azospirillum),vy:-455-growth*12,radius:2.7,damage:1+growth*.12,color:'#7fd2ff',life:1.25});
  }
  if(this.game.input.trichoPressed)this.game.barrierSystem.activate();
  if(this.game.input.specialPressed)this.activateISR();
 }
 activateISR(){
  const p=this.game.player;
  if(!p.modules.isr){this.game.ui.center('RESISTÊNCIA INDUZIDA — REQUER PGPB ISR',1.6);return}
  if(p.isrCharge<CONFIG.powers.isrCost){this.game.ui.center('RESISTÊNCIA INDUZIDA AINDA NÃO PREPARADA',1.6);return}
  p.isrCharge=0;p.resistanceTimer=CONFIG.powers.isrDuration;p.invulnerability=Math.max(p.invulnerability,1.15);
  this.game.status.reset();this.game.enemyProjectiles.clear();this.game.screenFlash=1;
  this.game.effects.ring(p.x+p.width/2,p.y,'#d9ef88',Math.max(innerWidth,innerHeight),.72);
  this.game.enemies.forEachActive(e=>{if(e.type==='rootLatcher'||e.type==='spore'||e.health<=3){p.score+=e.score;this.game.effects.burst(e.x,e.y,'#d9ef88',22,220);this.game.enemies.release(e)}else{e.health-=4;e.armor=Math.max(0,(e.armor||0)-28);this.game.effects.ring(e.x,e.y,'#d9ef88',55,.28)}});
  this.game.ui.toast('Resistência sistêmica induzida','Penalidades, projéteis e parasitas aderidos foram removidos; ameaças pequenas foram neutralizadas e a raiz recebeu resistência temporária.',5);
  this.game.audio.isr();this.game.addShake(10);this.game.addHitStop(.06);
 }
}
