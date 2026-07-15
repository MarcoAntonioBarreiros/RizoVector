import{Renderer}from'./Renderer.js';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class EnhancedRenderer extends Renderer{
 particle(c,p){
  c.save();const lr=clamp(p.life/p.maxLife,0,1),birth=clamp((1-lr)/(p.birthFade??.035),0,1),fadeStart=p.fadeStart??.55,fade=lr>fadeStart?1:Math.pow(clamp(lr/fadeStart,0,1),p.fadePower??1),alpha=fade*birth*(p.alpha??1);
  c.globalAlpha=alpha;if(p.blend==='add')c.globalCompositeOperation='lighter';
  if(p.kind==='tracer'){c.strokeStyle=p.color;c.lineWidth=1.8;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.tx,p.ty);c.stroke()}
  else if(p.kind==='walker'){const prog=1-p.life/p.maxLife,x1=p.x+(p.tx-p.x)*Math.max(0,prog-.28),y1=p.y+(p.ty-p.y)*Math.max(0,prog-.28),x2=p.x+(p.tx-p.x)*prog,y2=p.y+(p.ty-p.y)*prog;c.strokeStyle=p.color;c.fillStyle=p.color;c.lineWidth=p.radius||2;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.beginPath();c.arc(x2,y2,(p.radius||2)+1,0,TAU);c.fill()}
  else if(p.kind==='beam'){
   const prog=clamp((1-lr)/.34,0,1),dx=p.tx-p.x,dy=p.ty-p.y,d=Math.max(1,Math.hypot(dx,dy)),nx=-dy/d,ny=dx/d,curve=p.curve||0,cx=(p.x+p.tx)/2+nx*curve,cy=(p.y+p.ty)/2+ny*curve;
   const point=u=>{const om=1-u;return{x:om*om*p.x+2*om*u*cx+u*u*p.tx,y:om*om*p.y+2*om*u*cy+u*u*p.ty}};
   const stroke=(width,color,a)=>{c.save();c.globalAlpha=alpha*a;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(p.x,p.y);for(let i=1;i<=18;i++){const u=prog*i/18,q=point(u);c.lineTo(q.x,q.y)}c.stroke();c.restore()};
   stroke((p.width||7)*3.2,p.color,.2);stroke((p.width||7)*1.55,p.color,.58);stroke(Math.max(1.4,(p.width||7)*.34),'rgba(255,255,255,.98)',1);
   const head=point(prog),spr=this.spriteFor(p.color),hr=(p.width||7)*4.2;c.globalAlpha=alpha;c.drawImage(spr,head.x-hr,head.y-hr,hr*2,hr*2);c.fillStyle='#fff';c.beginPath();c.arc(head.x,head.y,Math.max(2,(p.width||7)*.38),0,TAU);c.fill()
  }
  else if(p.kind==='ring'){c.globalAlpha=alpha;c.strokeStyle=p.color;c.lineWidth=3.2;c.beginPath();c.arc(p.x,p.y,p.radius,0,TAU);c.stroke()}
  else if(p.kind==='text'){c.globalCompositeOperation='source-over';c.fillStyle=p.color;c.font='800 16px Inter,system-ui';c.textAlign='center';c.fillText(p.text,p.x,p.y)}
  else{
   const shape=p.shape||(p.kind==='smoke'?'cloud':'orb'),baseR=p.radius||2,growth=1+(1-lr)*(p.grow||0),r=baseR*growth,vx=p.vx||0,vy=p.vy||0,speed=Math.hypot(vx,vy),dir=speed>1?Math.atan2(vy,vx):(p.spin||0),len=(p.length||r*5)*(0.62+lr*.38),w=p.width||Math.max(.8,r*.65);
   c.translate(p.x,p.y);
   if(shape!=='orb'&&shape!=='cloud'){const halo=this.spriteFor(p.color),hr=Math.max(r*5,w*7,len*.38)*(p.glowScale||1);c.save();c.globalAlpha=alpha*(p.glowAlpha??.75);c.drawImage(halo,-hr,-hr,hr*2,hr*2);c.restore()}
   if(shape==='orb'||shape==='cloud'){const spr=this.spriteFor(p.color),rr=shape==='cloud'?r*(1.25+(1-lr)*1.7):r,d=rr*(shape==='cloud'?4.8:4);c.drawImage(spr,-d/2,-d/2,d,d);if(shape==='orb'){c.fillStyle='rgba(255,255,255,.72)';c.beginPath();c.arc(0,0,Math.max(.7,r*.34),0,TAU);c.fill()}}
   else if(shape==='streak'){c.rotate(dir);c.lineCap='round';c.strokeStyle=this._rgba(p.color,.52);c.lineWidth=w*3.6;c.beginPath();c.moveTo(-len,0);c.lineTo(3,0);c.stroke();c.strokeStyle='rgba(255,255,255,.92)';c.lineWidth=Math.max(.8,w*.72);c.beginPath();c.moveTo(-len*.72,0);c.lineTo(3,0);c.stroke()}
   else if(shape==='shard'){c.rotate((p.spin||0)+dir*.22);c.fillStyle=p.color;c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=1;c.beginPath();c.moveTo(len*.46,0);c.lineTo(-len*.34,w*1.9);c.lineTo(-len*.18,-w*1.6);c.closePath();c.fill();c.stroke()}
   else if(shape==='ribbon'){c.rotate(dir);const bend=(p.curve||0)*len;c.lineCap='round';c.strokeStyle=this._rgba(p.color,.5);c.lineWidth=w*3.7;c.beginPath();c.moveTo(-len,0);c.quadraticCurveTo(-len*.45,bend,3,0);c.stroke();c.strokeStyle='rgba(255,255,255,.84)';c.lineWidth=Math.max(.75,w*.62);c.beginPath();c.moveTo(-len*.84,0);c.quadraticCurveTo(-len*.42,bend*.78,3,0);c.stroke()}
   else if(shape==='arc'){c.rotate((p.spin||0)+dir);const rr=Math.max(5,len*.44),span=1.3+Math.abs(p.curve||0);c.strokeStyle=this._rgba(p.color,.62);c.lineWidth=w*2.7;c.beginPath();c.arc(0,0,rr,-span*.5,span*.5);c.stroke();c.strokeStyle='rgba(255,255,255,.82)';c.lineWidth=Math.max(.7,w*.56);c.beginPath();c.arc(0,0,rr,-span*.34,span*.5);c.stroke()}
   else if(shape==='spiral'){c.rotate(p.spin||0);c.lineCap='round';c.strokeStyle=this._rgba(p.color,.68);c.lineWidth=w*2.2;c.beginPath();for(let i=0;i<=15;i++){const u=i/15,a=u*TAU*1.85,rr=u*len*.52,x=Math.cos(a)*rr,y=Math.sin(a)*rr;i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=Math.max(.65,w*.48);c.beginPath();for(let i=5;i<=15;i++){const u=i/15,a=u*TAU*1.85,rr=u*len*.52,x=Math.cos(a)*rr,y=Math.sin(a)*rr;i===5?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}
  }
  c.restore()
 }
}
