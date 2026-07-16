export class RouteSystem{
 constructor(game){this.game=game;this.promptCooldown=0}
 update(dt){
  const p=this.game.player;
  this.promptCooldown=Math.max(0,this.promptCooldown-dt);
  p.channelActive=false;

  this.game.channels.forEachActive(channel=>{
   channel.y+=this.game.baseScrollSpeed*dt;
   if(channel.y>innerHeight+100){this.game.channels.release(channel);return}

   const cx=p.x+p.width/2,cy=p.y+p.height/2;
   const inside=cx>channel.x&&cx<channel.x+channel.width&&cy>channel.y&&cy<channel.y+channel.height;

   if(!inside){
    channel.playerInside=false;
    channel.trailTimer=0;
    channel.windTimer=0;
    return;
   }

   if(p.modules.azospirillum){
    const level=p.modules.azospirillum||1;
    p.channelActive=true;
    p.invulnerability=Math.max(p.invulnerability,.16);

    /*
     * A velocidade normal máxima da ponta é 335 px/s. A versão anterior
     * usava 265 px/s e, portanto, não chegava a acelerar. O canal agora
     * funciona como uma corrente: fixa uma velocidade frontal bem maior e
     * aplica um deslocamento imediato enquanto a ponta permanecer na faixa.
     */
    const targetVy=-(650+level*95);
    const immediatePull=110+level*28;
    p.vy+=(targetVy-p.vy)*Math.min(1,dt*13);
    p.y=Math.max(14,p.y-immediatePull*dt);

    this.game.extraDepth+=dt*(58+level*14);
    channel.trailTimer=(channel.trailTimer||0)-dt;
    channel.windTimer=(channel.windTimer||0)-dt;

    if(channel.trailTimer<=0){
     channel.trailTimer=.026;
     this.game.effects.channelTrail(cx,cy);
    }
    if(channel.windTimer<=0){
     channel.windTimer=.42;
     this.game.audio.channelWind(cx);
    }

    if(!channel.playerInside){
     channel.playerInside=true;
     channel.trailTimer=0;
     channel.windTimer=.25;
     this.game.effects.channelBoost(cx,cy);
     this.game.audio.channelRush(cx);
     this.game.addShake(7);
     if(!channel.used){
      channel.used=true;
      this.game.ui.toast(
       'Canal radicular rápido',
       'Azospirillum estabeleceu uma via preferencial: a corrente impulsiona a ponta para a frente enquanto ela permanece sobre a faixa.'
      );
     }
    }
   }else if(this.promptCooldown<=0){
    channel.playerInside=true;
    this.promptCooldown=3;
    this.game.ui.center('CANAL LATERAL — REQUER AZOSPIRILLUM',1.8);
   }
  });
 }
}