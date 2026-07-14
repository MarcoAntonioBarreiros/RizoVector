import{MICROBES,BIOMES}from'../data/catalog.js';
export class UISystem{
 constructor(game){
  this.game=game;
  for(const id of['healthBar','shieldBar','nitrogenBar','depthLabel','phosphateValue','ironValue','carbonValue','moduleList','toastTitle','toastBody','nitrogenReady','biomeLabel','centerPrompt','mycoAbility','azoAbility','trichoAbility','isrAbility','trichoBar','isrBar','trichoReady','isrReady','statusList','damageCause','damageArrow','biofilmInfo','zoomLabel'])this[id]=document.getElementById(id);
  this.toastElement=document.getElementById('toast');this.toastTimer=0;this.centerTimer=0;this.damageTimer=0;this.nitrogenBlock=document.querySelector('.nitrogen-block')
 }
 update(dt){
  const p=this.game.player;
  this.healthBar.style.width=`${p.health/p.maxHealth*100}%`;this.shieldBar.style.width=`${p.shield/p.maxShield*100}%`;this.nitrogenBar.style.width=`${p.nitrogen}%`;this.depthLabel.textContent=`Profundidade: ${Math.floor(this.game.depth)} m`;this.phosphateValue.textContent=Math.floor(p.phosphate);this.ironValue.textContent=Math.floor(p.iron);this.carbonValue.textContent=Math.floor(p.carbon);this.biomeLabel.textContent=BIOMES[this.game.currentBiome]?.name||'Rizosfera';this.zoomLabel.textContent=`Zoom ${this.game.viewScale.toFixed(2)}×`;
  this.biofilmInfo.textContent=p.biofilmTimer>0?`Biofilme ativo: ${p.biofilmTimer.toFixed(1)}s restantes`:'Biofilme inativo';
  this.nitrogenBlock.classList.toggle('ready',p.nitrogen>=85);this.nitrogenReady.textContent=`Raiz nível ${p.growthLevel}/4 — ${Math.floor(p.nitrogen)}% do próximo crescimento`;
  this.setAbility(this.mycoAbility,!!p.modules.mycorrhiza,p.dashCooldown<=0,p.modules.mycorrhiza?(p.dashCooldown<=0?'superimpulso pronto':'recarregando'):'não adquirida');
  this.setAbility(this.azoAbility,!!p.modules.azospirillum,p.rootCooldown<=0,p.channelActive?'CANAL ATIVO':p.modules.azospirillum?(p.rootCooldown<=0?'desvio pronto':'recarregando'):'não adquirida');
  this.trichoBar.style.width=`${p.trichoCharge}%`;this.isrBar.style.width=`${p.isrCharge}%`;
  const trichoReady=!!p.modules.trichoderma&&p.trichoCharge>=50,isrReady=!!p.modules.isr&&p.isrCharge>=100;
  this.trichoAbility.classList.toggle('active',!!p.modules.trichoderma);this.trichoAbility.classList.toggle('tricho-ready',trichoReady);this.isrAbility.classList.toggle('active',!!p.modules.isr);this.isrAbility.classList.toggle('isr-ready',isrReady);
  this.trichoReady.textContent=trichoReady?'MICOPARASITISMO PRONTO':p.modules.trichoderma?`${Math.floor(p.trichoCharge)}% de carga`:'não adquirido';
  this.isrReady.textContent=isrReady?'PULSO ISR PRONTO':p.modules.isr?`${Math.floor(p.isrCharge)}% de preparo`:'não adquirida';
  const statuses=this.game.status.list();this.statusList.innerHTML=statuses.length?statuses.map(s=>`<span class="status-chip" style="--chip:${s.color}">${s.name}: ${s.duration.toFixed(1)}s</span>`).join(''):'<span class="status-empty">Nenhuma penalidade ativa</span>';
  if(p.resistanceTimer>0)this.statusList.innerHTML+=`<span class="status-chip" style="--chip:#d9ef88">Resistência induzida: ${p.resistanceTimer.toFixed(1)}s</span>`;
  if(this.toastTimer>0){this.toastTimer-=dt;if(this.toastTimer<=0)this.toastElement.classList.remove('show')}if(this.centerTimer>0){this.centerTimer-=dt;if(this.centerTimer<=0)this.centerPrompt.classList.remove('show')}if(this.damageTimer>0){this.damageTimer-=dt;if(this.damageTimer<=0){this.damageCause.textContent='Estável — sem drenagem automática';this.damageCause.classList.remove('hit')}}
 }
 setAbility(el,active,ready,text){el.classList.toggle('active',active);el.classList.toggle('ready',ready);el.querySelector('span').textContent=text}
 toast(title,body,seconds=4.5){this.toastTitle.textContent=title;this.toastBody.textContent=body;this.toastTimer=seconds;this.toastElement.classList.add('show')}
 center(text,seconds=1.5){this.centerPrompt.textContent=text;this.centerTimer=seconds;this.centerPrompt.classList.add('show')}
 damage(source,amount,angle){this.damageCause.textContent=`-${Math.round(amount)}: ${source}`;this.damageCause.classList.remove('hit');void this.damageCause.offsetWidth;this.damageCause.classList.add('hit');this.damageTimer=2.2;this.damageArrow.style.setProperty('--angle',`${angle+Math.PI/2}rad`);this.damageArrow.classList.remove('show');void this.damageArrow.offsetWidth;this.damageArrow.classList.add('show')}
 updateModules(modules){this.moduleList.innerHTML=Object.entries(modules).map(([id,level])=>{const m=MICROBES[id];return `<div class="module"><span class="icon" style="background:${m.color}22;color:${m.color};border:1px solid ${m.color}55">${level}</span><div><strong>${m.name}</strong><span>${m.slot}</span></div></div>`}).join('')}
 showResults(){const p=this.game.player;document.getElementById('results').innerHTML=`<div><b>${Math.floor(this.game.depth)} m</b><span>profundidade</span></div><div><b>${Math.floor(p.score)}</b><span>pontuação</span></div><div><b>${Object.keys(p.modules).length}/8</b><span>módulos biológicos</span></div><div><b>Nível ${p.growthLevel}</b><span>crescimento da raiz</span></div><div><b>${Math.floor(p.health)}%</b><span>vitalidade final</span></div><div><b>${this.game.seed}</b><span>seed</span></div>`;document.getElementById('gameOverScreen').classList.add('visible')}
}
