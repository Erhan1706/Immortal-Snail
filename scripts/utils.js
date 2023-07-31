/**
 * Gets the current active tab.
 * @returns the tabId of the active tab.
 */
export async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0].id;
}
