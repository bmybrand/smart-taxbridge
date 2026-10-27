/* Smart TaxBridge: original browser-only interactions. No analytics or form transmission. */
const TAX_2025 = {
 single: { deduction:15750, bands:[11925,48475,103350,197300,250525,626350] },
 joint: { deduction:31500, bands:[23850,96950,206700,394600,501050,751600] },
 head: { deduction:23625, bands:[17000,64850,103350,197300,250500,626350] }
};
function estimateFederal2025(income, withheld, status) {
 const config=TAX_2025[status];
 if(!config || !Number.isFinite(income) || !Number.isFinite(withheld) || income<0 || withheld<0) throw new Error('Enter valid nonnegative amounts.');
 const taxable=Math.max(0,income-config.deduction),rates=[.1,.12,.22,.24,.32,.35,.37];
 let tax=0,lower=0,marginal=0;
 [...config.bands,Infinity].forEach((upper,i)=>{if(taxable>lower){tax+=(Math.min(taxable,upper)-lower)*rates[i];marginal=rates[i];}lower=upper;});
 return {taxable,tax,net:withheld-tax,marginal,deduction:config.deduction,effective:income?tax/income:0};
}
if(typeof module!=='undefined') module.exports={estimateFederal2025};
if(typeof document!=='undefined') {
 const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
 const menu=document.getElementById('main-nav'),mobile=document.getElementById('menu-toggle');
 const closeMenus=()=>document.querySelectorAll('.nav-toggle').forEach(b=>{b.setAttribute('aria-expanded','false');document.getElementById(b.getAttribute('aria-controls')).hidden=true;});
 document.querySelectorAll('.nav-toggle').forEach(b=>b.addEventListener('click',()=>{const open=b.getAttribute('aria-expanded')!=='true';closeMenus();b.setAttribute('aria-expanded',String(open));document.getElementById(b.getAttribute('aria-controls')).hidden=!open;}));
 mobile?.addEventListener('click',()=>{const open=mobile.getAttribute('aria-expanded')!=='true';mobile.setAttribute('aria-expanded',String(open));mobile.setAttribute('aria-label',open?'Close navigation':'Open navigation');menu.classList.toggle('is-open',open);});
 document.addEventListener('click',e=>{if(!e.target.closest('.nav-group'))closeMenus();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(dialog?.open){dialog.close();e.preventDefault();return;}const expanded=document.querySelector('.nav-toggle[aria-expanded="true"]');closeMenus();expanded?.focus();if(menu?.classList.contains('is-open')){menu.classList.remove('is-open');mobile.setAttribute('aria-expanded','false');mobile.setAttribute('aria-label','Open navigation');mobile.focus();}}});
 const dialog=document.getElementById('search-dialog'),search=document.getElementById('site-search'),results=document.getElementById('search-results');let pages=[];
 document.querySelectorAll('[data-open-search]').forEach(b=>b.addEventListener('click',async()=>{dialog.showModal();search.focus();if(!pages.length){try{const r=await fetch('/assets/pro/search-index.json');if(!r.ok)throw new Error();pages=await r.json();renderSearch();}catch{results.textContent='Search is unavailable. Browse the site map for all pages.';}}}));
 document.querySelector('[data-close-search]')?.addEventListener('click',()=>dialog.close());
 dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 function renderSearch(){const q=search.value.toLowerCase().trim();results.replaceChildren();const found=pages.filter(p=>!q||(p.title+' '+p.description).toLowerCase().includes(q)).slice(0,8);if(!found.length){results.textContent='No matching pages. Try “business”, “checklist”, or “refund”.';return;}found.forEach(p=>{const a=document.createElement('a');a.href=p.url;const title=document.createElement('strong');title.textContent=p.title;const desc=document.createElement('small');desc.textContent=p.description;a.append(title,desc);results.append(a);});}
 search?.addEventListener('input',renderSearch);
 document.querySelectorAll('[data-finder]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();location.href=form.querySelector('select').value;}));
 const filterButtons=[...document.querySelectorAll('[data-filter]')],filterInput=document.getElementById('resource-search'),resourceCards=[...document.querySelectorAll('[data-category]')];let category='all';
 function filterResources(){let count=0;const term=(filterInput?.value||'').toLowerCase();resourceCards.forEach(card=>{const show=(category==='all'||card.dataset.category===category)&&card.textContent.toLowerCase().includes(term);card.hidden=!show;if(show)count++;});const empty=document.getElementById('filter-empty');if(empty)empty.hidden=count>0;const status=document.getElementById('filter-status');if(status)status.textContent=`${count} resources shown`;}
 filterButtons.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;filterButtons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filterResources();}));filterInput?.addEventListener('input',filterResources);
 const calc=document.getElementById('tax-form');
 if(calc){const update=e=>{e?.preventDefault();if(!calc.reportValidity())return;const d=new FormData(calc);const r=estimateFederal2025(Number(d.get('income')),Number(d.get('withheld')),d.get('status'));document.getElementById('tax-result-label').textContent=r.net>=0?'Illustrative refund':'Illustrative amount due';document.getElementById('tax-result').textContent=money(Math.abs(r.net));document.getElementById('taxable-result').textContent=money(r.taxable);document.getElementById('deduction-result').textContent=money(r.deduction);document.getElementById('liability-result').textContent=money(r.tax);document.getElementById('rate-result').textContent=Math.round(r.marginal*100)+'%';};calc.addEventListener('submit',update);update();}
 const expense=document.getElementById('expense-form');if(expense){const update=e=>{e?.preventDefault();if(!expense.reportValidity())return;const d=new FormData(expense);const income=Number(d.get('revenue'));const costs=['supplies','software','travel','other'].reduce((sum,key)=>sum+Number(d.get(key)),0);document.getElementById('expense-total').textContent=money(costs);document.getElementById('expense-net').textContent=money(income-costs);document.getElementById('expense-revenue').textContent=money(income);};expense.addEventListener('submit',update);update();}
 const pay=document.getElementById('pay-form');if(pay){const update=e=>{e?.preventDefault();if(!pay.reportValidity())return;const d=new FormData(pay),periods=Number(d.get('periods'));document.getElementById('pay-income').textContent=money(Number(d.get('gross'))*periods);document.getElementById('pay-withheld').textContent=money(Number(d.get('withheld'))*periods);};pay.addEventListener('submit',update);update();}
 const checks=[...document.querySelectorAll('[data-checklist] input')];
 function updateChecks(){const count=checks.filter(x=>x.checked).length;document.getElementById('check-progress').textContent=`${count} of ${checks.length} items ready`;document.getElementById('check-bar').style.width=`${100*count/checks.length}%`;}
 checks.forEach(x=>x.addEventListener('change',updateChecks));document.getElementById('reset-checklist')?.addEventListener('click',()=>{checks.forEach(x=>x.checked=false);updateChecks();});document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
 function downloadText(text,name){const u=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}
 document.getElementById('download-checklist')?.addEventListener('click',()=>downloadText('Smart TaxBridge preparation checklist\n\n'+checks.map(x=>(x.checked?'[x] ':'[ ] ')+x.closest('label').textContent.trim()).join('\n'),'smart-taxbridge-checklist.txt'));
 const contact=document.getElementById('contact-form');contact?.addEventListener('submit',e=>{e.preventDefault();if(!contact.reportValidity())return;const d=new FormData(contact);downloadText(`Smart TaxBridge inquiry draft — not sent\n\nName: ${d.get('name')}\nEmail: ${d.get('email')}\nTopic: ${d.get('topic')}\n\n${d.get('message')}\n`,'smart-taxbridge-inquiry.txt');document.getElementById('contact-status').textContent='Your inquiry draft is ready to download. Nothing has been sent. Keep it until live contact details are available.';});
}
