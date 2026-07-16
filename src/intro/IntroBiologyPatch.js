import{IntroSequence}from'./IntroSequence.js';

const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const smoothstep=(a,b,value)=>{const t=clamp((value-a)/(b-a));return t*t*(3-2*t)};
const easeOutCubic=t=>1-Math.pow(1-clamp(t),3);
const TAU=Math.PI*2;

/*
 * Mantém a animação cinematográfica original, mas aproxima a radícula
 * da linguagem visual usada no gameplay: corpo contínuo, claro e sem
 * contorno escuro segmentando o eixo radicular.
 */
IntroSequence.prototype._drawRoot=function(c,time,germination,scene){
 if(germination<=.015)return;

 c.save();
 c.lineCap='round';
 c.lineJoin='round';

 const rootGradient=c.createLinearGradient(scene.startX,scene.startY,scene.tipX,scene.tipY);
 rootGradient.addColorStop(0,'#d7bd88');
 rootGradient.addColorStop(.48,'#e4d0a5');
 rootGradient.addColorStop(1,'#f2e5c6');
 c.strokeStyle=rootGradient;
 c.lineWidth=10;
 this._rootPath(c,scene);
 c.stroke();

 // Faixa luminosa contínua: dá volume sem criar anéis entre os segmentos.
 c.strokeStyle='rgba(255,250,229,.24)';
 c.lineWidth=2.1;
 this._rootPath(c,scene);
 c.stroke();

 const hairStart=smoothstep(1.5,2.75,time);
 if(hairStart>0){
  for(let i=0;i<23;i++){
   const u=.10+i/28;
   if(u>.72*germination)continue;
   const point=this._rootPoint(scene,u),tangent=this._rootTangent(scene,u),side=i%2?-1:1;
   const normal={x:-tangent.y,y:tangent.x};
   const length=(5+(i%5)*1.8)*hairStart;
   c.strokeStyle=`rgba(232,222,194,${.12+hairStart*.24})`;
   c.lineWidth=.65;
   c.beginPath();
   c.moveTo(point.x,point.y);
   c.quadraticCurveTo(
    point.x+normal.x*length*.55*side+tangent.x*3,
    point.y+normal.y*length*.55*side+tangent.y*3,
    point.x+normal.x*length*side,
    point.y+normal.y*length*side
   );
   c.stroke();
  }
 }
 c.restore();

 // Coifa arredondada e ocre, visualmente compatível com a ponta do jogo.
 const tangent=this._rootTangent(scene,1),angle=Math.atan2(tangent.y,tangent.x);
 c.save();
 c.translate(scene.tipX,scene.tipY);
 c.rotate(angle-Math.PI/2);
 c.shadowBlur=13;
 c.shadowColor='rgba(238,216,170,.36)';
 const cap=c.createLinearGradient(0,-14,0,15);
 cap.addColorStop(0,'#e4c994');
 cap.addColorStop(.48,'#c99a59');
 cap.addColorStop(1,'#9d6332');
 c.fillStyle=cap;
 c.beginPath();
 c.moveTo(-6.5,-11);
 c.quadraticCurveTo(0,-16,6.5,-11);
 c.lineTo(8,5.5);
 c.quadraticCurveTo(5.5,13,0,15);
 c.quadraticCurveTo(-5.5,13,-8,5.5);
 c.closePath();
 c.fill();
 c.shadowBlur=0;

 const highlight=c.createLinearGradient(0,-10,0,10);
 highlight.addColorStop(0,'rgba(255,245,216,.48)');
 highlight.addColorStop(1,'rgba(255,236,198,.10)');
 c.fillStyle=highlight;
 c.beginPath();
 c.ellipse(-1,-1,2.4,9.5,0,0,TAU);
 c.fill();
 c.restore();
};

/* Textos exclusivamente biológicos; nenhuma referência à câmera ou à mecânica. */
IntroSequence.prototype._updateCaption=function(time){
 let eyebrow='SEMENTE DE FEIJÃO';
 let caption='A semente permanece quiescente até encontrar água, oxigênio e temperatura favoráveis.';

 if(time>=.8){
  eyebrow='GERMINAÇÃO';
  caption='A embebição reativa o metabolismo e a radícula rompe o tegumento.';
 }
 if(time>=3.08){
  eyebrow='CRESCIMENTO RADICULAR';
  caption='A coifa protege o meristema apical enquanto a raiz penetra e explora o solo.';
 }
 if(time>=4.42){
  eyebrow='GRAVITROPISMO POSITIVO';
  caption='A radícula cresce orientada pela gravidade e estabelece o eixo principal do sistema radicular.';
 }
 if(time>=5.75){
  eyebrow='RIZOSFERA';
  caption='Exsudatos liberados pela raiz moldam a comunidade microbiana ao redor da ponta radicular.';
 }

 const key=`${eyebrow}|${caption}`;
 if(key===this.lastCaption)return;
 this.lastCaption=key;
 this.eyebrow.textContent=eyebrow;
 this.caption.textContent=caption;
};
