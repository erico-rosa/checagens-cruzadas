(async function(){
'use strict';
const ORDER=['Aos Fatos','Estadão Verifica','g1 Fato ou Fake','Ranking dos Políticos','Fato Carimbado','Terra'];
const AB={'Aos Fatos':'AF','Estadão Verifica':'EST','g1 Fato ou Fake':'G1','Ranking dos Políticos':'RNK','Fato Carimbado':'FC','Terra':'TER'};
const SIT=['Divergência forte','Divergência leve','Consenso','Só um veredito','Exclusiva','Promessa'];
const SITC={'Divergência forte':'forte','Divergência leve':'leve','Consenso':'consenso'};
const $=id=>document.getElementById(id);
const list=$('list'),stats=$('stats'),count=$('count'),more=$('more'),q=$('q'),cand=$('cand'),tema=$('tema'),veic=$('veic'),prom=$('prom'),vlist=$('vlist');
const st={q:'',c:'',t:'',v:'',s:'',prom:false,shown:60};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const kcls=k=>'k-'+(k==='Sem veredito'?'Sem':k);
const V=document.documentElement.dataset.v||'';
const getJSON=p=>fetch(p+(V?'?v='+V:'')).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()});

let D;
try{ D=await getJSON('data/resumo.json'); }
catch(e){
  list.innerHTML='<li class="row"><div class="detail">Não foi possível carregar os dados. Se você abriu o arquivo direto do computador, abra pelo site publicado ou por um servidor local, porque o navegador bloqueia a leitura dos arquivos de dados nesse modo.</div></li>';
  return;
}
let DET=null;           // detalhes (análises e fontes), carregados em segundo plano
const detReady=getJSON('data/detalhes.json').then(x=>{DET=x;buildText();if(st.q)render();return x}).catch(()=>null);

function buildText(){
  D.falas.forEach(f=>{
    f.txt=(f.ti+' '+f.id+' '+f.nota+' '+f.i.map(n=>{const c=D.ch[n];const d=DET&&DET[n];
      return c.f+' '+c.r+(d?' '+d.a+' '+(d.L||[]).map(l=>l[0]+' '+l[1]).join(' '):'')}).join(' ')).toLowerCase();
  });
}
D.falas.forEach(f=>{
  const per={};
  f.i.forEach(n=>{const c=D.ch[n];(per[c.v]=per[c.v]||[]).push(c.k)});
  f.per={};
  for(const v in per){const d=[...new Set(per[v].filter(k=>k!=='Sem veredito'))];f.per[v]=d.length===0?'Sem veredito':(d.length>1?'Misto':d[0])}
  f.rank=SIT.indexOf(f.s)*1000-f.ni*10;
});
buildText();
D.falas.sort((a,b)=>a.rank-b.rank||a.id.localeCompare(b.id));

[...new Set(D.falas.map(f=>f.t))].sort().forEach(t=>tema.insertAdjacentHTML('beforeend',`<option>${esc(t)}</option>`));
ORDER.forEach(v=>veic.insertAdjacentHTML('beforeend',`<option value="${esc(v)}">${esc(v)} (${D.veiculos[v].n})</option>`));
vlist.innerHTML=ORDER.map(v=>{const x=D.veiculos[v];return `<div><b>${esc(v)}</b> · <span class="num">${x.n}</span> checagens extraídas${x.url?` · <a href="${esc(x.url)}" target="_blank" rel="noopener">página original</a>`:''}<br><span style="color:var(--muted)">${esc(x.metodo)}</span></div>`}).join('');

function filt(ignoreS){
  return D.falas.filter(f=>(st.prom||f.s!=='Promessa'||st.s==='Promessa')&&(!st.c||f.c===st.c)&&(!st.t||f.t===st.t)&&(!st.v||f.per[st.v])&&(ignoreS||!st.s||f.s===st.s)&&(!st.q||f.txt.includes(st.q)));
}
function renderStats(){
  const base=filt(true);const cnt={};base.forEach(f=>cnt[f.s]=(cnt[f.s]||0)+1);
  stats.innerHTML=`<button class="stat" data-s="" aria-pressed="${!st.s}"><b>${base.length}</b><span>falas</span></button>`+
   SIT.filter(s=>s!=='Promessa'||st.prom).map(s=>`<button class="stat" data-s="${s}" aria-pressed="${st.s===s}"><b>${cnt[s]||0}</b><span>${s}</span></button>`).join('');
}
function slots(f){
  return ORDER.map(v=>f.per[v]?`<span class="slot ${kcls(f.per[v])}" title="${esc(v)}: ${esc(f.per[v])}">${AB[v]}</span>`:`<span class="slot off" title="${esc(v)} não checou">${AB[v]}</span>`).join('');
}
function detail(f){
  const items=f.i.map(n=>[n,D.ch[n]]).sort((a,b)=>ORDER.indexOf(a[1].v)-ORDER.indexOf(b[1].v));
  return (f.nota?`<div class="note">${esc(f.nota)}</div>`:'')+items.map(([n,c])=>{const d=(DET&&DET[n])||{a:'',L:[],fm:[]};return `
   <div class="chk"><div><div class="src">${esc(c.v)}</div><span class="lab ${kcls(c.k)}">${esc(c.r)}</span>${c.h?`<div class="cid">${esc(c.h)}</div>`:''}</div>
   <div class="body"><q>${esc(c.f)}</q>${d.a?`<p>${esc(d.a)}</p>`:''}${d.fm&&d.fm.length?`<p><b>Fontes citadas no texto:</b> ${esc(d.fm.join(', '))}</p>`:''}
   ${d.L&&d.L.length?`<div class="links">${d.L.map(l=>`<a href="${esc(l[1])}" target="_blank" rel="noopener nofollow" title="${esc(l[1])}">${esc(l[0]||l[1])}</a>`).join('')}</div>`:''}</div></div>`}).join('');
}
function render(){
  renderStats();
  const r=filt(false);count.textContent=`${r.length} de ${D.falas.length}`;
  list.innerHTML=r.slice(0,st.shown).map(f=>`<li class="row" data-id="${f.id}"><button aria-expanded="false">
    <span class="cid">${f.id}</span><span class="tit"><span class="who">${esc(f.c==='Lula'?'Lula':'Flávio')} · ${esc(f.t)} · ${f.ni} veículo${f.ni>1?'s':''}</span>${esc(f.ti)}</span>
    <span class="sit ${SITC[f.s]||''}">${esc(f.s)}</span><span class="slots">${slots(f)}</span></button></li>`).join('');
  more.hidden=r.length<=st.shown;
}
list.addEventListener('click',async e=>{const b=e.target.closest('.row>button');if(!b)return;const li=b.parentElement;const open=b.getAttribute('aria-expanded')==='true';
  b.setAttribute('aria-expanded',!open);let d=li.querySelector('.detail');
  if(open){d&&d.remove();return}
  const f=D.falas.find(x=>x.id===li.dataset.id);
  if(!DET){li.insertAdjacentHTML('beforeend','<div class="detail">Carregando análises…</div>');await detReady;li.querySelector('.detail')?.remove();if(b.getAttribute('aria-expanded')!=='true')return}
  li.insertAdjacentHTML('beforeend',`<div class="detail">${detail(f)}</div>`)});
stats.addEventListener('click',e=>{const b=e.target.closest('.stat');if(!b)return;st.s=b.dataset.s;st.shown=60;render()});
cand.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cand.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));st.c=b.dataset.v;st.shown=60;render()});
q.addEventListener('input',()=>{st.q=q.value.trim().toLowerCase();st.shown=60;render()});
tema.addEventListener('change',()=>{st.t=tema.value;st.shown=60;render()});
veic.addEventListener('change',()=>{st.v=veic.value;st.shown=60;render()});
prom.addEventListener('change',()=>{st.prom=prom.checked;if(!st.prom&&st.s==='Promessa')st.s='';render()});
more.addEventListener('click',()=>{st.shown+=60;render()});
render();
})();
