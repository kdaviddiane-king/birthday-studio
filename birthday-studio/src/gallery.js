// ═══════════════════════════════════════════
//  GALLERY — sauvegarde et chargement des cartes
// ═══════════════════════════════════════════

// ── Afficher la galerie ──
async function showGallery() {
  document.getElementById('studio-view').style.display = 'none';
  document.getElementById('gallery-view').style.display = 'block';
  await loadCards();
}

// ── Revenir au studio ──
function showStudio() {
  document.getElementById('gallery-view').style.display = 'none';
  document.getElementById('studio-view').style.display = 'block';
}

// ── Sauvegarder la carte courante ──
async function saveCard() {
  if (!currentUser) {
    showToast('⚠️ Connectez-vous pour sauvegarder');
    return;
  }

  const name    = document.getElementById('fn').value || 'Sophie';
  const age     = document.getElementById('fa').value || '30 ans';
  const message = document.getElementById('fm').value || '';
  const model   = selM.id;
  const theme   = selT.id;

  // Générer une miniature base64 (petite taille pour stockage)
  const thumb = buildThumbDataURL();

  const { error } = await window.sb
    .from('cards')
    .insert({
      user_id:   currentUser.id,
      name,
      age,
      message,
      model,
      theme,
      photo_b64: photoURL,   // ⚠️ en prod : stocker dans Supabase Storage
      thumb_b64: thumb,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error(error);
    showToast('❌ Erreur de sauvegarde : ' + error.message);
  } else {
    showToast('✅ Carte sauvegardée !');
    document.getElementById('fxsave').classList.add('lit');
    setTimeout(() => document.getElementById('fxsave').classList.remove('lit'), 2000);
  }
}

// ── Miniature basse résolution ──
function buildThumbDataURL() {
  const poster = document.getElementById('poster');
  const W = 120, H = 160;
  const oc = document.createElement('canvas'); oc.width = W; oc.height = H;
  const ctx = oc.getContext('2d');
  const scale = W / poster.offsetWidth;
  ctx.scale(scale, scale);
  const img = new Image(); img.src = photoURL;
  renderPoster(ctx, selM.id, selT, img.complete ? img : null,
    document.getElementById('fn').value || 'Sophie',
    document.getElementById('fa').value || '30 ans',
    document.getElementById('fm').value || '',
    poster.offsetWidth, poster.offsetHeight
  );
  return oc.toDataURL('image/jpeg', .6);
}

// ── Charger les cartes depuis Supabase ──
async function loadCards() {
  const grid  = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  grid.innerHTML = '';
  grid.appendChild(empty);

  if (!currentUser) {
    empty.style.display = 'flex';
    return;
  }

  const { data, error } = await window.sb
    .from('cards')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) { showToast('❌ ' + error.message); return; }

  if (!data || data.length === 0) {
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';

  data.forEach(card => {
    const div = document.createElement('div');
    div.className = 'gallery-card';

    const date = new Date(card.created_at).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    div.innerHTML = `
      <img src="${card.thumb_b64 || ''}" alt="${card.name}" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block">
      <div class="gallery-card-info">
        <div class="gallery-card-name">${card.name} — ${card.age}</div>
        <div class="gallery-card-date">${date}</div>
      </div>
      <button class="gallery-card-del" onclick="deleteCard('${card.id}', event)" title="Supprimer">✕</button>
    `;

    // Clic → recharger dans le studio
    div.addEventListener('click', () => loadCardIntoStudio(card));
    grid.appendChild(div);
  });
}

// ── Recharger une carte sauvegardée dans le studio ──
function loadCardIntoStudio(card) {
  showStudio();

  document.getElementById('fn').value = card.name;
  document.getElementById('fa').value = card.age;
  document.getElementById('fm').value = card.message;

  photoURL = card.photo_b64;
  document.getElementById('chip-thumb').src = photoURL;
  document.getElementById('chip-name').textContent = card.name + '.jpg';
  document.getElementById('chip').classList.add('on');

  // Sélectionner le modèle
  const modelEl = MODELS.find(m => m.id === card.model);
  if (modelEl) {
    selM = modelEl;
    document.querySelectorAll('.mc').forEach(el => {
      el.classList.toggle('sel', el.dataset.id === card.model);
    });
  }

  // Sélectionner le thème
  const themeEl = THEMES.find(t => t.id === card.theme);
  if (themeEl) {
    selT = themeEl;
    document.querySelectorAll('.tc').forEach(el => {
      el.classList.toggle('sel', el.dataset.id === card.theme);
    });
  }

  generate();
}

// ── Supprimer une carte ──
async function deleteCard(id, event) {
  event.stopPropagation();
  if (!confirm('Supprimer cette carte ?')) return;

  const { error } = await window.sb.from('cards').delete().eq('id', id);
  if (error) { showToast('❌ ' + error.message); return; }
  showToast('🗑 Carte supprimée');
  loadCards();
}
