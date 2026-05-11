/**
 * Highlight matched/missing skills inside a job description.
 * Returns an HTML string safe to feed into dangerouslySetInnerHTML when the
 * input is HTML; for plain text, line breaks are preserved.
 */
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const wrap = (skill: string, variant: "matched" | "missing") => {
  const cls =
    variant === "matched"
      ? "background-color:hsl(142 71% 90%);color:hsl(142 65% 25%);font-weight:600;padding:0 4px;border-radius:4px;border:1px solid hsl(142 60% 75%);"
      : "background-color:hsl(38 92% 92%);color:hsl(28 80% 30%);font-weight:600;padding:0 4px;border-radius:4px;border:1px solid hsl(38 80% 75%);";
  return `<mark data-skill="${variant}" style="${cls}">${skill}</mark>`;
};

export function highlightSkills(
  text: string,
  matched: string[] = [],
  missing: string[] = [],
): string {
  if (!text) return "";
  let html = text;

  // Sort longest first so multi-word skills win over substrings.
  const all = [
    ...matched.map((s) => ({ skill: s, variant: "matched" as const })),
    ...missing.map((s) => ({ skill: s, variant: "missing" as const })),
  ]
    .filter((x) => x.skill && x.skill.trim().length > 1)
    .sort((a, b) => b.skill.length - a.skill.length);

  for (const { skill, variant } of all) {
    const re = new RegExp(`\\b(${escapeRegex(skill)})\\b`, "gi");
    html = html.replace(re, (m) => wrap(m, variant));
  }
  return html;
}
