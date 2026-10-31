(function(){
const E=window.WE,{ridge,pines,scatter,houses,withDyn,stamp,gp,isN,wx2sx,hh,P,ROWS}=E;
E.PAL={
 forest:{day:{bg:'#EEE9DD',ink:['#DAD3C3','#C3BAA7','#A0977F','#736B5C','#48433B'],accent:'#7F8F5E'},night:{bg:'#131719',ink:['#212829','#2E3838','#445250','#65746F','#909D97'],accent:'#B5C27A'}},
 hills:{day:{bg:'#F0EADB',ink:['#DED4BF','#C7BBA0','#A4977B','#786D57','#4B4437'],accent:'#C27C86'},night:{bg:'#17151B',ink:['#25212B','#342F3C','#4B4555','#6B6476','#948C9F'],accent:'#B48997'}},
 town:{day:{bg:'#EFE8DA',ink:['#DCD2BF','#C4B79E','#A08F75','#74634F','#4A3E33'],accent:'#B8664E'},night:{bg:'#15141A',ink:['#24222B','#33303B','#4A4553','#6A6474','#958EA0'],accent:'#E6B36A'}},
 lake:{day:{bg:'#ECEAE2',ink:['#D6D5CC','#BBBAB0','#96968C','#6C6D66','#40423F'],accent:'#6F8FA0'},night:{bg:'#11151B',ink:['#1D2430','#29323F','#3D4959','#5C697A','#8995A5'],accent:'#A7BBCF'}},
 sea:{day:{bg:'#E2E9E5',ink:['#CBD8D3','#AFC2BB','#8BA49C','#62807A','#3C5853'],accent:'#D58C74'},night:{bg:'#0A1419',ink:['#132329','#1B323A','#294852','#3F6873','#6E9AA3'],accent:'#7FD6C4'}},
 peaks:{day:{bg:'#F1EDE2',ink:['#DDD7C9','#C5BDAB','#A29988','#766E61','#48433C'],accent:'#D2A962'},night:{bg:'#0F1220',ink:['#1B2033','#262E46','#384260','#556183','#8390B3'],accent:'#E6DAB0'}}};
const OWL=['{o,o}','/)_)',' " "'],OWL_B=['{-,-}','/)_)',' " "'],RABBIT=['(\\(\\','( -.-)','o_(")(")'],DUCK=['  _',"_(')>",'\\___)'],
 SHEEP=[' ,@@@,','@@@@@@o',' "  " '],MILL_A=['\\   /',' \\ / ','  o  ',' / \\ ','/   \\'],MILL_B=['  |  ','  |  ','--o--','  |  ','  |  '],
 CAT=[' /\\_/\\','( o.o )',' > ^ <'],CAT_B=[' /\\_/\\','( -.- )',' > ^ <~'],LAMP=[' _ ','(o)',' | ',' | ',' | ','_|_'],
 CRAB_A=['(\\/)(o,,o)(\\/)'],CRAB_B=['(/\\)(o,,o)(/\\)'],JELLY_A=[' .-. ','(   )',' )() ','  )( '],JELLY_B=[' .-. ','(   )',' ()( ',' ( ) '],KITE=['/\\','\\/'];
const FG=s=>scatter({seed:s,rows:[49,57],dens:.035,grad:1.6,chars:"',./\\=",ci:4,speed:7,acc:{dens:.003,chars:'*',ci:5}});
const FISH=[{y:12,vx:-2.2,s:'<><',ci:3},{y:19,vx:1.1,s:'><>',ci:3},{y:26,vx:-3.4,s:"<')))><",ci:2},{y:41,vx:-1.6,s:'<><',ci:4},{y:9,vx:-2.8,school:1,ci:2},{y:33,vx:.8,s:"><(((('>",ci:2}];
const SCHOOL=[[0,0],[3,-1],[3,1],[6,0],[6,-2],[6,2],[9,-1],[9,1]];
E.BIOMES=[
 {id:'forest',title:'Forest',act:'walk',ground:45,hz:32,birds:true,song:['Under the Pines','Lowfield','38%','1:42'],
  blurb:'Two ranks of pines in front of a long streaked ridge. Owls wake at night, rabbits hop the path, fireflies drift low.',
  layers:()=>[ridge({seed:11,base:21,amp:6,k:[1,6],bottom:57,chars:'^/\\.:',dens:.42,fade:.5,streak:1,ci:0,speed:.25}),
   pines({seed:21,base:31,amp:3,h:[5,10],gap:[3,7],slope:1.6,bottom:57,chars:'X#=/\\^',dens:.5,ci:1,speed:.7}),
   withDyn(pines({seed:31,base:40,amp:2,h:[10,17],gap:[6,12],slope:1.5,bottom:57,chars:'#X%=',dens:.66,ci:2,speed:1.4}),(g,cx,off,l)=>{l.apex.forEach((a,i)=>{if(i%5)return;const sx=wx2sx(a.x,off),y=a.y+4;if(sx<-5||sx>cx.C||!isN(cx,sx,y))return;stamp(g,sx-2,y,(cx.t+i)%6<.25?OWL_B:OWL,4,true);});}),
   withDyn(ridge({seed:41,base:45,amp:.6,k:[1,3],bottom:57,chars:".,'`",dens:.07,ci:3,speed:3.5,flat:'_.-_'}),(g,cx,off)=>{[50,230].forEach((wx,i)=>{const sx=wx2sx(Math.floor(wx+cx.t),off),hop=Math.floor(cx.t*2.5+i)%3===0?1:0;stamp(g,sx,42-hop,RABBIT,3,true);});}),
   withDyn(FG(51),(g,cx)=>{for(let i=0;i<16;i++){const x=Math.round(((hh(i,31)*cx.C+Math.sin(cx.t*.4+i)*8)%cx.C+cx.C)%cx.C),y=34+Math.floor(hh(i,32)*14)+Math.round(Math.sin(cx.t*.7+i*2));if(isN(cx,x,y)&&Math.sin(cx.t*2.2+i*3)>.2)gp(g,x,y,hh(i,33)>.7?'*':'.',5);}})],
  table:[['Sky kit','clouds · sun · moon · stars · birds','kit',0,32,'see 03','screen'],['Far ridge','^ / \\ . :',0,15,30,'42% streaked, fades 50%',.25],['Mid pines','X # = / \\ ^',1,21,40,'50% · trees 5–10 rows',.7],
   ['Near pines + owls','# X % =   {o,o}',2,23,45,'66% · trees 10–17 rows · owls on every 5th tree at night',1.4],['Ground + rabbits',"_ . - , '   (\\(\\",3,42,57,'edge 100%, fill 7% · rabbits hop +1 col/s',3.5,1],['Foreground + fireflies',"' , . / \\ =   * .",4,34,57,'3.5% → 9% · 16 fireflies at night (accent)',7]],
  beasts:[['Owl',OWL,'night · blinks every 6s'],['Rabbit',RABBIT,'hops 1 row every 3rd beat'],['Birds',['v  -','  v','v  -'],'day · flap 4 fps'],['Fireflies',['.   *','  .'],'night · accent']]},
 {id:'hills',title:'Rolling hills',act:'bike',ground:47,hz:30,birds:true,song:['Fence Posts','The Quiet Year','24%','0:58'],
  blurb:'Soft hills with a road winding over them, two windmills, grazing sheep, a fence line and a kite.',
  layers:()=>[ridge({seed:13,base:24,amp:4,k:[1,4],bottom:57,chars:'.:-',dens:.22,fade:.4,ci:0,speed:.25}),
   withDyn(ridge({seed:23,base:33,amp:4,k:[1,5],bottom:57,chars:'.:;',dens:.2,ci:1,edgeCi:2,speed:.6,path:{ci:2,amp:3},clumps:{count:18,ci:2}}),(g,cx,off,l)=>{
    [90,262].forEach(wx=>{const sx=wx2sx(wx,off),T=l.T[wx],hub=T-7;for(let y=hub+1;y<T;y++)gp(g,sx,y,'|',2);gp(g,sx-1,T-1,'/',2);gp(g,sx+1,T-1,'\\',2);stamp(g,sx-2,hub-2,Math.floor(cx.t*2.5)%2?MILL_A:MILL_B,3,false);});
    [40,49,170,300].forEach((wx,i)=>{const w=Math.floor(wx+Math.sin(cx.t*.1+i)*2),sx=wx2sx(w,off);stamp(g,sx,l.T[((w%P)+P)%P]+1,SHEEP,3,true);});}),
   ridge({seed:33,base:42,amp:.6,k:[1,3],bottom:57,chars:'.,`',dens:.05,ci:2,speed:2.2,flat:'_-',edgeCi:3,fence:{gap:7,ci:3,flower:.06}}),
   ridge({seed:43,base:47,amp:0,k:[1,2],bottom:57,chars:'.',dens:.03,ci:3,speed:4,flat:'=',road:1}),
   scatter({seed:53,rows:[52,57],dens:.06,grad:1,chars:",'/\\\"",ci:4,speed:6.5,acc:{dens:.012,chars:'*o@',ci:5}})],
  post:(g,cx)=>{const x=Math.round(cx.C*.56+Math.sin(cx.t*.3)*3),y=Math.round(11+Math.sin(cx.t*.5)*1.5);if(isN(cx,x,y))return;stamp(g,x,y,KITE,5,true);for(let k=1;k<=4;k++)gp(g,x+(k%2),y+1+k,k%2?'~':'`',2);},
  table:[['Sky kit + kite','kit   /\\ \\/ ~','kit',0,30,'kite in accent, day only','screen'],['Far hills','. : -',0,20,30,'22%, fades 40%',.25],['Mid hills','. : ; = oO@|',1,23,42,'20% · road winds 3×/period · windmills 2.5 fps · 4 sheep',.6],
   ['Fence & field','+ - |   * o',3,39,46,'post every 7 cols · flowers 6%',2.2],['Road','= -   .',3,47,51,'edge 100%, lower edge 66%',4,1],['Foreground',", ' / \\ \"   * o @",4,52,57,'6% → 12% · flowers 1.2%',6.5]],
  beasts:[['Windmill',MILL_A,'2 frames, 2.5 fps'],['Sheep',SHEEP,'graze ±2 cols'],['Kite',['/\\','\\/',' ~','  `',' ~'],'day · accent']]},
 {id:'town',title:'Town',act:'walk',ground:45,hz:30,birds:'bats',song:['Lamplight','Harbour Kids','52%','2:11'],
  blurb:'A far skyline with steeples, then a street of gabled houses. Windows warm up at night, chimneys smoke, lamps glow, cats sit on roofs.',
  layers:()=>{const near=houses({seed:45,ground:45,h:[6,10],w:[12,20],gap:[3,10],detail:true,tex:.05,roofDens:.6,ci:3,fillCi:2,roofCi:2,speed:2});
   near.extra=(g,cx,off,l)=>{[2,7,13].forEach(i=>{const a=l.apex[i];if(!a)return;stamp(g,wx2sx(a.x,off)-3,a.y-3,(cx.t+i)%4<.4?CAT_B:CAT,4,true);});};
   return [ridge({seed:15,base:22,amp:5,k:[1,5],bottom:57,chars:'^/\\.:',dens:.3,fade:.4,streak:1,ci:0,speed:.2}),
   houses({seed:25,ground:34,h:[3,6],w:[6,10],gap:[1,4],detail:false,tex:0,roofDens:.9,ci:1,fillCi:1,roofCi:1,tower:.12,speed:.5}),
   ridge({seed:35,base:34,amp:0,k:[1,2],bottom:57,chars:'.',dens:.04,ci:1,speed:.5,flat:'_'}),near,
   withDyn(ridge({seed:55,base:45,amp:0,k:[1,2],bottom:57,chars:'.:',dens:.08,ci:3,speed:2,flat:'_'}),(g,cx,off)=>{for(let k=0;k<8;k++){const sx=wx2sx(20+k*45,off);if(sx<-4||sx>cx.C+4)continue;stamp(g,sx-1,39,LAMP,3,true);
    if(isN(cx,sx,40)){gp(g,sx,40,'o',5);[[-3,40],[3,40],[-2,39],[2,39],[-2,41],[2,41]].forEach(([dx,y])=>{const x=sx+dx;if(x>=0&&x<cx.C&&!g.ch[y*cx.C+x])gp(g,x,y,'.',5);});for(let x=sx-4;x<=sx+4;x++){if(x>=0&&x<cx.C&&g.ch[45*cx.C+x])g.co[45*cx.C+x]=5;}}}}),
   scatter({seed:65,rows:[50,57],dens:.05,grad:1,chars:".:',",ci:4,speed:5,acc:{dens:.004,chars:'*',ci:5}})];},
  table:[['Sky kit + bats','kit   v ^','kit',0,30,'birds by day, bats by night','screen'],['Far hills','^ / \\ . :',0,16,33,'30% streaked',.2],['Far town','/ \\ = | .',1,24,34,'houses 6–10 wide, 12% steeples · windows "." lit at night',.5],
   ['Near houses + cats','/ \\ = - | [ ] _',3,26,44,'windows every 5×3 · 65% lit at night (accent) · chimney smoke',2],['Street + lamps',"_ . :   (o) |",3,39,48,'lamp every 45 cols, glow + light pool at night',2,1],['Foreground',". : ' ,   *",4,50,57,'5% → 10%',5]],
  beasts:[['Cat',CAT,'on roof peaks · blinks, tail flicks'],['Street lamp',LAMP,'lit at night'],['Chimney smoke',['  .',' )','(',' o'],'6 puffs, rise 8 rows'],['Bats',['^v^  -v-'],'night only']]},
 {id:'lake',title:'Lake',act:'boat',ground:45,hz:30,birds:true,song:['Still Water, Slow Oars','Mara Ellis','61%','2:37'],
  blurb:'Mountains and a treeline mirrored as broken ~ - = strokes. The sun or moon lays a glittering column on the water; ducks drift, a fish jumps.',
  layers:()=>[withDyn(ridge({seed:12,base:18,amp:8,k:[1,7],fall:.9,bottom:30,chars:'^/\\',dens:.48,streak:1,fade:.3,ci:1,speed:.2,reflect:{line:31,ci:0,chars:'~-=',dens:.5,maxD:24,seed:3}}),(g,cx)=>{
    const s=cx.sun&&cx.sun.y<30?[cx.sun,6]:cx.moon&&cx.moon.y<30?[cx.moon,7]:null;if(!s)return;const X=s[0].x,tt=Math.floor(cx.t*2);for(let y=31;y<47;y++){const w=2+(y-31)*.45;for(let x=Math.round(X-w);x<=Math.round(X+w);x++)if(hh(x,y+tt)<.4)gp(g,x,y,hh(x,y)<.5?'-':'=',s[1]);}}),
   pines({seed:22,base:30,amp:0,h:[2,5],gap:[2,4],slope:1.2,bottom:30,chars:'x#=',dens:.75,ci:2,speed:.5,reflect:{line:31,ci:1,chars:'=~-',dens:.65,maxD:8,seed:4}}),
   withDyn(scatter({seed:32,rows:[32,57],dens:.012,grad:3,chars:'~-.',ci:2,speed:1.1,acc:{dens:.0015,chars:'-',ci:5}}),(g,cx,off)=>{[70,78,215].forEach(wx=>stamp(g,wx2sx(Math.floor(wx-cx.t*.4),off),32+(wx%3),DUCK,3,true));}),
   withDyn(scatter({seed:42,rows:[48,57],dens:.05,grad:1,chars:'_~-',ci:3,speed:3}),(g,cx)=>{const c=cx.t%11;if(c>1.3)return;const q=c/1.3,x0=Math.round(cx.C*.62);stamp(g,x0+Math.round(q*10),Math.round(44-Math.sin(Math.PI*q)*6),['><>'],4,true);if(q<.2||q>.8)stamp(g,x0+(q<.5?-1:9),45,['.o.'],3);})],
  table:[['Sky kit + glitter','kit   - = on water','kit',0,46,'glitter column under sun / moon, 40%','screen'],['Far mountains','^ / \\',1,10,30,'48% streaked',.2],['Mirror','~ - =',0,31,54,'50% → 0% over 24 rows',.2],
   ['Treeline','x # = ^',2,25,30,'75% · trees 2–5 rows · own mirror rows 31–38',.5],['Water + ducks',"~ - .   _(')>",2,31,57,'1.2% → 5% · 3 ducks drift −0.4 col/s',1.1],['Near ripples + fish','_ ~ -   ><>',3,48,57,'5% → 10% · fish jumps every 11s',3,1]],
  beasts:[['Duck',DUCK,'drifts upstream'],['Jumping fish',['   ><>','  .o.'],'every 11s'],['Sun glitter',['  -=-','  - = -',' -  =  -'],'follows sun / moon']]},
 {id:'sea',title:'Under the sea',act:'swim',ground:36,sea:true,song:['Pressure & Light','Coral Static','17%','0:44'],
  blurb:'Wick dives from the lake. A wavy surface, slanted light rays, a reef, swaying kelp, fish schools, jellyfish that glow at night and a scuttling crab.',
  layers:()=>[ridge({seed:17,base:38,amp:6,k:[1,5],bottom:57,chars:'.:',dens:.25,fade:.3,ci:0,speed:.2}),
   withDyn(ridge({seed:27,base:47,amp:2,k:[1,4],bottom:57,chars:'.,:',dens:.12,ci:1,edgeCi:2,speed:.7,coral:16,kelp:1}),(g,cx,off,l)=>{l.kelp.forEach(k=>{const sx=wx2sx(k.x,off);if(sx<-3||sx>cx.C+3)return;const base=l.T[k.x]-1;for(let j=0;j<k.h;j++)gp(g,sx+Math.round(Math.sin(j*.35-cx.t*1.2+k.x)*1.3*(j/k.h)),base-j,(j+Math.floor(cx.t*2))%2?'(':')',2);});}),
   withDyn(ridge({seed:37,base:52,amp:1,k:[1,3],bottom:57,chars:".,'`",dens:.08,ci:3,speed:2.5,flat:'_._'}),(g,cx,off)=>{[60,240].forEach(wx=>stamp(g,wx2sx(Math.floor(wx-cx.t*.6),off),51,Math.floor(cx.t*3)%2?CRAB_A:CRAB_B,4,true));}),
   scatter({seed:47,rows:[53,57],dens:.08,chars:'|)(/\\',ci:4,speed:4,acc:{dens:.01,chars:'@',ci:5}})],
  post:(g,cx)=>{const{t,C}=cx,span=C+40;
   FISH.forEach((f,i)=>{const x=Math.round(((hh(i,40)*span+f.vx*t)%span+span)%span)-20,y=f.y+Math.round(Math.sin(t*1.3+i)*.6);if(f.school)SCHOOL.forEach(([dx,dy])=>gp(g,x+dx,y+dy,'<',f.ci));else stamp(g,x,y,[f.s],f.ci,true);});
   [0,1].forEach(i=>{const x=Math.round(((C*(.78-i*.45)-t*.3)%span+span)%span)-20,y=Math.round(14+i*9+Math.sin(t*.6+i)*2);stamp(g,x,y,Math.floor(t*1.5+i)%2?JELLY_A:JELLY_B,isN(cx,x+2,y+1)?5:3,true);});
   for(let k=0;k<6;k++){const a=(t*.5+k/6)%1;gp(g,Math.round(cx.pip.bx+Math.sin(a*6+k)*1.2),Math.round(cx.pip.by-a*16),a<.3?'.':a<.7?'o':'O',2);}},
  table:[['Surface + light rays','~ . -   \\','kit',0,36,'wavy surface row 2 · 7 slanted rays sway','screen'],['Far reef','. : ^ / \\',0,30,57,'25%, fades 30%',.2],['Kelp & coral','( )   @ % & *',2,30,48,'kelp every 7–12 cols, 6–16 rows tall, sways · coral partly accent',.7],
   ['Seabed + crabs',"_ . , ' `",3,51,57,'edge 100%, fill 8% · crabs scuttle −0.6 col/s',2.5,1],['Fish & jellies',"<>< ><> <')))><",3,6,46,'5 fish + a school of 8 · 2 jellies glow accent at night · Wick bubbles','own'],['Foreground','| ) ( / \\   @',4,53,57,'8% · shells 1%',4]],
  beasts:[['Crab',CRAB_A,'scuttles sideways'],['Jellyfish',JELLY_A,'bobs ±2 rows · glows at night'],['Fish',['<><   ><>',"<')))><"],'own speeds −3.4…+1.1'],['School',['   < <','< <   <','   < <'],'8 fish in formation']]},
 {id:'peaks',title:'Mountain dome',act:'walk',ground:45,hz:34,birds:true,song:['Small Hours','Juniper Vale','72%','3:05'],
  blurb:'One huge snow-capped dome passes every ~50 minutes. An eagle circles by day; a meteor crosses the night sky every 17 seconds.',
  layers:()=>[ridge({seed:16,base:30,amp:4,k:[1,4],bottom:57,chars:'^/\\:',dens:.35,streak:1,ci:0,speed:.06}),
   ridge({seed:14,bottom:57,chars:'/\\^=',dens:.55,streak:1,fade:.25,ci:1,edgeCi:2,speed:.12,snow:{rows:3,dens:.7,chars:"*.:'",ci:8},topFn:(x,n)=>{let d=Math.abs(x-110);d=Math.min(d,P-d);return Math.min(41,Math.round(12+30*(d/100)**2-n(x)*1.2));}}),
   pines({seed:24,base:39,amp:2,h:[3,7],gap:[2,6],slope:1.5,bottom:57,chars:'X#=o',dens:.6,ci:2,speed:.6}),
   ridge({seed:34,base:45,amp:.6,k:[1,3],bottom:57,chars:".,'`",dens:.07,ci:3,speed:3,flat:'_.-_'}),FG(54)],
  post:(g,cx)=>{const{t,C}=cx,ex=Math.round(C*.68+Math.cos(t*.25)*12),ey=Math.round(12+Math.sin(t*.25)*3);if(!isN(cx,ex,ey))gp(g,ex,ey,Math.floor(t*3)%2?'v':'^',3);
   const c=t%17;if(c<1.4){const k=Math.floor(t/17),x=Math.round(C*.15+hh(k,1)*C*.5+c*24),y=Math.round(3+c*5);if(isN(cx,x,y)){gp(g,x,y,'*',8);for(let j=1;j<7;j++)gp(g,x-j*3,Math.round(y-j*.6),j<3?'-':'.',8);}}},
  table:[['Sky kit + meteor','kit   * - .','kit',0,34,'eagle by day · meteor every 17s at night','screen'],['Far range','^ / \\ :',0,22,34,'35% streaked',.06],['Dome','/ \\ ^ =   * . : snow',1,12,41,'55% streaked · top 3 rows snow in highlight',.12],
   ['Pines','X # = o',2,32,45,'60% · trees 3–7 rows',.6],['Ground',"_ . - , ' `",3,45,57,'edge 100%, fill 7%',3,1],['Foreground',"' , . / \\ =",4,49,57,'3.5% → 9%',7]],
  beasts:[['Eagle',['  v'],'circles r=12 cols'],['Meteor',['.  .  - - *'],'every 17s at night'],['Snow cap',["*.:'*.:*"],'top 3 rows of dome']]}];
E.BM={};E.BIOMES.forEach(b=>E.BM[b.id]=b);
E.PROP_W={forest:{head:{beanie:3,leaf:3,none:2},hand:{flower:2,map:2,none:1},back:{backpack:2,none:2}},
 hills:{head:{straw:4,leaf:2,none:1},hand:{flower:3,map:2},back:{backpack:3,none:1}},
 town:{head:{beanie:2,headphones:3,none:1},hand:{mug:4,map:1,none:1},back:{backpack:1,none:3}},
 lake:{head:{straw:3,headphones:2,none:2},back:{backpack:1,none:3}},sea:{},
 peaks:{head:{beanie:4,wizard:2,none:1},hand:{map:3,none:1},back:{backpack:3,none:1}}};
E.SLOTS={walk:['head','hand'],boat:['head','back'],bike:['head','back'],swim:[]};
E.pickProps=function(id,act,seed,night){const w=E.PROP_W[id]||{},r=E.rng(seed*7919+id.charCodeAt(0)*131+id.length);return (E.SLOTS[act]||[]).map(sl=>{const o=Object.assign({},w[sl]||{});if(sl==='hand'&&night){o.lantern=6;delete o.flower;}const ent=Object.entries(o),tot=ent.reduce((s,e)=>s+e[1],0);if(!tot)return null;let x=r()*tot;for(const[k,v]of ent)if((x-=v)<0)return k==='none'?null:k;return null;}).filter(Boolean);};
E.propNames=l=>l.length?l.map(k=>E.PROPS[k].name).join(' + '):'nothing';
E.ORDER=['forest','hills','town','lake','sea','peaks'];
E.ACT={walk:'Wick walks',boat:'Wick paddles',bike:'Wick cycles',swim:'Wick swims'};
})();
