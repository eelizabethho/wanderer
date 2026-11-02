// More animals for the six original biomes. Hooks in by wrapping each biome's layers()/post,
// so wanderer-biomes.js stays untouched. Loads before makeEngine() calls layers().
(function(){
const E=window.WE,B=E.BM,{stamp,gp,isN,wx2sx,hh,P}=E;
const W=x=>((Math.floor(x)%P)+P)%P,F=(t,f)=>Math.floor(t*f)%2;
const N=(cx,x,y)=>isN(cx,Math.max(0,Math.min(cx.C-1,x)),Math.max(0,y)); // night test that also works half off-screen
// on(): f runs right after layer k is composed, so nearer layers still cover it; post(): f runs after all layers
const on=(id,k,f)=>{const b=B[id],o=b.layers;b.layers=()=>{const ls=o(),l=ls[k],p=l.dyn;l.dyn=(g,cx,off,ll)=>{p&&p(g,cx,off,ll);f(g,cx,off,ll);};return ls;};};
const post=(id,f)=>{const b=B[id],p=b.post;b.post=(g,cx)=>{p&&p(g,cx);f(g,cx);};};
const DEER=[['  \\/'," <')___",'   (   )','   /| |\\'],['','    ____','  /(   )',"<' /| |\\"]],
 FOX=[['    /\\',"~~(_/'>",'  /\\ /\\'],['    /\\',"~~(_/'>",'  |\\ |\\']],
 COW=[['^__^____','(oo) @  )~','  ||  ||'],['^__^____','(oo) @  )\\','  ||  ||'],['^__^____','(--) @  )_','  ||  ||']],
 DOG=[['    __','\\___/ o>',' /\\ /\\'],['    __','/___/ o>',' |\\ |\\']],OWL=[['{o,o}','/)_)',' " "'],['{-,-}','/)_)',' " "']],
 HERON=[[' __',"==o'",'   \\\\','  (__\\>','   ||'],['','','  ,-.','=o (__\\>','   ||']],FROG=[[' @..@','(----)'],[' -..-','(----)'],[' @..@','( oo )']],
 WHALE=[' .---------.','/o           `-._/)',"\\_.---------.__.-'\\)"],TURTLE=[['  .----.',' /_/\\_\\_\\o',"  /'   '\\"],['  .----.','~/_/\\_\\_\\o',"  \\'   '/"]],
 OCTO=[[' ,--.','( oo )','/)/\\(\\'],[' ,--.','( oo )','\\(\\/)/']],SEAHORSE=[' _',"<'\\",'  _)','  (',"   `,"],ANGLER=[' ,-.__','*  /  `\\',"  <'vvv )><"],
 GOAT=['  ))',"<'\\___",'  /| |\\'],MARMOT=[' n_n','(o.o)',' ) ('],BEAR=[' _  ______','(o\\/      \\',' `-|_|--|_|'],WOLF=[['  /\\',"<' |",' /  |','(__)_)'],['  /|',"/' |",'/   )~','(__)_)']];
// butterflies: n of them drifting right over rows y0..y0+yr, day only, accent colour
const flutter=(n,y0,yr,s)=>(g,cx)=>{const{t,C}=cx,span=C+20;for(let i=0;i<n;i++){const x=Math.round(((hh(i,s)*span+t*(.6+hh(i,s+1))+Math.sin(t*.7+i*2)*6)%span+span)%span)-10,
 y=Math.round(y0+hh(i,s+2)*yr+Math.sin(t*1.9+i*3)*1.5);if(!N(cx,x,y))stamp(g,x,y,[F(t+i*.13,4)?'}{':')('],5,true);}};

// forest: grazing deer on the path, a fox trotting through at night, butterflies by day
on('forest',3,(g,cx,off,l)=>{const t=cx.t;
 [150,318].forEach((wx,i)=>stamp(g,wx2sx(wx,off),l.T[wx]-4,DEER[(t*.13+i*.5)%1<.3?0:1],3,true));
 const fx=W(40+t*5),sx=wx2sx(fx,off),y=l.T[fx]-3;if(N(cx,sx+3,y))stamp(g,sx,y,FOX[F(t,5)],4,true);});
post('forest',flutter(4,36,8,61));

// hills: cows on the far hillside (eyes shut at night), a dog trotting along the fence, an owl on a post at night
on('hills',1,(g,cx,off,l)=>[125,215].forEach((wx,i)=>{const sx=wx2sx(wx,off),y=l.T[wx]+1;stamp(g,sx,y,COW[N(cx,sx+3,y)?2:F(cx.t*.6+i*.5,1)],3,true);}));
on('hills',2,(g,cx,off,l)=>{const t=cx.t,dx=W(30+t*4),sx=wx2sx(dx,off),y=l.T[dx]-3;if(!N(cx,sx+3,y))stamp(g,sx,y,DOG[F(t,5)],3,true);
 const ox=wx2sx(154,off),oy=l.T[154]-6;if(N(cx,ox,oy))stamp(g,ox-2,oy,OWL[(t%7)<.25?1:0],3,true);});
post('hills',flutter(5,37,8,71));

// town: pigeons that scatter when Clawd walks up, a dog by day, a mouse scurrying at night
on('town',4,(g,cx,off)=>{const t=cx.t;
 [0,7,13,20].forEach((d,k)=>{const sx=wx2sx(70+d,off),u=Math.max(0,cx.pip.bx+18-sx);if(N(cx,sx,44))return;
  if(!u)stamp(g,sx,44,[F(t*.8+k*.61,1)?"(')>":'(,)>'],3,true);else gp(g,Math.round(sx+u*(1.6+k*.3)),Math.round(44-u*(1.2+k*.2)),F(t*4+k,1)?'v':'^',3);});
 const dx=wx2sx(W(200+t*3),off);if(!N(cx,dx+3,43))stamp(g,dx,42,DOG[F(t,4)],3,true);
 const mx=wx2sx(W(300-7*Math.floor(t/2.2)-7*Math.min(1,(t%2.2)*4)),off);if(N(cx,mx,44))stamp(g,mx,44,['<:3)~'],4,true);});

// lake: a heron fishing among reeds by the shore, frogs on lily pads (croaking at night), dragonflies by day
on('lake',1,(g,cx,off)=>{const t=cx.t,hx=wx2sx(75,off);if(!N(cx,hx,32))stamp(g,hx,31,HERON[(t%9)<1?1:0],3,true);
 [63,67,70,85,88,150,154,232,236,240,300].forEach(wx=>{const sx=wx2sx(wx,off),h=2+Math.floor(hh(wx,81)*3);for(let j=0;j<h;j++)gp(g,sx,35-j,j<h-1?'|':Math.sin(t*.8+wx)>.3?'/':'|',2);});});
on('lake',2,(g,cx,off)=>{const t=cx.t;[[40,41,1],[49,44,0],[150,39,1],[262,42,0]].forEach(([wx,y,f],i)=>{const sx=wx2sx(wx,off);stamp(g,sx,y,['~=====~'],2,true);
 if(f)stamp(g,sx,y-2,FROG[N(cx,sx,y)?(F(t*.7+i,1)?2:0):(t+i*3)%5<.2?1:0],3,true);});});
post('lake',(g,cx)=>{const{t,C}=cx;for(let i=0;i<3;i++){const s=t/2.3+i*.4,k=Math.floor(s),q=Math.min(1,(s-k)*5),
 at=j=>[C*(.2+i*.27)+(hh(j,i+90)-.5)*30,33+hh(j,i+95)*9],a=at(k-1),b=at(k),x=Math.round(a[0]+(b[0]-a[0])*q),y=Math.round(a[1]+(b[1]-a[1])*q);
 if(!N(cx,x,y))stamp(g,x,y,[(b[0]<a[0]?['x--','+--']:['--x','--+'])[F(t,9)]],5,true);}});

// sea: a far whale behind everything, an octopus and a seahorse on the reef, a sea turtle, an anglerfish at night
on('sea',0,(g,cx)=>{const{t,C}=cx,span=C+70;stamp(g,Math.round(((C*.9-t*.45)%span+span)%span)-30,Math.round(7+Math.sin(t*.2)),WHALE,1,true);});
on('sea',1,(g,cx,off,l)=>{const t=cx.t,ox=wx2sx(120,off);stamp(g,ox,l.T[120]-3,OCTO[F(t,1.4)],(t%9)<1.2?5:3,true);
 const kx=l.kelp[9].x;stamp(g,wx2sx(kx,off)+1,Math.round(l.T[kx]-10+Math.sin(t*.8)*1.5),SEAHORSE,3,true);});
post('sea',(g,cx)=>{const{t,C}=cx,span=C+40;stamp(g,Math.round(((t*1.1+C*.1)%span+span)%span)-20,Math.round(21+Math.sin(t*.5)*1.5),TURTLE[F(t,1.2)],3,true);
 const ax=Math.round(((C*.4-t*.5)%span+span)%span)-20;if(N(cx,ax+4,41)){stamp(g,ax,40,ANGLER,3,true);gp(g,ax,41,F(t*1.5,1)?'*':'+',5);}});

// peaks: goats hopping between ledges on the dome, a wolf howling on the summit at night, a marmot by day, a distant bear
on('peaks',1,(g,cx,off,l)=>{const t=cx.t;[[50,1],[170,-1]].forEach(([b,d],i)=>{const s=t/7+i*.5,k=Math.floor(s),h=Math.min(1,(s-k)/.15),X=j=>b+d*[0,3,6,3][((j%4)+4)%4],x=X(k-1)+(X(k)-X(k-1))*h;
  stamp(g,wx2sx(Math.round(x),off),l.T[W(x)]-3-Math.round(Math.sin(Math.PI*h)*2),GOAT,3,true);});
 const wx=wx2sx(104,off),wy=l.T[104]-4;if(N(cx,wx+2,wy))stamp(g,wx,wy,WOLF[(t%10)<3?1:0],4,true);});
on('peaks',2,(g,cx,off)=>{const bx=wx2sx(W(120+cx.t*.3),off);if(!N(cx,bx+4,42))stamp(g,bx,41,BEAR,3,true);});
on('peaks',3,(g,cx,off,l)=>[140,290].forEach((wx,i)=>{const c=(cx.t+i*4)%9,h=Math.round(c<.6?c/.6*3:c<5?3:c<5.4?(5.4-c)/.4*3:0),sx=wx2sx(wx,off);
 if(h&&!N(cx,sx+2,l.T[wx]-2))stamp(g,sx,l.T[wx]-h,MARMOT.slice(0,h),3,true);}));
})();
