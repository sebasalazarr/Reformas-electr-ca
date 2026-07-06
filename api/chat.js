// Función serverless (formato Vercel: /api/chat -> https://tu-dominio/api/chat).
// Es el ÚNICO lugar del proyecto que debe conocer la API Key del proveedor de IA.
// La key se lee desde una variable de entorno del servidor — nunca se escribe
// aquí como texto plano ni se envía al navegador.
//
// Cómo configurarla:
//   - En local:  crea un archivo ".env" (ver ".env.example") y corre `vercel dev`.
//   - En Vercel: Project Settings -> Environment Variables -> agrega
//                OPENAI_API_KEY (o ANTHROPIC_API_KEY / GEMINI_API_KEY) y redeploy.
//
// Por defecto usa OpenAI. Para cambiar de proveedor, comenta callOpenAI y
// descomenta callClaude o callGemini en el bloque "Proveedor activo" más abajo.
// No se usa ningún SDK de terceros: solo fetch nativo (cero dependencias).

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 500;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const { systemPrompt, messages } = req.body ?? {};

  if (typeof systemPrompt !== 'string' || !Array.isArray(messages)) {
    res.status(400).json({ error: 'invalid_payload' });
    return;
  }

  // Validación defensiva del historial recibido del cliente.
  const safeMessages = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));

  if (safeMessages.length === 0) {
    res.status(400).json({ error: 'empty_conversation' });
    return;
  }

  try {
    // --- Proveedor activo ---
    const reply = await callOpenAI(systemPrompt, safeMessages);
    // const reply = await callClaude(systemPrompt, safeMessages);
    // const reply = await callGemini(systemPrompt, safeMessages);

    res.status(200).json({ reply });
  } catch (err) {
    console.error('[api/chat] error al llamar al proveedor de IA:', err);
    res.status(502).json({ error: 'ai_provider_error' });
  }
}

/** OpenAI (https://platform.openai.com) — modelo económico y rápido por defecto. */
async function callOpenAI(systemPrompt, messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Falta OPENAI_API_KEY en las variables de entorno');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.4,
      max_tokens: 300,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI respondió ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

/** Anthropic Claude (https://console.anthropic.com) — alternativa a OpenAI. */
async function callClaude(systemPrompt, messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Falta ANTHROPIC_API_KEY en las variables de entorno');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-latest',
      system: systemPrompt,
      messages,
      max_tokens: 300,
    }),
  });

  if (!response.ok) throw new Error(`Claude respondió ${response.status}`);
  const data = await response.json();
  return data.content?.[0]?.text?.trim() ?? '';
}

/** Google Gemini (https://aistudio.google.com) — alternativa a OpenAI. */
async function callGemini(systemPrompt, messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Falta GEMINI_API_KEY en las variables de entorno');

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini respondió ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}
