import{InputManager}from'./core/InputManager.js';import{Game}from'./core/Game.js';import{GameLoop}from'./core/GameLoop.js';import{Renderer}from'./rendering/Renderer.js';
const canvas=document.getElementById('game'),input=new InputManager,game=new Game(canvas,input),renderer=new Renderer(game,canvas),loop=new GameLoop(dt=>game.update(dt),()=>renderer.render());
function startGame({silent=false}={}){document.getElementById('startScreen').classList.remove('visible');document.getElementById('gameOverScreen').classList.remove('visible');if(!silent)game.audio.ensure();game.start()}
document.getElementById('startButton').addEventListener('click',()=>startGame());document.getElementById('restartButton').addEventListener('click',()=>startGame());
document.getElementById('zoomOutButton').addEventListener('click',()=>game.setZoom(-.08));document.getElementById('zoomInButton').addEventListener('click',()=>game.setZoom(.08));
const uiToggle=document.getElementById('uiToggle'),appEl=document.getElementById('app'),toggleUI=()=>{const h=appEl.classList.toggle('ui-hidden');uiToggle.textContent=h?'⊞ HUD':'⊟ HUD'};
uiToggle.addEventListener('click',toggleUI);addEventListener('keydown',e=>{if(e.code==='KeyH')toggleUI()});
document.getElementById('helpButton').addEventListener('click',()=>alert(`A vitalidade não cai automaticamente.

Bacillus agora gera um biofilme temporário: ele decai com o tempo e também se desgasta em impactos, então encontrar novos Bacillus volta a ser útil.
Rhizobium aumenta a assimilação de N; o N faz a raiz crescer e evolui os tiros.
Q usa a carga de Trichoderma para degradar barreiras fúngicas que crescem em cena.
E ativa uma PGPB indutora de resistência sistêmica: remove penalidades, projéteis e parasitas aderentes da raiz.
Os botões de zoom permitem ver um pouco mais da arquitetura radicular formada.`));
// Tecla M silencia/religa todo o áudio; suspende o leito ambiente quando a aba fica oculta.
addEventListener('keydown',e=>{if(e.code==='KeyM'){const m=game.audio.toggleMute();game.ui.center(m?'SOM SILENCIADO (M)':'SOM LIGADO (M)',1.3)}});
document.addEventListener('visibilitychange',()=>{if(!game.audio)return;if(document.hidden)game.audio.setActive(false);else if(game.running)game.audio.setActive(true)});
loop.start();if(new URLSearchParams(location.search).get('autostart')==='1')setTimeout(()=>startGame({silent:true}),80);
