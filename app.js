/* ============================================================
   HTML JR  ::  app.js
   preloaded loaders open in a new tab.
   imported files/links open in the in-page viewer.
   ============================================================ */
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const state = { loaders: [], hero: [], heroIdx: 0, heroTimer: null, query: '', view: 'library' };

function letter(name){ return (name || '?').trim().charAt(0).toUpperCase(); }
function esc(s = ''){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function hostOf(u){ try { return new URL(u, location.href).hostname.replace(/^www\./,''); } catch { return u; } }
function openTab(url){ const w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url; }

/* ============================================================
   DATA
   ============================================================ */
const FALLBACK = { loaders: [
  { id:'t9os', name:'T9OS', version:'V.097', tag:'os', url:'https://raw.githack.com/t9lat22/t9lat22.github.io/master/index.html', source:'https://github.com/t9lat22/t9lat22.github.io', logo:'https://cdn.jsdelivr.net/gh/t9lat22/t9lat22.github.io@master/logo.png', accent:'#5b8cff', featured:true },
  { id:'cine-os', name:'Cine OS', version:'V2', tag:'os', url:'https://raw.githack.com/nathanpikelny6-oss/CineOS/main/index.html', source:'https://github.com/nathanpikelny6-oss/CineOS', accent:'#16c2a3', featured:true },
  { id:'gn-math', name:'gn-math', version:'', tag:'games', url:'library/gnmath/index.html', source:'https://github.com/genizymath/gnnew', logo:'library/gnmath/gn-mathtitle.png', accent:'#fc2651', featured:true },
  { id:'truffled', name:'Truffled', version:'', tag:'proxy', url:'https://truffled.lol/', source:'https://github.com/aukak/truffled', logo:'https://cdn.jsdelivr.net/gh/aukak/truffled@main/public/png/logo.png', accent:'#a855f7', featured:true },
  { id:'noahs-tutoring', name:"Noah's Tutoring", version:'', tag:'tutoring', url:'https://raw.githack.com/NoahsAmazingTutoringHelp/Noahs-Calculus-Tutor/master/index.html', source:'https://github.com/NoahsAmazingTutoringHelp/Noahs-Calculus-Tutor', logo:'https://cdn.jsdelivr.net/gh/NoahsAmazingTutoringHelp/Noahs-Calculus-Tutor@master/images/logo.png', accent:'#f59e0b', featured:true },
  { id:'cherri', name:'Cherri', version:'V2', tag:'proxy', url:'https://raw.githack.com/x8rr/cherri-v2-leak/main/public/index.html', source:'https://github.com/x8rr/cherri-v2-leak', logo:'https://cdn.jsdelivr.net/gh/x8rr/cherri-v2-leak@main/public/assets/img/fav.png', accent:'#c9184a', featured:false },
  { id:'discord', name:'Discord', version:'', tag:'chat', url:'library/discord.html', source:'', accent:'#5865f2', featured:false },
  { id:'google-classroom', name:'Google Classroom', version:'', tag:'video', url:'library/google-classroom.html', source:'', accent:'#2e7d32', featured:false },
]};

async function loadData(){
  let data = null;
  try { const res = await fetch('loaders.json?v=' + Date.now(), { cache:'no-store' }); if (res.ok) data = await res.json(); } catch {}
  if (!data || !Array.isArray(data.loaders) || !data.loaders.length) data = FALLBACK;
  state.loaders = data.loaders.map(l => ({ accent:'#7b6cff', tag:'', version:'', source:'', logo:'', featured:false, ...l }));
  state.hero = state.loaders.filter(l => l.featured);
  if (!state.hero.length) state.hero = state.loaders.slice(0, 5);
  buildHero();
  buildGrid();
  $('#navCount').textContent = state.loaders.length + (state.loaders.length === 1 ? ' loader' : ' loaders');
}

/* ============================================================
   HERO
   ============================================================ */
function mediaInner(l, letterClass){
  return `<span class="${letterClass}">${esc(letter(l.name))}</span>` +
    (l.logo ? `<img src="${esc(l.logo)}" alt="" onerror="this.remove()">` : '');
}
function buildHero(){
  const track = $('#heroTrack'), dots = $('#heroDots');
  track.innerHTML = state.hero.map(l => `
    <div class="hero__slide" style="--a:${esc(l.accent)}">
      <div class="hero__text">
        <h2 class="hero__name">${esc(l.name)}${l.version ? `<span class="hero__ver">${esc(l.version)}</span>` : ''}</h2>
        <div class="hero__row">
          <button class="hero__open" data-id="${esc(l.id)}">Open</button>
          ${l.source ? `<a class="hero__src" href="${esc(l.source)}" target="_blank" rel="noopener">source</a>` : ''}
        </div>
      </div>
      <div class="hero__media">${mediaInner(l, 'hero__letter')}</div>
    </div>`).join('');

  dots.innerHTML = state.hero.map((_, i) => `<button class="hero__dot${i===0?' on':''}" data-i="${i}" aria-label="slide ${i+1}"></button>`).join('');

  $$('.hero__open', track).forEach(b => b.addEventListener('click', () => {
    const l = state.hero.find(x => x.id === b.dataset.id); if (l) openTab(l.url);
  }));
  $$('.hero__dot', dots).forEach(d => d.addEventListener('click', () => goHero(+d.dataset.i, true)));

  state.heroIdx = 0; applyHero(); startHero();
  const hero = $('.hero');
  hero.addEventListener('mouseenter', stopHero);
  hero.addEventListener('mouseleave', startHero);
}
function applyHero(){
  $('#heroTrack').style.transform = `translateX(-${state.heroIdx * 100}%)`;
  $$('.hero__dot').forEach((d, i) => d.classList.toggle('on', i === state.heroIdx));
}
function goHero(i, manual){ const n = state.hero.length; if (!n) return; state.heroIdx = (i + n) % n; applyHero(); if (manual) startHero(); }
function startHero(){ stopHero(); if (state.hero.length > 1) state.heroTimer = setInterval(() => goHero(state.heroIdx + 1), 5200); }
function stopHero(){ if (state.heroTimer){ clearInterval(state.heroTimer); state.heroTimer = null; } }

/* ============================================================
   GRID
   ============================================================ */
function buildGrid(){
  const grid = $('#grid');
  const q = state.query.toLowerCase();
  const list = q ? state.loaders.filter(l => (l.name+' '+l.tag+' '+(l.version||'')).toLowerCase().includes(q)) : state.loaders;

  $('#empty').hidden = list.length > 0;
  grid.innerHTML = list.map(l => `
    <article class="card" tabindex="0" data-id="${esc(l.id)}" style="--a:${esc(l.accent)}">
      <div class="card__media">${mediaInner(l, 'card__letter')}</div>
      <div class="card__body">
        <span class="card__name">${esc(l.name)}${l.version ? `<span class="card__ver">${esc(l.version)}</span>` : ''}</span>
        ${l.tag ? `<span class="card__tag">${esc(l.tag)}</span>` : ''}
      </div>
    </article>`).join('');

  $$('.card', grid).forEach(card => {
    const l = state.loaders.find(x => x.id === card.dataset.id);
    card.addEventListener('click', () => openTab(l.url));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTab(l.url); } });
  });
}

/* ============================================================
   VIEW SWITCHING
   ============================================================ */
function setView(v){
  state.view = v;
  const lib = v === 'library';
  $('#libraryView').hidden = !lib;
  $('#htmlView').hidden = lib;
  $$('.island__tab').forEach(t => t.classList.toggle('is-active', t.dataset.view === v));
  $('#islandPill').style.transform = `translateX(${lib ? 0 : 116}px)`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   IN-PAGE VIEWER  (imports render here, reliably)
   ============================================================ */
function openViewer(title, url){
  const v = $('#viewer');
  $('#vTitle').textContent = title || hostOf(url);
  v.hidden = false;
  v._url = url;
  document.body.style.overflow = 'hidden';
  loadFrame(url);
}
function loadFrame(url){
  const frame = $('#frame'), loading = $('#vLoading');
  loading.style.display = 'flex';
  let done = false;
  frame.onload = () => { done = true; loading.style.display = 'none'; };
  setTimeout(() => { if (!done) loading.style.display = 'none'; }, 6000);
  frame.src = 'about:blank';
  requestAnimationFrame(() => { frame.src = url; });
}
function closeViewer(){ $('#viewer').hidden = true; $('#frame').src = 'about:blank'; document.body.style.overflow = ''; }

/* ============================================================
   IMPORTER  (file + link)  ->  in-page viewer
   ============================================================ */
function handleFile(file){
  if (!file) return;
  const ok = /\.(html?|svg)$/i.test(file.name) || /html|svg/.test(file.type);
  if (!ok){ toast('only .html and .svg files'); return; }
  const mime = /\.svg$/i.test(file.name) || /svg/.test(file.type) ? 'image/svg+xml' : 'text/html';
  const lf = $('#loadingFile'); lf.hidden = false;
  const reader = new FileReader();
  reader.onload = () => {
    const url = URL.createObjectURL(new Blob([reader.result], { type: mime }));
    setTimeout(() => { lf.hidden = true; openViewer(file.name, url); }, 500);
  };
  reader.onerror = () => { lf.hidden = true; toast('could not read that file'); };
  reader.readAsText(file);
}
function ghLoad(){
  const raw = $('#ghInput').value.trim(); if (!raw) return;
  const url = resolveLoad(raw);
  const title = raw.match(/^([\w.-]+)\/([\w.-]+)$/) ? RegExp.$2 : hostOf(url);
  const lf = $('#loadingFile'); lf.hidden = false;
  setTimeout(() => { lf.hidden = true; openViewer(title, url); }, 700);
  $('#ghInput').value = '';
}
function resolveLoad(v){
  if (/^https?:\/\//i.test(v)){
    let m = v.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)$/i);
    if (m) return `https://raw.githack.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    m = v.match(/^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/i);
    if (m) return `https://raw.githack.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    m = v.match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)\/?$/i);
    if (m) return repoToUrl(m[1], m[2].replace(/\.git$/,''));
    return v;
  }
  const m = v.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (m) return repoToUrl(m[1], m[2].replace(/\.git$/,''));
  return v;
}
function repoToUrl(owner, repo){
  if (/\.github\.io$/i.test(repo)) return `https://${repo}/`;
  return `https://raw.githack.com/${owner}/${repo}/main/index.html`;
}

/* ============================================================
   HIDDEN SCRATCH EDITOR
   ============================================================ */
let edTimer = null;
function openEditor(){
  $('#editor').hidden = false;
  const code = $('#edCode');
  if (!code.value){ try { code.value = localStorage.getItem('jr:scratch') || ''; } catch {} }
  renderScratch();
  setTimeout(() => code.focus(), 60);
}
function closeEditor(){ $('#editor').hidden = true; }
function renderScratch(){ const c = $('#edCode').value; try { localStorage.setItem('jr:scratch', c); } catch {} $('#edPreview').srcdoc = c; }
function scratchToViewer(){ const url = URL.createObjectURL(new Blob([$('#edCode').value], { type: 'text/html' })); closeEditor(); openViewer('scratch', url); }

/* ============================================================
   WIRE
   ============================================================ */
function wire(){
  $('#search').addEventListener('input', e => { state.query = e.target.value; buildGrid(); });
  $('#brandHome').addEventListener('click', () => { setView('library'); state.query = ''; $('#search').value = ''; buildGrid(); });

  $('#heroPrev').addEventListener('click', () => goHero(state.heroIdx - 1, true));
  $('#heroNext').addEventListener('click', () => goHero(state.heroIdx + 1, true));

  $$('.island__tab').forEach(t => t.addEventListener('click', () => setView(t.dataset.view)));

  const drop = $('#drop'), fileInput = $('#fileInput');
  drop.addEventListener('click', () => fileInput.click());
  drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
  fileInput.addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) handleFile(f); });
  ['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); if (ev === 'drop' || !drop.contains(e.relatedTarget)) drop.classList.remove('drag'); }));
  drop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) handleFile(f); });
  $('#ghBtn').addEventListener('click', ghLoad);
  $('#ghInput').addEventListener('keydown', e => { if (e.key === 'Enter') ghLoad(); });

  $('#vBack').addEventListener('click', closeViewer);
  $('#vReload').addEventListener('click', () => { if ($('#viewer')._url) loadFrame($('#viewer')._url); });
  $('#vNew').addEventListener('click', () => { if ($('#viewer')._url) openTab($('#viewer')._url); });

  $('#editorTrigger').addEventListener('click', openEditor);
  $('#edRun').addEventListener('click', renderScratch);
  $('#edClose').addEventListener('click', closeEditor);
  $('#edFull').addEventListener('click', scratchToViewer);
  $('#edWrap').addEventListener('click', () => { const c = $('#edCode'); c.style.whiteSpace = c.style.whiteSpace === 'pre' ? 'pre-wrap' : 'pre'; });
  $('#edCode').addEventListener('input', () => { clearTimeout(edTimer); edTimer = setTimeout(renderScratch, 320); });

  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'e' || e.key === 'E')){ e.preventDefault(); $('#editor').hidden ? openEditor() : closeEditor(); return; }
    if (e.key === 'Escape'){
      if (!$('#editor').hidden){ closeEditor(); return; }
      if (!$('#viewer').hidden){ closeViewer(); return; }
    }
    if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && $('#editor').hidden && $('#viewer').hidden){ e.preventDefault(); setView('library'); $('#search').focus(); }
  });
}

function toast(msg){
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 250); }, 3000);
}

function init(){ wire(); loadData(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
