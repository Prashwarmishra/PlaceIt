// Handle extension icon click to open sidebar for specific tab
chrome.action.onClicked.addListener((tab) => {
  // Open the side panel for this specific tab
  // Must be called synchronously (without await) to preserve user gesture
  chrome.sidePanel.open({ tabId: tab.id });
  
  // Optionally set options for this tab (can be async)
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: 'sidebar/sidebar.html',
    enabled: true
  });
});

// Optional: Clean up when tabs are closed to prevent memory leaks
chrome.tabs.onRemoved.addListener((tabId) => {
  // Chrome automatically cleans up tab-specific settings
  // This is just for any custom cleanup if needed
});
