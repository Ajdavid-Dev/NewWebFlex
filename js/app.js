/* ================================================================
   VILLAGER BUDGET — application script
   Sections:
   1. Utilities & formatting
   2. Demo data + state (localStorage)
   3. Toasts, modals, dropdowns
   4. Auth + OTP
   5. Onboarding wizard
   6. App shell + navigation
   7. Views: home, budget, accounts, transactions, goals,
      insights, payments, marketplace, profile
   8. Flows: bank connect, send money (smart split), goal actions,
      monthly review, marketplace checkout
   9. AI coach (prewritten responses)
   ================================================================ */

/* ---------- 1. UTILITIES ---------- */
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const NGN = n => '₦' + Math.round(n).toLocaleString('en-NG');
const pct = (a,b) => b ? Math.round(a/b*100) : 0;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = () => window.lucide && lucide.createIcons();
const todayStr = () => new Date().toLocaleDateString('en-NG',{weekday:'long', day:'numeric', month:'long'});
const daysLeftInMonth = () => { const d=new Date(); return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate() - d.getDate(); };
const rel = iso => { const diff=(Date.now()-new Date(iso))/6e4; if(diff<60) return Math.max(1,Math.round(diff))+'m ago'; if(diff<1440) return Math.round(diff/60)+'h ago'; return Math.round(diff/1440)+'d ago'; };
const dayKey = iso => { const d=new Date(iso), t=new Date(); const same=(a,b)=>a.toDateString()===b.toDateString(); const y=new Date(Date.now()-864e5); if(same(d,t))return 'Today'; if(same(d,y))return 'Yesterday'; return d.toLocaleDateString('en-NG',{weekday:'short',day:'numeric',month:'short'}); };
const timeOf = iso => new Date(iso).toLocaleTimeString('en-NG',{hour:'numeric',minute:'2-digit'});
const greeting = () => { const h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; };
const uid = () => Math.random().toString(36).slice(2,9);
const daysAgo = (d,h=10,m=15) => { const t=new Date(); t.setDate(t.getDate()-d); t.setHours(h,m,0,0); return t.toISOString(); };

/* ---------- 2. DEMO DATA & STATE ---------- */
const BANKS = [
  {id:'access', name:'Access Bank', color:'#E7792B', type:'Bank'},
  {id:'gtb', name:'GTBank', color:'#DD4F05', type:'Bank'},
  {id:'firstbank', name:'First Bank', color:'#003B7E', type:'Bank'},
  {id:'uba', name:'UBA', color:'#D82418', type:'Bank'},
  {id:'zenith', name:'Zenith Bank', color:'#E31E24', type:'Bank'},
  {id:'stanbic', name:'Stanbic IBTC', color:'#0033A1', type:'Bank'},
  {id:'sterling', name:'Sterling Bank', color:'#D6001C', type:'Bank'},
  {id:'wema', name:'Wema Bank', color:'#990D81', type:'Bank'},
  {id:'kuda', name:'Kuda', color:'#40196D', type:'Wallet'},
  {id:'opay', name:'OPay', color:'#1DCF9F', type:'Wallet'},
  {id:'palmpay', name:'PalmPay', color:'#7B4BD0', type:'Wallet'},
  {id:'moniepoint', name:'Moniepoint', color:'#0357EE', type:'Wallet'},
];
const bankOf = id => id==='cash' ? {id:'cash', name:'Cash', color:'#5F6B65', type:'Cash'} : (BANKS.find(b=>b.id===id) || {name:id,color:'#69746E',type:'Bank'});

const CAT_META = {
  Feeding:{icon:'utensils',color:'#1D9A6C'}, Transport:{icon:'bus',color:'#2F6FA7'}, Housing:{icon:'house',color:'#8A6A14'},
  Utilities:{icon:'zap',color:'#C97B0F'}, 'Data & Internet':{icon:'wifi',color:'#7B4BD0'}, 'Family Support':{icon:'heart-handshake',color:'#CE4B4B'},
  Giving:{icon:'hand-heart',color:'#C99A2C'}, 'Personal Care':{icon:'smile',color:'#D0679D'}, Entertainment:{icon:'clapperboard',color:'#5B6ABF'},
  Shopping:{icon:'shopping-bag',color:'#E7792B'}, Healthcare:{icon:'stethoscope',color:'#1BA8A0'}, Education:{icon:'graduation-cap',color:'#0357EE'},
  Debt:{icon:'credit-card',color:'#8B5CF6'}, Savings:{icon:'piggy-bank',color:'#0E4A39'}, 'Emergency Fund':{icon:'shield',color:'#136048'},
  Miscellaneous:{icon:'shapes',color:'#69746E'}, Salary:{icon:'banknote',color:'#1D9A6C'}, Transfers:{icon:'arrow-left-right',color:'#69746E'},
  'Business Income':{icon:'briefcase',color:'#1D9A6C'}, Bills:{icon:'receipt',color:'#C97B0F'}
};
const catMeta = c => CAT_META[c] || CAT_META.Miscellaneous;

function demoState(){
  return {
    onboarded:true, pinSet:true, hideBalance:false, theme:'light',
    user:{name:'David Adeyemi', firstName:'David', email:'david.adeyemi@example.com', phone:'0803 452 1187', income:350000, payday:28, incomeType:'Salary', strictness:'Balanced guidance', priorities:['Saving more','Supporting family responsibly']},
    accounts:[
      {id:'a1', bank:'access', label:'Access Bank', mask:'4821', type:'Current account', balance:61500, primary:true, hidden:false, minProtect:5000, synced:daysAgo(0,8,40)},
      {id:'a2', bank:'opay', label:'OPay', mask:'9304', type:'Wallet', balance:23000, primary:false, hidden:false, minProtect:2000, synced:daysAgo(0,9,5)},
      {id:'a3', bank:'moniepoint', label:'Moniepoint', mask:'7752', type:'Wallet', balance:40000, primary:false, hidden:false, minProtect:0, synced:daysAgo(0,7,55)},
      {id:'a4', bank:'sterling', label:'Sterling Bank', mask:'1678', type:'Savings account', balance:60000, primary:false, hidden:false, minProtect:10000, synced:daysAgo(1,21,10)},
      {id:'cash', bank:'cash', label:'Cash & outside app', mask:'', type:'Cash', balance:12000, primary:false, hidden:false, minProtect:0, synced:daysAgo(0,8,0)},
    ],
    monthLogs:[],
    budget:[
      {id:'b1', name:'Feeding', planned:55000, locked:true, paused:false, note:''},
      {id:'b2', name:'Transport', planned:35000, locked:true, paused:false, note:''},
      {id:'b3', name:'Data & Internet', planned:15000, locked:false, paused:false, note:''},
      {id:'b4', name:'Family Support', planned:30000, locked:true, paused:false, note:'Mum + Tunde school levy'},
      {id:'b5', name:'Giving', planned:20000, locked:false, paused:false, note:''},
      {id:'b6', name:'Entertainment', planned:18000, locked:false, paused:false, note:''},
      {id:'b7', name:'Shopping', planned:20000, locked:false, paused:false, note:''},
      {id:'b8', name:'Savings', planned:70000, locked:true, paused:false, note:'Rent goal first'},
      {id:'b9', name:'Emergency Fund', planned:25000, locked:true, paused:false, note:''},
      {id:'b10', name:'Miscellaneous', planned:12000, locked:false, paused:false, note:''},
    ],
    transactions:[
      {id:uid(), merchant:'Chicken Republic — Yaba', amount:-4800, cat:'Feeding', acct:'a2', date:daysAgo(0,13,42), type:'expense', status:'Completed', note:'', recurring:false, excluded:false},
      {id:uid(), merchant:'Bolt ride', amount:-2350, cat:'Transport', acct:'a2', date:daysAgo(0,9,18), type:'expense', status:'Completed', note:'Office → client meeting', recurring:false, excluded:false},
      {id:uid(), merchant:'MTN Data 20GB', amount:-5500, cat:'Data & Internet', acct:'a1', date:daysAgo(1,7,2), type:'expense', status:'Completed', note:'', recurring:true, excluded:false},
      {id:uid(), merchant:'Shoprite — Ikeja City Mall', amount:-18650, cat:'Feeding', acct:'a1', date:daysAgo(2,18,25), type:'expense', status:'Completed', note:'Monthly groceries', recurring:false, excluded:false},
      {id:uid(), merchant:'Transfer to Mum (Kemi A.)', amount:-15000, cat:'Family Support', acct:'a1', date:daysAgo(3,8,50), type:'transfer', status:'Completed', note:'', recurring:true, excluded:false},
      {id:uid(), merchant:'Netflix', amount:-5500, cat:'Entertainment', acct:'a1', date:daysAgo(4,2,0), type:'expense', status:'Completed', note:'', recurring:true, excluded:false},
      {id:uid(), merchant:'IKEDC prepaid units', amount:-10000, cat:'Utilities', acct:'a3', date:daysAgo(5,19,33), type:'expense', status:'Completed', note:'', recurring:true, excluded:false},
      {id:uid(), merchant:'Danfo & keke (week)', amount:-6300, cat:'Transport', acct:'a2', date:daysAgo(5,8,5), type:'expense', status:'Completed', note:'', recurring:false, excluded:false},
      {id:uid(), merchant:'Freelance — logo project', amount:52000, cat:'Business Income', acct:'a3', date:daysAgo(6,16,44), type:'income', status:'Completed', note:'Client: Bisi Prints', recurring:false, excluded:false},
      {id:uid(), merchant:'The Place — lunch', amount:-3900, cat:'Feeding', acct:'a2', date:daysAgo(6,13,12), type:'expense', status:'Completed', note:'', recurring:false, excluded:false},
      {id:uid(), merchant:'Auto-save → Rent goal', amount:-25000, cat:'Savings', acct:'a1', date:daysAgo(7,6,0), type:'transfer', status:'Completed', note:'Standing order', recurring:true, excluded:false},
      {id:uid(), merchant:'Church offering', amount:-5000, cat:'Giving', acct:'a2', date:daysAgo(8,11,30), type:'expense', status:'Completed', note:'', recurring:false, excluded:false},
      {id:uid(), merchant:'Jumia — sneakers', amount:-14200, cat:'Shopping', acct:'a4', date:daysAgo(9,20,15), type:'expense', status:'Completed', note:'', recurring:false, excluded:false},
      {id:uid(), merchant:'Pharmacy — HealthPlus', amount:-3600, cat:'Healthcare', acct:'a1', date:daysAgo(10,17,48), type:'expense', status:'Completed', note:'', recurring:false, excluded:false},
      {id:uid(), merchant:'Cinema — Filmhouse Lekki', amount:-7500, cat:'Entertainment', acct:'a2', date:daysAgo(11,19,0), type:'expense', status:'Completed', note:'Weekend outing', recurring:false, excluded:false},
      {id:uid(), merchant:'Salary — Ricive Ltd', amount:350000, cat:'Salary', acct:'a1', date:daysAgo(24,9,0), type:'income', status:'Completed', note:'June salary', recurring:true, excluded:false},
      {id:uid(), merchant:'Transfer to Tunde (brother)', amount:-8000, cat:'Family Support', acct:'a3', date:daysAgo(12,14,20), type:'transfer', status:'Completed', note:'School levy', recurring:false, excluded:false},
      {id:uid(), merchant:'Cold Stone Creamery', amount:-4300, cat:'Feeding', acct:'a2', date:daysAgo(13,16,5), type:'expense', status:'Completed', note:'', recurring:false, excluded:false},
      {id:uid(), merchant:'Uber — airport run', amount:-9800, cat:'Transport', acct:'a1', date:daysAgo(14,5,30), type:'expense', status:'Completed', note:'', recurring:false, excluded:false},
      {id:uid(), merchant:'Spotify', amount:-1900, cat:'Entertainment', acct:'a1', date:daysAgo(15,2,0), type:'expense', status:'Completed', note:'', recurring:true, excluded:false},
      {id:uid(), merchant:'Market run — Mile 12', amount:-12400, cat:'Feeding', acct:'a3', date:daysAgo(16,10,10), type:'expense', status:'Completed', note:'Foodstuff', recurring:false, excluded:false},
      {id:uid(), merchant:'DSTV Compact', amount:-12500, cat:'Bills', acct:'a4', date:daysAgo(18,8,0), type:'expense', status:'Completed', note:'', recurring:true, excluded:false},
      {id:uid(), merchant:'Auto-save → Emergency fund', amount:-12500, cat:'Emergency Fund', acct:'a1', date:daysAgo(20,6,0), type:'transfer', status:'Completed', note:'', recurring:true, excluded:false},
      {id:uid(), merchant:'Barber — Sharp Cuts', amount:-3000, cat:'Personal Care', acct:'a2', date:daysAgo(21,18,40), type:'expense', status:'Completed', note:'', recurring:false, excluded:false},
    ],
    goals:[
      {id:'g1', name:'Rent (Surulere flat)', target:600000, saved:310000, date:'2026-11-30', priority:'High', acct:'a4', status:'active', auto:25000},
      {id:'g2', name:'Emergency fund', target:300000, saved:96500, date:'2027-03-31', priority:'High', acct:'a1', status:'active', auto:12500},
      {id:'g3', name:'New laptop', target:850000, saved:120000, date:'2026-12-20', priority:'Medium', acct:'a4', status:'active', auto:0},
      {id:'g4', name:'December expenses', target:150000, saved:20000, date:'2026-12-10', priority:'Low', acct:'a3', status:'paused', auto:0},
    ],
    beneficiaries:[
      {id:'r1', name:'Kemi Adeyemi (Mum)', bank:'gtb', number:'0123458821'},
      {id:'r2', name:'Tunde Adeyemi', bank:'opay', number:'8034521187'},
      {id:'r3', name:'Bisi Prints Ltd', bank:'zenith', number:'1014479023'},
    ],
    cart:[],
    orders:[],
    notifications:[
      {icon:'wallet', tone:'warn', title:'Feeding budget at 81%', body:'You have used ₦44,050 of ₦55,000 with '+daysLeftInMonth()+' days left.', time:daysAgo(0,9,0)},
      {icon:'banknote', tone:'pos', title:'Income received', body:'₦52,000 freelance payment landed in Moniepoint.', time:daysAgo(0,7,30)},
      {icon:'calendar-clock', tone:'info', title:'Upcoming bill', body:'DSTV Compact (₦12,500) renews in 3 days.', time:daysAgo(1,8,0)},
      {icon:'target', tone:'pos', title:'Rent goal on track', body:'₦25,000 auto-saved. You are 52% of the way there.', time:daysAgo(2,6,0)},
      {icon:'trending-up', tone:'warn', title:'Unusual spending', body:'Transport is 18% higher than your 3-month average.', time:daysAgo(2,12,0)},
      {icon:'refresh-ccw-dot', tone:'neg', title:'Sterling Bank sync failed', body:'Last successful sync was yesterday. Tap the account to retry.', time:daysAgo(0,6,10)},
    ],
    notifRead:false,
    settings:{push:true, email:true, weekly:true, monthly:true, quiet:false, threshold:80, biometric:true, twofa:false, frozen:false, sessionTimeout:'10 minutes'},
  };
}

let S; // global state
function save(){ try{ localStorage.setItem('vb_state', JSON.stringify(S)); }catch(e){} }
function load(){ try{ const raw=localStorage.getItem('vb_state'); if(raw){ S=JSON.parse(raw); return true; } }catch(e){} return false; }

/* Derived figures */
const visAccts = () => S.accounts.filter(a=>!a.hidden);
const totalBal = () => visAccts().reduce((s,a)=>s+a.balance,0);
const spentIn = name => Math.abs(S.transactions.filter(t=>t.cat===name && t.amount<0 && !t.excluded).reduce((s,t)=>s+t.amount,0));
const monthIncome = () => S.transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
const monthSpend = () => Math.abs(S.transactions.filter(t=>t.amount<0 && !t.excluded && t.cat!=='Savings' && t.cat!=='Emergency Fund').reduce((s,t)=>s+t.amount,0));
const monthSaved = () => spentIn('Savings') + spentIn('Emergency Fund');
const plannedTotal = () => S.budget.filter(b=>!b.paused).reduce((s,b)=>s+b.planned,0);
const spentTotal = () => S.budget.reduce((s,b)=>s+spentIn(b.name),0);
function safeToSpend(){
  const flexible = S.budget.filter(b=>!b.paused && !['Savings','Emergency Fund','Housing'].includes(b.name));
  const remaining = flexible.reduce((s,b)=> s + Math.max(0, b.planned - spentIn(b.name)), 0);
  const days = Math.max(1, daysLeftInMonth());
  return Math.max(0, Math.round(remaining/days/50)*50);
}
function healthScore(){
  const adherence = Math.max(0, 100 - Math.max(0, pct(spentTotal(), plannedTotal()) - 70));
  const savingsRate = Math.min(100, pct(monthSaved(), S.user.income) * 4);
  const ef = pct(S.goals.find(g=>g.name.toLowerCase().includes('emergency'))?.saved||0, 300000);
  return Math.min(100, Math.round(adherence*.4 + savingsRate*.35 + ef*.25));
}

/* ---------- 3. TOASTS, MODALS, DROPDOWNS ---------- */
function toast(msg, tone='pos', ms=3400){
  const host = $('#toastHost');
  const iconMap = {pos:'check-circle-2', neg:'x-circle', warn:'alert-triangle', info:'info'};
  const el = document.createElement('div');
  el.className = 'toast '+tone;
  el.innerHTML = `<svg data-lucide="${iconMap[tone]||'info'}"></svg><span>${msg}</span>`;
  host.appendChild(el); icons();
  setTimeout(()=>{ el.style.transition='opacity .3s, transform .3s'; el.style.opacity='0'; el.style.transform='translateY(8px)'; setTimeout(()=>el.remove(),320); }, ms);
}
function openModal(html, opts={}){
  closeDropdowns();
  const host=$('#modalHost');
  host.innerHTML = `<div class="modal-overlay" onclick="if(event.target===this) closeModal()">
    <div class="modal ${opts.wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${opts.label||'Dialog'}">
      ${opts.noHead?'':`<div class="modal-head"><h3>${opts.title||''}</h3><button class="modal-close" onclick="closeModal()" aria-label="Close"><svg data-lucide="x"></svg></button></div>`}
      <div class="modal-body">${html}</div>
    </div></div>`;
  icons();
  const f = $('.modal input, .modal select, .modal button.btn-primary'); if(f && window.innerWidth>640) f.focus();
}
function setModal(html, opts={}){ // swap body without re-animating
  $('.modal .modal-body').innerHTML = html;
  if(opts.title!==undefined && $('.modal-head h3')) $('.modal-head h3').textContent = opts.title;
  icons();
}
function closeModal(){ $('#modalHost').innerHTML=''; }
function confirmModal(title, body, actionLabel, onYes, danger=false){
  openModal(`<p class="muted" style="font-size:14px">${body}</p>
    <div class="row" style="margin-top:18px;justify-content:flex-end">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn ${danger?'btn-danger':'btn-primary'}" id="cfYes">${actionLabel}</button>
    </div>`, {title});
  $('#cfYes').onclick = ()=>{ closeModal(); onYes(); };
}
function closeDropdowns(){ $$('.dropdown').forEach(d=>d.remove()); }
document.addEventListener('click', e=>{ if(!e.target.closest('.dropdown') && !e.target.closest('[data-dd]')) closeDropdowns(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeModal(); closeDropdowns(); closeCoach(); } });

/* ---------- 4. AUTH ---------- */
function showScreen(id){
  $$('.screen').forEach(s=>s.classList.add('hidden'));
  const el=$('#'+id); if(el) el.classList.remove('hidden');
  icons();
  if(id==='otp') initOtp();
}
function submitSignup(){
  if($('#suPass').value !== $('#suPass2').value){ toast('Passwords do not match.','neg'); return; }
  pendingName = $('#suName').value.trim();
  otpNext = 'onboarding';
  showScreen('otp');
}
function submitSignin(){ otpNext='demo'; showScreen('otp'); }
let pendingName='', otpNext='onboarding', otpTimerInt;
function initOtp(){
  const row=$('#otpRow'); row.innerHTML='';
  for(let i=0;i<6;i++){
    const b=document.createElement('input');
    b.className='pin-box'; b.maxLength=1; b.inputMode='numeric'; b.setAttribute('aria-label','Digit '+(i+1));
    b.oninput=()=>{ b.value=b.value.replace(/\D/g,''); if(b.value && row.children[i+1]) row.children[i+1].focus(); };
    b.onkeydown=e=>{ if(e.key==='Backspace' && !b.value && row.children[i-1]) row.children[i-1].focus(); };
    row.appendChild(b);
  }
  row.children[0].focus();
  let t=30; clearInterval(otpTimerInt);
  const tick=()=>{ $('#otpTimer').innerHTML = t>0 ? `Resend code in <b>${t}s</b>` : `<button class="link" style="background:none;color:var(--green-700);font-weight:600" onclick="toast('A new code was sent (any 6 digits work).','pos'); initOtp()">Resend code</button>`; if(t<=0) clearInterval(otpTimerInt); t--; };
  tick(); otpTimerInt=setInterval(tick,1000);
}
function verifyOtp(){
  const code = $$('#otpRow .pin-box').map(b=>b.value).join('');
  if(code.length<6){ toast('Enter all 6 digits.','warn'); return; }
  toast('Number verified.','pos');
  if(otpNext==='onboarding'){ startOnboarding(); } else { enterDemo(); }
}
function enterDemo(){
  if(!load() || !S.onboarded) S = demoState();
  save(); bootApp();
}

/* ---------- 5. ONBOARDING WIZARD ---------- */
const OB = { step:1, data:{ incomeTypes:[], income:250000, payday:28, varies:false, extra:'',
  essentials:{'Rent or accommodation':40000, Feeding:45000, Transport:25000, Electricity:8000, 'Internet & data':12000, 'School fees / education':0, Healthcare:5000, 'Debt repayment':0, 'Family support':20000, 'Religious giving':10000, 'Work expenses':0, Subscriptions:6000, 'Other fixed bills':0},
  lifestyle:{'Eating out':12000, Entertainment:8000, Fashion:5000, Shopping:8000, 'Personal care':4000, 'Social outings':6000, Travel:0, Gifts:3000, Hobbies:0, 'Other flexible spending':0},
  supports:[], supportAmt:20000, goals:[], strictness:'Balanced guidance', priorities:[] } };

function startOnboarding(){ OB.step=1; showScreen('onboarding'); renderOb(); }
function obPrev(){ if(OB.step>1){ OB.step--; renderOb(); } }
function obNext(){
  if(OB.step===7){ finishOnboarding(); return; }
  if(OB.step===1 && !(OB.data.income>0)){ toast('Enter your average monthly income.','warn'); return; }
  OB.step++; renderOb();
}
const obChip = (arr,val,label) => `<button type="button" class="chip ${arr.includes(val)?'active':''}" onclick="obToggle('${arr===OB.data.incomeTypes?'incomeTypes':arr===OB.data.supports?'supports':'priorities'}','${val}')">${label||val}</button>`;
function obToggle(key,val){ const a=OB.data[key]; const i=a.indexOf(val); i>=0?a.splice(i,1):a.push(val); renderOb(); }
function amountFields(obj, key){
  return `<div class="amount-grid">` + Object.keys(obj).map(k=>`
    <div class="field" style="margin:0"><label>${k}</label>
      <div class="input-wrap"><span class="prefix">₦</span>
      <input class="input has-prefix" type="number" min="0" value="${obj[k]||''}" placeholder="0"
        oninput="OB.data.${key}['${k}'] = Number(this.value)||0"></div></div>`).join('') + `</div>`;
}
function renderOb(){
  $('#obStepLabel').textContent = `Step ${OB.step} of 7`;
  $('#obBar').style.width = (OB.step/7*100)+'%';
  $('#obBack').style.visibility = OB.step===1?'hidden':'visible';
  $('#obNext').textContent = OB.step===7 ? 'Save my plan' : 'Continue';
  const d=OB.data; let h='';
  if(OB.step===1) h = `<div class="ob-step"><h2>How do you earn?</h2><p class="lead">Pick everything that applies. There are no wrong answers.</p>
    <div class="chip-grid">${['Salary','Freelance income','Business income','Allowance','Multiple income sources','Irregular income'].map(v=>obChip(d.incomeTypes,v)).join('')}</div>
    <div class="grid2"><div class="field"><label>Average monthly income</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" type="number" value="${d.income}" oninput="OB.data.income=Number(this.value)||0"></div><p class="hint">If it varies, use a typical month.</p></div>
    <div class="field"><label>Payday / expected date</label><select class="select" onchange="OB.data.payday=Number(this.value)">${Array.from({length:28},(_,i)=>`<option ${d.payday===i+1?'selected':''} value="${i+1}">${i+1}${['st','nd','rd'][i]||'th'} of the month</option>`).join('')}</select></div></div>
    <label class="check-row"><input type="checkbox" ${d.varies?'checked':''} onchange="OB.data.varies=this.checked"> My income changes from month to month</label>
    <div class="field" style="margin-top:16px"><label>Additional income sources (optional)</label><input class="input" value="${esc(d.extra)}" placeholder="e.g. weekend photography gigs" oninput="OB.data.extra=this.value"></div></div>`;
  if(OB.step===2) h = `<div class="ob-step"><h2>Your essential expenses</h2><p class="lead">Rough monthly estimates are fine — you can refine them later. Leave anything that doesn’t apply at 0.</p>${amountFields(d.essentials,'essentials')}</div>`;
  if(OB.step===3) h = `<div class="ob-step"><h2>Your lifestyle spending</h2><p class="lead">The fun, flexible side of your money. Be honest — this plan works with your life, not against it.</p>${amountFields(d.lifestyle,'lifestyle')}</div>`;
  if(OB.step===4) h = `<div class="ob-step"><h2>Who do you support?</h2><p class="lead">Family and community support is a real part of many budgets. We plan for it properly instead of pretending it doesn’t exist.</p>
    <div class="chip-grid">${['Parents','Siblings','Children','Spouse or partner','Extended family','Employees','Community or religious group'].map(v=>obChip(d.supports,v)).join('')}</div>
    <div class="field"><label>Monthly support estimate</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" type="number" value="${d.supportAmt}" oninput="OB.data.supportAmt=Number(this.value)||0"></div></div></div>`;
  if(OB.step===5){
    h = `<div class="ob-step"><h2>What are you saving toward?</h2><p class="lead">Tap to add a goal, then set the details.</p>
    <div class="chip-grid">${['Emergency fund','Rent','School fees','New phone','Laptop','Car','Wedding','Travel','Business capital','December expenses','Investment'].map(g=>`<button type="button" class="chip ${d.goals.some(x=>x.name===g)?'active':''}" onclick="obAddGoal('${g}')">${g}</button>`).join('')}
      <button type="button" class="chip" onclick="obAddGoal(prompt('Name your goal:')||'')"><svg data-lucide="plus"></svg> Custom goal</button></div>
    <div class="stack">${d.goals.map((g,i)=>`<div class="card" style="padding:15px"><div class="spread" style="margin-bottom:10px"><b>${esc(g.name)}</b><button class="btn-ghost btn-sm btn" onclick="OB.data.goals.splice(${i},1);renderOb()">Remove</button></div>
      <div class="grid3"><div class="field" style="margin:0"><label>Target</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" type="number" value="${g.target}" oninput="OB.data.goals[${i}].target=Number(this.value)||0"></div></div>
      <div class="field" style="margin:0"><label>Target date</label><input class="input" type="date" value="${g.date}" oninput="OB.data.goals[${i}].date=this.value"></div>
      <div class="field" style="margin:0"><label>Priority</label><select class="select" onchange="OB.data.goals[${i}].priority=this.value">${['High','Medium','Low'].map(p=>`<option ${g.priority===p?'selected':''}>${p}</option>`).join('')}</select></div></div></div>`).join('') || '<p class="muted small">No goals yet — that’s okay, you can add them anytime.</p>'}</div></div>`;
  }
  if(OB.step===6) h = `<div class="ob-step"><h2>How should Villager guide you?</h2><p class="lead">You stay in control either way — this only changes the tone of nudges and alerts.</p>
    <div class="chip-grid">${['Gentle guidance','Balanced guidance','Strong discipline'].map(v=>`<button type="button" class="chip ${d.strictness===v?'active':''}" onclick="OB.data.strictness='${v}';renderOb()">${v}</button>`).join('')}</div>
    <h2 style="font-size:17px;margin:8px 0 4px">What matters most to you?</h2><p class="lead">Pick up to three.</p>
    <div class="chip-grid">${['Saving more','Avoiding overspending','Paying bills on time','Building an emergency fund','Managing irregular income','Tracking everything','Supporting family responsibly'].map(v=>obChip(d.priorities,v)).join('')}</div></div>`;
  if(OB.step===7) h = renderObPlan();
  $('#obBody').innerHTML = h; icons();
  window.scrollTo({top:0});
}
function obAddGoal(name){
  if(!name) return;
  if(OB.data.goals.some(g=>g.name===name)){ OB.data.goals = OB.data.goals.filter(g=>g.name!==name); }
  else OB.data.goals.push({name, target:name==='Rent'?600000:name==='Emergency fund'?300000:150000, date:'2026-12-31', priority:'Medium'});
  renderOb();
}
function obPlan(){
  const d=OB.data;
  const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
  const essentials = sum(d.essentials);
  const lifestyleRaw = sum(d.lifestyle);
  const support = d.supports.length ? d.supportAmt : 0;
  const income = d.income;
  let left = income - essentials - support;
  // Flexible lifestyle: keep user's habits but cap so savings + buffer survive.
  const lifestyle = Math.min(lifestyleRaw, Math.max(0, Math.round(left*0.42/500)*500));
  left -= lifestyle;
  const buffer = Math.max(0, Math.round(income*0.04/500)*500);
  const goals = d.goals.length ? Math.min(Math.max(0,left-buffer), Math.max(0, Math.round((left-buffer)*0.55/500)*500)) : 0;
  const savings = Math.max(0, left - buffer - goals);
  const unalloc = income - essentials - support - lifestyle - buffer - goals - savings;
  return {income, essentials, support, lifestyle, buffer, goals, savings, unalloc:Math.max(0,unalloc)};
}
function renderObPlan(){
  const p = OB.data.plan || (OB.data.plan = obPlan());
  const rows = [['Essential spending','essentials','var(--green-700)'],['Flexible lifestyle','lifestyle','var(--gold)'],['Savings','savings','var(--green-900)'],['Goals','goals','#5B6ABF'],['Family support','support','#CE4B4B'],['Buffer','buffer','#69746E']];
  const slider = ([label,key,color]) => `
    <div class="plan-row" style="display:block">
      <div class="spread"><div class="row" style="gap:9px"><span style="width:10px;height:10px;border-radius:3px;background:${color}"></span><b style="font-size:14px">${label}</b></div>
        <div style="text-align:right"><b class="num" id="pv_${key}">${NGN(p[key])}</b> <span class="pct" id="pp_${key}">· ${pct(p[key],p.income)}%</span></div></div>
      <input type="range" min="0" max="${p.income}" step="500" value="${p[key]}" style="--fill:${pct(p[key],p.income)}%" aria-label="${label} amount"
        oninput="OB.data.plan['${key}']=Number(this.value); this.style.setProperty('--fill',Math.round(this.value/${p.income}*100)+'%'); obPlanUpdate('${key}')">
    </div>`;
  return `<div class="ob-step"><h2>Your recommended monthly plan</h2>
    <p class="lead">Based on your monthly income of <b>${NGN(p.income)}</b>${OB.data.supports.length?' and the people you support':''}, we recommend keeping flexible lifestyle spending below <b>${NGN(p.lifestyle)}</b> this month${OB.data.varies?'. Since your income varies, we planned around a typical month — consider using your lowest recent income as the base':''}. This is a starting point, not a rule — drag any slider to make it yours.</p>
    <div class="card">${rows.map(slider).join('')}
      <div class="plan-row"><b>Unallocated</b><b class="num" id="pv_unalloc" style="color:${p.unalloc<0?'var(--neg)':'var(--pos)'}">${NGN(p.unalloc)}</b></div></div>
    <div class="notice info" style="margin-top:14px"><svg data-lucide="info"></svg><span>We don’t force a 50/30/20 rule. Your plan follows your real income, responsibilities and goals — and you can change it any time.</span></div></div>`;
}
function obPlanUpdate(key){
  const p=OB.data.plan;
  $('#pv_'+key).textContent = NGN(p[key]);
  $('#pp_'+key).textContent = '· '+pct(p[key],p.income)+'%';
  const un = p.income - p.essentials - p.support - p.lifestyle - p.buffer - p.goals - p.savings;
  const el=$('#pv_unalloc'); el.textContent = NGN(un); el.style.color = un<0?'var(--neg)':'var(--pos)';
}
function finishOnboarding(){
  const p=OB.data.plan||obPlan(); const d=OB.data;
  S = demoState();
  S.user.name = pendingName || 'David Adeyemi';
  S.user.firstName = (pendingName||'David').split(' ')[0];
  S.user.income = d.income; S.user.payday = d.payday;
  S.user.incomeType = d.incomeTypes[0]||'Salary'; S.user.strictness = d.strictness; S.user.priorities = d.priorities;
  // Rebuild budget from the accepted plan
  S.budget = [
    {id:uid(), name:'Feeding', planned:d.essentials.Feeding||30000, locked:true, paused:false, note:''},
    {id:uid(), name:'Transport', planned:d.essentials.Transport||15000, locked:true, paused:false, note:''},
    {id:uid(), name:'Housing', planned:d.essentials['Rent or accommodation']||0, locked:true, paused:false, note:''},
    {id:uid(), name:'Utilities', planned:d.essentials.Electricity||5000, locked:false, paused:false, note:''},
    {id:uid(), name:'Data & Internet', planned:d.essentials['Internet & data']||10000, locked:false, paused:false, note:''},
    {id:uid(), name:'Family Support', planned:p.support||0, locked:true, paused:false, note:''},
    {id:uid(), name:'Giving', planned:d.essentials['Religious giving']||0, locked:false, paused:false, note:''},
    {id:uid(), name:'Entertainment', planned:Math.round(p.lifestyle*0.4), locked:false, paused:false, note:''},
    {id:uid(), name:'Shopping', planned:Math.round(p.lifestyle*0.35), locked:false, paused:false, note:''},
    {id:uid(), name:'Personal Care', planned:Math.round(p.lifestyle*0.25), locked:false, paused:false, note:''},
    {id:uid(), name:'Savings', planned:p.savings, locked:true, paused:false, note:''},
    {id:uid(), name:'Emergency Fund', planned:Math.round(p.goals*0.4), locked:true, paused:false, note:''},
    {id:uid(), name:'Miscellaneous', planned:p.buffer, locked:false, paused:false, note:''},
  ].filter(b=>b.planned>0);
  if(d.goals.length) S.goals = d.goals.map(g=>({id:uid(), name:g.name, target:g.target, saved:0, date:g.date, priority:g.priority, acct:'a1', status:'active', auto:0}));
  S.onboarded=true; save();
  toast('Your plan is saved. Welcome to Villager, '+S.user.firstName+'!','pos');
  bootApp();
}

/* ---------- 6. APP SHELL & NAVIGATION ---------- */
const NAV = [
  {id:'home', label:'Home', icon:'layout-dashboard'},
  {id:'budget', label:'Budget', icon:'wallet'},
  {id:'accounts', label:'Accounts', icon:'landmark'},
  {id:'transactions', label:'Transactions', icon:'arrow-left-right'},
  {id:'goals', label:'Goals', icon:'target'},
  {id:'insights', label:'Insights', icon:'chart-line'},
  {id:'payments', label:'Payments', icon:'send'},
  {id:'marketplace', label:'Marketplace', icon:'store'},
  {id:'profile', label:'Profile & Settings', icon:'settings'},
];
const BOTTOM = ['home','budget','payments','insights','profile'];
let currentView = 'home';
let charts = [];

function bootApp(){
  // migrations for states saved by earlier versions of the prototype
  if(!S.accounts.some(a=>a.bank==='cash')) S.accounts.push({id:'cash', bank:'cash', label:'Cash & outside app', mask:'', type:'Cash', balance:12000, primary:false, hidden:false, minProtect:0, synced:new Date().toISOString()});
  if(!S.monthLogs) S.monthLogs=[];
  $$('.screen').forEach(s=>s.classList.add('hidden'));
  document.documentElement.dataset.theme = S.theme||'light';
  $('#app').classList.add('ready');
  $('#tbAvatar').textContent = (S.user.firstName||'D')[0].toUpperCase();
  $('#sideNav').innerHTML = NAV.map(n=>`<button class="nav-item" data-nav="${n.id}" onclick="navigate('${n.id}')"><svg data-lucide="${n.icon}"></svg><span class="nav-label">${n.label}</span></button>`).join('');
  $('#bottomNav').innerHTML = BOTTOM.map(id=>{const n=NAV.find(x=>x.id===id);return `<button class="bnav-item" data-nav="${id}" onclick="navigate('${id}')"><svg data-lucide="${n.icon}"></svg>${id==='profile'?'Profile':n.label}</button>`;}).join('')
    .replace('data-nav="profile"','data-nav="profile" '); // keep as-is
  $('#notifDot').style.display = S.notifRead ? 'none' : 'block';
  navigate('home');
}
function navigate(view){
  currentView = view;
  charts.forEach(c=>c.destroy()); charts=[];
  closeDropdowns();
  $$('[data-nav]').forEach(b=>b.classList.toggle('active', b.dataset.nav===view));
  const n = NAV.find(x=>x.id===view);
  $('#tbTitle').textContent = view==='profile' ? 'Profile & Settings' : n.label;
  $('#tbSub').textContent = view==='home' ? todayStr() : '';
  const host = $('#viewHost');
  host.style.animation='none'; host.offsetHeight; host.style.animation='';
  host.innerHTML = VIEWS[view]();
  icons();
  if(view==='insights') drawInsightCharts();
  if(view==='home') drawHomeGauge();
  if(view==='transactions') renderTxList();
  window.scrollTo({top:0});
}
function toggleTheme(){
  S.theme = (S.theme==='dark')?'light':'dark';
  document.documentElement.dataset.theme = S.theme; save();
}
function toggleNotifs(e){
  e.stopPropagation();
  const p=$('#notifPanel');
  if(p.innerHTML){ p.innerHTML=''; return; }
  S.notifRead = true; save(); $('#notifDot').style.display='none';
  const toneColor={pos:'var(--pos)',warn:'var(--warn)',neg:'var(--neg)',info:'var(--info)'};
  p.innerHTML = `<div class="dropdown notif-panel" onclick="event.stopPropagation()">
    <div class="spread" style="padding:13px 15px;border-bottom:1px solid var(--border)"><b style="font-size:14px">Notifications</b>
      <button class="link" style="background:none;font-size:12px;color:var(--green-700);font-weight:600" onclick="openNotifSettings()">Settings</button></div>
    ${S.notifications.map(n=>`<div class="notif-item"><svg data-lucide="${n.icon}" style="width:17px;height:17px;flex-shrink:0;margin-top:2px;color:${toneColor[n.tone]}"></svg>
      <div><div class="t">${n.title}</div><p>${n.body}</p><div class="time">${rel(n.time)}</div></div></div>`).join('')}</div>`;
  icons();
}
function openNotifSettings(){
  closeDropdowns();
  const t=(k,label,sub)=>`<div class="set-row"><div class="grow">${label}${sub?`<span class="sub">${sub}</span>`:''}</div><label class="switch"><input type="checkbox" ${S.settings[k]?'checked':''} onchange="S.settings.${k}=this.checked;save();toast('Notification preferences updated.')"><span class="track"></span></label></div>`;
  openModal(`<div class="settings-group" style="margin-bottom:14px">
      ${t('push','Push notifications')}${t('email','Email alerts')}${t('weekly','Weekly summary','Every Sunday evening')}${t('monthly','Monthly financial report','First day of each month')}${t('quiet','Quiet hours','No alerts between 10pm – 7am')}</div>
    <div class="field"><label>Budget warning threshold — alert me when a category reaches <b id="thVal">${S.settings.threshold}%</b></label>
      <input type="range" min="50" max="100" step="5" value="${S.settings.threshold}" style="--fill:${(S.settings.threshold-50)*2}%"
        oninput="S.settings.threshold=Number(this.value); $('#thVal').textContent=this.value+'%'; this.style.setProperty('--fill',(this.value-50)*2+'%')" onchange="save()"></div>`,
    {title:'Notification settings'});
}

/* ---------- 7. VIEW BUILDERS ---------- */
const acctDot = a => { const b=bankOf(a.bank); return `<span class="bank-dot" style="background:${b.color}">${b.name[0]}</span>`; };
const maskAmt = v => S.hideBalance ? '₦••••••' : NGN(v);

const VIEWS = {};

/* ===== HOME ===== */
VIEWS.home = () => {
  const total = totalBal();
  const budgetSpent = spentTotal(), budgetPlanned = plannedTotal();
  const alerts = smartAlerts().slice(0,4);
  const txns = S.transactions.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
  const score = healthScore();
  return `
  <div class="stack" style="gap:16px">
    <div class="spread"><h2 style="font-size:21px;letter-spacing:-.02em">${greeting()}, ${esc(S.user.firstName)} 👋🏾</h2></div>

    <div class="card hero-balance">
      <div class="spread" style="position:relative">
        <div><div class="label">Total available balance · ${visAccts().length} accounts</div>
          <div class="amount">${maskAmt(total)}</div>
          <div class="tiny" style="color:#A9C6B7">Payday in ${paydayDays()} days · ${daysLeftInMonth()} days left this month</div></div>
        <button class="icon-btn eye" onclick="S.hideBalance=!S.hideBalance;save();navigate('home')" aria-label="${S.hideBalance?'Show':'Hide'} balance"><svg data-lucide="${S.hideBalance?'eye':'eye-off'}"></svg></button>
      </div>
      <div class="row" style="margin-top:16px;gap:9px;flex-wrap:wrap;position:relative">
        ${visAccts().map(a=>`<button class="mini-acct" onclick="navigate('accounts')">${acctDot(a)}<span style="text-align:left"><b>${maskAmt(a.balance)}</b><br>${bankOf(a.bank).name} · ${pct(a.balance,total)}%</span></button>`).join('')}
      </div>
    </div>

    <div>
      <div class="card-title" style="margin-bottom:10px">Quick actions</div>
      <div class="qa-grid">
        ${[['send','Send money',"openSendMoney()"],['plus-circle','Add expense','openAddExpense()'],['banknote','Add income','openAddIncome()'],['calendar-check','Record month','openMonthLog()'],['arrow-left-right','Move money','openMoveMoney()'],['wallet','Edit budget',"navigate('budget')"],['target','Add goal','openGoalForm()'],['landmark','Connect account','openConnectBank()'],['chart-line','View insights',"navigate('insights')"]].map(([i,l,fn])=>`<button class="qa" onclick="${fn}"><span class="icon-tile"><svg data-lucide="${i}"></svg></span>${l}</button>`).join('')}
      </div>
    </div>

    <div class="home-grid">
      <div class="stack" style="gap:16px">
        <div class="card">
          <div class="card-title">This month’s cash flow</div>
          <div class="stat-tiles">
            <div class="stat-tile"><div class="k">Income</div><div class="v pos-t">${maskAmt(monthIncome())}</div></div>
            <div class="stat-tile"><div class="k">Spending</div><div class="v">${maskAmt(monthSpend())}</div></div>
            <div class="stat-tile"><div class="k">Saved</div><div class="v" style="color:var(--green-700)">${maskAmt(monthSaved())}</div></div>
            <div class="stat-tile"><div class="k">Remaining</div><div class="v">${maskAmt(monthIncome()-monthSpend()-monthSaved())}</div></div>
          </div>
          <hr class="divider">
          <div class="spread" style="margin-bottom:8px"><b style="font-size:14px">Budget status</b><span class="small muted">${daysLeftInMonth()} days left</span></div>
          <div class="progress" style="height:10px"><div class="bar ${pct(budgetSpent,budgetPlanned)>90?'neg':pct(budgetSpent,budgetPlanned)>75?'warn':''}" style="width:${Math.min(100,pct(budgetSpent,budgetPlanned))}%"></div></div>
          <div class="spread small muted" style="margin-top:7px"><span>${NGN(budgetSpent)} spent of ${NGN(budgetPlanned)} (${pct(budgetSpent,budgetPlanned)}%)</span><span>${NGN(Math.max(0,budgetPlanned-budgetSpent))} remaining</span></div>
          <button class="btn btn-secondary btn-sm" style="margin-top:12px" onclick="navigate('budget')">Open budget</button>
        </div>

        <div class="card">
          <div class="card-title">Recent transactions <button class="link" onclick="navigate('transactions')">See all</button></div>
          ${txns.map(txnRow).join('')}
        </div>
      </div>

      <div class="stack" style="gap:16px">
        <div class="card">
          <div class="card-title">Financial health</div>
          <div class="gauge-wrap">
            <div class="gauge" role="img" aria-label="Financial health score ${score} out of 100">
              <svg width="118" height="118" viewBox="0 0 118 118">
                <circle cx="59" cy="59" r="50" fill="none" stroke="var(--green-50)" stroke-width="11"/>
                <circle id="gaugeArc" cx="59" cy="59" r="50" fill="none" stroke="${score>=70?'var(--pos)':score>=45?'var(--warn)':'var(--neg)'}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${2*Math.PI*50}" stroke-dashoffset="${2*Math.PI*50}"/>
              </svg>
              <div class="val"><b>${score}</b><span>out of 100</span></div>
            </div>
            <div style="flex:1">
              ${[['Savings consistency','pos','Strong'],['Budget adherence', pct(budgetSpent,budgetPlanned)>85?'warn':'pos', pct(budgetSpent,budgetPlanned)>85?'Watch':'Good'],['Bill payments','pos','On time'],['Emergency fund','warn','Growing'],['Debt burden','pos','Low'],['Spending stability','warn','Variable']].map(([f,t,l])=>`<div class="factor"><span class="muted">${f}</span><span class="badge ${t}">${l}</span></div>`).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Smart alerts</div>
          <div class="stack" style="gap:9px">${alerts.map(a=>`<div class="alert-card ${a.tone}"><svg data-lucide="${a.icon}"></svg><span>${a.text}</span></div>`).join('')}</div>
        </div>

        <div class="card sts-card">
          <div class="label" style="font-size:12px;color:#A9C6B7;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Safe to spend today 😌</div>
          <div class="amount">${maskAmt(safeToSpend())}</div>
          <p class="tiny" style="color:#B9D2C5;position:relative;max-width:290px">Based on your balance, upcoming bills, savings commitments and the ${daysLeftInMonth()} days left before payday.</p>
        </div>
      </div>
    </div>
  </div>`;
};
function drawHomeGauge(){
  const arc=$('#gaugeArc'); if(!arc) return;
  const score=healthScore(); const c=2*Math.PI*50;
  requestAnimationFrame(()=>{ arc.style.transition='stroke-dashoffset 1s cubic-bezier(.2,.8,.3,1)'; arc.style.strokeDashoffset = c*(1-score/100); });
}
function paydayDays(){
  const d=new Date(); let p=new Date(d.getFullYear(), d.getMonth(), S.user.payday);
  if(p<=d) p=new Date(d.getFullYear(), d.getMonth()+1, S.user.payday);
  return Math.ceil((p-d)/864e5);
}
function smartAlerts(){
  const list=[];
  S.budget.forEach(b=>{
    const p=pct(spentIn(b.name), b.planned);
    if(p>=S.settings.threshold && !b.paused) list.push({tone:p>=100?'neg':'warn', icon:'alert-triangle', text:`You have used ${p}% of your ${b.name.toLowerCase()} budget.`});
  });
  list.push({tone:'warn', icon:'bus', text:'Your transport spending is 18% higher than last month.'});
  const rent=S.goals.find(g=>g.name.toLowerCase().includes('rent'));
  if(rent) list.push({tone:'pos', icon:'target', text:`You are on track to reach your rent goal — ${pct(rent.saved,rent.target)}% saved.`});
  list.push({tone:'info', icon:'coins', text:`You can safely spend ${NGN(safeToSpend())} today without affecting your essential bills.`});
  list.push({tone:'warn', icon:'trending-down', text:`At your current pace you may run short about 5 days before payday.`});
  return list;
}
function txnRow(t){
  const m=catMeta(t.cat); const a=S.accounts.find(x=>x.id===t.acct);
  return `<button class="txn" style="width:100%;text-align:left;border-radius:12px" onclick="openTxn('${t.id}')">
    <span class="icon-tile" style="background:${m.color}18;color:${m.color}"><svg data-lucide="${m.icon}"></svg></span>
    <span class="info"><b>${esc(t.merchant)}</b><span>${t.cat} · ${a?bankOf(a.bank).name:'—'} · ${dayKey(t.date)}, ${timeOf(t.date)}</span></span>
    <span class="amt ${t.amount>0?'pos-t':''}">${t.amount>0?'+':''}${S.hideBalance?'₦••••':NGN(Math.abs(t.amount)).replace('₦', t.amount>0?'₦':'−₦')}<span>${t.status}${t.recurring?' · recurring':''}</span></span>
  </button>`;
}

/* ===== BUDGET ===== */
VIEWS.budget = () => {
  const planned=plannedTotal(), spent=spentTotal();
  const recs = [
    {tone:'gold', b:'Protect your emergency fund', p:`Reduce entertainment by ₦5,000 this month to keep your ${NGN(25000)} emergency-fund contribution safe.`},
    {tone:'warn', b:'Transport may be set too low', p:'You have averaged ₦41,300 on transport over the last three months — about ₦6,000 above plan.'},
    {tone:'pos', b:'Unused money in shopping', p:`You have ${NGN(Math.max(0,20000-spentIn('Shopping')))} unused in shopping. Move it to rent savings?`},
    {tone:'', b:'Irregular income tip', p:'If your income varies, budget from your lowest recent monthly income and treat the rest as bonus.'},
  ];
  return `<div class="stack" style="gap:16px">
    <div class="grid2" style="align-items:stretch">
      <div class="card sts-card"><div style="position:relative">
        <div style="font-size:12px;color:#A9C6B7;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Safe to spend today 😌</div>
        <div class="amount">${maskAmt(safeToSpend())}</div>
        <p class="tiny" style="color:#B9D2C5">Considers your current balance, upcoming bills, savings commitments, the ${daysLeftInMonth()} days remaining, and your recent spending pattern.</p></div>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:8px">July overview</div>
        <div class="stat-tiles" style="grid-template-columns:1fr 1fr">
          <div class="stat-tile"><div class="k">Monthly income</div><div class="v">${maskAmt(S.user.income)}</div></div>
          <div class="stat-tile"><div class="k">Planned spending</div><div class="v">${maskAmt(planned)}</div></div>
          <div class="stat-tile"><div class="k">Actual so far</div><div class="v ${spent>planned?'neg-t':''}">${maskAmt(spent)}</div></div>
          <div class="stat-tile"><div class="k">Days remaining</div><div class="v">${daysLeftInMonth()}</div></div>
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:12px" onclick="openMonthLog()"><svg data-lucide="calendar-check"></svg> Record income & outside expenses</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Categories
        <span class="row" style="gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="openMoveMoney()"><svg data-lucide="arrow-left-right"></svg> Move money</button>
          <button class="btn btn-primary btn-sm" onclick="openCatForm()"><svg data-lucide="plus"></svg> New category</button>
        </span>
      </div>
      ${S.budget.map(catRow).join('')}
      <hr class="divider">
      <div class="row" style="flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="toast('Unused balances will carry into August.','pos')"><svg data-lucide="corner-down-right"></svg> Carry unused money forward</button>
        <button class="btn btn-ghost btn-sm" onclick="confirmModal('Reset budget?','This resets every category’s plan for July back to your saved monthly plan. Your transactions are not affected.','Reset budget',()=>{toast('Budget reset to your saved plan.','pos');navigate('budget')},true)"><svg data-lucide="rotate-ccw"></svg> Reset budget</button>
      </div>
    </div>

    <div class="card"><div class="card-title">Recommendations</div>
      <div class="grid2">${recs.map(r=>`<div class="insight-card ${r.tone}"><b>${r.b}</b><p>${r.p}</p></div>`).join('')}</div>
    </div>
  </div>`;
};
function catRow(b){
  const spent=spentIn(b.name), rem=b.planned-spent, p=pct(spent,b.planned), m=catMeta(b.name);
  const status = b.paused?['neutral','Paused']:p>=100?['neg','Over budget']:p>=S.settings.threshold?['warn','Near limit']:['pos','On track'];
  return `<div class="cat-row" style="${b.paused?'opacity:.55':''}">
    <div class="cat-head">
      <span class="icon-tile" style="background:${m.color}18;color:${m.color}"><svg data-lucide="${m.icon}"></svg></span>
      <div class="nm"><b>${b.name} ${b.locked?'<svg data-lucide="lock" style="width:12px;height:12px;vertical-align:-1px;color:var(--faint)"></svg>':''}</b>
        <span>${b.note?esc(b.note)+' · ':''}${NGN(spent)} of ${NGN(b.planned)}</span></div>
      <div class="fig"><b>${rem>=0?NGN(rem):'−'+NGN(-rem)}</b>${rem>=0?'left':'over'}</div>
      <span class="badge ${status[0]}">${status[1]}</span>
      <button class="icon-btn" style="width:34px;height:34px" data-dd onclick="catMenu(event,'${b.id}')" aria-label="Category options"><svg data-lucide="ellipsis-vertical"></svg></button>
    </div>
    <div class="progress"><div class="bar ${p>=100?'neg':p>=S.settings.threshold?'warn':''}" style="width:${Math.min(100,p)}%"></div></div>
  </div>`;
}
function catMenu(e,id){
  e.stopPropagation(); closeDropdowns();
  const b=S.budget.find(x=>x.id===id);
  const dd=document.createElement('div'); dd.className='dropdown'; dd.style.position='fixed';
  const r=e.currentTarget.getBoundingClientRect();
  dd.style.top=(r.bottom+6)+'px'; dd.style.right=(window.innerWidth-r.right)+'px';
  dd.innerHTML = `
    <button class="dd-item" onclick="editCat('${id}')"><svg data-lucide="sliders-horizontal"></svg> Adjust amount</button>
    <button class="dd-item" onclick="openMoveMoney('${id}')"><svg data-lucide="arrow-left-right"></svg> Move money</button>
    <button class="dd-item" onclick="promptNote('${id}')"><svg data-lucide="sticky-note"></svg> Add note</button>
    <button class="dd-item" onclick="closeDropdowns();toast('Weekly limit of ${NGN(Math.round(b.planned/4/100)*100)} set for ${b.name}.','pos')"><svg data-lucide="calendar-range"></svg> Set weekly limit</button>
    <button class="dd-item" onclick="closeDropdowns();toast('You’ll be alerted at ${S.settings.threshold}% of ${b.name}.','pos')"><svg data-lucide="bell-plus"></svg> Set alert</button>
    <button class="dd-item" onclick="toggleCatFlag('${id}','locked')"><svg data-lucide="${b.locked?'lock-open':'lock'}"></svg> ${b.locked?'Unlock':'Lock as essential'}</button>
    <button class="dd-item ${b.paused?'':'danger'}" onclick="toggleCatFlag('${id}','paused')"><svg data-lucide="${b.paused?'play':'pause'}"></svg> ${b.paused?'Resume category':'Pause category'}</button>`;
  document.body.appendChild(dd); icons();
}
function toggleCatFlag(id,flag){
  const b=S.budget.find(x=>x.id===id); b[flag]=!b[flag]; save(); closeDropdowns(); navigate('budget');
  toast(`${b.name} ${flag==='locked'?(b.locked?'locked as essential':'unlocked'):(b.paused?'paused':'resumed')}.`,'pos');
}
function promptNote(id){
  closeDropdowns(); const b=S.budget.find(x=>x.id===id);
  openModal(`<div class="field"><label>Note for ${b.name}</label><textarea class="input" id="catNote" rows="3" placeholder="e.g. includes Mum’s monthly transfer">${esc(b.note)}</textarea></div>
    <button class="btn btn-primary btn-block" onclick="S.budget.find(x=>x.id==='${id}').note=$('#catNote').value;save();closeModal();navigate('budget');toast('Note saved.')">Save note</button>`,{title:'Add note'});
}
function editCat(id){
  closeDropdowns(); const b=S.budget.find(x=>x.id===id); const spent=spentIn(b.name);
  const max=Math.max(b.planned*2, 100000);
  openModal(`
    <div class="row" style="gap:12px;margin-bottom:14px"><span class="icon-tile" style="background:${catMeta(b.name).color}18;color:${catMeta(b.name).color}"><svg data-lucide="${catMeta(b.name).icon}"></svg></span>
      <div><b>${b.name}</b><div class="small muted">${NGN(spent)} spent so far this month</div></div></div>
    <div class="field"><label>Planned amount — <b id="ecVal">${NGN(b.planned)}</b></label>
      <input type="range" min="0" max="${max}" step="500" value="${b.planned}" style="--fill:${pct(b.planned,max)}%" id="ecSlider"
        oninput="$('#ecVal').textContent=NGN(this.value); this.style.setProperty('--fill', Math.round(this.value/${max}*100)+'%')"></div>
    <div class="field"><label>Or type an exact amount</label><div class="input-wrap"><span class="prefix">₦</span>
      <input class="input has-prefix" type="number" value="${b.planned}" oninput="$('#ecSlider').value=this.value;$('#ecVal').textContent=NGN(this.value||0)" id="ecInput"></div></div>
    ${b.locked?'<div class="notice warn"><svg data-lucide="lock"></svg><span>This category is locked as essential. Reducing it below current spending is blocked to protect your plan.</span></div>':''}
    <button class="btn btn-primary btn-block" style="margin-top:14px" onclick="saveCat('${id}')">Save changes</button>`,
    {title:'Adjust '+b.name});
}
function saveCat(id){
  const b=S.budget.find(x=>x.id===id);
  const v=Number($('#ecInput').value||$('#ecSlider').value)||0;
  if(b.locked && v < spentIn(b.name)){ toast('Locked category can’t go below what’s already spent.','warn'); return; }
  b.planned=v; save(); closeModal(); navigate('budget'); toast(`${b.name} plan updated to ${NGN(v)}.`,'pos');
}
function openCatForm(){
  openModal(`<div class="field"><label>Category name</label><input class="input" id="ncName" placeholder="e.g. Gym, Fuel, Baby items"></div>
    <div class="field"><label>Monthly amount</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" id="ncAmt" type="number" placeholder="10,000"></div></div>
    <button class="btn btn-primary btn-block" onclick="addCat()">Create category</button>`,{title:'New budget category'});
}
function addCat(){
  const name=$('#ncName').value.trim(), amt=Number($('#ncAmt').value)||0;
  if(!name||!amt){ toast('Give the category a name and amount.','warn'); return; }
  S.budget.push({id:uid(), name, planned:amt, locked:false, paused:false, note:''});
  save(); closeModal(); navigate('budget'); toast(`“${name}” added to your budget.`,'pos');
}
function openMoveMoney(fromId){
  const opts = S.budget.map(b=>`<option value="${b.id}" ${b.id===fromId?'selected':''}>${b.name} — ${NGN(Math.max(0,b.planned-spentIn(b.name)))} free</option>`).join('');
  openModal(`<p class="small muted" style="margin-bottom:14px">Move planned money between categories. Totals stay balanced — nothing leaves your plan.</p>
    <div class="grid2"><div class="field"><label>From</label><select class="select" id="mmFrom">${opts}</select></div>
    <div class="field"><label>To</label><select class="select" id="mmTo">${S.budget.map(b=>`<option value="${b.id}">${b.name}</option>`).join('')}</select></div></div>
    <div class="field"><label>Amount</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" type="number" id="mmAmt" placeholder="5,000"></div></div>
    <button class="btn btn-primary btn-block" onclick="doMoveMoney()">Move money</button>`,{title:'Move money'});
}
function doMoveMoney(){
  const from=S.budget.find(b=>b.id===$('#mmFrom').value), to=S.budget.find(b=>b.id===$('#mmTo').value), amt=Number($('#mmAmt').value)||0;
  if(!amt){ toast('Enter an amount.','warn'); return; }
  if(from.id===to.id){ toast('Pick two different categories.','warn'); return; }
  const free=from.planned-spentIn(from.name);
  if(amt>free){ toast(`Only ${NGN(Math.max(0,free))} is free in ${from.name}.`,'neg'); return; }
  from.planned-=amt; to.planned+=amt; save(); closeModal();
  if(currentView==='budget') navigate('budget');
  toast(`Moved ${NGN(amt)} from ${from.name} to ${to.name}.`,'pos');
}
function openAddExpense(){
  openModal(`<div class="field"><label>Merchant / description</label><input class="input" id="aeName" placeholder="e.g. Suya spot, Keke fare"></div>
    <div class="grid2"><div class="field"><label>Amount</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" id="aeAmt" type="number" placeholder="2,500"></div></div>
    <div class="field"><label>Category</label><select class="select" id="aeCat">${S.budget.map(b=>`<option>${b.name}</option>`).join('')}</select></div></div>
    <div class="field"><label>Paid from</label><select class="select" id="aeAcct">${S.accounts.map(a=>`<option value="${a.id}">${bankOf(a.bank).name}${a.mask?' — **** '+a.mask:''}</option>`).join('')}</select></div>
    <button class="btn btn-primary btn-block" onclick="addExpense()">Add expense</button>`,{title:'Add expense'});
}
function addExpense(){
  const name=$('#aeName').value.trim(), amt=Number($('#aeAmt').value)||0;
  if(!name||!amt){ toast('Enter a description and amount.','warn'); return; }
  const acct=S.accounts.find(a=>a.id===$('#aeAcct').value); acct.balance=Math.max(0,acct.balance-amt);
  S.transactions.unshift({id:uid(), merchant:name, amount:-amt, cat:$('#aeCat').value, acct:acct.id, date:new Date().toISOString(), type:'expense', status:'Completed', note:'Added manually', recurring:false, excluded:false});
  save(); closeModal(); navigate(currentView); toast(`Expense of ${NGN(amt)} recorded under ${$('#aeCat')?.value||'budget'}.`,'pos');
}
/* --- Manual income --- */
function openAddIncome(){
  openModal(`<p class="small muted" style="margin-bottom:14px">Record money you made that didn’t sync automatically — cash jobs, market sales, gifts, side hustles.</p>
    <div class="field"><label>Source / description</label><input class="input" id="aiName" placeholder="e.g. Weekend catering job, POS commission"></div>
    <div class="grid2"><div class="field"><label>Amount</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" id="aiAmt" type="number" placeholder="45,000"></div></div>
    <div class="field"><label>Type</label><select class="select" id="aiCat"><option>Business Income</option><option>Salary</option><option>Transfers</option><option>Miscellaneous</option></select></div></div>
    <div class="field"><label>Where did it land?</label><select class="select" id="aiAcct">${S.accounts.map(a=>`<option value="${a.id}" ${a.bank==='cash'?'selected':''}>${bankOf(a.bank).name}${a.mask?' — **** '+a.mask:''}</option>`).join('')}</select></div>
    <button class="btn btn-primary btn-block" onclick="addIncome()">Record income</button>`,{title:'Add income'});
}
function addIncome(){
  const name=$('#aiName').value.trim(), amt=Number($('#aiAmt').value)||0;
  if(!name||!amt){ toast('Enter a source and amount.','warn'); return; }
  const acct=S.accounts.find(a=>a.id===$('#aiAcct').value); acct.balance+=amt;
  S.transactions.unshift({id:uid(), merchant:name, amount:amt, cat:$('#aiCat').value, acct:acct.id, date:new Date().toISOString(), type:'income', status:'Completed', note:'Recorded manually', recurring:false, excluded:false});
  save(); closeModal(); navigate(currentView); toast(`${NGN(amt)} income recorded. Your cash flow is updated.`,'pos');
}
/* --- Monthly record: income made + expenses outside the app --- */
let ML=null;
function openMonthLog(){
  ML={income:'', src:'', dest:'skip', rows:[{desc:'', amt:'', cat:'Feeding'}]};
  openModal(monthLogHtml(), {title:'Record '+new Date().toLocaleDateString('en-NG',{month:'long'}), wide:true, label:'Monthly record'});
}
function monthLogHtml(){
  const month=new Date().toLocaleDateString('en-NG',{month:'long'});
  const catOpts=sel=>S.budget.map(b=>`<option ${b.name===sel?'selected':''}>${b.name}</option>`).join('');
  return `
  <p class="small muted" style="margin-bottom:14px">Once a month, tell Villager what happened off the app — how much you actually made in ${month}, and any cash or outside spending. It all flows into your budget, cash flow and insights.</p>
  <b style="font-size:14px;display:block;margin-bottom:8px">1 · Income you made this month</b>
  <div class="grid2"><div class="field"><label>Total made in ${month}</label><div class="input-wrap"><span class="prefix">₦</span>
      <input class="input has-prefix" type="number" placeholder="350,000" value="${ML.income}" oninput="ML.income=this.value"></div></div>
    <div class="field"><label>Source (optional)</label><input class="input" placeholder="e.g. Salary + shop sales" value="${esc(ML.src)}" oninput="ML.src=this.value"></div></div>
  <div class="field"><label>How should we record it?</label>
    <select class="select" onchange="ML.dest=this.value">
      <option value="skip" ${ML.dest==='skip'?'selected':''}>Just note it — my salary already synced from the bank</option>
      ${S.accounts.map(a=>`<option value="${a.id}" ${ML.dest===a.id?'selected':''}>Add it as income into ${bankOf(a.bank).name}${a.mask?' (**** '+a.mask+')':''}</option>`).join('')}
    </select><p class="hint">Choose “just note it” if the money already appears in your synced transactions, so it isn’t counted twice.</p></div>
  <b style="font-size:14px;display:block;margin:6px 0 8px">2 · Expenses outside the app</b>
  ${ML.rows.map((r,i)=>`
    <div class="split-row" style="flex-wrap:wrap">
      <input class="input" style="flex:2;min-width:140px" placeholder="e.g. Market run, fuel, vigilante levy" value="${esc(r.desc)}" oninput="ML.rows[${i}].desc=this.value" aria-label="Expense ${i+1} description">
      <div class="amt-in input-wrap"><span class="prefix" style="left:10px">₦</span><input class="input has-prefix" type="number" placeholder="5,000" value="${r.amt}" oninput="ML.rows[${i}].amt=this.value" aria-label="Expense ${i+1} amount"></div>
      <select class="select" style="width:auto;min-height:40px;padding:8px 30px 8px 10px;font-size:13px" onchange="ML.rows[${i}].cat=this.value" aria-label="Expense ${i+1} category">${catOpts(r.cat)}</select>
      ${ML.rows.length>1?`<button class="icon-btn" style="width:34px;height:34px" onclick="ML.rows.splice(${i},1);setModal(monthLogHtml())" aria-label="Remove expense ${i+1}"><svg data-lucide="trash-2"></svg></button>`:''}
    </div>`).join('')}
  <button class="btn btn-ghost btn-sm" onclick="ML.rows.push({desc:'',amt:'',cat:'Miscellaneous'});setModal(monthLogHtml())"><svg data-lucide="plus"></svg> Add another expense</button>
  <div class="notice info" style="margin:12px 0"><svg data-lucide="info"></svg><span>Outside expenses are recorded against your <b>Cash & outside app</b> account and count toward the matching budget categories.</span></div>
  <button class="btn btn-primary btn-block" onclick="saveMonthLog()">Save ${month} record</button>
  ${S.monthLogs.length?`<p class="tiny muted" style="margin-top:10px">Previous records: ${S.monthLogs.map(l=>`${l.month} — ${NGN(l.income)} in, ${NGN(l.spent)} out`).join(' · ')}</p>`:''}`;
}
function saveMonthLog(){
  const income=Number(ML.income)||0;
  const rows=ML.rows.map(r=>({desc:r.desc.trim(), amt:Number(r.amt)||0, cat:r.cat})).filter(r=>r.desc&&r.amt>0);
  if(!income && !rows.length){ toast('Add an income figure or at least one expense.','warn'); return; }
  const cash=S.accounts.find(a=>a.bank==='cash');
  const month=new Date().toLocaleDateString('en-NG',{month:'long', year:'numeric'});
  if(income && ML.dest!=='skip'){
    const acct=S.accounts.find(a=>a.id===ML.dest)||cash; acct.balance+=income;
    S.transactions.unshift({id:uid(), merchant:ML.src.trim()||('Income for '+month), amount:income, cat:'Business Income', acct:acct.id, date:new Date().toISOString(), type:'income', status:'Completed', note:'Monthly record', recurring:false, excluded:false});
  }
  rows.forEach(r=>{
    cash.balance=Math.max(0, cash.balance-r.amt);
    S.transactions.unshift({id:uid(), merchant:r.desc, amount:-r.amt, cat:r.cat, acct:cash.id, date:new Date().toISOString(), type:'expense', status:'Completed', note:'Outside app · monthly record', recurring:false, excluded:false});
  });
  const spent=rows.reduce((s,r)=>s+r.amt,0);
  S.monthLogs.unshift({month, income, spent, count:rows.length});
  save(); closeModal(); navigate(currentView);
  toast(`${month} recorded — ${income?NGN(income)+' income':''}${income&&spent?' and ':''}${spent?NGN(spent)+' in outside expenses':''} added.`,'pos',4200);
}

/* ===== ACCOUNTS ===== */
VIEWS.accounts = () => {
  const total=totalBal();
  return `<div class="stack" style="gap:16px">
    <div class="card">
      <div class="spread"><div><div class="small muted" style="font-weight:600">Total balance across ${visAccts().length} accounts</div>
        <div style="font-size:28px;font-weight:800;font-family:var(--font-display);letter-spacing:-.02em">${maskAmt(total)}</div>
        <div class="small muted">Available after minimum-balance protection: <b>${maskAmt(total - visAccts().reduce((s,a)=>s+a.minProtect,0))}</b></div></div>
        <button class="btn btn-primary" onclick="openConnectBank()"><svg data-lucide="plus"></svg> Connect account</button></div>
    </div>
    <div class="stack" style="gap:10px">
      ${S.accounts.map(a=>{
        const b=bankOf(a.bank); const stale=a.bank!=='cash' && (Date.now()-new Date(a.synced))/36e5 > 12;
        return `<div class="acct-card" style="${a.hidden?'opacity:.5':''}">
          <span class="bank-dot" style="background:${b.color}">${b.name[0]}</span>
          <div class="mid"><b>${esc(a.label)}</b> ${a.primary?'<span class="badge gold">Primary</span>':''} ${a.hidden?'<span class="badge neutral">Hidden</span>':''}
            <div class="meta"><span>${a.type}${a.mask?' · **** '+a.mask:''}</span><span>${pct(a.balance,total)}% of funds</span>
              <span class="${stale?'neg-t':''}">${stale?'Sync failed · ':''}Synced ${rel(a.synced)}</span>
              ${a.minProtect?`<span>Protected: ${NGN(a.minProtect)}</span>`:''}</div></div>
          <div class="bal"><b>${maskAmt(a.balance)}</b>
            <span class="badge ${stale?'warn':'pos'}" style="margin-top:4px">${stale?'Needs refresh':'Healthy'}</span></div>
          <button class="icon-btn" style="width:34px;height:34px" data-dd onclick="acctMenu(event,'${a.id}')" aria-label="Account options"><svg data-lucide="ellipsis-vertical"></svg></button>
        </div>`;}).join('')}
    </div>
    <div class="notice neutral"><svg data-lucide="info"></svg><span>Account aggregation in a live product would depend on supported financial-data providers and regulatory approvals. Balances shown here are demo data.</span></div>
  </div>`;
};
function acctMenu(e,id){
  e.stopPropagation(); closeDropdowns();
  const a=S.accounts.find(x=>x.id===id);
  const dd=document.createElement('div'); dd.className='dropdown'; dd.style.position='fixed';
  const r=e.currentTarget.getBoundingClientRect();
  dd.style.top=(r.bottom+6)+'px'; dd.style.right=(window.innerWidth-r.right)+'px';
  dd.innerHTML=`
    <button class="dd-item" onclick="acctDetails('${id}')"><svg data-lucide="scan-eye"></svg> View details</button>
    <button class="dd-item" onclick="refreshAcct('${id}')"><svg data-lucide="refresh-ccw"></svg> Refresh transactions</button>
    <button class="dd-item" onclick="renameAcct('${id}')"><svg data-lucide="pencil"></svg> Rename</button>
    <button class="dd-item" onclick="setPrimary('${id}')"><svg data-lucide="star"></svg> ${a.primary?'Primary account ✓':'Make primary / preferred'}</button>
    <button class="dd-item" onclick="setMinProtect('${id}')"><svg data-lucide="shield"></svg> Minimum balance protection</button>
    <button class="dd-item" onclick="S.accounts.find(x=>x.id==='${id}').hidden=!${a.hidden};save();closeDropdowns();navigate('accounts');toast('Account ${a.hidden?'shown':'hidden'} from totals.')"><svg data-lucide="${a.hidden?'eye':'eye-off'}"></svg> ${a.hidden?'Show account':'Hide account'}</button>
    <button class="dd-item danger" onclick="closeDropdowns();confirmModal('Disconnect ${bankOf(a.bank).name}?','This removes the account and stops transaction syncing. Your history stays until you delete it.','Disconnect',()=>{S.accounts=S.accounts.filter(x=>x.id!=='${id}');save();navigate('accounts');toast('${bankOf(a.bank).name} disconnected.','pos')},true)"><svg data-lucide="unlink"></svg> Disconnect</button>`;
  document.body.appendChild(dd); icons();
}
function acctDetails(id){
  closeDropdowns(); const a=S.accounts.find(x=>x.id===id); const b=bankOf(a.bank);
  const txns=S.transactions.filter(t=>t.acct===id).slice(0,5);
  openModal(`<div class="row" style="gap:13px;margin-bottom:14px"><span class="bank-dot" style="background:${b.color};width:46px;height:46px;border-radius:14px;font-size:16px">${b.name[0]}</span>
    <div><b style="font-size:16px">${esc(a.label)}</b><div class="small muted">${a.type}${a.mask?' · **** '+a.mask:''} · ${a.bank==='cash'?'Updated by you':'Synced '+rel(a.synced)}</div></div></div>
    <div class="stat-tiles" style="grid-template-columns:1fr 1fr;margin-bottom:14px">
      <div class="stat-tile"><div class="k">Balance</div><div class="v">${NGN(a.balance)}</div></div>
      <div class="stat-tile"><div class="k">Protected minimum</div><div class="v">${NGN(a.minProtect)}</div></div></div>
    <b style="font-size:13.5px">Recent activity</b>
    ${txns.map(txnRow).join('') || '<p class="small muted" style="padding:10px 0">No transactions on this account yet.</p>'}`,
    {title:'Account details'});
}
function refreshAcct(id){
  closeDropdowns(); const a=S.accounts.find(x=>x.id===id);
  toast('Refreshing '+bankOf(a.bank).name+'…','info',1400);
  setTimeout(()=>{ a.synced=new Date().toISOString(); save(); navigate('accounts'); toast('Transactions up to date.','pos'); },1500);
}
function renameAcct(id){
  closeDropdowns(); const a=S.accounts.find(x=>x.id===id);
  openModal(`<div class="field"><label>Account nickname</label><input class="input" id="rnVal" value="${esc(a.label)}"></div>
    <button class="btn btn-primary btn-block" onclick="S.accounts.find(x=>x.id==='${id}').label=$('#rnVal').value||'${esc(a.label)}';save();closeModal();navigate('accounts');toast('Account renamed.')">Save</button>`,{title:'Rename account'});
}
function setPrimary(id){
  closeDropdowns(); S.accounts.forEach(a=>a.primary=a.id===id); save(); navigate('accounts');
  toast(bankOf(S.accounts.find(a=>a.id===id).bank).name+' is now your preferred spending account.','pos');
}
function setMinProtect(id){
  closeDropdowns(); const a=S.accounts.find(x=>x.id===id);
  openModal(`<p class="small muted" style="margin-bottom:12px">Villager will never suggest payments that take this account below the protected amount.</p>
    <div class="field"><label>Protected minimum balance</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" type="number" id="mpVal" value="${a.minProtect}"></div></div>
    <button class="btn btn-primary btn-block" onclick="S.accounts.find(x=>x.id==='${id}').minProtect=Number($('#mpVal').value)||0;save();closeModal();navigate('accounts');toast('Minimum balance protection updated.')">Save protection</button>`,{title:'Minimum balance protection'});
}

/* ===== BANK CONNECT FLOW (simulated) ===== */
let connectBank=null;
function openConnectBank(){
  openModal(bankPickHtml(''), {title:'Connect an account'});
}
function bankPickHtml(q){
  const list=BANKS.filter(b=>b.name.toLowerCase().includes(q.toLowerCase()));
  return `<div class="field"><div class="input-wrap"><input class="input" placeholder="Search your bank or wallet…" value="${esc(q)}" oninput="setModal(bankPickHtml(this.value),{title:'Connect an account'}); const i=$('.modal input'); i.focus(); i.setSelectionRange(i.value.length,i.value.length)"></div></div>
    <div class="bank-pick">${list.map(b=>`<button class="bank-opt" onclick="bankConsent('${b.id}')"><span class="bank-dot" style="background:${b.color}">${b.name[0]}</span>${b.name}<span class="badge neutral" style="margin-left:auto">${b.type}</span></button>`).join('') || '<div class="empty"><h4>No match</h4><p>We couldn’t find that institution. Availability depends on supported data providers.</p></div>'}</div>
    <div class="notice neutral" style="margin-top:12px"><svg data-lucide="info"></svg><span>Simulated connection — no real bank login happens in this prototype. Availability of each institution depends on supported financial-data providers and regulatory approvals.</span></div>`;
}
function bankConsent(id){
  connectBank=bankOf(id);
  setModal(`<div class="row" style="gap:12px;margin-bottom:14px"><span class="bank-dot" style="background:${connectBank.color};width:46px;height:46px;border-radius:14px;font-size:16px">${connectBank.name[0]}</span>
    <div><b style="font-size:16px">${connectBank.name}</b><div class="small muted">Read-only connection</div></div></div>
    <p class="small" style="margin-bottom:12px">Villager is asking for permission to:</p>
    <div class="stack" style="gap:8px;margin-bottom:16px">
      ${['View your account name and number','View balances','View transaction history (last 12 months)'].map(t=>`<div class="row" style="gap:9px;font-size:13.5px"><svg data-lucide="check" style="width:15px;height:15px;color:var(--pos)"></svg>${t}</div>`).join('')}
      <div class="row" style="gap:9px;font-size:13.5px;color:var(--muted)"><svg data-lucide="x" style="width:15px;height:15px;color:var(--neg)"></svg>Villager cannot move money without your explicit authorisation</div></div>
    <button class="btn btn-primary btn-block" onclick="bankLogin()">I consent — continue</button>
    <button class="btn btn-ghost btn-block" onclick="setModal(bankPickHtml(''),{title:'Connect an account'})">Choose a different bank</button>`,
    {title:'Your consent'});
}
function bankLogin(){
  setModal(`<p class="small muted" style="margin-bottom:14px">Sign in with your ${connectBank.name} internet-banking details. <b>(Prototype: anything works.)</b></p>
    <div class="field"><label>Username or account number</label><input class="input" id="blUser" placeholder="e.g. 0123456789"></div>
    <div class="field"><label>Password</label><input class="input" type="password" id="blPass" placeholder="••••••••"></div>
    <button class="btn btn-primary btn-block" onclick="bankOtp()">Sign in securely</button>`,
    {title:connectBank.name+' login'});
}
function bankOtp(){
  setModal(`<p class="small muted" style="text-align:center">Enter the OTP sent by ${connectBank.name}. (Any 4 digits.)</p>
    <div class="pin-row">${[0,1,2,3].map(i=>`<input class="pin-box" maxlength="1" inputmode="numeric" aria-label="OTP digit ${i+1}" oninput="this.value=this.value.replace(/\\D/g,''); if(this.value&&this.nextElementSibling)this.nextElementSibling.focus()">`).join('')}</div>
    <button class="btn btn-primary btn-block" onclick="bankConnecting()">Verify</button>`,{title:'Bank OTP'});
}
function bankConnecting(){
  const fail = Math.random()<0.25; // occasionally show the error state
  setModal(`<div style="text-align:center;padding:22px 0"><div class="spinner"></div>
    <b style="display:block;margin-top:16px">Connecting to ${connectBank.name}…</b>
    <p class="small muted" id="connMsg">Establishing a secure session</p></div>`, {title:'Connecting'});
  const msgs=['Establishing a secure session','Verifying your consent','Fetching balances','Syncing transactions…'];
  let i=0; const int=setInterval(()=>{ i++; const el=$('#connMsg'); if(el&&msgs[i]) el.textContent=msgs[i]; },800);
  setTimeout(()=>{
    clearInterval(int);
    if(fail){
      setModal(`<div style="text-align:center;padding:10px 0"><div class="success-anim fail-anim"><svg data-lucide="x"></svg></div>
        <b style="font-size:17px">Connection failed</b>
        <p class="small muted" style="margin:6px 0 18px">${connectBank.name} did not respond in time. This happens — your details were not stored.</p>
        <button class="btn btn-primary btn-block" onclick="bankConnecting()">Retry connection</button>
        <button class="btn btn-ghost btn-block" onclick="closeModal()">Try later</button></div>`,{title:'Connection error'});
      icons(); return;
    }
    const mask=String(1000+Math.floor(Math.random()*9000));
    const bal=Math.round((5000+Math.random()*90000)/500)*500;
    S.accounts.push({id:uid(), bank:connectBank.id, label:connectBank.name, mask, type:connectBank.type==='Wallet'?'Wallet':'Current account', balance:bal, primary:false, hidden:false, minProtect:0, synced:new Date().toISOString()});
    save();
    setModal(`<div style="text-align:center;padding:10px 0"><div class="success-anim"><svg data-lucide="check"></svg></div>
      <b style="font-size:17px">${connectBank.name} connected</b>
      <p class="small muted" style="margin:6px 0 18px">**** ${mask} · ${NGN(bal)} synced. Recent transactions were imported and categorised automatically.</p>
      <button class="btn btn-primary btn-block" onclick="closeModal(); navigate('accounts')">Done</button></div>`,{title:'Success'});
    icons();
  }, 3300);
}

/* ===== TRANSACTIONS ===== */
const TXF = {q:'', cat:'all', acct:'all', type:'all', rec:'all'};
VIEWS.transactions = () => {
  Object.assign(TXF,{q:'',cat:'all',acct:'all',type:'all',rec:'all'});
  return `<div class="stack" style="gap:14px">
    <div class="card" style="padding:14px">
      <div class="filter-bar">
        <div class="input-wrap"><input class="input" placeholder="Search merchant, note or amount…" aria-label="Search transactions" oninput="TXF.q=this.value; renderTxList()"></div>
        <select class="select" aria-label="Filter by category" onchange="TXF.cat=this.value; renderTxList()"><option value="all">All categories</option>${[...new Set(S.transactions.map(t=>t.cat))].sort().map(c=>`<option>${c}</option>`).join('')}</select>
        <select class="select" aria-label="Filter by account" onchange="TXF.acct=this.value; renderTxList()"><option value="all">All accounts</option>${S.accounts.map(a=>`<option value="${a.id}">${bankOf(a.bank).name}</option>`).join('')}</select>
        <select class="select" aria-label="Filter by type" onchange="TXF.type=this.value; renderTxList()"><option value="all">Income & expenses</option><option value="income">Income</option><option value="expense">Expenses</option><option value="transfer">Transfers</option></select>
        <select class="select" aria-label="Filter recurring" onchange="TXF.rec=this.value; renderTxList()"><option value="all">Any frequency</option><option value="rec">Recurring only</option><option value="once">One-off only</option></select>
      </div>
    </div>
    <div class="card" id="txList"></div>
  </div>`;
};
function txFiltered(){
  return S.transactions.filter(t=>{
    if(TXF.q && !(t.merchant+' '+t.note+' '+Math.abs(t.amount)).toLowerCase().includes(TXF.q.toLowerCase())) return false;
    if(TXF.cat!=='all' && t.cat!==TXF.cat) return false;
    if(TXF.acct!=='all' && t.acct!==TXF.acct) return false;
    if(TXF.type!=='all' && t.type!==TXF.type) return false;
    if(TXF.rec==='rec' && !t.recurring) return false;
    if(TXF.rec==='once' && t.recurring) return false;
    return true;
  }).sort((a,b)=>b.date.localeCompare(a.date));
}
function renderTxList(){
  const el=$('#txList'); if(!el) return;
  const list=txFiltered();
  if(!list.length){
    el.innerHTML=`<div class="empty"><span class="icon-tile"><svg data-lucide="search-x"></svg></span>
      <h4>No transactions match</h4><p>Try clearing a filter, changing the search, or connecting another account so more activity can sync in.</p>
      <div class="row"><button class="btn btn-primary btn-sm" onclick="navigate('transactions')">Clear filters</button>
      <button class="btn btn-secondary btn-sm" onclick="openConnectBank()">Connect account</button></div></div>`;
    icons(); return;
  }
  let html='', lastDay='';
  list.forEach(t=>{ const d=dayKey(t.date); if(d!==lastDay){ html+=`<div class="date-head">${d}</div>`; lastDay=d; } html+=txnRow(t); });
  el.innerHTML=html; icons();
}
function openTxn(id){
  const t=S.transactions.find(x=>x.id===id); if(!t) return;
  const a=S.accounts.find(x=>x.id===t.acct); const m=catMeta(t.cat);
  openModal(`
    <div class="row" style="gap:13px;margin-bottom:6px"><span class="icon-tile" style="background:${m.color}18;color:${m.color};width:48px;height:48px"><svg data-lucide="${m.icon}"></svg></span>
      <div style="flex:1"><b style="font-size:16px">${esc(t.merchant)}</b><div class="small muted">${dayKey(t.date)}, ${timeOf(t.date)} · ${a?bankOf(a.bank).name+' **** '+a.mask:'—'}</div></div>
      <b class="num ${t.amount>0?'pos-t':''}" style="font-size:18px">${t.amount>0?'+':'−'}${NGN(Math.abs(t.amount))}</b></div>
    <div class="row" style="gap:7px;flex-wrap:wrap;margin-bottom:14px">
      <span class="badge pos">${t.status}</span><span class="badge neutral">${t.type}</span>
      ${t.recurring?'<span class="badge info">Recurring</span>':''}${t.excluded?'<span class="badge warn">Excluded from budget</span>':''}</div>
    <div class="field"><label>Category</label><select class="select" onchange="S.transactions.find(x=>x.id==='${id}').cat=this.value;save();toast('Moved to '+this.value+'.');">${Object.keys(CAT_META).map(c=>`<option ${t.cat===c?'selected':''}>${c}</option>`).join('')}</select></div>
    <div class="field"><label>Note</label><input class="input" value="${esc(t.note)}" placeholder="Add a note…" onchange="S.transactions.find(x=>x.id==='${id}').note=this.value;save();toast('Note saved.')"></div>
    <div class="grid2" style="gap:9px">
      <button class="btn btn-secondary btn-sm" onclick="txnSplit('${id}')"><svg data-lucide="split"></svg> Split categories</button>
      <button class="btn btn-secondary btn-sm" onclick="txnToggle('${id}','recurring')"><svg data-lucide="repeat"></svg> ${t.recurring?'Unmark recurring':'Mark recurring'}</button>
      <button class="btn btn-secondary btn-sm" onclick="txnMarkTransfer('${id}')"><svg data-lucide="arrow-left-right"></svg> ${t.type==='transfer'?'Marked as transfer ✓':'Mark as transfer'}</button>
      <button class="btn btn-secondary btn-sm" onclick="txnToggle('${id}','excluded')"><svg data-lucide="eye-off"></svg> ${t.excluded?'Include in budget':'Exclude from budget'}</button>
      <button class="btn btn-secondary btn-sm" onclick="toast('Receipt placeholder attached to this transaction.','pos')"><svg data-lucide="paperclip"></svg> Add receipt</button>
      <button class="btn btn-secondary btn-sm" style="color:var(--neg)" onclick="closeModal();toast('Flagged. In a live product our team and your bank would review it.','warn')"><svg data-lucide="flag"></svg> Flag as incorrect</button>
    </div>`, {title:'Transaction'});
}
function txnToggle(id,key){
  const t=S.transactions.find(x=>x.id===id); t[key]=!t[key]; save(); openTxn(id);
  toast(key==='recurring'?(t.recurring?'Marked as recurring.':'No longer recurring.'):(t.excluded?'Excluded from budget totals.':'Included in budget totals.'),'pos');
}
function txnMarkTransfer(id){
  const t=S.transactions.find(x=>x.id===id); t.type='transfer'; save(); openTxn(id); toast('Marked as a transfer between your own accounts.','pos');
}
function txnSplit(id){
  const t=S.transactions.find(x=>x.id===id); const half=Math.round(Math.abs(t.amount)/2);
  openModal(`<p class="small muted" style="margin-bottom:12px">Split <b>${esc(t.merchant)}</b> (${NGN(Math.abs(t.amount))}) across two categories.</p>
    <div class="grid2"><div class="field"><label>Category A</label><select class="select" id="spCatA">${S.budget.map(b=>`<option ${b.name===t.cat?'selected':''}>${b.name}</option>`).join('')}</select></div>
      <div class="field"><label>Amount A</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" id="spAmtA" type="number" value="${half}"></div></div></div>
    <div class="grid2"><div class="field"><label>Category B</label><select class="select" id="spCatB">${S.budget.map(b=>`<option>${b.name}</option>`).join('')}</select></div>
      <div class="field"><label>Amount B</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" id="spAmtB" type="number" value="${Math.abs(t.amount)-half}"></div></div></div>
    <button class="btn btn-primary btn-block" onclick="doSplit('${id}')">Save split</button>`,{title:'Split transaction'});
}
function doSplit(id){
  const t=S.transactions.find(x=>x.id===id);
  const a=Number($('#spAmtA').value)||0, b=Number($('#spAmtB').value)||0;
  if(a+b!==Math.abs(t.amount)){ toast(`The two parts must add up to ${NGN(Math.abs(t.amount))}.`,'warn'); return; }
  const catA=$('#spCatA').value, catB=$('#spCatB').value;
  t.cat=catA; t.amount=-a; t.note=(t.note?t.note+' · ':'')+'Split 1 of 2';
  S.transactions.unshift({...t, id:uid(), cat:catB, amount:-b, note:'Split 2 of 2', date:t.date});
  save(); closeModal(); if(currentView==='transactions'){ navigate('transactions'); renderTxList(); }
  toast(`Split into ${catA} (${NGN(a)}) and ${catB} (${NGN(b)}).`,'pos');
}

/* ===== PAYMENTS ===== */
let payTab='send';
VIEWS.payments = () => `
  <div class="stack" style="gap:16px">
    <div class="seg" role="tablist">
      ${[['send','Send money'],['bills','Bills & airtime'],['sched','Scheduled & requests']].map(([id,l])=>`<button role="tab" aria-selected="${payTab===id}" class="${payTab===id?'active':''}" onclick="payTab='${id}';navigate('payments')">${l}</button>`).join('')}
    </div>
    ${payTab==='send'?paySendHtml():payTab==='bills'?payBillsHtml():paySchedHtml()}
    <div class="notice neutral"><svg data-lucide="shield-alert"></svg><span><b>Prototype note:</b> no real funds move here. Smart multi-account payment is a product concept — a live version would depend on secure payment partners, bank APIs, Open Banking infrastructure, explicit user authorisation, and regulatory approval.</span></div>
  </div>`;
function paySendHtml(){
  return `<div class="home-grid" style="align-items:start">
    <div class="card">
      <div class="card-title">Send money</div>
      <div class="field"><label>Recipient bank</label><select class="select" id="pmBank">${BANKS.map(b=>`<option value="${b.id}">${b.name}</option>`).join('')}</select></div>
      <div class="field"><label>Account number</label><input class="input" id="pmNum" inputmode="numeric" maxlength="10" placeholder="10-digit account number" oninput="validateRecipient(this.value)"><p class="hint" id="pmName"></p></div>
      <div class="field"><label>Amount</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" id="pmAmt" type="number" placeholder="20,000"></div></div>
      <div class="field"><label>Description (optional)</label><input class="input" id="pmDesc" placeholder="e.g. July support"></div>
      <button class="btn btn-primary btn-block" onclick="startFunding()">Continue</button>
    </div>
    <div class="card">
      <div class="card-title">Beneficiaries & recent</div>
      ${S.beneficiaries.length ? S.beneficiaries.map(r=>{const b=bankOf(r.bank);return `<button class="txn" style="width:100%;text-align:left" onclick="pickBeneficiary('${r.id}')">
        <span class="bank-dot" style="background:${b.color}">${b.name[0]}</span>
        <span class="info"><b>${esc(r.name)}</b><span>${b.name} · ${r.number.slice(0,3)}•••${r.number.slice(-3)}</span></span>
        <svg data-lucide="chevron-right" style="width:16px;height:16px;color:var(--faint)"></svg></button>`;}).join('')
      : `<div class="empty"><span class="icon-tile"><svg data-lucide="users"></svg></span><h4>No beneficiaries yet</h4><p>People you pay often will appear here so you can send again in two taps.</p><button class="btn btn-primary btn-sm" onclick="toast('Send a payment and save the recipient to create one.','info')">How it works</button></div>`}
    </div>
  </div>`;
}
function pickBeneficiary(id){
  const r=S.beneficiaries.find(x=>x.id===id);
  $('#pmBank').value=r.bank; $('#pmNum').value=r.number; validateRecipient(r.number, r.name);
  $('#pmAmt').focus(); toast('Recipient filled in.','pos',1800);
}
function validateRecipient(v, forcedName){
  const el=$('#pmName'); if(!el) return;
  if(v.length>=10){ el.innerHTML=`<span class="pos-t" style="font-weight:600">✓ ${forcedName||'CHIAMAKA O. NWOSU'}</span> — verified`; }
  else el.textContent = v.length? 'Enter all 10 digits to verify the account name.' : '';
}
/* --- Smart multi-account funding --- */
let PAY=null;
function startFunding(){
  const amt=Number($('#pmAmt').value)||0;
  const num=$('#pmNum').value;
  if(num.length<10){ toast('Enter a valid 10-digit account number.','warn'); return; }
  if(amt<100){ toast('Enter an amount of at least ₦100.','warn'); return; }
  const usable=visAccts().map(a=>({...a, free:Math.max(0,a.balance-a.minProtect)}));
  const totalFree=usable.reduce((s,a)=>s+a.free,0);
  if(amt>totalFree){ toast(`That’s more than your ${NGN(totalFree)} available across accounts (after protected minimums).`,'neg'); return; }
  PAY={amt, fee:Math.min(50, Math.ceil(amt/10000)*10+10), to:($('#pmName').textContent.replace('✓','').split('—')[0]||'Recipient').trim(), bank:bankOf($('#pmBank').value).name, num, desc:$('#pmDesc').value, mode:'auto', split:{}};
  autoSplit();
  openModal(fundingHtml(), {title:'How should we fund this?', wide:true});
}
function usableAccts(){ return visAccts().filter(a=>a.bank!=='cash').map(a=>({id:a.id, bank:a.bank, mask:a.mask, balance:a.balance, minProtect:a.minProtect, free:Math.max(0,a.balance-a.minProtect)})); }
function autoSplit(){
  // Greedy: primary/preferred first, then largest free balances.
  let need=PAY.amt; PAY.split={};
  const order=usableAccts().sort((a,b)=> (S.accounts.find(x=>x.id===b.id).primary?1:0)-(S.accounts.find(x=>x.id===a.id).primary?1:0) || b.free-a.free);
  order.forEach(a=>{ if(need<=0) return; const take=Math.min(a.free,need); if(take>0){ PAY.split[a.id]=take; need-=take; } });
}
function singleSplit(id){ PAY.split={}; PAY.split[id]=PAY.amt; }
function evenSplit(){
  const accts=usableAccts().filter(a=>a.free>0); PAY.split={};
  let remaining=PAY.amt;
  const share=Math.floor(PAY.amt/accts.length/50)*50;
  accts.forEach((a,i)=>{ let take=Math.min(a.free, i===accts.length-1?remaining:share); PAY.split[a.id]=take; remaining-=take; });
  // top up if percentage split couldn't cover
  if(remaining>0) accts.forEach(a=>{ if(remaining<=0)return; const extra=Math.min(a.free-PAY.split[a.id], remaining); PAY.split[a.id]+=extra; remaining-=extra; });
}
function fundingHtml(){
  const covered=Object.values(PAY.split).reduce((s,v)=>s+v,0);
  const ok=covered===PAY.amt;
  return `
  <p class="small muted" style="margin-bottom:12px">Sending <b>${NGN(PAY.amt)}</b> to <b>${esc(PAY.to)}</b> · ${PAY.bank}. Pick a funding method — you can edit any amount before confirming.</p>
  <div class="seg" style="margin-bottom:14px">
    ${[['auto','Split automatically'],['single','Use one account'],['even','Split evenly'],['manual','Set amounts manually']].map(([m,l])=>`<button class="${PAY.mode===m?'active':''}" onclick="setFundMode('${m}')">${l}</button>`).join('')}
  </div>
  ${usableAccts().map(a=>{
    const b=bankOf(a.bank); const take=PAY.split[a.id]||0; const after=a.balance-take;
    return `<div class="split-row ${take?'':'off'}">
      <span class="bank-dot" style="background:${b.color}">${b.name[0]}</span>
      <div style="flex:1;min-width:0"><b style="font-size:13.5px">${b.name} — **** ${a.mask}</b>
        <div class="tiny muted">Balance ${NGN(a.balance)}${a.minProtect?` · ${NGN(a.minProtect)} protected`:''} → after: <b class="${after<a.minProtect?'neg-t':''}">${NGN(after)}</b></div></div>
      <div class="amt-in input-wrap"><span class="prefix" style="left:10px">₦</span>
        <input class="input has-prefix" type="number" min="0" max="${a.free}" value="${take}" aria-label="Amount from ${b.name}"
          oninput="PAY.mode='manual'; PAY.split['${a.id}']=Math.min(Number(this.value)||0, ${a.free}); updateFundSummary()"></div>
    </div>`;}).join('')}
  <div class="receipt" style="margin-top:6px" id="fundSummary">${fundSummaryHtml()}</div>
  <button class="btn btn-primary btn-block" style="margin-top:14px" id="fundNext" ${ok?'':'disabled'} onclick="payPin()">Continue to PIN</button>`;
}
function fundSummaryHtml(){
  const covered=Object.values(PAY.split).reduce((s,v)=>s+v,0);
  const diff=PAY.amt-covered;
  return `<div class="r-row"><span>Total required</span><b>${NGN(PAY.amt)}</b></div>
    <div class="r-row"><span>Covered by your split</span><b class="${diff===0?'pos-t':'warn-t'}">${NGN(covered)}</b></div>
    ${diff!==0?`<div class="r-row"><span>${diff>0?'Still needed':'Over-allocated'}</span><b class="neg-t">${NGN(Math.abs(diff))}</b></div>`:''}
    <div class="r-row"><span>Estimated fees</span><b>${NGN(PAY.fee)}</b></div>
    <div class="r-row" style="border-top:1px dashed var(--border-2);margin-top:4px;padding-top:8px"><span>Total debit</span><b>${NGN(covered+PAY.fee)}</b></div>`;
}
function updateFundSummary(){
  $('#fundSummary').innerHTML=fundSummaryHtml();
  const covered=Object.values(PAY.split).reduce((s,v)=>s+v,0);
  $('#fundNext').disabled = covered!==PAY.amt;
}
function setFundMode(m){
  PAY.mode=m;
  if(m==='auto') autoSplit();
  if(m==='even') evenSplit();
  if(m==='single'){
    const best=usableAccts().filter(a=>a.free>=PAY.amt)[0];
    if(!best){ toast('No single account can cover this after protected minimums — try a split instead.','warn'); PAY.mode='auto'; autoSplit(); }
    else singleSplit(best.id);
  }
  if(m==='manual'){ /* keep current values */ }
  setModal(fundingHtml(), {title:'How should we fund this?'});
}
function payPin(){
  setModal(`<p class="small muted" style="text-align:center">Enter your 4-digit transaction PIN. (Prototype: any 4 digits.)</p>
    <div class="pin-row">${[0,1,2,3].map(i=>`<input class="pin-box" type="password" maxlength="1" inputmode="numeric" aria-label="PIN digit ${i+1}" oninput="this.value=this.value.replace(/\\D/g,''); if(this.value&&this.nextElementSibling&&this.nextElementSibling.classList.contains('pin-box'))this.nextElementSibling.focus()">`).join('')}</div>
    <button class="btn btn-primary btn-block" onclick="payReview()">Confirm PIN</button>`,{title:'Transaction PIN'});
}
function payReview(){
  const pin=$$('.modal .pin-box').map(b=>b.value).join('');
  if(pin.length<4){ toast('Enter all 4 digits.','warn'); return; }
  setModal(`<div class="receipt">
      <div class="r-row"><span>To</span><b>${esc(PAY.to)}</b></div>
      <div class="r-row"><span>Bank</span><b>${PAY.bank} · ${PAY.num.slice(0,3)}•••${PAY.num.slice(-3)}</b></div>
      ${PAY.desc?`<div class="r-row"><span>Description</span><b>${esc(PAY.desc)}</b></div>`:''}
      <hr class="divider" style="margin:8px 0">
      ${Object.entries(PAY.split).filter(([,v])=>v>0).map(([id,v])=>{const a=S.accounts.find(x=>x.id===id);return `<div class="r-row"><span>From ${bankOf(a.bank).name} **** ${a.mask}</span><b>−${NGN(v)}</b></div>`;}).join('')}
      <div class="r-row"><span>Fees</span><b>−${NGN(PAY.fee)}</b></div>
      <div class="r-row" style="border-top:1px dashed var(--border-2);margin-top:4px;padding-top:8px"><span>Total</span><b>${NGN(PAY.amt+PAY.fee)}</b></div>
    </div>
    <button class="btn btn-primary btn-block" style="margin-top:14px" onclick="payProcess()">Send ${NGN(PAY.amt)}</button>
    <button class="btn btn-ghost btn-block" onclick="setModal(fundingHtml(),{title:'How should we fund this?'})">Edit funding split</button>`,
    {title:'Review payment'});
}
function payProcess(){
  setModal(`<div style="text-align:center;padding:26px 0"><div class="spinner"></div>
    <b style="display:block;margin-top:16px">Processing your payment…</b>
    <p class="small muted">Debiting ${Object.keys(PAY.split).filter(k=>PAY.split[k]>0).length} account(s) · secure simulation</p></div>`,{title:'Processing'});
  setTimeout(()=>{
    if(Math.random()<0.15){ // simulated failure path
      setModal(`<div style="text-align:center;padding:8px 0"><div class="success-anim fail-anim"><svg data-lucide="x"></svg></div>
        <b style="font-size:17px">Payment failed</b>
        <p class="small muted" style="margin:6px 0 16px">The receiving bank timed out. Nothing was debited from your accounts.</p>
        <button class="btn btn-primary btn-block" onclick="payProcess()">Retry payment</button>
        <button class="btn btn-ghost btn-block" onclick="closeModal()">Cancel</button></div>`,{title:'Failed'});
      icons(); return;
    }
    // apply debits
    Object.entries(PAY.split).forEach(([id,v])=>{ if(!v) return; const a=S.accounts.find(x=>x.id===id); a.balance-=v; });
    S.accounts.find(a=>a.primary).balance-=PAY.fee;
    S.transactions.unshift({id:uid(), merchant:'Transfer to '+PAY.to, amount:-(PAY.amt), cat:'Transfers', acct:Object.keys(PAY.split)[0], date:new Date().toISOString(), type:'transfer', status:'Completed', note:PAY.desc||('Smart split across '+Object.values(PAY.split).filter(v=>v>0).length+' accounts'), recurring:false, excluded:false});
    save();
    const ref='VLG-'+Math.random().toString(36).slice(2,8).toUpperCase();
    setModal(`<div style="text-align:center;padding:4px 0 10px"><div class="success-anim"><svg data-lucide="check"></svg></div>
      <b style="font-size:18px">${NGN(PAY.amt)} sent</b>
      <p class="small muted" style="margin-top:4px">to ${esc(PAY.to)} · ${PAY.bank}</p></div>
      <div class="receipt">
        <div class="r-row"><span>Reference</span><b>${ref}</b></div>
        <div class="r-row"><span>Date</span><b>${new Date().toLocaleString('en-NG')}</b></div>
        ${Object.entries(PAY.split).filter(([,v])=>v>0).map(([id,v])=>{const a=S.accounts.find(x=>x.id===id);return `<div class="r-row"><span>${bankOf(a.bank).name} **** ${a.mask}</span><b>−${NGN(v)}</b></div>`;}).join('')}
        <div class="r-row"><span>Fees</span><b>−${NGN(PAY.fee)}</b></div>
        <div class="r-row"><span>Status</span><b class="pos-t">Successful</b></div></div>
      <label class="check-row" style="margin:14px 0"><input type="checkbox" id="saveBenef" checked> Save ${esc(PAY.to.split(' ')[0])} as a beneficiary</label>
      <div class="grid2" style="gap:9px">
        <button class="btn btn-secondary" onclick="toast('Receipt downloaded (simulated).','pos')">Share receipt</button>
        <button class="btn btn-primary" onclick="finishPayment()">Done</button></div>`,{title:'Receipt'});
    icons();
  }, 2600);
}
function finishPayment(){
  if($('#saveBenef')?.checked && !S.beneficiaries.some(b=>b.number===PAY.num)){
    S.beneficiaries.push({id:uid(), name:PAY.to, bank:BANKS.find(b=>b.name===PAY.bank)?.id||'gtb', number:PAY.num}); save();
    toast('Beneficiary saved.','pos');
  }
  closeModal(); navigate(currentView);
}
function openSendMoney(){ payTab='send'; navigate('payments'); }
function payBillsHtml(){
  const tiles=[['smartphone','Airtime'],['wifi','Mobile data'],['zap','Electricity'],['router','Internet bill'],['tv','Cable TV'],['graduation-cap','School payment'],['hand-coins','Request money'],['calendar-clock','Schedule payment'],['repeat','Repeat transfer']];
  return `<div class="card"><div class="card-title">Bills & everyday payments</div>
    <div class="qa-grid" style="grid-template-columns:repeat(auto-fill,minmax(110px,1fr))">
      ${tiles.map(([i,l])=>`<button class="qa" onclick="openBill('${l}')"><span class="icon-tile"><svg data-lucide="${i}"></svg></span>${l}</button>`).join('')}</div></div>`;
}
function openBill(kind){
  const isAirtime=/Airtime|data/i.test(kind);
  openModal(`
    ${kind==='Request money'?`<div class="field"><label>Request from (phone or @tag)</label><input class="input" placeholder="e.g. 0803 555 0192"></div>`:''}
    <div class="field"><label>${isAirtime?'Phone number':kind==='Electricity'?'Meter number':kind==='Cable TV'?'Smartcard number':'Reference / account'}</label><input class="input" placeholder="${isAirtime?'0803 123 4567':'Enter number'}"></div>
    ${kind==='Cable TV'?`<div class="field"><label>Package</label><select class="select"><option>DSTV Compact — ₦12,500</option><option>DSTV Confam — ₦7,400</option><option>GOtv Max — ₦5,700</option></select></div>`:''}
    <div class="field"><label>Amount</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" id="billAmt" type="number" placeholder="${isAirtime?'1,000':'10,000'}"></div></div>
    ${kind==='Schedule payment'||kind==='Repeat transfer'?`<div class="field"><label>Frequency</label><select class="select"><option>Monthly on the 28th</option><option>Weekly on Fridays</option><option>Once, on a chosen date</option></select></div>`:''}
    <div class="field"><label>Pay from</label><select class="select">${S.accounts.map(a=>`<option>${bankOf(a.bank).name} — ${NGN(a.balance)}</option>`).join('')}</select></div>
    <button class="btn btn-primary btn-block" onclick="closeModal();toast('${kind} ${kind==='Request money'?'request sent':'payment simulated successfully'}.','pos')">${kind==='Request money'?'Send request':kind.includes('Schedule')||kind.includes('Repeat')?'Save schedule':'Pay now'}</button>`,
    {title:kind});
}
function paySchedHtml(){
  return `<div class="card"><div class="card-title">Scheduled payments</div>
    ${[['Auto-save → Rent goal','Monthly · 1st',25000],['Transfer to Mum','Monthly · 28th',15000],['DSTV Compact','Monthly · 25th',12500]].map(([n,f,a])=>`
      <div class="txn"><span class="icon-tile" style="background:var(--green-50);color:var(--green-700)"><svg data-lucide="calendar-clock"></svg></span>
      <span class="info"><b>${n}</b><span>${f}</span></span><span class="amt">${NGN(a)}<span>active</span></span></div>`).join('')}
    <button class="btn btn-secondary btn-sm" style="margin-top:12px" onclick="openBill('Schedule payment')"><svg data-lucide="plus"></svg> New schedule</button></div>`;
}

/* ===== GOALS ===== */
VIEWS.goals = () => `
  <div class="stack" style="gap:16px">
    <div class="spread"><div><b style="font-size:16px">Savings goals</b><div class="small muted">${S.goals.filter(g=>g.status==='active').length} active · ${NGN(S.goals.reduce((s,g)=>s+g.saved,0))} saved in total</div></div>
      <button class="btn btn-primary" onclick="openGoalForm()"><svg data-lucide="plus"></svg> New goal</button></div>
    ${S.goals.length?`<div class="goal-grid">${S.goals.map(goalCard).join('')}</div>`:`
      <div class="card"><div class="empty"><span class="icon-tile"><svg data-lucide="target"></svg></span>
        <h4>No savings goals yet</h4><p>A goal turns “I should save” into a number with a date — rent, a laptop, December, anything.</p>
        <div class="row"><button class="btn btn-primary btn-sm" onclick="openGoalForm()">Create a goal</button>
        <button class="btn btn-secondary btn-sm" onclick="askCoach('How much should I save this month?')">Ask the coach</button></div></div></div>`}
  </div>`;
function goalCard(g){
  const p=pct(g.saved,g.target); const a=S.accounts.find(x=>x.id===g.acct);
  const monthsLeft=Math.max(1, Math.round((new Date(g.date)-Date.now())/(30*864e5)));
  const suggest=Math.max(0, Math.ceil((g.target-g.saved)/monthsLeft/500)*500);
  return `<div class="goal-card" style="${g.status==='paused'?'opacity:.6':''}">
    <div class="spread" style="margin-bottom:8px"><b>${esc(g.name)}</b>
      <span class="row" style="gap:6px"><span class="badge ${g.priority==='High'?'gold':'neutral'}">${g.priority}</span>
      <button class="icon-btn" style="width:32px;height:32px" data-dd onclick="goalMenu(event,'${g.id}')" aria-label="Goal options"><svg data-lucide="ellipsis-vertical"></svg></button></span></div>
    <div class="row" style="align-items:baseline;gap:7px"><b class="num" style="font-size:21px">${NGN(g.saved)}</b><span class="small muted">of ${NGN(g.target)}</span></div>
    <div class="progress" style="margin:9px 0"><div class="bar ${p>=100?'gold':''}" style="width:${Math.min(100,p)}%"></div></div>
    <div class="spread small muted"><span>${p}% · ${NGN(Math.max(0,g.target-g.saved))} to go</span><span>by ${new Date(g.date).toLocaleDateString('en-NG',{month:'short',year:'numeric'})}</span></div>
    <div class="small muted" style="margin-top:6px">Suggested: <b>${NGN(suggest)}/month</b>${g.auto?` · auto-saving ${NGN(g.auto)}`:''}${a?` · linked to ${bankOf(a.bank).name}`:''} · <span style="text-transform:capitalize">${g.status}</span></div>
    <div class="row" style="margin-top:12px;gap:8px">
      <button class="btn btn-primary btn-sm" style="flex:1" onclick="goalMoney('${g.id}','add')">Add money</button>
      <button class="btn btn-secondary btn-sm" style="flex:1" onclick="goalMoney('${g.id}','withdraw')">Withdraw</button>
    </div></div>`;
}
function goalMenu(e,id){
  e.stopPropagation(); closeDropdowns();
  const g=S.goals.find(x=>x.id===id);
  const dd=document.createElement('div'); dd.className='dropdown'; dd.style.position='fixed';
  const r=e.currentTarget.getBoundingClientRect();
  dd.style.top=(r.bottom+6)+'px'; dd.style.right=Math.max(10,(window.innerWidth-r.right))+'px';
  dd.innerHTML=`
    <button class="dd-item" onclick="openGoalForm('${id}')"><svg data-lucide="pencil"></svg> Edit goal</button>
    <button class="dd-item" onclick="goalAuto('${id}')"><svg data-lucide="repeat"></svg> Automate contributions</button>
    <button class="dd-item" onclick="closeDropdowns();S.goals.find(x=>x.id==='${id}').target+=50000;save();navigate('goals');toast('Target increased by ₦50,000.','pos')"><svg data-lucide="trending-up"></svg> Increase target ₦50k</button>
    <button class="dd-item" onclick="closeDropdowns();const g=S.goals.find(x=>x.id==='${id}');const d=new Date(g.date);d.setMonth(d.getMonth()+1);g.date=d.toISOString().slice(0,10);save();navigate('goals');toast('Target date extended by one month.','pos')"><svg data-lucide="calendar-plus"></svg> Extend date 1 month</button>
    <button class="dd-item" onclick="closeDropdowns();toast('Progress card copied — share it anywhere.','pos')"><svg data-lucide="share-2"></svg> Share progress</button>
    <button class="dd-item ${g.status==='paused'?'':'danger'}" onclick="closeDropdowns();const g=S.goals.find(x=>x.id==='${id}');g.status=g.status==='paused'?'active':'paused';save();navigate('goals');toast('Goal '+g.status+'.')"><svg data-lucide="${g.status==='paused'?'play':'pause'}"></svg> ${g.status==='paused'?'Resume goal':'Pause goal'}</button>`;
  document.body.appendChild(dd); icons();
}
function goalMoney(id,dir){
  const g=S.goals.find(x=>x.id===id);
  openModal(`<div class="field"><label>Amount to ${dir}</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" type="number" id="gmAmt" placeholder="10,000"></div></div>
    <div class="field"><label>${dir==='add'?'From account':'Send to account'}</label><select class="select" id="gmAcct">${S.accounts.map(a=>`<option value="${a.id}">${bankOf(a.bank).name} — ${NGN(a.balance)}</option>`).join('')}</select></div>
    <button class="btn btn-primary btn-block" onclick="doGoalMoney('${id}','${dir}')">${dir==='add'?'Add to goal':'Withdraw'}</button>`,
    {title:(dir==='add'?'Add money — ':'Withdraw — ')+g.name});
}
function doGoalMoney(id,dir){
  const g=S.goals.find(x=>x.id===id); const amt=Number($('#gmAmt').value)||0;
  const a=S.accounts.find(x=>x.id===$('#gmAcct').value);
  if(!amt){ toast('Enter an amount.','warn'); return; }
  if(dir==='add'){ if(amt>a.balance){ toast('Not enough in that account.','neg'); return; } a.balance-=amt; g.saved+=amt;
    S.transactions.unshift({id:uid(), merchant:'Contribution → '+g.name, amount:-amt, cat:'Savings', acct:a.id, date:new Date().toISOString(), type:'transfer', status:'Completed', note:'', recurring:false, excluded:false}); }
  else { if(amt>g.saved){ toast('That’s more than the goal holds.','neg'); return; } g.saved-=amt; a.balance+=amt; }
  save(); closeModal(); navigate('goals');
  toast(dir==='add'?`${NGN(amt)} added to ${g.name}. ${pct(g.saved,g.target)}% there!`:`${NGN(amt)} withdrawn from ${g.name}.`,'pos');
}
function goalAuto(id){
  closeDropdowns(); const g=S.goals.find(x=>x.id===id);
  openModal(`<div class="field"><label>Auto-save amount (monthly, on payday)</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" type="number" id="gaAmt" value="${g.auto||10000}"></div></div>
    <button class="btn btn-primary btn-block" onclick="S.goals.find(x=>x.id==='${id}').auto=Number($('#gaAmt').value)||0;save();closeModal();navigate('goals');toast('Auto-save set. It will run on the ${S.user.payday}th each month.','pos')">Automate</button>`,
    {title:'Automate '+g.name});
}
function openGoalForm(id){
  const g=id?S.goals.find(x=>x.id===id):null;
  openModal(`
    ${g?'':`<div class="chip-grid" style="margin-bottom:14px">${['Emergency fund','Rent','Laptop','Travel','School fees','Business startup','December expenses'].map(n=>`<button class="chip" onclick="$('#gfName').value='${n}'">${n}</button>`).join('')}</div>`}
    <div class="field"><label>Goal name</label><input class="input" id="gfName" value="${g?esc(g.name):''}" placeholder="e.g. Japa fund, New generator"></div>
    <div class="grid2"><div class="field"><label>Target amount</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" id="gfTarget" type="number" value="${g?g.target:''}" placeholder="300,000"></div></div>
    <div class="field"><label>Target date</label><input class="input" id="gfDate" type="date" value="${g?g.date:'2026-12-31'}"></div></div>
    <div class="grid2"><div class="field"><label>Priority</label><select class="select" id="gfPri">${['High','Medium','Low'].map(p=>`<option ${g&&g.priority===p?'selected':''}>${p}</option>`).join('')}</select></div>
    <div class="field"><label>Linked account</label><select class="select" id="gfAcct">${S.accounts.map(a=>`<option value="${a.id}" ${g&&g.acct===a.id?'selected':''}>${bankOf(a.bank).name}</option>`).join('')}</select></div></div>
    <button class="btn btn-primary btn-block" onclick="saveGoal('${id||''}')">${g?'Save changes':'Create goal'}</button>`,
    {title:g?'Edit goal':'New savings goal'});
}
function saveGoal(id){
  const name=$('#gfName').value.trim(), target=Number($('#gfTarget').value)||0;
  if(!name||!target){ toast('Give the goal a name and target.','warn'); return; }
  if(id){ const g=S.goals.find(x=>x.id===id); Object.assign(g,{name,target,date:$('#gfDate').value,priority:$('#gfPri').value,acct:$('#gfAcct').value}); }
  else S.goals.push({id:uid(), name, target, saved:0, date:$('#gfDate').value, priority:$('#gfPri').value, acct:$('#gfAcct').value, status:'active', auto:0});
  save(); closeModal(); navigate('goals'); toast(id?'Goal updated.':`“${name}” created. Every naira in counts.`,'pos');
}

/* ===== INSIGHTS ===== */
VIEWS.insights = () => {
  const cats=S.budget.map(b=>({name:b.name, v:spentIn(b.name)})).filter(c=>c.v>0).sort((a,b)=>b.v-a.v);
  const insights=[
    {tone:'warn', b:'Transport is up 28% this week', p:'Mostly ride-hailing on Tuesday and Thursday. Weekly danfo budget could save ~₦4,000.'},
    {tone:'', b:'Food peaks Friday–Sunday', p:'Your food spending is usually highest between Friday and Sunday — plan weekend meals ahead.'},
    {tone:'pos', b:'Savings are more consistent', p:'You’ve auto-saved every week this month — better than last month’s 2 of 4 weeks.'},
    {tone:'gold', b:'3 subscriptions renew within 7 days', p:'Netflix (₦5,500), Spotify (₦1,900) and DSTV (₦12,500) — ₦19,900 total.'},
    {tone:'warn', b:'Small transfers add up', p:'You spent ₦18,500 on transfers below ₦2,000 this month.'},
    {tone:'pos', b:'Eating-out opportunity', p:'Reduce eating out by ₦2,500 weekly and you could save about ₦130,000 annually.'},
    {tone:'warn', b:'Pace check', p:`Your current spending pace may leave you with about ₦12,000 before payday on the ${S.user.payday}th.`},
    {tone:'', b:'Family support rose 14%', p:'Driven by Tunde’s school levy — consider a small “levies” buffer next term.'},
  ];
  return `<div class="stack" style="gap:16px">
    <div class="grid2">
      <div class="card"><div class="card-title">Spending vs income trend</div><div class="chart-box"><canvas id="chTrend" role="img" aria-label="Line chart comparing monthly income, spending and savings from February to July"></canvas></div>
        <p class="tiny muted" style="margin-top:8px">Income has stayed near ₦350k–₦400k while spending eased from ₦298k in April to ₦231k so far in July. Savings trended up.</p></div>
      <div class="card"><div class="card-title">Where July’s money went</div><div class="chart-box"><canvas id="chCats" role="img" aria-label="Doughnut chart of spending by category this month"></canvas></div>
        <p class="tiny muted" style="margin-top:8px">Top categories: ${cats.slice(0,3).map(c=>`${c.name} ${NGN(c.v)}`).join(' · ')}.</p></div>
    </div>
    <div class="grid2">
      <div class="card"><div class="card-title">Weekly spending pattern</div><div class="chart-box sm"><canvas id="chWeek" role="img" aria-label="Bar chart of average spending by day of week, highest on Friday and Saturday"></canvas></div>
        <p class="tiny muted" style="margin-top:8px">Fridays and Saturdays are your highest-spending days — mostly food and outings.</p></div>
      <div class="card"><div class="card-title">Quick stats</div>
        <div class="stat-tiles" style="grid-template-columns:1fr 1fr">
          <div class="stat-tile"><div class="k">Most-used account</div><div class="v" style="font-size:14px">OPay wallet</div></div>
          <div class="stat-tile"><div class="k">Most-used merchant</div><div class="v" style="font-size:14px">Chicken Republic</div></div>
          <div class="stat-tile"><div class="k">Subscriptions / month</div><div class="v">${NGN(19900)}</div></div>
          <div class="stat-tile"><div class="k">Family support</div><div class="v">${NGN(spentIn('Family Support'))}</div></div>
          <div class="stat-tile"><div class="k">Highest-spending day</div><div class="v" style="font-size:14px">Sat 12 Jul</div></div>
          <div class="stat-tile"><div class="k">vs last month</div><div class="v pos-t">−8%</div></div>
        </div></div>
    </div>
    <div class="card"><div class="card-title">Personalised insights</div>
      <div class="grid2">${insights.map(i=>`<div class="insight-card ${i.tone}"><b>${i.b}</b><p>${i.p}</p></div>`).join('')}</div></div>
    <div class="card"><div class="card-title">Month-end forecast <button class="link" onclick="openMonthlyReview()">Monthly review</button></div>
      <div class="stat-tiles">
        <div class="stat-tile"><div class="k">Expected month-end balance</div><div class="v">${NGN(96000)}</div></div>
        <div class="stat-tile"><div class="k">Upcoming bills</div><div class="v">${NGN(31900)}</div></div>
        <div class="stat-tile"><div class="k">Expected income</div><div class="v pos-t">${NGN(350000)} on the ${S.user.payday}th</div></div>
        <div class="stat-tile"><div class="k">Savings outcome</div><div class="v" style="color:var(--green-700)">${NGN(monthSaved())} on track</div></div>
      </div>
      <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap">
        <span class="badge warn">Budget risk: Entertainment</span><span class="badge pos">Rent goal: on track</span><span class="badge pos">Emergency fund: on track</span>
      </div></div>
  </div>`;
};
function chartTheme(){
  const dark=document.documentElement.dataset.theme==='dark';
  Chart.defaults.color = dark?'#8FA098':'#69746E';
  Chart.defaults.borderColor = dark?'#26312C':'#E3E7E1';
  Chart.defaults.font.family = "'Inter',sans-serif";
}
function drawInsightCharts(){
  if(!window.Chart) return; chartTheme();
  const months=['Feb','Mar','Apr','May','Jun','Jul'];
  charts.push(new Chart($('#chTrend'),{type:'line',data:{labels:months,datasets:[
    {label:'Income',data:[350,402,350,350,398,402].map(v=>v*1000),borderColor:'#1D9A6C',backgroundColor:'#1D9A6C22',tension:.35,fill:false},
    {label:'Spending',data:[262,281,298,254,269,231].map(v=>v*1000),borderColor:'#C97B0F',tension:.35},
    {label:'Savings',data:[55,70,52,82,90,95].map(v=>v*1000),borderColor:'#0E4A39',borderDash:[5,4],tension:.35}]},
    options:{maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,usePointStyle:true}}},scales:{y:{ticks:{callback:v=>'₦'+v/1000+'k'}}}}}));
  const cats=S.budget.map(b=>({name:b.name,v:spentIn(b.name)})).filter(c=>c.v>0).sort((a,b)=>b.v-a.v).slice(0,7);
  charts.push(new Chart($('#chCats'),{type:'doughnut',data:{labels:cats.map(c=>c.name),datasets:[{data:cats.map(c=>c.v),backgroundColor:cats.map(c=>catMeta(c.name).color),borderWidth:0}]},
    options:{maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'right',labels:{boxWidth:10,usePointStyle:true}}}}}));
  charts.push(new Chart($('#chWeek'),{type:'bar',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{data:[5200,7800,4100,6300,11800,13400,6900],backgroundColor:['#BFE9CE','#BFE9CE','#BFE9CE','#BFE9CE','#FFC53D','#17C964','#BFE9CE'],borderColor:'#123528',borderWidth:2,borderRadius:7}]},
    options:{maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:v=>'₦'+v/1000+'k'}}}}}));
}
function openMonthlyReview(){
  const best=S.budget.map(b=>({b,d:b.planned-spentIn(b.name)})).sort((a,x)=>x.d-a.d)[0];
  const worst=S.budget.map(b=>({b,p:pct(spentIn(b.name),b.planned)})).sort((a,x)=>x.p-a.p)[0];
  openModal(`
    <div class="stat-tiles" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:14px">
      <div class="stat-tile"><div class="k">Income</div><div class="v pos-t">${NGN(monthIncome())}</div></div>
      <div class="stat-tile"><div class="k">Spending</div><div class="v">${NGN(monthSpend())}</div></div>
      <div class="stat-tile"><div class="k">Saved</div><div class="v" style="color:var(--green-700)">${NGN(monthSaved())}</div></div>
    </div>
    <div class="stack" style="gap:9px;margin-bottom:14px">
      <div class="insight-card pos"><b>Best-performing category</b><p>${best.b.name} — ${NGN(Math.max(0,best.d))} under plan. Nice discipline.</p></div>
      <div class="insight-card warn"><b>Highest pressure</b><p>${worst.b.name} at ${worst.p}% of plan. Consider raising it or trimming the habit next month.</p></div>
      <div class="insight-card gold"><b>Financial health</b><p>${healthScore()}/100 — up 4 points from last month. Goals achieved: 1 (June data top-up). Top merchants: Shoprite, Chicken Republic, Bolt. Most-used account: OPay.</p></div>
      <div class="insight-card"><b>For next month</b><p>Raise transport to ₦40,000, keep the ₦25,000 rent auto-save, and set a ₦6,000 weekend food cap to smooth the Friday–Sunday spike.</p></div>
    </div>
    <button class="btn btn-primary btn-block" onclick="closeModal();toast('August plan drafted from these suggestions — review it in Budget.','pos');navigate('budget')">Build next month’s plan</button>`,
    {title:'July in review', wide:true});
}

/* ===== MARKETPLACE ===== */
const PRODUCTS=[
  {id:'p1', name:'Golden Penny Semovita 10kg', price:13500, cat:'Household', icon:'wheat', merch:'Sabo Foods', rating:4.7, days:'1–2 days', alt:'Honeywell Semo 10kg — ₦12,900'},
  {id:'p2', name:'Mama’s Pride Rice 25kg', price:52000, cat:'Household', icon:'package', merch:'Mile 12 Direct', rating:4.8, days:'Same day (Lagos)', alt:'Big Bull 25kg — ₦49,500'},
  {id:'p3', name:'5kg Cooking Gas Refill', price:5800, cat:'Household', icon:'flame', merch:'GasNow', rating:4.5, days:'2 hours', alt:''},
  {id:'p4', name:'Oraimo Power Bank 20,000mAh', price:18900, cat:'Electronics', icon:'battery-charging', merch:'TechPlug NG', rating:4.6, days:'2–3 days', alt:'New Age 20k mAh — ₦15,500'},
  {id:'p5', name:'Ankara Fabric (6 yards)', price:9500, cat:'Fashion', icon:'shirt', merch:'Balogun Textiles', rating:4.4, days:'3–5 days', alt:''},
  {id:'p6', name:'Blender — Binatone 1.5L', price:24500, cat:'Household', icon:'blend', merch:'Kitchen Hub', rating:4.3, days:'2–3 days', alt:'Master Chef 1.5L — ₦19,800'},
  {id:'p7', name:'School sandals (kids)', price:7200, cat:'Family', icon:'footprints', merch:'KiddiesMart', rating:4.5, days:'2–4 days', alt:''},
  {id:'p8', name:'Indomie carton (40 packs)', price:11200, cat:'Household', icon:'soup', merch:'Sabo Foods', rating:4.9, days:'1–2 days', alt:''},
];
let marketQ='', marketCat='All';
VIEWS.marketplace = () => {
  const cats=['All','Household','Electronics','Fashion','Family'];
  const list=PRODUCTS.filter(p=>(marketCat==='All'||p.cat===marketCat)&&p.name.toLowerCase().includes(marketQ.toLowerCase()));
  const shopBudget=S.budget.find(b=>b.name==='Shopping');
  const remaining=shopBudget?Math.max(0,shopBudget.planned-spentIn('Shopping')):0;
  return `<div class="stack" style="gap:16px">
    <div class="card" style="background:linear-gradient(120deg,var(--gold-soft),var(--surface));border-color:var(--gold)">
      <div class="spread" style="flex-wrap:wrap;gap:10px">
        <div><span class="badge gold" style="margin-bottom:6px">Future phase — concept preview</span>
          <b style="display:block;font-size:16px">Shop what’s already in your plan</b>
          <p class="small muted" style="max-width:460px">Buy planned items from trusted merchants without leaving the app. Every product shows its budget impact before you pay. You have <b>${NGN(remaining)}</b> left in Shopping this month.</p></div>
        <button class="btn btn-secondary btn-sm" onclick="openMerchantPortal()">Merchant portal preview</button>
      </div>
    </div>
    <div class="card" style="padding:14px"><div class="filter-bar">
      <div class="input-wrap"><input class="input" placeholder="Search products…" value="${esc(marketQ)}" oninput="marketQ=this.value;navigate('marketplace');$('.filter-bar input').focus()"></div>
      <div class="row" style="gap:7px;flex-wrap:wrap">${cats.map(c=>`<button class="chip ${marketCat===c?'active':''}" style="min-height:34px;padding:6px 13px;font-size:12.5px" onclick="marketCat='${c}';navigate('marketplace')">${c}</button>`).join('')}</div>
      <button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="openCart()"><svg data-lucide="shopping-cart"></svg> Cart (${S.cart.length})</button>
    </div></div>
    <div><div class="card-title" style="margin-bottom:10px">Recommended within your budget</div>
    ${list.length?`<div class="market-grid">${list.map(p=>`
      <div class="product"><div class="ph"><svg data-lucide="${p.icon}"></svg>${p.price<=remaining?'<span class="badge pos" style="position:absolute;top:9px;left:9px">Fits budget</span>':'<span class="badge warn" style="position:absolute;top:9px;left:9px">Over budget</span>'}</div>
        <div class="pd"><b>${p.name}</b>
          <div class="row" style="gap:8px"><span class="rating"><svg data-lucide="star"></svg>${p.rating}</span><span class="badge gold" style="font-size:10px">✓ Trusted merchant</span></div>
          <div class="tiny muted">${p.merch} · ${p.days}${p.alt?`<br>Alt: ${p.alt}`:''}</div>
          <div class="spread" style="margin-top:auto"><span class="price">${NGN(p.price)}</span>
            <span class="row" style="gap:5px"><button class="icon-btn" style="width:32px;height:32px" onclick="toast('Saved for later.','pos')" aria-label="Save for later"><svg data-lucide="bookmark"></svg></button>
            <button class="btn btn-primary btn-sm" onclick="addToCart('${p.id}')">Add</button></span></div></div></div>`).join('')}</div>`
    :`<div class="card"><div class="empty"><span class="icon-tile"><svg data-lucide="package-search"></svg></span><h4>Nothing matches</h4><p>Try another search term or category.</p><button class="btn btn-primary btn-sm" onclick="marketQ='';marketCat='All';navigate('marketplace')">Clear search</button></div></div>`}</div>
    ${S.orders.length?`<div class="card"><div class="card-title">Your orders</div>${S.orders.map(o=>`<div class="txn"><span class="icon-tile" style="background:var(--green-50);color:var(--green-700)"><svg data-lucide="package-check"></svg></span><span class="info"><b>${o.items} item(s) · ${o.merch}</b><span>Arriving ${o.eta} · ${o.status}</span></span><span class="amt">${NGN(o.total)}</span></div>`).join('')}</div>`
    :`<div class="card"><div class="empty"><span class="icon-tile"><svg data-lucide="package"></svg></span><h4>No orders yet</h4><p>Your marketplace orders and delivery status will appear here.</p></div></div>`}
  </div>`;
};
function addToCart(id){ S.cart.push(id); save(); navigate('marketplace'); toast('Added to cart.','pos',1800); }
function openCart(){
  if(!S.cart.length){ openModal(`<div class="empty"><span class="icon-tile"><svg data-lucide="shopping-cart"></svg></span><h4>Your cart is empty</h4><p>Add planned items and we’ll show the budget impact before checkout.</p><button class="btn btn-primary btn-sm" onclick="closeModal()">Browse products</button></div>`,{title:'Cart'}); return; }
  const items=S.cart.map(id=>PRODUCTS.find(p=>p.id===id));
  const total=items.reduce((s,p)=>s+p.price,0), delivery=1500;
  const shop=S.budget.find(b=>b.name==='Shopping');
  const remaining=shop?shop.planned-spentIn('Shopping'):0;
  const within= total+delivery<=remaining;
  openModal(`
    ${items.map((p,i)=>`<div class="txn"><span class="icon-tile" style="background:var(--green-50);color:var(--green-700)"><svg data-lucide="${p.icon}"></svg></span>
      <span class="info"><b>${p.name}</b><span>${p.merch}</span></span><span class="amt">${NGN(p.price)}</span>
      <button class="icon-btn" style="width:32px;height:32px" onclick="S.cart.splice(${i},1);save();closeModal();openCart()" aria-label="Remove"><svg data-lucide="trash-2"></svg></button></div>`).join('')}
    <div class="receipt" style="margin-top:12px">
      <div class="r-row"><span>Products</span><b>${NGN(total)}</b></div>
      <div class="r-row"><span>Delivery</span><b>${NGN(delivery)}</b></div>
      <div class="r-row"><span>Budget category</span><b>Shopping</b></div>
      <div class="r-row"><span>Remaining in Shopping</span><b>${NGN(Math.max(0,remaining))}</b></div>
      <div class="r-row"><span>Effect on savings</span><b>${within?'None':'May reduce this month’s savings'}</b></div>
    </div>
    <div class="notice ${within?'info':'warn'}" style="margin-top:12px"><svg data-lucide="${within?'check-circle-2':'alert-triangle'}"></svg>
      <span>${within?`This purchase fits within your shopping budget and leaves <b>${NGN(remaining-total-delivery)}</b> remaining.`:`This purchase exceeds your shopping budget by <b>${NGN(total+delivery-remaining)}</b>. You can reduce the cart, move money from another category, or continue anyway.`}</span></div>
    <div class="row" style="margin-top:14px;gap:9px;flex-wrap:wrap">
      ${within?'':`<button class="btn btn-secondary" style="flex:1" onclick="closeModal();openMoveMoney()">Move money</button>`}
      <button class="btn btn-primary" style="flex:1" onclick="checkout(${total+delivery})">${within?'Buy now':'Continue anyway'}</button></div>`,
    {title:'Cart & budget impact'});
}
function checkout(total){
  setModal(`<div style="text-align:center;padding:26px 0"><div class="spinner"></div><b style="display:block;margin-top:16px">Placing your order…</b></div>`,{title:'Checkout'});
  setTimeout(()=>{
    const a=S.accounts.find(x=>x.primary); a.balance=Math.max(0,a.balance-total);
    S.transactions.unshift({id:uid(), merchant:'Villager Marketplace order', amount:-total, cat:'Shopping', acct:a.id, date:new Date().toISOString(), type:'expense', status:'Completed', note:S.cart.length+' items', recurring:false, excluded:false});
    S.orders.unshift({items:S.cart.length, merch:PRODUCTS.find(p=>p.id===S.cart[0]).merch, total, eta:'Thu 24 Jul', status:'Preparing'});
    S.cart=[]; save();
    setModal(`<div style="text-align:center;padding:8px 0"><div class="success-anim"><svg data-lucide="check"></svg></div>
      <b style="font-size:17px">Order placed</b><p class="small muted" style="margin:6px 0 16px">${NGN(total)} charged to your primary account (simulated). Track delivery under “Your orders”.</p>
      <button class="btn btn-primary btn-block" onclick="closeModal();navigate('marketplace')">Done</button></div>`,{title:'Success'});
    icons();
  },1800);
}
function openMerchantPortal(){
  openModal(`<span class="badge gold" style="margin-bottom:10px">Coming soon — future phase</span>
    <p class="small muted" style="margin-bottom:14px">A preview of what trusted merchants would see.</p>
    <div class="stat-tiles" style="grid-template-columns:1fr 1fr 1fr">
      <div class="stat-tile"><div class="k">Orders today</div><div class="v">37</div></div>
      <div class="stat-tile"><div class="k">Revenue (July)</div><div class="v">${NGN(2841500)}</div></div>
      <div class="stat-tile"><div class="k">Next payout</div><div class="v">${NGN(412000)}</div></div>
      <div class="stat-tile"><div class="k">Products live</div><div class="v">126</div></div>
      <div class="stat-tile"><div class="k">Low inventory</div><div class="v warn-t">4 items</div></div>
      <div class="stat-tile"><div class="k">Customer rating</div><div class="v">4.7 ★</div></div>
    </div>
    <div class="stack" style="gap:8px;margin-top:12px">
      <div class="insight-card"><b>Deliveries</b><p>12 out for delivery · 3 delayed in Ikeja axis.</p></div>
      <div class="insight-card gold"><b>Promotion slot</b><p>“Fits your budget” placement available for household staples next week.</p></div></div>`,
    {title:'Merchant portal', wide:true});
}

/* ===== PROFILE & SETTINGS ===== */
VIEWS.profile = () => {
  const set=(icon,label,sub,fn)=>`<button class="set-row" onclick="${fn}"><svg class="lead" data-lucide="${icon}"></svg><span class="grow">${label}${sub?`<span class="sub">${sub}</span>`:''}</span><svg class="chev" data-lucide="chevron-right"></svg></button>`;
  const tog=(icon,label,key)=>`<div class="set-row"><svg class="lead" data-lucide="${icon}"></svg><span class="grow">${label}</span><label class="switch"><input type="checkbox" ${S.settings[key]?'checked':''} onchange="S.settings.${key}=this.checked;save();toast('${label} '+(this.checked?'enabled':'disabled')+'.')"><span class="track"></span></label></div>`;
  return `<div class="stack" style="gap:0">
    <div class="card" style="margin-bottom:16px"><div class="row" style="gap:14px">
      <span class="avatar" style="width:56px;height:56px;font-size:20px">${S.user.firstName[0]}</span>
      <div style="flex:1"><b style="font-size:17px">${esc(S.user.name)}</b>
        <div class="small muted">${esc(S.user.email)} · ${esc(S.user.phone)}</div>
        <div class="row" style="gap:6px;margin-top:5px"><span class="badge pos">${S.user.incomeType}</span><span class="badge neutral">${S.user.strictness}</span></div></div>
      <button class="btn btn-secondary btn-sm" onclick="editPersonal()">Edit</button></div></div>

    <div class="settings-group"><div class="sg-title">More sections</div>
      ${set('landmark','Accounts', S.accounts.length+' connected', "navigate('accounts')")}
      ${set('arrow-left-right','Transactions','Search, filter and categorise', "navigate('transactions')")}
      ${set('target','Goals', S.goals.length+' savings goals', "navigate('goals')")}
      ${set('store','Marketplace','Budget-aware shopping (future phase)', "navigate('marketplace')")}
    </div>

    <div class="settings-group"><div class="sg-title">Money settings</div>
      ${set('banknote','Income & payday', NGN(S.user.income)+'/month · payday on the '+S.user.payday+'th', 'editIncome()')}
      ${set('landmark','Connected accounts', S.accounts.length+' accounts linked', "navigate('accounts')")}
      ${set('send','Payment preferences','Preferred account, smart-split default','toast(\'Preferred spending account: \'+bankOf(S.accounts.find(a=>a.primary).bank).name+\'.\',\'info\')')}
      ${set('wallet','Budget preferences', S.user.strictness, 'editStrictness()')}
      ${set('target','Financial goals', S.goals.length+' goals', "navigate('goals')")}
      ${set('coins','Preferred currency','Nigerian naira (₦)','toast(\'Naira is the only currency in this prototype.\',\'info\')')}
    </div>

    <div class="settings-group"><div class="sg-title">Security</div>
      ${set('key-round','Transaction PIN', S.pinSet?'PIN set':'Set up your PIN','setupPin()')}
      ${tog('fingerprint','Biometric unlock','biometric')}
      ${tog('shield-check','Two-factor authentication','twofa')}
      ${set('lock','Change password','','toast(\'A reset link would be sent to your email.\',\'pos\')')}
      ${set('monitor-smartphone','Device management','2 devices active','showDevices()')}
      ${set('history','Login activity','Last sign-in today, Lagos NG','showLogins()')}
      ${set('timer','Session timeout', S.settings.sessionTimeout,'cycleTimeout()')}
      <div class="set-row"><svg class="lead" data-lucide="snowflake"></svg><span class="grow">Freeze all payments<span class="sub">Instantly pause outgoing payments from Villager</span></span><label class="switch"><input type="checkbox" ${S.settings.frozen?'checked':''} onchange="S.settings.frozen=this.checked;save();toast(this.checked?'Payments frozen. Nothing goes out until you unfreeze.':'Payments unfrozen.',this.checked?'warn':'pos')"><span class="track"></span></label></div>
      ${set('siren','Report suspicious activity','','toast(\'In a live product this would open a secure report and alert our support team.\',\'warn\')')}
    </div>

    <div class="settings-group"><div class="sg-title">Notifications & privacy</div>
      ${set('bell','Notification settings','Push, email, summaries, thresholds','openNotifSettings()')}
      ${set('download','Export my data','CSV of transactions and budgets','toast(\'villager-export.csv downloaded (simulated).\',\'pos\')')}
      ${set('shield','Privacy','How your data would be handled','toast(\'Privacy policy would open here.\',\'info\')')}
    </div>

    <div class="settings-group"><div class="sg-title">Support & about</div>
      ${set('life-buoy','Help and support','','toast(\'Support chat would open here.\',\'info\')')}
      ${set('file-text','Terms of use','','toast(\'Terms would open here.\',\'info\')')}
      ${set('info','App version','Villager Budget prototype v0.9.0','')}
      <button class="set-row" style="color:var(--neg)" onclick="confirmModal('Delete account?','This clears all prototype data stored in your browser and returns you to the welcome screen.','Delete everything',()=>{localStorage.removeItem('vb_state');location.reload();},true)"><svg class="lead" data-lucide="trash-2" style="color:var(--neg)"></svg><span class="grow">Delete account</span></button>
      <button class="set-row" onclick="confirmModal('Sign out?','You can sign back in anytime — your prototype data stays on this device.','Sign out',()=>{location.reload();})"><svg class="lead" data-lucide="log-out"></svg><span class="grow">Sign out</span></button>
    </div>
    <p class="tiny muted" style="text-align:center;padding:6px 0 20px">Prototype only. Security features shown here (PIN, 2FA, device management) illustrate future requirements — no certification, licensing or insurance is claimed.</p>
  </div>`;
};
function editPersonal(){
  openModal(`<div class="field"><label>Full name</label><input class="input" id="ppName" value="${esc(S.user.name)}"></div>
    <div class="field"><label>Email</label><input class="input" id="ppEmail" value="${esc(S.user.email)}"></div>
    <div class="field"><label>Phone</label><input class="input" id="ppPhone" value="${esc(S.user.phone)}"></div>
    <button class="btn btn-primary btn-block" onclick="S.user.name=$('#ppName').value;S.user.firstName=$('#ppName').value.split(' ')[0];S.user.email=$('#ppEmail').value;S.user.phone=$('#ppPhone').value;save();closeModal();navigate('profile');toast('Profile updated.')">Save changes</button>`,{title:'Personal information'});
}
function editIncome(){
  openModal(`<div class="field"><label>Average monthly income</label><div class="input-wrap"><span class="prefix">₦</span><input class="input has-prefix" type="number" id="incVal" value="${S.user.income}"></div></div>
    <div class="field"><label>Payday</label><select class="select" id="incDay">${Array.from({length:28},(_,i)=>`<option ${S.user.payday===i+1?'selected':''} value="${i+1}">${i+1}${['st','nd','rd'][i]||'th'}</option>`).join('')}</select></div>
    <button class="btn btn-primary btn-block" onclick="S.user.income=Number($('#incVal').value)||S.user.income;S.user.payday=Number($('#incDay').value);save();closeModal();navigate('profile');toast('Income settings saved.')">Save</button>`,{title:'Income & payday'});
}
function editStrictness(){
  openModal(`<div class="chip-grid">${['Gentle guidance','Balanced guidance','Strong discipline'].map(v=>`<button class="chip ${S.user.strictness===v?'active':''}" onclick="S.user.strictness='${v}';save();closeModal();navigate('profile');toast('Guidance set to ${v.toLowerCase()}.')">${v}</button>`).join('')}</div>
    <p class="small muted">This changes the tone of nudges — you always stay in control of your money.</p>`,{title:'How strict should Villager be?'});
}
function setupPin(){
  openModal(`<p class="small muted" style="text-align:center">Choose a 4-digit PIN for payments.</p>
    <div class="pin-row">${[0,1,2,3].map(i=>`<input class="pin-box" type="password" maxlength="1" inputmode="numeric" aria-label="New PIN digit ${i+1}" oninput="this.value=this.value.replace(/\\D/g,''); if(this.value&&this.nextElementSibling&&this.nextElementSibling.classList.contains('pin-box'))this.nextElementSibling.focus()">`).join('')}</div>
    <button class="btn btn-primary btn-block" onclick="S.pinSet=true;save();closeModal();navigate('profile');toast('Transaction PIN saved.','pos')">Save PIN</button>`,{title:'Transaction PIN'});
}
function showDevices(){
  openModal(`${[['smartphone','Infinix Note 40','This device · Lagos, NG · active now'],['laptop','Chrome on Windows','Lagos, NG · 2 days ago']].map(([i,n,s])=>`
    <div class="set-row" style="padding:13px 4px"><svg class="lead" data-lucide="${i}"></svg><span class="grow">${n}<span class="sub">${s}</span></span>
    <button class="btn btn-secondary btn-sm" onclick="toast('Device signed out (simulated).','pos')">Sign out</button></div>`).join('')}`,{title:'Device management'});
}
function showLogins(){
  openModal(`${[['Today, 8:12 AM','Lagos, NG · Infinix Note 40','pos'],['Yesterday, 9:47 PM','Lagos, NG · Chrome on Windows','pos'],['Mon, 6:03 AM','Abeokuta, NG · Infinix Note 40','warn']].map(([t,s,tone])=>`
    <div class="set-row" style="padding:12px 4px"><svg class="lead" data-lucide="log-in"></svg><span class="grow">${t}<span class="sub">${s}</span></span><span class="badge ${tone}">${tone==='pos'?'Recognised':'Review'}</span></div>`).join('')}
    <button class="btn btn-ghost btn-block" onclick="closeModal();toast('If anything looks wrong, change your password and report it.','warn')">Something looks wrong</button>`,{title:'Login activity'});
}
function cycleTimeout(){
  const opts=['5 minutes','10 minutes','30 minutes'];
  S.settings.sessionTimeout=opts[(opts.indexOf(S.settings.sessionTimeout)+1)%3]; save(); navigate('profile');
  toast('Session timeout: '+S.settings.sessionTimeout+'.','pos');
}

/* ---------- 9. AI FINANCIAL COACH ---------- */
const COACH_QA = [
  {q:'Can I afford to go out this weekend?', a:()=>`Short answer: yes, modestly. Your safe-to-spend today is ${NGN(safeToSpend())}, and Entertainment has ${NGN(Math.max(0,18000-spentIn('Entertainment')))} left this month.\n\nA night out around ₦8,000–₦10,000 fits. Going past ₦15,000 would start eating into next week’s food money — Fridays and Saturdays are already your priciest days.`},
  {q:'Why am I always broke before payday?', a:()=>`Looking at your pattern, three things stand out:\n\n1. Weekend spikes — Fri–Sun food and outings average ₦12,000+, nearly double weekdays.\n2. Small transfers — ₦18,500 this month went out in transfers under ₦2,000 each. They feel tiny but add up.\n3. Front-loading — about 60% of your flexible spending happens in the first two weeks after payday.\n\nTry a weekly cap (₦25,000 flexible per week) instead of one monthly pot. It smooths the month out.`},
  {q:'How much should I save this month?', a:()=>`Your plan already commits ${NGN(95000)} (Savings ₦70,000 + Emergency fund ₦25,000) — about 27% of income, which is genuinely strong.\n\nIf the freelance ₦52,000 that landed this month isn’t already earmarked, moving half of it to your rent goal would push you from ${pct(310000,600000)}% to ${pct(336000,600000)}% of target. Keep the other half as breathing room.`},
  {q:'Where did most of my money go?', a:()=>`This month so far: Feeding ${NGN(spentIn('Feeding'))} leads, then Savings ${NGN(spentIn('Savings'))}, Family support ${NGN(spentIn('Family Support'))}, and Transport ${NGN(spentIn('Transport'))}.\n\nNothing looks reckless — feeding is 80% of plan with ${daysLeftInMonth()} days left, so that’s the one to watch.`},
  {q:'Can I buy a ₦150,000 phone?', a:()=>`Not comfortably this month — your total balance is ${NGN(totalBal())}, but ${NGN(31900)} of bills are coming and your rent goal needs its ₦25,000.\n\nBetter route: you already have a “New laptop” style goal working. Create a phone goal at ₦150,000, put ₦50,000/month in, and buy it debt-free in 3 months — likely during a sale. If it’s urgent (broken phone), ₦150,000 is doable but pause Entertainment and Shopping for the month.`},
  {q:'How can I prepare for rent?', a:()=>`You’re at ${NGN(310000)} of ${NGN(600000)} — 52%, due November. That needs about ${NGN(72500)}/month from here.\n\nYour auto-save covers ₦25,000, so the gap is ~₦47,500. Options: raise the auto-save after your next salary, push freelance income straight to the goal, or extend the target date by one month to ease pressure. Landlords in Lagos rarely wait, so I’d prioritise this above the laptop goal.`},
  {q:'What can I reduce without affecting essentials?', a:()=>`Three candidates, in order of ease:\n\n1. Subscriptions — ₦19,900/month. Do you use DSTV and Netflix? Dropping one saves ₦5,500–₦12,500.\n2. Eating out — ₦2,500 less per week ≈ ₦130,000 a year.\n3. Ride-hailing — swapping 2 Bolt trips a week for danfo saves ~₦4,000/week.\n\nFeeding staples, transport to work, family support and savings stay untouched.`},
];
let coachOpen=false;
function openCoach(){
  if(coachOpen){ closeCoach(); return; }
  coachOpen=true;
  $('#coachHost').innerHTML = `<div class="coach-panel" role="dialog" aria-label="AI financial coach">
    <div class="coach-head"><span class="icon-tile" style="background:var(--green-900);color:var(--gold);width:38px;height:38px;border-radius:12px"><svg data-lucide="sparkles"></svg></span>
      <div style="flex:1"><b style="font-size:14.5px">Villager Coach</b><div class="tiny muted">Educational guidance — not professional financial advice</div></div>
      <button class="modal-close" onclick="closeCoach()" aria-label="Close coach"><svg data-lucide="x"></svg></button></div>
    <div class="coach-msgs" id="coachMsgs">
      <div class="msg bot">Hi ${esc(S.user.firstName)} 👋🏾 I can see your budget, accounts and spending pattern. Ask me anything — or tap a question below.</div>
    </div>
    <div class="coach-sugg" id="coachSugg">${COACH_QA.map((x,i)=>`<button class="chip" onclick="askCoach(COACH_QA[${i}].q)">${x.q}</button>`).join('')}</div>
    <div class="coach-input"><input class="input" id="coachIn" placeholder="Ask about your money…" onkeydown="if(event.key==='Enter')askCoach(this.value)">
      <button class="btn btn-primary" style="min-height:46px;padding:0 16px" onclick="askCoach($('#coachIn').value)" aria-label="Send"><svg data-lucide="send"></svg></button></div>
  </div>`;
  icons();
}
function closeCoach(){ coachOpen=false; $('#coachHost').innerHTML=''; }
function askCoach(q){
  q=(q||'').trim(); if(!q) return;
  if(!coachOpen) openCoach();
  const host=$('#coachMsgs'); const inp=$('#coachIn'); if(inp) inp.value='';
  host.insertAdjacentHTML('beforeend', `<div class="msg user">${esc(q)}</div><div class="typing" id="typing"><i></i><i></i><i></i></div>`);
  host.scrollTop=host.scrollHeight;
  const match = COACH_QA.find(x=>x.q.toLowerCase()===q.toLowerCase()) ||
    COACH_QA.find(x=>{ const kw=x.q.toLowerCase().split(' ').filter(w=>w.length>4); return kw.some(w=>q.toLowerCase().includes(w)); });
  const answer = match ? match.a() :
    `Good question. Here’s what your numbers say: you have ${NGN(totalBal())} across ${visAccts().length} accounts, ${NGN(Math.max(0,plannedTotal()-spentTotal()))} left in this month’s budget, and a safe-to-spend of ${NGN(safeToSpend())} today.\n\nTry one of the suggested questions for a deeper answer — this prototype coach has a fixed playbook. And remember, this is educational guidance, not professional financial advice.`;
  setTimeout(()=>{
    $('#typing')?.remove();
    host.insertAdjacentHTML('beforeend', `<div class="msg bot">${esc(answer)}</div>`);
    host.scrollTop=host.scrollHeight;
  }, 900+Math.random()*600);
}

/* ---------- 10. INIT ---------- */
(function init(){
  icons();
  // Splash → welcome (or straight into the app on a return visit)
  setTimeout(()=>{
    if(load() && S.onboarded){ bootApp(); }
    else showScreen('welcome');
  }, 1900);
})();
