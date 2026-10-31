# DreamBetter environment setup

The backend requires Java 25 (the current Java LTS release).

The application reads configuration from environment variables or
`backend/.env` (which is ignored by Git).

## Supabase database

Supabase provides both the hosted PostgreSQL database and authentication. The
browser uses the Supabase public client for authentication, while the Spring
Boot API connects to the database over JDBC and validates Supabase access
tokens.

1. Create a Supabase project and run
   [`supabase-schema.sql`](../supabase-schema.sql) in Supabase Dashboard →
   SQL Editor.
2. In Supabase Dashboard → Project Settings → Database, copy the connection
   string for the Session Pooler. Convert it to a JDBC URL by changing
   `postgresql://` to `jdbc:postgresql://` and append
   `?sslmode=require` if SSL is not already included.
3. Set these backend-only variables:

   - `SUPABASE_DB_URL`: Supabase JDBC connection URL
   - `SUPABASE_DB_USERNAME`: Supabase database username
   - `SUPABASE_DB_PASSWORD`: Supabase database password
   - `SUPABASE_DB_DDL_AUTO=validate`
   - `SUPABASE_DB_POOL_SIZE=5` (optional)

Do not use the Supabase `anon` key or `service_role` key as the JDBC password.
Use the database password shown or reset in the Supabase Database settings.
Never put either database credential or a Supabase secret key in frontend
JavaScript.

Gemini uses `GEMINI_MODEL` as the primary model and
`GEMINI_FALLBACK_MODEL` when the primary provider responds with a temporary
overload or rate-limit error.

4. Set `SUPABASE_URL` to your project URL. The backend uses it to validate
   Supabase JWT issuer and JWKS values.
5. Set `GEMINI_API_KEY` only in the backend environment. Never prefix it with
   `NEXT_PUBLIC_` or expose it to browser code. The authenticated backend endpoint
   is `POST /api/insights`.
6. Start the backend from `backend` and serve `frontend` from the configured
   `FRONTEND_URL` origin.

Do not open the HTML files directly with `file://`. Supabase OAuth
authentication requires an HTTP(S) origin. For local development, serve the
`frontend` directory at `http://localhost:5500` and add that URL to Supabase
Authentication → URL Configuration → Redirect URLs.

The schema is managed explicitly in Supabase SQL. Keep
`SUPABASE_DB_DDL_AUTO=validate` so Hibernate detects schema drift without
silently changing the production database. Each sleep log is scoped by the
authenticated Supabase user ID in the `user_id` column, and the Spring Boot
backend is the only data path.
