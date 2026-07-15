export class InputManager{
 constructor(){
  this.keys=new Set;this.pressed=new Set;this.virtual=new Set;
  this.gamepad={x:0,y:0,dash:false,special:false,root:false,tricho:false};
  this.touchStick={pointerId:null,originX:0,originY:0,x:0,y:0};
  addEventListener('keydown',e=>{if(!this.keys.has(e.code))this.pressed.add(e.code);this.keys.add(e.code);if(['Space','ShiftLeft','ShiftRight','KeyQ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()});
  addEventListener('keyup',e=>this.keys.delete(e.code));
  document.querySelectorAll('[data-control]').forEach(b=>{const c=b.dataset.control,on=e=>{e.preventDefault();this.virtual.add(c)},off=e=>{e.preventDefault();this.virtual.delete(c)};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)});
  const canvas=document.getElementById('game');
  if(canvas){
   const move=e=>{
    if(e.pointerId!==this.touchStick.pointerId)return;
    e.preventDefault();
    const dx=e.clientX-this.touchStick.originX,dy=e.clientY-this.touchStick.originY;
    const deadZone=8,maxDistance=90,distance=Math.hypot(dx,dy);
    if(distance<=deadZone){this.touchStick.x=0;this.touchStick.y=0;return}
    const strength=Math.min(1,(distance-deadZone)/(maxDistance-deadZone)),scale=strength/distance;
    this.touchStick.x=dx*scale;this.touchStick.y=dy*scale;
   };
   const stop=e=>{
    if(e.pointerId!==this.touchStick.pointerId)return;
    e.preventDefault();
    this.touchStick.pointerId=null;this.touchStick.x=0;this.touchStick.y=0;
   };
   canvas.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'||this.touchStick.pointerId!==null)return;
    e.preventDefault();
    this.touchStick.pointerId=e.pointerId;this.touchStick.originX=e.clientX;this.touchStick.originY=e.clientY;this.touchStick.x=0;this.touchStick.y=0;
    canvas.setPointerCapture?.(e.pointerId);
   });
   canvas.addEventListener('pointermove',move);
   canvas.addEventListener('pointerup',stop);
   canvas.addEventListener('pointercancel',stop);
   canvas.addEventListener('lostpointercapture',stop);
  }
 }
 updateGamepad(){const pad=[...(navigator.getGamepads?.()||[])].find(Boolean),dead=v=>Math.abs(v)<.16?0:v;if(!pad){this.gamepad={x:0,y:0,dash:false,special:false,root:false,tricho:false};return}this.gamepad.x=dead(pad.axes[0]||0);this.gamepad.y=dead(pad.axes[1]||0);this.gamepad.dash=!!pad.buttons[0]?.pressed;this.gamepad.special=!!pad.buttons[1]?.pressed;this.gamepad.root=!!pad.buttons[2]?.pressed;this.gamepad.tricho=!!pad.buttons[3]?.pressed}
 consume(c){if(this.pressed.has(c)){this.pressed.delete(c);return true}return false}
 get axisX(){const k=(this.keys.has('ArrowRight')||this.keys.has('KeyD')||this.virtual.has('right')?1:0)-(this.keys.has('ArrowLeft')||this.keys.has('KeyA')||this.virtual.has('left')?1:0);return Math.max(-1,Math.min(1,k||this.touchStick.x||this.gamepad.x))}
 get axisY(){const k=(this.keys.has('ArrowDown')||this.keys.has('KeyS')||this.virtual.has('down')?1:0)-(this.keys.has('ArrowUp')||this.keys.has('KeyW')||this.virtual.has('up')?1:0);return Math.max(-1,Math.min(1,k||this.touchStick.y||this.gamepad.y))}
 get dashPressed(){return this.consume('Space')||this.virtual.has('dash')||this.gamepad.dash}
 get specialPressed(){return this.consume('KeyE')||this.virtual.has('special')||this.gamepad.special}
 get rootPressed(){return this.consume('ShiftLeft')||this.consume('ShiftRight')||this.virtual.has('root')||this.gamepad.root}
 get trichoPressed(){return this.consume('KeyQ')||this.virtual.has('tricho')||this.gamepad.tricho}
 endFrame(){this.pressed.clear()}
}