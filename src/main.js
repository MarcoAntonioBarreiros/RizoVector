import{InputManager}from'./core/InputManager.js';
import{Game}from'./core/Game.js';
import{GameLoop}from'./core/GameLoop.js';
import{EnhancedRenderer}from'./rendering/EnhancedRenderer.js';
import{IntroSequence}from'./intro/IntroSequence.js';
import'./intro/IntroBiologyPatch.js';
import'./rendering/RootVisualPatch.js';
import'./modes/RootDirectionTestPatch.js';

const canvas=document.getElementById('game');
const input=new InputManager;
const game=new Game(canvas,input);
const renderer=new EnhancedRenderer(game,canvas);
const loop=new GameLoop(dt=>game.update(dt),()=>renderer.render());
const appEl=document.getElementById('app');
const intro=new IntroSequence({
 overlay:document.getElementById('germinationIntro'),
 canvas:document.getElementById('germinationCanvas'),
 caption:document.getElementById('germinationCaption'),
 eyebrow:document.getElementById('germinationEyebrow'),
 skipButton:document.getElementById('skipIntroButton'),
 app:appEl
});
let starting=false;

function hideScreens(){
 document.getElementById('startScreen').classList.remove('visible');
 document.getElementById('gameOverScreen').classList.remove('visible');
}

async function startGame({silent=false,skipIntro=false}={}){
 if(starting)return;
 starting=true;
 hideScreens();
 if(!silent)game.audio.ensure();
 const query=new URLSearchParams(location.search);
 const shouldSkip=skipIntro||query.get('skipIntro')==='1'||query.get('intro')==='0';
 let gameStarted=false;
 const begin=()=>{if(gameStarted)return;gameStarted=true;game.start()};
 try{
  if(shouldSkip)begin();
  else await intro.play({beforeReveal:begin});
 }catch(error){
  console.error('Falha na animação inicial:',error);
 }finally{
  begin();
  starting=false;
 }
}

function restartGame(){
 hideScreens();
 game.audio.ensure();
 game.start();
}

document.getElementById('startButton').addEventListener('click',()=>startGame());
document.getElementById('restartButton').addEventListener('click',restartGame);
document.getElementById('zoomOutButton').addEventListener('click',()=>game.setZoom(-.08));
document.getElementById('zoomInButton').addEventListener('click',()=>game.setZoom(.08));

const uiToggle=document.getElementById('uiToggle');
const toggleUI=()=>{const hidden=appEl.classList.toggle('ui-hidden');uiToggle.textContent=hidden?'⊞ HUD':'⊟ HUD'};
uiToggle.addEventListener('click',toggleUI);
addEventListener('keydown',event=>{if(event.code==='KeyH'&&!intro.active)toggleUI()});

document.getElementById('helpButton').addEventListener('click',()=>alert(`A vitalidade não cai automaticamente.

Bacillus agora gera um biofilme temporário: ele decai com o tempo e também se desgasta em impactos, então encontrar novos Bacillus volta a ser útil.
Rhizobium aumenta a assimilação de N; o N faz a raiz crescer e evolui os tiros.
Q usa a carga de Trichoderma para degradar barreiras fúngicas que crescem em cena.
E ativa uma PGPB indutora de resistência sistêmica: remove penalidades, projéteis e parasitas aderentes da raiz.
Os botões de zoom permitem ver um pouco mais da arquitetura radicular formada.`));

addEventListener('keydown',event=>{
 if(event.code==='KeyM'&&!intro.active){
  const muted=game.audio.toggleMute();
  game.ui.center(muted?'SOM SILENCIADO (M)':'SOM LIGADO (M)',1.3);
 }
});

document.addEventListener('visibilitychange',()=>{
 if(!game.audio)return;
 if(document.hidden)game.audio.setActive(false);
 else if(game.running)game.audio.setActive(true);
});

loop.start();
if(new URLSearchParams(location.search).get('autostart')==='1')setTimeout(()=>startGame({silent:true,skipIntro:true}),80);
