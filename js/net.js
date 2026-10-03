import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getAuth,signInAnonymously} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {getDatabase,ref,set,get,update,push,onValue,onChildAdded,onDisconnect,runTransaction,serverTimestamp,query,limitToLast} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import {firebaseConfig,configured} from './config.js';
export class Net{
 constructor(){this.online=false;this.uid='solo';this.meta=null;this.players={};this.off=0;this.h={};this.last='';this.room='';this.reg=false;this.ready=null;}
 get host(){return !this.online||(this.meta&&this.meta.hostUid===this.uid);}
 now(){return Date.now()+this.off;}
 init(){if(!this.ready)this.ready=(async()=>{if(!configured)return false;try{
  const app=initializeApp(firebaseConfig);this.uid=(await signInAnonymously(getAuth(app))).user.uid;this.db=getDatabase(app);
  onValue(ref(this.db,'.info/serverTimeOffset'),s=>this.off=s.val()||0);return true;}catch(e){console.warn('Firebase gagal:',e);return false;}})();return this.ready;}
 async list(){if(!await this.init())return[];try{const v=(await get(ref(this.db,'lobby'))).val()||{},n=this.now();
  return Object.entries(v).filter(([k,r])=>n-r.hb<15000&&r.cnt<r.max).map(([k,r])=>({id:k,...r})).sort((a,b)=>b.cnt-a.cnt);}catch(e){return[];}}
 async join(room,name,h,o={}){
  if(!await this.init())return false;
  try{
   const db=this.db,R=this.R=p=>ref(db,'rooms/'+room+'/'+p);this.name=name;this.room=room;this.h=h;this.o=o;
   const ps=(await get(R('players'))).val()||{};if(!ps[this.uid]&&Object.keys(ps).length>=16)return 'full';
   onValue(R('meta'),s=>{this.meta=s.val();});
   onValue(R('players'),s=>{this.players=s.val()||{};});
   onValue(R('mobs'),s=>{if(!this.host&&h.onMobs)h.onMobs(s.val()||{});});
   const t0=Date.now();
   onChildAdded(query(R('events'),limitToLast(20)),s=>{const e=s.val();if(e&&e.by!==this.uid&&Date.now()-t0>800&&h.onEvent)h.onEvent(e);});
   onChildAdded(query(R('chat'),limitToLast(8)),s=>{const c=s.val();if(c&&h.onChat)h.onChat(c);});
   onDisconnect(R('players/'+this.uid)).remove();
   await this.elect();
   setInterval(()=>this.tick(),1000);
   this.online=true;return true;
  }catch(e){console.warn(e);return false;}
 }
 elect(){const o=this.o||{};return runTransaction(this.R('meta'),m=>{
  const n=this.now();
  if(!m)return {name:o.rname||this.room,createdAt:n,hostUid:this.uid,maxPlayers:16,seed:1,hb:n,pub:!!o.pub};
  if(m.hostUid!==this.uid&&n-m.hb>3000){m.hostUid=this.uid;m.hb=n;return m;}
  return m;});}
 tick(){
  const m=this.meta;if(!m)return;
  if(m.hostUid===this.uid){update(this.R('meta'),{hb:this.now()});
   if(m.pub){const lr=ref(this.db,'lobby/'+this.room);if(!this.reg){onDisconnect(lr).remove();this.reg=true;}
    set(lr,{n:String(m.name).slice(0,20),cnt:Object.keys(this.players).length,max:16,host:this.uid,hb:this.now()});}}
  else if(this.now()-m.hb>3000)this.elect();
 }
 sendPos(p){
  const k=[p.x.toFixed(1),p.y.toFixed(1),p.hp].join();if(k===this.last||!this.online)return;this.last=k;
  set(this.R('players/'+this.uid),{n:this.name,cls:'k',lv:1,x:+p.x.toFixed(1),y:+p.y.toFixed(1),hp:Math.max(0,Math.round(p.hp)),mhp:p.mhp,t:serverTimestamp()});
 }
 pushMobs(m){if(this.online&&this.host)set(this.R('mobs'),m);}
 event(type,data,x,y){if(this.online)push(this.R('events'),{type,by:this.uid,x:+x.toFixed(1),y:+y.toFixed(1),data,t:serverTimestamp()});}
 chat(m){if(this.online)push(this.R('chat'),{u:this.uid,n:this.name,m,t:serverTimestamp()});}
}
