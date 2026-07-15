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
   if(!inside){c.playerInside=false;c.trailTimer=0;c.windTimer=0;return}
   if(p.modules.azospirillum){
    p.channelActive=true;
    p.invulnerability=Math.max(p.invulnerability,.14);
    const targetVy=-265;
    p.vy+=(targetVy-p.vy)*Math.min(1,dt*5.5);
    this.game.extraDepth+=dt*34;
    c.trailTimer=(c.trailTimer||0)-dt;c.windTimer=(c.windTimer||0)-dt;
    if(c.trailTimer<=0){c.trailTimer=.034;this.game.effects.channelTrail(cx,cy)}
    if(c.windTimer<=0){c.windTimer=.62;this.game.audio.channelWind(cx)}
    if(!c.playerInside){
     c.playerInside=true;c.trailTimer=0;c.windTimer=.38;
     this.game.effects.channelBoost(cx,cy);this.game.audio.channelRush(cx);this.game.addShake(5);
     if(!c.used){
      c.used=true;
      this.game.ui.toast('Canal radicular rápido','Azospirillum abriu uma corrente acelerada: brilho, rastro e fluxo protegem a raiz enquanto a nave permanece controlável.');
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