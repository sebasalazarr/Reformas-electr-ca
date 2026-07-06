// Lógica del widget de chat: construcción del DOM, estado de la conversación
// y manejo de eventos. No sabe nada de cómo se llama a la IA (eso vive en
// ai-client.js) ni de qué debe responder el asistente (eso vive en config.js).

import { QUICK_REPLIES, GREETING, LIMITS, CONTACT } from './config.js';
import { getAssistantReply, AIRequestError } from './ai-client.js';
import { cleanInput, safeTextNode } from './sanitize.js';

const STORAGE_KEY = 'voltajelm_chat_history_v1';

const FALLBACK_MESSAGE =
  'En este momento no puedo conectarme con el asistente. Escríbenos por WhatsApp o llámanos y un electricista te ayudará directamente.';

/** Recupera el historial guardado de esta pestaña/sesión, si existe. */
function loadHistory() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Guarda el historial de la conversación (best-effort, sin romper si falla). */
function saveHistory(messages) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Modo privado / storage lleno: la conversación simplemente no persiste.
  }
}

function createElement(tag, className, attrs = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

export function initChatWidget() {
  const root = createElement('div', 'vlm-chat-root');
  root.innerHTML = ''; // nunca se usa innerHTML con datos dinámicos, solo estático de layout

  // --- Botón flotante ---
  const launcher = createElement('button', 'vlm-chat-launcher', {
    type: 'button',
    'aria-haspopup': 'dialog',
    'aria-expanded': 'false',
    'aria-controls': 'vlm-chat-window',
    'aria-label': 'Abrir asistente virtual de Voltaje LM',
  });
  launcher.innerHTML = `
    <span class="vlm-chat-launcher-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="currentColor"/>
        <circle cx="8.5" cy="10.5" r="1.25" fill="#fff"/>
        <circle cx="12" cy="10.5" r="1.25" fill="#fff"/>
        <circle cx="15.5" cy="10.5" r="1.25" fill="#fff"/>
      </svg>
    </span>
    <span class="vlm-chat-launcher-close-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    </span>
  `;

  // --- Ventana del chat ---
  const win = createElement('section', 'vlm-chat-window', {
    id: 'vlm-chat-window',
    role: 'dialog',
    'aria-modal': 'false',
    'aria-label': 'Asistente virtual de Voltaje LM',
  });

  win.innerHTML = `
    <header class="vlm-chat-header">
      <div class="vlm-chat-header-avatar" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="currentColor"/>
        </svg>
      </div>
      <div class="vlm-chat-header-text">
        <p class="vlm-chat-header-title">Asistente Voltaje LM</p>
        <p class="vlm-chat-header-status"><span class="vlm-chat-online-dot" aria-hidden="true"></span>En línea</p>
      </div>
      <button type="button" class="vlm-chat-close" aria-label="Cerrar asistente">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>
    </header>

    <div class="vlm-chat-messages" role="log" aria-live="polite" tabindex="0"></div>

    <div class="vlm-chat-quick-actions">
      <a class="vlm-chat-action" href="tel:${CONTACT.phone}">📞 Llamar</a>
      <a class="vlm-chat-action" href="${CONTACT.whatsapp}" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
      <a class="vlm-chat-action" href="${CONTACT.whatsappWithMessage('Hola, quiero solicitar una cotización')}" target="_blank" rel="noopener noreferrer">📝 Cotización</a>
    </div>

    <form class="vlm-chat-input-row" autocomplete="off">
      <label class="vlm-chat-sr-only" for="vlm-chat-input">Escribe tu mensaje</label>
      <textarea id="vlm-chat-input" class="vlm-chat-input" rows="1" maxlength="${LIMITS.maxChars}" placeholder="Escribe tu consulta..."></textarea>
      <button type="submit" class="vlm-chat-send" aria-label="Enviar mensaje">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 11.5 21 3l-8.5 18-2.2-7.3L3 11.5Z" fill="currentColor"/></svg>
      </button>
    </form>
    <p class="vlm-chat-char-count"><span class="vlm-chat-char-current">0</span>/${LIMITS.maxChars}</p>
  `;

  root.appendChild(win);
  root.appendChild(launcher);
  document.body.appendChild(root);

  // --- Referencias ---
  const messagesEl = win.querySelector('.vlm-chat-messages');
  const closeBtn = win.querySelector('.vlm-chat-close');
  const form = win.querySelector('.vlm-chat-input-row');
  const input = win.querySelector('.vlm-chat-input');
  const sendBtn = win.querySelector('.vlm-chat-send');
  const charCount = win.querySelector('.vlm-chat-char-current');

  // --- Estado ---
  let messages = loadHistory(); // [{role, content}]
  let isLoading = false;

  function renderMessage(role, text) {
    const row = createElement('div', `vlm-chat-msg vlm-chat-msg--${role}`);
    const bubble = createElement('div', 'vlm-chat-bubble');
    bubble.appendChild(safeTextNode(text));
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function renderQuickReplies() {
    const wrap = createElement('div', 'vlm-chat-quick-replies');
    QUICK_REPLIES.forEach((label) => {
      const chip = createElement('button', 'vlm-chat-chip', { type: 'button' });
      chip.appendChild(safeTextNode(label));
      chip.addEventListener('click', () => {
        wrap.remove();
        sendMessage(label);
      });
      wrap.appendChild(chip);
    });
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setLoading(loading) {
    isLoading = loading;
    input.disabled = loading;
    sendBtn.disabled = loading;
    if (loading) {
      const typing = createElement('div', 'vlm-chat-msg vlm-chat-msg--assistant vlm-chat-typing-row');
      typing.innerHTML = '<div class="vlm-chat-bubble vlm-chat-typing"><span></span><span></span><span></span></div>';
      messagesEl.appendChild(typing);
      scrollToBottom();
    } else {
      win.querySelector('.vlm-chat-typing-row')?.remove();
    }
  }

  async function sendMessage(rawText) {
    const text = cleanInput(rawText, LIMITS.maxChars);
    if (!text || isLoading) return;

    messages.push({ role: 'user', content: text });
    renderMessage('user', text);
    saveHistory(messages);
    input.value = '';
    charCount.textContent = '0';
    autoGrow();

    setLoading(true);
    try {
      const reply = await getAssistantReply(messages);
      messages.push({ role: 'assistant', content: reply });
      renderMessage('assistant', reply);
      saveHistory(messages);
    } catch (err) {
      const isKnownError = err instanceof AIRequestError;
      renderMessage('assistant', FALLBACK_MESSAGE);
      if (!isKnownError) {
        // Error inesperado: se registra para diagnóstico, sin exponer detalles al usuario.
        console.error('[vlm-chat] error inesperado:', err);
      }
    } finally {
      setLoading(false);
    }
  }

  function autoGrow() {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  }

  // --- Eventos ---
  launcher.addEventListener('click', () => toggleWindow());
  closeBtn.addEventListener('click', () => toggleWindow(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('vlm-chat-open')) {
      toggleWindow(false);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });

  input.addEventListener('input', () => {
    charCount.textContent = String(input.value.length);
    autoGrow();
  });

  function toggleWindow(force) {
    const shouldOpen = force ?? !root.classList.contains('vlm-chat-open');
    root.classList.toggle('vlm-chat-open', shouldOpen);
    launcher.setAttribute('aria-expanded', String(shouldOpen));
    if (shouldOpen) {
      input.focus();
    } else {
      launcher.focus();
    }
  }

  // --- Estado inicial ---
  if (messages.length === 0) {
    renderMessage('assistant', GREETING);
    renderQuickReplies();
  } else {
    messages.forEach((m) => renderMessage(m.role, m.content));
  }

  // Aparición diferida y suave del botón flotante.
  window.setTimeout(() => root.classList.add('vlm-chat-ready'), 600);
}
