const SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzfmpumzaQ41zvy6VzHH14Ad1-fTPJ1MPYeqU3zN4xIgOzpwtHevRYyiGvhXCLAZm8G/exec';

// Set up context menu on installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'saveSelectionToSheet',
      title: '📋 Save "%s" to Google Sheet',
      contexts: ['selection']
    });
  });
  

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'saveSelectionToSheet') {
      // First try to use info.selectionText (more reliable)
      if (info.selectionText && info.selectionText.trim()) {
        saveToGoogleSheet({
          text: info.selectionText.trim(),
          url: tab.url,
          title: tab.title,
          timestamp: new Date().toISOString()
        });
      } else {
        // Fallback to executeScript
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => ({
            text: window.getSelection().toString().trim(),
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString()
          }),
        }, (results) => {
          if (results && results[0] && results[0].result && results[0].result.text) {
            saveToGoogleSheet(results[0].result);
          } else {
            showNotification('Error: No text selected');
          }
        });
      }
    }
  });
  
  

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'saveToSheet') {
      saveToGoogleSheet(message.data)
        .then(response => {
          sendResponse({success: true});
          showNotification('Saved successfully!');
        })
        .catch(error => {
          sendResponse({success: false, error: error.message});
          showNotification(`Error: ${error.message}`, true);
        });
      return true; // Keep the messaging port open for async response
    }
  });

// Save data to Google Sheet via Apps Script
async function saveToGoogleSheet(data) {
    try {
      // More detailed validation
      if (!data) throw new Error('No data provided');
      if (!data.text || data.text.trim() === '') throw new Error('No text selected');
      
      console.log('Sending data to sheet:', data);
      
      const response = await fetch(SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
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
