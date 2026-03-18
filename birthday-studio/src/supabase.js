
const SUPABASE_URL = 'sb_publishable_CO5jUFgm2pDejQt9Cfe2qw_fMYmqWir';      // ex: https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'sb_secret_hVd8UAY4GQclrIh4LtJSNg_8a5Eyfaf'; // clé publique (anon)

// Initialisation du client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export global
window.sb = supabase;
