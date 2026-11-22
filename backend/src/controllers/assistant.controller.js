import { askAssistant, assistantStatus } from '../services/assistant.service.js';
import { ok } from '../utils/response.js';

/** Tells the website whether a self-hosted model is configured. */
export function status(_req, res) {
  const { enabled, model } = assistantStatus();
  return ok(res, { enabled, model });
}

/** Answers a visitor question with the configured model. Nothing is stored. */
export async function chat(req, res) {
  const result = await askAssistant(req.body);
  return ok(res, result);
}
