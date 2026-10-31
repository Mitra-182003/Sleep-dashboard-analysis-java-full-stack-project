const SUPABASE_URL = "https://ixkdmnkjaftyrrsxppnh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2RtbmtqYWZ0eXJyc3hwcG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjY2ODgsImV4cCI6MjEwNzY0MjY4OH0.WQlc9_naBB2yl4QzHlCRmLMSQ_TGHVhWZYGEW8xZsO0";

window.DreamBetterSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Set this to the deployed Spring Boot API origin before production deployment.
window.DREAMBETTER_API_URL = "";
