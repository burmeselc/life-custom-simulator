/* Clan and descendant report v0.5.4
   Compact cohort tree, current-life and end-of-life display. */
(()=>{
'use strict';
const names=['子','孫','曾孫','玄孫','来孫'];
const $=id=>document.getElementById(id);
const state=()=>{try{return typeof S!=='undefined'?S:null}catch{return null}};
function agg(s){return s?.flags?.aggregateDescendants||null}
function counts(d){const a=[0,0,0,0,0];if(!d)return a;for(const [k,n] of Object.entries(d.cohorts||{})){const g=Number(k.split(':')[0]);if(Number.isInteger(g)&&g>=0&&g<5)a[g]+=Math.max(0,Number(n)||0)}return a}
function snapshot(s){const d=agg(s);if(!d)return null;
 const n=counts(d);const individuals=Array.isArray(s?.fam?.kids)?s.fam.kids:[];
 const aliveIndividual=individuals.reduce((v,k)=>v+(k.alive?1:0),0);
 return {n, individual:individuals.length,aliveIndividual,deaths:d.totalDeaths||0,births:d.totalBirths||0,total:n.reduce((a,b)=>a+b,0),age:s?.age||0};}
function el(tag,txt,cls){const x=document.createElement(tag);if(txt!==undefined)x.textContent=txt;if(cls)x.className=cls;return x}
function makeReport(){
 const root=el('section');root.id='clan-report';root.style.cssText='margin:14px 0;padding:16px;border:1px solid var(--rule,#aaa);border-radius:10px;background:var(--card,#fff);color:var(--ink,#111);font-size:14px;';
 root.append(el('h3','氏族・子孫の記録'));
 const note=el('p','個別登録の子供と、集団管理の子孫を区別して集計してゐます。集団は年齢別の人数のみで、実在する一人ひとりの系譜を表すものではありません。');
 note.style.cssText='font-size:12px;color:var(--ink2,#555)';root.append(note);
 const stats=el('div');stats.id='clan-stats';root.append(stats);
 const graph=el('div');graph.id='clan-graph';graph.style.cssText='display:grid;gap:8px;margin-top:12px';root.append(graph);
 const buttons=el('div');buttons.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:12px';
 const refresh=el('button','集計を更新');refresh.type='button';refresh.className='ghost sm';refresh.onclick=draw;
 const copy=el('button','氏族記録をコピー');copy.type='button';copy.className='ghost sm';copy.onclick=()=>{const s=state(),v=snapshot(s);if(!v)return;const text=[`年齢 ${v.age}歳 / 個別の子供 ${v.individual}人（生存 ${v.aliveIndividual}人）`,...names.map((n,i)=>`${n}: ${v.n[i]}人`),`集団管理累計出生 ${v.births}人 / 累計死亡 ${v.deaths}人`].join('\n');navigator.clipboard?.writeText(text).catch(()=>{});};
 const img=el('button','氏族グラフをPNG保存');img.type='button';img.className='ghost sm';img.onclick=()=>{
 const v=snapshot(state());if(!v)return;
 const c=document.createElement('canvas');c.width=1000;c.height=650;const ctx=c.getContext('2d');if(!ctx)return;
 ctx.fillStyle='#f7faf8';ctx.fillRect(0,0,c.width,c.height);
 ctx.fillStyle='#13212a';ctx.font='bold 37px sans-serif';ctx.fillText('氏族・子孫の記録',50,65);
 ctx.font='22px sans-serif';ctx.fillText('個別の子供 '+v.individual.toLocaleString()+'人　 集団管理 '+v.total.toLocaleString()+'人',50,112);
 ctx.font='20px sans-serif';ctx.fillText('累計出生 '+v.births.toLocaleString()+'人　累計死亡 '+v.deaths.toLocaleString()+'人',50,155);
 const max=Math.max(1,...v.n);
 for(let i=0;i<5;i++){const y=210+i*78;ctx.fillStyle='#13212a';ctx.font='24px sans-serif';ctx.fillText(names[i],50,y+24);ctx.fillStyle='#dce4e1';ctx.fillRect(165,y,610,28);ctx.fillStyle='#0f6e68';ctx.fillRect(165,y,610*v.n[i]/max,28);ctx.fillStyle='#13212a';ctx.fillText(v.n[i].toLocaleString()+'人',800,y+24);}
 ctx.fillStyle='#4a5a61';ctx.font='18px sans-serif';ctx.fillText('集団管理の簡易推計。個別の系譜ではありません。',50,610);
 const a=document.createElement('a');a.download='clan-descendants.png';a.href=c.toDataURL('image/png');a.click();
 };
 buttons.append(refresh,copy,img);root.append(buttons);return root;
}
function draw(){
 const s=state(),v=snapshot(s),stats=$('clan-stats'),graph=$('clan-graph');if(!v||!stats||!graph)return;
 stats.replaceChildren();graph.replaceChildren();
 const top=el('p',`個別の子供：${v.individual.toLocaleString()}人（生存 ${v.aliveIndividual.toLocaleString()}人） ／ 集団管理中：${v.total.toLocaleString()}人`);top.style.fontWeight='bold';stats.append(top);
 stats.append(el('p',`集団管理の累計出生：${v.births.toLocaleString()}人 ／ 累計死亡：${v.deaths.toLocaleString()}人`));
 const maximum=Math.max(1,...v.n);
 for(let i=0;i<names.length;i++){
  const row=el('div');row.style.cssText='display:grid;grid-template-columns:48px minmax(0,1fr) 90px;align-items:center;gap:8px';
  const bar=el('div');bar.style.cssText='background:var(--rule2,#e5e5e5);height:12px;border-radius:5px;overflow:hidden';
  const fill=el('div');fill.style.cssText='height:100%;background:var(--stamp,#0f6e68);width:'+((v.n[i]/maximum)*100).toFixed(2)+'%';
  bar.append(fill);row.append(el('span',names[i]),bar,el('span',v.n[i].toLocaleString()+'人'));graph.append(row);
 }
}
let lastResult=false,lastAge=-1;
function mount(){
 const host=$('dead');if(!host)return;
 let report=$('clan-report');
 if(!report){report=makeReport();host.append(report);}
 // When the engine rebuilds the result section, reattach.
 else if(report.parentNode!==host)host.append(report);
 draw();
}
function tick(){
 const s=state(),host=$('dead');
 if(!s||!host)return;
 const result=!host.hidden;
 if(result){if(!document.getElementById('clan-report')||!host.contains($('clan-report'))||!lastResult)mount();}
 lastResult=result;
 if($('clan-report')&&s.age!==lastAge){lastAge=s.age;draw();}
}
function panelShortcut(){
 const parent=$('ag-panel');if(!parent)return;
 if($('clan-inline'))return;
 const d=el('div');d.id='clan-inline';d.style.marginTop='10px';
 const b=el('button','氏族の人数・系譜を見る');b.type='button';b.className='ghost sm';
 b.onclick=()=>{const host=$('dead');if(host&&!host.hidden){mount();host.scrollIntoView({behavior:'smooth'})}else{$('ag-out')?.scrollIntoView({behavior:'smooth'});window.alert('現在の世代別人数は「大家族・世代別の一括管理」に表示されます。最終結果には氏族グラフも追加されます。')}};
 d.append(b);parent.append(d);
}
setInterval(()=>{try{tick();panelShortcut()}catch(e){console.warn('clan report',e)}},850);
})();
