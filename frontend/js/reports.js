document.addEventListener("DOMContentLoaded", async () => {
  if (!window.DreamBetterAPI) return;
  loadReports();
  window.addEventListener("dreambetter:sleep-log-changed", loadReports);
  window.addEventListener("pageshow", loadReports);
  window.addEventListener("focus", loadReports);

  async function loadReports() {
  try {
    const logs = await DreamBetterAPI.request("/sleep-logs");
    const table = document.querySelector(".table");
    if (!table) return;
    const rows = logs.map(log => `
      <tr>
        <td>${escapeHtml(log.sleepDate)}</td>
        <td>${formatDuration(log.bedtime, log.wakeTime)}</td>
        <td>${qualityLabel(log.quality)}</td>
        <td><span class="pill">Complete</span></td>
      </tr>`).join("");
    table.innerHTML = `
      <tr><th>Date</th><th>Duration</th><th>Quality</th><th>Status</th></tr>
      ${rows || '<tr><td colspan="4">No sleep sessions logged yet.</td></tr>'}`;
  } catch (error) {
    console.error("Could not load sleep report.", error);
  }
  }

  function formatDuration(bedtime, wakeTime) {
    const start = new Date(bedtime);
    const end = new Date(wakeTime);
    let minutes = Math.round((end - start) / 60000);
    if (minutes <= 0) minutes += 24 * 60;
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
  }

  function qualityLabel(value) {
    return value >= 9 ? "Excellent" : value >= 7 ? "Good" : value >= 4 ? "Fair" : "Poor";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[character]));
  }
});
