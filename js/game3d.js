let RUN=null;
function stopRun(){if(RUN){cancelAnimationFrame(RUN.raf);document.removeEventListener('keydown',RUN.kd);RUN=null}}
const TH={
1:{sky:'#9fd3ee',g:['#d6b574','#caa766'],side:'#a9a35a',leaf:'#8a9a3c',deco:['tree','tree','stone'],ob:['rock','crab'],cc:'#e8892f',goal:6,gates:3,len:400,sp:10,mv:0},
2:{sky:'#8fd0f0',g:['#79b45f','#6aa552'],side:'#4f8f45',leaf:'#3f8f3f',deco:['hut','mound','tree'],ob:['pot','log'],cc:'#c75b39',goal:5,gates:3,len:420,sp:10.5,mv:0},
3:{sky:'#f0b27a',g:['#c98a58','#bd7d4c'],side:'#a8683d',leaf:'#7a8a3a',deco:['pot','stone','hut'],ob:['pot','rock'],cc:'#e6a23c',goal:6,gates:3,len:430,sp:11,mv:1},
4:{sky:'#8fd3e8',g:['#9cc66a','#8eb95d'],side:'#6fa24f',leaf:'#3f8f3f',deco:['hut','tree','tree'],ob:['log','crab'],cc:'#3aa6c9',goal:7,gates:4,len:450,sp:11.5,mv:1},
5:{sky:'#5fb7e6',g:['#1c93b8','#1a86a8'],side:'#1678a0',leaf:'#3f8f3f',deco:['raft','wave'],ob:['rock','log'],cc:'#ff6f4a',goal:7,gates:4,len:460,sp:12,mv:1,sea:1},
6:{sky:'#b9a3d9',g:['#c8ad7c','#bb9f6d'],side:'#8d8a5a',leaf:'#7a8a3a',deco:['stone','hut','tree'],ob:['rock','pot'],cc:'#f2c14e',goal:6,gates:4,len:470,sp:12,mv:1},
7:{sky:'#7a8aa6',g:['#8b8f98','#7f838c'],side:'#5c6270',leaf:'#4f7a4a',deco:['derrick','crate','tree'],ob:['crate','rock','log'],cc:'#f2c14e',goal:8,gates:4,len:500,sp:12.5,mv:1}};
const OH={rock:1,crab:.5,log:.7,pot:1,crate:1},GC=['#f2c14e','#25d0c0','#d9693f','#4cc46d'],LX=l=>(l-1.5)*2,hs=k=>{const x=Math.sin(k*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function play3d(w){stopRun();const T=TH[w],L=Q.filter(q=>q.w==w),df={Explorador:.85,Aventurero:1,Investigador:1.15}[S.diff]||1;
$.innerHTML=hud()+`<button class="btn ghost" id="bk">← Mapa</button><h2 class="gold">Mundo ${w} · ${WORLDS[w-1].n}</h2><div class="stage"><canvas id="cv" width="960" height="480" aria-label="Desafío 3D"></canvas><div class="hb" id="hb"></div><div class="gq" id="gq" hidden></div><div id="ov" class="ov" hidden></div></div><div class="pad"><button class="btn" id="pl">◀</button><button class="btn sec" id="pj">⬆ Saltar</button><button class="btn" id="pr">▶</button></div><small>Flechas o A/D: carril · Espacio: saltar · Móvil: desliza o usa los botones. En los portales, corre por el carril de tu respuesta.</small>`;
el('bk').onclick=()=>go(worlds);const ov=el('ov'),gq=el('gq');
if(!G3.init(el('cv'))){ov.hidden=false;ov.innerHTML='<div class="card">Tu navegador no admite WebGL. Prueba con Chrome, Edge o Firefox actualizados.</div>';return}
let sd=w*97+13;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647,gz=[],obs=[],itm=[];
for(let k=1;k<=T.gates;k++)gz.push(T.len*k/(T.gates+1));
for(let z=40;z<T.len-12;z+=8.5+rnd()*6/df){if(gz.some(g=>Math.abs(z-g)<16))continue;const fr=Math.floor(rnd()*4);for(let l=0;l<4;l++)if(l!=fr&&rnd()<.55)obs.push({l,z,t:T.ob[Math.floor(rnd()*T.ob.length)],ph:rnd()*6});if(itm.length<T.goal+4)itm.push({l:fr,z:z+4,got:0})}
const s={z:0,x:LX(1),l:1,y:0,vy:0,hp:3,inv:0,pause:0,qn:0,gi:0,t:0,col:0,shown:-1},gQ=k=>L[(k*2)%L.length],ox=o=>LX(o.l)+(T.mv?Math.sin(s.t*1.6+o.ph)*.7:0);
const mv=d=>{if(!s.pause)s.l=Math.max(0,Math.min(3,s.l+d))},jp=()=>{if(s.y==0&&!s.pause)s.vy=9};
const kd=e=>{const c=e.code;if(['ArrowLeft','KeyA'].includes(c)){e.preventDefault();mv(-1)}else if(['ArrowRight','KeyD'].includes(c)){e.preventDefault();mv(1)}else if(['Space','ArrowUp','KeyW'].includes(c)){e.preventDefault();jp()}};
document.addEventListener('keydown',kd);el('pl').onpointerdown=()=>mv(-1);el('pr').onpointerdown=()=>mv(1);el('pj').onpointerdown=jp;
let px0,py0;const cv=el('cv');cv.onpointerdown=e=>{px0=e.clientX;py0=e.clientY};cv.onpointerup=e=>{const dx=e.clientX-px0,dy=e.clientY-py0;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy))mv(dx>0?1:-1);else jp()};
function ask(q,title,cb,pick){s.pause=1;ov.hidden=false;gq.hidden=true;s.shown=-1;
const fin=k=>{const ok=k==q.a;if(ok){S.score+=100;S.ok++;S.xp+=40}else S.bad++;S.answered[w+'-'+q.q.slice(0,14)]=ok;save();
ov.innerHTML=`<div class="card"><h3 class="gold">${ok?'¡Correcto!':'Aún no'}</h3><div class="sabio"><span class="av">🐚</span><div>${esc(q.e)}<br><small>Fuente: ${esc(q.s)}</small></div></div><button class="btn" id="cn">Continuar →</button></div>`;
el('cn').onclick=()=>{ov.hidden=true;s.pause=0;cb(ok)}};
if(pick!=null)return fin(pick);
ov.innerHTML=`<div class="card"><h3 class="gold">${title}</h3><div class="qtxt">${esc(q.q)}</div>${q.o.map((o,k)=>`<button class="opt" data-k="${k}"><span class="l">${'ABCD'[k]}</span>${esc(o)}</button>`).join('')}</div>`;
ov.querySelectorAll('.opt').forEach(b=>b.onclick=()=>fin(+b.dataset.k))}
function chk(){if(s.hp<=0){s.pause=1;ov.hidden=false;ov.innerHTML='<div class="card"><h3 class="gold">Sin corazones</h3><p>¡Inténtalo de nuevo! Cada intento te enseña algo más.</p><button class="btn" id="rt">Reintentar</button></div>';el('rt').onclick=()=>go(play3d,w)}}
function finish(){stopRun();const st=1+(s.col>=T.goal?1:0)+(s.hp==3?1:0);S.score+=st*100+s.col*10;S.xp+=60;save();go(win,w,st)}
function upd(dt){s.t+=dt;s.z+=T.sp*df*dt;s.x+=(LX(s.l)-s.x)*Math.min(1,12*dt);if(s.y>0||s.vy>0){s.vy-=26*dt;s.y+=s.vy*dt;if(s.y<=0){s.y=0;s.vy=0}}if(s.inv>0)s.inv-=dt;
itm.forEach(i=>{if(!i.got&&Math.abs(i.z-s.z)<1&&Math.abs(LX(i.l)-s.x)<1.2&&s.y<1.8){i.got=1;s.col++;S.coins++;S.score+=10}});
if(s.inv<=0)for(const o of obs)if(!o.dead&&Math.abs(o.z-s.z)<.9&&Math.abs(ox(o)-s.x)<1&&s.y<OH[o.t]-.15){obs.forEach(p=>{if(Math.abs(p.z-s.z)<6)p.dead=1});ask(L[s.qn++%L.length],'¡Chocaste! Responde para seguir',ok=>{if(!ok)s.hp--;s.inv=2;chk()});return}
if(s.gi<gz.length){const d=gz[s.gi]-s.z;if(d<55&&s.shown!=s.gi){s.shown=s.gi;const q=gQ(s.gi);gq.hidden=false;gq.innerHTML=`<b>${esc(q.q)}</b><br>`+q.o.map((o,k)=>`<span class="ch" style="background:${GC[k]}">${'ABCD'[k]}</span>${esc(o)}`).join(' ')}
if(d<=0){const q=gQ(s.gi);ask(q,'',ok=>{if(!ok)s.hp--;s.gi++;s.inv=1;chk()},s.l)}}
if(s.z>=T.len)finish()}
function deco(t,x,z){const a=Math.sin(s.t*2+x);switch(t){
case'tree':G3.box(x,1,z,.5,2,.5,'#6b4a2b');G3.pyr(x,3,z,2.4,2.6,2.4,T.leaf);G3.pyr(x,4.4,z,1.8,2,1.8,T.leaf);break;
case'hut':G3.box(x,.9,z,2.2,1.8,2.2,'#d8c39a');G3.pyr(x,2.5,z,3,1.9,3,'#c9a24a');break;
case'mound':G3.pyr(x,1.6,z,7,3.2,7,'#a07850');break;
case'stone':G3.box(x,1.6,z,1.1,3.2,.9,'#8c8f94');G3.box(x+1,.5,z+.5,1.2,1,1,'#76797e');break;
case'pot':G3.box(x,1,z,1.8,2,1.8,'#c4623a');G3.box(x,2.1,z,2.1,.3,2.1,'#7a3a22');break;
case'derrick':G3.pyr(x,4,z,2.2,8,2.2,'#4a5060');G3.box(x,8.2,z,.6,.5,.6,'#f2c14e');G3.box(x+2,.8,z,1.6,1.6,1.6,'#3a3f48');break;
case'crate':G3.box(x,.8,z,1.6,1.6,1.6,'#3a3f48');G3.box(x,.8,z,1.7,.3,1.7,'#f2c14e');break;
case'raft':[-.9,-.3,.3,.9].forEach(d=>G3.box(x+d,.2,z,.5,.4,4,'#d9b777'));G3.box(x,1.8,z,.12,3,.12,'#7a5a3a');G3.box(x,2.4,z,.1,2.2,2.2,'#f4efe2');break;
case'wave':G3.box(x,.1+.12*a,z,3,.25,2,'#d9f4fb')}}
function obstacle(o){const x=ox(o),z=-(o.z-s.z);switch(o.t){
case'rock':G3.box(x,.5,z,1.4,1,1.2,'#7c8089');G3.box(x+.1,1.05,z,.8,.3,.7,'#9aa0a8');break;
case'crab':G3.box(x,.25,z,1,.5,.7,'#d0432c');G3.box(x-.25,.6,z,.12,.2,.12,'#fff');G3.box(x+.25,.6,z,.12,.2,.12,'#fff');break;
case'log':G3.box(x,.35,z,1.8,.7,.8,'#7b5a3a');G3.box(x,.7,z,1.7,.05,.7,'#9a7a54');break;
case'pot':G3.box(x,.45,z,.9,.9,.9,'#c4623a');G3.box(x,.95,z,1.05,.15,1.05,'#7a3a22');break;
case'crate':G3.box(x,.5,z,1,1,1,'#3a3f48');G3.box(x,.5,z,1.1,.2,1.1,'#f2c14e')}}
function draw(){const t=s.t;G3.frame(T.sky,s.x*.4,4.6,7);const k0=Math.floor(s.z/4);
G3.box(0,-.2,-45,8.4,.2,140,T.g[0]);G3.box(-14.4,-.25,-45,20,.2,140,T.side);G3.box(14.4,-.25,-45,20,.2,140,T.side);
for(let k=0;k<24;k++){const z0=(k0+k)*4;if((k0+k)%2)[-2,0,2].forEach(x=>G3.box(x,-.08,-(z0+2-s.z),.08,.04,2,'#ffffff'));else G3.box(0,-.09,-(z0+2-s.z),8.4,.02,4,T.g[1])}
if(T.sea)for(let k=0;k<10;k++)G3.box(-7+hs(k)*14,.05+.1*Math.sin(t*2+k),-(k*9-s.z%9),2.4,.15,1.2,'#e6f8ff');
const i0=Math.floor(s.z/10);for(let k=0;k<14;k++)for(const sd of[-1,1]){const zi=i0+k,h=hs(zi*2+(sd>0?1:0));deco(T.deco[Math.floor(h*T.deco.length)],sd*(7+h*5),-(zi*10+h*8-s.z))}
gz.forEach((g,gi)=>{const z=-(g-s.z);if(z>-90&&z<8)for(let j=0;j<4;j++){const x=LX(j),c=GC[j];G3.box(x-.9,1.3,z,.2,2.6,.3,c);G3.box(x+.9,1.3,z,.2,2.6,.3,c);G3.box(x,2.6,z,2,.3,.3,c)}});
itm.forEach(i=>{if(!i.got&&i.z-s.z>-3&&i.z-s.z<90)G3.box(LX(i.l),.9+.15*Math.sin(t*4+i.z),-(i.z-s.z),.5,.5,.5,T.cc,t*2,.3)});
obs.forEach(o=>{if(!o.dead&&o.z-s.z>-3&&o.z-s.z<90)obstacle(o)});
if(!(s.inv>0&&Math.floor(s.inv*10)%2)){const x=s.x,y=s.y,r=s.y>0?0:Math.sin(t*14)*.5;if(T.sea)G3.box(x,.05,0,2.2,.2,2.4,'#d9b777');
G3.box(x,.03,0,1,.02,.8,'#5a4a30');G3.box(x-.22,y+.4,r*.35,.3,.8,.3,'#274a6d');G3.box(x+.22,y+.4,-r*.35,.3,.8,.3,'#274a6d');G3.box(x,y+1.15,0,.9,.9,.5,'#1fb5a6');G3.box(x,y+1.2,.38,.6,.7,.3,'#8a4b2b');G3.box(x,y+1.85,0,.55,.55,.55,'#c98a5b');G3.box(x,y+2.15,0,.95,.08,.95,'#f2c14e');G3.box(x,y+2.28,0,.5,.2,.5,'#e0a82e')}
el('hb').innerHTML='❤'.repeat(Math.max(0,s.hp))+` · 🔶 ${s.col}/${T.goal} · ${Math.round(s.z/T.len*100)}%`}
let last=performance.now();const tick=n=>{const dt=Math.min(.04,(n-last)/1000);last=n;if(!s.pause)upd(dt);if(RUN){draw();RUN.raf=requestAnimationFrame(tick)}};
RUN={raf:0,kd};RUN.raf=requestAnimationFrame(tick)}
