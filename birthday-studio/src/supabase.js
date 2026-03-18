const SUPABASE_URL = 'https://hialqukjbguzfueionhx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWxxdWtqYmd1emZ1ZWlvbmh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjYwMjYsImV4cCI6MjA4OTQwMjAyNn0.wH4OiBaDFoxdseMxFoWYjjmP7CVkTfXCYKC6TgN8i1Q';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.sb = supabase;
