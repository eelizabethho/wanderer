// Three more biomes (desert, tundra, canyon river), appended to the design's six. Loads after wanderer-biomes.js.
(function(){
const E=window.WE,{ridge,pines,scatter,withDyn,stamp,gp,gclr,isN,wx2sx,hh,clamp,P,ROWS}=E;
Object.assign(E.PAL,{
 desert:{day:{bg:'#F3E7CF',ink:['#E2CDA9','#CCAD83','#AC885E','#7E5C3B','#503723'],accent:'#C2603F'},night:{bg:'#13111E',ink:['#211E33','#2F2A46','#463F61','#6A6187','#A097B9'],accent:'#8FE3C9'}},
 tundra:{day:{bg:'#EEF2F3',ink:['#D8E0E4','#BDCAD2','#95A7B3','#667B89','#3B4A56'],accent:'#4F93B0'},night:{bg:'#0B111E',ink:['#172036','#222E4A','#334267','#50628C','#8193BD'],accent:'#7DF0B0'}},
 canyon:{day:{bg:'#F2E3D5',ink:['#E3C9B4','#D0A585','#B47956','#864E32','#56301E'],accent:'#3F8F9C'},night:{bg:'#150F13',ink:['#261A20','#37262D','#51373D','#765352','#A8847C'],accent:'#86CBCB'}}});
const CAMEL_A=['  .-^^-.  _',' (      )/o',"  |\\  |\\"],CAMEL_B=['  .-^^-.  _',' (      )/o','  /|  /|'],
 SAG=['   .-.','   | |',' _ | | _','| || || |','\\__| |__/','   | |','   | |'],SAG_S=['  |','| | |',"`-|-'",'  |'],
 LIZ_A=['   ____o>',"~~'/  \\ "],LIZ_B=['   ____o>',"~~'\\  / "],SCORP=['  .-.','  v  )','<=ooo/'],
 CARIBOU_A=['\\Y/',' (o)___,','   |  |'],CARIBOU_B=['\\Y/',' (o)___,','   /  \\'],
 FOX_A=['      /\\',"~~(___'o>",'   /\\ /\\'],FOX_B=['      /\\',"~~(___'o>",'   || ||'],SOWL=['{O,O}','/)_)',' " "'],SOWL_B=['{-,-}','/)_)',' " "'],
 HORN=[' @',"(o\\____",'  |    |'],HORN_B=[' @',"(o\\____,",'  |    |'],COYOTE=['  /^',' / )','/__)~'];
// Sky extras live on an empty back layer so every terrain layer in front still hides them.
const sky=f=>withDyn(scatter({seed:1,rows:[0,-1],dens:0,speed:0}),f);
const onT=(l,w)=>l.T[((w%P)+P)%P];
const flatAt=(l,x)=>{while(onT(l,x)!==onT(l,x+8))x++;return x;};
// Middle of the highest plateau in each half of the world, so a landmark is on screen about half the time.
const tops=l=>[0,180].map(a=>{let b=a;for(let x=a;x<a+180;x++)if(l.T[x]<l.T[b])b=x;let e=b;while(onT(l,e+1)===l.T[b])e++;return (b+e)>>1;});
const milky=(g,cx)=>{const{C,t}=cx,tw=Math.floor(t*.8);for(let y=0;y<cx.b.hz;y++)for(let x=0;x<C;x++){if(g.ch[y*C+x]||!isN(cx,x,y))continue;
 const c=30-x*.17+Math.sin(x*.04)*2,d=Math.abs(y-c)/(5.5+Math.sin(x*.07)*1.5),rift=Math.abs(y-c-Math.sin(x*.11)*1.5)<.8,p=d<1?Math.sqrt(1-d)*(rift?.12:.75):.04;
 if(hh(x+.31,y*1.7)<p)gp(g,x,y,hh(x,y*7+tw)>.97?'+':hh(x,y+.5)>.9?'*':hh(x+.2,y)>.6&&d<.7?':':'.',d<.5&&!rift?8:d<1&&hh(x,y*3)>.4?3:2);}};
const aurora=(g,cx)=>{const{C,t}=cx,ph=Math.floor(t*4);for(let x=0;x<C;x++){const e=.5+Math.sin(x*.045+t*.21)*.3+Math.sin(x*.013-t*.11)*.35;if(e<.15||hh(x,ph)>.55+e*.4)continue;
 const bot=Math.round(15+3*Math.sin(x*.03+t*.17)+1.5*Math.sin(x*.12-t*.5)),len=Math.round(3+9*e);
 for(let j=0;j<=len;j++){const y=bot-j;if(y<0||g.ch[y*C+x]||!isN(cx,x,y)||hh(x,y)<j/len*.7)continue;gp(g,x,y,j<1?'|':j<len*.5?"|!"[(x+j)%2]:j<len*.8?':':"'",j<len*.6?5:2);}}};
const circle=(g,cx,x0,y0,r,ph,frames)=>{const{t}=cx,x=Math.round(x0+Math.cos(t*.22+ph)*r),y=Math.round(y0+Math.sin(t*.22+ph)*r*.25);if(!isN(cx,x,y))stamp(g,x-1,y,[frames[Math.floor(t*2+ph)%frames.length]],3);};
const desert={id:'desert',title:'Desert',act:'walk',ground:45,hz:31,birds:false,
 layers:()=>[sky(milky),
  withDyn(ridge({seed:18,bottom:57,chars:'=-_.:',dens:.55,streak:1,fade:.3,ci:1,speed:.1,k:[2,8],topFn:(x,n)=>31-9*clamp((n(x)-.05)*5)}),(g,cx)=>{const{C,t}=cx,s=Math.floor(t*1.5);
   for(let y=27;y<33;y++)for(let x=0;x<C;x++)if(!g.ch[y*C+x]&&!isN(cx,x,y)&&hh(x+s,y)<.05)gp(g,x,y,Math.sin(x*.5+t*4+y)>0?'~':'-',1);}),
  withDyn(ridge({seed:28,bottom:57,chars:'.,:;~=',dens:.5,fade:.4,ci:1,edgeCi:3,speed:.35,k:[2,5],fall:1.3,topFn:(x,n)=>{const f=6.2832*x/P*6;return 36.5-Math.sin(f+.7*Math.sin(f))*3-n(x)*2;}}),(g,cx,off,l)=>{
   for(let k=0;k<3;k++){const w=Math.floor(40+k*12+cx.t*.2);stamp(g,wx2sx(w,off),onT(l,w+5)-2,(Math.floor(cx.t*2)+k)%2?CAMEL_A:CAMEL_B,3,true);}
   [100,165,270,330].forEach(wx=>stamp(g,wx2sx(wx,off),onT(l,wx+2)-3,SAG_S,2,true));}),
  withDyn(ridge({seed:38,bottom:57,chars:'.,:;~=',dens:.55,fade:.5,ci:2,edgeCi:3,speed:1,k:[2,6],fall:1.3,topFn:(x,n)=>{const f=6.2832*x/P*4+1;return 41-Math.sin(f+.7*Math.sin(f))*3.5-n(x)*1.5;}}),(g,cx,off,l)=>{
   [30,95,150,215,290].forEach((wx,i)=>{const sx=wx2sx(wx,off);if(sx<-10||sx>cx.C)return;const y=onT(l,wx+4)-6;stamp(g,sx,y,SAG,3,true);if(i%2===0&&!isN(cx,sx+4,y-1))gp(g,sx+4,y-1,'*',5);});}),
  withDyn(ridge({seed:48,base:45,amp:.6,k:[1,3],bottom:57,chars:".,'`",dens:.07,ci:3,speed:3,flat:'_.-_~'}),(g,cx,off)=>{
   const k=cx.t/4,w=Math.floor(60+Math.floor(k)*7+Math.min(1,(k%1)*6)*7),sx=wx2sx(w,off);if(!isN(cx,sx,43))stamp(g,sx,43,(k%1)<.17&&Math.floor(cx.t*8)%2?LIZ_B:LIZ_A,4,true);
   const s=wx2sx(Math.floor(230-cx.t*.3),off);if(isN(cx,s+2,43))stamp(g,s,42,SCORP,5,true);}),
  scatter({seed:58,rows:[50,57],dens:.05,grad:1.4,chars:".,'`~",ci:4,speed:6,acc:{dens:.003,chars:'o',ci:3}})],
 post:(g,cx)=>{circle(g,cx,cx.C*.3,9,14,0,['-v-','-v-','\\v/']);circle(g,cx,cx.C*.34,11,9,2.5,['-v-','\\v/','-v-']);}};
const tundra={id:'tundra',title:'Tundra',act:'walk',ground:45,hz:32,birds:true,
 layers:()=>[sky(aurora),
  ridge({seed:19,base:25,amp:6,k:[1,7],fall:.9,bottom:57,chars:'^/\\:',dens:.4,streak:1,fade:.3,ci:0,speed:.1,snow:{rows:2,dens:.6,chars:"*.:'",ci:8}}),
  withDyn(ridge({seed:29,base:34,amp:3,k:[1,4],bottom:57,chars:'.:',dens:.14,ci:1,edgeCi:2,speed:.35}),(g,cx,off,l)=>{
   for(let k=0;k<4;k++){const w=Math.floor(120+k*9+(k%2)*3+cx.t*.15);stamp(g,wx2sx(w,off),onT(l,w+3)-2,(Math.floor(cx.t*2)+k)%2?CARIBOU_A:CARIBOU_B,3,true);}}),
  withDyn(pines({seed:39,base:40,amp:1,h:[4,9],gap:[5,18],slope:1.3,bottom:57,chars:'^#=',dens:.45,ci:2,speed:.9,snow:{rows:1,dens:.7,chars:'*.',ci:8}}),(g,cx,off,l)=>{
   l.apex.forEach((a,i)=>{if(i%4)return;const sx=wx2sx(a.x,off),y=a.y-3;if(sx<-5||sx>cx.C||!isN(cx,sx,y))return;stamp(g,sx-2,y,(cx.t+i)%7<.3?SOWL_B:SOWL,8,true);});}),
  withDyn(ridge({seed:49,bottom:57,topFn:(x,n)=>n(x)>-.1?41:50,chars:'-_.',dens:.3,ci:1,edgeCi:2,flat:'=',speed:1.6}),(g,cx,off,l)=>{const ph=Math.floor(cx.t*3);
   for(let i=0;i<14;i++){const x=Math.floor(hh(i,ph%5+40)*cx.C),y=42+Math.floor(hh(i,41)*3);if(onT(l,x+off)===41&&hh(i,ph)<.5)gp(g,x,y,hh(i,ph+1)>.5?'*':'+',isN(cx,x,y)?8:5);}}),
  withDyn(ridge({seed:59,base:45,amp:.5,k:[1,3],bottom:57,chars:".'*",dens:.06,ci:3,speed:3,flat:'_.-_'}),(g,cx,off)=>{const w=Math.floor(150+cx.t*1.2);stamp(g,wx2sx(w,off),42,Math.floor(cx.t*4)%2?FOX_A:FOX_B,3,true);}),
  scatter({seed:69,rows:[50,57],dens:.05,grad:1.5,chars:".'*,",ci:4,speed:6,acc:{dens:.004,chars:'*',ci:8}})],
 post:(g,cx)=>{const{t,C}=cx;for(let i=0;i<70;i++){const big=hh(i,4)>.7,y=Math.floor((hh(i,3)*ROWS+t*(1.2+hh(i,2)*1.5))%ROWS),x=Math.round(((hh(i,1)*C-t*.6+Math.sin(t*.8+i)*1.5)%C+C)%C);gp(g,x,y,big?'*':'.',isN(cx,x,y)?8:big?3:2);}}};
const canyon={id:'canyon',title:'Canyon river',act:'boat',ground:45,hz:30,birds:'bats',
 layers:()=>{
  const far=withDyn(ridge({seed:17,bottom:33,chars:'=_-.:',dens:.6,streak:1,fade:.2,ci:0,speed:.08,k:[2,8],topFn:(x,n)=>31-18*clamp((n(x)+.1)*4)}),(g,cx,off,l)=>{
   (l.cy=l.cy||tops(l)).forEach((w,i)=>{const sx=wx2sx(w,off),y=onT(l,w)-3;if(!isN(cx,sx+1,y+1))return;stamp(g,sx,y,COYOTE,3,true);
    if(Math.floor(cx.t/3+i)%3===0)[[-1,0],[-2,-1],[-3,0]].forEach(([dx,dy],k)=>{if((cx.t*2+k)%3<2)gp(g,sx+dx+1,y+dy,k%2?')':'(',2);});});});
  const mid=withDyn(ridge({seed:26,bottom:33,chars:'.-_:=',dens:.6,streak:1,fade:.2,ci:2,edgeCi:3,speed:.25,k:[3,9],reflect:{line:34,ci:0,chars:'~-=',dens:.55,maxD:20,seed:6},
   topFn:(x,n)=>33-4*Math.floor(clamp((n(x)+.35)*1.3)*4.99)}),(g,cx,off,l)=>{const{t,C}=cx;
   if(!l.wf){l.wf=tops(l);l.horn=l.wf.map(w=>flatAt(l,w+50));}
   l.wf.forEach(w=>{const sx=wx2sx(w,off),top=onT(l,w);if(sx<-6||sx>C+6)return;
    for(let y=top;y<34;y++)for(let d=-1;d<=1;d++){const k=((Math.floor(y-t*9+d*1.7)%4)+4)%4;gclr(g,sx+d,y);gp(g,sx+d,y,y===top?'~':'|!|:'[k],5);}
    const f=Math.floor(t*6);for(let k=0;k<12;k++){const x=sx+Math.round((hh(k,f)-.5)*9),y=32+Math.floor(hh(k+.5,f)*3);gp(g,x,y,'o.*~'[k%4],k%3?8:5);}});
   l.horn.forEach((w,i)=>stamp(g,wx2sx(w,off),onT(l,w)-2,Math.floor(t/4+i)%3===0?HORN_B:HORN,3,true));});
  return [far,mid,
   withDyn(scatter({seed:36,rows:[35,57],dens:.016,grad:3,chars:'~-.',ci:2,speed:1.1,acc:{dens:.005,chars:'~-',ci:5}}),(g,cx)=>{
    const s=cx.sun&&cx.sun.y<30?[cx.sun,6]:cx.moon&&cx.moon.y<30?[cx.moon,7]:null;if(!s)return;const X=s[0].x,tt=Math.floor(cx.t*2);for(let y=35;y<48;y++){const w=1.5+(y-35)*.4;for(let x=Math.round(X-w);x<=Math.round(X+w);x++)if(hh(x,y+tt)<.35)gp(g,x,y,hh(x,y)<.5?'-':'=',s[1]);}}),
   scatter({seed:46,rows:[48,57],dens:.05,grad:1,chars:'_~-',ci:3,speed:3}),
   ridge({seed:56,base:55.5,amp:2.5,k:[2,7],bottom:57,chars:'.-_=o',dens:.45,streak:1,ci:3,edgeCi:4,speed:3.5})];},
 post:(g,cx)=>circle(g,cx,cx.C*.55,10,12,1,['\\v/','-v-','-v-'])};
const MORE=[desert,tundra,canyon];E.BIOMES.push(...MORE);MORE.forEach(b=>E.BM[b.id]=b);
Object.assign(E.PROP_W,{desert:{head:{straw:4,headphones:1,none:1},hand:{map:3,flower:1,none:2}},
 tundra:{head:{beanie:5,headphones:1,none:1},hand:{mug:3,map:1,none:1}},
 canyon:{head:{straw:3,beanie:1,none:2},back:{backpack:3,none:1}}});
E.ORDER.push('tundra','desert','canyon');
})();
