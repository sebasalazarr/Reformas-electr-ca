// Cliente del asistente de IA. Este módulo NO habla directamente con
// OpenAI/Claude/Gemini: llama a nuestro propio backend (AI_ENDPOINT), que es
// quien guarda la API Key de forma segura y reenvía la consulta al proveedor
// que se elija. Así la key nunca queda expuesta en el navegador.
//
// Para cambiar de proveedor de IA no se toca este archivo: se edita
// únicamente /api/chat.js en el servidor.

import { AI_ENDPOINT, SYSTEM_PROMPT, LIMITS } from './config.js';

export class AIRequestError extends Error {}

/**
 * Envía el historial de la conversación al backend y devuelve la respuesta
 * del asistente.
 * @param {{role: 'user'|'assistant', content: string}[]} messages
 * @returns {Promise<string>}
 */
export async function getAssistantReply(messages) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LIMITS.requestTimeoutMs);

  let response;
  try {
    response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt: SYSTEM_PROMPT, messages }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new AIRequestError('timeout');
    }
    throw new AIRequestError('network');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new AIRequestError(`http_${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new AIRequestError('invalid_response');
  }

  if (!data || typeof data.reply !== 'string') {
    throw new AIRequestError('invalid_response');
  }

  return data.reply;
}
