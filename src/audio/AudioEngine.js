// Sintetizador procedural: vozes (osciladores), texturas de ruído filtrado,
// pan estéreo por posição e um leito ambiente que muda com o bioma e a ameaça fúngica.
export class AudioEngine{
 constructor(){this.context=null;this.master=null;this.ambient=null;this._noise=null;this.biome='organic';this._active=false;this._suspendTimer=0;this._muted=false;}
 ensure(){
  if(!this.context){
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
   const c=this.context=new AC();
   this.master=c.createGain();this.master.gain.value=this._muted?0:.85;
   const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=22;comp.ratio.value=12;comp.attack.value=.003;comp.release.value=.25;
   this.master.connect(comp).connect(c.destination);
   this.startAmbient();
  }
  if(this.context.state==='suspended')this.context.resume();
 }
 get now(){return this.context.currentTime}
 noiseBuffer(){if(this._noise)return this._noise;const c=this.context,len=c.sampleRate|0,buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);let last=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=w*.4+last*.85}return this._noise=buf}
 panner(x){const c=this.context;if(typeof x!=='number'||!c.createStereoPanner)return null;const p=c.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,(x/innerWidth)*2-1));return p}
 // Voz tonal com ataque/decaimento exponencial e glide opcional de frequência.
 blip(freq,{type='sine',dur=.12,gain=.05,glide=0,delay=0,pan=null,attack=.005}={}){
  this.ensure();if(!this.context)return;const c=this.context,t=this.now+delay,o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);if(glide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*glide),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);const pn=this.panner(pan);if(pn){g.connect(pn);pn.connect(this.master)}else g.connect(this.master);
  o.start(t);o.stop(t+dur+.03)
 }
 // Textura percussiva de ruído filtrado (impactos, dissolução, sopros orgânicos).
 burstNoise({dur=.12,gain=.06,freq=1200,q=1,type='bandpass',glide=0,pan=null}={}){
  this.ensure();if(!this.context)return;const c=this.context,t=this.now,src=c.createBufferSource();src.buffer=this.noiseBuffer();
  const f=c.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(freq,t);if(glide)f.frequency.exponentialRampToValueAtTime(Math.max(60,freq*glide),t+dur);f.Q.value=q;
  const g=c.createGain();g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(f).connect(g);const pn=this.panner(pan);if(pn){g.connect(pn);pn.connect(this.master)}else g.connect(this.master);
  src.start(t);src.stop(t+dur+.03)
 }
 tone(freq,dur=.08,type='sine',gain=.02){this.blip(freq,{type,dur,gain})} // compat
 // Eventos nomeados
 shoot(x){this.blip(720+Math.random()*90,{type:'square',dur:.05,gain:.011,glide:.55,pan:x})}
 enemyHit(x){this.burstNoise({dur:.06,gain:.045,freq:2300,q:.8,glide:.5,pan:x})}
 enemyDeath(type,x){const fungal=type==='spore'||type==='fungalHypha';
  if(fungal){this.burstNoise({dur:.24,gain:.07,freq:560,q:.6,glide:.3,type:'lowpass',pan:x});this.blip(150,{type:'sine',dur:.26,gain:.05,glide:.5,pan:x})}
  else{this.burstNoise({dur:.16,gain:.06,freq:1500,q:.9,glide:.4,pan:x});this.blip(94,{type:'triangle',dur:.16,gain:.04,glide:.55,pan:x})}}
 damage(x){this.blip(82,{type:'sawtooth',dur:.16,gain:.05,glide:.5,pan:x});this.burstNoise({dur:.1,gain:.05,freq:420,type:'lowpass',pan:x})}
 pickup(x){this.blip(560,{type:'sine',dur:.08,gain:.028,pan:x});this.blip(840,{type:'sine',dur:.12,gain:.022,delay:.04,pan:x})}
 recruit(x){[0,4,7,12].forEach((s,i)=>this.blip(440*2**(s/12),{type:'triangle',dur:.3,gain:.03,delay:i*.06,pan:x}))}
 evolve(){[0,4,7,12,16].forEach((s,i)=>this.blip(330*2**(s/12),{type:'triangle',dur:.5,gain:.045,delay:i*.075}));this.blip(110,{type:'sine',dur:.7,gain:.05})}
 crystal(x){this.blip(1300,{type:'sine',dur:.18,gain:.028,glide:1.4,pan:x});this.burstNoise({dur:.2,gain:.038,freq:5200,q:2,glide:.35,pan:x})}
 hypha(x){this.burstNoise({dur:.18,gain:.06,freq:900,q:1.5,glide:.25,pan:x});this.blip(240,{type:'sawtooth',dur:.14,gain:.03,glide:.4,pan:x})}
 dash(){this.burstNoise({dur:.26,gain:.05,freq:380,q:.7,glide:6,type:'bandpass'})}
 whoosh(x){this.burstNoise({dur:.22,gain:.045,freq:520,q:.6,glide:4,pan:x})}
 isr(){[0,7,12].forEach((s,i)=>this.blip(392*2**(s/12),{type:'sine',dur:.6,gain:.045,delay:i*.05}));this.burstNoise({dur:.5,gain:.04,freq:1200,q:.5,glide:5})}
 tricho(x){this.blip(300,{type:'triangle',dur:.3,gain:.038,glide:1.6,pan:x});this.burstNoise({dur:.25,gain:.038,freq:1500,q:1.2,glide:.4,pan:x})}
 heartbeat(){this.blip(60,{type:'sine',dur:.16,gain:.06});this.blip(55,{type:'sine',dur:.2,gain:.05,delay:.2})}
 // Leito ambiente contínuo
 startAmbient(){
  const c=this.context;if(!c||this.ambient)return;
  const bus=c.createGain();bus.gain.value=0;bus.connect(this.master);
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=320;lp.Q.value=.6;lp.connect(bus);
  const voices=[1,1.5,2].map((m,i)=>{const o=c.createOscillator();o.type=i?'sine':'triangle';o.frequency.value=55*m;const g=c.createGain();g.gain.value=i===0?.4:.16;o.connect(g).connect(lp);o.start();return o});
  const lfo=c.createOscillator(),lfoG=c.createGain();lfo.frequency.value=.06;lfoG.gain.value=90;lfo.connect(lfoG).connect(lp.frequency);lfo.start();
  const dread=c.createOscillator(),dreadG=c.createGain();dread.type='sawtooth';dread.frequency.value=58.3;dreadG.gain.value=0;dread.connect(dreadG).connect(lp);dread.start();
  this.ambient={bus,voices,dreadG};if(this._active)bus.gain.linearRampToValueAtTime(.22,c.currentTime+3);
 }
 // Liga/desliga o leito ambiente e suspende o contexto quando o jogo não está ativo
 // (evita o drone continuar zumbindo no game over ou com a aba oculta).
 setActive(on){
  this._active=on;if(!this.context)return;const c=this.context;
  if(this.ambient)this.ambient.bus.gain.setTargetAtTime(on?.22:0,c.currentTime,.35);
  clearTimeout(this._suspendTimer);
  if(on){if(c.state==='suspended')c.resume()}
  else this._suspendTimer=setTimeout(()=>{if(!this._active&&c.state==='running')c.suspend()},900);
 }
 toggleMute(){this._muted=!this._muted;if(this.master)this.master.gain.setTargetAtTime(this._muted?0:.85,this.now,.04);if(!this._muted&&this.context&&this.context.state==='suspended'&&this._active)this.context.resume();return this._muted}
 setBiome(name){if(!this.ambient)return;this.biome=name;const c=this.context,base={organic:55,mineral:49,wet:62,compacted:46}[name]||55;this.ambient.voices.forEach((o,i)=>o.frequency.exponentialRampToValueAtTime(base*[1,1.5,2][i],c.currentTime+2))}
 setDread(x){if(!this.ambient)return;this.ambient.dreadG.gain.setTargetAtTime(Math.max(0,Math.min(.16,x)),this.now,.6)}
}
