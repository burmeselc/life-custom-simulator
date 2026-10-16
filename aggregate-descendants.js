/* Aggregate descendants v0.5.3 — compact counts by generation and age. */
(()=>{
'use strict';
const labels=['子','孫','曾孫','玄孫','来孫'];
const $=id=>document.getElementById(id);
const getState=()=>{try{return typeof S!=='undefined'?S:null}catch{return null}};
const key=(g,age)=>g+':'+age;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function store(s){if(!s?.flags)return null;return s.flags.aggregateDescendants ||= {cohorts:{},lastAge:s.age,birthRate:0.055};}
function add(c,g,age,n){if(!Number.isFinite(n)||n<1||g<0||g>4)return;const k=key(g,age);c[k]=(c[k]||0)+Math.floor(n);}
function approxBinom(n,p){if(n<=0||p<=0)return 0;if(p>=1)return n;if(n<80){let x=0;for(let i=0;i<n;i++)if(Math.random()<p)x++;return x;}const mean=n*p,sd=Math.sqrt(n*p*(1-p));const normal=(Math.sqrt(-2*Math.log(Math.max(1e-10,Math.random())))*Math.cos(2*Math.PI*Math.random()));return clamp(Math.round(mean+sd*normal),0,n);}
function mortality(age){return age<1?0.008:age<5?0.002:age<40?0.001:age<60?0.003:age<75?0.014:age<90?0.045:Math.min(0.9,0.08+(age-90)*0.023);}
function oneYear(d){
 const next={},stats={deaths:0,births:0};
 for(const [k,n] of Object.entries(d.cohorts)){
  const [g,age]=k.split(':').map(Number);if(!Number.isInteger(g)||!Number.isInteger(age)||!Number.isFinite(n)||n<=0)continue;
  const deaths=approxBinom(n,mortality(age));stats.deaths+=deaths;const survivors=n-deaths;
  if(survivors>0&&age<150)add(next,g,age+1,survivors);
  if(g<4&&age>=18&&age<=42){
   // Illustrative fertility: annual new births per surviving member, not historical demographic data.
   const newborn=approxBinom(survivors,clamp(d.birthRate||0,0,1));
   add(next,g+1,0,newborn);stats.births+=newborn;
  }
 }
 d.cohorts=next;d.totalDeaths=(d.totalDeaths||0)+stats.deaths;d.totalBirths=(d.totalBirths||0)+stats.births;
}
function advance(){
 const s=getState();if(!s||s.phase==='end')return;const d=store(s);if(!d)return;
 if(s.age<d.lastAge){d.lastAge=s.age;return;}
 const passed=clamp(Math.floor(s.age-d.lastAge),0,150);for(let i=0;i<passed;i++)oneYear(d);
 if(passed)d.lastAge=s.age;
 const panel=$('ag-panel');if(panel&&!panel.hidden&&passed)render();
}
function totals(d){const counts=[0,0,0,0,0];for(const [k,n]of Object.entries(d.cohorts)){const g=Number(k.split(':')[0]);if(Number.isInteger(g)&&g>=0&&g<5)counts[g]+=n;}return counts;}
function render(){
 const s=getState(),out=$('ag-out');if(!out)return;if(!s){out.textContent='人生開始後に利用できます。';return;}
 const d=store(s),t=totals(d);out.replaceChildren();
 const p=document.createElement('p');p.textContent=labels.map((x,i)=>x+' '+t[i].toLocaleString()+'人').join(' ／ ');out.append(p);
 const q=document.createElement('p');q.textContent='合計 '+t.reduce((a,b)=>a+b,0).toLocaleString()+'人、累計死亡 '+(d.totalDeaths||0).toLocaleString()+'人、累計出生 '+(d.totalBirths||0).toLocaleString()+'人';out.append(q);
}
function boot(){
 const parent=$('cex-panel');if(!parent||$('ag-panel'))return;
 const section=document.createElement('section');section.id='ag-panel';section.style.cssText='border-top:1px solid var(--rule,#ddd);margin-top:16px;padding-top:12px';
 section.innerHTML=`<h3>大家族・世代別の一括管理</h3>
 <p style="font-size:12px">個別人物を作らず、年齢・世代別人数のみ保持します。死亡と次世代の出生を年ごとに計算します。元ゲームの親族イベントには個人として登場しません。</p>
 <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">
 <label>追加する世代<select id="ag-gen"><option value="0">子</option><option value="1">孫</option><option value="2">曾孫</option><option value="3">玄孫</option><option value="4">来孫</option></select></label>
 <label>人数<input id="ag-count" type="number" min="1" max="5000" value="5000"></label>
 <label>年齢（全員共通）<input id="ag-age" type="number" min="0" max="150" value="0"></label>
 <label>年間出生率（目安）<input id="ag-rate" type="number" min="0" max="1" step="0.005" value="0.055"></label></div>
 <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">
 <button id="ag-add" type="button" class="ghost sm">5,000人までまとめて追加</button>
 <button id="ag-refresh" type="button" class="ghost sm">集計を更新</button></div>
 <p id="ag-msg" role="status" style="font-size:12px"></p><div id="ag-out" style="font-size:13px"></div>
 <p style="font-size:12px">出生率・死亡率は架空の簡易モデルです。世代上限は来孫で、それ以降の出生は計算しません。既存の個別の子供は別に管理されます。</p>`;
 parent.append(section);
 $('ag-add').onclick=()=>{const s=getState();if(!s){$('ag-msg').textContent='人生を開始してください';return;}
 const n=Number($('ag-count').value),age=Number($('ag-age').value),g=Number($('ag-gen').value);
 if(!Number.isInteger(n)||n<1||n>5000||!Number.isInteger(age)||age<0||age>150){$('ag-msg').textContent='人数は1〜5,000、年齢は0〜150で指定してください。';return;}
 const d=store(s);d.birthRate=clamp(Number($('ag-rate').value)||0,0,1);add(d.cohorts,g,age,n);$('ag-msg').textContent=labels[g]+'を'+n.toLocaleString()+'人追加しました。';render();
 };
 $('ag-refresh').onclick=render;render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
setInterval(advance,1000);
})();
