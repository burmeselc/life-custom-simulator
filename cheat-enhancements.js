/* Unofficial local-only scenario editor extension. Runs after game.ja.js. */
(()=>{
'use strict';
const pins={};let last=null;
const state=()=>{try{return typeof S!=='undefined'?S:null}catch{return null}};
const safeRecord=(message)=>{try{if(typeof log==='function')log(message,'ev');if(typeof save==='function')save();}catch(e){console.warn('scenario record',e)}};
const numeric=(x,min,max)=>{const n=Number(x);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):null};
function sync(){
 const s=state();if(!s||s.phase==='end')return;
 for(const [k,v] of Object.entries(pins)){
  if(['income','debt','money','house'].includes(k))s[k]=v;
  else if(k==='health')s.st.hl=v;
  else if(k==='happiness')s.st.h=v;
  else if(k==='q')s.q=v;
 }
 if(s.flags?.isolatedScenario){if(window.__requestedIsolatedOrigin==='png_remote_1950'&&s.born==='PNG')s.flags.isolatedScenario='png_remote_1950';s.urban=false;s.city=null;}
 // The original national event engine remains active; this editor is a supplemental layer.
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
 <label>年齢<input id="cex-kage" type="number" min="0" max="150" value="0"></label>
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
 $('cex-add').onclick=()=>{const s=state();if(!s){$('cex-msg').textContent='人生を開始してください';return}const age=numeric($('cex-kage').value,0,150);if(age===null){$('cex-msg').textContent='0〜150歳の範囲で指定してください';return}if(!Array.isArray(s.fam?.kids))return;const sex=$('cex-ksex').value;const g=$('cex-kname').value.trim()||('子供'+(s.fam.kids.length+1));s.fam.kids.push({name:{g,full:g},sex,bornAt:s.age-age,alive:true,adopted:$('cex-kadopt').value==='1'?1:0});s.stats.kidsBorn=(s.stats.kidsBorn||0)+1;refreshKids();$('cex-msg').textContent='子供を追加しました。表示更新は次の進行タイミングで反映される場合があります';};
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

function addQuickAccess(){
 if(document.getElementById('cex-family-shortcut'))return;
 const btn=document.createElement('button');btn.id='cex-family-shortcut';btn.type='button';btn.textContent='家族・寿命';btn.style.cssText='position:fixed;right:14px;bottom:75px;z-index:99992;background:#0f6e68;color:white;border:0;border-radius:24px;padding:11px 16px;font-weight:700;box-shadow:0 3px 16px #0005';
 btn.onclick=()=>{const p=document.getElementById('cheatPanel'),section=document.getElementById('cex-panel');if(!p||!section)return;p.hidden=false;section.scrollIntoView({block:'start',behavior:'smooth'});};
 document.body.append(btn);
 const root=document.getElementById('cex-panel'),p=document.getElementById('cheatPanel');if(root&&p){root.style.scrollMarginTop='12px';}
}
const scenarioData={
 imperial:{title:'皇族としての人生（仮想）',milestones:[[6,'宮廷での教育と公的行事が始まる。'],[18,'公務、学業、自由な進路の間で将来を考へる。'],[30,'公的責任と私生活との釣合ひが課題になる。'],[50,'次世代への継承と役割の変化が話題となる。']],choices:[['公務を優先する',-2,5,0],['学問や個人の活動を重視する',3,0,2],['私生活を守る',5,-2,0]]},
 president:{title:'大統領の子としての人生（仮想）',milestones:[[6,'警護と注目のなかで学校生活を始める。'],[18,'世論の注目を受けながら進路を選ぶ。'],[30,'政治・事業・独立した職業の可能性を考へる。'],[50,'家族の政治的な経歴との距離を考へる。']],choices:[['政治活動に参加する',-3,5,0],['独立した職業を選ぶ',4,0,3],['公的注目を避ける',5,-3,0]]},
 royal:{title:'王族の人生（仮想）',milestones:[[6,'家族の地位と将来の役割を意識し始める。'],[18,'伝統と自分の進路の間で選択を迫られる。'],[30,'宮廷の責任と私生活の両立を考へる。'],[50,'後継者と家族の行く末を考へる。']],choices:[['儀礼や公務を担ふ',-2,4,0],['文化・教育に関はる',3,2,1],['宮廷から距離を置く',5,-4,0]]},
 sentinel:{title:'隔絶された島の仮想人生',milestones:[[6,'共同体のなかで成長する。生活の細部は史料不足のため描写しない。'],[18,'外部世界との接触を避ける共同体の暮らしについて考へる。'],[30,'島の環境と共同体の将来をめぐる選択を想像する。'],[50,'世代を超えて島の暮らしが続く可能性について考へる。']],choices:[['共同体の人々との関係を重んじる',3,2,0],['島の環境を探索する',2,0,1],['静かな生活を選ぶ',4,0,0]]},
 png:{title:'1950年代PNG・隔絶集団の仮想人生',milestones:[[6,'1950年代のニューギニア内陸部という仮想的設定で成長する。'],[18,'外部との接触や地域の変化が将来に影響するかもしれない。'],[30,'変化を受け入れるかどうかを考へる。'],[50,'共同体と次世代について考へる。']],choices:[['地域の人間関係を優先する',4,2,0],['外部世界の情報に接する',-1,0,3],['暮らしの変化を抑へる',3,0,0]]}
};
function scenarioType(s){if(!s?.flags)return null;if(s.flags.isolatedScenario==='sentinel_island')return 'sentinel';if(s.flags.isolatedScenario==='png_remote_1950')return 'png';if(s.flags.imperial)return 'imperial';if(s.flags.presidentChild)return 'president';if(s.flags.royal)return 'royal';return null;}
let lastLife=null,lastAge=-1;
function scenarioCycle(){
 const s=state();if(!s||s.phase!=='life')return;
 if(s!==lastLife||s.age<lastAge){lastLife=s;lastAge=-1;}
 const type=scenarioType(s);if(!type)return;
 const d=scenarioData[type];s.flags.cexMilestones ||= {};
 for(const [age,msg] of d.milestones){
  const key=type+'_'+age;
  if(s.age>=age&&!s.flags.cexMilestones[key]){
   s.flags.cexMilestones[key]=1;
   safeRecord('特別シナリオ（創作）：'+msg);
  }
 }
 // Choice-specific consequences are applied only once per in-game year.
 const choice=s.flags.cexScenarioChoice;
 if(choice?.type===type&&s.age!==lastAge&&s.age>=(choice.startAge||0)){
  const key=type+'_choice_'+s.age;
  if(!s.flags.cexMilestones[key]){
   s.flags.cexMilestones[key]=1;
   const effects={
    imperial:[[-0.5,1,0],[0.5,0,0.2],[1,-0.5,0]],
    president:[[-0.5,1,0],[0.5,0,0.3],[1,-0.5,0]],
    royal:[[-0.5,1,0],[0.5,0,0.2],[1,-1,0]],
    sentinel:[[0.5,0,0],[0.5,0,0],[0.5,0,0]],
    png:[[0.5,0,0],[0,0,0.2],[0.5,0,0]]
   };
   const [h,so,edu]=effects[type]?.[choice.index]||[0,0,0];
   if(s.st){s.st.h=Math.max(0,Math.min(100,(s.st.h||0)+h));s.st.so=Math.max(0,Math.min(100,(s.st.so||0)+so));}
   if(edu)s.edu=Math.max(0,(s.edu||0)+edu);
   if(s.age%5===0)safeRecord('選んだ方針「'+choice.label+'」が、その後の暮らしに影響してゐる。');
  }
 }
 lastAge=s.age;
}
function addScenarioPanel(){
 const root=document.createElement('section');root.id='cex-story';root.style.cssText='position:fixed;z-index:99993;left:12px;bottom:12px;width:min(400px,calc(100vw - 24px));max-height:70vh;overflow:auto;background:var(--card,#fff);color:var(--ink,#111);border:2px solid var(--stamp,#0f6e68);padding:14px;border-radius:12px;box-shadow:0 6px 30px #0006';root.hidden=true;root.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><b id="cex-storytitle"></b><button id="cex-storyclose" type="button">閉じる</button></div><p style="font-size:12px">原作の既存イベントに加へた非公式の創作シナリオです。実在の人物や集団の生活を再現するものではありません。</p><div id="cex-storychoices" style="display:grid;gap:8px"></div><p id="cex-storymsg" style="font-size:13px"></p>';
 document.body.append(root);const btn=document.createElement('button');btn.type='button';btn.id='cex-storytoggle';btn.textContent='特別イベント';btn.style.cssText='position:fixed;left:14px;bottom:18px;z-index:99992;background:#8c1d3c;color:#fff;border:0;border-radius:24px;padding:11px 16px;font-weight:700;box-shadow:0 3px 16px #0005';document.body.append(btn);
 document.getElementById('cex-storyclose').onclick=()=>root.hidden=true;
 function show(){const s=state(),type=scenarioType(s),d=scenarioData[type];if(!d){document.getElementById('cex-storytitle').textContent='特殊な出自は未設定です';document.getElementById('cex-storychoices').replaceChildren();document.getElementById('cex-storymsg').textContent='出生条件で特殊な出自を選び、人生を始めてください。';return;}
 document.getElementById('cex-storytitle').textContent=d.title;const list=document.getElementById('cex-storychoices');list.replaceChildren();
 for(const [index,[label,dh,dso,de]] of d.choices.entries()){const b=document.createElement('button');b.type='button';b.textContent=label;b.className='ghost sm';b.onclick=()=>{if(!state())return;const t=state();t.st.h=Math.min(100,Math.max(0,t.st.h+dh));t.st.so=Math.min(100,Math.max(0,t.st.so+dso));t.edu=Math.max(0,(t.edu||0)+de);t.flags.cexScenarioChoice={type,index,label,startAge:t.age};safeRecord('特別シナリオで「'+label+'」を選んだ。');document.getElementById('cex-storymsg').textContent='選択を記録しました。以後の各年にも、その方針の影響が反映されます。';};list.append(b)}
 document.getElementById('cex-storymsg').textContent='人生を進めると年齢に応じた特別な記録が追加されます。';}
 btn.onclick=()=>{root.hidden=!root.hidden;if(!root.hidden)show()};root.hidden=true;
}

function boot(){try{panel()}catch(e){console.error('family panel',e)}try{addQuickAccess()}catch(e){console.error('family shortcut',e)}try{addScenarioPanel()}catch(e){console.error('scenario panel',e)}setInterval(scenarioCycle,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
