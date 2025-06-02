// background.js

// Listen for extension icon click to toggle the widget
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  chrome.tabs.sendMessage(tab.id, { action: "toggleWidget" });
});

// Listen for keyboard shortcut to toggle the widget
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-widget") {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0 && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleWidget" });
    }
  }
});
