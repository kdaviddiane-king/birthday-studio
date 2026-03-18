// ═══════════════════════════════════════════
//  SUPABASE CONFIG
//  → Remplacez les valeurs ci-dessous après
//    avoir créé votre projet sur supabase.com
// ═══════════════════════════════════════════

const SUPABASE_URL = 'VOTRE_SUPABASE_URL';      // ex: https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'VOTRE_SUPABASE_ANON_KEY'; // clé publique (anon)

// Initialisation du client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export global
window.sb = supabase;
