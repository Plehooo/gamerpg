import * as THREE from 'three';
import {Net} from './net.js';
import {buildWorld,mkChar,mkMob,anim} from './world.js';
const $=s=>document.querySelector(s),net=new Net(),rnd=(a,b)=>a+Math.random()*(b-a);
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2.5));R.setSize(innerWidth,innerHeight);
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;document.body.prepend(R.domElement);
const S=new THREE.Scene();S.background=new THREE.Color(0x4a2459);S.fog=new THREE.Fog(0x6a2f5a,28,85);
const C=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,200);
S.add(new THREE.HemisphereLight(0xffb27a,0x2a1450,.95));
const sun=new THREE.DirectionalLight(0xff9a55,1.7);sun.position.set(30,40,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30});S.add(sun,sun.target);
addEventListener('resize',()=>{R.setSize(innerWidth,innerHeight);C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();});
const W=buildWorld(S);
const N=300,pg=new THREE.BufferGeometry(),pa=new Float32Array(N*3);for(let i=0;i<N;i++){pa[i*3]=rnd(-30,30);pa[i*3+1]=rnd(0,15);pa[i*3+2]=rnd(-30,30);}
pg.setAttribute('position',new THREE.BufferAttribute(pa,3));
const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xffa040,size:.18,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));S.add(pts);
const mkC=c=>{const o=mkChar(c);S.add(o);return o;},mkM=k=>{const o=mkMob(k);S.add(o);return o;};
const me={x:100,y:112,hp:100,mhp:100,f:0,cd:0,combo:0,ct:0,dodge:0,dead:0,sw:0},mine=mkC(0xff7a2b),name='Ksatria'+(Math.random()*900+100|0);
const mobs={},mm={},others={},tags={};let stop=0,shake=0;
function tag(id,txt){let t=tags[id];if(!t){t=tags[id]=document.createElement('div');t.className='tag';document.body.appendChild(t);}t.textContent=txt;return t;}
const v=new THREE.Vector3();function scr(x,y,z,el){v.set(x,y,z).project(C);el.style.left=(v.x*.5+.5)*innerWidth+'px';el.style.top=(-v.y*.5+.5)*innerHeight+'px';}
function float(x,y,z,txt,crit){const e=document.createElement('div');e.className='fl'+(crit?' c':'');e.textContent=txt;scr(x,y,z,e);document.body.appendChild(e);e.onanimationend=()=>e.remove();}
// mob host
function seed(){W.spawns.forEach((p,i)=>{mobs['m'+i]={k:p.k,x:p.x,y:p.y,hx:p.x,hy:p.y,hp:p.hp,mhp:p.hp,cd:0,rs:0};});}
let started=false;
function mobDmg(id,d,crit){const m=mobs[id];if(!m||m.hp<=0)return;m.hp-=d;if(m.hp<=0){m.hp=0;m.rs=5;}}
function hitMob(id,d,crit){const m=mobs[id];float(m.x,2.5,m.y,Math.round(d),crit);stop=.06;shake=.25;navigator.vibrate&&navigator.vibrate(15);
 if(net.host)mobDmg(id,d,crit);else net.event('hit',{m:id,d},me.x,me.y);}
function hurt(d){if(me.dodge>0||me.dead)return;me.hp-=d;shake=.3;if(me.hp<=0){me.hp=0;me.dead=3;}}
const lastHit={};
const H={
 onMobs(o){for(const k in o)mobs[k]=Object.assign(mobs[k]||{},o[k]);},
 onEvent(e){
  if(e.type==='hit'&&net.host){const m=mobs[e.data.m],p=net.players[e.by];const n=net.now();
   if(!m||!p||e.data.d>60||Math.hypot(p.x-m.x,p.y-m.y)>7||n-(lastHit[e.by]||0)<150)return;lastHit[e.by]=n;mobDmg(e.data.m,e.data.d);}
  if(e.type==='dmg'&&e.data.to===net.uid)hurt(e.data.d);},
 onChat(c){const d=document.createElement('div');d.textContent=c.n+': '+c.m;const l=$('#log');l.appendChild(d);while(l.children.length>5)l.firstChild.remove();}
};
// input
const key={};let jx=0,jy=0,atk=false,dod=false,jid=null,j0=null;
addEventListener('keydown',e=>{if(e.target.id==='msg')return;key[e.key.toLowerCase()]=1;if(e.key===' ')atk=true;if(e.key==='Shift')dod=true;});
addEventListener('keyup',e=>key[e.key.toLowerCase()]=0);
const pad=$('#pad'),kn=$('#knob');
pad.addEventListener('pointerdown',e=>{jid=e.pointerId;j0=[e.clientX,e.clientY];kn.style.display='block';kn.style.left=j0[0]+'px';kn.style.top=j0[1]+'px';pad.setPointerCapture(jid);});
pad.addEventListener('pointermove',e=>{if(e.pointerId!==jid)return;let dx=e.clientX-j0[0],dy=e.clientY-j0[1];const l=Math.hypot(dx,dy),mx=45;if(l>mx){dx*=mx/l;dy*=mx/l;}jx=dx/mx;jy=dy/mx;kn.style.left=j0[0]+dx+'px';kn.style.top=j0[1]+dy+'px';});
const up=e=>{if(e.pointerId===jid){jid=null;jx=jy=0;kn.style.display='none';}};pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);
$('#atk').addEventListener('pointerdown',e=>{e.preventDefault();atk=true;});$('#dodge').addEventListener('pointerdown',e=>{e.preventDefault();dod=true;});
const bad=/(anjing|bangsat|kontol|memek|fuck|shit)/gi;
$('#msg').addEventListener('keydown',e=>{if(e.key!=='Enter')return;const t=e.target.value.trim().replace(bad,'***').slice(0,80);e.target.value='';if(!t)return;if(net.online)net.chat(t);else H.onChat({n:name,m:t});});
function localPlayers(){const a=[{id:net.uid,x:me.x,y:me.y,me:1}];for(const k in net.players)if(k!==net.uid&&net.players[k].hp>0)a.push({id:k,x:net.players[k].x,y:net.players[k].y});return a;}
function update(dt,t){
 // gerak
 let ix=jx+(key.d||key.arrowright?1:0)-(key.a||key.arrowleft?1:0),iy=jy+(key.s||key.arrowdown?1:0)-(key.w||key.arrowup?1:0);
 const l=Math.hypot(ix,iy);if(l>1){ix/=l;iy/=l;}
 if(me.dead>0){me.dead-=dt;if(me.dead<=0){me.hp=me.mhp;me.x=100;me.y=112;}}
 else{
  if(dod&&me.dodge<=0&&me.dd===undefined||dod&&me.dodge<=0){me.dodge=.3;me.dx=l>.1?ix/l:Math.sin(me.f);me.dy=l>.1?iy/l:Math.cos(me.f);}dod=false;
  if(me.dodge>0){me.dodge-=dt;me.x+=me.dx*16*dt;me.y+=me.dy*16*dt;}
  else if(l>.05){me.x+=ix*7*dt;me.y+=iy*7*dt;me.f=Math.atan2(ix,iy);}
  me.x=Math.min(197,Math.max(3,me.x));me.y=Math.min(197,Math.max(3,me.y));
  me.cd-=dt;me.ct-=dt;me.sw=Math.max(0,me.sw-dt);
  if(atk&&me.cd<=0){atk=false;me.combo=me.ct>0?me.combo%3+1:1;me.cd=.35;me.ct=.8;me.sw=.2;
   let best=null,bd=4.5;for(const k in mobs){const m=mobs[k];if(m.hp<=0)continue;const d=Math.hypot(m.x-me.x,m.y-me.y);if(d<bd){bd=d;best=k;}}
   if(best){me.f=Math.atan2(mobs[best].x-me.x,mobs[best].y-me.y);const c=Math.random()<.15;hitMob(best,Math.round((12+me.combo*4)*(c?2:1)),c);}}
  atk=false;}
 W.push(me);mine.position.set(me.x,W.h(me.x,me.y),me.y);W.tick(t,me.x,me.y);anim(mine,t,l>.05||me.dodge>0);mine.rotation.y=me.f;
 mine.userData.b.scale.set(1+Math.sin(t*3)*.02,1+Math.sin(t*3+1)*.03+(me.dodge>0?-.3:0),1);
 mine.userData.w.rotation.x=me.sw>0?-(1-me.sw/.2)*2.4:0;mine.visible=me.dead<=0;
 // host: simulasi monster
 if(net.host){const ps=localPlayers();
  for(const k in mobs){const m=mobs[k];if(m.hp<=0){m.rs-=dt;if(m.rs<=0){m.hp=m.mhp;m.x=m.hx??m.x;m.y=m.hy??m.y;}continue;}
   let tp=null,td=25;for(const p of ps){const d=Math.hypot(p.x-m.x,p.y-m.y);if(d<td){td=d;tp=p;}}
   m.cd-=dt;if(tp){if(td>1.6){m.x+=(tp.x-m.x)/td*3.2*dt;m.y+=(tp.y-m.y)/td*3.2*dt;}
    else if(m.cd<=0){m.cd=1;if(tp.me)hurt(8);else net.event('dmg',{to:tp.id,d:8},m.x,m.y);}}}
  sendT-=dt;if(sendT<=0){sendT=.2;const o={};for(const k in mobs){const m=mobs[k];o[k]={k:0,x:+m.x.toFixed(1),y:+m.y.toFixed(1),hp:m.hp,mhp:m.mhp};}net.pushMobs(o);}}
 // render mobs
 for(const k in mobs){const m=mobs[k];let o=mm[k];if(!o)o=mm[k]=mkM(m.k);
  if(net.host){o.position.set(m.x,W.h(m.x,m.y),m.y);}else{o.position.x+=(m.x-o.position.x)*Math.min(1,dt*8);o.position.z+=(m.y-o.position.z)*Math.min(1,dt*8);o.position.y=W.h(o.position.x,o.position.z);}
  o.visible=m.hp>0;o.userData.bar.scale.x=Math.max(.01,m.hp/m.mhp);const s=1+Math.sin(t*6+k.length)*.08;o.userData.m.scale.set(s,1/s,s);}
 // pemain lain
 for(const k in net.players){if(k===net.uid)continue;const p=net.players[k];let o=others[k];if(!o){o=others[k]=mkC(0x5ab0ff);o.position.set(p.x,0,p.y);}
  const dx=p.x-o.position.x,dz=p.y-o.position.z;if(Math.hypot(dx,dz)>.05)o.rotation.y=Math.atan2(dx,dz);o.position.x+=dx*Math.min(1,dt*10);o.position.z+=dz*Math.min(1,dt*10);o.position.y=W.h(o.position.x,o.position.z);anim(o,t,Math.hypot(dx,dz)>.1);
  o.visible=p.hp>0;scr(o.position.x,o.position.y+3,o.position.z,tag(k,p.n));}
 for(const k in others)if(!net.players[k]){S.remove(others[k]);delete others[k];if(tags[k]){tags[k].remove();delete tags[k];}}
 // kamera + partikel
 shake=Math.max(0,shake-dt);const sx=(Math.random()-.5)*shake,sz=(Math.random()-.5)*shake;
 const gy=W.h(me.x,me.y);C.position.set(me.x+sx,gy+17,me.y+15+sz);C.lookAt(me.x,gy,me.y);sun.position.set(me.x+30,40,me.y+10);sun.target.position.set(me.x,0,me.y);
 for(let i=0;i<N;i++){pa[i*3+1]+=dt*(.6+i%5*.2);pa[i*3]+=Math.sin(t+i)*dt*.5;if(pa[i*3+1]>15)pa[i*3+1]=0;}
 pg.attributes.position.needsUpdate=true;pts.position.set(me.x,0,me.y);
 // HUD
 $('#hp').style.width=me.hp/me.mhp*100+'%';
 netT-=dt;if(netT<=0){netT=.12;net.sendPos(me);}
 mmT-=dt;if(mmT<=0){mmT=.15;mini();}
}
const mc=$('#mini').getContext('2d');
function mini(){const s=1.2,c=60,X=x=>c+(x-me.x)*s,Y=y=>c+(y-me.y)*s;mc.clearRect(0,0,120,120);mc.save();mc.beginPath();mc.arc(c,c,c-2,0,7);mc.clip();
 mc.fillStyle='#24113a';mc.fillRect(0,0,120,120);mc.fillStyle='#6b4a3a';mc.fillRect(X(98.5),0,3.6,120);mc.fillRect(0,Y(98.5),120,3.6);
 mc.fillStyle='#8a6a78';mc.beginPath();mc.arc(X(100),Y(100),16*s,0,7);mc.fill();
 for(const k in mobs){const m=mobs[k];if(m.hp>0){mc.fillStyle='#ff4a30';mc.fillRect(X(m.x)-2,Y(m.y)-2,4,4);}}
 for(const k in net.players)if(k!==net.uid){mc.fillStyle='#5ab0ff';mc.beginPath();mc.arc(X(net.players[k].x),Y(net.players[k].y),3,0,7);mc.fill();}
 mc.restore();mc.fillStyle='#ffd24d';mc.beginPath();mc.arc(c,c,3.5,0,7);mc.fill();}
let mmT=0,sendT=0,netT=0,last=performance.now(),fps=60,fa=0,fc=0,q=2;
function loop(now){requestAnimationFrame(loop);let dt=Math.min((now-last)/1000,.05);last=now;
 fa+=dt;fc++;if(fa>2){fps=fc/fa;fa=fc=0;if(fps<40&&q>0){q--;R.setPixelRatio(q?1.5:1);R.setSize(innerWidth,innerHeight);}
  $('#info').textContent=Math.round(fps)+' FPS · '+(net.online?(net.host?'Host':'Klien')+' · '+(Object.keys(net.players).length)+' pemain':'Solo');}
 if(stop>0){stop-=dt;dt=0;}update(dt,now/1000);R.render(S,C);}
(async()=>{
 $('#name').textContent=name;const room=(new URLSearchParams(location.search).get('room')||'EMBER1').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6)||'EMBER1';
 const ok=await net.join(room,name,H);
 $('#banner').textContent=ok?'Online · Room '+room:'Mode Solo (isi firebaseConfig di js/config.js)';
 if(!ok||net.host)if(!Object.keys(mobs).length)seed();
 requestAnimationFrame(loop);
})();
setInterval(()=>{if(!net.host||!net.online)return;if(!Object.keys(mobs).length)seed();},1000);
