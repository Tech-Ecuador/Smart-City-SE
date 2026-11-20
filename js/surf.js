const BEACH=[
{n:'Montañita',sky:'#8fd3f0',w:['#1aa3c9','#1590b3'],sp:11,rk:.5},
{n:'Olón',sky:'#a8dcf0',w:['#2bb3c0','#22a2ae'],sp:12,rk:.55},
{n:'Ayangue',sky:'#9fe0e6',w:['#27c2b8','#1fb0a7'],sp:12.5,rk:.6},
{n:'San Pablo',sky:'#f0c28a',w:['#1f8fb0','#1a7e9c'],sp:13,rk:.65},
{n:'Salinas',sky:'#c6b5e6',w:['#2a86b8','#2376a5'],sp:13.5,rk:.7}];
function surfMenu(){S.surfU=S.surfU||1;S.surfB=S.surfB||[];$.innerHTML=hud()+`<button class="btn ghost" onclick="go(home)">← Inicio</button><h2 class="gold">🏄 Surf Challenge</h2><p><small>Mantente en la franja de espuma clara para ganar puntos de equilibrio y esquiva rocas y troncos. Con 250 puntos desbloqueas la siguiente playa.</small></p><div class="grid">${BEACH.map((b,i)=>{const op=i<S.surfU;return `<div class="card ${op?'':'locked'}"><h3>${op?'🏖️':'🔒'} ${b.n}</h3><small>Mejor puntaje: ${S.surfB[i]||0}</small><br>${op?`<button class="btn" onclick="go(playSurf,${i})">Surfear</button>`:''}</div>`}).join('')}</div>`}
function playSurf(i){stopRun();const B=BEACH[i],df={Explorador:.85,Aventurero:1,Investigador:1.15}[S.diff]||1;
$.innerHTML=hud()+`<button class="btn ghost" id="bk">← Playas</button><h2 class="gold">🏄 ${B.n}</h2><div class="stage"><canvas id="cv" width="960" height="480" aria-label="Surf en 3D"></canvas><div class="hb" id="hb"></div><div id="ov" class="ov" hidden></div></div><div class="pad"><button class="btn" id="pl">◀ Izquierda</button><button class="btn" id="pr">Derecha ▶</button></div><small>Flechas o A/D para moverte, o arrastra sobre la pantalla. Mantente en la franja de espuma clara para sumar equilibrio.</small>`;
const ov=el('ov');el('bk').onclick=()=>go(surfMenu);if(!G3.init(el('cv'))){ov.hidden=false;ov.innerHTML='<div class="card">Tu navegador no admite WebGL.</div>';return}
let sd=i*31+5;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647,len=520,rocks=[];
for(let z=30;z<len;z+=(15-B.rk*8)/df)rocks.push({x:(rnd()-.5)*10,z,t:rnd()<.3?'log':'rock'});
const s={z:0,x:0,tx:0,hp:3,inv:0,t:0,bal:0},sw=t=>3.6*Math.sin(t*.55)+1.2*Math.sin(t*1.3),sc=()=>Math.floor(s.bal)+Math.floor(s.z/10),nudge=d=>{s.tx=Math.max(-5,Math.min(5,s.tx+d*1.6))};
const kd=e=>{if(['ArrowLeft','KeyA'].includes(e.code)){e.preventDefault();nudge(-1)}else if(['ArrowRight','KeyD'].includes(e.code)){e.preventDefault();nudge(1)}};
document.addEventListener('keydown',kd);el('pl').onpointerdown=()=>nudge(-1);el('pr').onpointerdown=()=>nudge(1);
const cv=el('cv'),drag=e=>{if(e.buttons||e.pointerType=='touch'){const r=cv.getBoundingClientRect();s.tx=Math.max(-5,Math.min(5,(e.clientX-r.left)/r.width*10-5))}};cv.onpointerdown=drag;cv.onpointermove=drag;
function fin(){stopRun();const p=sc(),win=s.z>=len;S.surfB=S.surfB||[];S.surfB[i]=Math.max(S.surfB[i]||0,p);S.score+=p;S.coins+=Math.floor(p/50);S.xp+=30;let un='';
if(p>=250&&i+1==(S.surfU||1)&&i<4){S.surfU=i+2;un=`<p>🔓 ¡Desbloqueaste <b>${BEACH[i+1].n}</b>!</p>`}save();ov.hidden=false;
ov.innerHTML=`<div class="card" style="text-align:center"><h2 class="gold">${win?'¡Llegaste a la orilla!':'¡Caíste de la tabla!'}</h2><p>Puntos: <b>${p}</b> · Equilibrio: ${Math.floor(s.bal)}</p>${un}<button class="btn" id="r1">Reintentar</button><button class="btn sec" id="r2">Playas</button></div>`;el('r1').onclick=()=>go(playSurf,i);el('r2').onclick=()=>go(surfMenu)}
function upd(dt){s.t+=dt;s.z+=B.sp*df*dt;s.x+=(s.tx-s.x)*Math.min(1,8*dt);if(s.inv>0)s.inv-=dt;if(Math.abs(s.x-sw(s.t))<1.4)s.bal+=12*dt;
if(s.inv<=0)for(const o of rocks)if(!o.dead&&Math.abs(o.z-s.z)<.9&&Math.abs(o.x-s.x)<1){o.dead=1;s.hp--;s.inv=1.5;break}
if(s.hp<=0||s.z>=len)fin()}
function draw(){const t=s.t,k0=Math.floor(s.z/4);G3.frame(B.sky,s.x*.3,4.4,7);G3.box(0,-.2,-45,30,.2,140,B.w[0]);
for(let k=0;k<24;k++)if((k0+k)%2)G3.box(0,-.09,-((k0+k)*4+2-s.z),30,.02,4,B.w[1]);
G3.box(sw(t),-.05,-45,3,.04,140,'#dff9f6',0,.15);
for(let k=0;k<10;k++)G3.box(-12+hs(k+i)*24,.05+.1*Math.sin(t*2+k),-(k*9-s.z%9),2.4,.15,1.2,'#e6f8ff');
const i0=Math.floor(s.z/12);for(let k=0;k<10;k++)for(const d of[-1,1]){const zi=i0+k,h=hs(zi*3+(d>0?1:2)+i),x=d*(11+h*3),z=-(zi*12+h*6-s.z);G3.box(x,.5,z,1.2,1,1.2,'#6b4a2b');G3.pyr(x,1.8,z,3,2,3,'#3f8f3f')}
rocks.forEach(o=>{const dz=o.z-s.z;if(o.dead||dz<-3||dz>90)return;if(o.t=='rock'){G3.box(o.x,.5,-dz,1.4,1,1.2,'#7c8089');G3.box(o.x+.1,1.05,-dz,.8,.3,.7,'#9aa0a8')}else G3.box(o.x,.3,-dz,2,.6,.8,'#7b5a3a')});
if(!(s.inv>0&&Math.floor(s.inv*10)%2)){const x=s.x,l=(s.tx-s.x)*.08;G3.box(x,.1,0,.9,.14,2.6,'#f2c14e',l);G3.box(x,.18,0,.15,.02,2.6,'#d9693f',l);G3.box(x-.2,.7,.4,.28,.9,.28,'#274a6d',l);G3.box(x+.2,.7,-.4,.28,.9,.28,'#274a6d',l);G3.box(x,1.4,0,.7,.8,.45,'#1fb5a6',l);G3.box(x,2.05,0,.5,.5,.5,'#c98a5b',l);G3.box(x,2.38,0,.85,.08,.85,'#f2c14e',l)}
el('hb').innerHTML='❤'.repeat(Math.max(0,s.hp))+` · ⚖️ ${Math.floor(s.bal)} · ⭐ ${sc()} · ${Math.round(s.z/len*100)}%`}
let last=performance.now();const tick=n=>{const dt=Math.min(.04,(n-last)/1000);last=n;upd(dt);if(RUN){draw();RUN.raf=requestAnimationFrame(tick)}};RUN={raf:0,kd};RUN.raf=requestAnimationFrame(tick)}
