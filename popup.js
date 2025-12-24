// ChatGPT Prompt Saver - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  await updateStats();
  attachEventListeners();
});

async function updateStats() {
  try {
    const result = await chrome.storage.local.get(['savedPrompts']);
    const prompts = result.savedPrompts || [];
    
    document.getElementById('total-prompts').textContent = prompts.length;
    
    // Calculate storage size
    const storageSize = new Blob([JSON.stringify(prompts)]).size;
    const sizeInKB = (storageSize / 1024).toFixed(2);
    document.getElementById('total-size').textContent = `${sizeInKB} KB`;
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

function attachEventListeners() {
  // Open ChatGPT
  document.getElementById('open-chatgpt').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://chatgpt.com' });
  });

  // Export prompts
  document.getElementById('export-prompts').addEventListener('click', async () => {
    try {
      const result = await chrome.storage.local.get(['savedPrompts']);
      const prompts = result.savedPrompts || [];
      
      if (prompts.length === 0) {
        showStatus('No prompts to export', 'error');
        return;
      }

      const dataStr = JSON.stringify(prompts, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `chatgpt-prompts-${timestamp}.json`;
      
      chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      });
      
      showStatus(`Exported ${prompts.length} prompts successfully!`, 'success');
    } catch (error) {
      console.error('Error exporting prompts:', error);
      showStatus('Failed to export prompts', 'error');
    }
  });

  // Import prompts
  document.getElementById('import-prompts').addEventListener('click', () => {
    document.getElementById('import-file-input').click();
  });

  document.getElementById('import-file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedPrompts = JSON.parse(text);
      
      if (!Array.isArray(importedPrompts)) {
        throw new Error('Invalid format');
      }

      // Get existing prompts
      const result = await chrome.storage.local.get(['savedPrompts']);
      const existingPrompts = result.savedPrompts || [];
      
      // Merge prompts (avoid duplicates by checking text)
      const existingTexts = new Set(existingPrompts.map(p => p.text));
      const newPrompts = importedPrompts.filter(p => !existingTexts.has(p.text));
      
      const mergedPrompts = [...existingPrompts, ...newPrompts];
      await chrome.storage.local.set({ savedPrompts: mergedPrompts });
      
      showStatus(`Imported ${newPrompts.length} new prompts!`, 'success');
      await updateStats();
    } catch (error) {
      console.error('Error importing prompts:', error);
      showStatus('Failed to import prompts. Invalid file format.', 'error');
    }
    
    // Reset file input
    e.target.value = '';
  });

  // Clear all prompts
  document.getElementById('clear-all').addEventListener('click', async () => {
    const confirmed = confirm('Are you sure you want to delete ALL saved prompts? This cannot be undone.');
    
    if (confirmed) {
      try {
        await chrome.storage.local.set({ savedPrompts: [] });
        showStatus('All prompts cleared successfully', 'success');
        await updateStats();
      } catch (error) {
        console.error('Error clearing prompts:', error);
        showStatus('Failed to clear prompts', 'error');
      }
    }
  });
}

function showStatus(message, type = 'success') {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = message;
  statusEl.className = type;
  
  setTimeout(() => {
    statusEl.style.display = 'none';
    statusEl.className = '';
  }, 3000);
}
