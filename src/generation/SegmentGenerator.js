import{MICROBES,BIOMES,ENEMY_TYPES}from'../data/catalog.js';
export class SegmentGenerator{
 constructor(random,width){this.random=random;this.width=width;this.id=0}
 generate(y,height){
  const id=this.id++,difficulty=Math.min(1,id/30),biome=this.random.pick(Object.keys(BIOMES));
  const archetype=id<2?'tutorial':id===8?'fungalGate':this.random.pick(['calm','swarm','fungal','wet','nematode','mineral','mixed']);
  const s={id,y,height,biome,archetype,enemies:[],pickups:[],obstacles:[],channels:[],barriers:[],decorations:[],roots:[],hyphae:[],currents:[]};
  const lane=n=>(n+.5)*(this.width/7),safeLane=id===0?3:this.random.int(1,5),groupSeeds=new Map;
  const templates={
   tutorial:['spore','rootLatcher'],calm:['spore'],swarm:['spore','spore','bacterialColony'],fungal:['spore','fungalHypha','rootLatcher'],
   wet:['oomycete','oomycete','rootLatcher'],nematode:['nematode','nematode','spore'],mineral:['ironArmored','spore'],mixed:['spore','oomycete','nematode','bacterialColony','rootLatcher']
  };
  let budget=archetype==='calm'?3:archetype==='fungalGate'?3:Math.floor(5+difficulty*3),attempts=0,large=0;
  const pool=templates[archetype]||templates.mixed;
  while(budget>0&&attempts++<25){
   const type=this.random.pick(pool),cost=ENEMY_TYPES[type].cost||1;if(cost>budget)continue;if(cost>=3&&large>=2)continue;
   let group=groupSeeds.get(type);if(!group||group.count>=4||this.random.chance(.2)){let l=this.random.int(0,6);if(l===safeLane)l=(l+2)%7;group={id:`${id}-${type}-${attempts}`,x:lane(l),y:y+this.random.range(110,height-110),count:0};groupSeeds.set(type,group)}
   const spreadX=type==='spore'?92:type==='bacterialColony'?72:58,spreadY=type==='spore'?80:55,x=Math.max(32,Math.min(this.width-32,group.x+this.random.range(-spreadX,spreadX))),ey=Math.max(y+65,Math.min(y+height-65,group.y+this.random.range(-spreadY,spreadY)));
   s.enemies.push({type,x,y:ey,groupId:group.id,groupIndex:group.count++,phase:this.random.range(0,Math.PI*2),seed:this.random.next()});budget-=cost;if(cost>=3)large++
  }
  const resourceCount=archetype==='calm'?10:this.random.int(5,9);
  for(let i=0;i<resourceCount;i++)s.pickups.push({kind:'resource',type:this.random.pick(['phosphate','iron','carbon','nitrogen']),x:lane(this.random.int(0,6)),y:y+this.random.range(45,height-50)});
  const order=['bacillus','rhizobium','mycorrhiza','azospirillum','pgpb','pseudomonas','isr','trichoderma'];
  const guaranteed=order[id];
  if(guaranteed){const x=id===0?lane(3):lane(safeLane),py=id===0?y+height*.57:y+height*.68;s.pickups.push({kind:'microbe',type:guaranteed,x,y:py,guaranteed:true,swarmPhase:this.random.range(0,Math.PI*2)})}
  else if(this.random.chance(.34))s.pickups.push({kind:'microbe',type:this.random.pick(Object.keys(MICROBES)),x:lane(this.random.int(1,5)),y:y+this.random.range(130,height-100),swarmPhase:this.random.range(0,Math.PI*2)});
  const crystals=archetype==='mineral'?this.random.int(2,4):this.random.int(0,2);
  for(let i=0;i<crystals;i++){let l=this.random.int(0,6);if(l===safeLane)l=(l+1)%7;s.obstacles.push({type:'phosphateCrystal',x:lane(l),y:y+this.random.range(120,height-90),radius:this.random.range(28,43),dissolve:0,phase:this.random.range(0,Math.PI*2),contactCooldown:0})}
  if(id>=4&&this.random.chance(.38)){const side=this.random.chance(.5)?'left':'right';s.channels.push({side,x:side==='left'?28:this.width-148,y:y+90,width:120,height:height-180,phase:this.random.range(0,Math.PI*2),used:false})}
  if(archetype==='fungalGate'||(id>8&&archetype==='fungal'&&this.random.chance(.62))){const gapCenter=lane(safeLane),gapWidth=archetype==='fungalGate'?116:this.random.range(96,132);s.barriers.push({x:0,y:y+height*.34,width:this.width,gapCenter,gapWidth,phase:this.random.range(0,Math.PI*2),growth:0})}
  for(let i=0;i<26;i++)s.decorations.push({x:this.random.range(0,this.width),y:y+this.random.range(0,height),radius:this.random.range(3,30),alpha:this.random.range(.025,.15),kind:this.random.pick(['pore','mineral','organic'])});
  for(let i=0;i<8;i++)s.roots.push({x:this.random.range(-80,this.width+80),y:y+this.random.range(0,height),length:this.random.range(130,390),bend:this.random.range(-120,120),width:this.random.range(2,10),phase:this.random.range(0,Math.PI*2)});
  for(let i=0;i<6;i++)s.hyphae.push({x:this.random.range(0,this.width),y:y+this.random.range(0,height),length:this.random.range(80,260),angle:this.random.range(0,Math.PI*2),phase:this.random.range(0,Math.PI*2)});
  for(let i=0;i<3;i++)s.currents.push({x:this.random.range(0,this.width),y:y+this.random.range(0,height),length:this.random.range(160,360),phase:this.random.range(0,Math.PI*2),color:this.random.pick(['#86efad','#7fd2ff','#d5b4ff'])});
  return s
 }
}
