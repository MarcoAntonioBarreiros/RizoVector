const TAU=Math.PI*2;
const rand=(a,b)=>a+Math.random()*(b-a);
const PRESETS=Object.freeze({
 spark:{shape:'streak',speed:[245,520],life:[.82,1.28],radius:[1.2,2.5],length:[15,32],width:[.8,1.7],gravity:[4,34],turn:[-.28,.28],fadePower:[.85,1.15],fadeStart:[.34,.46],drag:[.986,.994],glow:[.72,1],spinSpeed:[-2.5,2.5]},
 bloom:{shape:'orb',speed:[70,175],life:[1.45,2.25],radius:[2.4,4.8],length:[0,0],width:[0,0],gravity:[-18,18],turn:[-.55,.55],fadePower:[.75,1.05],fadeStart:[.48,.64],drag:[.982,.991],glow:[.75,1.05],grow:[.45,1.1],spinSpeed:[-1.5,1.5]},
 vortex:{shape:'arc',speed:[115,235],life:[1.55,2.45],radius:[1.6,3.1],length:[18,36],width:[1.1,2.2],gravity:[-6,10],turn:[2.4,4.3],fadePower:[.82,1.1],fadeStart:[.42,.58],drag:[.988,.995],glow:[.8,1.1],spinSpeed:[8,15]},
 spiral:{shape:'spiral',speed:[82,165],life:[1.8,2.75],radius:[1.8,3.3],length:[20,39],width:[1,2],gravity:[-12,12],turn:[1.5,2.7],fadePower:[.78,1.02],fadeStart:[.48,.64],drag:[.989,.996],glow:[.82,1.15],spinSpeed:[16,28]},
 filament:{shape:'ribbon',speed:[145,320],life:[1.15,1.9],radius:[1.3,2.6],length:[24,48],width:[.9,1.9],gravity:[-5,30],turn:[-.9,.9],fadePower:[.82,1.08],fadeStart:[.38,.52],drag:[.986,.994],glow:[.72,1.02],spinSpeed:[-3.5,3.5]},
 shatter:{shape:'shard',speed:[190,385],life:[1.05,1.72],radius:[1.7,3.4],length:[13,29],width:[1.1,2.5],gravity:[34,96],turn:[-.55,.55],fadePower:[.9,1.18],fadeStart:[.34,.48],drag:[.984,.992],glow:[.7,1],spinSpeed:[-10,10]},
 spore:{shape:'orb',speed:[30,92],life:[1.9,3.05],radius:[1.8,3.5],length:[0,0],width:[0,0],gravity:[-18,10],turn:[-.4,.4],fadePower:[.72,.98],fadeStart:[.55,.72],drag:[.991,.997],glow:[.7,1],grow:[.15,.5],motion:'wobble',spinSpeed:[-2,2]},
 dissolve:{shape:'cloud',speed:[9,42],life:[2.15,3.35],radius:[4.8,10.5],length:[0,0],width:[0,0],gravity:[-28,-6],turn:[-.25,.25],fadePower:[1.05,1.45],fadeStart:[.82,.94],drag:[.988,.995],glow:[.5,.8],grow:[1.2,2.3],spinSpeed:[-.8,.8]}
});
export const PARTICLE_EFFECTS=Object.freeze({
 'Rajada radial':{preset:'spark',count:34,options:{pattern:'radial',speedScale:1.12}},
 'Floração luminosa':{preset:'bloom',count:28,options:{pattern:'ring',ringRadius:12}},
 'Vórtice de arcos':{preset:'vortex',count:24,options:{pattern:'vortex',ringRadius:18,vortexDirection:1}},
 'Espirais quimiotáxicas':{preset:'spiral',count:18,options:{pattern:'vortex',ringRadius:10,vortexDirection:-1}},
 'Ruptura filamentosa':{preset:'filament',count:26,options:{pattern:'fan',spread:Math.PI*1.55}},
 'Fragmentação em cascata':{preset:'shatter',count:18,options:{pattern:'radial',splitPreset:'shatter',splitCount:3,splitAt:.56,splitSize:.34,splitSpeed:.72}},
 'Dissolução luminosa':{preset:'dissolve',count:18,options:{pattern:'cloud',originSpread:26}},
 'Nuvem de propágulos':{preset:'spore',count:26,options:{pattern:'cloud',originSpread:18}}
});
export const PARTICLE_EFFECT_NAMES=Object.keys(PARTICLE_EFFECTS);
function pathFor(pattern,index,total,baseAngle,spread,options){
 const u=(index+.5)/Math.max(1,total),theta=u*TAU+(options.phase||0),jitter=(Math.random()-.5)*(options.angleJitter??.12);
 if(pattern==='radial')return{x:0,y:0,angle:theta+jitter};
 if(pattern==='ring'){const r=options.ringRadius??12;return{x:Math.cos(theta)*r,y:Math.sin(theta)*r,angle:theta+jitter}};
 if(pattern==='vortex'){const r=options.ringRadius??16,dir=options.vortexDirection??1;return{x:Math.cos(theta)*r,y:Math.sin(theta)*r,angle:theta+dir*Math.PI/2+jitter,turnDirection:dir}};
 if(pattern==='fan'){const angle=baseAngle-spread*.5+spread*u+jitter;return{x:0,y:0,angle}};
 return{x:(Math.random()-.5)*(options.originSpread||12),y:(Math.random()-.5)*(options.originSpread||12),angle:baseAngle+(Math.random()-.5)*spread}
}
export function createParticle(presetName,x,y,color,options={}){
 const preset=PRESETS[presetName]||PRESETS.bloom,index=options.index??0,total=options.total??1,baseAngle=options.angle??-Math.PI/2,spread=options.spread??TAU,path=pathFor(options.pattern||'scatter',index,total,baseAngle,spread,options),speed=rand(...preset.speed),life=rand(...preset.life),radius=rand(...preset.radius),length=rand(...preset.length),width=rand(...preset.width),turnMagnitude=Math.abs(rand(...preset.turn)),turnDirection=path.turnDirection??(Math.random()<.5?-1:1),palette=options.palette||null,spinRange=preset.spinSpeed||[-5.5,5.5],spinSign=path.turnDirection??(Math.random()<.5?-1:1);
 return{
  x:x+path.x,y:y+path.y,vx:Math.cos(path.angle)*speed+(options.vx||0),vy:Math.sin(path.angle)*speed+(options.vy||0),grav:rand(...preset.gravity),
  life,maxLife:life,radius,color:palette?palette[(Math.random()*palette.length)|0]:color,kind:presetName==='dissolve'?'smoke':'particle',shape:preset.shape,motion:preset.motion||'ballistic',
  blend:options.blend??'add',alpha:options.alpha??1,length,width,turnRate:turnDirection*turnMagnitude,spin:Math.random()*TAU,spinSpeed:spinSign*Math.abs(rand(...spinRange)),curve:rand(-.72,.72),
  fadePower:rand(...preset.fadePower),fadeStart:rand(...preset.fadeStart),birthFade:options.birthFade??.035,drag:rand(...preset.drag),grow:rand(...(preset.grow||[0,0])),
  glowAlpha:rand(...preset.glow),glowScale:options.glowScale??1,splitPreset:options.noSplit?null:(options.splitPreset||null),splitCount:options.splitCount||0,
  splitAt:options.splitAt??0,splitSize:options.splitSize??.35,splitSpeed:options.splitSpeed??.7,splitDone:false,wob:Math.random()*TAU,wobSpeed:rand(1.1,2.4)
 }
}
