document.addEventListener("DOMContentLoaded", async () => {
  if (!window.DreamBetterAPI) return;
  loadAnalytics();
  window.addEventListener("dreambetter:sleep-log-changed", loadAnalytics);
  window.addEventListener("pageshow", loadAnalytics);
  window.addEventListener("focus", loadAnalytics);

  async function loadAnalytics() {
  try {
    const logs = await DreamBetterAPI.request("/sleep-logs");
    const chart = document.querySelector(".chart-line");
    const monthLabel = document.querySelector(".page-heading + .card .section-title span");
    const score = document.querySelector(".score-ring");
    const scoreText = document.querySelector(".score strong");
    const scoreDescription = document.querySelector(".score p");

    if (!logs.length) return;

    if (monthLabel) {
      monthLabel.textContent = `${logs.length} logged night${logs.length === 1 ? "" : "s"}`;
    }

    if (chart) {
      const durations = logs.slice().reverse().map(log => durationMinutes(log.bedtime, log.wakeTime));
      const max = Math.max(...durations, 1);
      const min = Math.min(...durations);
      const range = Math.max(max - min, 1);
      const points = durations.map((duration, index) => {
        const x = durations.length === 1 ? 450 : index * 900 / (durations.length - 1);
        const y = 155 - ((duration - min) / range) * 110;
        return `${Math.round(x)} ${Math.round(y)}`;
      });
      chart.setAttribute("d", `M${points.join(" L")}`);
    }

    const averageQuality = logs.reduce((total, log) => total + Number(log.quality || 0), 0) / logs.length;
    const scoreValue = Math.round(averageQuality * 10);
    if (score) score.textContent = `${scoreValue}%`;
    if (scoreText) scoreText.textContent = `${qualityLabel(averageQuality)} average`;
    if (scoreDescription) scoreDescription.textContent = `${logs.length} sleep session${logs.length === 1 ? "" : "s"} analyzed.`;
  } catch (error) {
    console.error("Could not load sleep analytics.", error);
  }
  }

  function durationMinutes(bedtime, wakeTime) {
    const start = new Date(bedtime);
    const end = new Date(wakeTime);
    let minutes = (end - start) / 60000;
    if (minutes <= 0) minutes += 24 * 60;
    return Number.isFinite(minutes) ? minutes : 0;
  }

  function qualityLabel(value) {
    return value >= 9 ? "Excellent" : value >= 7 ? "Good" : value >= 4 ? "Fair" : "Poor";
  }
});
