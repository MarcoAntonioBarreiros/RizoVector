const TAU=Math.PI*2;
export class EffectsSystem{
 constructor(game){this.game=game}
 burst(x,y,color,count=18,speed=170){for(let i=0;i<count;i++){const a=Math.random()*TAU,v=25+Math.random()*speed;if(!this.game.particles.acquire({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,grav:38,life:.45+Math.random()*.8,maxLife:1.25,radius:1.3+Math.random()*3.2,color,kind:'particle',blend:'add',alpha:1}))break}}
 smoke(x,y,color,count=4){for(let i=0;i<count;i++)this.game.particles.acquire({x:x+(Math.random()-.5)*14,y:y+(Math.random()-.5)*14,vx:(Math.random()-.5)*26,vy:-14-Math.random()*24,life:.6+Math.random()*.7,maxLife:1.3,radius:5+Math.random()*7,color,kind:'smoke',blend:null,alpha:.5})}
 sporeCloud(x,y,color,count=10){for(let i=0;i<count;i++)this.game.particles.acquire({x,y,vx:(Math.random()-.5)*30,vy:-8-Math.random()*40,wob:Math.random()*TAU,wobSpeed:1.4+Math.random()*2,life:.8+Math.random()*1.1,maxLife:1.9,radius:1.3+Math.random()*1.9,color,kind:'spore',blend:'add',alpha:.85})}
 tracer(x,y,tx,ty,color){this.game.particles.acquire({x,y,tx,ty,life:.2,maxLife:.2,radius:2,color,kind:'tracer',blend:'add',alpha:1})}
 walkingTracer(x,y,tx,ty,color,width=2,life=.48){this.game.particles.acquire({x,y,tx,ty,life,maxLife:life,radius:width,color,kind:'walker',blend:'add',alpha:1})}
 ring(x,y,color,maxRadius=180,duration=.45){this.game.particles.acquire({x,y,radius:4,maxRadius,life:duration,maxLife:duration,color,kind:'ring',blend:'add',alpha:1})}
 text(x,y,text,color='#ffb7c2'){this.game.particles.acquire({x,y,vx:0,vy:-42,grav:0,life:.85,maxLife:.85,radius:0,color,kind:'text',blend:null,alpha:1,text})}
 superDash(x,y){this.game.audio?.dash();this.ring(x,y,'#d5b4ff',125,.36);this.sporeCloud(x,y,'#86efad',10);for(let i=0;i<62;i++)this.game.particles.acquire({x,y,vx:(Math.random()-.5)*.84*330,vy:Math.random()*330+120,grav:20,life:.35+Math.random()*.6,maxLife:.9,radius:1.5+Math.random()*3.5,color:i%3?'#d5b4ff':'#86efad',kind:'particle',blend:'add',alpha:1})}
 rootRibbon(x,y,dir){this.game.audio?.whoosh(x);this.ring(x,y,'#7fd2ff',90,.3);for(let i=0;i<24;i++)this.game.particles.acquire({x:x-dir*50+i*dir*4,y:y+(i-10)*2,vx:dir*(80+i*5),vy:(i-10)*7,grav:12,life:.48,maxLife:.48,radius:2.1,color:i%2?'#7fd2ff':'#86efad',kind:'particle',blend:'add',alpha:1})}
 rootSpark(x,y,color='#7fd2ff'){const angle=-Math.PI/2+(Math.random()-.5)*1.1,speed=55+Math.random()*95;this.game.particles.acquire({x:x+(Math.random()-.5)*12,y:y+(Math.random()-.5)*16,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,grav:24,life:.28+Math.random()*.24,maxLife:.52,radius:1.4+Math.random()*2.1,color,kind:'particle',blend:'add',alpha:1})}
 resourceDrain(x,y,color){for(let i=0;i<5;i++)this.game.particles.acquire({x:x+(Math.random()-.5)*22,y:y+(Math.random()-.5)*20,vx:(Math.random()-.5)*30,vy:40+Math.random()*55,grav:20,life:.55,maxLife:.55,radius:2,color,kind:'particle',blend:null,alpha:1})}
 crystalDissolve(x,y){this.game.audio?.crystal(x);this.ring(x,y,'#ffd173',100,.55);this.burst(x,y,'#ffd173',38,210);this.sporeCloud(x,y,'#ffe3a1',8)}
 hyphaBreak(x,y){this.game.audio?.hypha(x);this.ring(x,y,'#8df0a8',68,.32);this.burst(x,y,'#8df0a8',24,150);this.burst(x,y,'#d85d9d',15,110);this.smoke(x,y,'#d85d9d',5)}
 enemyEmission(x,y,color,count=2){for(let i=0;i<count;i++)this.game.particles.acquire({x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*10,vx:(Math.random()-.5)*40,vy:30+Math.random()*70,grav:8,life:.5+Math.random()*.5,maxLife:1,radius:1.5+Math.random()*2.5,color,kind:'particle',blend:null,alpha:1})}
 update(dt){this.game.particles.forEachActive(p=>{
  p.life-=dt;if(p.life<=0){this.game.particles.release(p);return}
  if(p.kind==='spore'){p.wob=(p.wob||0)+dt*(p.wobSpeed||2);p.x+=((p.vx||0)+Math.cos(p.wob)*14)*dt;p.y+=((p.vy||0)+Math.sin(p.wob*.7)*10)*dt}
  else if(p.kind==='smoke'){p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;p.vx=(p.vx||0)*.96;p.vy=(p.vy||0)*.96}
  else if(p.kind==='particle'||p.kind==='text'){p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;p.vx=(p.vx||0)*.984;p.vy=((p.vy||0)+(p.grav||0)*dt)*.99}
  if(p.kind==='ring')p.radius+=(p.maxRadius-p.radius)*Math.min(1,dt*8)
 })}
}
