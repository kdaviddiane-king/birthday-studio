// ═══════════════════════════════════════════
//  STUDIO — modèles, thèmes, canvas, export
// ═══════════════════════════════════════════

const THEMES = [
  { id:'noir',   nm:'Or Noir',  bg:'#09090f', a1:'#e8c872', a2:'#f5dfa0', a3:'#c8a850' },
  { id:'blush',  nm:'Blush',    bg:'#100a10', a1:'#f06b8a', a2:'#fca5bd', a3:'#d4527a' },
  { id:'ocean',  nm:'Océan',    bg:'#060e18', a1:'#5b8fff', a2:'#a0c4ff', a3:'#4dd9c0' },
  { id:'forest', nm:'Forêt',    bg:'#060e08', a1:'#4dd9c0', a2:'#a7f3d0', a3:'#6bcb77' },
  { id:'galaxy', nm:'Galaxie',  bg:'#08061a', a1:'#c084fc', a2:'#e9d5ff', a3:'#5b8fff' },
  { id:'amber',  nm:'Ambre',    bg:'#0f0a04', a1:'#f59e0b', a2:'#fde68a', a3:'#f06b8a' },
];

const MODELS = [
  { id:'arch',  nm:'Arche'    },
  { id:'split', nm:'Split'    },
  { id:'bleed', nm:'Immersif' },
  { id:'geo',   nm:'Géo'      },
  { id:'retro', nm:'Rétro'    },
  { id:'neon',  nm:'Néon'     },
];

let selT       = THEMES[0];
let selM       = MODELS[0];
let photoURL   = null;
let hasBalloons = false;
let hasSparkles = false;

// ─────────────────────────────────────────
//  INIT : grilles modèles + thèmes
// ─────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  buildModelGrid();
  buildThemeGrid();
  buildTrackGrid();
  setupUpload();
  setStep(1);
});

function buildTrackGrid() {
  const grid = document.getElementById('track-grid');
  if (!grid) return;
  TRACKS.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'trk' + (i === 0 ? ' sel' : '');
    div.innerHTML = `<div class="trk-icon">${t.nm.split(' ')[0]}</div><div class="trk-name">${t.nm.split(' ').slice(1).join(' ')}</div><div class="trk-desc">${t.desc}</div>`;
    div.addEventListener('click', () => selectTrack(i));
    grid.appendChild(div);
  });
}

function toggleMusicPanel() {
  const panel = document.getElementById('music-panel');
  const expCard = document.getElementById('exp-card');
  panel.classList.toggle('on');
  if (panel.classList.contains('on')) {
    expCard.classList.remove('on');
    document.getElementById('fxexp').classList.remove('lit');
  }
  document.getElementById('fxmusic').classList.toggle('lit', panel.classList.contains('on'));
}

function buildModelGrid() {
  const grid = document.getElementById('mgrid');
  MODELS.forEach((m, i) => {
    const div = document.createElement('div');
    div.className = 'mc' + (i === 0 ? ' sel' : '');
    div.dataset.id = m.id;
    div.innerHTML = `<canvas class="mc-prev" id="mp-${m.id}" width="100" height="150"></canvas><div class="mc-lbl">${m.nm}</div>`;
    div.addEventListener('click', () => {
      document.querySelectorAll('.mc').forEach(x => x.classList.remove('sel'));
      div.classList.add('sel');
      selM = m;
    });
    grid.appendChild(div);
    setTimeout(() => drawThumb(m.id, document.getElementById('mp-' + m.id), THEMES[0]), 60);
  });
}

function buildThemeGrid() {
  const grid = document.getElementById('tgrid');
  THEMES.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'tc' + (i === 0 ? ' sel' : '');
    div.dataset.id = t.id;
    div.innerHTML = `<div class="tc-dot" style="background:linear-gradient(135deg,${t.a1},${t.a2})"></div>${t.nm}`;
    div.addEventListener('click', () => {
      document.querySelectorAll('.tc').forEach(x => x.classList.remove('sel'));
      div.classList.add('sel');
      selT = t;
    });
    grid.appendChild(div);
  });
}

// ─────────────────────────────────────────
//  UPLOAD
// ─────────────────────────────────────────
function setupUpload() {
  const fi   = document.getElementById('fi');
  const drop = document.getElementById('drop');

  document.getElementById('browse').addEventListener('click', () => fi.click());
  drop.addEventListener('click', () => fi.click());
  document.getElementById('chip-change').addEventListener('click', () => fi.click());
  fi.addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', e => {
    e.preventDefault(); drop.classList.remove('over');
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
  });
}

function loadFile(f) {
  // Compression légère : max 800px
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const oc = document.createElement('canvas');
      oc.width = img.width * ratio; oc.height = img.height * ratio;
      oc.getContext('2d').drawImage(img, 0, 0, oc.width, oc.height);
      photoURL = oc.toDataURL('image/jpeg', .88);

      document.getElementById('chip-thumb').src = photoURL;
      document.getElementById('chip-name').textContent = f.name.slice(0, 28) + (f.name.length > 28 ? '…' : '');
      document.getElementById('chip').classList.add('on');
      setStep(2);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(f);
}

// ─────────────────────────────────────────
//  STEPPER
// ─────────────────────────────────────────
function setStep(n) {
  for (let i = 1; i <= 4; i++) {
    const d = document.getElementById('s' + i);
    d.classList.remove('act', 'done');
    if (i < n) d.classList.add('done');
    else if (i === n) d.classList.add('act');
  }
}

// ─────────────────────────────────────────
//  GENERATE
// ─────────────────────────────────────────
function generate() {
  if (!photoURL) { showToast('⚠️ Ajoutez une photo d\'abord'); return; }

  ['c1','c2','c3','c4'].forEach(id =>
    document.getElementById(id).classList.add('collapsed')
  );

  const stage = document.getElementById('stage');
  stage.style.display = 'block';
  stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setStep(4);

  buildPosterCanvas();
  setTimeout(() => fireConfetti(60), 400);
  autoPlayMusic();
}

function goBack() {
  document.getElementById('stage').style.display = 'none';
  ['c1','c2','c3','c4'].forEach(id =>
    document.getElementById(id).classList.remove('collapsed')
  );
  hasBalloons = false; hasSparkles = false;
  const bl = document.getElementById('pbal');
  if (bl) bl.remove();
  stopMusic();
  document.getElementById('music-panel').classList.remove('on');
  setStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─────────────────────────────────────────
//  CANVAS RENDER
// ─────────────────────────────────────────
function buildPosterCanvas() {
  const poster = document.getElementById('poster');
  const W = poster.offsetWidth, H = poster.offsetHeight;
  const cv = document.getElementById('pcv');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = new Image();
  img.onload = img.onerror = () => {
    const ok = img.complete && img.naturalWidth;
    renderPoster(ctx, selM.id, selT, ok ? img : null,
      document.getElementById('fn').value || 'Sophie',
      document.getElementById('fa').value || '30 ans',
      document.getElementById('fm').value || 'Que cette journée brille autant que toi',
      W, H
    );
  };
  img.src = photoURL;
}

function renderPoster(ctx, mid, t, img, name, age, msg, W, H) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.bg; ctx.fillRect(0, 0, W, H);
  const fn = { arch, split, bleed, geo, retro, neon };
  (fn[mid] || fn.arch)(ctx, t, img, name, age, msg, W, H);
  if (hasSparkles) drawSparklesLayer(ctx, t, W, H);
}

/* ── helpers ── */
function wrapTxt(ctx, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '', ly = y;
  for (const w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, ly); line = w + ' '; ly += lh;
    } else line = test;
  }
  ctx.fillText(line.trim(), x, ly);
}
function coverImg(ctx, img, x, y, w, h) {
  if (!img) return;
  const ir = img.width / img.height, ar = w / h;
  let sx=0, sy=0, sw=img.width, sh=img.height;
  if (ir > ar) { sw = img.height * ar; sx = (img.width - sw) / 2; }
  else         { sh = img.width / ar; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
function drawDots(ctx, t, W, H) {
  ctx.fillStyle = t.a1;
  for (let x=14; x<W; x+=24) for (let y=14; y<H; y+=24) {
    ctx.globalAlpha = .07; ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function drawSparklesLayer(ctx, t, W, H) {
  for (let i=0; i<16; i++) {
    ctx.fillStyle = [t.a1, t.a2, t.a3][i%3];
    ctx.globalAlpha = Math.random() * .6 + .2;
    ctx.beginPath();
    ctx.arc(Math.random()*W*.9+W*.05, Math.random()*H*.4+H*.05, Math.random()*2.5+1, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ── MODEL: ARCH ── */
function arch(ctx, t, img, name, age, msg, W, H) {
  drawDots(ctx, t, W, H);
  const aW=W*.72, aH=H*.76, aX=(W-aW)/2, aY=H-aH;
  if (img) {
    ctx.save();
    ctx.beginPath(); ctx.ellipse(aX+aW/2, aY+aH*.333, aW/2, aH*.333, 0, -Math.PI, 0);
    ctx.lineTo(aX+aW, H); ctx.lineTo(aX, H); ctx.closePath(); ctx.clip();
    coverImg(ctx, img, aX, aY, aW, aH); ctx.restore();
  }
  ctx.strokeStyle=t.a1; ctx.lineWidth=2.5;
  const rW=aW+10, rH=aH+10, rX=(W-rW)/2, rY=H-rH;
  ctx.beginPath(); ctx.ellipse(rX+rW/2, rY+rH*.333, rW/2, rH*.333, 0, -Math.PI, 0); ctx.stroke();
  ctx.lineWidth=.8; ctx.globalAlpha=.4;
  const rW2=aW+22, rH2=aH+22, rX2=(W-rW2)/2, rY2=H-rH2;
  ctx.beginPath(); ctx.ellipse(rX2+rW2/2, rY2+rH2*.333, rW2/2, rH2*.333, 0, -Math.PI, 0); ctx.stroke();
  ctx.globalAlpha=1;
  const bg=ctx.createLinearGradient(0,H*.48,0,H); bg.addColorStop(0,'transparent'); bg.addColorStop(1,t.bg+'fa');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.fillStyle=t.a2; ctx.font=`${W*.033}px 'DM Sans',sans-serif`; ctx.letterSpacing='3px';
  ctx.fillText('JOYEUX ANNIVERSAIRE', W/2, H*.09); ctx.letterSpacing='0px';
  ctx.fillStyle='#fff'; ctx.font=`700 ${W*.14}px 'Cormorant Garamond',serif`;
  ctx.shadowColor='rgba(0,0,0,.3)'; ctx.shadowBlur=12;
  ctx.fillText(name, W/2, H*.2); ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,255,255,.82)'; ctx.font=`italic ${W*.047}px 'Cormorant Garamond',serif`;
  wrapTxt(ctx, msg, W/2, H*.855, W*.78, W*.058);
  ctx.fillStyle=t.a1; ctx.font=`${W*.03}px 'DM Sans',sans-serif`; ctx.letterSpacing='2px';
  ctx.fillText(`✦ ${age} ✦`, W/2, H*.94); ctx.letterSpacing='0px';
}

/* ── MODEL: SPLIT ── */
function split(ctx, t, img, name, age, msg, W, H) {
  if (img) { ctx.save(); ctx.rect(0,0,W*.48,H); ctx.clip(); coverImg(ctx,img,0,0,W*.48,H); ctx.restore(); }
  const ld=ctx.createLinearGradient(0,0,W*.48,0); ld.addColorStop(0,t.bg+'44'); ld.addColorStop(1,t.bg+'bb');
  ctx.fillStyle=ld; ctx.fillRect(0,0,W*.48,H);
  const dg=ctx.createLinearGradient(0,0,0,H); dg.addColorStop(0,'transparent'); dg.addColorStop(.5,t.a1); dg.addColorStop(1,'transparent');
  ctx.fillStyle=dg; ctx.fillRect(W*.48,0,3,H);
  ctx.fillStyle=t.bg+'ee'; ctx.fillRect(W*.49,0,W*.51,H);
  const cx2=W*.74; ctx.textAlign='center';
  ctx.fillStyle=t.a2; ctx.font=`${W*.028}px 'DM Sans',sans-serif`; ctx.letterSpacing='3px';
  ctx.fillText('JOYEUX', cx2, H*.2); ctx.fillText('ANNIVERSAIRE', cx2, H*.26); ctx.letterSpacing='0px';
  ctx.fillStyle='#fff'; ctx.font=`900 ${W*.15}px 'Bebas Neue',sans-serif`; ctx.fillText(name, cx2, H*.47);
  ctx.fillStyle=t.a1; ctx.font=`900 ${W*.18}px 'Bebas Neue',sans-serif`;
  ctx.shadowColor=t.a1+'44'; ctx.shadowBlur=12; ctx.fillText(age, cx2, H*.67); ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.font=`${W*.035}px 'DM Sans',sans-serif`;
  wrapTxt(ctx, msg, cx2, H*.82, W*.42, W*.046);
}

/* ── MODEL: BLEED ── */
function bleed(ctx, t, img, name, age, msg, W, H) {
  if (img) coverImg(ctx, img, 0, 0, W, H);
  const ov=ctx.createLinearGradient(0,0,0,H);
  ov.addColorStop(0,t.bg+'cc'); ov.addColorStop(.3,'transparent');
  ov.addColorStop(.55,'transparent'); ov.addColorStop(.72,t.bg+'bb'); ov.addColorStop(1,t.bg+'fc');
  ctx.fillStyle=ov; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=t.a1; ctx.lineWidth=1.2; rrect(ctx,W*.04,H*.04,W*.92,H*.92,4); ctx.stroke();
  ctx.lineWidth=.5; ctx.globalAlpha=.4; rrect(ctx,W*.06,H*.06,W*.88,H*.88,3); ctx.stroke(); ctx.globalAlpha=1;
  ctx.textAlign='center';
  ctx.fillStyle=t.a1; ctx.font=`${W*.028}px 'DM Sans',sans-serif`; ctx.letterSpacing='3px';
  ctx.fillText('✦ JOYEUX ANNIVERSAIRE ✦', W/2, H*.1); ctx.letterSpacing='0px';
  ctx.fillStyle=t.a1; ctx.font=`${W*.16}px 'Pacifico',cursive`;
  ctx.shadowColor=t.a1+'55'; ctx.shadowBlur=24; ctx.fillText(name, W/2, H*.81); ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,255,255,.72)'; ctx.font=`italic ${W*.043}px 'Cormorant Garamond',serif`;
  wrapTxt(ctx, msg, W/2, H*.9, W*.78, W*.053);
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.font=`${W*.026}px 'DM Sans',sans-serif`; ctx.letterSpacing='2px';
  ctx.fillText(age, W/2, H*.97); ctx.letterSpacing='0px';
}

/* ── MODEL: GEO ── */
function geo(ctx, t, img, name, age, msg, W, H) {
  ctx.strokeStyle=t.a1; ctx.lineWidth=.4; ctx.globalAlpha=.05;
  for(let x=0;x<W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.globalAlpha=1;
  ctx.strokeStyle=t.a1; ctx.lineWidth=1.8; rrect(ctx,W*.04,H*.03,W*.92,H*.94,4); ctx.stroke();
  ctx.lineWidth=.7; ctx.globalAlpha=.45; rrect(ctx,W*.07,H*.055,W*.86,H*.89,3); ctx.stroke(); ctx.globalAlpha=1;
  const px=W*.16, py=H*.1, pw=W*.68, ph=H*.47;
  if (img) { ctx.save(); rrect(ctx,px,py,pw,ph,4); ctx.clip(); coverImg(ctx,img,px,py,pw,ph); ctx.restore(); }
  ctx.strokeStyle=t.a1; ctx.lineWidth=1.2; rrect(ctx,px,py,pw,ph,4); ctx.stroke();
  [[px,py],[px+pw,py],[px,py+ph],[px+pw,py+ph]].forEach(([cx3,cy3])=>{
    ctx.fillStyle=t.a1; ctx.save(); ctx.translate(cx3,cy3); ctx.rotate(Math.PI/4); ctx.fillRect(-4,-4,8,8); ctx.restore();
  });
  ctx.textAlign='center';
  ctx.fillStyle=t.a2; ctx.font=`${W*.028}px 'DM Sans',sans-serif`; ctx.letterSpacing='4px';
  ctx.fillText('JOYEUX ANNIVERSAIRE', W/2, H*.68); ctx.letterSpacing='0px';
  ctx.fillStyle='#fff'; ctx.font=`700 ${W*.13}px 'Cormorant Garamond',serif`; ctx.fillText(name, W/2, H*.78);
  ctx.strokeStyle=t.a1; ctx.lineWidth=.8;
  ctx.beginPath(); ctx.moveTo(W*.22,H*.81); ctx.lineTo(W*.4,H*.81); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W*.6,H*.81); ctx.lineTo(W*.78,H*.81); ctx.stroke();
  ctx.fillStyle=t.a1; ctx.beginPath(); ctx.arc(W*.5,H*.81,3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.65)'; ctx.font=`italic ${W*.042}px 'Cormorant Garamond',serif`;
  wrapTxt(ctx, msg, W/2, H*.876, W*.74, W*.052);
  ctx.fillStyle=t.a1; ctx.font=`${W*.028}px 'DM Sans',sans-serif`; ctx.letterSpacing='2px';
  ctx.fillText(`✦ ${age} ✦`, W/2, H*.95); ctx.letterSpacing='0px';
}

/* ── MODEL: RETRO ── */
function retro(ctx, t, img, name, age, msg, W, H) {
  ctx.strokeStyle=t.a1; ctx.lineWidth=6;
  for(let i=-H;i<W+H;i+=22){ctx.globalAlpha=.04;ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();}
  ctx.globalAlpha=1;
  const pw=W*.76, ph=pw*1.12, px=(W-pw)/2, py=H*.05;
  ctx.fillStyle='#ffffff'; ctx.shadowColor='rgba(0,0,0,.45)'; ctx.shadowBlur=20; ctx.shadowOffsetY=5;
  rrect(ctx,px,py,pw,ph,3); ctx.fill(); ctx.shadowBlur=0; ctx.shadowOffsetY=0;
  const picH=pw*.88;
  if (img) { ctx.save(); rrect(ctx,px+pw*.06,py+pw*.05,pw*.88,picH,2); ctx.clip(); coverImg(ctx,img,px+pw*.06,py+pw*.05,pw*.88,picH); ctx.restore(); }
  ctx.fillStyle='#1a1818'; ctx.font=`${W*.065}px 'Pacifico',cursive`; ctx.textAlign='center';
  ctx.fillText(name, W/2, py+ph-W*.035);
  const by=py+ph+H*.035;
  ctx.fillStyle=t.a1; ctx.font=`900 ${W*.19}px 'Bebas Neue',sans-serif`; ctx.fillText('BON', W/2, by);
  ctx.fillStyle=t.a2; ctx.font=`900 ${W*.1}px 'Bebas Neue',sans-serif`; ctx.fillText('ANNIVERSAIRE', W/2, by+H*.12);
  ctx.fillStyle=t.a1+'aa'; ctx.font=`${W*.032}px 'DM Sans',sans-serif`; ctx.letterSpacing='1px';
  wrapTxt(ctx, msg, W/2, by+H*.21, W*.86, W*.043); ctx.letterSpacing='0px';
}

/* ── MODEL: NEON ── */
function neon(ctx, t, img, name, age, msg, W, H) {
  ctx.fillStyle='#050510'; ctx.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=3){ctx.fillStyle='rgba(255,255,255,.012)';ctx.fillRect(0,y,W,1);}
  const cx2=W/2, cy2=H*.42, r1=W*.34;
  ctx.strokeStyle=t.a1; ctx.lineWidth=1.5; ctx.shadowColor=t.a1; ctx.shadowBlur=14;
  ctx.beginPath(); ctx.arc(cx2,cy2,r1,0,Math.PI*2); ctx.stroke();
  ctx.lineWidth=.7; ctx.globalAlpha=.3; ctx.beginPath(); ctx.arc(cx2,cy2,r1*1.18,0,Math.PI*2); ctx.stroke();
  ctx.globalAlpha=.15; ctx.beginPath(); ctx.arc(cx2,cy2,r1*1.38,0,Math.PI*2); ctx.stroke();
  ctx.globalAlpha=1; ctx.shadowBlur=0;
  if (img) { ctx.save(); ctx.beginPath(); ctx.arc(cx2,cy2,r1-.02*W,0,Math.PI*2); ctx.clip(); coverImg(ctx,img,cx2-r1,cy2-r1,r1*2,r1*2); ctx.restore(); }
  ctx.strokeStyle=t.a1; ctx.lineWidth=2; ctx.shadowColor=t.a1; ctx.shadowBlur=10;
  ctx.beginPath(); ctx.arc(cx2,cy2,r1,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0;
  ctx.textAlign='center';
  ctx.fillStyle=t.a1; ctx.font=`${W*.026}px 'DM Sans',sans-serif`; ctx.letterSpacing='4px';
  ctx.shadowColor=t.a1; ctx.shadowBlur=8; ctx.fillText('JOYEUX ANNIVERSAIRE', W/2, H*.09); ctx.shadowBlur=0; ctx.letterSpacing='0px';
  ctx.fillStyle='#fff'; ctx.font=`900 ${W*.13}px 'Bebas Neue',sans-serif`; ctx.letterSpacing='4px';
  ctx.shadowColor=t.a1; ctx.shadowBlur=18; ctx.fillText(name, W/2, H*.74); ctx.shadowBlur=0; ctx.letterSpacing='0px';
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.font=`italic ${W*.038}px 'Cormorant Garamond',serif`;
  wrapTxt(ctx, msg, W/2, H*.83, W*.72, W*.048);
  ctx.fillStyle=t.a1; ctx.font=`900 ${W*.09}px 'Bebas Neue',sans-serif`; ctx.letterSpacing='2px';
  ctx.shadowColor=t.a1; ctx.shadowBlur=10; ctx.fillText(age, W/2, H*.93); ctx.shadowBlur=0; ctx.letterSpacing='0px';
}

/* ── Thumbnails preview ── */
function drawThumb(id, cv, t) {
  const W=cv.width, H=cv.height, ctx=cv.getContext('2d');
  ctx.fillStyle=t.bg; ctx.fillRect(0,0,W,H);
  ctx.fillStyle=t.a1+'22';
  for(let x=8;x<W;x+=16) for(let y=8;y<H;y+=16){ctx.beginPath();ctx.arc(x,y,1.2,0,Math.PI*2);ctx.fill();}
  const d={
    arch:()=>{ ctx.strokeStyle=t.a1;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(W/2,H,W*.35,H*.32,0,-Math.PI,0);ctx.stroke();ctx.fillStyle='#fff';ctx.font=`700 ${W*.14}px serif`;ctx.textAlign='center';ctx.fillText('Sophie',W/2,H*.22);ctx.fillStyle=t.a2;ctx.font=`${W*.06}px sans-serif`;ctx.fillText('Joyeux Anniversaire',W/2,H*.12); },
    split:()=>{ ctx.fillStyle=t.a1+'18';ctx.fillRect(0,0,W*.48,H);const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'transparent');g.addColorStop(.5,t.a1);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(W*.48,0,2,H);ctx.fillStyle='#fff';ctx.font=`900 ${W*.17}px 'Bebas Neue',sans-serif`;ctx.textAlign='center';ctx.fillText('30',W*.74,H*.55); },
    bleed:()=>{ const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,t.bg+'dd');g.addColorStop(.5,'transparent');g.addColorStop(1,t.bg+'ee');ctx.fillStyle=t.a1+'18';ctx.fillRect(0,0,W,H);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle=t.a1;ctx.font=`${W*.12}px cursive`;ctx.textAlign='center';ctx.fillText('Sophie',W/2,H*.82);ctx.strokeStyle=t.a1;ctx.lineWidth=1;ctx.strokeRect(W*.06,H*.06,W*.88,H*.88); },
    geo:()=>{ ctx.strokeStyle=t.a1;ctx.lineWidth=1.2;ctx.strokeRect(W*.06,H*.04,W*.88,H*.92);ctx.lineWidth=.6;ctx.globalAlpha=.5;ctx.strokeRect(W*.1,H*.07,W*.8,H*.86);ctx.globalAlpha=1;ctx.fillStyle=t.a1+'22';ctx.fillRect(W*.14,H*.1,W*.72,H*.46);ctx.fillStyle='#fff';ctx.font=`700 ${W*.12}px serif`;ctx.textAlign='center';ctx.fillText('Sophie',W/2,H*.76); },
    retro:()=>{ ctx.fillStyle='#fff';ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=8;ctx.fillRect(W*.1,H*.05,W*.8,W*.9);ctx.shadowBlur=0;ctx.fillStyle=t.a1;ctx.font=`700 ${W*.18}px 'Bebas Neue',sans-serif`;ctx.textAlign='center';ctx.fillText('30',W/2,H*.9); },
    neon:()=>{ ctx.fillStyle='#050510';ctx.fillRect(0,0,W,H);ctx.strokeStyle=t.a1;ctx.lineWidth=1.5;ctx.shadowColor=t.a1;ctx.shadowBlur=6;ctx.beginPath();ctx.arc(W/2,H*.42,W*.32,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font=`900 ${W*.12}px 'Bebas Neue',sans-serif`;ctx.textAlign='center';ctx.fillText('Sophie',W/2,H*.73); },
  };
  (d[id]||d.arch)();
}

// ─────────────────────────────────────────
//  FX
// ─────────────────────────────────────────
function fireConfetti(n) {
  const poster = document.getElementById('poster');
  const cv = document.getElementById('pcv');
  const W = cv.width, H = cv.height;
  const cols = [selT.a1, selT.a2, selT.a3, '#ffffff', '#ff85c2'];
  const pieces = Array.from({length:n}, () => ({
    x: Math.random()*W, y: -10-Math.random()*70,
    w: 4+Math.random()*7, h: 3+Math.random()*5, rot: 0,
    speed: 1.6+Math.random()*3, rs: (Math.random()-.5)*9,
    drift: (Math.random()-.5)*2, col: cols[Math.floor(Math.random()*cols.length)]
  }));
  const ctx = cv.getContext('2d');
  const img = new Image(); img.src = photoURL;
  img.onload = img.onerror = () => {
    let raf;
    (function draw() {
      renderPoster(ctx, selM.id, selT, img.complete && img.naturalWidth ? img : null,
        document.getElementById('fn').value || 'Sophie',
        document.getElementById('fa').value || '30 ans',
        document.getElementById('fm').value || 'Que cette journée brille autant que toi',
        W, H
      );
      let alive = false;
      pieces.forEach(p => {
        if (p.y < H+20) {
          alive=true; p.y+=p.speed; p.x+=p.drift; p.rot+=p.rs;
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
          ctx.fillStyle=p.col; ctx.globalAlpha=.88; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
        }
      });
      if (alive) raf = requestAnimationFrame(draw);
    })();
  };
}

function toggleBalloons() {
  hasBalloons = !hasBalloons;
  document.getElementById('fxball').classList.toggle('lit', hasBalloons);
  const poster = document.getElementById('poster');
  const existing = document.getElementById('pbal');
  if (existing) existing.remove();
  if (!hasBalloons) return;
  const bl = document.createElement('div');
  bl.id = 'pbal';
  bl.style.cssText = 'position:absolute;inset:0;z-index:15;pointer-events:none';
  [10,21,78,89].forEach((left, i) => {
    const col = [selT.a1,selT.a2,selT.a3][i%3];
    const d = document.createElement('div');
    d.className = 'bln';
    d.style.cssText = `position:absolute;left:${left}%;bottom:${24+i*5}%;animation-delay:${i*.38}s`;
    d.innerHTML = `<svg width="26" height="38" viewBox="0 0 26 38" fill="none"><ellipse cx="13" cy="15" rx="11" ry="13" fill="${col}" opacity=".9"/><path d="M13 28Q11 32 13 36Q15 32 13 28" stroke="${col}" stroke-width="1.3" fill="none" opacity=".6"/><ellipse cx="9" cy="9" rx="3.5" ry="4.5" fill="white" opacity=".18"/></svg>`;
    bl.appendChild(d);
  });
  poster.appendChild(bl);
}

function toggleSparkles() {
  hasSparkles = !hasSparkles;
  document.getElementById('fxspark').classList.toggle('lit', hasSparkles);
  buildPosterCanvas();
}

function toggleExport() {
  const ec = document.getElementById('exp-card');
  const mp = document.getElementById('music-panel');
  ec.classList.toggle('on');
  if (ec.classList.contains('on')) {
    mp.classList.remove('on');
    document.getElementById('fxmusic').classList.remove('lit');
  }
  document.getElementById('fxexp').classList.toggle('lit', ec.classList.contains('on'));
}

// ─────────────────────────────────────────
//  EXPORT
// ─────────────────────────────────────────
function buildExportCanvas(cb) {
  const poster = document.getElementById('poster');
  const S = 2, W = poster.offsetWidth, H = poster.offsetHeight;
  const oc = document.createElement('canvas'); oc.width=W*S; oc.height=H*S;
  const ctx = oc.getContext('2d'); ctx.scale(S, S);
  const img = new Image(); img.src = photoURL;
  img.onload = img.onerror = () => {
    renderPoster(ctx, selM.id, selT, img.complete && img.naturalWidth ? img : null,
      document.getElementById('fn').value || 'Sophie',
      document.getElementById('fa').value || '30 ans',
      document.getElementById('fm').value || 'Que cette journée brille autant que toi',
      W, H
    );
    cb(oc);
  };
}

function openImageTab(dataURL) {
  const name = document.getElementById('fn').value || 'anniversaire';
  const w = window.open('','_blank');
  if (!w) { showToast('❌ Autorisez les popups'); return; }
  w.document.write(`<!DOCTYPE html><html><head><title>${name}</title>
  <style>body{margin:0;background:#0a0a12;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;gap:12px}
  img{max-height:92vh;max-width:92vw;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.8)}
  a{color:#e8c872;font-size:13px;padding:8px 20px;border:1px solid rgba(232,200,114,.4);border-radius:100px;text-decoration:none}
  a:hover{background:rgba(232,200,114,.1)}</style></head>
  <body><img src="${dataURL}"><a href="${dataURL}" download="${name}.png">⬇ Enregistrer l'image</a></body></html>`);
  w.document.close();
}

function exportPNG() {
  showToast('⏳ Génération PNG…');
  buildExportCanvas(oc => { openImageTab(oc.toDataURL('image/png')); showToast('✅ Clic droit pour enregistrer'); });
}
function exportJPG() {
  showToast('⏳ Génération JPEG…');
  buildExportCanvas(oc => { openImageTab(oc.toDataURL('image/jpeg', .93)); showToast('✅ Clic droit pour enregistrer'); });
}
function exportCopy() {
  showToast('⏳ Copie…');
  buildExportCanvas(oc => {
    oc.toBlob(blob => {
      if (!blob) { showToast('❌ Erreur'); return; }
      navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
        .then(() => showToast('✅ Copié dans le presse-papiers !'))
        .catch(() => { openImageTab(oc.toDataURL()); showToast('✅ Ouvert (clic droit › copier)'); });
    });
  });
}
function exportHTML() {
  const nm  = document.getElementById('fn').value || 'Sophie';
  const ag  = document.getElementById('fa').value || '30 ans';
  const ms  = document.getElementById('fm').value || 'Que cette journée brille autant que toi';
  const t   = selT;
  const photoSafe = photoURL || '';
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anniversaire – ${nm}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,700;1,400&family=DM+Sans:wght@400&family=Bebas+Neue&family=Pacifico&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:${t.bg};min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem}#p{width:min(420px,96vw);aspect-ratio:3/4;position:relative;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.7)}canvas{width:100%;height:100%;display:block}#btns{display:flex;gap:8px;margin-top:10px;width:min(420px,96vw)}button{flex:1;padding:11px;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer}#bc{background:${t.a1};color:#0a0a0a}#bb{background:transparent;border:1.5px solid ${t.a1};color:${t.a1}}</style></head><body>
<div id="p"><canvas id="cv"></canvas></div>
<div id="btns"><button id="bc" onclick="boom()">🎊 Confettis</button><button id="bb" onclick="boons()">🎈 Ballons</button></div>
<script>
const P=document.getElementById('p'),cv=document.getElementById('cv');cv.width=P.offsetWidth*2;cv.height=P.offsetHeight*2;
const W=P.offsetWidth,H=P.offsetHeight,ctx=cv.getContext('2d');ctx.scale(2,2);
const t={bg:'${t.bg}',a1:'${t.a1}',a2:'${t.a2}'};const nm='${nm.replace(/'/g,"\\'")}',ag='${ag.replace(/'/g,"\\'")}',ms='${ms.replace(/'/g,"\\'").replace(/\n/g,' ')}';
function wt(c,tx,x,y,mW,lh){const ws=tx.split(' ');let l='',ly=y;for(const w of ws){const tt=l+w+' ';if(c.measureText(tt).width>mW&&l){c.fillText(l.trim(),x,ly);l=w+' ';ly+=lh;}else l=tt;}c.fillText(l.trim(),x,ly);}
function ci(c,i,x,y,w,h){const ir=i.width/i.height,ar=w/h;let sx=0,sy=0,sw=i.width,sh=i.height;if(ir>ar){sw=i.height*ar;sx=(i.width-sw)/2;}else sh=i.width/ar;c.drawImage(i,sx,sy,sw,sh,x,y,w,h);}
const img=new Image();img.onload=draw;img.src='${photoSafe}';
function draw(){
  ctx.fillStyle=t.bg;ctx.fillRect(0,0,W,H);
  const aW=W*.72,aH=H*.76,aX=(W-aW)/2,aY=H-aH;
  ctx.save();ctx.beginPath();ctx.ellipse(aX+aW/2,aY+aH*.333,aW/2,aH*.333,0,-Math.PI,0);ctx.lineTo(aX+aW,H);ctx.lineTo(aX,H);ctx.closePath();ctx.clip();ci(ctx,img,aX,aY,aW,aH);ctx.restore();
  ctx.strokeStyle=t.a1;ctx.lineWidth=2.5;const rW=aW+10,rH=aH+10,rX=(W-rW)/2,rY=H-rH;ctx.beginPath();ctx.ellipse(rX+rW/2,rY+rH*.333,rW/2,rH*.333,0,-Math.PI,0);ctx.stroke();
  const bg=ctx.createLinearGradient(0,H*.48,0,H);bg.addColorStop(0,'transparent');bg.addColorStop(1,t.bg+'fa');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.fillStyle=t.a2;ctx.font=W*.033+"px 'DM Sans',sans-serif";ctx.fillText('JOYEUX ANNIVERSAIRE',W/2,H*.09);
  ctx.fillStyle='#fff';ctx.font="700 "+W*.14+"px 'Cormorant Garamond',serif";ctx.fillText(nm,W/2,H*.2);
  ctx.fillStyle='rgba(255,255,255,.82)';ctx.font="italic "+W*.047+"px 'Cormorant Garamond',serif";wt(ctx,ms,W/2,H*.855,W*.78,W*.058);
  ctx.fillStyle=t.a1;ctx.font=W*.03+"px 'DM Sans',sans-serif";ctx.fillText('✦ '+ag+' ✦',W/2,H*.94);
}
function boom(){const cols=[t.a1,t.a2,'#fff'];const ps=Array.from({length:80},()=>({x:Math.random()*W,y:-10,w:5+Math.random()*6,h:3+Math.random()*5,rot:0,speed:1.6+Math.random()*3,rs:(Math.random()-.5)*9,drift:(Math.random()-.5)*2,col:cols[Math.floor(Math.random()*3)]}));let r;(function go(){draw();let a=false;ps.forEach(p=>{if(p.y<H+20){a=true;p.y+=p.speed;p.x+=p.drift;p.rot+=p.rs;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.col;ctx.globalAlpha=.88;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();}});if(a)r=requestAnimationFrame(go);else draw();})();}
function boons(){draw();const cols=[t.a1,t.a2];[12,24,76,88].forEach((l,i)=>{const c=cols[i%2];const bx=W*l/100,by=H*(0.32+i*.04);ctx.fillStyle=c;ctx.globalAlpha=.88;ctx.beginPath();ctx.ellipse(bx,by,11,13,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.2)';ctx.beginPath();ctx.ellipse(bx-3,by-4,3,4,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;});}
<\/script></body></html>`;
  const blob = new Blob([html], {type:'text/html'});
  const a = document.createElement('a');
  a.download = `anniversaire-${nm.toLowerCase().replace(/\s/g,'-')}.html`;
  a.href = URL.createObjectURL(blob); a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  showToast('✅ HTML téléchargé !');
}

// ── Toast ──
function showToast(msg, dur=2800) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), dur);
}
