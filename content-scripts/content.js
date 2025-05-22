let currentSelection = '';
let floatingButton = null;

document.addEventListener('selectionchange', () => {
  const selection = window.getSelection().toString().trim();
  if (selection && selection !== currentSelection) {
    currentSelection = selection;
    showFloatingButton();
  } else if (!selection && floatingButton) {
    removeFloatingButton();
  }
});

function showFloatingButton() {
  if (!floatingButton) {
    floatingButton = document.createElement('div');
    floatingButton.className = 'floating-save-button';
    floatingButton.textContent = 'Save to Sheet';
    floatingButton.addEventListener('click', handleSaveClick);
    document.body.appendChild(floatingButton);
    positionButtonNearSelection();
    
    // Trigger animation after adding to DOM
    setTimeout(() => {
      floatingButton.classList.add('visible');
    }, 10);
    
    console.log('Floating button created and event listener attached');
  }
}

function positionButtonNearSelection() {
  const range = window.getSelection().getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Calculate optimal position
  let topPos = rect.top + window.scrollY - 40;
  let leftPos = rect.left + rect.width/2 - 60 + window.scrollX;
  
  // Ensure button stays within viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  if (leftPos < 10) leftPos = 10;
  if (leftPos > viewportWidth - 130) leftPos = viewportWidth - 130;
  if (topPos < 10) topPos = rect.bottom + window.scrollY + 10;
  
  floatingButton.style.top = `${topPos}px`;
  floatingButton.style.left = `${leftPos}px`;
}

function removeFloatingButton() {
  if (floatingButton) {
    floatingButton.remove();
    floatingButton = null;
  }
}

// Use in-page notifications instead of Chrome notifications API
function showInPageNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.className = `sheet-notification ${isError ? 'error' : 'success'}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('visible'), 10);
  
  // Remove after delay
  setTimeout(() => {
    notification.classList.remove('visible');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

let lastSavedText = '';
let lastSavedTime = 0;

function handleSaveClick() {
  const data = {
    text: window.getSelection().toString().trim(),
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString()
  };
  
  console.log('Save button clicked, data:', data);
  
  // Prevent duplicate saves within 5 seconds
  const now = Date.now();
  if (data.text === lastSavedText && now - lastSavedTime < 5000) {
    showInPageNotification('Already saved this text', true);
    removeFloatingButton();
    return;
  }
  
  chrome.runtime.sendMessage({ action: 'saveToSheet', data }, response => {
    if (chrome.runtime.lastError) {
      console.error('Message error:', chrome.runtime.lastError);
      showInPageNotification('Error: ' + chrome.runtime.lastError.message, true);
      return;
    }
    
    console.log('Message sent successfully, response:', response);
    
    if (response && response.success) {
      showInPageNotification('Saved to Google Sheet!');
      lastSavedText = data.text;
      lastSavedTime = now;
    } else {
      showInPageNotification('Failed to save: ' + (response?.error || 'Unknown error'), true);
    }
  });
  
  removeFloatingButton();
}

// Handle clicks outside the selection to remove the button
document.addEventListener('mousedown', (event) => {
  if (floatingButton && !floatingButton.contains(event.target)) {
    removeFloatingButton();
  }
});
