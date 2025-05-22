# Web-to-Sheet Logger Chrome Extension

A Chrome extension that lets users highlight text on any webpage and save it directly to a Google Sheet along with metadata (timestamp, page URL, and title). Perfect for researchers, journalists, salespeople, or founders who need to capture insights from the web quickly.

## Features

- **Text Selection**: Highlight any text on a webpage
- **Floating Save Button**: A convenient button appears near your selection
- **Context Menu Integration**: Right-click and select "Save to Sheet" as an alternative
- **Metadata Capture**: Automatically collects page URL, title, and timestamp
- **Google Sheets Integration**: Seamlessly saves data to your Google Sheet

## Installation

### Local Installation (Development)

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the `web-to-sheet-logger` directory
5. The extension should now appear in your Chrome toolbar

### Google Apps Script Setup

1. Create a new Google Sheet
2. Go to Extensions → Apps Script
3. Replace the code with the following:

```
function doPost(e) {
try {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
const data = JSON.parse(e.postData.contents);
sheet.appendRow([
  data.text,
  data.url,
  data.title,
  new Date(data.timestamp)
]);

return ContentService.createTextOutput(
  JSON.stringify({ status: 'success' })
).setMimeType(ContentService.MimeType.JSON);
} catch (error) {
return ContentService.createTextOutput(
JSON.stringify({ status: 'error', message: error.toString() })
).setMimeType(ContentService.MimeType.JSON);
}
}

function doGet() {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

if (sheet.getLastRow() === 0) {
sheet.appendRow(['Selected Text', 'Page URL', 'Page Title', 'Timestamp']);
}

return HtmlService.createHtmlOutput(
'<h1>Web-to-Sheet Logger API</h1><p>This is a web app endpoint for the Chrome extension.</p>'
);
}
```


4. Deploy as a web app:
   - Click "Deploy" → "New deployment"
   - Select "Web app" as the deployment type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
   - Copy the provided web app URL

5. Update the extension with your web app URL:
   - Open `service-worker.js` in the extension directory
   - Replace the `SHEET_WEBHOOK_URL` value with your Apps Script web app URL

## Usage

1. Navigate to any webpage
2. Highlight text you want to save
3. Either:
   - Click the floating "Save to Sheet" button that appears near your selection, or
   - Right-click and select "📋 Save [selection] to Google Sheet" from the context menu
4. A notification will appear confirming the save
5. Check your Google Sheet to see the saved data

## Permissions Used

- **activeTab**: Required to access the content of the current tab
- **storage**: Used to store settings and preferences
- **contextMenus**: Enables the right-click context menu option
- **scripting**: Needed to execute scripts for context menu functionality
- **notifications**: Used to display save confirmation messages
- **host_permissions**: Required to communicate with the Google Apps Script web app

## Known Limitations

- The extension may not work on certain websites that use complex text rendering or have strict CSP (Content Security Policy)
- Some websites may interfere with the floating button positioning
- Very large text selections may be truncated when saved to Google Sheets
- The extension requires an active internet connection to save to Google Sheets

## Troubleshooting

- If the floating button doesn't appear, try refreshing the page
- If saves fail, check your Google Apps Script deployment settings
- Make sure you've updated the extension with your correct web app URL
- Check the browser console for any error messages

## Future Improvements

- Support for bulk highlights or multi-select
- Add tags or categories before saving
- Allow switching between multiple linked sheets
- Offline mode with local storage until connection is restored

## Project Structure

```
web-to-sheet-logger/
├── manifest.json // Core configuration file
├── service-worker.js // Background script for handling events
├── content-scripts/
│ ├── content.js // Script that runs on webpages
│ └── floating-button.css // Styling for the floating save button
├── popup/
│ ├── popup.html // Extension popup interface
│ ├── popup.js // Popup functionality
│ └── popup.css // Popup styling
└── icons/
├── icon16.png // Icon for toolbar (16x16px)
├── icon48.png // Icon for extensions page (48x48px)
└── icon128.png // Icon for Chrome Web Store (128x128px)
```

