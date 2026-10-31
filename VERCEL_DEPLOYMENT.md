# Vercel deployment

The `frontend` directory is a static website and can be deployed to Vercel.
The Spring Boot API cannot run inside a static Vercel deployment, so deploy it
separately and connect the frontend to the API. Supabase hosts the database.

## 1. Create the Supabase database

Create a Supabase project, then run the SQL in
[`supabase-schema.sql`](supabase-schema.sql) from the Supabase SQL Editor.
Copy the database connection details from Project Settings → Database. Use the
Session Pooler connection for a hosted API and require SSL.

The API still uses PostgreSQL JDBC because Supabase's managed database speaks
the PostgreSQL protocol. This is not a local PostgreSQL installation.

## 2. Deploy the API

Use a Java-capable host such as Render, Railway, Fly.io, Azure, or a managed
server. Build the backend with:

```text
cd backend
mvn clean package -DskipTests
```

The resulting JAR can be run with `java -jar target/dreambetter-api-0.0.1-SNAPSHOT.jar`.
The included `backend/Dockerfile` can be used by a container-based host.

Set these backend environment variables in the API host:

- `SUPABASE_DB_URL`: Supabase JDBC URL, with SSL enabled
- `SUPABASE_DB_USERNAME` and `SUPABASE_DB_PASSWORD`
- `SUPABASE_DB_DDL_AUTO=validate`
- `SUPABASE_DB_POOL_SIZE=5` (optional)
- `FRONTEND_URL`: comma-separated production and Vercel preview origins
- `SUPABASE_URL`: Supabase project URL used for JWT validation
- `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL`, and `GEMINI_BASE_URL`

Do not commit `.env`, database credentials, or the Gemini key. Never put
`SUPABASE_DB_PASSWORD` or a Supabase service-role key in the frontend.

Verify the API before deploying the frontend:

```text
https://YOUR_API_HOST/api/health
```

It should return a JSON response with `"status":"UP"`.

## 3. Configure the frontend

Before deployment, edit `frontend/js/supabase-config.js` and set:

```js
window.DREAMBETTER_API_URL = "https://YOUR_API_HOST";
```

The value must be the API origin only: do not append `/api`, because the
frontend adds that path for each request. Keep the URL on HTTPS in production.

## 4. Deploy to Vercel

1. Import the repository into Vercel.
2. Set the project root to `frontend`.
3. Leave the framework preset as **Other**.
4. Leave the build command empty.
5. Leave the output directory as `.`.
6. Deploy.

For a custom domain, add the final domain and the Vercel production/preview
domains to Supabase Dashboard → Authentication → URL Configuration →
Redirect URLs.
Also include every production and preview origin in `FRONTEND_URL` on the API
host. The browser origin must exactly match, including `https://` and the port
when applicable.

## 5. Smoke test after deployment

Test in this order:

1. Open the Vercel URL and confirm static assets load.
2. Register or sign in with email/password.
3. Test Google sign-in after configuring the Google provider in Supabase Auth.
4. Create a sleep log and reload the page; confirm the data persists.
5. Open the browser Network panel and confirm API calls use `YOUR_API_HOST`,
   return 2xx responses, and include an `Authorization: Bearer ...` header.
6. Open the AI Insights page and verify the Gemini request succeeds.
7. Verify `https://YOUR_API_HOST/api/health` remains healthy.

If API calls fail with a CORS error, correct `FRONTEND_URL`; do not use
`allowedOrigins("*")`, because authenticated requests must remain restricted.
