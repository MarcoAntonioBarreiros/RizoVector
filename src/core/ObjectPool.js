export class ObjectPool{
 constructor(size,factory=()=>({})){this.items=Array.from({length:size},(_,i)=>({active:false,poolIndex:i,...factory(i)}));this.free=[];for(let i=size-1;i>=0;i--)this.free.push(i)}
 acquire(data={}){const idx=this.free.pop();if(idx===undefined)return null;const item=this.items[idx];Object.assign(item,data,{active:true});return item}
 release(item){if(!item||!item.active)return;item.active=false;this.free.push(item.poolIndex)}
 forEachActive(fn){for(const item of this.items)if(item.active)fn(item)}
 clear(){this.free.length=0;for(let i=this.items.length-1;i>=0;i--){this.items[i].active=false;this.free.push(i)}}
}
