/* ---------- captions ---------- */
const CAPTION = slug => "Chart from the notes";

/* ---------- build lesson list ---------- */
const SLUG_BY_ID = {}; // "m1-01" -> full slug
Object.keys(IMG_COUNTS).forEach(s=>{ SLUG_BY_ID[s.slice(0,5)] = s; });
/* review/exam pages are .lesson sections too (for routing), but they carry a
   data-kind and are NOT part of the lesson count or the progress bar. */
const LESSONS = Array.from(document.querySelectorAll('.lesson'))
  .filter(el=>el.id!=="home" && !el.dataset.kind)
  .map(el=>({id:el.id, title:el.dataset.title, month:el.dataset.month}));

/* ---------- state ---------- */
const store = {
  get done(){ try{return JSON.parse(localStorage.getItem('ict-done')||'[]')}catch(e){return[]} },
  set done(v){ localStorage.setItem('ict-done', JSON.stringify(v)); },
  get quiz(){ try{return JSON.parse(localStorage.getItem('ict-quiz')||'{}')}catch(e){return{}} },
  set quiz(v){ localStorage.setItem('ict-quiz', JSON.stringify(v)); },
  get exam(){ try{return JSON.parse(localStorage.getItem('ict-exam')||'{}')}catch(e){return{}} },
  set exam(v){ localStorage.setItem('ict-exam', JSON.stringify(v)); },
  get notes(){ try{return JSON.parse(localStorage.getItem('ict-notes')||'{}')}catch(e){return{}} },
  set notes(v){ localStorage.setItem('ict-notes', JSON.stringify(v)); }
};

/* ---------- shared helpers ---------- */
/* Fisher-Yates — so the correct answer is never in a fixed position. */
function shuffle(a){
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
const pct = n => Math.round(n*100)+'%';

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
    img.dataset.cap = `Note chart ${i} of ${n}`;
    const cap = document.createElement('figcaption'); cap.textContent = `Note chart ${i} of ${n} — click to zoom`;
    fig.appendChild(img); fig.appendChild(cap); wrap.appendChild(fig);
  }
  slot.appendChild(wrap);
});

/* ---------- lightbox ---------- */
/* Opens the whole CURRENT LESSON's chart set, so prev/next browses the lesson
   without closing. Zoom is expressed relative to the fitted size (100% = fit);
   above 100% the stage scrolls and the image can be dragged to pan. */
const lb = document.getElementById('lightbox'),
      lbImg = lb.querySelector('img'),
      lbStage = lb.querySelector('.lb-stage'),
      lbCap = lb.querySelector('.lb-cap'),
      lbCount = lb.querySelector('.lb-count'),
      lbZoomLabel = lb.querySelector('.lb-zoom'),
      lbBtn = k => lb.querySelector(`[data-lb="${k}"]`);
const ZOOM_MIN = 1, ZOOM_MAX = 5, ZOOM_STEP = 1.25;
let lbGroup = [], lbIdx = 0, lbZoom = 1, lbFitW = 0;

function lbApplyZoom(){
  // Measure the fitted width with the CSS caps back on, then scale from it.
  lbImg.style.width = ''; lbImg.style.maxWidth = ''; lbImg.style.maxHeight = '';
  if(lbImg.clientWidth) lbFitW = lbImg.clientWidth;
  if(lbZoom > 1){
    lbImg.style.maxWidth = 'none'; lbImg.style.maxHeight = 'none';
    lbImg.style.width = Math.round(lbFitW * lbZoom) + 'px';
  }
  lbZoomLabel.textContent = Math.round(lbZoom * 100) + '%';
  lbStage.classList.toggle('zoomed', lbZoom > 1);
  lbBtn('out').disabled = lbZoom <= ZOOM_MIN + 1e-3;
  lbBtn('in').disabled = lbZoom >= ZOOM_MAX - 1e-3;
  lbBtn('reset').disabled = lbZoom <= ZOOM_MIN + 1e-3;
}
function lbSetZoom(z){
  lbZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
  lbApplyZoom();
  lbStage.scrollLeft = (lbStage.scrollWidth - lbStage.clientWidth) / 2;
  lbStage.scrollTop = (lbStage.scrollHeight - lbStage.clientHeight) / 2;
}
function lbRender(){
  const img = lbGroup[lbIdx];
  if(!img) return;
  lbImg.src = img.currentSrc || img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = img.dataset.cap || img.alt || '';
  lbCount.textContent = `${lbIdx + 1} / ${lbGroup.length}`;
  lbBtn('prev').disabled = lbIdx === 0;
  lbBtn('next').disabled = lbIdx === lbGroup.length - 1;
  lbSetZoom(1);
}
function lbOpen(img){
  const scope = img.closest('.lesson') || document;
  lbGroup = Array.from(scope.querySelectorAll('.fig img'));
  lbIdx = Math.max(0, lbGroup.indexOf(img));
  lb.classList.add('open');
  document.body.classList.add('lb-lock');
  lbRender();
}
function lbClose(){ lb.classList.remove('open'); document.body.classList.remove('lb-lock'); }
function lbGo(d){
  const n = lbIdx + d;
  if(n < 0 || n >= lbGroup.length) return;
  lbIdx = n; lbRender();
}
const LB_ACTIONS = {
  prev: ()=>lbGo(-1), next: ()=>lbGo(1),
  in: ()=>lbSetZoom(lbZoom * ZOOM_STEP), out: ()=>lbSetZoom(lbZoom / ZOOM_STEP),
  reset: ()=>lbSetZoom(1), close: lbClose
};

// Re-fit whenever a new image finishes decoding, and on resize.
lbImg.addEventListener('load', ()=>{ if(lb.classList.contains('open')) lbApplyZoom(); });
window.addEventListener('resize', ()=>{ if(lb.classList.contains('open')) lbApplyZoom(); });

document.addEventListener('click', e=>{
  const img = e.target.closest('.fig img');
  if(img) lbOpen(img);
});
/* Hit-test the image rect rather than trusting e.target: while zoomed we hold
   a pointer capture on the stage, and Chromium retargets the follow-up click to
   the capturing element — so a plain click on the image arrives as the stage.
   The rect test also gets the letterbox right (stage, but beside the image =
   outside). Synthetic clicks have clientX/Y 0, hence the e.target fallback. */
function lbHitsImage(e){
  if(e.target === lbImg) return true;
  if(!e.clientX && !e.clientY) return false;
  const r = lbImg.getBoundingClientRect();
  return e.clientX >= r.left && e.clientX <= r.right
      && e.clientY >= r.top  && e.clientY <= r.bottom;
}
lb.addEventListener('click', e=>{
  if(lbDragged){ lbDragged = false; return; }   // a pan gesture, not a click
  const btn = e.target.closest('[data-lb]');
  if(btn){ LB_ACTIONS[btn.dataset.lb](); return; }
  // Anything that isn't the image or the control panel is "outside" → close.
  if(lbHitsImage(e) || e.target.closest('.lb-panel')) return;
  lbClose();
});

/* drag-to-pan once zoomed in */
let lbDragging = false, lbDragged = false, lbSX = 0, lbSY = 0, lbSL = 0, lbST = 0;
lbStage.addEventListener('pointerdown', e=>{
  if(lbZoom <= 1 || e.target !== lbImg) return;
  lbDragging = true; lbDragged = false;
  lbSX = e.clientX; lbSY = e.clientY;
  lbSL = lbStage.scrollLeft; lbST = lbStage.scrollTop;
  lbStage.setPointerCapture(e.pointerId);
  e.preventDefault();
});
lbStage.addEventListener('pointermove', e=>{
  if(!lbDragging) return;
  const dx = e.clientX - lbSX, dy = e.clientY - lbSY;
  if(Math.abs(dx) > 3 || Math.abs(dy) > 3) lbDragged = true;
  lbStage.scrollLeft = lbSL - dx; lbStage.scrollTop = lbST - dy;
});
['pointerup','pointercancel'].forEach(t=>lbStage.addEventListener(t, e=>{
  if(!lbDragging) return;
  lbDragging = false;
  try { lbStage.releasePointerCapture(e.pointerId); } catch(_){}
}));

document.addEventListener('keydown', e=>{
  if(!lb.classList.contains('open')){ return; }
  if(e.key === 'Escape') lbClose();
  else if(e.key === 'ArrowLeft') lbGo(-1);
  else if(e.key === 'ArrowRight') lbGo(1);
  else if(e.key === '+' || e.key === '=') lbSetZoom(lbZoom * ZOOM_STEP);
  else if(e.key === '-' || e.key === '_') lbSetZoom(lbZoom / ZOOM_STEP);
  else if(e.key === '0') lbSetZoom(1);
  else return;
  e.preventDefault();
});

/* ---------- flip cards ---------- */
document.querySelectorAll('.flip').forEach(f=>f.addEventListener('click', ()=>f.classList.toggle('flipped')));

/* ---------- quizzes ---------- */
function clearQuiz(key){
  const s = store.quiz;
  Object.keys(s).forEach(k=>{ if(k.indexOf(key+'-')===0) delete s[k]; });
  store.quiz = s;
}
function quizAnswered(key, n){
  const s = store.quiz;
  for(let i=0;i<n;i++){ if(Object.prototype.hasOwnProperty.call(s, `${key}-${i}`)) return true; }
  return false;
}
function renderQuiz(qz){
  const key = qz.dataset.quiz, qs = QUIZZES[key];
  if(!qs){ qz.remove(); return; }
  qz.innerHTML = '';

  const head = document.createElement('div'); head.className = 'quiz-head';
  head.innerHTML = `<div><h3>Lesson Check</h3>
    <div class="q-sub">Answers come straight from the notes above.</div></div>`;
  const reset = document.createElement('button'); reset.className = 'mini-btn';
  reset.textContent = 'Reset quiz';
  reset.disabled = !quizAnswered(key, qs.length);
  reset.addEventListener('click', ()=>{ clearQuiz(key); renderQuiz(qz); });
  head.appendChild(reset);
  qz.appendChild(head);

  qs.forEach((item,qi)=>{
    const qd = document.createElement('div'); qd.className='q';
    qd.innerHTML = `<div class="q-text">${qi+1}. ${item.q}</div>`;
    // shuffle options so the correct answer isn't always in the same position
    const opts = shuffle(item.o.map((text,idx)=>({text, correct: idx===item.a})));
    const answered = Object.prototype.hasOwnProperty.call(store.quiz, `${key}-${qi}`);
    const wasCorrect = store.quiz[`${key}-${qi}`];
    const btns = [];
    opts.forEach(o=>{
      const b = document.createElement('button'); b.className='opt'; b.textContent = o.text;
      b.addEventListener('click', ()=>{
        qd.querySelectorAll('.opt').forEach(x=>x.disabled=true);
        if(o.correct){ b.classList.add('correct'); }
        else { b.classList.add('wrong'); btns.forEach(x=>{ if(x._correct) x.classList.add('correct'); }); }
        expl.classList.add('show');
        const s = store.quiz; s[`${key}-${qi}`] = o.correct; store.quiz = s;
        reset.disabled = false;
      });
      b._correct = o.correct; btns.push(b); qd.appendChild(b);
    });
    const expl = document.createElement('div'); expl.className='expl'; expl.textContent = item.e;
    qd.appendChild(expl);
    if(answered){
      btns.forEach(x=>{ x.disabled=true; if(x._correct) x.classList.add('correct'); });
      if(!wasCorrect){
        const wrongBtn = btns.find(x=>!x._correct);
        if(wrongBtn) wrongBtn.classList.add('wrong');
      }
      expl.classList.add('show');
    }
    qz.appendChild(qd);
  });
}
const QUIZ_ELS = Array.from(document.querySelectorAll('.quiz'));
QUIZ_ELS.forEach(renderQuiz);

/* ---------- final exams (one per section) ---------- */
/* Unlike a lesson check, nothing is graded until you submit — and picks are
   stored by option TEXT, because the options are re-shuffled on every render. */
const PASS_MARK = 0.8;

function renderExam(ex){
  const sid = ex.dataset.exam, qs = EXAMS[sid];
  if(!qs){ ex.remove(); return; }
  const rec = store.exam[sid] || {};
  const picks = Object.assign({}, rec.picks || {});
  let submitted = !!rec.submitted;
  ex.innerHTML = '';

  const head = document.createElement('div'); head.className = 'quiz-head';
  head.innerHTML = `<div><h3>Final Exam</h3>
    <div class="q-sub">${qs.length} questions · ${pct(PASS_MARK)} to pass · retake it as often as you like.</div></div>`;
  const badge = document.createElement('div'); badge.className = 'exam-best';
  const paintBadge = ()=>{
    const r = store.exam[sid] || {};
    badge.textContent = r.best==null ? 'Not attempted yet'
      : `Best ${pct(r.best)} · ${r.taken} attempt${r.taken===1?'':'s'}`;
  };
  paintBadge();
  head.appendChild(badge);
  ex.appendChild(head);

  const rows = [];
  qs.forEach((item,qi)=>{
    const qd = document.createElement('div'); qd.className='q eq';
    qd.innerHTML = `<div class="q-text">${qi+1}. ${item.q}</div>`;
    const btns = [];
    shuffle(item.o.map((text,idx)=>({text, correct: idx===item.a}))).forEach(o=>{
      const b = document.createElement('button'); b.className='opt'; b.textContent = o.text;
      b._correct = o.correct; b._text = o.text;
      if(!submitted && picks[qi] === o.text) b.classList.add('picked');
      b.addEventListener('click', ()=>{
        if(submitted) return;
        btns.forEach(x=>x.classList.remove('picked'));
        b.classList.add('picked');
        picks[qi] = o.text;
        savePicks();
        updateBar();
      });
      btns.push(b); qd.appendChild(b);
    });
    const expl = document.createElement('div'); expl.className='expl'; expl.textContent = item.e;
    qd.appendChild(expl);
    rows.push({qd, btns, expl});
    ex.appendChild(qd);
  });

  const bar = document.createElement('div'); bar.className='exam-bar';
  const status = document.createElement('div'); status.className='exam-status';
  const actions = document.createElement('div'); actions.className='exam-actions';
  const retake = document.createElement('button'); retake.className='btn'; retake.textContent='Retake exam';
  const submit = document.createElement('button'); submit.className='btn primary'; submit.textContent='Submit exam';
  actions.appendChild(retake); actions.appendChild(submit);
  bar.appendChild(status); bar.appendChild(actions);
  ex.appendChild(bar);

  function answered(){ return Object.keys(picks).length; }
  function savePicks(){
    const all = store.exam;
    all[sid] = Object.assign({}, all[sid] || {}, {picks, submitted:false});
    store.exam = all;
  }
  function updateBar(){
    const n = answered();
    status.textContent = `${n} / ${qs.length} answered`;
    submit.disabled = n === 0;
  }
  function grade(){
    let correct = 0;
    rows.forEach((r,qi)=>{
      const pick = picks[qi];
      r.btns.forEach(b=>{
        b.disabled = true; b.classList.remove('picked');
        if(b._correct) b.classList.add('correct');
        else if(pick === b._text) b.classList.add('wrong');
      });
      if(pick != null && r.btns.some(b=>b._correct && b._text === pick)) correct++;
      else r.qd.classList.add('missed');
      r.expl.classList.add('show');
    });
    return correct;
  }
  function paintResult(){
    const correct = grade();
    const score = correct / qs.length;
    const passed = score >= PASS_MARK;
    status.innerHTML = `<span class="exam-score ${passed?'pass':'fail'}">${pct(score)}</span>
      <span class="exam-sub">${correct} of ${qs.length} correct — ${passed
        ? 'passed. Read the explanations on anything you missed.'
        : `keep revising, ${pct(PASS_MARK)} to pass.`}</span>`;
    submit.style.display = 'none';
    retake.style.display = '';
    retake.classList.add('primary');
    return score;
  }

  submit.addEventListener('click', ()=>{
    const n = answered();
    if(n < qs.length && !confirm(
      `You've answered ${n} of ${qs.length}. Submit anyway? Unanswered questions count as wrong.`)) return;
    submitted = true;
    const score = paintResult();
    const all = store.exam, prev = all[sid] || {};
    all[sid] = {best: Math.max(prev.best || 0, score), last: score,
                taken: (prev.taken || 0) + 1, submitted:true, picks};
    store.exam = all;
    paintBadge();
    renderNav();
    renderReview();
    head.scrollIntoView({behavior:'smooth', block:'start'});
  });
  retake.addEventListener('click', ()=>{
    const all = store.exam, prev = all[sid] || {};
    all[sid] = {best: prev.best, last: prev.last, taken: prev.taken || 0};
    store.exam = all;
    renderExam(ex);
    window.scrollTo({top:0});
  });

  if(submitted){ paintResult(); }
  else { retake.style.display = 'none'; updateBar(); }
}
const EXAM_ELS = Array.from(document.querySelectorAll('.exam'));
EXAM_ELS.forEach(renderExam);

/* ---------- personal notes ---------- */
document.querySelectorAll('.lesson').forEach(sec=>{
  if(sec.id==='home' || sec.dataset.kind) return;
  const foot = sec.querySelector('.lesson-footer');
  if(!foot) return;
  const box = document.createElement('div'); box.className = 'notes';
  box.innerHTML = `<h3>My Notes</h3><div class="notes-sub">Saved locally on this device — not part of the course content.</div>
    <textarea class="notes-area" placeholder="Jot down anything you want to remember about this lesson…"></textarea>
    <div class="notes-status"></div>`;
  foot.insertAdjacentElement('beforebegin', box);
  const area = box.querySelector('.notes-area');
  const status = box.querySelector('.notes-status');
  area.value = store.notes[sec.id] || '';
  let saveTimer;
  area.addEventListener('input', ()=>{
    status.textContent = '';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(()=>{
      const n = store.notes;
      if(area.value){ n[sec.id] = area.value; } else { delete n[sec.id]; }
      store.notes = n;
      status.textContent = 'Saved';
    }, 400);
  });
});

/* ---------- navigation ---------- */
const navList = document.getElementById('nav-list');
function renderNav(){
  navList.innerHTML='';
  SECTIONS.forEach(sec=>{
    /* only label the sections once there is more than one of them */
    if(SECTIONS.length>1){
      const sh = document.createElement('div');
      sh.className='nav-section'; sh.textContent = sec.short || sec.title;
      navList.appendChild(sh);
    }
    sec.months.forEach(mid=>{
      const m = MONTHS.find(x=>x.id===mid);
      if(!m) return;
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
    if(!sec.review && !sec.exam) return;
    const rec = store.exam[sec.id] || {};
    const g = document.createElement('div'); g.className='month-group review-group';
    g.innerHTML = `<div class="month-head"><h2>${sec.short||sec.title} · Review</h2>
      <span class="count">${rec.best==null?'':pct(rec.best)}</span></div>`;
    [[sec.review,'Section Summary'],[sec.exam,'Final Exam']].forEach(([id,label])=>{
      if(!id) return;
      const a = document.createElement('div');
      a.className='nav-lesson'; a.dataset.target = id;
      a.innerHTML = `<span class="dot rdot">◆</span><span class="n"></span><span>${label}</span>`;
      a.addEventListener('click', ()=>show(id));
      g.appendChild(a);
    });
    navList.appendChild(g);
  });
  updateProgress();
}

/* ---------- review-page footers (summary / exam pages) ---------- */
document.querySelectorAll('.review-footer').forEach(foot=>{
  const page = foot.closest('.lesson');
  const sec = SECTIONS.find(s=>s.review===page.id || s.exam===page.id);
  if(!sec) return;
  foot.classList.add('lesson-footer');
  const mk = (label, target, primary)=>{
    const b = document.createElement('button');
    b.className = 'btn' + (primary?' primary':'');
    b.textContent = label;
    b.addEventListener('click', ()=>show(target));
    return b;
  };
  if(page.id === sec.review){
    foot.appendChild(mk('← Home','home',false));
    if(sec.exam) foot.appendChild(mk('Take the final exam →', sec.exam, true));
  } else {
    if(sec.review) foot.appendChild(mk('← Section Summary', sec.review, false));
    foot.appendChild(mk('Home', 'home', false));
  }
});
function updateProgress(){
  const n = store.done.length;
  document.getElementById('prog-fill').style.width = (n/LESSONS.length*100)+'%';
  document.getElementById('prog-label').textContent = `${n} / ${LESSONS.length} lessons complete`;
}

/* ---------- footer buttons ---------- */
const doneRefreshers = [];
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
  refresh(); doneRefreshers.push(refresh);
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
  /* grouped by section: the card number restarts per section and the noun comes
     from that section's `label` ("Month" for the core, "Part" for a mentorship). */
  SECTIONS.forEach(sec=>{
    if(SECTIONS.length>1){
      const sh = document.createElement('h3');
      sh.className='sec-head'; sh.textContent = sec.title;
      wrap.appendChild(sh);
    }
    sec.months.forEach((mid,i)=>{
      const m = MONTHS.find(x=>x.id===mid);
      if(!m) return;
      const items = LESSONS.filter(l=>l.month===m.id);
      const doneCt = items.filter(l=>store.done.includes(l.id)).length;
      const c = document.createElement('div');
      /* a part whose lessons aren't written yet must not be clickable */
      c.className = 'mcard'+(items.length?'':' empty');
      c.innerHTML = `<div class="m-num">${sec.label||'Month'} ${i+1}</div><h3>${m.title.split('— ')[1]||m.title}</h3><p>${m.desc}</p><div class="m-prog">${doneCt}/${items.length} lessons · ${items.reduce((a,l)=>a+(IMG_COUNTS[SLUG_BY_ID[l.id]]||0),0)} charts</div>`;
      if(items.length) c.addEventListener('click', ()=>show(items[0].id));
      wrap.appendChild(c);
    });
  });
}

/* ---------- section review cards on home ---------- */
function renderReview(){
  const wrap = document.getElementById('review-cards');
  if(!wrap) return;
  wrap.innerHTML='';
  SECTIONS.forEach(sec=>{
    if(!sec.review && !sec.exam) return;
    const items = LESSONS.filter(l=>sec.months.includes(l.month));
    const doneCt = items.filter(l=>store.done.includes(l.id)).length;
    const rec = store.exam[sec.id] || {};
    const card = (kind, title, body, meta, target)=>{
      const c = document.createElement('div'); c.className='rcard';
      c.innerHTML = `<div class="r-num">${kind}</div><h3>${title}</h3><p>${body}</p><div class="r-prog">${meta}</div>`;
      c.addEventListener('click', ()=>show(target));
      wrap.appendChild(c);
    };
    if(sec.review) card('Revision', `${sec.title} — Summary`,
      'Every concept from the lessons condensed onto one page, in the order it was taught.',
      `${items.length} lessons · ${sec.months.length} months · ${doneCt} completed`, sec.review);
    if(sec.exam) card('Assessment', `${sec.title} — Final Exam`,
      `${(EXAMS[sec.id]||[]).length} questions across every month. Nothing is graded until you submit.`,
      rec.best==null ? 'Not attempted yet'
        : `Best ${pct(rec.best)} · last ${pct(rec.last)} · ${rec.taken} attempt${rec.taken===1?'':'s'}`,
      sec.exam);
  });
}

/* ---------- reset controls on home ---------- */
function renderReset(){
  const panel = document.getElementById('reset-panel');
  if(!panel) return;
  panel.innerHTML = `<h3>Start over</h3>
    <p class="reset-sub">Clear saved answers so you can take everything again.
      <strong>Your personal lesson notes are never touched.</strong></p>
    <div class="reset-btns"></div><div class="reset-status"></div>`;
  const btns = panel.querySelector('.reset-btns');
  const status = panel.querySelector('.reset-status');

  const clearQuizzes = ()=>{ localStorage.removeItem('ict-quiz'); QUIZ_ELS.forEach(renderQuiz); };
  const clearExams   = ()=>{ localStorage.removeItem('ict-exam'); EXAM_ELS.forEach(renderExam); };
  const clearDone    = ()=>{ localStorage.removeItem('ict-done'); doneRefreshers.forEach(f=>f()); };

  const actions = [
    ['Reset lesson quizzes', 'Clear every lesson-check answer? You can then take them all again.',
      clearQuizzes, 'Lesson quizzes reset.'],
    ['Reset final exams', 'Clear every final exam — including the best scores?',
      clearExams, 'Final exams reset.'],
    ['Reset lesson progress', 'Clear which lessons are marked complete?',
      clearDone, 'Lesson progress reset.'],
    ['Reset everything', 'Clear all quizzes, exams and lesson progress? Your notes are kept.',
      ()=>{ clearQuizzes(); clearExams(); clearDone(); }, 'Everything reset — notes kept.']
  ];
  actions.forEach(([label, ask, run, done], i)=>{
    const b = document.createElement('button');
    b.className = 'btn' + (i===actions.length-1 ? ' danger' : '');
    b.textContent = label;
    b.addEventListener('click', ()=>{
      if(!confirm(ask)) return;
      run(); renderNav(); renderCards(); renderReview();
      status.textContent = done;
    });
    btns.appendChild(b);
  });
}

/* ---------- migration banner ---------- */
/* Site chrome, not course content: the old GitHub Pages copy is frozen, so
   every page invites the reader over to the Vercel-hosted version. Dismissal
   lives in sessionStorage — a separate store from the ict-* localStorage keys,
   so it cannot collide with them, and it lapses when the tab closes ("back on
   every new visit"). Nothing here reads or writes ict-notes. */
const NEW_SITE = 'https://algo.the-system.site';
const MIGRATE_KEY = 'algo-migrated-hidden';

/* Lesson ids are identical on the new site, so #m4-03 -> /lesson/m4-03.
   Home and the review/exam pages go to the root: /lesson/<id> and / are the
   only routes confirmed to exist there, so don't invent one for the others. */
function migrateUrl(id){
  const el = id && document.getElementById(id);
  if(!el || el.id === 'home' || el.dataset.kind) return NEW_SITE + '/';
  return NEW_SITE + '/lesson/' + el.id;
}
function migrateHidden(){
  try{ return sessionStorage.getItem(MIGRATE_KEY) === '1'; }catch(e){ return false; }
}
function renderMigrate(id){
  const slot = document.getElementById('migrate-slot');
  if(!slot) return;
  slot.innerHTML = '';
  if(migrateHidden()) return;
  const url = migrateUrl(id), box = document.createElement('div');
  if(!id || id === 'home'){
    box.className = 'migrate';
    box.innerHTML = `<div class="mg-eyebrow">The course has moved</div>
      <h3>This version is no longer being updated.</h3>
      <p>New lessons and fixes now go to <strong>algo.the-system.site</strong>. This copy stays
        online for now, but it won't receive updates and may stop working. Your progress and
        notes are saved in this browser for this site only &mdash;
        <strong>they don't move with you</strong>.</p>
      <div class="mg-actions">
        <a class="btn primary" href="${url}">Go to the new site &rarr;</a>
        <button class="mini-btn" data-mg="x">Not now</button>
      </div>`;
  }else{
    box.className = 'migrate compact';
    box.innerHTML = `<span class="mg-dot"></span>
      <span class="mg-text">This version is no longer updated &mdash; the course has moved.</span>
      <a class="mg-go" href="${url}">Continue on the new site &rarr;</a>
      <button class="mg-x" data-mg="x" title="Dismiss" aria-label="Dismiss">&#10005;</button>`;
  }
  box.querySelector('[data-mg="x"]').addEventListener('click', ()=>{
    try{ sessionStorage.setItem(MIGRATE_KEY, '1'); }catch(e){}
    slot.innerHTML = '';
  });
  slot.appendChild(box);
}

/* ---------- routing ---------- */
function show(id){
  document.querySelectorAll('.lesson').forEach(el=>el.classList.remove('visible'));
  const el = document.getElementById(id) || document.getElementById('home');
  el.classList.add('visible');
  document.querySelectorAll('.nav-lesson').forEach(a=>a.classList.toggle('active', a.dataset.target===el.id));
  renderMigrate(el.id);
  window.scrollTo({top:0});
  sidebar.classList.remove('open');
  location.hash = el.id;
}
const sidebar = document.getElementById('sidebar');
document.getElementById('menu-toggle').addEventListener('click', ()=>sidebar.classList.toggle('open'));
/* browser back/forward (and any hand-edited hash) should route too — show()
   writes the hash itself, so skip the echo when the target is already open. */
window.addEventListener('hashchange', ()=>{
  const el = document.getElementById(location.hash.slice(1)) || document.getElementById('home');
  if(!el.classList.contains('visible')) show(el.id);
});

renderNav(); renderCards(); renderReview(); renderReset();
show(location.hash ? location.hash.slice(1) : 'home');
