# SkillBridge Job Saver

Chrome (Manifest V3) extension that detects a job posting on the current page and
saves it to a local shortlist in `chrome.storage.local`.

## Loading it locally

1. Open `chrome://extensions` and enable *Developer mode*.
2. Choose *Load unpacked* and select this folder.

## How it works

- `src/content.js` scrapes the title, company and URL from the page.
- `src/popup.js` asks the content script for the job and lets the user save it.
- `src/background.js` badges the toolbar icon with the shortlist size.
