// Ganti dua value di bawah pake punya lo dari Supabase dashboard:
// Settings -> API -> Project URL & anon public key
const SUPABASE_URL = "https://dgcxlopvcmuagdgtxckx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3hsb3B2Y211YWdkZ3R4Y2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDE4ODUsImV4cCI6MjA5ODgxNzg4NX0.J45Nxe9FPNPuee3h1GyyPHVSmnjjRhcufOHrm3xTnUw";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
