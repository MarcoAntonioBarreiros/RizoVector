import{CONFIG}from'../data/config.js';
export class PlayerShip{
 constructor(){this.width=CONFIG.player.width;this.height=CONFIG.player.height;this.maxHealth=CONFIG.player.maxHealth;this.maxShield=CONFIG.player.maxShield;this.biofilmMax=18;this.reset(600,600)}
 reset(x,y){Object.assign(this,{x,y,vx:0,vy:0,health:CONFIG.player.maxHealth,maxHealth:CONFIG.player.maxHealth,shield:0,biofilmTimer:0,nitrogen:0,growthLevel:0,trichoCharge:0,isrCharge:0,resistanceTimer:0,phosphate:0,iron:0,carbon:0,score:0,fireTimer:0,dashTimer:0,dashCooldown:0,rootCooldown:0,rootTrail:0,invulnerability:0,modules:{},alive:true,channelActive:false})}
 update(dt,input,bounds,effects,status){
  const speed=CONFIG.player.speed*(status?.speedMultiplier||1);
  this.vx+=(input.axisX*speed-this.vx)*Math.min(1,dt*12);this.vy+=(input.axisY*speed-this.vy)*Math.min(1,dt*12);
  this.dashCooldown=Math.max(0,this.dashCooldown-dt);this.rootCooldown=Math.max(0,this.rootCooldown-dt);this.rootTrail=Math.max(0,this.rootTrail-dt);this.invulnerability=Math.max(0,this.invulnerability-dt);this.resistanceTimer=Math.max(0,this.resistanceTimer-dt);
  if(input.dashPressed&&this.modules.mycorrhiza&&this.dashCooldown<=0){this.dashTimer=CONFIG.player.dashDuration;this.dashCooldown=Math.max(.38,CONFIG.player.dashCooldown-(this.modules.mycorrhiza-1)*.14);this.invulnerability=Math.max(this.invulnerability,.42);effects.superDash(this.x+this.width/2,this.y+this.height/2)}
  if(input.rootPressed&&this.modules.azospirillum&&this.rootCooldown<=0){const dir=input.axisX<-.2?-1:input.axisX>.2?1:(this.x<bounds.width/2?1:-1);this.x+=dir*(145+this.modules.azospirillum*28);this.x=Math.max(14,Math.min(bounds.width-this.width-14,this.x));this.rootCooldown=Math.max(.34,.84-(this.modules.azospirillum-1)*.11);this.rootTrail=.48;this.invulnerability=Math.max(this.invulnerability,.32);effects.rootRibbon(this.x+this.width/2,this.y+this.height/2,dir)}
  if(this.dashTimer>0){this.dashTimer-=dt;this.vy=-CONFIG.player.dashSpeed}
  this.x+=this.vx*dt;this.y+=this.vy*dt;this.x=Math.max(14,Math.min(bounds.width-this.width-14,this.x));this.y=Math.max(bounds.height*.43,Math.min(bounds.height-this.height-14,this.y));
  if(this.biofilmTimer>0){this.biofilmTimer=Math.max(0,this.biofilmTimer-dt);const bacillus=this.modules.bacillus||0;this.shield=Math.max(0,Math.min(this.maxShield,this.shield + dt*(2.2+bacillus*.55) - dt*3.5));}
  else this.shield=Math.max(0,this.shield-dt*18);
 }
 activateBiofilm(strength=70){this.shield=Math.min(this.maxShield,this.shield+strength);this.biofilmTimer=this.biofilmMax}
 takeDamage(amount){
  if(this.invulnerability>0)return 0;this.invulnerability=.85;const reduced=this.resistanceTimer>0?amount*.5:amount;
  let damageLeft=reduced;
  if(this.biofilmTimer>0&&this.shield>0){const absorbed=Math.min(this.shield,damageLeft);this.shield-=absorbed;damageLeft-=absorbed;this.biofilmTimer=Math.max(0,this.biofilmTimer-3.2)}
  this.health-=damageLeft;if(this.health<=0){this.health=0;this.alive=false}return damageLeft;
 }
}
