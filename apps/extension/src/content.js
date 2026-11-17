// Extracts schema.org JobPosting data from the current page, if present.
function readJobPosting() {
  for (const node of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(node.textContent);
      const items = Array.isArray(data) ? data : [data];
      const posting = items.find((i) => i["@type"] === "JobPosting");
      if (posting) {
        return {
          title: posting.title,
          company: posting.hiringOrganization?.name,
          url: location.href,
          description: (posting.description || "").replace(/<[^>]+>/g, " ").slice(0, 2000),
        };
      }
    } catch (_) {
      /* ignore malformed JSON-LD */
    }
  }
  return null;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_JOB") sendResponse(readJobPosting());
});
