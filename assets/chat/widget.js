// Punto de entrada del asistente virtual. Se incluye con
// <script type="module" src="assets/chat/widget.js"></script>
// en cada página donde deba aparecer el chat.

import { initChatWidget } from './ui.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatWidget);
} else {
  initChatWidget();
}
