import{STATUS_TYPES}from'../data/catalog.js';
export class StatusSystem{
 constructor(game){this.game=game;this.active={};this.drainTick=0}
 reset(){this.active={};this.drainTick=0}
 apply(type,duration,intensity=1){
  const current=this.active[type];
  this.active[type]={type,duration:Math.max(duration,current?.duration||0),intensity:Math.max(intensity,current?.intensity||0)};
  const info=STATUS_TYPES[type];
  if(info)this.game.ui.center(`${info.name.toUpperCase()} — ${info.description}`,1.4);
 }
 clear(type){delete this.active[type]}
 reduce(type,amount){if(!this.active[type])return;this.active[type].duration-=amount;if(this.active[type].duration<=0)delete this.active[type]}
 update(dt){
  for(const [key,status] of Object.entries(this.active)){status.duration-=dt;if(status.duration<=0)delete this.active[key]}
  this.drainTick-=dt;
  if(this.active.drain&&this.drainTick<=0){
   this.drainTick=.5;
   const p=this.game.player,level=this.active.drain.intensity;
   p.nitrogen=Math.max(0,p.nitrogen-(1.5+level));
   p.carbon=Math.max(0,p.carbon-(1+level*.5));
   this.game.effects.resourceDrain(p.x+p.width/2,p.y+p.height/2,'#ffbe71');
  }
 }
 get speedMultiplier(){return this.active.slow?.intensity?Math.max(.48,1-.36*this.active.slow.intensity):1}
 get fireIntervalMultiplier(){return this.active.toxin?.intensity?1+.6*this.active.toxin.intensity:1}
 get shieldRegenMultiplier(){let m=1;if(this.active.toxin)m=0;if(this.active.infection)m*=.28;return m}
 list(){return Object.values(this.active).map(s=>({...s,...STATUS_TYPES[s.type]}))}
}
