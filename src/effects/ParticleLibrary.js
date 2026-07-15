const TAU=Math.PI*2;
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[(Math.random()*a.length)|0];
const PRESETS=Object.freeze({
 spark:{shapes:['streak','streak','shard','orb'],speed:[230,520],life:[.24,.68],radius:[1.1,2.8],length:[9,25],width:[.7,1.8],gravity:[8,72],turn:[-1.4,1.4],fade:[1.5,2.3]},
 bio:{shapes:['orb','spiral','ribbon','arc'],speed:[135,355],life:[.42,1.05],radius:[1.5,3.8],length:[10,28],width:[1,2.4],gravity:[-18,46],turn:[-3.2,3.2],fade:[1.25,2]},
 filament:{shapes:['ribbon','arc','streak'],speed:[120,330],life:[.38,.92],radius:[1.2,2.6],length:[16,38],width:[.8,2],gravity:[-8,38],turn:[-2.4,2.4],fade:[1.5,2.2]},
 shatter:{shapes:['shard','shard','streak'],speed:[210,470],life:[.32,.82],radius:[1.5,3.4],length:[8,22],width:[1,2.5],gravity:[28,105],turn:[-1.8,1.8],fade:[1.35,2]},
 spiral:{shapes:['spiral','spiral','arc','orb'],speed:[95,285],life:[.58,1.25],radius:[1.5,3.5],length:[12,30],width:[.9,2.1],gravity:[-20,30],turn:[-6.4,6.4],fade:[1.2,1.8]},
 spore:{shapes:['orb','spiral','arc'],speed:[34,122],life:[.75,1.8],radius:[1.3,3],length:[8,20],width:[.8,1.6],gravity:[-26,16],turn:[-2.6,2.6],fade:[1.15,1.7]},
 cloud:{shapes:['cloud'],speed:[12,58],life:[.7,1.55],radius:[4.5,11],length:[0,0],width:[0,0],gravity:[-38,-10],turn:[-.5,.5],fade:[1.5,2.4]}
});
export const PARTICLE_EFFECTS=Object.freeze({
 'Explosão de faíscas':{preset:'spark',count:42},
 'Floração biológica':{preset:'bio',count:46},
 'Espiral quimiotáxica':{preset:'spiral',count:40},
 'Ruptura de filamentos':{preset:'filament',count:38},
 'Fragmentação cristalina':{preset:'shatter',count:44},
 'Nuvem de propágulos':{preset:'spore',count:36},
 'Nova mista':{preset:'mixed',count:58}
});
export const PARTICLE_EFFECT_NAMES=Object.keys(PARTICLE_EFFECTS);
export function createParticle(presetName,x,y,color,options={}){
 const preset=PRESETS[presetName]||PRESETS.bio,baseAngle=options.angle??Math.random()*TAU,spread=options.spread??TAU,angle=baseAngle+(Math.random()-.5)*spread,speed=rand(...preset.speed),shape=pick(preset.shapes),life=rand(...preset.life),radius=rand(...preset.radius),length=rand(...preset.length),width=rand(...preset.width),turnRate=rand(...preset.turn),grav=rand(...preset.gravity),palette=options.palette||null;
 return{x:x+(Math.random()-.5)*(options.originSpread||4),y:y+(Math.random()-.5)*(options.originSpread||4),vx:Math.cos(angle)*speed+(options.vx||0),vy:Math.sin(angle)*speed+(options.vy||0),grav,life,maxLife:life,radius,color:palette?pick(palette):color,kind:presetName==='cloud'?'smoke':'particle',shape,blend:options.blend??'add',alpha:options.alpha??1,length,width,turnRate,spin:Math.random()*TAU,spinSpeed:rand(-8,8),curve:rand(-.8,.8),fadePower:rand(...preset.fade),birthFade:options.birthFade??.08,drag:options.drag??rand(.972,.991)}
}
export function mixedPreset(){return pick(['spark','bio','filament','shatter','spiral'])}
