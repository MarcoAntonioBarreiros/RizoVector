import{CONFIG}from'../data/config.js';
import{ENEMY_TYPES,RESOURCES}from'../data/catalog.js';
import{SeededRandom}from'../generation/SeededRandom.js';
import{SegmentGenerator}from'../generation/SegmentGenerator.js';
import{SegmentManager}from'../generation/SegmentManager.js';
import{ObjectPool}from'./ObjectPool.js';
import{PlayerShip}from'../entities/PlayerShip.js';
import{CollisionSystem}from'../systems/CollisionSystem.js';
import{WeaponSystem}from'../systems/WeaponSystem.js';
import{MicrobeSystem}from'../systems/MicrobeSystem.js';
import{EffectsSystem}from'../systems/EffectsSystem.js';
import{EnemySystem}from'../systems/EnemySystem.js';
import{ObstacleSystem}from'../systems/ObstacleSystem.js';
import{RouteSystem}from'../systems/RouteSystem.js';
import{FungalBarrierSystem}from'../systems/FungalBarrierSystem.js';
import{RootGrowthSystem}from'../systems/RootGrowthSystem.js';
import{StatusSystem}from'../systems/StatusSystem.js';
import{UISystem}from'../systems/UISystem.js';
import{AudioEngine}from'../audio/AudioEngine.js';
export class Game{
 constructor(canvas,input){
  this.canvas=canvas;this.input=input;this.seed=new URLSearchParams(location.search).get('seed')||Math.random().toString(36).slice(2,8);this.demo=new URLSearchParams(location.search).get('demo')==='1';this.player=new PlayerShip;this.time=0;this.depth=0;this.extraDepth=0;this.baseScrollSpeed=CONFIG.world.scrollSpeed;this.scrollSpeed=this.baseScrollSpeed;this.running=false;this.screenFlash=0;this.hitFlash=0;this.shake=0;this.hitStop=0;this.hbTimer=0;this.prevBiome='organic';this.currentBiome='organic';this.assistTimer=0;this.viewScale=1;this.minZoom=.78;this.maxZoom=1.16;
  this.projectiles=new ObjectPool(CONFIG.pools.projectiles);this.enemyProjectiles=new ObjectPool(CONFIG.pools.enemyProjectiles);this.enemies=new ObjectPool(CONFIG.pools.enemies);this.particles=new ObjectPool(CONFIG.pools.particles);this.pickups=new ObjectPool(CONFIG.pools.pickups);this.obstacles=new ObjectPool(CONFIG.pools.obstacles);this.channels=new ObjectPool(CONFIG.pools.channels);this.barriers=new ObjectPool(CONFIG.pools.barriers);
  this.effects=new EffectsSystem(this);this.status=new StatusSystem(this);this.weapon=new WeaponSystem(this);this.microbes=new MicrobeSystem(this);this.enemySystem=new EnemySystem(this);this.obstacleSystem=new ObstacleSystem(this);this.routeSystem=new RouteSystem(this);this.barrierSystem=new FungalBarrierSystem(this);this.rootGrowth=new RootGrowthSystem(this);this.ui=new UISystem(this);this.audio=new AudioEngine;
 }
 setZoom(delta){this.viewScale=Math.max(this.minZoom,Math.min(this.maxZoom,Math.round((this.viewScale+delta)*100)/100))}
 addShake(m){this.shake=Math.min(22,Math.max(this.shake,m))}
 addHitStop(d){this.hitStop=Math.max(this.hitStop,d)}
 start(){
  this.random=new SeededRandom(this.seed);this.segmentGenerator=new SegmentGenerator(this.random,innerWidth);this.segmentManager=new SegmentManager(this.segmentGenerator);this.segmentManager.reset();this.player.reset(innerWidth/2-20,innerHeight-125);this.rootGrowth.reset();
  for(const pool of[this.projectiles,this.enemyProjectiles,this.enemies,this.particles,this.pickups,this.obstacles,this.channels,this.barriers])pool.clear();this.status.reset();this.depth=0;this.extraDepth=0;this.time=0;this.running=true;this.screenFlash=0;this.hitFlash=0;this.shake=0;this.hitStop=0;this.assistTimer=0;this.ui.updateModules({});for(const s of this.segmentManager.segments)this.spawnSegment(s);this.audio.setActive(true);
  if(this.demo){for(const id of['bacillus','rhizobium','mycorrhiza','azospirillum','pgpb','pseudomonas','isr','trichoderma'])this.player.modules[id]=1;this.player.trichoCharge=100;this.player.isrCharge=100;this.player.activateBiofilm(80);this.ui.updateModules(this.player.modules)}
 }
 spawnSegment(s){
  for(const source of s.enemies){const t=ENEMY_TYPES[source.type];this.enemies.acquire({...source,type:source.type,radius:t.radius,color:t.color,health:t.health,maxHealth:t.health,armor:t.armor||0,speed:t.speed,damage:t.damage,score:t.score,fungal:!!t.fungal,drift:this.random.range(-48,48),cooldown:this.random.range(.5,1.5),age:0})}
  for(const source of s.pickups)this.pickups.acquire({...source,radius:source.kind==='microbe'?30:11,phase:this.random.range(0,Math.PI*2)});for(const source of s.obstacles)this.obstacles.acquire({...source});for(const source of s.channels)this.channels.acquire({...source});for(const source of s.barriers)this.barriers.acquire(this.barrierSystem.create(source));
 }
 update(dt){
  if(!this.running)return;if(this.hitStop>0){this.hitStop-=dt;dt*=.08}this.shake=Math.max(0,this.shake-dt*40);this.time+=dt;this.scrollSpeed=this.baseScrollSpeed*(this.player.channelActive?2.65:1);this.depth+=this.scrollSpeed*dt*.055+this.extraDepth;this.extraDepth=0;this.screenFlash=Math.max(0,this.screenFlash-dt*2.1);this.hitFlash=Math.max(0,this.hitFlash-dt*2.8);this.assistTimer=Math.max(0,this.assistTimer-dt);
  this.input.updateGamepad();this.status.update(dt);this.player.update(dt,this.input,{width:innerWidth,height:innerHeight},this.effects,this.status);this.rootGrowth.update(dt);this.weapon.update(dt);this.microbes.update(dt);this.enemySystem.update(dt);this.obstacleSystem.update(dt);this.routeSystem.update(dt);this.barrierSystem.update(dt);this.effects.update(dt);
  for(const s of this.segmentManager.update(dt,this.scrollSpeed,innerHeight))this.spawnSegment(s);this.currentBiome=this.segmentManager.currentBiome(this.player.y);this.updateObjects(dt);this.barrierSystem.collideProjectiles();this.resolveCollisions();this.barrierSystem.collidePlayer();this.adaptiveAssist();this.ui.update(dt);
  if(this.currentBiome!==this.prevBiome){this.prevBiome=this.currentBiome;this.audio.setBiome(this.currentBiome)}
  let dread=0;this.barriers.forEachActive(b=>{const d=Math.abs(b.y-this.player.y);if(d<420)dread=Math.max(dread,1-d/420)});this.audio.setDread(dread*.16);
  this.hbTimer-=dt;if(this.player.health<25&&this.player.alive&&this.hbTimer<=0){this.hbTimer=.95;this.audio.heartbeat()}
  if(!this.player.alive){this.running=false;this.audio.setActive(false);this.ui.showResults()}this.input.endFrame();
 }
 adaptiveAssist(){if(this.player.health<27&&this.assistTimer<=0){this.assistTimer=9;this.pickups.acquire({kind:'resource',type:'carbon',x:this.player.x+this.player.width/2+(Math.random()-.5)*160,y:Math.max(80,this.player.y-220),radius:12,phase:Math.random()*6.28});this.ui.center('EXSUDATO DE RECUPERAÇÃO DETECTADO',1.5)}}
 updateObjects(dt){this.projectiles.forEachActive(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0||b.y<-40||b.x<-40||b.x>innerWidth+40)this.projectiles.release(b)});this.pickups.forEachActive(o=>{o.y+=this.scrollSpeed*dt;if(o.y>innerHeight+60)this.pickups.release(o)})}
 addNitrogen(baseAmount){const p=this.player,level=p.modules.rhizobium||0,multiplier=level?1.8+(level-1)*.35:1;if(p.growthLevel>=CONFIG.player.maxGrowthLevel){p.health=Math.min(p.maxHealth,p.health+baseAmount*.18);p.score+=Math.round(baseAmount);return}p.nitrogen+=baseAmount*multiplier;while(p.nitrogen>=100&&p.growthLevel<CONFIG.player.maxGrowthLevel){p.nitrogen-=100;this.evolveRoot()}p.nitrogen=Math.min(100,p.nitrogen)}
 evolveRoot(){const p=this.player;p.growthLevel++;p.maxHealth=CONFIG.player.maxHealth+p.growthLevel*8;p.health=Math.min(p.maxHealth,p.health+18);p.score+=75;p.isrCharge=Math.min(100,p.isrCharge+(p.modules.isr?15:0));this.rootGrowth.onEvolution();this.audio.evolve();this.addShake(8);this.addHitStop(.11);this.screenFlash=Math.max(this.screenFlash,.55);this.effects.burst(p.x+p.width/2,p.y+p.height/2,'#d9c89f',46,250);this.effects.ring(p.x+p.width/2,p.y+p.height/2,'#ffe9b0',260,.7);this.ui.toast(`Crescimento radicular — nível ${p.growthLevel}`,p.growthLevel===1?'Meristema fortalecido: mais dano e vitalidade.':p.growthLevel===2?'Formação vascular: disparo duplo.':p.growthLevel===3?'Ramificação ativa: três direções e mais raízes laterais.':'Raiz estabelecida: quatro disparos e crescimento máximo.',4.8)}
 hitPlayer(amount,source,x,y,statusType=null){const p=this.player,actual=p.takeDamage(amount);if(actual<=0&&p.invulnerability>0)return false;if(statusType){const duration=statusType==='infection'?5:statusType==='slow'?3.6:statusType==='drain'?5.2:3.8;this.status.apply(statusType,duration,1)}if(p.modules.isr)p.isrCharge=Math.min(100,p.isrCharge+7);this.hitFlash=1;this.effects.burst(p.x+p.width/2,p.y+p.height/2,'#ff7388',18,175);this.effects.text(p.x+p.width/2,p.y-4,`-${Math.round(Math.max(actual,0))}`,'#ffb7c2');const angle=Math.atan2((y??p.y)-(p.y+p.height/2),(x??p.x)-(p.x+p.width/2));this.ui.damage(source,Math.max(actual,0),angle);this.audio.damage(p.x+p.width/2);this.addShake(3+Math.min(9,amount*.5));this.addHitStop(.05);return true}
 rewardEnemy(e){const p=this.player;p.score+=e.score;if(p.modules.isr)p.isrCharge=Math.min(100,p.isrCharge+(e.fungal?7:4));if(e.fungal&&p.modules.trichoderma)p.trichoCharge=Math.min(100,p.trichoCharge+12+2*p.modules.trichoderma);this.audio.enemyDeath(e.type,e.x);this.addShake(e.radius>18?5:2.5);this.addHitStop(e.radius>18?.05:.02);this.effects.burst(e.x,e.y,e.color,24,220);this.effects.smoke(e.x,e.y,e.color,e.fungal?6:3);this.enemies.release(e)}
 resolveCollisions(){
  const p=this.player,rect={x:p.x,y:p.y,width:p.width,height:p.height};
  this.projectiles.forEachActive(b=>{this.enemies.forEachActive(e=>{if(!b.active||!e.active||e.type==='rootLatcher'&&e.attached||!CollisionSystem.circleCircle(b,e))return;if(e.armor>0)e.armor=Math.max(0,e.armor-b.damage*(p.modules.pseudomonas?.42:.06));else e.health-=b.damage;this.projectiles.release(b);this.effects.burst(b.x,b.y,e.color,5,80);if(e.health<=0)this.rewardEnemy(e);else this.audio.enemyHit(b.x)});this.obstacles.forEachActive(o=>{if(!b.active||!o.active||Math.hypot(b.x-o.x,b.y-o.y)>b.radius+o.radius)return;if(p.modules.pgpb)o.dissolve=Math.min(1,o.dissolve+.025*p.modules.pgpb);this.projectiles.release(b);this.effects.burst(b.x,b.y,'#ffd173',4,60)})});
  this.enemyProjectiles.forEachActive(b=>{if(!CollisionSystem.rectCircle(rect,b))return;let source='projétil patogênico',status=null,damage=5;if(b.sourceType==='spore'||b.sourceType==='fungalHypha'){source='esporos fúngicos';status='infection';damage=4}else if(b.sourceType==='oomycete'){source='propágulo de oomiceto';status='slow';damage=5}else if(b.sourceType==='bacterialColony'){source='toxina bacteriana';status='toxin';damage=5}else if(b.sourceType==='ironArmored'){source='fragmento mineral de Fe';damage=8}this.hitPlayer(damage,source,b.x,b.y,status);this.enemyProjectiles.release(b)});
  this.enemies.forEachActive(e=>{if(e.type==='rootLatcher'&&e.attached)return;if(!CollisionSystem.rectCircle(rect,e))return;let status=null,source=e.type,damage=e.damage;if(e.type==='nematode'){status='drain';source='nematódeo aderido'}else if(e.fungal){status='infection';source='contato fúngico'}else if(e.type==='oomycete'){status='slow';source='contato com oomiceto'}else if(e.type==='bacterialColony'){status='toxin';source='colônia bacteriana'}else if(e.type==='rootLatcher'){source='parasita aderente'}this.hitPlayer(damage||4,source,e.x,e.y,status);this.enemies.release(e)});
  this.obstacles.forEachActive(o=>{if(o.contactCooldown>0)return;if(Math.hypot(o.x-(p.x+p.width/2),o.y-(p.y+p.height/2))<o.radius+19){o.contactCooldown=1;this.hitPlayer(6,'colisão com cristal de fosfato',o.x,o.y,null);const dx=(p.x+p.width/2)-o.x;p.x+=Math.sign(dx||1)*54;p.vx=Math.sign(dx||1)*190;p.vy=95}});
  this.pickups.forEachActive(o=>{if(!CollisionSystem.rectCircle(rect,o))return;if(o.kind==='microbe')this.microbes.collect(o.type);else this.collectResource(o.type);const color=o.kind==='microbe'?(o.type==='pgpb'?'#ffd173':o.type==='azospirillum'?'#7fd2ff':o.type==='isr'?'#d9ef88':'#86efad'):RESOURCES[o.type].color;this.effects.burst(o.x,o.y,color,18,145);this.audio.pickup(o.x);this.pickups.release(o)})
 }
 collectResource(type){const p=this.player;if(type==='phosphate'){p.phosphate=Math.min(100,p.phosphate+4);p.score+=4}else if(type==='iron'){p.iron=Math.min(100,p.iron+3);p.score+=2}else if(type==='carbon'){p.carbon=Math.min(100,p.carbon+4);p.health=Math.min(p.maxHealth,p.health+3);if(p.modules.isr)p.isrCharge=Math.min(100,p.isrCharge+2)}else if(type==='nitrogen'){this.addNitrogen(8);p.score+=4}}
}
