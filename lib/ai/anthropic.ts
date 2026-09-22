// Anthropic client + config for copy generation. Guarded on ANTHROPIC_API_KEY
// so the app builds and runs before the key is set.
import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const isAiConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

// Default to Claude Opus 5; override with ANTHROPIC_MODEL (e.g. claude-sonnet-5
// to spend less per generation).
export const aiModel = process.env.ANTHROPIC_MODEL || "claude-opus-5";

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to enable email generation.",
    );
  }
  return new Anthropic();
}
