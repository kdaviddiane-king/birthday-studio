const SUPABASE_URL = 'sb_publishable_CO5jUFgm2pDejQt9Cfe2qw_fMYmqWir';
const SUPABASE_ANON_KEY = 'sb_secret_hVd8UAY4GQclrIh4LtJSNg_8a5Eyfaf';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.sb = supabase;
