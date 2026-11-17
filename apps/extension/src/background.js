async function refreshBadge() {
  const { shortlist = [] } = await chrome.storage.local.get("shortlist");
  await chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
  await chrome.action.setBadgeText({ text: shortlist.length ? String(shortlist.length) : "" });
}

chrome.runtime.onInstalled.addListener(refreshBadge);
chrome.runtime.onStartup.addListener(refreshBadge);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.shortlist) refreshBadge();
});
