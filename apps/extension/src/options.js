const listEl = document.getElementById("list");

async function render() {
  const { shortlist = [] } = await chrome.storage.local.get("shortlist");
  listEl.replaceChildren(
    ...shortlist.map((job) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = job.url;
      link.target = "_blank";
      link.textContent = `${job.title} - ${job.company ?? "Unknown"}`;
      const remove = document.createElement("button");
      remove.textContent = "Remove";
      remove.addEventListener("click", async () => {
        await chrome.storage.local.set({ shortlist: shortlist.filter((j) => j.url !== job.url) });
        render();
      });
      li.append(link, remove);
      return li;
    }),
  );
}

document.getElementById("clear").addEventListener("click", async () => {
  await chrome.storage.local.set({ shortlist: [] });
  render();
});

render();
