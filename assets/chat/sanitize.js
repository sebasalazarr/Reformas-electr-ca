// Utilidades de sanitización. Nunca se inyecta HTML de usuario o de la IA
// directamente en el DOM: siempre se usa textContent o este helper.

/**
 * Elimina espacios redundantes y recorta al límite de caracteres permitido.
 * @param {string} raw
 * @param {number} maxChars
 * @returns {string}
 */
export function cleanInput(raw, maxChars) {
  const trimmed = String(raw ?? '').replace(/\s+/g, ' ').trim();
  return trimmed.slice(0, maxChars);
}

/**
 * Construye un nodo de texto seguro a partir de contenido potencialmente
 * peligroso (nunca se interpreta como HTML).
 * @param {string} text
 * @returns {Text}
 */
export function safeTextNode(text) {
  return document.createTextNode(String(text ?? ''));
}
