// Send a message to the content script whenever the tab is updated.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.tabs.sendMessage(tabId, {
    type: "TAB_UPDATED",
  });
});
