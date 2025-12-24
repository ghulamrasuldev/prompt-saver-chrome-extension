// ChatGPT Prompt Saver - Content Script

class PromptSaver {
  constructor() {
    this.prompts = [];
    this.init();
  }

  async init() {
    await this.loadPrompts();
    this.waitForChatGPT();
  }

  waitForChatGPT() {
    // Wait for ChatGPT UI to be fully loaded
    const checkInterval = setInterval(() => {
      const mainContainer = document.querySelector('main') || document.querySelector('[role="main"]');
      if (mainContainer && !document.getElementById('prompt-saver-sidebar')) {
        clearInterval(checkInterval);
        this.injectUI();
        this.attachEventListeners();
        this.observeNavigation();
      }
    }, 500);

    // Clear interval after 10 seconds if not found
    setTimeout(() => clearInterval(checkInterval), 10000);
  }

  observeNavigation() {
    // Monitor URL changes in SPA
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        this.handleNavigation();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  handleNavigation() {
    // Re-inject UI if it was removed during navigation
    if (!document.getElementById('prompt-saver-sidebar')) {
      this.injectUI();
    }
  }

  async loadPrompts() {
    try {
      const result = await chrome.storage.local.get(["savedPrompts"]);
      this.prompts = result.savedPrompts || [];
    } catch (error) {
      console.error("Error loading prompts:", error);
      this.prompts = [];
    }
  }

  async savePrompts() {
    try {
      await chrome.storage.local.set({ savedPrompts: this.prompts });
    } catch (error) {
      console.error("Error saving prompts:", error);
    }
  }

  injectUI() {
    // Create modal
    const modal = document.createElement("div");
    modal.id = "prompt-modal";
    modal.className = "prompt-modal";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Save New Prompt</h3>
        </div>
        <div class="modal-body">
          <input type="text" id="modal-prompt-title" placeholder="Title (optional)" />
          <textarea id="modal-prompt-text" placeholder="Enter your prompt..." rows="5"></textarea>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" id="modal-load-current">Load Current</button>
          <button class="modal-btn" id="modal-cancel">Cancel</button>
          <button class="modal-btn primary" id="modal-save">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Create sidebar (always visible)
    const sidebar = document.createElement("div");
    sidebar.id = "prompt-saver-sidebar";
    sidebar.className = "prompt-saver-sidebar";
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-title">
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Saved Prompts</span>
        </div>
        <button id="save-prompt-btn" class="save-prompt-btn" title="Save new prompt">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Save Prompt
        </button>
      </div>
      <div class="sidebar-content">
        <div id="prompts-list" class="prompts-list"></div>
      </div>
    `;
    document.body.appendChild(sidebar);

    this.renderPrompts();
  }

  attachEventListeners() {
    // Save prompt button
    document.getElementById("save-prompt-btn").addEventListener("click", () => {
      this.openModal();
    });

    // Modal controls
    document.getElementById("modal-cancel").addEventListener("click", () => {
      this.closeModal();
    });

    document.getElementById("modal-save").addEventListener("click", () => {
      this.saveFromModal();
    });

    // Load current ChatGPT input
    document
      .getElementById("modal-load-current")
      .addEventListener("click", () => {
        const currentText = this.getCurrentInput();
        if (currentText) {
          document.getElementById("modal-prompt-text").value = currentText;
          this.showToast("Loaded current input!");
        } else {
          this.showToast("No input to load");
        }
      });

    // Click outside modal to close
    document.getElementById("prompt-modal").addEventListener("click", (e) => {
      if (e.target.id === "prompt-modal") {
        this.closeModal();
      }
    });

    // ESC key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
      }
    });
  }

  openModal(prefillText = "") {
    const modal = document.getElementById("prompt-modal");
    const textarea = document.getElementById("modal-prompt-text");
    const title = document.getElementById("modal-prompt-title");

    textarea.value = prefillText;
    title.value = "";
    modal.classList.add("show");

    if (prefillText) {
      title.focus();
    } else {
      textarea.focus();
    }
  }

  closeModal() {
    const modal = document.getElementById("prompt-modal");
    modal.classList.remove("show");
  }

  saveFromModal() {
    const text = document.getElementById("modal-prompt-text").value.trim();
    const title = document.getElementById("modal-prompt-title").value.trim();

    if (text) {
      this.addPrompt(text, title);
      this.closeModal();
      this.showToast("Prompt saved!");
    }
  }

  addPrompt(text, title = "") {
    const prompt = {
      id: Date.now(),
      title: title || this.generateTitle(text),
      text: text,
      createdAt: new Date().toISOString(),
    };

    this.prompts.unshift(prompt);
    this.savePrompts();
    this.renderPrompts();
  }

  generateTitle(text) {
    const maxLength = 50;
    const truncated =
      text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    return truncated;
  }

  deletePrompt(id) {
    if (confirm("Delete this prompt?")) {
      this.prompts = this.prompts.filter((p) => p.id !== id);
      this.savePrompts();
      this.renderPrompts();
      this.showToast("Prompt deleted");
    }
  }

  copyPrompt(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast("Copied!");
    });
  }

  getCurrentInput() {
    // Get text from ChatGPT's contenteditable div
    const promptInput = document.querySelector("#prompt-textarea");
    if (promptInput) {
      return promptInput.textContent.trim();
    }
    return "";
  }

  usePrompt(text) {
    // ChatGPT uses a contenteditable div with id="prompt-textarea"
    const promptInput = document.querySelector("#prompt-textarea");

    if (promptInput) {
      // Clear existing content
      promptInput.innerHTML = "";

      // Create a paragraph element with the text
      const p = document.createElement("p");
      p.textContent = text;
      promptInput.appendChild(p);

      // Focus the input
      promptInput.focus();

      // Move cursor to end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(promptInput);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

      // Trigger input event for React/ProseMirror
      promptInput.dispatchEvent(new Event("input", { bubbles: true }));
      promptInput.dispatchEvent(new Event("change", { bubbles: true }));

      this.showToast("Prompt loaded!");
    } else {
      this.showToast("Could not find input");
    }
  }

  renderPrompts() {
    const container = document.getElementById("prompts-list");

    if (this.prompts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>No saved prompts yet</p>
          <span>Click "Save Prompt" to get started</span>
        </div>
      `;
      return;
    }

    container.innerHTML = this.prompts
      .map(
        (prompt) => `
      <div class="prompt-item" data-id="${prompt.id}">
        <div class="prompt-header">
          <h4 class="prompt-title">${this.escapeHtml(prompt.title)}</h4>
          <span class="prompt-date">${this.formatDate(prompt.createdAt)}</span>
        </div>
        <p class="prompt-text">${this.escapeHtml(prompt.text)}</p>
        <div class="prompt-actions">
          <button class="action-btn use-btn" data-id="${
            prompt.id
          }" title="Use this prompt">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            Use
          </button>
          <button class="action-btn copy-btn" data-id="${
            prompt.id
          }" title="Copy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </button>
          <button class="action-btn delete-btn" data-id="${
            prompt.id
          }" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      </div>
    `
      )
      .join("");

    // Attach event listeners
    container.querySelectorAll(".use-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const prompt = this.prompts.find((p) => p.id === id);
        if (prompt) this.usePrompt(prompt.text);
      });
    });

    container.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const prompt = this.prompts.find((p) => p.id === id);
        if (prompt) this.copyPrompt(prompt.text);
      });
    });

    container.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        this.deletePrompt(id);
      });
    });

    // Click on prompt item to open modal with text
    container.querySelectorAll(".prompt-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = parseInt(item.dataset.id);
        const prompt = this.prompts.find((p) => p.id === id);
        if (prompt) {
          this.openModal(prompt.text);
        }
      });
    });
  }

  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "prompt-saver-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

// Initialize the extension
let promptSaverInstance = null;

function initExtension() {
  if (!promptSaverInstance) {
    promptSaverInstance = new PromptSaver();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initExtension);
} else {
  initExtension();
}
