const G3=(()=>{let gl,u={},M={},last,VP,A=2,C={};
const col=h=>C[h]||(C[h]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255));
const mul=(a,b)=>{const o=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o};
const T=(x,y,z)=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]),Sc=(x,y,z)=>new Float32Array([x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]);
const RY=a=>{const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1])};
const RX=a=>{const c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1])};
const P=(f,a,n,r)=>{const t=1/Math.tan(f/2);return new Float32Array([t/a,0,0,0,0,t,0,0,0,0,(r+n)/(n-r),-1,0,0,2*r*n/(n-r),0])};
const F=[[0,0,1],[0,0,-1],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]];
function cube(){const v=[];F.forEach(n=>{const q=n[0]?[0,1,0]:[1,0,0],w=[n[1]*q[2]-n[2]*q[1],n[2]*q[0]-n[0]*q[2],n[0]*q[1]-n[1]*q[0]];[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]].forEach(([a,b])=>{for(let i=0;i<3;i++)v.push(n[i]*.5+q[i]*a*.5+w[i]*b*.5);v.push(...n)})});return v}
function pyr(){const v=[];[[0,1],[1,0],[0,-1],[-1,0]].forEach(([x,z])=>{const n=[x*.9,.5,z*.9];[[x*.5-z*.5,-.5,z*.5-x*.5],[x*.5+z*.5,-.5,z*.5+x*.5],[0,.5,0]].forEach(p=>v.push(...p,...n))});return v}
function mesh(d){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.STATIC_DRAW);return{b,n:d.length/6}}
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
function draw(m,x,y,z,sx,sy,sz,c,ry,em){const o=M[m];if(last!==m){gl.bindBuffer(gl.ARRAY_BUFFER,o.b);gl.vertexAttribPointer(u.p,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(u.n,3,gl.FLOAT,false,24,12);last=m}
gl.uniformMatrix4fv(u.M,false,mul(T(x,y,z),mul(RY(ry||0),Sc(sx,sy,sz))));gl.uniform3fv(u.c,col(c));gl.uniform1f(u.em,em||0);gl.drawArrays(gl.TRIANGLES,0,o.n)}
return{init(cv){gl=cv.getContext('webgl',{antialias:true});if(!gl)return 0;A=cv.width/cv.height;
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec3 p;attribute vec3 n;uniform mat4 M,V;uniform vec3 c;uniform float em;varying vec3 k;varying float f;void main(){vec4 w=M*vec4(p,1.);float d=max(dot(normalize(mat3(M)*n),normalize(vec3(.4,1.,.6))),0.);k=c*(.5+.65*d)+c*em;f=clamp((-w.z-18.)/85.,0.,1.);gl_Position=V*w;}'));
gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 k;varying float f;uniform vec3 fg;void main(){gl_FragColor=vec4(mix(k,fg,f),1.);}'));gl.linkProgram(pr);gl.useProgram(pr);
u={p:gl.getAttribLocation(pr,'p'),n:gl.getAttribLocation(pr,'n'),M:gl.getUniformLocation(pr,'M'),V:gl.getUniformLocation(pr,'V'),c:gl.getUniformLocation(pr,'c'),em:gl.getUniformLocation(pr,'em'),fg:gl.getUniformLocation(pr,'fg')};
gl.enableVertexAttribArray(u.p);gl.enableVertexAttribArray(u.n);gl.enable(gl.DEPTH_TEST);M.b=mesh(cube());M.p=mesh(pyr());return 1},
frame(sky,cx,cy,cz){const c=col(sky);gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);gl.clearColor(c[0],c[1],c[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform3fv(u.fg,c);gl.uniformMatrix4fv(u.V,false,mul(P(.95,A,.5,200),mul(RX(.36),T(-cx,-cy,-cz))));last=null},
box:(...a)=>draw('b',...a),pyr:(...a)=>draw('p',...a)}})();
