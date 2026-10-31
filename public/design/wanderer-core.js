(function(){
const LH=14,W=1280,H=800,ROWS=58,P=360,FONT='12px "IBM Plex Mono", monospace';
const clamp=(v,a,b)=>Math.max(a??0,Math.min(b??1,v));
function hx(h){return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16));}
function mix(a,b,t){const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('').toUpperCase();}
function rng(s){let a=s>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const hh=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v);};
const pick=(r,s)=>s[(r()*s.length)|0];

// ---------- Pip sprites ----------
const PIP_C={O:'#E8804A',H:'#F4A574',S:'#C9643A',D:'#A04E2D',E:'#2A1B15',C:'#F6DFC3',P:'#EE9A86',W:'#8C5A33',w:'#B88352',d:'#5D3A22',T:'#4A403B',M:'#5E6772',m:'#A3ACB5',G:'#D7E8EA',g:'#5E6772',K:'#6E9DAE',F:'#F6C36B'};
const KEY=[['.','Empty'],['O','Paper body'],['H','Inner glow'],['S','Ribs, arms, near legs'],['D','Far legs'],['E','Eyes, mouth'],['C','Core light'],['P','Blush'],['F','Wick flame'],['W','Hull'],['w','Rim, oar blade'],['d','Seams, oar shaft'],['T','Lantern caps, tyres, pedals'],['M','Bike frame, hubs'],['m','Spokes'],['G','Goggle glass'],['g','Goggle strap'],['K','Snorkel']];
function G(w,h){return Array.from({length:h},()=>Array(w).fill('.'));}
function R(g,x,y,w,h,c){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(j>=0&&j<g.length&&i>=0&&i<g[0].length)g[j][i]=c;}
function Ln(g,x0,y0,x1,y1,c,t){t=t||1;const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(let k=0;k<200;k++){R(g,x0,y0,t,1,c);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
function body(g,ox,oy){const r=(x,y,w,h,c)=>R(g,ox+x,oy+y,w,h,c);
 r(12,0,1,1,'F');r(11,1,3,1,'F');r(9,2,7,1,'T');
 r(7,3,11,1,'O');r(5,4,15,1,'O');r(4,5,17,8,'O');r(5,13,15,1,'O');r(7,14,11,1,'O');r(9,15,7,1,'T');
 r(4,5,17,1,'S');r(4,12,17,1,'S');r(7,7,7,4,'H');r(8,8,5,2,'C');r(5,6,1,3,'H');
 r(15,7,1,2,'E');r(18,7,1,2,'E');r(16,10,2,1,'E');r(14,9,1,1,'P');r(19,9,1,1,'P');
 r(21,9,1,2,'S');r(3,9,1,2,'D');}
const rows=g=>g.map(r=>r.join(''));
function mkWalk(){return [[0,[1,0],[-1,0]],[1,[0,0],[0,1]],[0,[-1,0],[1,0]],[1,[0,1],[0,0]]].map(([oy,p1,p2])=>{const g=G(24,20);
 const leg=(x,lift,c)=>R(g,x,16+oy,2,(19-lift)-(16+oy)+1,c);
 leg(15+p1[0],p1[1],'D');leg(6+p2[0],p2[1],'D');body(g,0,oy);leg(8+p1[0],p1[1],'S');leg(17+p2[0],p2[1],'S');return rows(g);});}
function mkBoat(){return [[21,9,26,17,0],[20,10,21,19,1],[18,10,15,19,0],[19,8,25,12,1]].map(([a,b,bx,by,oy])=>{const g=G(28,20);body(g,1,2+oy);
 R(g,0,13,1,1,'w');R(g,26,13,1,1,'w');R(g,27,12,1,2,'w');R(g,0,14,28,1,'w');R(g,1,15,26,1,'W');R(g,2,16,24,1,'d');R(g,3,17,22,1,'W');R(g,5,18,18,1,'d');
 Ln(g,a,b,bx,by,'d');R(g,bx-1,by-2,2,3,'w');R(g,a-1,b-1,2,2,'S');return rows(g);});}
function mkBike(){const C=[13,19],OF=[[0,-2],[2,0],[0,2],[-2,0]];return [0,1,2,3].map(f=>{const g=G(28,24),oy=f%2;
 const n=[C[0]+OF[f][0],C[1]+OF[f][1]],fp=[C[0]-OF[f][0],C[1]-OF[f][1]];
 Ln(g,13,16,fp[0],fp[1],'D',2);R(g,fp[0]-1,fp[1],3,1,'T');
 for(const cx of [5,22]){for(let a=0;a<6.3;a+=.04)R(g,Math.round(cx+4*Math.cos(a)),Math.round(19+4*Math.sin(a)),1,1,'T');const an=f*Math.PI/8;
  for(const q of [an,an+Math.PI/2])Ln(g,Math.round(cx-3*Math.cos(q)),Math.round(19-3*Math.sin(q)),Math.round(cx+3*Math.cos(q)),Math.round(19+3*Math.sin(q)),'m');R(g,cx,19,1,1,'M');}
 Ln(g,5,19,13,19,'M');Ln(g,5,19,10,15,'M');Ln(g,10,15,13,19,'M');Ln(g,13,19,21,15,'M');Ln(g,21,15,22,19,'M');Ln(g,21,15,25,12,'M');R(g,24,12,3,1,'M');R(g,26,12,1,1,'T');R(g,8,15,4,1,'T');
 body(g,2,oy);Ln(g,14,16+oy,n[0],n[1],'S',2);R(g,n[0]-1,n[1],3,1,'T');R(g,24,11,2,1,'S');return rows(g);});}
function mkSwim(){return [0,1,2,3].map(f=>{const g=G(28,22),oy=2+(f===1||f===2?1:0),ox=3,k=[0,1,2,1][f];
 Ln(g,ox+6,oy+15,ox+2,oy+16+k,'D',2);Ln(g,ox+16,oy+15,ox+18,oy+17-(k%2),'D',2);
 body(g,ox,oy);
 Ln(g,ox+8,oy+15,ox+4,oy+18-k,'S',2);Ln(g,ox+18,oy+15,ox+20,oy+16+(k%2),'S',2);
 R(g,ox+9,oy+7,5,1,'g');R(g,ox+14,oy+6,6,4,'G');R(g,ox+15,oy+7,1,2,'E');R(g,ox+18,oy+7,1,2,'E');
 R(g,ox+13,oy-2,1,8,'K');R(g,ox+12,oy-2,2,1,'K');return rows(g);});}
const SPR={walk:{name:'Walking',w:24,h:20,fps:6,anchor:19,note:'Stubby legs swing ±1px; 1px bob on frames 2 and 4; flame sways with the bob.',frames:mkWalk()},
 boat:{name:'Paddling',w:28,h:20,fps:4,anchor:16,note:'Oar: catch → pull → finish → recover. Hull stays still; Wick bobs 1px.',frames:mkBoat()},
 bike:{name:'Cycling',w:28,h:24,fps:8,anchor:23,note:'Spokes turn 22.5° per frame; pedals orbit the crank.',frames:mkBike()},
 swim:{name:'Swimming',w:28,h:22,fps:5,anchor:21,note:'Goggles + snorkel. Back legs kick in 3 heights, body bobs 1px. Bubbles rise from the snorkel.',frames:mkSwim()}};
SPR.walk.off=[[0,0],[0,1],[0,0],[0,1]];SPR.boat.off=[[1,2],[1,3],[1,2],[1,3]];SPR.bike.off=[[2,0],[2,1],[2,0],[2,1]];SPR.swim.off=[[3,2],[3,3],[3,3],[3,2]];

// ---------- grid helpers ----------
function gp(g,x,y,c,ci){if(x<0||y<0||x>=g.C||y>=ROWS)return;const i=y*g.C+x;g.ch[i]=c.charCodeAt(0);g.co[i]=ci;}
function gclr(g,x,y){if(x<0||y<0||x>=g.C||y>=ROWS)return;const i=y*g.C+x;g.ch[i]=0;g.co[i]=-1;}
function stamp(g,x,y,lines,ci,mask){for(let j=0;j<lines.length;j++){const s=lines[j];let a=-1,b=-1;for(let i=0;i<s.length;i++)if(s[i]!==' '){if(a<0)a=i;b=i;}if(a<0)continue;
 if(mask)for(let i=a;i<=b;i++)gclr(g,x+i,y+j);for(let i=a;i<=b;i++)if(s[i]!==' ')gp(g,x+i,y+j,s[i],ci);}}
const isN=(cx,x,y)=>x>=0&&y>=0&&x<cx.C&&y<ROWS&&cx.nm[y*cx.C+x]===1;
function wx2sx(wx,off){let s=((wx-off)%P+P)%P;if(s>P-30)s-=P;return s;}

// ---------- layer builders ----------
function pn(seed,k0,k1,fall){const r=rng(seed),h=[];let s=0;for(let k=k0;k<=k1;k++){const a=(0.4+r())/Math.pow(k,fall);h.push([k,r()*6.283,a]);s+=a;}return x=>{let v=0;for(const[k,p,a]of h)v+=a*Math.sin(6.2832*k*x/P+p);return v/s*1.6;};}
function lay(o){return Object.assign({ch:new Uint8Array(ROWS*P),co:new Uint8Array(ROWS*P),top:new Int16Array(P).fill(999),bot:new Int16Array(P).fill(-1),mask:false,speed:0},o);}
function put(l,y,x,c,ci){if(y<0||y>=ROWS)return;x=((x%P)+P)%P;const i=y*P+x;l.ch[i]=c.charCodeAt(0);l.co[i]=ci;}
function fillCol(l,x,t,b,o,r){l.top[x]=t;l.bot[x]=b;for(let y=Math.max(t+1,0);y<=Math.min(b,ROWS-1);y++){
 if(o.snow&&y-t<=o.snow.rows){if(r()<o.snow.dens)put(l,y,x,pick(r,o.snow.chars),o.snow.ci);continue;}
 let d=o.dens*(1-(o.fade||0)*(y-t)/Math.max(1,b-t));if(o.streak)d*=(y%2?1:.45);if(r()<d)put(l,y,x,pick(r,o.chars),o.ci);}}
function reflect(l,T,o){const r=rng(o.seed);for(let x=0;x<P;x++)for(let y=Math.max(0,T[x]);y<o.line;y++){const d=o.line-y,my=o.line+d-1,p=o.dens*(1-d/o.maxD);if(p>0&&r()<p)put(l,my,x+Math.round(Math.sin(my*1.3+x*.05)*1.2),pick(r,o.chars),o.ci);}}
function ridge(o){const l=lay({mask:true,speed:o.speed});const k=o.k||[1,6];const n=pn(o.seed,k[0],k[1],o.fall??1);const r=rng(o.seed+5);const T=[];
 for(let x=0;x<P;x++)T[x]=Math.round(o.topFn?o.topFn(x,n):o.base-n(x)*o.amp);
 for(let x=0;x<P;x++){const t=T[x];fillCol(l,x,t,o.bottom,o,r);const a=T[(x+P-1)%P],b=T[(x+1)%P];
  const e=o.flat?pick(r,o.flat):(a>t&&b>t)?'^':b<t?'/':a<t?'\\':pick(r,'-_');put(l,t,x,e,o.edgeCi??o.ci);}
 if(o.reflect)reflect(l,T,o.reflect);
 if(o.path)for(let x=0;x<P;x++){const y=T[x]+2+Math.round((Math.sin(6.2832*3*x/P)+1)*o.path.amp);if(y<o.bottom)put(l,y,x,'=',o.path.ci);}
 if(o.clumps)for(let i=0;i<o.clumps.count;i++){const x=(r()*P)|0,t=T[x],c=o.clumps.ci;put(l,t-2,x-1,'o',c);put(l,t-2,x,'O',c);put(l,t-2,x+1,'o',c);put(l,t-1,x-1,'O',c);put(l,t-1,x,'@',c);put(l,t-1,x+1,'O',c);put(l,t,x,'|',c);}
 if(o.coral)for(let i=0;i<o.coral;i++){const x=(r()*P)|0,t=T[x];for(let d=-1;d<=1;d++)put(l,t-1,x+d,pick(r,'@%&'),r()<.5?5:3);put(l,t-2,x,'*',5);}
 if(o.kelp){l.kelp=[];let x=0;while(x<P){l.kelp.push({x,h:6+((r()*11)|0)});x+=7+((r()*6)|0);}}
 if(o.fence){const f=o.fence;for(let x=0;x<P;x++){const t=T[x],post=x%f.gap===0;put(l,t-3,x,post?'+':'-',f.ci);if(post){put(l,t-2,x,'|',f.ci);put(l,t-1,x,'|',f.ci);}else if(r()<f.flower)put(l,t-1,x,pick(r,'*o'),5);}}
 if(o.road)for(let x=0;x<P;x++)if(x%3)put(l,o.base+4,x,'-',o.ci);
 l.T=T;return l;}
function pines(o){const l=lay({mask:true,speed:o.speed});const n=pn(o.seed,2,9,1),r=rng(o.seed+3);const B=[],T=[],S=new Int8Array(P);l.apex=[];
 for(let x=0;x<P;x++){B[x]=Math.round(o.base-n(x)*o.amp);T[x]=B[x];}
 let x=(r()*o.gap[1])|0;while(x<P){const h=o.h[0]+((r()*(o.h[1]-o.h[0]+1))|0),ap=B[x]-h,hw=Math.ceil(h/o.slope);l.apex.push({x,y:ap});
  for(let dx=-hw;dx<=hw;dx++){const xx=((x+dx)%P+P)%P,t=ap+Math.round(Math.abs(dx)*o.slope);if(t<T[xx]){T[xx]=t;S[xx]=dx<0?1:dx>0?2:3;}}
  x+=o.gap[0]+((r()*(o.gap[1]-o.gap[0]+1))|0);}
 for(let x=0;x<P;x++){fillCol(l,x,T[x],o.bottom,o,r);put(l,T[x],x,S[x]===1?'/':S[x]===2?'\\':S[x]===3?'^':pick(r,o.chars),o.edgeCi??o.ci);}
 if(o.reflect)reflect(l,T,o.reflect);l.T=T;return l;}
function scatter(o){const l=lay({speed:o.speed});const r=rng(o.seed);for(let y=o.rows[0];y<=o.rows[1]&&y<ROWS;y++){const f=1+(o.grad||0)*(y-o.rows[0])/Math.max(1,o.rows[1]-o.rows[0]);
 for(let x=0;x<P;x++){if(r()<o.dens*f)put(l,y,x,pick(r,o.chars),o.ci);else if(o.acc&&r()<o.acc.dens)put(l,y,x,pick(r,o.acc.chars),o.acc.ci);}}return l;}
function houses(o){const l=lay({mask:true,speed:o.speed});const r=rng(o.seed);l.wins=[];l.chims=[];l.apex=[];
 const setTop=(xx,y)=>{const k=((xx%P)+P)%P;if(y<l.top[k])l.top[k]=y;l.bot[k]=o.ground-1;};
 let x=2+((r()*4)|0);
 for(;;){let w=o.w[0]+((r()*(o.w[1]-o.w[0]+1))|0);if(w%2)w++;if(x+w+2>=P)break;
  let h=o.h[0]+((r()*(o.h[1]-o.h[0]+1))|0);const tower=o.tower&&r()<o.tower;if(tower)h+=5;
  const gb=o.ground,wt=gb-h;
  for(let y=wt;y<gb;y++)for(let i=0;i<w;i++){const xx=x+i;setTop(xx,y);if(i===0||i===w-1)put(l,y,xx,'|',o.ci);else if(r()<o.tex)put(l,y,xx,pick(r,'.:'),o.fillCi);}
  for(let y=wt+1;y<gb-2;y+=o.detail?3:2)for(let i=2;i+1<w-1;i+=o.detail?5:3){if(o.detail){put(l,y,x+i,'[',o.ci);put(l,y,x+i+1,']',o.ci);l.wins.push({x:x+i,y,s:'[]'});}else{put(l,y,x+i,'.',o.ci);l.wins.push({x:x+i,y,s:'.'});}}
  if(o.detail){const dx=x+Math.floor(w/2)-1;put(l,gb-3,dx+1,'_',o.ci);put(l,gb-2,dx,'|',o.ci);put(l,gb-1,dx,'|',o.ci);put(l,gb-2,dx+2,'|',o.ci);put(l,gb-1,dx+2,'|',o.ci);}
  const sl=tower?1:2;let j=0;
  for(;;j++){const x0=x-1+j*sl,x1=x+w-j*sl,y=wt-1-j;if(x1-x0<1)break;setTop(x0,y);setTop(x1,y);put(l,y,x0,'/',o.ci);put(l,y,x1,'\\',o.ci);
   for(let xx=x0+1;xx<x1;xx++){setTop(xx,y);if(r()<o.roofDens)put(l,y,xx,j%2?'=':'-',o.roofCi);}if(x1-x0<=1)break;}
  l.apex.push({x:x+Math.floor(w/2),y:wt-1-j});
  if(o.detail&&!tower&&r()<.7){const c=x+w-4;for(const[yy,s]of [[wt-5,'[]'],[wt-4,'||']]){put(l,yy,c-1,s[0],o.ci);put(l,yy,c,s[1],o.ci);setTop(c-1,yy);setTop(c,yy);}l.chims.push({x:c,y:wt-5});}
  x+=w+o.gap[0]+((r()*(o.gap[1]-o.gap[0]+1))|0);}
 l.dyn=(g,cx,off)=>{const C=cx.C,ep=Math.floor(cx.t/25);
  for(const w of l.wins){const sx=wx2sx(w.x,off);if(sx<0||sx>=C)continue;if(isN(cx,sx,w.y)&&hh(w.x,w.y+ep)<.65)for(let c=0;c<w.s.length;c++)gp(g,sx+c,w.y,w.s[c],5);}
  for(const c of l.chims){const sx=wx2sx(c.x,off);if(sx<-8||sx>C)continue;for(let k=0;k<6;k++){const a=(cx.t*.5+k/6+hh(c.x,1))%1;gp(g,Math.round(sx+Math.sin(a*5+c.x)*1.2+a*4),Math.round(c.y-1-a*8),'oO()..'[Math.floor(a*6)],2);}}
  if(l.extra)l.extra(g,cx,off,l);};
 return l;}
const withDyn=(l,f)=>(l.dyn=f,l);

// ---------- palettes over time ----------
function nightFrac(h){if(h<12)return 1-clamp((h-5)/1.25);return clamp((h-17.75)/1.25);}
function golden(h){return clamp(Math.max(1-Math.abs(h-6.7)/1.4,1-Math.abs(h-17.4)/1.4,0));}
function blue(h){return clamp(Math.max(1-Math.abs(h-19.3)/1.4,1-Math.abs(h-4.6)/1.4,0));}
function setCols(id,night,tod){const p=WE.PAL[id][night?'night':'day'];let bg=p.bg,ink=p.ink.slice(),sun,moon,hi;
 if(!night){const g=golden(tod);bg=mix(bg,'#F0D3B0',.4*g);ink=ink.map(c=>mix(c,'#A86A48',.16*g));sun=mix('#E39B5B','#DC6E45',g);moon=ink[1];hi=mix(bg,'#FFFFFF',.6);}
 else{const b=blue(tod);bg=mix(bg,'#2A2437',.55*b);ink=ink.map(c=>mix(c,'#7E6F92',.14*b));moon=mix(ink[4],'#F2E8C8',.4);sun=mix('#C9643A',bg,.3);hi=mix(ink[4],'#FFFFFF',.25);}
 return {bg,cols:[...ink,p.accent,sun,moon,hi]};}
function cardFrom(s){return {bg:mix(s.bg,s.cols[0],.55),border:s.cols[1],title:s.cols[4],artist:s.cols[3],track:s.cols[1]};}
function fmt(h){const m=Math.floor(((h%24)+24)%24*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function phaseName(h){const n=nightFrac(h);if(n>0&&n<1)return h<12?'Dawn':'Dusk';if(n>=1)return blue(h)>.2?'Blue hour':'Night';return golden(h)>.2?'Golden hour':'Day';}

// ---------- sky ----------
const CLOUDS=[["   .--.    "," .(    ).  ","(___.__)__)"],["     _  _      ","  .-( )( )-.   "," (            )","  '-.____.-'   "],[" .-~~-. ","(      )"," `-..-' "],["  .--._    ","_(     '-. ","(__.___.__)"]];
function drawSun(g,sx,sy,t,el){const rx=4.2,ry=2.2;for(let y=Math.floor(sy-ry);y<=Math.ceil(sy+ry);y++)for(let x=Math.floor(sx-rx);x<=Math.ceil(sx+rx);x++){const d=((x-sx)/rx)**2+((y-sy)/ry)**2;if(d<=1){gclr(g,x,y);gp(g,x,y,d>.55?'O':hh(x,y)>.5?'@':'0',6);}}
 const ph=Math.floor(t*1.2);for(let k=0;k<8;k++){const a=k*Math.PI/4,ch='-/|\\'[k%4];[1.75,2.3].forEach((s,j)=>{if(j&&(ph+k)%2)return;gp(g,Math.round(sx+Math.cos(a)*rx*s),Math.round(sy-Math.sin(a)*ry*s),ch,6);});}
 if(el<.4){const amt=1-Math.max(0,el)/.4;for(let r=0;r<4;r++){const y=Math.round(sy+ry+1+r),w=Math.round((10+r*7)*amt);for(let x=Math.round(sx-w);x<=Math.round(sx+w);x++)if(hh(x,y+Math.floor(t*.5))<.35*amt)gp(g,x,y,r%2?'-':'_',6);}}}
function drawMoon(g,mx,my){const rx=3.8,ry=2;for(let y=Math.floor(my-ry);y<=Math.ceil(my+ry);y++)for(let x=Math.floor(mx-rx);x<=Math.ceil(mx+rx);x++){const d=((x-mx)/rx)**2+((y-my)/ry)**2;if(d>1)continue;gclr(g,x,y);if(((x-mx)/rx+1.25)**2+((y-my)/ry)**2<1)continue;gp(g,x,y,hh(x,y)>.82?'o':d>.5?'O':'@',7);}}
function drawSky(g,cx){const{t,tod,C,b}=cx,hz=b.hz;
 for(let i=0;i<110;i++){const x=Math.floor(hh(i,1)*C),y=Math.floor(hh(i,2)*hh(i,5)*hz);if(!isN(cx,x,y))continue;gp(g,x,y,hh(i,Math.floor(t*.7+i*3))>.85?'+':hh(i,3)>.9?'*':'.',hh(i,4)>.8?4:2);}
 if(tod>5&&tod<19){const th=Math.PI*(tod-6)/12,sx=C*(.08+.84*th/Math.PI),sy=hz-Math.sin(th)*(hz-7);cx.sun={x:sx,y:sy};drawSun(g,sx,sy,t,Math.sin(th));}
 const mt=(tod+6)%24;if(mt<12.8){const th=Math.PI*(mt-.4)/12,mx=C*(.1+.8*th/Math.PI),my=hz-Math.sin(th)*(hz-6);cx.moon={x:mx,y:my};drawMoon(g,mx,my);}
 for(let i=0;i<7;i++){const span=C+60,x=Math.round(((hh(i,9)*span-t*(.18+hh(i,8)*.12))%span+span)%span)-30,y=3+Math.floor(hh(i,7)*(hz-14));stamp(g,x,y,CLOUDS[i%4],1,true);}
 if(b.birds)for(let f=0;f<2;f++){const span=C+80,x0=((hh(f,21)*span+t*(1.6+f*.5))%span)-40,y0=7+Math.floor(hh(f,22)*(hz-16));
  [[0,0],[-3,-1],[-3,1],[-6,-2],[-6,2]].forEach(([dx,dy],k)=>{const x=Math.round(x0+dx),y=Math.round(y0+dy+Math.sin(t*1.5+k)*.6),fl=(Math.floor(t*4)+k)%2,n=isN(cx,x,y);if(n&&b.birds!=='bats')return;gp(g,x,y,n?(fl?'^':'v'):(fl?'v':'-'),3);});}}
function seaTop(g,cx){const{t,C}=cx;for(let x=0;x<C;x++){const y=2+Math.round(Math.sin(x*.18+t*.8)*.6);gp(g,x,y,'~',3);if(hh(x,Math.floor(t*2))<.25)gp(g,x,y-1,'.',1);if(hh(x,5)<.18)gp(g,x,y+1,'-',2);}
 for(let r=0;r<7;r++){const span=C+30,x0=((r*29+hh(r,1)*40+t*.35)%span)-15,amp=Math.sin(t*.3+r)*.5+.5;for(let y=4;y<36;y++){const x=Math.round(x0+(y-4)*.45),p=(1-(y-4)/32)*.5*amp;if(hh(x,y+r*7)<p)gp(g,x,y,'\\',1);}}}

// ---------- compose + paint ----------
function composeB(b,st,nm,E){const C=E.C,N=ROWS*C,g={ch:new Uint8Array(N),co:new Int8Array(N).fill(-1),C};
 const a=SPR[b.act],top=b.ground*LH+10-(a.anchor+1)*st.S;
 const cx={t:st.t,tod:st.tod,C,nm,b,sun:null,moon:null,pip:{bx:(W*(st.pipX??.36)+17*st.S)/E.cw,by:top/LH}};
 if(b.sea)seaTop(g,cx);else drawSky(g,cx);
 for(const l of E.L[b.id]){const off=Math.floor(st.t*l.speed)%P;
  for(let x=0;x<C;x++){const sx=(x+off)%P;
   if(l.mask&&l.bot[sx]>=0)for(let y=Math.max(0,l.top[sx]);y<=Math.min(ROWS-1,l.bot[sx]);y++){g.ch[y*C+x]=0;g.co[y*C+x]=-1;}
   for(let y=0;y<ROWS;y++){const c=l.ch[y*P+sx];if(c){g.ch[y*C+x]=c;g.co[y*C+x]=l.co[y*P+sx];}}}
  if(l.dyn)l.dyn(g,cx,off,l);}
 if(b.post)b.post(g,cx);return g;}
let BUF=null;
function paintGrid(ctx,g,nm,isB,sets,C,cw){
 for(let y=0;y<ROWS;y++){let x=0;while(x<C){const i=y*C+x,k=(isB?isB[i]*2:0)+nm[i];let e=x+1;while(e<C){const j=y*C+e;if((isB?isB[j]*2:0)+nm[j]!==k)break;e++;}
  ctx.fillStyle=sets[k].bg;const x0=Math.floor(x*cw),x1=e>=C?W:Math.ceil(e*cw);ctx.fillRect(x0,y*LH,x1-x0,LH+(y===ROWS-1?20:0));x=e;}}
 ctx.font=FONT;ctx.textBaseline='top';const NC=sets.length*9;if(!BUF||BUF[0].length!==C)BUF=Array.from({length:36},()=>new Uint16Array(C));
 for(let y=0;y<ROWS;y++){const list=[],used=new Uint8Array(NC);for(let x=0;x<C;x++){const i=y*C+x,c=g.co[i];if(c<0||!g.ch[i])continue;const idx=((isB?isB[i]*2:0)+nm[i])*9+c;if(!used[idx]){used[idx]=1;BUF[idx].fill(32);list.push(idx);}BUF[idx][x]=g.ch[i];}
  for(const idx of list){ctx.fillStyle=sets[(idx/9)|0].cols[idx%9];ctx.fillText(String.fromCharCode.apply(null,BUF[idx]),0,y*LH+1);}}}
function drawSprite(ctx,fr,x,y,s){for(let r=0;r<fr.length;r++)for(let c=0;c<fr[r].length;c++){const k=fr[r][c];if(k!=='.'){ctx.fillStyle=PIP_C[k];ctx.fillRect(x+c*s,y+r*s,s,s);}}}
const PROP_C={a:'#E8E1D3',b:'#6E8F9A',B:'#56737D',k:'#D9B26A',n:'#8C5A33',z:'#4F5B8A',y:'#F6C36B',h:'#4A403B',u:'#5E6772',l:'#7F8F5E',s:'#5D7046',f:'#4A403B',g:'#F6C36B',G:'#FFF1C9',p:'#EE9A86',c:'#F6C36B',m:'#E8E1D3',v:'#CFC8B9',w:'#5D3A22',q:'#E8DCC0',r:'#B88352',j:'#8C5A33',J:'#B88352'};
const PROPS={
 beanie:{slot:'head',name:'Beanie',at:[6,-3],rows:['......a......','.....bbb.....','...bbbbbbb...','..bbbbbbbbb..','.BBBBBBBBBBB.','.BBBBBBBBBBB.']},
 straw:{slot:'head',name:'Straw hat',at:[3,-1],rows:['......kkkkkk......','......kkkkkk......','......nnnnnn......','kkkkkkkkkkkkkkkkkk']},
 wizard:{slot:'head',name:'Wizard hat',at:[6,-5],rows:['........z..','.......zz..','......zzz..','.....zzzz..','....zzyzz..','...zzzzzzz.','zzzzzzzzzzz']},
 headphones:{slot:'head',name:'Headphones',at:[9,0],rows:['..hhhhh..','.h.....h.','h.......h','h........','uu.......','uuu......','uuu......','uu.......']},
 leaf:{slot:'head',name:'Sprout',at:[12,-4],rows:['.ll','lll','ll.','s..']},
 lantern:{slot:'hand',name:'Lantern',glow:[23,11],at:[22,9],rows:['f..','fff','gGg','gGg','fff']},
 flower:{slot:'hand',name:'Flower',at:[21,2],rows:['.p.','pcp','.p.','.s.','.s.','.s.','.s.']},
 mug:{slot:'hand',name:'Coffee',at:[22,5],rows:['.v..','v...','mwm.','mmmm','mmm.'],rows2:['v...','.v..','mwm.','mmmm','mmm.']},
 map:{slot:'hand',name:'Map',at:[22,7],rows:['qqqq','qrrq','qqrq','qqqq']},
 backpack:{slot:'back',name:'Backpack',at:[1,5],rows:['.jjj.','jJJJj','jJJJj','jjjjj','jjjjj','jjjjj','.jjj.']}};
function drawProps(ctx,act,f,x,y,s,list,night){const off=SPR[act].off[f];for(const id of list||[]){const p=PROPS[id];if(!p)continue;const rows=p.rows2&&f%2?p.rows2:p.rows,ox=off[0]+p.at[0],oy=off[1]+p.at[1];
 if(night&&p.glow){const cx=x+(off[0]+p.glow[0]+.5)*s,cy=y+(off[1]+p.glow[1]+.5)*s;[[10,.10],[6,.14]].forEach(([r,al])=>{ctx.fillStyle='rgba(246,195,107,'+al+')';ctx.beginPath();ctx.arc(cx,cy,r*s,0,6.283);ctx.fill();});}
 for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++){const k=rows[r][c];if(k!=='.'){ctx.fillStyle=PROP_C[k];ctx.fillRect(x+(ox+c)*s,y+(oy+r)*s,s,s);}}}}
function fit(c,w,h,d){if(c.width!==Math.round(w*d)){c.width=Math.round(w*d);c.height=Math.round(h*d);}const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return x;}
const ease=p=>p<.5?2*p*p:1-2*(1-p)*(1-p);
function makeEngine(){const c=document.createElement('canvas').getContext('2d');c.font=FONT;const cw=c.measureText('M').width||7.2,C=Math.ceil(W/cw),N=ROWS*C;
 const Hh=new Float32Array(N),H2=new Float32Array(N);for(let i=0;i<N;i++){Hh[i]=hh(i%C,(i/C|0)+.5);H2[i]=hh((i%C)+.3,(i/C|0)*1.7+9);}
 const L={};WE.BIOMES.forEach(b=>L[b.id]=b.layers());return {C,cw,H:Hh,H2,L};}
// st: {a,b?,mode:'h'|'v',dir,p,tod,t,S,card,pipX?}  (pipX: Wick's x as a fraction of width; added for Wanderer's player layout)
function renderFrame(cv,st,E,dpr){const C=E.C,cw=E.cw,ctx=fit(cv,W,H,dpr),N=ROWS*C,n=nightFrac(st.tod),lim=n*(ROWS+8),nm=new Uint8Array(N);
 for(let i=0;i<N;i++)nm[i]=((i/C|0)+E.H[i]*8)<lim?1:0;
 const BM=WE.BM,A=composeB(BM[st.a],st,nm,E);let g=A,isB=null,pipId=st.a;
 if(st.b){const B=composeB(BM[st.b],st,nm,E);g={ch:new Uint8Array(N),co:new Int8Array(N),C};isB=new Uint8Array(N);
  if(st.mode==='v'){const down=st.dir>0,top=down?A:B,bot=down?B:A,s=Math.round((down?st.p:1-st.p)*ROWS);
   for(let y=0;y<ROWS;y++){const sy=y+s,src=sy<ROWS?top:bot,ry=sy<ROWS?sy:sy-ROWS,srcB=(sy<ROWS)===!down;for(let x=0;x<C;x++){const i=y*C+x,j=ry*C+x;g.ch[i]=src.ch[j];g.co[i]=src.co[j];isB[i]=srcB?1:0;}}
   pipId=st.p>.5?st.b:st.a;}
  else{const c0=C*(1.15-1.45*st.p),c1=c0+C*.26;for(let i=0;i<N;i++){const x=i%C,pr=clamp((x-c0)/(c1-c0)),bb=E.H2[i]<pr,src=bb?B:A;g.ch[i]=src.ch[i];g.co[i]=src.co[i];isB[i]=bb?1:0;}
   pipId=(c0+c1)/2<C*.38?st.b:st.a;}}
 if(st.card){const x0=Math.floor((W-16-272)/cw)-1;for(let y=1;y<=8;y++)for(let x=x0;x<C;x++)g.co[y*C+x]=-1;}
 const sets=[setCols(st.a,0,st.tod),setCols(st.a,1,st.tod)];if(st.b)sets.push(setCols(st.b,0,st.tod),setCols(st.b,1,st.tod));
 paintGrid(ctx,g,nm,isB,sets,C,cw);
 const b=BM[pipId],a=SPR[b.act],f=Math.floor(st.t*a.fps)%4,px=Math.round(W*(st.pipX??.36)),py=b.ground*LH+10-(a.anchor+1)*st.S,sd=st.b&&pipId===st.b?(st.seedB||0):(st.seed||0);drawSprite(ctx,a.frames[f],px,py,st.S);if(st.props!==false&&WE.pickProps)drawProps(ctx,b.act,f,px,py,st.S,WE.pickProps(b.id,b.act,sd,n>.5),n>.5);}
function gridText(fn,C,R0,R1){const g={ch:new Uint8Array(ROWS*C),co:new Int8Array(ROWS*C).fill(-1),C};fn(g);const out=[];for(let y=R0;y<=R1;y++){let s='';for(let x=0;x<C;x++){const c=g.ch[y*C+x];s+=c?String.fromCharCode(c):' ';}out.push(s.replace(/\s+$/,''));}return out.join('\n');}

window.WE=Object.assign(window.WE||{},{LH,W,H,ROWS,P,FONT,clamp,mix,rng,hh,PIP_C,KEY,SPR,gp,gclr,stamp,isN,wx2sx,ridge,pines,scatter,houses,withDyn,nightFrac,golden,blue,setCols,cardFrom,fmt,phaseName,CLOUDS,drawSun,drawMoon,renderFrame,drawSprite,drawProps,PROPS,PROP_C,fit,ease,makeEngine,gridText});
})();
