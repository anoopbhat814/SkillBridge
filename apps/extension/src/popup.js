const jobEl = document.getElementById("job");
const saveBtn = document.getElementById("save");
let current = null;

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  chrome.tabs.sendMessage(tab.id, { type: "GET_JOB" }, (job) => {
    if (!job) {
      jobEl.textContent = "No job posting detected on this page.";
      return;
    }
    current = job;
    jobEl.textContent = `${job.title} at ${job.company ?? "Unknown"}`;
    saveBtn.disabled = false;
  });
});

saveBtn.addEventListener("click", async () => {
  const { shortlist = [] } = await chrome.storage.local.get("shortlist");
  if (!shortlist.some((j) => j.url === current.url)) shortlist.push(current);
  await chrome.storage.local.set({ shortlist });
  saveBtn.textContent = "Saved!";
  saveBtn.disabled = true;
});
