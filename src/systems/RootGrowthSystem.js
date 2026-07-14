export class RootGrowthSystem{
 constructor(game){this.game=game;this.points=[];this.branches=[];this.sampleTimer=0;this.branchTimer=0}
 reset(){
  const p=this.game.player,cx=p.x+p.width/2,cy=p.y+p.height/2;
  this.points=[];this.branches=[];this.sampleTimer=0;this.branchTimer=1.4;
  for(let i=0;i<18;i++)this.points.push({x:cx,y:cy+i*12,age:i*.08,phase:i*.47});
 }
 onEvolution(){this.branchTimer=0;this.game.effects.ring(this.game.player.x+20,this.game.player.y+25,'#86efad',155,.55)}
 update(dt){
  const p=this.game.player,scroll=this.game.scrollSpeed;
  for(const pt of this.points){pt.y+=scroll*dt;pt.age+=dt}
  for(const br of this.branches){br.y+=scroll*dt;br.age+=dt;br.growth=Math.min(1,br.growth+dt*(.55+.08*p.growthLevel))}
  this.points=this.points.filter(pt=>pt.y<innerHeight+110).slice(-230);
  this.branches=this.branches.filter(br=>br.y<innerHeight+130).slice(-80);
  this.sampleTimer-=dt;
  const tip={x:p.x+p.width/2,y:p.y+p.height*.76};
  const last=this.points[this.points.length-1];
  if(this.sampleTimer<=0||!last||Math.hypot(tip.x-last.x,tip.y-last.y)>7){
   this.sampleTimer=.025;this.points.push({x:tip.x,y:tip.y,age:0,phase:this.game.time});
  }
  const azo=p.modules.azospirillum||0,level=p.growthLevel||0;
  this.branchTimer-=dt;
  const interval=Math.max(1.25,3.9-level*.48-azo*.42);
  if(this.branchTimer<=0&&this.points.length>30){
   this.branchTimer=interval;
   const anchor=this.points[Math.max(0,this.points.length-22-Math.floor(Math.random()*16))];
   const dir=Math.random()<.5?-1:1;
   this.branches.push({x:anchor.x,y:anchor.y,dir,length:65+Math.random()*55+level*15+azo*12,bend:(Math.random()-.5)*42,growth:0,age:0,phase:Math.random()*6.28});
  }
 }
}
