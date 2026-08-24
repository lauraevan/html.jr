/* ============================================================
   HTML JR — underground loader  ::  app.js
   pure client-side. no build step. deploy-anywhere (githack).
   ============================================================ */
'use strict';

const JR = {
  listings: [],          // library manifest, normalized
  view: 'all',           // active filter tab
  query: '',             // search string
  fav: loadSet('jr:fav'),
  recent: loadArr('jr:recent'),   // [{id,title,type,src,...}]
  current: null,         // currently open item in viewer
  safeMode: false,
  ghToken: localStorage.getItem('jr:ghtoken') || '',
};

/* ---------- tiny storage helpers ---------- */
function loadSet(k){ try { return new Set(JSON.parse(localStorage.getItem(k) || '[]')); } catch { return new Set(); } }
function saveSet(k,s){ try { localStorage.setItem(k, JSON.stringify([...s])); } catch {} }
function loadArr(k){ try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } }
function saveArr(k,a){ try { localStorage.setItem(k, JSON.stringify(a)); } catch {} }
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ============================================================
   BOOT SEQUENCE
   ============================================================ */
const BOOT_LINES = [
  ['jr-loader v1.0  ·  cold boot', 'mut'],
  ['[ ok ] mounting /dev/floor', ''],
  ['[ ok ] spooling iframe sandbox layer', ''],
  ['[ ok ] handshaking with githack relay', ''],
  ['[ ?? ] verifying seller signatures ....... skipped', 'mut'],
  ['[ !! ] entering UNREGULATED ZONE', 'hot'],
  ['[ ok ] the floor is open.', ''],
];
function runBoot(){
  const boot = $('#boot'), log = $('#bootLog');
  let i = 0;
  const done = () => {
    boot.classList.add('gone');
    setTimeout(() => boot.remove(), 550);
    window.removeEventListener('keydown', skip, true);
    window.removeEventListener('pointerdown', skip, true);
  };
  const skip = () => done();
  window.addEventListener('keydown', skip, true);
  window.addEventListener('pointerdown', skip, true);
  const tick = () => {
    if (i >= BOOT_LINES.length){ setTimeout(done, 550); return; }
    const [txt, cls] = BOOT_LINES[i++];
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = txt + '\n';
    log.appendChild(span);
    setTimeout(tick, 120 + Math.random()*160);
  };
  tick();
}

/* ============================================================
   TICKER
   ============================================================ */
function buildTicker(){
  const bits = [
    'welcome to <b>HTML JR</b> — load anything, ask no questions',
    'now trading: <b>.html</b> · <b>.svg</b>',
    '<span class="hot">⚠ unregulated zone</span>',
    'import any github repo — <b>owner/repo</b>',
    'full execution support · live iframe · no leash',
    'drop a file anywhere to load it',
    'seller signatures <span class="hot">unverified</span>',
    'the floor never closes',
  ];
  const html = bits.map(b => `<span>${b}</span>`).join('<span>◆</span>');
  $('#tickerTrack').innerHTML = html + '<span>◆</span>' + html; // duplicate for seamless loop
}

/* ============================================================
   LIBRARY LOAD
   ============================================================ */
async function loadLibrary(){
  let data = null;
  try {
    const res = await fetch('library.json', { cache: 'no-cache' });
    if (res.ok) data = await res.json();
  } catch { /* fall through to fallback */ }
  if (!data || !Array.isArray(data.listings)) data = FALLBACK_LIBRARY;

  JR.listings = data.listings.map(normalizeListing);
  render();
  if (JR.listings.length) toast(`${JR.listings.length} listings live on the floor`, 'ok');
}

function normalizeListing(it){
  const type = (it.type || guessType(it.src) || 'html').toLowerCase();
  return {
    id: it.id || slug(it.title || it.src),
    title: it.title || pretty(it.src),
    type,
    src: it.src,
    desc: it.desc || it.description || '',
    seller: it.seller || 'anon',
    price: it.price || '0.00Ξ',
    rating: typeof it.rating === 'number' ? it.rating : (4 + Math.random()).toFixed(1) * 1,
    tags: it.tags || [],
    thumb: it.thumb || '',
    featured: !!it.featured,
    live: type === 'html' && isPreviewable(it.src),
    origin: it.origin || 'library',
  };
}

function guessType(src=''){ const s = src.split('?')[0].toLowerCase(); if (s.endsWith('.svg')) return 'svg'; if (/\.html?$/.test(s)) return 'html'; return ''; }
function isPreviewable(src=''){ return /^(?!https?:)/.test(src) || /raw\.githack\.com|cdn\.jsdelivr\.net/.test(src); }
function slug(s=''){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48) || 'item-'+Math.random().toString(36).slice(2,7); }
function pretty(src=''){ return decodeURIComponent(src.split('/').pop().split('?')[0].replace(/\.(html?|svg)$/i,'')).replace(/[-_]/g,' ') || 'untitled'; }

/* ============================================================
   RENDER FLOOR
   ============================================================ */
function currentList(){
  let list;
  if (JR.view === 'fav')       list = JR.listings.filter(x => JR.fav.has(x.id)).concat(JR.recent.filter(x => JR.fav.has(x.id)));
  else if (JR.view === 'recent') list = JR.recent.slice();
  else if (JR.view === 'html') list = JR.listings.filter(x => x.type === 'html');
  else if (JR.view === 'svg')  list = JR.listings.filter(x => x.type === 'svg');
  else                         list = JR.listings.slice();

  // de-dupe by id
  const seen = new Set(); list = list.filter(x => x && !seen.has(x.id) && seen.add(x.id));

  if (JR.query){
    const q = JR.query.toLowerCase();
    list = list.filter(x =>
      (x.title||'').toLowerCase().includes(q) ||
      (x.desc||'').toLowerCase().includes(q) ||
      (x.seller||'').toLowerCase().includes(q) ||
      (x.tags||[]).join(' ').toLowerCase().includes(q));
  }
  // featured first
  return list.sort((a,b) => (b.featured?1:0) - (a.featured?1:0));
}

function render(){
  const list = currentList();
  const grid = $('#grid');
  grid.innerHTML = '';
  $('#emptyState').classList.toggle('hidden', list.length > 0);

  const titles = { all:'// the floor', html:'// .html listings', svg:'// .svg listings', fav:'// saved', recent:'// recent loads' };
  $('#floorTitle').textContent = titles[JR.view] || '// the floor';
  $('#countStatus').textContent = `${JR.listings.length} listings`;

  const frag = document.createDocumentFragment();
  list.forEach(it => frag.appendChild(makeCard(it)));
  grid.appendChild(frag);
  hydrateThumbs();
}

function makeCard(it){
  const el = document.createElement('article');
  el.className = 'card';
  el.tabIndex = 0;
  const badgeClass = it.origin === 'github' ? 'git' : it.type;
  const badgeText = it.origin === 'github' ? 'GIT' : it.type.toUpperCase();
  const on = JR.fav.has(it.id) ? 'on' : '';
  const stars = '★'.repeat(Math.round(Math.min(5, it.rating||4))).padEnd(5,'☆');

  el.innerHTML = `
    <div class="card__thumb" data-type="${esc(it.type)}">
      <div class="card__glyph">${it.type === 'svg' ? '◆' : '&lt;/&gt;'}</div>
      <span class="card__badge ${badgeClass}">${badgeText}</span>
      <button class="card__fav ${on}" title="save">★</button>
    </div>
    <div class="card__body">
      <div class="card__title">${esc(it.title)}</div>
      ${it.desc ? `<div class="card__desc">${esc(it.desc)}</div>` : ''}
      ${it.tags && it.tags.length ? `<div class="card__tags">${it.tags.slice(0,4).map(t=>`<span>${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="card__meta">
        <span class="card__seller">${esc(it.seller)}</span>
        <span class="card__price">${esc(it.price)}</span>
      </div>
      <div class="card__rating"><b>${stars}</b> · ${(it.rating||4).toFixed ? (it.rating).toFixed(1) : it.rating}</div>
    </div>`;

  // interactions
  el.addEventListener('click', e => { if (e.target.closest('.card__fav')) return; openItem(it); });
  el.addEventListener('keydown', e => { if (e.key === 'Enter') openItem(it); });
  el.querySelector('.card__fav').addEventListener('click', e => { e.stopPropagation(); toggleFav(it); e.currentTarget.classList.toggle('on'); });

  el._item = it;
  return el;
}

/* live scaled-iframe / img thumbnails, lazily */
let thumbObserver;
function hydrateThumbs(){
  if (thumbObserver) thumbObserver.disconnect();
  thumbObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const it = card._item;
      const thumb = card.querySelector('.card__thumb');
      if (thumb.dataset.hydrated) { thumbObserver.unobserve(card); return; }
      thumb.dataset.hydrated = '1';
      thumbObserver.unobserve(card);
      const url = resolveRender(it.src);
      if (it.thumb){
        addImg(thumb, it.thumb);
      } else if (it.type === 'svg'){
        addImg(thumb, url);
      } else if (it.live){
        const f = document.createElement('iframe');
        f.className = 'thumb-frame'; f.setAttribute('sandbox','allow-scripts allow-same-origin');
        f.loading = 'lazy'; f.src = url;
        thumb.insertBefore(f, thumb.querySelector('.card__badge'));
      }
    });
  }, { rootMargin: '200px' });
  $$('.card').forEach(c => thumbObserver.observe(c));
}
function addImg(thumb, src){
  const img = new Image();
  img.loading = 'lazy'; img.src = src;
  img.onerror = () => img.remove();
  thumb.insertBefore(img, thumb.querySelector('.card__badge'));
}

/* ============================================================
   URL RESOLUTION  (github/raw -> githack for real rendering)
   ============================================================ */
function resolveRender(src){
  if (!src) return src;
  if (/^(blob:|data:)/.test(src)) return src;
  // github blob page -> githack
  let m = src.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)$/i);
  if (m) return `https://raw.githack.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
  // raw.githubusercontent -> githack
  m = src.match(/^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/i);
  if (m) return `https://raw.githack.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
  return src; // library-relative or arbitrary url, load as-is
}
/* a CORS-friendly text url for "view source" */
function resolveRaw(src){
  if (!src) return src;
  if (/^(blob:|data:)/.test(src)) return src;
  let m = src.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)$/i);
  if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
  m = src.match(/^https?:\/\/raw\.githack\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/i);
  if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
  return src;
}

/* ============================================================
   VIEWER
   ============================================================ */
function openItem(it){
  JR.current = it;
  pushRecent(it);

  const v = $('#viewer');
  v.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  $('#viewerTitle').textContent = it.title;
  $('#viewerType').textContent = it.type.toUpperCase();
  const renderUrl = resolveRender(it.src);
  $('#viewerSrc').textContent = renderUrl;
  $('#viewerSrc').title = renderUrl;
  $('#vFav').classList.toggle('on', JR.fav.has(it.id));
  $('#sourceView').classList.add('hidden');
  $('#frame').classList.remove('hidden');

  loadFrame(renderUrl);
}

function loadFrame(url){
  const frame = $('#frame');
  const loading = $('#viewerLoading');
  loading.style.display = 'flex';
  // reset sandbox per safe-mode
  if (JR.safeMode){
    frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock allow-presentation');
  } else {
    frame.removeAttribute('sandbox'); // full support
  }
  frame.onload = () => { loading.style.display = 'none'; };
  // guard: if never fires (blocked), hide after a beat
  setTimeout(() => { loading.style.display = 'none'; }, 4000);
  frame.src = 'about:blank';
  // next tick to force reload even if same url
  requestAnimationFrame(() => { frame.src = url; });
}

function closeViewer(){
  $('#viewer').classList.add('hidden');
  $('#frame').src = 'about:blank';
  document.body.style.overflow = '';
  JR.current = null;
}

async function viewSource(){
  const sv = $('#sourceView'), frame = $('#frame');
  if (!sv.classList.contains('hidden')){ // toggle back
    sv.classList.add('hidden'); frame.classList.remove('hidden'); return;
  }
  sv.textContent = 'fetching source…';
  sv.classList.remove('hidden'); frame.classList.add('hidden');
  const url = resolveRaw(JR.current.src);
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const txt = await res.text();
    sv.textContent = txt;
  } catch (e){
    sv.textContent = `// source unavailable for this origin (${esc(e.message)}).\n// cross-origin hosts may block reads. try "open in new tab" ↗`;
  }
}

/* ============================================================
   OMNI INPUT  — smart load
   ============================================================ */
function omniLoad(raw){
  const val = (raw ?? $('#omniInput').value).trim();
  if (!val) return;

  // hidden commands
  if (/^token\s+clear$/i.test(val)){ JR.ghToken=''; localStorage.removeItem('jr:ghtoken'); $('#omniInput').value=''; return toast('github token cleared','ok'); }
  const tk = val.match(/^token[:\s]+(\S+)$/i);
  if (tk){ JR.ghToken = tk[1]; localStorage.setItem('jr:ghtoken', tk[1]); $('#omniInput').value=''; return toast('github token stored (local only)','ok'); }
  if (/^help$/i.test(val)){ $('#omniInput').value=''; return toast('paste a url · owner/repo · blob/raw github link · or drop a file','warn'); }

  const kind = detectKind(val);
  if (kind.type === 'repo'){
    importRepo(kind.owner, kind.repo, kind.branch, kind.path);
  } else {
    // direct file
    const render = resolveRender(val);
    const type = guessType(val) || 'html';
    openItem({ id: slug(val), title: pretty(val) || 'external', type, src: val, seller: hostOf(val), price:'ext', rating:0, tags:['external'], origin:'external', live:isPreviewable(val) });
  }
  $('#omniInput').value = '';
}

function hostOf(u){ try { return new URL(u).hostname.replace(/^www\./,''); } catch { return 'external'; } }

function detectKind(val){
  // explicit file url
  if (/\.(html?|svg)(\?|#|$)/i.test(val) && /^https?:\/\//i.test(val)) return { type:'file' };
  // github.com/owner/repo[/tree/branch][/path...]
  let m = val.match(/^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+)(?:\/tree\/([^/\s#?]+)(?:\/(.+))?)?\/?$/i);
  if (m) return { type:'repo', owner:m[1], repo:m[2].replace(/\.git$/,''), branch:m[3]||'', path:m[4]||'' };
  // bare owner/repo  (optionally owner/repo/tree/branch)
  m = val.match(/^([\w.-]+)\/([\w.-]+)(?:\/tree\/([\w.\/-]+))?$/);
  if (m && !/\s/.test(val) && !/^https?:/i.test(val)) return { type:'repo', owner:m[1], repo:m[2].replace(/\.git$/,''), branch:m[3]||'', path:'' };
  // otherwise treat as a direct url/path
  return { type:'file' };
}

/* ============================================================
   GITHUB REPO IMPORT
   ============================================================ */
async function importRepo(owner, repo, branch, focusPath){
  const panel = $('#repoPanel'), listEl = $('#repoList');
  panel.classList.remove('hidden');
  $('#repoName').textContent = `${owner}/${repo}`;
  $('#repoBranch').textContent = branch || '…';
  listEl.innerHTML = `<div class="repo__item"><span class="spinner" style="width:16px;height:16px"></span> pulling tree…</div>`;
  panel.scrollIntoView({ behavior:'smooth', block:'nearest' });

  try {
    if (!branch){
      const meta = await gh(`https://api.github.com/repos/${owner}/${repo}`);
      branch = meta.default_branch || 'main';
      $('#repoBranch').textContent = branch;
    }
    const tree = await gh(`https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
    const files = (tree.tree || [])
      .filter(n => n.type === 'blob' && /\.(html?|svg)$/i.test(n.path))
      .sort((a,b) => a.path.localeCompare(b.path));

    if (!files.length){ listEl.innerHTML = `<div class="repo__item">no .html / .svg files found in this repo.</div>`; return; }

    renderRepoFiles(owner, repo, branch, files);
    toast(`found ${files.length} loadable file(s) in ${owner}/${repo}`, 'ok');

    // auto-open if a specific file path was given
    if (focusPath && files.some(f => f.path === focusPath)){
      loadRepoFile(owner, repo, branch, focusPath);
    }
  } catch (e){
    listEl.innerHTML = `<div class="repo__item">✕ ${esc(e.message)}</div>`;
    toast(`repo import failed: ${e.message}`, 'err');
  }
}

function renderRepoFiles(owner, repo, branch, files){
  const listEl = $('#repoList');
  const draw = (filter='') => {
    const f = filter ? files.filter(x => x.path.toLowerCase().includes(filter.toLowerCase())) : files;
    listEl.innerHTML = f.map(n => {
      const ext = /\.svg$/i.test(n.path) ? 'svg' : 'html';
      const size = n.size ? humanSize(n.size) : '';
      return `<div class="repo__item" data-path="${esc(n.path)}" data-ext="${ext}">
        <span class="ext ${ext}">${ext}</span>
        <span class="path">${esc(n.path)}</span>
        <span class="size">${size}</span>
      </div>`;
    }).join('') || `<div class="repo__item">no match.</div>`;
    $$('.repo__item[data-path]', listEl).forEach(row => {
      row.addEventListener('click', () => loadRepoFile(owner, repo, branch, row.dataset.path));
    });
  };
  draw();
  const filter = $('#repoFilter'); filter.value = '';
  filter.oninput = () => draw(filter.value);
}

function loadRepoFile(owner, repo, branch, path){
  const type = /\.svg$/i.test(path) ? 'svg' : 'html';
  const src = `https://raw.githack.com/${owner}/${repo}/${branch}/${path}`;
  openItem({
    id: slug(`${owner}-${repo}-${path}`),
    title: path.split('/').pop(),
    type, src,
    desc: `${owner}/${repo} · ${branch}`,
    seller: owner, price: 'git', rating: 0,
    tags: [repo, type], origin:'github', live:true,
  });
}

async function gh(url){
  const headers = { 'Accept':'application/vnd.github+json' };
  if (JR.ghToken) headers['Authorization'] = 'Bearer ' + JR.ghToken;
  const res = await fetch(url, { headers });
  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0')
    throw new Error('github rate limit hit — add a token: type "token: <PAT>"');
  if (res.status === 404) throw new Error('repo or branch not found (private? wrong name?)');
  if (!res.ok) throw new Error('github api ' + res.status);
  return res.json();
}
function humanSize(b){ if (b<1024) return b+'B'; if (b<1048576) return (b/1024).toFixed(1)+'K'; return (b/1048576).toFixed(1)+'M'; }

/* ============================================================
   FAVORITES / RECENT
   ============================================================ */
function toggleFav(it){
  if (JR.fav.has(it.id)) JR.fav.delete(it.id); else JR.fav.add(it.id);
  saveSet('jr:fav', JR.fav);
  // keep ad-hoc items retrievable from recent, so fav view can find them
  if (JR.fav.has(it.id) && it.origin !== 'library') pushRecent(it, true);
  if (JR.view === 'fav') render();
}
function pushRecent(it, silent){
  const rec = { id:it.id, title:it.title, type:it.type, src:it.src, desc:it.desc, seller:it.seller, price:it.price, rating:it.rating, tags:it.tags, origin:it.origin, live:it.live };
  JR.recent = [rec, ...JR.recent.filter(x => x.id !== it.id)].slice(0, 24);
  saveArr('jr:recent', JR.recent);
  if (!silent && JR.view === 'recent') render();
}

/* ============================================================
   FILE UPLOAD / DROP
   ============================================================ */
function loadLocalFile(file){
  if (!file) return;
  const okType = /\.(html?|svg)$/i.test(file.name) || /html|svg/.test(file.type);
  if (!okType){ toast('only .html and .svg files can be loaded', 'err'); return; }
  const type = /\.svg$/i.test(file.name) || /svg/.test(file.type) ? 'svg' : 'html';
  const mime = type === 'svg' ? 'image/svg+xml' : 'text/html';
  const reader = new FileReader();
  reader.onload = () => {
    const blob = new Blob([reader.result], { type: mime });
    const url = URL.createObjectURL(blob);
    openItem({ id:'local-'+slug(file.name)+'-'+Date.now().toString(36), title:file.name, type, src:url, desc:'local file', seller:'you', price:'local', rating:0, tags:['local'], origin:'local', live:false });
    toast(`loaded local file: ${file.name}`, 'ok');
  };
  reader.onerror = () => toast('could not read file', 'err');
  reader.readAsText(file);
}

/* ============================================================
   TOASTS
   ============================================================ */
let toastId = 0;
function toast(msg, kind='ok', ms=3400){
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = msg;
  $('#toasts').appendChild(el);
  const id = ++toastId; el.dataset.id = id;
  setTimeout(() => { el.style.opacity='0'; el.style.transform='translateX(20px)'; setTimeout(()=>el.remove(),200); }, ms);
}

/* ============================================================
   WIRE UP
   ============================================================ */
function wire(){
  // filter tabs
  $$('#filterTabs .tab').forEach(t => t.addEventListener('click', () => {
    $$('#filterTabs .tab').forEach(x => x.classList.remove('is-active'));
    t.classList.add('is-active');
    JR.view = t.dataset.filter; render();
  }));

  // search
  $('#searchInput').addEventListener('input', e => { JR.query = e.target.value; render(); });

  // brand -> home
  const home = () => { JR.view='all'; JR.query=''; $('#searchInput').value=''; $$('#filterTabs .tab').forEach((x,i)=>x.classList.toggle('is-active', i===0)); $('#repoPanel').classList.add('hidden'); render(); };
  $('#brandHome').addEventListener('click', home);
  $('#brandHome').addEventListener('keydown', e => { if (e.key==='Enter') home(); });

  // omni loader
  $('#loadBtn').addEventListener('click', () => omniLoad());
  $('#omniInput').addEventListener('keydown', e => { if (e.key === 'Enter') omniLoad(); });

  // file upload
  $('#uploadBtn').addEventListener('click', () => $('#fileInput').click());
  $('#fileInput').addEventListener('change', e => { if (e.target.files[0]) loadLocalFile(e.target.files[0]); e.target.value=''; });

  // drag & drop anywhere
  const row = $('#loader');
  ['dragenter','dragover'].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); $('.loader__row').classList.add('dragover'); }));
  ['dragleave','drop'].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); if (ev==='drop' || e.relatedTarget===null) $('.loader__row').classList.remove('dragover'); }));
  document.addEventListener('drop', e => {
    e.preventDefault(); $('.loader__row').classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f) { loadLocalFile(f); return; }
    const txt = e.dataTransfer.getData('text');
    if (txt){ $('#omniInput').value = txt.trim(); omniLoad(); }
  });

  // repo panel close
  $('#repoClose').addEventListener('click', () => $('#repoPanel').classList.add('hidden'));

  // viewer controls
  $('#vClose').addEventListener('click', closeViewer);
  $('#vReload').addEventListener('click', () => { if (JR.current) loadFrame(resolveRender(JR.current.src)); });
  $('#vNew').addEventListener('click', () => { if (JR.current) window.open(resolveRender(JR.current.src), '_blank', 'noopener'); });
  $('#vSource').addEventListener('click', viewSource);
  $('#vFav').addEventListener('click', () => { if (!JR.current) return; toggleFav(JR.current); $('#vFav').classList.toggle('on', JR.fav.has(JR.current.id)); });
  $('#vSafe').addEventListener('click', () => {
    JR.safeMode = !JR.safeMode;
    $('#vSafe').textContent = 'shield: ' + (JR.safeMode ? 'on' : 'off');
    $('#modeStatus').textContent = 'safe-mode: ' + (JR.safeMode ? 'ON' : 'OFF');
    if (JR.current) loadFrame(resolveRender(JR.current.src));
    toast(JR.safeMode ? 'safe mode ON — content sandboxed' : 'safe mode OFF — full execution', JR.safeMode ? 'warn' : 'ok');
  });

  // esc closes viewer
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#viewer').classList.contains('hidden')) closeViewer(); });

  // "/" focuses search
  window.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && $('#viewer').classList.contains('hidden')){
      e.preventDefault(); $('#omniInput').focus();
    }
  });
}

/* ============================================================
   FALLBACK LIBRARY  (used only if library.json can't be fetched)
   ============================================================ */
const FALLBACK_LIBRARY = {
  listings: [
    { id:'neon-rain', title:'NEON RAIN', type:'html', src:'library/neon-rain.html', seller:'ghost0x', price:'0.00Ξ', rating:4.9, featured:true, tags:['canvas','fx'], desc:'digital downpour. pure canvas, no deps.' },
    { id:'synth-grid', title:'SYNTH GRID', type:'html', src:'library/synth-grid.html', seller:'v0id', price:'0.02Ξ', rating:4.7, tags:['css','retro'], desc:'infinite outrun horizon that tracks your cursor.' },
    { id:'jr-terminal', title:'JR://TERMINAL', type:'html', src:'library/terminal.html', seller:'root', price:'free', rating:5.0, featured:true, tags:['interactive','shell'], desc:'a fake shell that talks back. try `help`.' },
    { id:'orb', title:'REACTOR ORB', type:'svg', src:'library/orb.svg', seller:'smith', price:'0.01Ξ', rating:4.6, tags:['svg','animated'], desc:'a humming animated core. pure SVG + SMIL.' },
    { id:'paintbox', title:'PAINTBOX', type:'html', src:'library/paint.html', seller:'anon', price:'free', rating:4.4, tags:['interactive','canvas'], desc:'draw. proves pointer + canvas support.' },
  ]
};

/* ============================================================
   INIT
   ============================================================ */
function init(){
  runBoot();
  buildTicker();
  wire();
  loadLibrary();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
