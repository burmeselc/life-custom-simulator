/* Isolated-life simulation engine, custom edition v0.5.0.
   Fictional environmental scenarios; no claims about actual Sentinelese lifeways.
   Does not use modern national school, career, finance, politics or travel systems. */
(()=>{
'use strict';
const active=()=>{try{return !!(S&&S.flags&&S.flags.isolatedScenario)}catch{return false}};
const clampI=(x,a,b)=>Math.max(a,Math.min(b,x));
const pickI=a=>a[Math.floor(Math.random()*a.length)];
const environments={
 sentinel:{label:'北センチネル島', terrain:'島', basics:[
  ['海辺を歩いて潮の満ち引きを確かめた。',{sm:1,hl:1}],
  ['浅瀬で魚を探し、一日の食べ物を得た。',{hl:1}],
  ['雨風の強い日には、身を寄せて天候が静まるのを待った。',{h:-1,sm:1}],
  ['浜辺で貝や漂着した木を見つけた。',{sm:1}],
  ['木陰で休み、近しい人々と過ごした。',{h:2,so:1}],
  ['海が荒れたため、漁を控えた。',{h:-1,hl:-1}],
  ['集めた食べ物を分け合った。',{h:2,so:2}],
  ['島の林で食べられるものを探した。',{hl:1,sm:1}]
 ]},
 png:{label:'ニューギニア内陸部の集落（1950年代の仮想設定）',terrain:'山と森',basics:[
  ['森の中で食べ物を集めた。',{hl:1,sm:1}],
  ['集落の人々と食べ物を分けた。',{h:2,so:2}],
  ['雨が続き、作業を休んで過ごした。',{h:-1,sm:1}],
  ['畑の手入れを手伝った。',{hl:2,so:1}],
  ['川の水位が高くなり、道を選び直した。',{sm:1}],
  ['道具を直し、長く使へるやうにした。',{sm:2}],
  ['近しい人から植物や地形について教はった。',{sm:2,so:1}],
  ['森のなかを歩き、季節の移り変りを確かめた。',{h:1,hl:1}]
 ]}
};
const milestones=[
 [0,'この土地で新たな命が生まれた。'],[3,'周囲の人々と日々を過ごし、身近な世界を覚えてゆく。'],
 [6,'年長者のすることを見て、手を動かしながら覚え始めた。'],
 [12,'食べ物を得る仕事や暮らしの道具について、さらに多くを学んだ。'],
 [18,'ひとりの大人として、共同体での役割を増やしてゆく。'],
 [35,'若い人々に、これまで暮らしのなかで得た知恵を伝へた。'],
 [60,'長いあひだに見てきた土地と季節の変化を振り返った。']
];
let originalPlan,originalEnd,originalFire,initialized=false;
function env(){return environments[S.flags.isolatedScenario==='png_remote_1950'?'png':'sentinel']}
function safeLog(t,k='ev'){try{log(t,k)}catch(e){console.error('isolated event',e)}}
function applyEffects(e){const st=S.st;if(!st)return;for(const [k,v] of Object.entries(e||{})){if(k in st)st[k]=clampI((st[k]||0)+v,1,100)}}
function planIsolated(){
 S.queue=[];S.fT={};S.focusW={};
 S.fl={nw0:0,it:{}};
 S.school=null;S.schoolY=0;S.job='none';S.income=0;S.money=0;S.house=0;S.debt=0;S.pct=0;
 S.flags.isolatedYears=(S.flags.isolatedYears||0)+1;
 const n=S.age<6?2:3;
 for(let i=0;i<n;i++)S.queue.push({at:0.12+(i+Math.random()*0.7)*0.75/n,type:'isolated',id:i,p:{}});
 S.queue.sort((a,b)=>a.at-b.at);
}
function fireIsolated(ev){
 const e=env(),x=pickI(e.basics);safeLog(x[0]);applyEffects(x[1]);
 if(S.age>20&&Math.random()<0.07){safeLog('幼い者に道具の扱ひや土地の様子を教へた。','warm');applyEffects({so:1,h:1});}
}
function yearIsolated(){
 if(S.phase!=='life')return;
 const st=S.st,age=S.age,e=env();
 if(!S.flags.isolatedMilestones)S.flags.isolatedMilestones={};
 for(const [a,t] of milestones)if(age>=a&&!S.flags.isolatedMilestones[a]){S.flags.isolatedMilestones[a]=1;safeLog(t,'ms')}
 // Natural health and age changes; without modern income, taxes, education or state institutions.
 const physical=age<12?0.3:age<45?0.1:age<65?-0.5:-1.1;
 st.hl=clampI((st.hl||65)+physical+(Math.random()-.5)*2,1,100);
 st.h=clampI((st.h||55)+(Math.random()-.5)*2,1,100);
 st.so=clampI((st.so||55)+(Math.random()-.5)*2,1,100);
 // Sustain family ages without invoking urban-career or institutional events.
 if(S.fam){for(const k of ['mom','dad']){const p=S.fam[k];if(p&&p.alive){p.age+=1;if(p.age>85&&Math.random()<(p.age-85)*0.012){p.alive=false;safeLog('家族のひとりを見送った。','loss')}}}
 for(const k of S.fam.kids||[])if(k.alive&&k.bornAt!=null&&age-k.bornAt>95&&Math.random()<0.03)k.alive=false;
 }
 S.years.push({a:age,h:Math.round(st.h),hl:Math.round(st.hl),so:Math.round(st.so),sm:Math.round(st.sm),nw:0,inc:0,cur:S.born});
 if(S.years.length>180)S.years.shift();
 // No calls to original "endYear" (finances, school, legal, politics, travel).
 if(age>=120||Math.random()< (age<5?0.012:age<45?0.004:age<65?0.01:Math.min(0.35,0.01+(age-65)*0.005))*(st.hl<30?2.5:1)){
  try{die('ocd')}catch(err){console.error(err);S.phase='end'}
  return;
 }
 S.age+=1;S.t=0;
 planIsolated();
 try{HOOK.year()}catch(err){console.error('isolated annual render',err)}
}
function install(){
 if(initialized)return;
 try{
 if(typeof planYear!=='function'||typeof endYear!=='function'||typeof fire!=='function')return;
 originalPlan=planYear;originalEnd=endYear;originalFire=fire;
 planYear=function(...args){if(active())return planIsolated();return originalPlan(...args)};
 endYear=function(...args){if(active())return yearIsolated();return originalEnd(...args)};
 fire=function(ev){if(active()){if(ev&&ev.type==='isolated')return fireIsolated(ev);return;}return originalFire(ev)};
 initialized=true;
 console.info('Isolated engine v0.5.0 installed');
 // A birth may have already been generated before initialization.
 if(active()&&S.phase!=='end')planIsolated();
 }catch(e){console.error('isolated engine installation',e)}
}
install();
window.addEventListener('load',install);
})();
