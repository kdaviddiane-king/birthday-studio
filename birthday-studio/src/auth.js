// ═══════════════════════════════════════════
//  AUTH — connexion, inscription, déconnexion
// ═══════════════════════════════════════════

let currentUser = null;
let authMode = 'login'; // 'login' | 'signup'

// ── Lance l'app : vérifie si l'utilisateur est déjà connecté ──
async function initAuth() {
  const { data: { session } } = await window.sb.auth.getSession();
  if (session?.user) {
    currentUser = session.user;
    enterApp();
  } else {
    document.getElementById('auth-overlay').style.display = 'flex';
  }

  // Écoute les changements de session (reconnexion auto)
  window.sb.auth.onAuthStateChange((_event, session) => {
    if (session?.user && !currentUser) {
      currentUser = session.user;
      enterApp();
    }
  });
}

// ── Basculer entre Login et Signup ──
function switchTab(mode) {
  authMode = mode;
  document.getElementById('tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
  document.getElementById('auth-name-wrap').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('auth-submit').textContent = mode === 'login' ? 'Se connecter' : 'Créer mon compte';
  document.getElementById('auth-error').textContent = '';
}

// ── Soumettre le formulaire auth ──
async function handleAuth() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const name     = document.getElementById('auth-name').value.trim();
  const errEl    = document.getElementById('auth-error');
  const btn      = document.getElementById('auth-submit');

  if (!email || !password) { errEl.textContent = 'Email et mot de passe requis.'; return; }
  if (password.length < 6)  { errEl.textContent = 'Mot de passe : 6 caractères minimum.'; return; }

  btn.textContent = '…';
  btn.disabled = true;
  errEl.textContent = '';

  try {
    if (authMode === 'signup') {
      const { data, error } = await window.sb.auth.signUp({
        email, password,
        options: { data: { full_name: name || email.split('@')[0] } }
      });
      if (error) throw error;
      if (data.user && !data.session) {
        errEl.style.color = 'var(--teal)';
        errEl.textContent = '✓ Vérifiez votre email pour confirmer votre compte.';
        return;
      }
      currentUser = data.user;
      enterApp();
    } else {
      const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      currentUser = data.user;
      enterApp();
    }
  } catch (err) {
    const msgs = {
      'Invalid login credentials': 'Email ou mot de passe incorrect.',
      'User already registered': 'Cet email est déjà utilisé.',
      'Email not confirmed': 'Confirmez votre email d\'abord.',
    };
    errEl.textContent = msgs[err.message] || err.message;
  } finally {
    btn.textContent = authMode === 'login' ? 'Se connecter' : 'Créer mon compte';
    btn.disabled = false;
  }
}

// ── Continuer sans compte (mode invité) ──
function continueAsGuest() {
  currentUser = null;
  enterApp();
}

// ── Entrer dans l'app ──
function enterApp() {
  document.getElementById('auth-overlay').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  if (currentUser) {
    const name = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
    document.getElementById('user-name-display').textContent = name;
    document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('user-chip').style.display = 'flex';
    document.getElementById('btn-gallery').style.display = 'flex';
    document.getElementById('fxsave').style.display = 'flex';
  }
}

// ── Déconnexion ──
async function handleLogout() {
  await window.sb.auth.signOut();
  currentUser = null;
  location.reload();
}

// Lancer au chargement
window.addEventListener('DOMContentLoaded', initAuth);
