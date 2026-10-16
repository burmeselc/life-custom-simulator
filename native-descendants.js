/* Integrate aggregate descendants with the original game's result, story and share-card pipeline. */
(()=>{
'use strict';
const N=['子','孫','曾孫','玄孫','来孫'];
const state=()=>{try{return typeof S!=='undefined'?S:null}catch{return null}};
function totals(s){
 const d=s?.flags?.aggregateDescendants;if(!d)return null;
 const g=[0,0,0,0,0];
 for(const [key,value] of Object.entries(d.cohorts||{})){
  const generation=Number(key.split(':')[0]),n=Number(value);
  if(Number.isInteger(generation)&&generation>=0&&generation<5&&Number.isFinite(n)&&n>0)g[generation]+=n;
 }
 return {g,live:g.reduce((a,b)=>a+b,0),births:Math.max(0,d.totalBirths||0),deaths:Math.max(0,d.totalDeaths||0),individual:(s.fam?.kids||[]).filter(k=>!k.cut).length};
}
function description(t){return N.map((name,i)=>name+' '+t.g[i].toLocaleString('ja-JP')+'人').join('・');}
function insertResult(){
 const t=totals(state()),host=document.querySelector('#dead .dcert .body');
 if(!t||!host||document.getElementById('native-descendants'))return;
 const section=document.createElement('div');section.id='native-descendants';
 section.style.cssText='border-top:1px solid var(--rule,#ccc);padding:14px 0;margin-top:14px';
 const title=document.createElement('strong');title.textContent='家族と子孫';title.style.cssText='display:block;margin-bottom:7px;font-size:17px';
 const p=document.createElement('p');p.textContent='子供 '+(t.individual+t.g[0]).toLocaleString()+'人（個別 '+t.individual.toLocaleString()+'人・集団 '+t.g[0].toLocaleString()+'人）';
 const generations=document.createElement('p');generations.textContent=description(t);
 const events=document.createElement('p');events.textContent='集団管理の累計出生 '+t.births.toLocaleString()+'人・死亡 '+t.deaths.toLocaleString()+'人';
 events.style.cssText='font-size:12px;color:var(--ink2,#555)';
 section.append(title,p,generations,events);host.append(section);
}
function integrate(){
 try{
  if(typeof summaryOf==='function'){
   const base=summaryOf;
   summaryOf=function(st){const v=base(st),t=totals(st);if(t){v.kids+=t.g[0];v.gk=(v.gk||0)+t.g[1];v.ggk=(v.ggk||0)+t.g[2];v.customDescendants=t.g.slice();}return v;};
  }
  if(typeof showDeath==='function'){
   const base=showDeath;showDeath=function(...args){const out=base(...args);try{insertResult()}catch(e){console.warn('family results',e)}return out;};
  }
  if(typeof drawDeathCard==='function'){
   const base=drawDeathCard;
   drawDeathCard=function(ctx,...args){
    const result=base(ctx,...args),t=totals(state());if(!t)return result;
    ctx.save();
    const W=ctx.canvas.width,H=ctx.canvas.height,band=142,y=H-band-12;
    ctx.fillStyle='rgba(247,250,248,0.97)';ctx.fillRect(32,y,W-64,band);
    ctx.strokeStyle='#0F6E68';ctx.lineWidth=3;ctx.strokeRect(32,y,W-64,band);
    ctx.fillStyle='#13212A';ctx.textAlign='left';ctx.textBaseline='alphabetic';
    ctx.font='bold 26px sans-serif';ctx.fillText('家族・子孫の記録',54,y+35);
    ctx.font='22px sans-serif';ctx.fillText('子 '+(t.individual+t.g[0]).toLocaleString()+'　孫 '+t.g[1].toLocaleString()+'　曾孫 '+t.g[2].toLocaleString(),54,y+73);
    ctx.fillText('玄孫 '+t.g[3].toLocaleString()+'　来孫 '+t.g[4].toLocaleString()+'　集団死亡 '+t.deaths.toLocaleString(),54,y+111);
    ctx.restore();return result;
   };
  }
  if(typeof shareText==='function'){
   const base=shareText;
   shareText=function(...args){const txt=base(...args),t=totals(state());return t&&txt?txt+'\n子孫：'+description(t)+'（集団死亡累計 '+t.deaths.toLocaleString()+'人）':txt;};
  }
  window.__descendantsNative={totals};
 }catch(e){console.error('native descendants integration',e)}
}
integrate();
})();
