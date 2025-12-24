# ChatGPT Prompt Saver Extension

A Chrome extension that adds a beautiful sidebar to ChatGPT for saving and managing your prompts.

## Features

- 📌 **Save Prompts**: Easily save any prompt with a custom title
- 🎨 **Native ChatGPT UI**: Styled to match ChatGPT's dark theme
- 💾 **Local Storage**: All prompts stored locally in your browser
- 🔍 **Search**: Quickly find prompts with real-time search
- 📋 **Copy & Use**: One-click to copy or use any saved prompt
- 📤 **Export/Import**: Backup and restore your prompts
- 🎯 **Quick Save Button**: Save prompts directly from ChatGPT's input
- 🔄 **Toggle Sidebar**: Collapse/expand sidebar as needed

## Installation

### Method 1: Load as Unpacked Extension (For Development)

1. **Download the extension files** to a folder on your computer

2. **Open Chrome Extensions page**:
   - Go to `chrome://extensions/`
   - Or click the puzzle icon → "Manage Extensions"

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top right

4. **Load the extension**:
   - Click "Load unpacked"
   - Select the `chatgpt-prompt-saver` folder

5. **Done!** The extension icon should appear in your toolbar

### Method 2: Package as CRX (For Distribution)

1. Follow steps 1-3 from Method 1
2. Click "Pack extension"
3. Select the extension folder
4. Click "Pack Extension"
5. Share the generated `.crx` file

## Usage

### Saving Prompts

**Option 1: Manual Save**
1. Type or paste your prompt in the sidebar's text area
2. (Optional) Add a custom title
3. Click "Save Prompt"

**Option 2: Quick Save**
1. Type your prompt in ChatGPT's input
2. Click the bookmark icon that appears near the send button
3. The prompt is instantly saved

**Option 3: Save Current Input**
1. Type your prompt in ChatGPT's input
2. Click "Save Current Input" in the sidebar
3. Optionally add a title when prompted

### Using Saved Prompts

- **Use**: Loads the prompt into ChatGPT's input field
- **Copy**: Copies the prompt to your clipboard
- **Delete**: Removes the prompt from your saved list

### Managing Prompts

- **Search**: Use the search box to filter prompts by text or title
- **Toggle Sidebar**: Click the arrow icon to collapse/expand
- **Export**: Save all prompts to a JSON file (via popup)
- **Import**: Load prompts from a backup file (via popup)
- **Clear All**: Delete all saved prompts (via popup)

## File Structure

```
chatgpt-prompt-saver/
├── manifest.json       # Extension configuration
├── content.js          # Main extension logic
├── styles.css          # Sidebar styling
├── popup.html          # Extension popup UI
├── popup.js            # Popup functionality
├── README.md           # This file
└── icons/              # Extension icons (you'll need to add these)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Creating Icons

You'll need to create three icon sizes:
- 16x16 pixels (`icon16.png`)
- 48x48 pixels (`icon48.png`)
- 128x128 pixels (`icon128.png`)

Use any image editor or online icon generator. A simple bookmark icon works well!

### Quick Icon Solution (Temporary)
For testing, you can create a simple colored square:
1. Open any image editor
2. Create a new image (16x16, 48x48, or 128x128)
3. Fill with a color (e.g., #10a37f - ChatGPT green)
4. Save as PNG

## Keyboard Shortcuts

- `Ctrl/Cmd + Enter` in the prompt input: Quick save the prompt

## Data Storage

All prompts are stored locally using Chrome's `storage.local` API:
- Data persists across browser sessions
- Not synced across devices
- Private to your browser
- No external servers involved

## Troubleshooting

### Extension not working on ChatGPT
- Make sure you're on `chatgpt.com` or `chat.openai.com`
- Refresh the ChatGPT page after installing
- Check if the extension is enabled in `chrome://extensions/`

### Sidebar not appearing
- Look for the sidebar on the right side of the page
- Try toggling it with the arrow button
- Check browser console for errors (F12)

### Prompts not saving
- Check if the extension has storage permissions
- Try exporting existing prompts as backup
- Clear and reinstall the extension if needed

## Privacy & Security

- **100% Local**: All data stored on your device
- **No Analytics**: No tracking or data collection
- **No Network**: Extension works completely offline
- **Open Source**: All code is visible and auditable

## Customization

You can customize the extension by editing:
- **styles.css**: Change colors, sizes, fonts
- **content.js**: Modify behavior and features
- **manifest.json**: Update permissions and metadata

## Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit improvements
- Share feedback

## License

Free to use and modify for personal and commercial purposes.

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the code comments
3. Open the browser console for error messages

---

Enjoy saving your prompts! 🚀
