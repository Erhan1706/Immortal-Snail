/*
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Get the current tab ID
  const tabId = activeInfo.tabId;

  // Send a message to the content script of the activated tab
  chrome.tabs.sendMessage(tabId, {
    type: "NEWTAB",
  });
});
*/

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Send a message to the content script of the updated tab
  chrome.tabs.sendMessage(tabId, {
    type: "TAB_UPDATED",
  });
});
