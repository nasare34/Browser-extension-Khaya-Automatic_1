// content.js

let widget;
let isVisible = false;

function createWidget() {
  widget = document.createElement('div');
  widget.id = 'khaya-translator-widget';
  widget.style.display = 'flex';
  widget.style.flexDirection = 'column';
  widget.style.position = 'fixed';
  widget.style.bottom = '20px';
  widget.style.right = '20px';
  widget.style.width = '320px';
  widget.style.background = '#fff';
  widget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  widget.style.borderRadius = '10px';
  widget.style.padding = '12px';
  widget.style.zIndex = '2147483647'; // max z-index for visibility
  widget.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
  widget.style.color = '#222';
  widget.style.userSelect = 'text';
  widget.style.cursor = 'default';

  widget.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <strong style="font-size:16px;">Khaya Translator</strong>
      <button id="khaya-close-btn" title="Close" style="background:none; border:none; font-size:20px; cursor:pointer; color:#888; line-height:1;">&times;</button>
    </div>
    <textarea id="khaya-input-text" placeholder="Enter or select text..." rows="3" style="width:100%; padding:6px; font-size:14px; resize:none; border:1px solid #ccc; border-radius:6px;"></textarea>
    <div style="margin-top:8px; display:flex; gap:8px;">
      <select id="khaya-source-lang" style="flex:1; padding:5px; font-size:14px; border-radius:6px; border:1px solid #ccc;">
        <option value="en">English</option>
        <option value="tw">Twi</option>
        <option value="ee">Ewe</option>
        <option value="gaa">Ga</option>
        <option value="fat">Fante</option>
        <option value="yo">Yoruba</option>
        <option value="dag">Dagbani</option>
        <option value="ki">Kikuyu</option>
        <option value="gur">Gurune</option>
        <option value="luo">Luo</option>
        <option value="mer">Kimeru</option>
        <option value="kus">Kusaal</option>
      </select>
      <select id="khaya-target-lang" style="flex:1; padding:5px; font-size:14px; border-radius:6px; border:1px solid #ccc;">
        <option value="tw">Twi</option>
        <option value="en">English</option>
        <option value="ee">Ewe</option>
        <option value="gaa">Ga</option>
        <option value="fat">Fante</option>
        <option value="yo">Yoruba</option>
        <option value="dag">Dagbani</option>
        <option value="ki">Kikuyu</option>
        <option value="gur">Gurune</option>
        <option value="luo">Luo</option>
        <option value="mer">Kimeru</option>
        <option value="kus">Kusaal</option>
      </select>
    </div>
    <button id="khaya-translate-btn" style="margin-top:10px; padding:8px; background:#0069d9; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">
      Translate
    </button>
    <textarea id="khaya-translated-text" readonly placeholder="Translated text appears here..." rows="5" style="margin-top:10px; width:100%; padding:6px 8px; font-size:14px; border:1px solid #4CAF50; border-radius:6px; color:#4CAF50; font-weight:600; resize: vertical; overflow-y: auto;"></textarea>
  `;

  document.body.appendChild(widget);

  widget.querySelector('#khaya-close-btn').addEventListener('click', () => {
    toggleWidget(false);
  });

  widget.querySelector('#khaya-translate-btn').addEventListener('click', translateText);

  // Fill input with current selection when widget opens
  updateInputWithSelection();

  // Update input on selection change only if widget visible
  document.addEventListener('selectionchange', () => {
    if (isVisible) updateInputWithSelection();
  });

  // Language selection logic
  const sourceSelect = widget.querySelector('#khaya-source-lang');
  const targetSelect = widget.querySelector('#khaya-target-lang');

  function enforceLanguageRules() {
    const source = sourceSelect.value;
    const target = targetSelect.value;

    if (
      source === target ||
      (source === 'en' && target === 'en') ||
      (source !== 'en' && target !== 'en')
    ) {
      if (source === 'en') {
        if (target === 'en') targetSelect.value = 'tw';
      } else {
        if (target !== 'en') targetSelect.value = 'en';
      }
    }
  }

  sourceSelect.addEventListener('change', enforceLanguageRules);
  targetSelect.addEventListener('change', enforceLanguageRules);
}

function toggleWidget(show) {
  if (!widget) createWidget();

  if (typeof show === 'undefined') {
    show = !isVisible;
  }
  widget.style.display = show ? 'flex' : 'none';
  isVisible = show;
}

async function translateText() {
  const input = widget.querySelector('#khaya-input-text').value.trim();
  const source = widget.querySelector('#khaya-source-lang').value;
  const target = widget.querySelector('#khaya-target-lang').value;
  const output = widget.querySelector('#khaya-translated-text');

  if (!input) {
    output.value = 'Please enter or select some text.';
    return;
  }

  if (
    source === target ||
    (source === 'en' && target === 'en') ||
    (source !== 'en' && target !== 'en')
  ) {
    output.value = 'Invalid language selection.';
    return;
  }

  output.value = 'Translating...';

  try {
    const response = await fetch('http://127.0.0.1:5000/api/translate-snippet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: input,
        source_language: source,
        target_language: target,
      }),
    });
    const data = await response.json();

    if (data.translated_text) {
      output.value = data.translated_text;
    } else {
      output.value = data.error || 'Translation failed.';
    }
  } catch (e) {
    output.value = 'Error contacting translation service.';
  }
}

function updateInputWithSelection() {
  const selection = window.getSelection().toString().trim();
  if (selection) {
    widget.querySelector('#khaya-input-text').value = selection;
  }
}

// Listen for messages from background.js (toggle on extension icon click)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleWidget') {
    toggleWidget();
    sendResponse({ success: true });
  }
});

// Keyboard shortcut Ctrl+Shift+Y to toggle widget
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    toggleWidget();
  }
});

// Auto show widget on text selection if widget is visible
document.addEventListener('mouseup', () => {
  if (!widget || !isVisible) return;
  updateInputWithSelection();
});
