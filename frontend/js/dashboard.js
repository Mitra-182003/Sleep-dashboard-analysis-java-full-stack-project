document.addEventListener("DOMContentLoaded", () => {
  const greeting = document.querySelector("[data-greeting]");
  const name = localStorage.getItem("dreambetterName");
  if (greeting && name) greeting.textContent = `Welcome back, ${name}!`;
  loadSummary();
  window.addEventListener("dreambetter:sleep-log-changed", loadSummary);
  window.addEventListener("pageshow", loadSummary);
  window.addEventListener("focus", loadSummary);

  async function loadSummary() {
    if (!window.DreamBetterAPI) return;
    try {
      const summary = await DreamBetterAPI.request("/sleep-logs/summary");
      const metrics = document.querySelectorAll(".metrics .metric");
      if (metrics.length < 4 || summary.entryCount === 0) return;
      const duration = Number(summary.averageDurationMinutes) || 0;
      metrics[0].querySelector("strong").textContent =
        `${Math.floor(duration / 60)}h ${String(duration % 60).padStart(2, "0")}m`;
      metrics[0].querySelector("small").textContent = "Across your logged nights";
      metrics[1].querySelector("strong").textContent = `${summary.averageQuality} / 10`;
      metrics[1].querySelector("small").textContent = "Average recorded quality";
      metrics[2].querySelector("strong").textContent = `${summary.sleepConsistencyPercent}%`;
      metrics[2].querySelector("small").textContent = "Nights within 7-9 hours";
      const debt = Number(summary.sleepDebtMinutes) || 0;
      metrics[3].querySelector("strong").textContent =
        `${Math.floor(debt / 60)}h ${String(debt % 60).padStart(2, "0")}m`;
      metrics[3].querySelector("small").textContent = "Based on an 8-hour target";
    } catch (error) {
      showSyncError(error.message);
    }
  }

  function showSyncError(message) {
    const toast = document.querySelector(".toast");
    if (!toast) return;
    toast.textContent = `Could not sync sleep data: ${message}`;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4000);
  }
});
