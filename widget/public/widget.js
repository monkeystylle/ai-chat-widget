(() => {
  if (window.__aiChatWidgetLoaded) return;
  window.__aiChatWidgetLoaded = true;

  // ---------- Settings (change these per site) ----------
  const CONFIG = {
    // Local API for testing. Swap to the deployed Worker URL after Step 7.
    apiUrl: 'http://localhost:8787/chat',
    title: 'Joseph Brummel',
    tag: 'AI assistant',
    placeholder: "Ask about Joseph's work",
    footer: 'AI assistant \u00B7 answers questions about Joseph',
    botName: 'Assistant',
    greeting:
      "Hi! I'm Joseph's AI assistant. Ask me about his experience, skills, availability, or how to reach him.",
    contactEmail: 'monkeystylle@gmail.com',
  };

  // ---------- Font ----------
  // Fonts must be loaded by the main page. A font loaded only inside
  // the Shadow DOM won't work, so we add the Google Fonts link to <head>.
  if (!document.querySelector('link[data-ai-chat-font]')) {
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    font.setAttribute('data-ai-chat-font', '');
    document.head.appendChild(font);
  }

  // ---------- Icons ----------
  const ICONS = {
    chat: '<svg class="ico-open" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    closeLauncher:
      '<svg class="ico-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    closeSmall:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    close:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    clear:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    alert:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v5M12 16.5v.01"/><circle cx="12" cy="12" r="9"/></svg>',
    retry:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>',
    wifiOff:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.8M19 12.9a10 10 0 0 0-2.3-1.6M2 8.8a15 15 0 0 1 4.2-2.7M22 8.8a15 15 0 0 0-11.3-3.8M12 20h.01"/></svg>',
    spark:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg>',
    send: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  };

  // ---------- Styles (slate palette, matches josephbrummel.com) ----------
  const STYLES = `
    :host { all: initial; }
    * { box-sizing: border-box; }

    .w {
      --accent: #0f172a;
      --accent-ink: #0f172a;
      --tag-bg: #f1f5f9;
      --ring: rgba(15, 23, 42, 0.12);
      --ink: #0f172a;
      --muted: #64748b;
      --line: #e2e8f0;
      --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
      font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
    }
    button { font: inherit; }
    button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

    /* Launcher: white circle + thin border + shadow, visible on dark and white pages */
    .launch {
      position: fixed; right: 24px; bottom: 24px; z-index: 2147483000;
      width: 60px; height: 60px; border-radius: 50%;
      border: 1px solid rgba(15, 23, 42, 0.12);
      background: #fff; color: var(--accent);
      display: grid; place-items: center; cursor: pointer;
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.28), 0 2px 6px rgba(15, 23, 42, 0.14);
      animation: pop 260ms var(--ease-out) both;
      transition: transform 160ms ease-out, opacity 160ms ease-out;
    }
    .launch:active { transform: scale(0.95); }
    .launch svg { grid-area: 1 / 1; transition: opacity 160ms ease-out, transform 200ms var(--ease-out); }
    .launch .ico-close { opacity: 0; transform: rotate(-45deg) scale(0.8); }
    .w[data-open="true"] .launch .ico-open { opacity: 0; transform: rotate(45deg) scale(0.8); }
    .w[data-open="true"] .launch .ico-close { opacity: 1; transform: none; }

    /* Panel */
    .panel {
      position: fixed; right: 24px; bottom: 96px; z-index: 2147483001;
      width: 380px; height: min(620px, calc(100dvh - 128px));
      display: flex; flex-direction: column; overflow: hidden;
      background: #fff; border: 1px solid var(--line); border-radius: 20px;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.35);
      opacity: 0; visibility: hidden; pointer-events: none;
      transform: translateY(10px) scale(0.96); transform-origin: bottom right;
      transition: opacity 150ms ease-out, transform 150ms ease-out, visibility 0s linear 150ms;
    }
    .w[data-open="true"] .panel {
      opacity: 1; visibility: visible; pointer-events: auto; transform: none;
      transition: opacity 220ms var(--ease-out), transform 220ms var(--ease-out);
    }

    /* Header */
    .head { flex-shrink: 0; display: flex; align-items: center; gap: 10px; padding: 14px 10px 14px 18px; border-bottom: 1px solid var(--line); }
    .title { margin: 0; font-weight: 600; font-size: 15px; }
    .tag { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 999px; background: var(--tag-bg); color: var(--accent-ink); }
    .actions { margin-left: auto; display: flex; align-items: center; gap: 2px; }
    .icon-btn { width: 36px; height: 36px; border: 0; border-radius: 10px; background: transparent; color: var(--muted); display: grid; place-items: center; cursor: pointer; transition: background-color 150ms ease-out, color 150ms ease-out; }
    .icon-btn:active { transform: scale(0.94); }
    .clear { width: auto; padding: 0 10px; gap: 6px; display: inline-flex; align-items: center; font-size: 13px; font-weight: 500; }
    @media (hover: hover) and (pointer: fine) { .icon-btn:hover { background: #f1f5f9; color: var(--ink); } }
    .clear[data-confirm="true"] { background: #fdeef0; color: #b4232f; }

    /* Offline banner */
    .offline { flex-shrink: 0; display: none; align-items: center; gap: 8px; padding: 9px 18px; background: #fff7e6; border-bottom: 1px solid #f6e3b8; color: #7a5200; font-size: 13px; }
    .w[data-offline="true"] .offline { display: flex; }

    /* Messages */
    .msgs { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column; gap: 18px; padding: 20px 18px 12px; }
    .row { display: flex; animation: msg-in 200ms var(--ease-out) both; }
    .row.no-anim { animation: none; }
    .row.user { justify-content: flex-end; }
    .row.bot { gap: 10px; align-items: flex-start; }
    .av { width: 26px; height: 26px; border-radius: 8px; background: var(--accent); color: #fff; display: grid; place-items: center; flex-shrink: 0; margin-top: 1px; }
    .body { min-width: 0; flex: 1; }
    .name { font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 4px; }
    .bubble { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14.5px; line-height: 1.6; }
    .row.bot .bubble { color: #3f3f46; }
    .row.user .bubble { max-width: 80%; padding: 9px 14px; line-height: 1.5; border-radius: 18px; border-bottom-right-radius: 6px; background: #f1f5f9; color: var(--ink); }

    /* Error card */
    .row.error .av { background: #fdeef0; color: #b4232f; }
    .err { border: 1px solid #f3d3d7; background: #fff8f8; border-radius: 14px; padding: 12px 14px; }
    .err-title { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #8f1d27; }
    .err-text { margin: 0; font-size: 13.5px; line-height: 1.5; color: #4b3a3d; }
    .err-text a { color: inherit; font-weight: 500; text-underline-offset: 2px; }
    .retry { margin-top: 10px; height: 34px; padding: 0 12px; border: 1px solid #e7c3c8; border-radius: 9px; background: #fff; color: #8f1d27; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .retry:active { transform: scale(0.97); }
    @media (hover: hover) and (pointer: fine) { .retry:hover { background: #fdeef0; } }

    /* Typing dots */
    .typing { display: inline-flex; gap: 4px; align-items: center; height: 22px; color: #94a3b8; }
    .typing span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.4; animation: dot 1s ease-in-out infinite; }
    .typing span:nth-child(2) { animation-delay: 0.15s; }
    .typing span:nth-child(3) { animation-delay: 0.3s; }

    /* Input */
    .form { flex-shrink: 0; display: flex; align-items: center; gap: 8px; margin: 10px 14px 6px; padding: 6px 6px 6px 14px; border: 1px solid #cbd5e1; border-radius: 16px; background: #fff; transition: border-color 150ms ease-out, box-shadow 150ms ease-out; }
    .form:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--ring); }
    .input { flex: 1; min-width: 0; height: 40px; font-size: 16px; border: 0; outline: none; background: transparent; color: var(--ink); font-family: inherit; }
    .input::placeholder { color: #94a3b8; }
    .input:disabled { cursor: not-allowed; }
    .send { width: 38px; height: 38px; border: 0; border-radius: 11px; background: var(--accent); color: #fff; display: grid; place-items: center; flex-shrink: 0; cursor: pointer; transition: transform 120ms ease-out, opacity 150ms ease-out; }
    .send:active { transform: scale(0.94); }
    .send:disabled { opacity: 0.4; cursor: default; }
    .foot { flex-shrink: 0; margin: 0; padding: 0 14px 12px; font-size: 11px; color: #94a3b8; text-align: center; }

    /* Popover above the button */
    .teaser {
      position: fixed; right: 24px; bottom: 96px; z-index: 2147483000;
      display: flex; align-items: flex-start; gap: 4px;
      padding: 10px 6px 10px 14px; border-radius: 14px; border-bottom-right-radius: 4px;
      border: 1px solid var(--line); background: #fff; color: var(--ink);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.22);
      transform-origin: bottom right;
      animation: teaser-in 240ms var(--ease-out) 1200ms both;
    }
    .teaser-body { border: 0; background: transparent; padding: 0; text-align: left; cursor: pointer; color: inherit; font-size: 13.5px; line-height: 1.4; }
    .teaser-body strong { display: block; font-weight: 600; }
    .teaser-body span { color: var(--muted); }
    .teaser-x { width: 28px; height: 28px; margin-top: -4px; border: 0; border-radius: 8px; background: transparent; color: #94a3b8; display: grid; place-items: center; cursor: pointer; }
    @media (hover: hover) and (pointer: fine) { .teaser-x:hover { background: #f1f5f9; color: var(--ink); } }
    .teaser[hidden], .w[data-open="true"] .teaser { display: none; }
    @keyframes teaser-in { from { opacity: 0; transform: translateY(6px) scale(0.96); } }

    @keyframes msg-in { from { opacity: 0; transform: translateY(6px); } }
    @keyframes dot { 0%, 100% { opacity: 0.4; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }
    @keyframes pop { from { opacity: 0; transform: scale(0.8); } }

    /* Tablet */
    @media (min-width: 641px) and (max-width: 1024px) {
      .panel { width: 400px; height: min(640px, calc(100dvh - 140px)); }
    }

    /* Mobile: full screen */
    @media (max-width: 640px) {
      .launch { right: 16px; bottom: 16px; }
      .teaser { right: 16px; bottom: 86px; }
      .panel { right: 0; bottom: 0; width: 100%; height: 100dvh; border-radius: 0; border: 0; transform: translateY(24px); transform-origin: bottom center; }
      .form { margin-bottom: max(12px, env(safe-area-inset-bottom)); }
      .w[data-open="true"] .launch { opacity: 0; pointer-events: none; }
      .clear .label { display: none; }
      .clear { width: 36px; padding: 0; justify-content: center; }
      .clear[data-confirm="true"] { width: auto; padding: 0 10px; }
      .clear[data-confirm="true"] .label { display: inline; }
    }

    @media (prefers-reduced-motion: reduce) {
      .launch, .teaser, .row { animation: none; }
      .typing span { animation: none; opacity: 0.7; }
      .panel, .w[data-open="true"] .panel, .launch svg { transition: none; }
    }
  `;

  // ---------- Build the widget ----------
  const host = document.createElement('div');
  host.id = 'ai-chat-widget';
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
    <style>${STYLES}</style>
    <div class="w" data-open="false" data-offline="false">
      <div class="teaser" role="note" hidden>
        <button class="teaser-body" type="button"><strong>Have a question?</strong><span>Ask about Joseph's work</span></button>
        <button class="teaser-x" type="button" aria-label="Dismiss">${ICONS.closeSmall}</button>
      </div>
      <section class="panel" role="dialog" aria-label="Chat with ${CONFIG.title}">
        <header class="head">
          <p class="title"></p>
          <span class="tag"></span>
          <div class="actions">
            <button class="icon-btn clear" type="button" aria-label="Clear chat">${ICONS.clear}<span class="label">Clear</span></button>
            <button class="icon-btn close" type="button" aria-label="Close chat">${ICONS.close}</button>
          </div>
        </header>
        <div class="offline" role="status">${ICONS.wifiOff}<span>You're offline. Check your connection to keep chatting.</span></div>
        <div class="msgs" aria-live="polite"></div>
        <form class="form">
          <input class="input" type="text" maxlength="500" autocomplete="off" enterkeyhint="send" aria-label="Your message" />
          <button class="send" type="submit" aria-label="Send message">${ICONS.send}</button>
        </form>
        <p class="foot"></p>
      </section>
      <button class="launch" type="button" aria-label="Open chat" aria-expanded="false">${ICONS.chat}${ICONS.closeLauncher}</button>
    </div>
  `;

  // ---------- Grab the elements we need ----------
  const w = root.querySelector('.w');
  const launch = root.querySelector('.launch');
  const closeBtn = root.querySelector('.close');
  const input = root.querySelector('.input');
  const teaser = root.querySelector('.teaser');
  const msgs = root.querySelector('.msgs');
  const form = root.querySelector('.form');
  const send = root.querySelector('.send');
  const clearBtn = root.querySelector('.clear');
  const clearLabel = clearBtn.querySelector('.label');

  root.querySelector('.title').textContent = CONFIG.title;
  root.querySelector('.tag').textContent = CONFIG.tag;
  root.querySelector('.foot').textContent = CONFIG.footer;
  input.placeholder = CONFIG.placeholder;

  // ---------- Popover ----------
  // Shown once per browser tab session. After the visitor dismisses it or opens
  // the chat, it stays hidden until they open the site in a new tab.
  const TEASER_KEY = 'ai-chat-widget-teaser-dismissed';

  function teaserDismissed() {
    try {
      return sessionStorage.getItem(TEASER_KEY) === '1';
    } catch {
      return false;
    }
  }

  function dismissTeaser() {
    teaser.hidden = true;
    try {
      sessionStorage.setItem(TEASER_KEY, '1');
    } catch {}
  }

  if (!teaserDismissed()) teaser.hidden = false;

  // ---------- Saved history ----------
  // The conversation is saved in this browser (localStorage), so it's still
  // there when the visitor moves to another page or comes back later.
  const HISTORY_KEY = 'ai-chat-widget-history';
  const MAX_SAVED = 30;

  function loadHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (!Array.isArray(saved)) return [];
      const clean = saved.filter(
        m =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string',
      );
      // Drop a question that never got an answer (e.g. the page closed mid-reply).
      while (clean.length && clean[clean.length - 1].role === 'user')
        clean.pop();
      return clean;
    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history.slice(-MAX_SAVED)),
      );
    } catch {}
  }

  // ---------- Messages ----------
  // The conversation we send to the Worker.
  // Each item: { role: "user" | "assistant", content: "..." }
  const history = loadHistory();
  let busy = false;
  // Goes up by one every time the chat is cleared, so a reply that arrives
  // after a Clear is ignored instead of showing up in the fresh chat.
  let chatId = 0;

  const isOffline = () => w.dataset.offline === 'true';

  function scrollToBottom() {
    msgs.scrollTop = msgs.scrollHeight;
  }

  function updateSendButton() {
    send.disabled = busy || isOffline();
  }

  // Adds a bubble. Pass text = null to show the typing dots instead.
  // animate = false is used when restoring saved messages, so they don't all slide in.
  function addRow(role, text, animate = true) {
    const row = document.createElement('div');
    row.className = `row ${role}${animate ? '' : ' no-anim'}`;

    if (role === 'bot') {
      row.innerHTML = `<span class="av" aria-hidden="true">${ICONS.spark}</span><div class="body"><div class="name"></div><div class="bubble"></div></div>`;
      row.querySelector('.name').textContent = CONFIG.botName;
    } else {
      row.innerHTML = `<div class="bubble"></div>`;
    }

    const bubble = row.querySelector('.bubble');
    if (text === null) {
      bubble.innerHTML =
        '<span class="typing" aria-label="Assistant is typing"><span></span><span></span><span></span></span>';
    } else {
      // textContent (not innerHTML) so any HTML in a message shows as plain text and can't run.
      bubble.textContent = text;
    }

    msgs.appendChild(row);
    scrollToBottom();
    return row;
  }

  // Shows the red "couldn't connect" card with a Try again button.
  function addError() {
    const row = document.createElement('div');
    row.className = 'row bot error';
    row.innerHTML = `
      <span class="av" aria-hidden="true">${ICONS.alert}</span>
      <div class="body">
        <div class="name"></div>
        <div class="err" role="alert">
          <p class="err-title">Sorry, I couldn't connect right now.</p>
          <p class="err-text">Please try again in a moment, or email Joseph at <a class="email"></a>.</p>
          <button class="retry" type="button">${ICONS.retry}Try again</button>
        </div>
      </div>`;
    row.querySelector('.name').textContent = CONFIG.botName;

    const email = row.querySelector('.email');
    email.href = `mailto:${CONFIG.contactEmail}`;
    email.textContent = CONFIG.contactEmail;

    row.querySelector('.retry').addEventListener('click', () => {
      if (busy || isOffline()) return;
      row.remove();
      getAnswer();
    });

    msgs.appendChild(row);
    scrollToBottom();
  }

  // Calls the Worker. Returns the reply text, or null if anything went wrong.
  async function fetchReply() {
    // Give up after 20 seconds so the visitor isn't stuck watching the dots.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-10) }),
        signal: controller.signal,
      });

      if (!res.ok) return null;

      const data = await res.json();
      // The Worker sends fallback: true when both AI providers fail, so treat that as an error too.
      if (data.fallback || !data.reply) return null;
      return data.reply;
    } catch (err) {
      // Network down, CORS blocked, or timed out.
      console.error('AI chat widget:', err);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  // Shows the dots, asks the Worker, then shows the reply or the error card.
  async function getAnswer() {
    const myChat = chatId;
    busy = true;
    updateSendButton();

    const typing = addRow('bot', null);
    const reply = await fetchReply();

    // The visitor pressed Clear while we were waiting: throw this reply away.
    if (myChat !== chatId) return;

    typing.remove();

    if (reply) {
      addRow('bot', reply);
      history.push({ role: 'assistant', content: reply });
      saveHistory();
    } else {
      addError();
    }

    busy = false;
    updateSendButton();
  }

  function ask(text) {
    const question = text.trim();
    if (!question || busy || isOffline()) return;

    resetClear();
    input.value = '';
    addRow('user', question);
    history.push({ role: 'user', content: question });
    saveHistory();
    getAnswer();
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    ask(input.value);
  });

  // Greeting first, then any saved conversation.
  function renderAll() {
    msgs.innerHTML = '';
    addRow('bot', CONFIG.greeting, false);
    history.forEach(m =>
      addRow(m.role === 'user' ? 'user' : 'bot', m.content, false),
    );
  }

  renderAll();

  // ---------- Clear chat ----------
  // First tap asks "Clear chat?", second tap clears. Goes back after 3 seconds.
  let clearTimer = null;

  function resetClear() {
    clearTimeout(clearTimer);
    clearBtn.dataset.confirm = 'false';
    clearLabel.textContent = 'Clear';
    clearBtn.setAttribute('aria-label', 'Clear chat');
  }

  clearBtn.addEventListener('click', () => {
    if (clearBtn.dataset.confirm !== 'true') {
      clearBtn.dataset.confirm = 'true';
      clearLabel.textContent = 'Clear chat?';
      clearBtn.setAttribute('aria-label', 'Confirm clear chat');
      clearTimer = setTimeout(resetClear, 3000);
      return;
    }

    chatId += 1;
    busy = false;
    history.length = 0;
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
    renderAll();
    resetClear();
    updateSendButton();
    if (!isOffline()) input.focus();
  });

  // ---------- Offline ----------
  function setOffline(offline) {
    w.dataset.offline = String(offline);
    input.disabled = offline;
    input.placeholder = offline
      ? 'Waiting for connection...'
      : CONFIG.placeholder;
    updateSendButton();
  }

  window.addEventListener('offline', () => setOffline(true));
  window.addEventListener('online', () => setOffline(false));
  setOffline(!navigator.onLine);

  // ---------- Open / close ----------
  const isMobile = () => window.matchMedia('(max-width: 640px)').matches;

  function setOpen(open) {
    w.dataset.open = open ? 'true' : 'false';
    launch.setAttribute('aria-expanded', String(open));
    launch.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    if (open) {
      dismissTeaser();
      scrollToBottom();
    } else {
      resetClear();
    }

    // On phones the chat is full screen, so stop the page behind it from scrolling.
    document.documentElement.style.overflow =
      open && isMobile() ? 'hidden' : '';

    // Focus the input on desktop/tablet. On phones we skip it so the keyboard
    // doesn't pop up the moment the chat opens.
    if (open && !isMobile() && !isOffline())
      setTimeout(() => input.focus(), 60);
  }

  launch.addEventListener('click', () => setOpen(w.dataset.open !== 'true'));

  root
    .querySelector('.teaser-body')
    .addEventListener('click', () => setOpen(true));
  root.querySelector('.teaser-x').addEventListener('click', dismissTeaser);

  closeBtn.addEventListener('click', () => {
    setOpen(false);
    launch.focus();
  });

  // Esc closes the chat.
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && w.dataset.open === 'true') {
      setOpen(false);
      launch.focus();
    }
  });
})();
