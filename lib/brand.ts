// Single source of truth for brand values (see CLAUDE.md "Brand").
// Used by the dashboard UI and, later, by the email render functions.

export const brand = {
  colors: {
    navy: "#2b2d6e", // header, buttons, CTA panel
    deepNavy: "#1a1a2e", // page background, footer
    gold: "#b58c4a", // accents, eyebrows, CTA button
    panel: "#f7f7f9", // light panel
    hairline: "#ececf1", // hairlines
    faintNumeral: "#dcdde9", // oversized faint numerals
  },
  logoUrl:
    "https://assets.cdn.filesafe.space/fHjFPixdwzhw2AqUfXJm/media/6a2ad9efe5084c4b7183c2d5.png",
  // Not square: set width only, border-radius 6px, never force a height.
  headshotUrl:
    "https://assets.cdn.filesafe.space/fHjFPixdwzhw2AqUfXJm/media/6a2adda9ee57e63b961096e4.jpg",
  phoneDisplay: "806-543-3814",
  phoneTel: "tel:8065433814",
  email: "dusty@makeyourmarklbk.com",
  agent: "Dusty Joplin",
  team: "Make Your Mark Legacy Team",
  brokerage: "Coldwell Banker Trusted Advisors",
  city: "Lubbock, TX",
} as const;
