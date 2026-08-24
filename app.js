/* ============================================================
   HTML JR  ::  app.js
   pick a loader and it opens. bring your own and it opens.
   ============================================================ */
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const state = {
  loaders: [],
  hero: [],
  heroIdx: 0,
  heroTimer: null,
  query: '',
  view: 'library',
};

/* ---------- helpers ---------- */
function shade(hex, amt){
  const n = parseInt((hex || '#7b6cff').replace('#',''), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function grad(hex){ return `linear-gradient(135deg, ${shade(hex, 18)} 0%, ${hex} 45%, ${shade(hex, -46)} 100%)`; }
function letter(name){ return (name || '?').trim().charAt(0).toUpperCase(); }
function esc(s = ''){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function hostOf(u){ try { return new URL(u).hostname.replace(/^www\./,''); } catch { return u; } }

/* ============================================================
   DATA
   ============================================================ */
const FALLBACK = { loaders: [
  { id:'t9os', name:'T9OS', version:'V.097', tag:'desktop os', url:'https://t9os.space/', source:'https://github.com/t9lat22/t9lat22.github.io', logo:'https://cdn.jsdelivr.net/gh/t9lat22/t9lat22.github.io@master/Logo22.png', accent:'#5b8cff', featured:true, blurb:'a whole fake desktop with games and apps built in' },
  { id:'cine-os', name:'Cine OS', version:'V2', tag:'desktop os', url:'https://cdn.jsdelivr.net/gh/nathanpikelny6-oss/CineOS@main/index.html', source:'https://github.com/nathanpikelny6-oss/CineOS', accent:'#16c2a3', featured:true, blurb:'cinematic desktop with a boot sequence and app dock' },
  { id:'gn-math', name:'gn-math', version:'', tag:'games', url:'https://cdn.jsdelivr.net/gh/genizymath/gnnew@main/index.html', source:'https://github.com/genizymath/gnnew', logo:'https://cdn.jsdelivr.net/gh/genizymath/gnnew@main/favicon.png', accent:'#fc2651', featured:true, blurb:'big grid of unblocked games, loads fast' },
  { id:'cherri', name:'Cherri', version:'V2', tag:'proxy', url:'https://cdn.jsdelivr.net/gh/x8rr/cherri-v2-leak@main/public/index.html', source:'https://github.com/x8rr/cherri-v2-leak', logo:'https://cdn.jsdelivr.net/gh/x8rr/cherri-v2-leak@main/public/assets/img/fav.png', accent:'#c9184a', featured:true, blurb:'leaked build of the cherri proxy' },
  { id:'discord', name:'Discord', version:'', tag:'chat', url:'library/discord.html', source:'', accent:'#5865f2', featured:false, blurb:'the discord landing page, saved and ready to open' },
  { id:'google-classroom', name:'Google Classroom', version:'', tag:'video', url:'library/google-classroom.html', source:'', accent:'#2e7d32', featured:false, blurb:'search and watch, tucked behind a classroom tab' },
]};

async function loadData(){
  let data = null;
  try { const res = await fetch('loaders.json', { cache:'no-cache' }); if (res.ok) data = await res.json(); } catch {}
  if (!data || !Array.isArray(data.loaders) || !data.loaders.length) data = FALLBACK;
  state.loaders = data.loaders.map(l => ({ accent:'#7b6cff', tag:'loader', version:'', blurb:'', source:'', logo:'', featured:false, ...l }));
  state.hero = state.loaders.filter(l => l.featured);
  if (!state.hero.length) state.hero = state.loaders.slice(0, 4);
  buildHero();
  buildGrid();
  $('#navCount').textContent = state.loaders.length + (state.loaders.length === 1 ? ' loader' : ' loaders');
}

/* ============================================================
   HERO CAROUSEL
   ============================================================ */
function buildHero(){
  const track = $('#heroTrack'), dots = $('#heroDots');
  track.innerHTML = state.hero.map(l => `
    <div class="hero__slide" style="background:${grad(l.accent)}">
      ${l.logo
        ? `<img class="hero__logo" src="${esc(l.logo)}" alt="" onerror="this.remove()">`
        : `<div class="hero__glyph">${esc(letter(l.name))}</div>`}
      <div class="hero__inner">
        <span class="hero__eyebrow">popular right now</span>
        <h2 class="hero__name">${esc(l.name)}${l.version ? `<span class="hero__ver">${esc(l.version)}</span>` : ''}</h2>
        ${l.blurb ? `<p class="hero__blurb">${esc(l.blurb)}</p>` : ''}
        <div class="hero__row">
          <button class="hero__load" data-id="${esc(l.id)}">Load</button>
          ${l.source ? `<a class="hero__src" href="${esc(l.source)}" target="_blank" rel="noopener">source</a>` : ''}
        </div>
      </div>
    </div>`).join('');

  dots.innerHTML = state.hero.map((_, i) => `<button class="hero__dot${i===0?' on':''}" data-i="${i}" aria-label="slide ${i+1}"></button>`).join('');

  $$('.hero__load', track).forEach(b => b.addEventListener('click', () => {
    const l = state.hero.find(x => x.id === b.dataset.id); if (l) open(l);
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
function goHero(i, manual){
  const n = state.hero.length; if (!n) return;
  state.heroIdx = (i + n) % n; applyHero();
  if (manual) startHero();
}
function startHero(){ stopHero(); if (state.hero.length > 1) state.heroTimer = setInterval(() => goHero(state.heroIdx + 1), 5200); }
function stopHero(){ if (state.heroTimer) { clearInterval(state.heroTimer); state.heroTimer = null; } }

/* ============================================================
   GRID
   ============================================================ */
function buildGrid(){
  const grid = $('#grid');
  const q = state.query.toLowerCase();
  const list = q
    ? state.loaders.filter(l => (l.name+' '+l.tag+' '+l.blurb+' '+(l.version||'')).toLowerCase().includes(q))
    : state.loaders;

  $('#empty').hidden = list.length > 0;
  grid.innerHTML = list.map(l => `
    <article class="card" tabindex="0" data-id="${esc(l.id)}">
      <div class="card__art" style="background:${grad(l.accent)}">
        <span class="card__chip">${esc(l.tag)}</span>
        <span class="card__glyph">${esc(letter(l.name))}</span>
        ${l.logo ? `<img class="card__logo" src="${esc(l.logo)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
        <span class="card__play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
      </div>
      <div class="card__body">
        <div class="card__name">${esc(l.name)}${l.version ? `<span class="card__ver">${esc(l.version)}</span>` : ''}</div>
        ${l.blurb ? `<div class="card__blurb">${esc(l.blurb)}</div>` : ''}
        ${l.source ? `<a class="card__src" href="${esc(l.source)}" target="_blank" rel="noopener">${esc(hostForSource(l.source))} &#8599;</a>` : ''}
      </div>
    </article>`).join('');

  $$('.card', grid).forEach(card => {
    const l = state.loaders.find(x => x.id === card.dataset.id);
    card.addEventListener('click', e => { if (e.target.closest('.card__src')) return; open(l); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(l); } });
  });
}
function hostForSource(s){ return /github\.com/.test(s) ? 'github' : hostOf(s); }

/* ============================================================
   VIEWER
   ============================================================ */
function open(loader){
  const v = $('#viewer');
  $('#vTitle').textContent = loader.name || hostOf(loader.url);
  $('#vVer').textContent = loader.version || '';
  v.hidden = false;
  document.body.style.overflow = 'hidden';
  v._url = loader.url;
  loadFrame(loader.url);
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
function closeViewer(){
  $('#viewer').hidden = true;
  $('#frame').src = 'about:blank';
  document.body.style.overflow = '';
}

/* ============================================================
   VIEW SWITCHING (island)
   ============================================================ */
function setView(v){
  state.view = v;
  const lib = v === 'library';
  $('#libraryView').hidden = !lib;
  $('#htmlView').hidden = lib;
  $$('.island__tab').forEach(t => t.classList.toggle('is-active', t.dataset.view === v));
  $('#islandPill').style.transform = `translateX(${lib ? 0 : 122}px)`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   BRING YOUR OWN  (file + github)
   ============================================================ */
function loadWithSpinner(obj){
  const lf = $('#loadingFile');
  lf.hidden = false;
  setTimeout(() => { lf.hidden = true; open(obj); }, 850);
}
function handleFile(file){
  if (!file) return;
  const ok = /\.(html?|svg)$/i.test(file.name) || /html|svg/.test(file.type);
  if (!ok){ toast('only .html and .svg files', 'warn'); return; }
  const type = /\.svg$/i.test(file.name) || /svg/.test(file.type) ? 'svg' : 'html';
  const mime = type === 'svg' ? 'image/svg+xml' : 'text/html';
  const reader = new FileReader();
  reader.onload = () => {
    const url = URL.createObjectURL(new Blob([reader.result], { type: mime }));
    loadWithSpinner({ name: file.name, version: '', url });
  };
  reader.onerror = () => toast('could not read that file', 'warn');
  reader.readAsText(file);
}
function ghLoad(){
  const raw = $('#ghInput').value.trim();
  if (!raw) return;
  const url = resolveLoad(raw);
  loadWithSpinner({ name: labelFor(raw, url), version: '', url });
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
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}/index.html`;
}
function labelFor(raw, url){
  const m = raw.match(/^([\w.-]+)\/([\w.-]+)$/);
  return m ? m[2] : hostOf(url);
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
function renderScratch(){
  const code = $('#edCode').value;
  try { localStorage.setItem('jr:scratch', code); } catch {}
  $('#edPreview').srcdoc = code;
}
function scratchToViewer(){
  const url = URL.createObjectURL(new Blob([$('#edCode').value], { type: 'text/html' }));
  open({ name: 'scratch', version: '', url });
}

/* ============================================================
   WIRE UP
   ============================================================ */
function wire(){
  $('#search').addEventListener('input', e => { state.query = e.target.value; buildGrid(); });
  $('#brandHome').addEventListener('click', () => { setView('library'); state.query = ''; $('#search').value = ''; buildGrid(); });

  $('#heroPrev').addEventListener('click', () => goHero(state.heroIdx - 1, true));
  $('#heroNext').addEventListener('click', () => goHero(state.heroIdx + 1, true));

  // island
  $$('.island__tab').forEach(t => t.addEventListener('click', () => setView(t.dataset.view)));

  // bring your own
  const drop = $('#drop'), fileInput = $('#fileInput');
  drop.addEventListener('click', () => fileInput.click());
  drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; });
  ['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); if (ev === 'drop' || !drop.contains(e.relatedTarget)) drop.classList.remove('drag'); }));
  drop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) handleFile(f); });
  $('#ghBtn').addEventListener('click', ghLoad);
  $('#ghInput').addEventListener('keydown', e => { if (e.key === 'Enter') ghLoad(); });

  // viewer
  $('#vBack').addEventListener('click', closeViewer);
  $('#vReload').addEventListener('click', () => { if ($('#viewer')._url) loadFrame($('#viewer')._url); });
  $('#vNew').addEventListener('click', () => { if ($('#viewer')._url) window.open($('#viewer')._url, '_blank', 'noopener'); });
  $('#vFull').addEventListener('click', () => { const f = $('#frame'); (f.requestFullscreen || f.webkitRequestFullscreen || (()=>{})).call(f); });

  // hidden editor (corner dot + ctrl/cmd + e)
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
    if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && $('#viewer').hidden && $('#editor').hidden){
      e.preventDefault(); setView('library'); $('#search').focus();
    }
  });
}

function toast(msg, kind){
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' toast--' + kind : '');
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 250); }, 3000);
}

/* ============================================================
   INIT
   ============================================================ */
function init(){ wire(); loadData(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
