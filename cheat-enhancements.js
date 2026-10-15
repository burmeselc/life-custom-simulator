/* Unofficial local-only scenario editor extension. Runs after game.ja.js. */
(()=>{
'use strict';
const pins={};let last=null;
const state=()=>{try{return typeof S!=='undefined'?S:null}catch{return null}};
const numeric=(x,min,max)=>{const n=Number(x);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):null};
function sync(){
 const s=state();if(!s||s.phase==='end')return;
 for(const [k,v] of Object.entries(pins)){
  if(['income','debt','money','house'].includes(k))s[k]=v;
  else if(k==='health')s.st.hl=v;
  else if(k==='happiness')s.st.h=v;
  else if(k==='q')s.q=v;
 }
 if(s.flags?.isolatedScenario){
  s.urban=false;s.city=null;
  // The original national statistics and event engine still apply.
 }
}
setInterval(sync,300);
function panel(){
 if(document.getElementById('cex-panel'))return;
 const root=document.createElement('section');root.id='cex-panel';root.style.cssText='padding:12px;margin-top:12px;border-top:1px solid var(--rule,#bbb);font-size:14px';
 root.innerHTML=`<h3 style="margin:4px 0 8px">継続固定・家族編集（実験版）</h3>
 <p style="font-size:12px">「固定」は毎回の計算の後にも指定値を維持します。固定を外すと通常計算に戻ります。</p>
 <div id="cex-pins" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px"></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0"><button type="button" id="cex-set" class="ghost sm">指定値を固定</button><button type="button" id="cex-clear" class="ghost sm">全固定を解除</button></div>
 <h4 style="margin:12px 0 6px">子供を追加・編集</h4><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">
 <label>名前<input id="cex-kname" type="text" placeholder="名前（任意）"></label>
 <label>性別<select id="cex-ksex"><option value="F">女</option><option value="M">男</option></select></label>
 <label>年齢<input id="cex-kage" type="number" min="0" max="100" value="0"></label>
 <label>出生区分<select id="cex-kadopt"><option value="0">実子</option><option value="1">養子</option></select></label></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0"><button type="button" id="cex-add" class="ghost sm">子供を追加</button><button type="button" id="cex-list" class="ghost sm">子供一覧を更新</button></div>
 <div id="cex-kids" style="max-height:210px;overflow:auto"></div>
 <h4 style="margin:12px 0 6px">両親・きょうだい</h4>
 <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">
 <label>母の年齢<input id="cex-momage" type="number" min="0" max="150"></label>
 <label>父の年齢<input id="cex-dadage" type="number" min="0" max="150"></label>
 <label>母の状態<select id="cex-momalive"><option value="1">生存</option><option value="0">死亡</option></select></label>
 <label>父の状態<select id="cex-dadalive"><option value="1">生存</option><option value="0">死亡</option></select></label>
 <label>父の不在<select id="cex-dadabsent"><option value="0">同居・関与</option><option value="1">不在</option></select></label>
 <label>年上のきょうだい<input id="cex-older" type="number" min="0" max="100"></label>
 <label>年下のきょうだい<input id="cex-younger" type="number" min="0" max="100"></label></div>
 <button type="button" id="cex-familyapply" class="ghost sm" style="margin-top:8px">家族構成を適用</button>
 <h4 style="margin:12px 0 6px">寿命・死亡確率</h4>
 <label>自然死亡の制御<select id="cex-mortmode"><option value="normal">通常</option><option value="immortal">年齢による自然死亡なし</option><option value="limit">指定年齢から死亡確率100%</option><option value="protect">指定年齢までは自然死亡なし</option></select></label>
 <label>指定年齢<input id="cex-mortage" type="number" min="0" max="150" value="100"></label>
 <button type="button" id="cex-mortapply" class="ghost sm" style="margin-top:8px">寿命設定を適用</button>
 <p style="font-size:12px">死亡確率の変更は自然死亡の抽選を対象とします。事故・戦争・病気等の個別イベントによる死亡は必ずしも防ぎません。</p>
 <p id="cex-msg" role="status" style="font-size:12px"></p>`;
 const old=document.getElementById('cheatStatus');if(old)old.after(root);else document.body.append(root);
 const $=id=>document.getElementById(id),names={income:'年間収入',debt:'負債',money:'現金',house:'不動産',health:'健康',happiness:'幸福',q:'家庭階層'};
 $('cex-pins').innerHTML=Object.entries(names).map(([k,n])=>`<label style="display:block">${n}<input data-cex="${k}" type="number" step="any" style="width:100%;padding:6px" placeholder="固定しない"></label>`).join('');
 $('cex-set').onclick=()=>{const s=state();if(!s){$('cex-msg').textContent='人生を開始してください';return}for(const inp of root.querySelectorAll('[data-cex]')){const k=inp.dataset.cex;if(inp.value===''){delete pins[k];continue}const n=numeric(inp.value,k==='q'?1:-1e15,k==='q'?5:1e15);if(n!==null)pins[k]=k==='q'?Math.round(n):n}sync();$('cex-msg').textContent='固定条件を更新しました。'+Object.keys(pins).join(' / ');};
 $('cex-clear').onclick=()=>{for(const k of Object.keys(pins))delete pins[k];root.querySelectorAll('[data-cex]').forEach(x=>x.value='');$('cex-msg').textContent='固定を解除しました';};
 $('cex-add').onclick=()=>{const s=state();if(!s){$('cex-msg').textContent='人生を開始してください';return}const age=numeric($('cex-kage').value,0,100);if(age===null){$('cex-msg').textContent='子供の年齢は親の現在年齢以下にしてください';return}if(!Array.isArray(s.fam?.kids))return;const sex=$('cex-ksex').value;const g=$('cex-kname').value.trim()||('子供'+(s.fam.kids.length+1));s.fam.kids.push({name:{g,full:g},sex,bornAt:s.age-age,alive:true,adopted:$('cex-kadopt').value==='1'?1:0});s.stats.kidsBorn=(s.stats.kidsBorn||0)+1;refreshKids();$('cex-msg').textContent='子供を追加しました。表示更新は次の進行タイミングで反映される場合があります';};
 function refreshKids(){const s=state();const el=$('cex-kids');el.replaceChildren();if(!s?.fam?.kids){el.textContent='まだ開始されてゐません';return;}s.fam.kids.forEach((kid,i)=>{const row=document.createElement('div');row.style.cssText='padding:6px 0;border-bottom:1px solid var(--rule,#bbb);display:flex;gap:6px;align-items:center';const nm=typeof kid.name==='string'?kid.name:(kid.name?.full||kid.name?.g||'子供');const span=document.createElement('span');span.style.flex='1';span.textContent=`${i+1}. ${nm} / ${Math.max(0,Math.floor(s.age-kid.bornAt))}歳 / ${kid.alive?'生存':'死亡'}`;const alive=document.createElement('button');alive.type='button';alive.textContent=kid.alive?'死亡にする':'生存にする';alive.onclick=()=>{kid.alive=!kid.alive;refreshKids()};const del=document.createElement('button');del.type='button';del.textContent='削除';del.onclick=()=>{if(!confirm('この子供を一覧から削除しますか？'))return;s.fam.kids.splice(i,1);refreshKids()};row.append(span,alive,del);el.append(row)});}
 $('cex-familyapply').onclick=()=>{const s=state();if(!s?.fam){$('cex-msg').textContent='人生を開始してください';return}const f=s.fam;for(const [id,obj] of [['cex-momage',f.mom],['cex-dadage',f.dad]]){const a=numeric($(id).value,0,150);if(a!==null)obj.age=Math.floor(a)}f.mom.alive=$('cex-momalive').value==='1';f.dad.alive=$('cex-dadalive').value==='1';f.dad.absent=$('cex-dadabsent').value==='1';for(const [id,key] of [['cex-older','older'],['cex-younger','younger']]){const n=numeric($(id).value,0,100);if(n!==null)f[key]=Math.floor(n)}$('cex-msg').textContent='家族を変更しました（親の人数は実親2人の状態で表現します）';};
 function refreshFamily(){const s=state();if(!s?.fam)return;const f=s.fam;$('cex-momage').value=f.mom.age;$('cex-dadage').value=f.dad.age;$('cex-momalive').value=f.mom.alive?'1':'0';$('cex-dadalive').value=f.dad.alive?'1':'0';$('cex-dadabsent').value=f.dad.absent?'1':'0';$('cex-older').value=f.older;$('cex-younger').value=f.younger;}
 const mortality={mode:'normal',age:100};
 $('cex-mortapply').onclick=()=>{mortality.mode=$('cex-mortmode').value;mortality.age=numeric($('cex-mortage').value,0,150)??100;$('cex-msg').textContent='自然死亡設定を更新しました';};
 // Function declaration exposed by the original classic script: replace only the annual mortality probability.
 try{if(typeof deathProb==='function'){const originalDeathProb=deathProb;deathProb=function(){const s=state();if(!s)return originalDeathProb();if(mortality.mode==='immortal')return 0;if(mortality.mode==='protect'&&s.age<mortality.age)return 0;if(mortality.mode==='limit'&&s.age>=mortality.age)return 1;return originalDeathProb();};}}catch(e){console.warn('mortality override unavailable',e)}
 $('cex-list').onclick=()=>{refreshKids();refreshFamily()};
 const oldToggle=$('cheatToggle');if(oldToggle)oldToggle.addEventListener('click',()=>{if(!document.getElementById('cheatPanel')?.hidden){refreshKids();refreshFamily()}});
 refreshKids();refreshFamily();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',panel);else panel();
})();
