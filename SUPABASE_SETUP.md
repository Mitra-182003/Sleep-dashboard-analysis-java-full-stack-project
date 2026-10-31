# Supabase setup for DreamBetter

DreamBetter uses a Spring Boot API and a static frontend:

```text
Browser -> Vercel frontend -> Spring Boot API -> Supabase database
                                      |
                                      -> Supabase Auth
```

Supabase's hosted database is PostgreSQL-compatible. The project still needs
the PostgreSQL JDBC driver because that is the protocol used to connect to
Supabase; this does not require installing PostgreSQL locally.

## 1. Create the database tables

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in the Supabase dashboard.
3. Copy and run [`supabase-schema.sql`](./supabase-schema.sql).
4. Confirm that `public.sleep_logs` exists under **Table Editor**.

The current website persists sleep logs only. Supabase Auth issues the access
tokens used by the frontend and API, and Supabase user IDs are stored in
`sleep_logs.user_id`.

## 2. Configure the backend

Copy [`backend/.env.example`](./backend/.env.example) to `backend/.env` for
local development, or add the same values as environment variables on the
backend hosting provider.

Required Supabase values:

| Variable | Value |
| --- | --- |
| `SUPABASE_DB_URL` | JDBC form of the Supabase Session Pooler URL, for example `jdbc:postgresql://aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require` |
| `SUPABASE_DB_USERNAME` | Supabase database username, commonly `postgres.PROJECT_REF` for the pooler |
| `SUPABASE_DB_PASSWORD` | The database password configured in Supabase Database Settings |
| `SUPABASE_DB_DDL_AUTO` | `validate` |

Use the **Session Pooler** connection for a long-running Java API. Do not use
the Supabase `anon` key or `service_role` key as the JDBC password. Those keys
are API credentials, not database credentials.

The backend also requires:

- `FRONTEND_URL`
- `SUPABASE_URL`
- `GEMINI_API_KEY` for AI Insights

Never commit `backend/.env`, database passwords, Supabase service-role keys, or
Gemini keys. The frontend may use only the Supabase publishable/anon key.

## 3. Start and verify locally

From the project root:

```powershell
cd backend
mvn spring-boot:run
```

Verify the API:

```text
http://localhost:8080/api/health
```

Serve the `frontend` directory over HTTP, not with `file://`. The frontend
continues to call the Spring Boot API and does not need a Supabase URL or key.

## 4. Deploy

1. Deploy `backend` to Render, Railway, Azure, Fly.io, or another Java-capable
   host.
2. Add all backend environment variables to that host.
3. Set `FRONTEND_URL` to the exact Vercel production and preview origins.
4. Edit [`frontend/js/supabase-config.js`](./frontend/js/supabase-config.js)
   with the Supabase project URL and publishable/anon key. Set
   `window.DREAMBETTER_API_URL` there to the HTTPS origin of the deployed API.
5. Deploy `frontend` as a Vercel static site with `frontend` as the project
   root.

## 5. What I need from you to finish the connection

Do not send passwords or secret keys in chat. To complete deployment
configuration, provide:

1. The backend hosting provider and its public API URL.
2. The Vercel frontend URL.
3. The Supabase project region and project reference only (not the password).
4. Confirmation that `supabase-schema.sql` was executed successfully.
5. Confirmation that the Vercel domain was added to Supabase Authentication →
   URL Configuration → Redirect URLs.

Add secrets directly in the deployment provider's environment-variable
settings. For local work, fill in `backend/.env` from the example file.

## Troubleshooting database login

If the backend reports:

```text
password authentication failed for user "postgres"
```

the Supabase host is reachable, but the database password is incorrect or
the username does not match the selected connection type.

- For a direct Supabase host such as `db.PROJECT_REF.supabase.co`, use
  `SUPABASE_DB_USERNAME=postgres`.
- For a Session Pooler host such as
  `aws-0-REGION.pooler.supabase.com`, use the exact username displayed by
  Supabase, commonly `postgres.PROJECT_REF`.
- Reset the database password at **Project Settings → Database → Reset
  database password**, then update `SUPABASE_DB_PASSWORD` locally and on the
  backend host.
- Keep `?sslmode=require` in `SUPABASE_DB_URL`.
- If the password contains reserved URL characters, keep it only in
  `SUPABASE_DB_PASSWORD`; do not embed it in the URL.

After changing the values, restart the backend and check
`http://localhost:8080/api/health`. Rotate the password immediately if it was
shared anywhere outside your private environment settings.

## Supabase Auth configuration

In Supabase Dashboard → Authentication:

1. Set **Site URL** to the deployed frontend URL.
2. Add `http://localhost:5500/**` and the Vercel URL to **Redirect URLs**.
3. Enable **Email** if users should register with email and password.
4. Enable **Google** under Providers if the Google button should work. Add the
   Google OAuth client ID and secret in Supabase, not in frontend code.
5. Copy the project URL and publishable/anon key from Project Settings →
   API into `frontend/js/supabase-config.js`.
