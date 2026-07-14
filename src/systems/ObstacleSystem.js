export class ObstacleSystem{
 constructor(game){this.game=game}
 update(dt){
  const p=this.game.player,pgpb=p.modules.pgpb||0;
  this.game.obstacles.forEachActive(o=>{
   o.y+=this.game.scrollSpeed*dt;o.contactCooldown=Math.max(0,(o.contactCooldown||0)-dt);
   if(o.y>innerHeight+80){this.game.obstacles.release(o);return}
   if(o.type==='phosphateCrystal'&&pgpb){const d=Math.hypot(o.x-(p.x+p.width/2),o.y-(p.y+p.height/2));if(d<290+pgpb*70){o.dissolve=Math.min(1,o.dissolve+dt*(.22+pgpb*.16));if(Math.random()<dt*18)this.game.effects.tracer(p.x+p.width/2,p.y,o.x,o.y,'#ffd173');if(o.dissolve>=1){this.game.effects.crystalDissolve(o.x,o.y);for(let i=0;i<8+pgpb*4;i++)this.game.pickups.acquire({kind:'resource',type:'phosphate',x:o.x+(Math.random()-.5)*80,y:o.y+(Math.random()-.5)*55,radius:10,phase:Math.random()*6.28});this.game.obstacles.release(o)}}}
  })
 }
}
