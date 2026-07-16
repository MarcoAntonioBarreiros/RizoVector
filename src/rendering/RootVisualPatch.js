import{EnhancedRenderer}from'./EnhancedRenderer.js';

/*
 * Redesenha o corpo radicular como um eixo contínuo.
 * A versão anterior aplicava um contorno marrom e um gradiente novo em
 * cada pequeno segmento, criando a aparência de anéis/escamas.
 */
EnhancedRenderer.prototype.rootBody=function(c){
 const sys=this.game.rootGrowth,p=this.game.player,pts=sys.points;
 if(!pts||pts.length<2)return;

 c.save();
 c.lineCap='round';
 c.lineJoin='round';

 // Corpo principal: todos os trechos usam a mesma cor, eliminando emendas visíveis.
 c.strokeStyle='rgba(220,204,168,.98)';
 for(let i=1;i<pts.length;i++){
  const a=pts[i-1],b=pts[i],ageRatio=1-i/pts.length;
  const width=10+p.growthLevel*1.6+ageRatio*16;
  c.lineWidth=width;
  c.beginPath();
  c.moveTo(a.x,a.y);
  c.lineTo(b.x,b.y);
  c.stroke();
 }

 // Luz longitudinal desenhada como uma linha única, sem reiniciar em cada ponto.
 c.strokeStyle='rgba(255,244,218,.17)';
 c.lineWidth=Math.max(1.5,2.1+p.growthLevel*.18);
 c.beginPath();
 c.moveTo(pts[0].x,pts[0].y);
 for(let i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);
 c.stroke();

 // Raízes laterais também sem contorno escuro.
 for(const br of sys.branches){
  const len=br.length*br.growth;
  const ex=br.x+br.dir*len;
  const ey=br.y+br.bend*br.growth+len*.18;
  const width=4+p.growthLevel*.5;
  c.strokeStyle='rgba(215,198,161,.96)';
  c.lineWidth=width;
  c.beginPath();
  c.moveTo(br.x,br.y);
  c.quadraticCurveTo(br.x+br.dir*len*.45,br.y-20+br.bend*.4,ex,ey);
  c.stroke();

  c.strokeStyle='rgba(255,243,218,.14)';
  c.lineWidth=Math.max(.8,width*.22);
  c.beginPath();
  c.moveTo(br.x,br.y);
  c.quadraticCurveTo(br.x+br.dir*len*.45,br.y-20+br.bend*.4,ex,ey);
  c.stroke();
 }

 // Mantém os sinais visuais das associações biológicas.
 if(p.modules.rhizobium){
  for(let i=12;i<pts.length;i+=23){
   const pt=pts[i],pulse=1+Math.sin(this.game.time*2+pt.phase)*.15;
   c.fillStyle='#a98cff';
   c.shadowBlur=11;
   c.shadowColor='#a98cff';
   c.beginPath();
   c.ellipse(pt.x+((i%2)?-1:1)*(8+(1-i/pts.length)*8),pt.y,4.2*pulse,3.1*pulse,0,0,Math.PI*2);
   c.fill();
  }
  c.shadowBlur=0;
 }

 if(p.modules.mycorrhiza){
  for(let i=18;i<pts.length;i+=29){
   const pt=pts[i],side=i%2?-1:1;
   c.strokeStyle='rgba(213,180,255,.48)';
   c.lineWidth=1.2;
   c.beginPath();
   c.moveTo(pt.x,pt.y);
   c.bezierCurveTo(pt.x+side*18,pt.y+10,pt.x+side*31,pt.y+28,pt.x+side*44,pt.y+42);
   c.stroke();
  }
 }

 c.restore();
};
