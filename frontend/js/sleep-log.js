document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".content-grid .card");
  const form = card?.querySelector("[data-sleep-form]");
  const fields = card?.querySelectorAll("input, select, textarea");
  const saveButton = card?.querySelector(".btn-primary");
  const status = card?.querySelector("[data-sleep-status]");
  if (!card || !form || !fields || fields.length < 5 || !saveButton) return;
  if (!window.DreamBetterAPI) {
    showStatus("Sleep service is not ready. Please refresh the page.", true);
    return;
  }

  const [bedtime, wakeTime, quality, mood, notes] = fields;
  const today = new Date().toISOString().slice(0, 10);
  let activeLogId = null;
  const dateLabel = card.querySelector("[data-sleep-date]");
  if (dateLabel) {
    dateLabel.textContent = `Today, ${new Date(`${today}T00:00:00`).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric"
    })}`;
  }

  saveButton.removeAttribute("data-toast");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!bedtime.value || !wakeTime.value || !quality.value) {
      showStatus("Enter bedtime, wake time, and sleep quality.", true);
      return;
    }
    if (bedtime.value === wakeTime.value) {
      showStatus("Bedtime and wake time must be different.", true);
      return;
    }

    saveButton.disabled = true;
    showStatus("Saving sleep data...");
    try {
      const payload = {
        sleepDate: today,
        bedtime: `${today}T${bedtime.value}:00`,
        wakeTime: `${today}T${wakeTime.value}:00`,
        quality: qualityToNumber(quality.value),
        mood: mood.value || null,
        notes: notes.value.trim() || null
      };
      const result = await DreamBetterAPI.request(
        activeLogId ? `/sleep-logs/${activeLogId}` : "/sleep-logs",
        { method: activeLogId ? "PATCH" : "POST", body: JSON.stringify(payload) }
      );
      activeLogId = result.id;
      const savedLog = await loadToday();
      updateSummary(savedLog || result);
      window.dispatchEvent(new CustomEvent("dreambetter:sleep-log-changed"));
      showStatus("Sleep data saved to the database.");
      showToast("Sleep session saved.");
    } catch (error) {
      showStatus(error.message || "Could not save sleep session.", true);
      showToast(error.message || "Could not save sleep session.");
    } finally {
      saveButton.disabled = false;
    }
  });

  loadToday();

  async function loadToday() {
    try {
      const logs = await DreamBetterAPI.request("/sleep-logs");
      const log = logs.find(item => item.sleepDate === today);
      if (!log) {
        clearSummary();
        return null;
      }
      activeLogId = log.id;
      bedtime.value = log.bedtime?.slice(11, 16) || "";
      wakeTime.value = log.wakeTime?.slice(11, 16) || "";
      quality.value = qualityLabel(log.quality);
      mood.value = log.mood || "";
      notes.value = log.notes || "";
      updateSummary(log);
      return log;
    } catch (error) {
      showToast(`Could not load your sleep logs: ${error.message}`);
      return null;
    }
  }

  function updateSummary(log) {
    const summaryCard = card.parentElement.querySelector(".card:nth-child(2)");
    const emptyState = summaryCard?.querySelector(".empty-state");
    if (emptyState) {
      emptyState.querySelector("h2").textContent = "Sleep logged today";
      emptyState.querySelector("p").textContent = "Your sleep session is saved to your account.";
    }
    const values = summaryCard?.querySelectorAll(".list-row small");
    if (!values || values.length < 3) return;
    values[0].textContent = formatDuration(log.bedtime, log.wakeTime);
    values[1].textContent = `${Number(log.quality) || 0} / 10`;
    values[2].textContent = log.mood || "Not recorded";
  }

  function clearSummary() {
    const summaryCard = card.parentElement.querySelector(".card:nth-child(2)");
    const emptyState = summaryCard?.querySelector(".empty-state");
    if (emptyState) {
      emptyState.querySelector("h2").textContent = "No sleep logged today";
      emptyState.querySelector("p").textContent = "Complete the form to see your daily summary here.";
    }
  }

  function qualityToNumber(value) {
    return { Excellent: 10, Good: 8, Fair: 5, Poor: 2 }[value] || Number(value);
  }

  function qualityLabel(value) {
    return value >= 9 ? "Excellent" : value >= 7 ? "Good" : value >= 4 ? "Fair" : "Poor";
  }

  function formatDuration(bedtimeValue, wakeTimeValue) {
    const bedtimeDate = new Date(bedtimeValue);
    const wakeTimeDate = new Date(wakeTimeValue);
    let minutes = Math.round((wakeTimeDate - bedtimeDate) / 60000);
    if (minutes <= 0) minutes += 24 * 60;
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
  }

  function showToast(message) {
    const toast = document.querySelector(".toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function showStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? "#b42318" : "#1b6e46";
  }
});
