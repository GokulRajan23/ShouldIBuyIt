/** True when VITE_OPENROUTER_API_KEY is set and non-empty (loaded at dev/build time). */
export function isApiKeyConfigured() {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY
  return typeof key === 'string' && key.trim().length > 0
}

export const API_KEY_SETUP_MESSAGE =
  'Add your OpenRouter API key to a .env file in the project root, then restart the dev server.'
