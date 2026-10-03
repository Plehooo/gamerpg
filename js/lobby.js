const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e;};
const AL='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',code=()=>Array.from({length:6},()=>AL[Math.random()*AL.length|0]).join('');
const clean=(s,n)=>s.replace(/[<>&"'`]/g,'').trim().slice(0,n);
export function lobby(net,H,defName){return new Promise(async res=>{
 const root=E('div'),card=E('div','lobc');root.id='lobby';root.appendChild(card);document.body.appendChild(root);
 const inp=(ph,max,v='')=>{const i=E('input','li');i.placeholder=ph;i.maxLength=max;i.value=v;i.autocomplete='off';return i;};
 const btn=(t,f,c='')=>{const b=E('button','lb '+c,t);b.onclick=f;return b;};
 const nm=inp('Nama (maks 14)',14,localStorage.getItem('nm')||defName),msg=E('div','lm',''),list=E('div','ll');
 const rn=inp('Nama room',20),sel=E('select','li'),ci=inp('KODE',6,(new URLSearchParams(location.search).get('room')||'').toUpperCase().replace(/[^A-Z0-9]/g,''));
 [['1','Publik'],['0','Privat']].forEach(([v,t])=>{const o=E('option','',t);o.value=v;sel.appendChild(o);});
 const name=()=>clean(nm.value,14)||defName;
 let tm=0;const bs=[];
 const go=async(room,o)=>{msg.textContent='Menghubungkan...';localStorage.setItem('nm',name());
  const r=await net.join(room,name(),H,o);
  if(r===true){clearInterval(tm);root.remove();res({room,name:name(),solo:false});}
  else msg.textContent=r==='full'?'Room penuh (16/16)':'Gagal terhubung. Cek config/Auth Firebase.';};
 const refresh=async()=>{const rs=await net.list();list.textContent='';if(!rs.length){list.appendChild(E('div','lm','Belum ada room publik'));return;}
  rs.slice(0,8).forEach(r=>list.appendChild(btn(r.n+'  ·  '+r.cnt+'/'+r.max,()=>go(r.id,{}),'row')));};
 const quick=async()=>{const rs=await net.list();if(rs.length)go(rs[0].id,{});else go(code(),{pub:true,rname:'Room '+name()});};
 card.append(E('h1','','REALM OF EMBERS'),nm,
  btn('⚡ Main Cepat',quick,'big'),
  E('div','lt','Buat Room'),rn,sel,btn('Buat',()=>go(code(),{pub:sel.value==='1',rname:clean(rn.value,20)||'Room '+name()})),
  E('div','lt','Gabung dengan Kode'),ci,btn('Gabung',()=>{const c=ci.value.toUpperCase().replace(/[^A-Z0-9]/g,'');if(c.length>=3)go(c,{});else msg.textContent='Isi kode room';}),
  E('div','lt','Room Publik'),list,btn('↻ Segarkan',refresh),
  btn('Mode Solo',()=>{clearInterval(tm);root.remove();res({solo:true,name:name()});},'solo'),msg);
 root.querySelectorAll('.lb').forEach(b=>bs.push(b));
 if(!await net.init()){msg.textContent='Firebase belum aktif — hanya Mode Solo';bs.forEach(b=>{if(!b.classList.contains('solo'))b.disabled=true;});return;}
 refresh();tm=setInterval(refresh,5000);
});}
