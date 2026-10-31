window.DreamBetterAPI = {
  async request(path, options = {}) {
    const client = window.DreamBetterSupabase;
    const { data: { session } } = client
      ? await client.auth.getSession()
      : { data: { session: null } };
    if (!session) {
      throw new Error("Please sign in before using this feature.");
    }

    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    headers.Authorization = `Bearer ${session.access_token}`;
    const configuredApiUrl = typeof window.DREAMBETTER_API_URL === "string"
      ? window.DREAMBETTER_API_URL.trim().replace(/\/+$/, "")
      : "";
    const localApiUrl = ["localhost", "127.0.0.1"].includes(window.location.hostname)
      ? "http://localhost:8080"
      : "";
    const apiUrl = configuredApiUrl || localApiUrl;
    const response = await fetch(`${apiUrl}/api${path}`, {
      cache: "no-store",
      ...options,
      headers
    });
    if (!response.ok) {
      let message = `Request failed: ${response.status}`;
      try {
        const error = await response.json();
        message = error.message || message;
      } catch (_) {
        // Keep the HTTP status when the server has no JSON error body.
      }
      throw new Error(message);
    }
    return response.status === 204 ? null : response.json();
  }
};
