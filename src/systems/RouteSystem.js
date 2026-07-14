export class RouteSystem{
 constructor(game){this.game=game;this.promptCooldown=0}
 update(dt){
  const p=this.game.player;
  this.promptCooldown=Math.max(0,this.promptCooldown-dt);
  p.channelActive=false;
  this.game.channels.forEachActive(c=>{
   c.y+=this.game.baseScrollSpeed*dt;
   if(c.y>innerHeight+100){this.game.channels.release(c);return}
   const cx=p.x+p.width/2,cy=p.y+p.height/2;
   const inside=cx>c.x&&cx<c.x+c.width&&cy>c.y&&cy<c.y+c.height;
   if(!inside){c.playerInside=false;return}
   if(p.modules.azospirillum){
    p.channelActive=true;
    p.invulnerability=Math.max(p.invulnerability,.14);
    // Smoothly bias the ship upward without locking vertical controls or pinning it to the top clamp.
    const targetVy=-265;
    p.vy+=(targetVy-p.vy)*Math.min(1,dt*5.5);
    this.game.extraDepth+=dt*34;
    if(Math.random()<dt*28)this.game.effects.rootSpark(cx,cy,'#7fd2ff');
    if(!c.playerInside){
     c.playerInside=true;
     this.game.effects.ring(cx,cy,'#7fd2ff',105,.38);
     if(!c.used){
      c.used=true;
      this.game.ui.toast('Canal radicular rápido','Azospirillum abriu uma rota lateral: o cenário acelera, a nave permanece controlável e ganha invulnerabilidade temporária.');
     }
    }
   }else if(this.promptCooldown<=0){
    c.playerInside=true;
    this.promptCooldown=3;
    this.game.ui.center('CANAL LATERAL — REQUER AZOSPIRILLUM',1.8);
   }
  })
 }
}
