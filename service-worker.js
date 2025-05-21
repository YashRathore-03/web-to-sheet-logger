const SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxXd46iChdSviNEQq56WWky9Hw2LNgtWrjdulso8uU3gRd37xemAvCcjDWtxFN4m4c5/exec';

// Set up context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveSelectionToSheet',
    title: 'Save selection to Sheet',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveSelectionToSheet') {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        text: window.getSelection().toString().trim(),
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString()
      }),
    }, (results) => {
      if (results[0].result) {
        saveToGoogleSheet(results[0].result);
      }
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveToSheet') {
    saveToGoogleSheet(message.data)
      .then(response => showNotification('Saved successfully!'))
      .catch(error => showNotification(`Error: ${error.message}`));
  }
});

// Save data to Google Sheet via Apps Script
async function saveToGoogleSheet(data) {
  try {
    if (!data.text) throw new Error('No text selected');
    
    const response = await fetch(SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Server error');
    return response.json();
  } catch (error) {
    console.error('Save failed:', error);
    throw error;
  }
}

// Show notification to user
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Web-to-Sheet Logger',
    message: message
  });
}
