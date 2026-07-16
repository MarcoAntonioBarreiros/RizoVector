const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ENEMY_MOBILITY={spore:88,fungalHypha:66,oomycete:152,nematode:132,bacterialColony:108,ironArmored:58,rootLatcher:44};
const SWARM_MOBILITY={bacillus:112,rhizobium:98,mycorrhiza:88,azospirillum:148,pgpb:82,pseudomonas:138,isr:108,trichoderma:94};
const RESOURCE_MOBILITY={carbon:118,nitrogen:104,phosphate:72,iron:66};
const RESOURCE_BIAS={carbon:-54,nitrogen:-28,phosphate:18,iron:10};
export class FlowSystem{
 constructor(game){this.game=game;this.time=0}
 reset(){this.time=0}
 update(dt){this.time+=dt;this.moveEnemies(dt);this.movePickups(dt)}
 hashDirection(value){const s=String(value??'flow');let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h&1?1:-1}
 fieldAt(x,y,phase=0){
  const t=this.time,large=Math.sin(y*.009+t*.72+phase)+Math.cos(x*.006-t*.43+phase*.7),eddy=Math.sin(x*.012+y*.005-t*.91+phase*1.4);
  return{x:large*.58+Math.cos(y*.016-t*.64+phase)*.46,y:Math.sin(x*.008-t*.78+phase)*.88+Math.cos(y*.007+t*.39+phase)*.52+eddy*.28}
 }
 moveEnemies(dt){
  const g=this.game;
  g.enemies.forEachActive(e=>{
   if(e.attached)return;const mobility=ENEMY_MOBILITY[e.type]||72,phase=(e.phase||0)+(e.seed||0)*11,field=this.fieldAt(e.x,e.y,phase),dir=this.hashDirection(e.groupId??e.seed??e.type),cycle=.38+.62*(.5+.5*Math.sin(this.time*.24+phase)),vertical=field.y*mobility+dir*mobility*.72*cycle,horizontal=field.x*mobility+Math.sin(this.time*.86+phase)*mobility*.24;
   const ox=e.x,oy=e.y;e.x=clamp(e.x+horizontal*dt,18,g.worldWidth-18);e.y+=vertical*dt;e.vx=(e.vx||0)+(e.x-ox)/Math.max(dt,1e-4);e.vy=(e.vy||0)+(e.y-oy)/Math.max(dt,1e-4)
  })
 }
 movePickups(dt){
  const g=this.game;
  g.pickups.forEachActive(o=>{
   if(!o.enteredView&&o.y<-45){o.flowVX=0;o.flowVY=0;return}
   if(o.y>=-45)o.enteredView=true;
   const phase=o.flowPhase??(o.flowPhase=o.swarmPhase??o.phase??Math.random()*TAU),field=this.fieldAt(o.x,o.y,phase);
   if(o.kind==='microbe'){
    const mobility=SWARM_MOBILITY[o.type]||105,dir=this.hashDirection(`${o.type}:${phase.toFixed(3)}`),cycle=.35+.65*(.5+.5*Math.sin(this.time*.29+phase));
    o.flowTargetVX=field.x*mobility+Math.sin(this.time*.93+phase)*mobility*.22;
    o.flowTargetVY=field.y*mobility+dir*mobility*.58*cycle;
    if(o.y<90)o.flowTargetVY+=(90-o.y)*1.6;
    else if(o.y>g.viewportHeight-90)o.flowTargetVY-=(o.y-(g.viewportHeight-90))*1.6
   }else{
    const mobility=RESOURCE_MOBILITY[o.type]||82,bias=RESOURCE_BIAS[o.type]||0,dir=this.hashDirection(`${o.type}:${phase.toFixed(2)}`);
    o.flowTargetVX=field.x*mobility+Math.sin(this.time*1.12+phase)*mobility*.18;
    o.flowTargetVY=field.y*mobility+bias+dir*mobility*.16*Math.sin(this.time*.34+phase);
    if(o.y<45)o.flowTargetVY+=(45-o.y)*.7;
    else if(o.y>g.viewportHeight-55)o.flowTargetVY-=(o.y-(g.viewportHeight-55))*.7
   }
   const response=o.kind==='microbe'?4.4:3.2;o.flowVX=(o.flowVX||0)+((o.flowTargetVX||0)-(o.flowVX||0))*Math.min(1,dt*response);o.flowVY=(o.flowVY||0)+((o.flowTargetVY||0)-(o.flowVY||0))*Math.min(1,dt*response);o.x=clamp(o.x+o.flowVX*dt,22,g.worldWidth-22);o.y+=o.flowVY*dt;o.flowAge=(o.flowAge||0)+dt
  })
 }
 render(c,width,height){
  const t=this.time;c.save();c.globalCompositeOperation='lighter';
  for(let lane=0;lane<8;lane++){
   const phase=lane*1.73,dir=lane%3===0?-1:1,baseX=(lane+.45)*width/8,amp=24+(lane%3)*13;
   c.strokeStyle=lane%4===0?'rgba(134,239,173,.025)':lane%4===1?'rgba(127,210,255,.022)':lane%4===2?'rgba(213,180,255,.020)':'rgba(255,209,115,.018)';c.lineWidth=1+(lane%2)*.35;c.setLineDash([9,20]);c.lineDashOffset=-t*(54+lane*4)*dir;c.beginPath();
   for(let y=-30;y<=height+30;y+=24){const x=baseX+Math.sin(y*.014+t*.42+phase)*amp+Math.sin(y*.006-t*.31+phase)*amp*.45;y===-30?c.moveTo(x,y):c.lineTo(x,y)}c.stroke();c.setLineDash([]);
   for(let j=0;j<5;j++){
    let u=(j/5+t*(.072+lane*.004)*dir+phase*.13)%1;if(u<0)u+=1;const y=u*height,x=baseX+Math.sin(y*.014+t*.42+phase)*amp+Math.sin(y*.006-t*.31+phase)*amp*.45,dy=dir*12,dx=(Math.cos(y*.014+t*.42+phase)*amp*.014+Math.cos(y*.006-t*.31+phase)*amp*.45*.006)*dy;
    c.strokeStyle=lane%2?'rgba(159,225,255,.060)':'rgba(155,247,190,.055)';c.lineWidth=1.2;c.beginPath();c.moveTo(x-dx,y-dy);c.lineTo(x,y);c.stroke();c.fillStyle=lane%2?'rgba(194,237,255,.085)':'rgba(201,255,220,.080)';c.beginPath();c.arc(x,y,1.3+(j%2)*.35,0,TAU);c.fill()
   }
  }
  this.renderExudates(c,height);this.renderObjectTrails(c);c.restore()
 }
 renderExudates(c,height){
  const p=this.game.player;if(!p?.alive)return;const t=this.time,rootX=p.x+p.width/2,rootY=p.y+p.height*.45;
  for(let i=0;i<18;i++){
   const phase=i*2.399,dir=i%5===0?1:-1,u=(t*(.085+(i%4)*.009)+i/18)%1,travel=80+u*(190+(i%5)*26),x=rootX+Math.sin(u*5.4+phase+t*.35)*(18+u*44)+Math.cos(phase)*12,y=rootY+dir*travel,color=i%4===0?'#d5b4ff':i%3===0?'#7fd2ff':'#86efad',alpha=(1-u)*.10+.015;
   if(y<-30||y>height+30)continue;c.strokeStyle=this.rgba(color,alpha*.32);c.lineWidth=.8;c.beginPath();c.moveTo(x-Math.cos(u*5.4+phase)*5,y-dir*10);c.lineTo(x,y);c.stroke();c.fillStyle=this.rgba(color,alpha);c.beginPath();c.arc(x,y,1.1+(i%3)*.25,0,TAU);c.fill()
  }
 }
 renderObjectTrails(c){
  this.game.pickups.forEachActive(o=>{const vx=o.flowVX||0,vy=o.flowVY||0,s=Math.hypot(vx,vy);if(s<12)return;const color=o.kind==='microbe'?'#bfffe1':o.type==='carbon'?'#86efad':o.type==='nitrogen'?'#d5b4ff':o.type==='phosphate'?'#ffd173':'#99abc7',scale=Math.min(34,s*.16);c.strokeStyle=this.rgba(color,.30);c.lineWidth=o.kind==='microbe'?2:1.3;c.beginPath();c.moveTo(o.x,o.y);c.lineTo(o.x-vx/s*scale,o.y-vy/s*scale);c.stroke()});
  this.game.enemies.forEachActive(e=>{const vx=e.vx||0,vy=e.vy||0,s=Math.hypot(vx,vy);if(s<35)return;const scale=Math.min(46,s*.055);c.strokeStyle=this.rgba(e.color,.20);c.lineWidth=Math.max(1.1,(e.radius||15)*.075);c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x-vx/s*scale,e.y-vy/s*scale);c.stroke()})
 }
 rgba(color,a){if(color?.[0]==='#'){let h=color.slice(1);if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}return color}
}
