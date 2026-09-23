let scrollTimerId = null;

function startScrolling(amount, intervalMs) {
  stopScrolling();
  scrollTimerId = setInterval(() => {
    window.scrollBy(0, amount);

    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
    if (atBottom) stopScrolling();
  }, intervalMs);
}

function stopScrolling() {
  if (scrollTimerId !== null) {
    clearInterval(scrollTimerId);
    scrollTimerId = null;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "ping":
      sendResponse({ ok: true });
      break;
    case "startScroll":
      startScrolling(message.amount, message.intervalMs);
      sendResponse({ ok: true, running: true });
      break;
    case "stopScroll":
      stopScrolling();
      sendResponse({ ok: true, running: false });
      break;
    case "getStatus":
      sendResponse({ running: scrollTimerId !== null });
      break;
    case "extractHtml":
      sendResponse({ html: document.documentElement.outerHTML, title: document.title });
      break;
    default:
      sendResponse({ ok: false, error: "Unknown action" });
  }
});
