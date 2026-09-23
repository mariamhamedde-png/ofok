const amountInput = document.getElementById("amount");
const speedInput = document.getElementById("speed");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const extractBtn = document.getElementById("extractBtn");
const statusEl = document.getElementById("status");

function setStatus(text) {
  statusEl.textContent = text;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { action: "ping" });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content/content.js"],
    });
  }
}

async function sendToContent(tabId, message) {
  await ensureContentScript(tabId);
  return chrome.tabs.sendMessage(tabId, message);
}

async function refreshStatus() {
  try {
    const tab = await getActiveTab();
    const res = await sendToContent(tab.id, { action: "getStatus" });
    setStatus(res.running ? "Scrolling…" : "Idle");
  } catch {
    setStatus("Unavailable on this page");
  }
}

startBtn.addEventListener("click", async () => {
  const amount = Number(amountInput.value) || 300;
  const intervalMs = Number(speedInput.value) || 200;

  try {
    const tab = await getActiveTab();
    await sendToContent(tab.id, { action: "startScroll", amount, intervalMs });
    setStatus("Scrolling…");
  } catch (err) {
    setStatus("Can't run here: " + err.message);
  }
});

stopBtn.addEventListener("click", async () => {
  try {
    const tab = await getActiveTab();
    await sendToContent(tab.id, { action: "stopScroll" });
    setStatus("Stopped");
  } catch (err) {
    setStatus("Can't run here: " + err.message);
  }
});

extractBtn.addEventListener("click", async () => {
  try {
    const tab = await getActiveTab();
    const res = await sendToContent(tab.id, { action: "extractHtml" });

    const blob = new Blob([res.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const filename = (res.title || "page").replace(/[\\/:*?"<>|]+/g, "_") + ".html";

    await chrome.downloads.download({ url, filename, saveAs: true });
    URL.revokeObjectURL(url);
    setStatus("HTML extracted");
  } catch (err) {
    setStatus("Extract failed: " + err.message);
  }
});

refreshStatus();
