/** Pull a JSON object out of model text (tolerates fences or stray prose). */
export function extractJson(text: string): unknown {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in the model output.");
  }
  return JSON.parse(t.slice(start, end + 1));
}
