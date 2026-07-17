/* ---------- captions ---------- */
const CAPTION = slug => "Chart from the notes";

/* ---------- build lesson list ---------- */
const SLUG_BY_ID = {}; // "m1-01" -> full slug
Object.keys(IMG_COUNTS).forEach(s=>{ SLUG_BY_ID[s.slice(0,5)] = s; });
const LESSONS = Array.from(document.querySelectorAll('.lesson')).filter(el=>el.id!=="home")
  .map(el=>({id:el.id, title:el.dataset.title, month:el.dataset.month}));

/* ---------- state ---------- */
const store = {
  get done(){ try{return JSON.parse(localStorage.getItem('ict-done')||'[]')}catch(e){return[]} },
  set done(v){ localStorage.setItem('ict-done', JSON.stringify(v)); },
  get quiz(){ try{return JSON.parse(localStorage.getItem('ict-quiz')||'{}')}catch(e){return{}} },
  set quiz(v){ localStorage.setItem('ict-quiz', JSON.stringify(v)); }
};

/* ---------- render lesson videos (at the top of each lesson) ---------- */
document.querySelectorAll('.lesson').forEach(sec=>{
  const url = VIDEOS[sec.id];
  if(!url) return;
  const hero = sec.querySelector('.lesson-hero');
  if(!hero) return;
  const a = document.createElement('a');
  a.className = 'lesson-video';
  a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.innerHTML = '<span class="lv-ico">▶</span><span>Watch the original video <span class="lv-sub">· on YouTube</span></span>';
  hero.insertAdjacentElement('afterend', a);
});

/* ---------- render figures ---------- */
document.querySelectorAll('.fig-slot').forEach(slot=>{
  const slug = slot.dataset.slug, n = IMG_COUNTS[slug]||0;
  if(!n) return;
  const h = document.createElement('h3'); h.textContent = 'Charts from the notes';
  slot.appendChild(h);
  const wrap = document.createElement('div');
  wrap.className = n>2 ? 'gallery' : '';
  for(let i=1;i<=n;i++){
    const nn = String(i).padStart(2,'0');
    const fig = document.createElement('figure'); fig.className='fig';
    const img = document.createElement('img');
    img.loading='lazy'; img.src = `images/${slug}-${nn}.png`;
    img.alt = `${slug} chart ${i}`;
    img.onerror = ()=>fig.remove();
    const cap = document.createElement('figcaption'); cap.textContent = `Note chart ${i} of ${n} — click to zoom`;
    fig.appendChild(img); fig.appendChild(cap); wrap.appendChild(fig);
  }
  slot.appendChild(wrap);
});

/* ---------- lightbox ---------- */
const lb = document.getElementById('lightbox'), lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb-cap');
document.addEventListener('click', e=>{
  const img = e.target.closest('.fig img');
  if(img){ lbImg.src = img.src; lbCap.textContent = img.alt; lb.classList.add('open'); }
  else if(e.target===lb || e.target===lbImg) lb.classList.remove('open');
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape') lb.classList.remove('open'); });

/* ---------- flip cards ---------- */
document.querySelectorAll('.flip').forEach(f=>f.addEventListener('click', ()=>f.classList.toggle('flipped')));

/* ---------- quizzes ---------- */
document.querySelectorAll('.quiz').forEach(qz=>{
  const key = qz.dataset.quiz, qs = QUIZZES[key];
  if(!qs){ qz.remove(); return; }
  qz.innerHTML = `<h3>Lesson Check</h3><div class="q-sub">Answers come straight from the notes above.</div>`;
  qs.forEach((item,qi)=>{
    const qd = document.createElement('div'); qd.className='q';
    qd.innerHTML = `<div class="q-text">${qi+1}. ${item.q}</div>`;
    // shuffle options so the correct answer isn't always in the same position
    const opts = item.o.map((text,idx)=>({text, correct: idx===item.a}));
    for(let i=opts.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [opts[i],opts[j]]=[opts[j],opts[i]]; }
    const btns = [];
    opts.forEach(o=>{
      const b = document.createElement('button'); b.className='opt'; b.textContent = o.text;
      b.addEventListener('click', ()=>{
        qd.querySelectorAll('.opt').forEach(x=>x.disabled=true);
        if(o.correct){ b.classList.add('correct'); }
        else { b.classList.add('wrong'); btns.forEach(x=>{ if(x._correct) x.classList.add('correct'); }); }
        expl.classList.add('show');
        const s = store.quiz; s[`${key}-${qi}`] = o.correct; store.quiz = s;
      });
      b._correct = o.correct; btns.push(b); qd.appendChild(b);
    });
    const expl = document.createElement('div'); expl.className='expl'; expl.textContent = item.e;
    qd.appendChild(expl);
    qz.appendChild(qd);
  });
});

/* ---------- navigation ---------- */
const navList = document.getElementById('nav-list');
function renderNav(){
  navList.innerHTML='';
  MONTHS.forEach(m=>{
    const items = LESSONS.filter(l=>l.month===m.id);
    const g = document.createElement('div'); g.className='month-group';
    const doneCt = items.filter(l=>store.done.includes(l.id)).length;
    g.innerHTML = `<div class="month-head"><h2>${m.title.split('—')[0].trim()}</h2><span class="count">${doneCt}/${items.length}</span></div>`;
    items.forEach((l,i)=>{
      const a = document.createElement('div');
      a.className = 'nav-lesson'+(store.done.includes(l.id)?' done':'');
      a.dataset.target = l.id;
      a.innerHTML = `<span class="dot">✓</span><span class="n">${i+1}</span><span>${l.title}</span>`;
      a.addEventListener('click', ()=>show(l.id));
      g.appendChild(a);
    });
    navList.appendChild(g);
  });
  updateProgress();
}
function updateProgress(){
  const n = store.done.length;
  document.getElementById('prog-fill').style.width = (n/LESSONS.length*100)+'%';
  document.getElementById('prog-label').textContent = `${n} / ${LESSONS.length} lessons complete`;
}

/* ---------- footer buttons ---------- */
LESSONS.forEach((l,idx)=>{
  const foot = document.querySelector(`#${l.id} .lesson-footer`);
  const prev = document.createElement('button'); prev.className='btn';
  prev.textContent = idx>0 ? '← '+LESSONS[idx-1].title : '← Home';
  prev.addEventListener('click', ()=>show(idx>0?LESSONS[idx-1].id:'home'));
  const doneB = document.createElement('button'); doneB.className='btn done-btn';
  const refresh = ()=>{ const d = store.done.includes(l.id); doneB.classList.toggle('marked',d); doneB.textContent = d?'✓ Completed':'Mark complete'; };
  doneB.addEventListener('click', ()=>{
    let d = store.done;
    d = d.includes(l.id) ? d.filter(x=>x!==l.id) : [...d, l.id];
    store.done = d; refresh(); renderNav(); renderCards();
  });
  refresh();
  const next = document.createElement('button'); next.className='btn primary';
  next.textContent = idx<LESSONS.length-1 ? 'Next: '+LESSONS[idx+1].title+' →' : 'Finish course';
  next.addEventListener('click', ()=>{
    if(!store.done.includes(l.id)){ store.done=[...store.done,l.id]; refresh(); renderNav(); renderCards(); }
    if(idx<LESSONS.length-1) show(LESSONS[idx+1].id); else show('home');
  });
  foot.appendChild(prev); foot.appendChild(doneB); foot.appendChild(next);
});

/* ---------- month cards on home ---------- */
function renderCards(){
  const wrap = document.getElementById('month-cards'); wrap.innerHTML='';
  MONTHS.forEach((m,i)=>{
    const items = LESSONS.filter(l=>l.month===m.id);
    const doneCt = items.filter(l=>store.done.includes(l.id)).length;
    const c = document.createElement('div'); c.className='mcard';
    c.innerHTML = `<div class="m-num">Month ${i+1}</div><h3>${m.title.split('— ')[1]}</h3><p>${m.desc}</p><div class="m-prog">${doneCt}/${items.length} lessons · ${items.reduce((a,l)=>a+(IMG_COUNTS[SLUG_BY_ID[l.id]]||0),0)} charts</div>`;
    c.addEventListener('click', ()=>show(items[0].id));
    wrap.appendChild(c);
  });
}

/* ---------- routing ---------- */
function show(id){
  document.querySelectorAll('.lesson').forEach(el=>el.classList.remove('visible'));
  const el = document.getElementById(id) || document.getElementById('home');
  el.classList.add('visible');
  document.querySelectorAll('.nav-lesson').forEach(a=>a.classList.toggle('active', a.dataset.target===el.id));
  window.scrollTo({top:0});
  sidebar.classList.remove('open');
  location.hash = el.id;
}
const sidebar = document.getElementById('sidebar');
document.getElementById('menu-toggle').addEventListener('click', ()=>sidebar.classList.toggle('open'));

renderNav(); renderCards();
show(location.hash ? location.hash.slice(1) : 'home');
