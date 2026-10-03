import * as THREE from 'three';
const SEED=1337,CX=100,cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
function mb(a){return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rnd=mb(SEED),R=(a,b)=>a+rnd()*(b-a);
function hs(i,j){let h=(Math.imul(i,374761393)+Math.imul(j,668265263)+SEED)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296;}
function vn(x,z){const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,u=fx*fx*(3-2*fx),w=fz*fz*(3-2*fz);
 return(hs(i,j)*(1-u)+hs(i+1,j)*u)*(1-w)+(hs(i,j+1)*(1-u)+hs(i+1,j+1)*u)*w;}
// biome: 0 kota, 1 hutan berpendar, 2 rawa, 3 kawah api, 4 pegunungan
const BC=[[100,100,-20],[100,30,0],[100,170,0],[170,100,0],[30,100,0]];
const bd=(x,z,i)=>Math.max(0,Math.hypot(x-BC[i][0],z-BC[i][1])+BC[i][2]+(vn(x/12+i*5,z/12)-.5)*18);
export function biome(x,z){let b=0,v=1e9;for(let i=0;i<5;i++){const d=bd(x,z,i);if(d<v){v=d;b=i;}}return b;}
const POOLS=[[80,150,6,0],[125,165,5,0],[95,182,7,0],[162,82,5,1],[174,120,6,1],[152,108,4,1]];
function hb(x,z){const d=Math.hypot(x-CX,z-CX),f=cl((d-18)/16)*(.2+.8*cl(Math.min(Math.abs(x-CX),Math.abs(z-CX))/6));
 const sw=cl((z-CX-30)/40),cw=cl((x-CX-35)/40),mw=cl((CX-x-25)/55);
 let e=(vn(x/16,z/16)-.5)*4+(vn(x/6,z/6)-.5);e+=mw*vn(x/22+7,z/22)*14;e*=(1-.75*sw)*(1-.5*cw);return e*f;}
export function h(x,z){let e=hb(x,z);for(const p of POOLS)e-=1.2*cl(1-Math.hypot(x-p[0],z-p[1])/(p[2]+4));return e;}
const OUT=new THREE.MeshBasicMaterial({color:0x120818,side:THREE.BackSide});
const T=(c,e=0)=>new THREE.MeshToonMaterial({color:c,emissive:c,emissiveIntensity:e});
const part=(p,geo,mat,x,y,z,ol=1)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;if(ol){const o=new THREE.Mesh(geo,OUT);o.scale.setScalar(1.08);m.add(o);}p.add(m);return m;};
export function mkChar(col){const o=new THREE.Group(),b=new THREE.Group();o.add(b);
 part(b,new THREE.CapsuleGeometry(.42,.7,4,10),T(col,.22),0,1,0);
 part(b,new THREE.TorusGeometry(.45,.07,6,14),T(0xffc040,.8),0,.9,0,0).rotation.x=Math.PI/2;
 part(b,new THREE.SphereGeometry(.34,12,10),T(0xffd9b0),0,1.85,0);
 part(b,new THREE.SphereGeometry(.4,12,8,0,6.283,0,1.57),T(0xb8b8d0,.1),0,1.9,0);
 part(b,new THREE.BoxGeometry(.08,.3,.6),T(0xff5a1a,.9),0,2.3,-.05,0);
 part(b,new THREE.SphereGeometry(.22,8,6),T(0xb8b8d0,.1),.5,1.55,0);part(b,new THREE.SphereGeometry(.22,8,6),T(0xb8b8d0,.1),-.5,1.55,0);
 part(b,new THREE.CylinderGeometry(.4,.4,.08,12),T(col,.45),-.62,1.1,.15).rotation.z=Math.PI/2;
 const cp=new THREE.Group();cp.position.set(0,1.6,-.38);b.add(cp);
 const cm=new THREE.Mesh(new THREE.PlaneGeometry(.8,1.3),new THREE.MeshToonMaterial({color:0xc02a1a,emissive:0x601008,side:THREE.DoubleSide}));cm.position.y=-.65;cm.castShadow=true;cp.add(cm);
 const sw=new THREE.Group();sw.position.set(.62,1.1,.25);o.add(sw);
 part(sw,new THREE.BoxGeometry(.1,.1,1.5),T(0xffe0a0,1),0,0,.8,0);part(sw,new THREE.BoxGeometry(.4,.08,.1),T(0xffc040,.6),0,0,.1,0);
 o.userData={b,w:sw,cape:cp};return o;}
export function anim(o,t,mv){const u=o.userData;u.cape.rotation.x=.25+Math.sin(t*(mv?9:2))*(mv?.25:.06);u.b.position.y=mv?Math.abs(Math.sin(t*10))*.12:Math.sin(t*2)*.02;}
const MC=[0x3ad6c0,0x78d64a,0xff4a1c,0x9ad8ff];
export function mkMob(k=0){const o=new THREE.Group(),m=new THREE.Group(),c=MC[k%4];o.add(m);
 part(m,new THREE.IcosahedronGeometry(.9,1),new THREE.MeshToonMaterial({color:0x2a1a2c,emissive:c,emissiveIntensity:.35}),0,.95,0);
 [-.5,.5].forEach(x=>{part(m,new THREE.ConeGeometry(.2,.8,5),T(0xe8d8c0),x,1.8,0).rotation.z=-x*.6;part(m,new THREE.SphereGeometry(.14,8,6),T(c,1.6),x*.55,1.1,.78,0);});
 const bg=new THREE.Mesh(new THREE.BoxGeometry(1.7,.2,.1),new THREE.MeshBasicMaterial({color:0x200808})),bar=new THREE.Mesh(new THREE.BoxGeometry(1.6,.14,.12),new THREE.MeshBasicMaterial({color:c}));
 bg.position.y=bar.position.y=2.7;
 const gl=new THREE.Mesh(new THREE.CircleGeometry(1.4,16),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));gl.rotation.x=-Math.PI/2;gl.position.y=.06;
 o.add(bg,bar,gl);o.userData={m,bar};return o;}
export function buildWorld(S){
 const U={value:0},glows=[],cols=[];
 S.background=new THREE.Color(0x7a3a5a);S.fog=new THREE.Fog(0x7a3a5a,35,115);
 const gc=document.createElement('canvas');gc.width=gc.height=64;const g=gc.getContext('2d'),gg=g.createRadialGradient(32,32,0,32,32,32);
 gg.addColorStop(0,'rgba(255,255,255,1)');gg.addColorStop(.3,'rgba(255,255,255,.35)');gg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gg;g.fillRect(0,0,64,64);
 const gt=new THREE.CanvasTexture(gc);
 const glow=(x,y,z,c,s,o=.9)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:c,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:o,fog:false}));sp.position.set(x,y,z);sp.scale.set(s,s,1);S.add(sp);glows.push({sp,o});return sp;};
 const sky=new THREE.Mesh(new THREE.SphereGeometry(170,24,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec3 p;void main(){float y=normalize(p).y;vec3 hz=vec3(.48,.23,.35),m=vec3(.30,.10,.42),t=vec3(.06,.03,.17);vec3 c=y<0.?hz:(y<.25?mix(hz,m,y/.25):mix(m,t,min(1.,(y-.25)/.5)));gl_FragColor=vec4(c,1.);}'}));
 sky.renderOrder=-1;S.add(sky);
 const sunA=glow(0,0,0,0xff9a40,80,.8),sunB=glow(0,0,0,0xffe2a0,28,1);
 // terrain
 const geo=new THREE.PlaneGeometry(200,200,150,150);geo.rotateX(-Math.PI/2);geo.translate(100,0,100);
 const P=geo.attributes.position,cd=new Float32Array(P.count*3),pal=[0x6a5468,0x2c6a66,0x3a6a34,0x6a2e24,0x8a8aa6].map(x=>new THREE.Color(x)),c=new THREE.Color(),c2=new THREE.Color();
 for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),y=h(x,z);P.setY(i,y);
  let ws=0;c.setRGB(0,0,0);for(let b=0;b<5;b++){const w=Math.exp(-bd(x,z,b)/14);ws+=w;c.r+=pal[b].r*w;c.g+=pal[b].g*w;c.b+=pal[b].b*w;}
  c.multiplyScalar(1/ws*(.8+vn(x/3,z/3)*.45));
  const ax=Math.abs(x-CX),az=Math.abs(z-CX),d=Math.hypot(ax,az),rd=Math.min(ax,az);
  if(rd<2.6&&d>14)c.lerp(c2.set(0xa07858),cl((2.6-rd)/1.2)*.85);
  if(d<16)c.lerp(c2.set(0x8a7088),cl((16-d)/4)*.9);
  if(y>6)c.lerp(c2.set(0xf0f2ff),cl((y-6)/4));
  cd[i*3]=c.r;cd[i*3+1]=c.g;cd[i*3+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(cd,3));geo.computeVertexNormals();
 const TM=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}));TM.receiveShadow=true;S.add(TM);
 // prop
 const L={},put=(k,x,z,s,cc)=>{(L[k]=L[k]||[]).push({x,z,y:h(x,z),s,r:rnd()*6.28,c:cc});};
 const ok=(x,z,m)=>{const ax=Math.abs(x-CX),az=Math.abs(z-CX);return Math.hypot(ax,az)>m&&Math.min(ax,az)>4&&x>4&&x<196&&z>4&&z<196;};
 const near=(x,z)=>POOLS.some(p=>Math.hypot(x-p[0],z-p[1])<p[2]+2);
 const TC=[0x2fb5a0,0x5a8aff,0x8a5cff,0x3fe0b0],CC=[0x5afcff,0xff6ad5,0x8a7cff],cry=[];
 for(let n=0;n<5000;n++){const x=R(4,196),z=R(4,196);if(!ok(x,z,24)||near(x,z))continue;const b=biome(x,z),q=rnd(),cc=vn(x/9,z/9);
  if(b===1){if(q<.5&&cc>.42){const s=R(.8,1.7);put('tree',x,z,s,TC[n%4]);cols.push({x,z,r:.7*s});}else if(q>.985){cry.push({x,z,s:R(.8,1.6),c:CC[n%3]});cols.push({x,z,r:.6});}}
  else if(b===2){if(q<.1){const s=R(.8,1.4);put('dead',x,z,s,0x3a2c3c);cols.push({x,z,r:.4});}}
  else if(b===3){if(q<.1){const s=R(.7,1.8);put('rock',x,z,s,0x3a2a2e);cols.push({x,z,r:s*1.1});}else if(q>.95){const s=R(.8,1.6);put('spike',x,z,s,0x24141c);cols.push({x,z,r:.5});}}
  else if(b===4){if(q<.2){const s=R(1,3);put('rock',x,z,s,0x8a8aa8);cols.push({x,z,r:s*1.1});}}
  if(q>.9&&q<.93&&b!==0)put('rock',x,z,R(.3,.6),0x5a4a58);}
 const inst=(geo,mat,arr,dy,sy=1)=>{if(!arr||!arr.length)return;const m=new THREE.InstancedMesh(geo,mat,arr.length),o=new THREE.Object3D(),cc=new THREE.Color();
  arr.forEach((p,i)=>{o.position.set(p.x,p.y+dy*p.s,p.z);o.rotation.set(0,p.r,0);o.scale.set(p.s,p.s*sy,p.s);o.updateMatrix();m.setMatrixAt(i,o.matrix);m.setColorAt(i,cc.setHex(p.c||0xffffff));});
  m.castShadow=true;m.receiveShadow=true;S.add(m);return m;};
 const lam=e=>new THREE.MeshLambertMaterial({color:0xffffff,emissive:e,flatShading:true}),tn=new THREE.MeshToonMaterial({color:0xffffff,emissive:0x0c2430});
 const tr=L.tree||[];inst(new THREE.CylinderGeometry(.2,.35,2,6),lam(0x1a0c14),tr.map(p=>({...p,c:0x4a3040})),1);
 inst(new THREE.ConeGeometry(1.7,3.2,7),tn,tr,2.8);inst(new THREE.ConeGeometry(1.25,2.6,7),tn,tr,4.4);
 inst(new THREE.CylinderGeometry(.12,.3,3.5,5),lam(0x0c0610),L.dead,1.7);
 inst(new THREE.DodecahedronGeometry(1,0),lam(0x100810),L.rock,.5,.75);
 inst(new THREE.ConeGeometry(.5,3,5),lam(0x2a0a06),L.spike,1.5);
 if(cry.length){const m=new THREE.InstancedMesh(new THREE.OctahedronGeometry(1,0),new THREE.MeshBasicMaterial({color:0xffffff}),cry.length),o=new THREE.Object3D(),cc=new THREE.Color();
  cry.forEach((p,i)=>{const y=h(p.x,p.z);o.position.set(p.x,y+p.s*1.4,p.z);o.rotation.set(0,i,0);o.scale.set(p.s*.6,p.s*1.6,p.s*.6);o.updateMatrix();m.setMatrixAt(i,o.matrix);m.setColorAt(i,cc.setHex(p.c));glow(p.x,y+p.s*1.4,p.z,p.c,p.s*7,.8);});S.add(m);}
 // rumput bergoyang
 const gm=new THREE.MeshLambertMaterial({color:0xffffff});gm.onBeforeCompile=s=>{s.uniforms.uTime=U;s.vertexShader='uniform float uTime;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x+=sin(uTime*2.+instanceMatrix[3].x*.6+instanceMatrix[3].z*.4)*.22*position.y;');};
 const gg2=new THREE.ConeGeometry(.08,.9,3);gg2.translate(0,.45,0);const GA=[],GC=[0xb09aa8,0x40e0b0,0x78b04a,0xd0702a,0xa8b0d0];
 for(let n=0;n<9000&&GA.length<4500;n++){const x=R(4,196),z=R(4,196);if(!ok(x,z,19)||near(x,z))continue;GA.push({x,z,y:h(x,z),s:R(.7,1.5),r:rnd()*6,c:GC[biome(x,z)]});}
 inst(gg2,gm,GA,0).castShadow=false;
 // cairan
 const liquid=(a,b,sp)=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:U,a:{value:new THREE.Color(a)},b:{value:new THREE.Color(b)},sp:{value:sp}},
  vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float uTime,sp;uniform vec3 a,b;varying vec2 v;void main(){float r=distance(v,vec2(.5));float w=sin(r*50.-uTime*sp)*.5+.5;gl_FragColor=vec4(mix(a,b,w*.6),smoothstep(.5,.4,r)*.9);}'});
 const wm=liquid(0x0a3a48,0x4af0d0,2),lm=liquid(0xff4010,0xffd040,1.2);
 for(const p of POOLS){const m=new THREE.Mesh(new THREE.CircleGeometry(p[2]+.5,32),p[3]?lm:wm);m.rotation.x=-Math.PI/2;m.position.set(p[0],hb(p[0],p[1])-.5,p[1]);S.add(m);if(p[3])glow(p[0],hb(p[0],p[1])+1,p[1],0xff6a20,p[2]*4,.7);}
 // kota
 const wallM=T(0x6a4a5a,.05),roofM=T(0xff7a2b,.2),winM=new THREE.MeshBasicMaterial({color:0xffc060});
 for(let i=0;i<6;i++){const a=i/6*6.283+.3,x=CX+Math.cos(a)*22,z=CX+Math.sin(a)*22,gr=new THREE.Group();
  const w=part(gr,new THREE.BoxGeometry(5,3,5),wallM,0,1.5,0),r=part(gr,new THREE.ConeGeometry(4.3,2.6,4),roofM,0,4.3,0);r.rotation.y=Math.PI/4;
  const wn=new THREE.Mesh(new THREE.BoxGeometry(1.2,1,.1),winM);wn.position.set(0,1.7,2.55);gr.add(wn);
  gr.position.set(x,h(x,z),z);gr.rotation.y=-a-Math.PI/2;S.add(gr);cols.push({x,z,r:3.8});glow(x,3,z,0xffa040,7,.6);}
 const ring=(r0,r1,c)=>{const m=new THREE.Mesh(new THREE.RingGeometry(r0,r1,64),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.85,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(CX,.08,CX);S.add(m);};
 ring(10,11.2,0xffa040);ring(4.6,5.1,0x5afcff);ring(7.4,7.6,0xff6ad5);
 const pl=part(S,new THREE.CylinderGeometry(2.4,3,.6,12),T(0x4a3a50,.1),CX,.3,CX);
 const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(1.5,0),new THREE.MeshBasicMaterial({color:0x7afcff}));crystal.scale.y=2;crystal.position.set(CX,3.6,CX);S.add(crystal);
 glow(CX,3.6,CX,0x5afcff,16,.9);cols.push({x:CX,z:CX,r:2.8});
 const flames=[];
 for(const [dx,dz] of [[8,8],[-8,8],[8,-8],[-8,-8]]){const x=CX+dx,z=CX+dz;part(S,new THREE.CylinderGeometry(.2,.3,1.6,6),T(0x3a2a3a),x,.8,z);part(S,new THREE.CylinderGeometry(.6,.35,.4,8),T(0x3a2a3a,.1),x,1.7,z);
  const f=new THREE.Mesh(new THREE.ConeGeometry(.45,1.2,6),new THREE.MeshBasicMaterial({color:0xff8a2b}));f.position.set(x,2.5,z);S.add(f);flames.push(f);glow(x,2.5,z,0xff7a20,7,.9);cols.push({x,z,r:.7});}
 const post=new THREE.CylinderGeometry(.08,.1,2.4,5),pm=T(0x2a1a2a);
 for(const [ux,uz] of [[1,0],[-1,0],[0,1],[0,-1]])for(let d=26;d<=92;d+=11){const x=CX+ux*d+(uz?3.6:0),z=CX+uz*d+(ux?3.6:0);part(S,post,pm,x,h(x,z)+1.2,z,0);
  const f=new THREE.Mesh(new THREE.SphereGeometry(.2,6,5),new THREE.MeshBasicMaterial({color:0xffb040}));f.position.set(x,h(x,z)+2.6,z);S.add(f);glow(x,h(x,z)+2.6,z,0xff9a30,3.5,.8);}
 // berkas cahaya
 const shaft=new THREE.MeshBasicMaterial({color:0xffa060,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 for(let i=0;i<10;i++){const x=R(15,185),z=R(15,185),m=new THREE.Mesh(new THREE.CylinderGeometry(.2,3,22,12,1,true),shaft);m.position.set(x,h(x,z)+10,z);m.rotation.z=.25;S.add(m);}
 // monster spawn tetap (seed sama = dunia sama)
 const spawns=[];for(let n=0;n<4000&&spawns.length<16;n++){const x=R(10,190),z=R(10,190),t=1+spawns.length%4;
  if(ok(x,z,34)&&!near(x,z)&&biome(x,z)===t&&spawns.every(s=>Math.hypot(s.x-x,s.y-z)>14))spawns.push({x,y:z,k:t-1,hp:40+(t-1)*12});}
 const push=p=>{for(const q of cols){const dx=p.x-q.x,dz=p.y-q.z,rr=q.r+.5;if(dx*dx+dz*dz<rr*rr){const d=Math.hypot(dx,dz)||.01;p.x=q.x+dx/d*rr;p.y=q.z+dz/d*rr;}}};
 const tick=(t,px,pz)=>{U.value=t;sky.position.set(px,0,pz);sunA.position.set(px+40,32,pz-140);sunB.position.copy(sunA.position);
  glows.forEach((q,i)=>{if(q.sp!==sunA&&q.sp!==sunB)q.sp.material.opacity=q.o*(.8+.2*Math.sin(t*3+i*1.7));});
  crystal.rotation.y=t*.6;crystal.position.y=3.6+Math.sin(t*1.5)*.3;flames.forEach((f,i)=>f.scale.set(1,.85+.25*Math.sin(t*9+i*2),1));};
 return{h,push,tick,spawns};}
