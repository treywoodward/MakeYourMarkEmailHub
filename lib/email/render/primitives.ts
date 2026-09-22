// Shared HTML building blocks for every email type, ported verbatim from the
// structures in reference-templates/. These functions return raw HTML strings.
// The LLM never calls these; TypeScript does. Keep every rule in CLAUDE.md:
// nested tables only, inline CSS, bgcolor + inline background-color on colored
// cells, Georgia/Arial only, 600px container, literal GHL merge tags.

import { brand } from "@/lib/brand";

const C = brand.colors;
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Arial, Helvetica, sans-serif";
const LOGO = brand.logoUrl;
const HEADSHOT = brand.headshotUrl;

// ---- escaping -------------------------------------------------------------

/** Escape text for HTML body content. Leaves GHL merge tags ({{...}}) intact
 *  because they only ever come from our own literal template strings. */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Escape for a double-quoted attribute value (URLs, alt text). */
export function escAttr(s: string): string {
  return esc(s).replace(/"/g, "&quot;");
}

/** Turn a newline in copy into a <br> (used in headlines that wrap on purpose). */
export function nl2br(s: string): string {
  return esc(s).replace(/\n/g, "<br>");
}

// ---- document shell -------------------------------------------------------

const MOBILE_CSS = `@media only screen and (max-width:480px){
  .stack{display:block !important; width:100% !important; max-width:100% !important; padding:0 0 10px 0 !important; border-right:none !important;}
  .gap{display:none !important;}
  .btn a{white-space:nowrap !important; padding:14px 20px !important; font-size:14px !important;}
  .pad{padding-left:24px !important; padding-right:24px !important;}
  .statcell{display:block !important; width:100% !important; border-right:none !important; border-bottom:1px solid ${C.hairline} !important; padding:12px 0 !important;}
  .statcelldark{display:block !important; width:100% !important; border-right:none !important; border-bottom:1px solid #3d3f7d !important; padding:12px 0 !important;}
  .tbl td{font-size:11px !important; padding:8px 3px !important;}
}`;

/** Wrap the inner rows (the contents of the 600px white container's <table>)
 *  in the full HTML document, outer navy wrapper, and container table. */
export function emailDocument(title: string, innerRows: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<style type="text/css">
${MOBILE_CSS}
</style>
</head>
<body style="margin:0; padding:0; background-color:${C.deepNavy};" bgcolor="${C.deepNavy}">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.deepNavy}" style="background-color:${C.deepNavy};">
<tr>
<td align="center" style="padding:30px 15px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color:#ffffff; max-width:600px; width:100%;">
${innerRows}
  </table>

</td>
</tr>
</table>

</body>
</html>
`;
}

// ---- header + gold bar ----------------------------------------------------

/** Centered logo header (listings, education, holiday). */
export function headerLogo(): string {
  return `  <tr>
  <td align="center" bgcolor="${C.navy}" style="background-color:${C.navy}; padding:34px 20px;">
    <img src="${LOGO}" alt="${escAttr(brand.team)}" width="180" style="display:block; width:180px; max-width:180px; height:auto; border:0;">
  </td>
  </tr>`;
}

/** Two-up "brief" header used by Market Pulse: team name left, period right. */
export function headerBrief(periodLabel: string): string {
  return `  <tr>
  <td bgcolor="${C.navy}" class="pad" style="background-color:${C.navy}; padding:26px 48px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
    <td align="left" valign="middle">
      <p style="margin:0; font-family:${SANS}; font-size:10px; font-weight:bold; text-transform:uppercase; color:#9a9ab0;">${esc(brand.team)}</p>
    </td>
    <td align="right" valign="middle">
      <p style="margin:0; font-family:${SANS}; font-size:10px; font-weight:bold; text-transform:uppercase; color:${C.gold};">${esc(periodLabel)}</p>
    </td>
    </tr>
    </table>
  </td>
  </tr>`;
}

export function goldBar(): string {
  return `  <tr>
  <td height="3" bgcolor="${C.gold}" style="background-color:${C.gold}; font-size:1px; line-height:1px;">&nbsp;</td>
  </tr>`;
}

/** Short 48px centered gold rule used under headlines. */
export function goldRuleRow(topPad = 0, bottomPad = 28): string {
  return `  <tr>
  <td align="center" bgcolor="#ffffff" style="background-color:#ffffff; padding:${topPad}px 48px ${bottomPad}px 48px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr><td width="48" height="2" bgcolor="${C.gold}" style="background-color:${C.gold}; width:48px; font-size:1px; line-height:1px;">&nbsp;</td></tr>
    </table>
  </td>
  </tr>`;
}

// ---- generic row + text helpers ------------------------------------------

/** A white content row with standard side padding. `pad` is the CSS padding. */
export function whiteRow(pad: string, inner: string): string {
  return `  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:${pad};">
${inner}
  </td>
  </tr>`;
}

/** The greeting + one or more intro paragraphs (Hi {{contact.first_name}},). */
export function greetingIntro(paragraphs: string[], pad = "0 48px 34px 48px"): string {
  const first = `    <p style="margin:0; font-family:${SANS}; font-size:15px; line-height:25px; color:#444444;">Hi {{contact.first_name}},</p>`;
  const rest = paragraphs
    .map(
      (p) =>
        `    <p style="margin:16px 0 0 0; font-family:${SANS}; font-size:15px; line-height:25px; color:#444444;">${esc(p)}</p>`,
    )
    .join("\n");
  return whiteRow(pad, `${first}\n${rest}`);
}

/** Gold-bordered callout box on a light panel with an italic serif quote. */
export function calloutBox(quote: string, pad = "0 48px 30px 48px"): string {
  return `  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:${pad};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="background-color:${C.panel};">
    <tr>
    <td width="3" bgcolor="${C.gold}" style="background-color:${C.gold}; font-size:1px; line-height:1px;">&nbsp;</td>
    <td style="padding:22px 26px;">
      <p style="margin:0; font-family:${SERIF}; font-size:19px; line-height:28px; color:${C.navy}; font-style:italic;">${esc(quote)}</p>
    </td>
    </tr>
    </table>
  </td>
  </tr>`;
}

/** A 1px hairline divider row. */
export function hairlineRow(pad = "26px 48px"): string {
  return `  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:${pad};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td height="1" bgcolor="${C.hairline}" style="background-color:${C.hairline}; font-size:1px; line-height:1px;">&nbsp;</td></tr>
    </table>
  </td>
  </tr>`;
}

// ---- stats ---------------------------------------------------------------

export interface Stat {
  value: string;
  label: string;
}

/** A row of 3 or 4 property stat cells (beds/baths/sqft, etc.). */
export function statCells(stats: Stat[], valueSize = 20, pad = "16px 48px 20px 48px"): string {
  const width = stats.length === 4 ? "25%" : "33%";
  const cells = stats
    .map((s, i) => {
      const last = i === stats.length - 1;
      const border = last ? "" : `border-right:1px solid ${C.hairline}; `;
      return `    <td align="center" width="${width}" valign="top" class="statcell" style="${border}padding:6px 0;">
      <p style="margin:0; font-family:Georgia, serif; font-size:${valueSize}px; line-height:${valueSize + 6}px; color:${C.navy};">${esc(s.value)}</p>
      <p style="margin:3px 0 0 0; font-family:${SANS}; font-size:10px; text-transform:uppercase; color:#999999;">${esc(s.label)}</p>
    </td>`;
    })
    .join("\n");
  return `  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:${pad};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
${cells}
    </tr>
    </table>
  </td>
  </tr>`;
}

// ---- gallery -------------------------------------------------------------

/** Compute gallery row sizes for n photos (hero excluded), per SPEC section 5:
 *  first row of 2, then rows of 3; a leftover of 4 -> 2+2, of 2 -> 2, of 1 ->
 *  turn the last 3 into 2 and add a 2. Example: 9 -> [2,3,2,2]; 8 -> [2,3,3]. */
export function galleryRows(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [1];
  if (n === 2) return [2];
  if (n === 3) return [3];
  const rows = [2];
  const r = n - 2;
  const full3 = Math.floor(r / 3);
  const rem = r % 3;
  if (rem === 0) {
    for (let i = 0; i < full3; i++) rows.push(3);
  } else if (rem === 2) {
    for (let i = 0; i < full3; i++) rows.push(3);
    rows.push(2);
  } else {
    // rem === 1: combine the trailing 3 with the leftover 1 into 2 + 2.
    for (let i = 0; i < full3 - 1; i++) rows.push(3);
    rows.push(2, 2);
  }
  return rows;
}

/** Render the gallery (all photos after the hero) using the grid algorithm.
 *  `photos` are CDN image URLs; `alt` labels every image. */
export function gallery(photos: string[], alt: string): string {
  if (photos.length === 0) return "";
  const rows = galleryRows(photos.length);
  let idx = 0;
  const out: string[] = [];
  rows.forEach((count, rowIdx) => {
    const isLastRow = rowIdx === rows.length - 1;
    const bottom = isLastRow ? "20px" : "10px";
    const imgWidth = count === 2 ? "247" : count === 3 ? "160" : "600";
    const cellWidth = count === 2 ? "49%" : count === 3 ? "32%" : "100%";
    const cells: string[] = [];
    for (let i = 0; i < count; i++) {
      const url = photos[idx++];
      cells.push(`    <td width="${cellWidth}" valign="top" class="stack">
      <img src="${escAttr(url)}" alt="${escAttr(alt)}" width="${imgWidth}" style="display:block; width:100%; height:auto; border:0;">
    </td>`);
    }
    const gapped = cells.join(
      `\n    <td width="2%" class="gap" style="font-size:1px;">&nbsp;</td>\n`,
    );
    out.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:0 48px ${bottom} 48px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
${gapped}
    </tr>
    </table>
  </td>
  </tr>`);
  });
  return out.join("\n");
}

// ---- CTA panel -----------------------------------------------------------

export interface Cta {
  eyebrow: string;
  headline: string;
  body: string;
  /** Button label; defaults to the call/text button. */
  buttonLabel?: string;
  /** Button href; defaults to the tel: link. */
  buttonHref?: string;
}

/** Navy CTA panel with gold button. */
export function ctaPanel(cta: Cta): string {
  const label = cta.buttonLabel ?? `Call or Text ${brand.phoneDisplay}`;
  const href = cta.buttonHref ?? brand.phoneTel;
  return `  <tr>
  <td align="center" bgcolor="${C.navy}" class="pad" style="background-color:${C.navy}; padding:40px 48px;">
    <p style="margin:0; font-family:${SERIF}; font-style:italic; font-size:14px; color:${C.gold};">${esc(cta.eyebrow)}</p>
    <h2 style="margin:10px 0 0 0; font-family:${SERIF}; font-size:22px; line-height:30px; color:#ffffff; font-weight:normal;">${esc(cta.headline)}</h2>
    <p style="margin:14px 0 0 0; font-family:${SANS}; font-size:14px; line-height:23px; color:#c9cadd;">${esc(cta.body)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-top:24px;">
    <tr>
    <td align="center" bgcolor="${C.gold}" class="btn" style="background-color:${C.gold};">
      <a href="${escAttr(href)}" style="display:inline-block; padding:14px 38px; font-family:${SANS}; font-size:15px; font-weight:bold; color:${C.deepNavy}; text-decoration:none; white-space:nowrap;">${esc(label)}</a>
    </td>
    </tr>
    </table>
  </td>
  </tr>`;
}

// ---- signature + footer --------------------------------------------------

export function signature(): string {
  return `  <tr>
  <td bgcolor="${C.panel}" class="pad" style="background-color:${C.panel}; padding:30px 48px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
    <td width="70" valign="top" style="padding-right:16px;">
      <img src="${HEADSHOT}" alt="${escAttr(brand.agent)}" width="70" style="display:block; width:70px; height:auto; border:0; border-radius:6px;">
    </td>
    <td valign="middle">
      <p style="margin:0; font-family:${SERIF}; font-size:17px; color:${C.navy};">${esc(brand.agent)}</p>
      <p style="margin:3px 0 0 0; font-family:${SANS}; font-size:13px; line-height:19px; color:#555555;">${esc(brand.team)} | Coldwell Banker</p>
      <p style="margin:3px 0 0 0; font-family:${SANS}; font-size:13px; line-height:19px; color:#555555;">${esc(brand.city)} &bull; ${esc(brand.phoneDisplay)}</p>
    </td>
    </tr>
    </table>
  </td>
  </tr>`;
}

/** Standard footer with address and unsubscribe (required on every email). */
export function footer(): string {
  return `  <tr>
  <td align="center" bgcolor="${C.deepNavy}" class="pad" style="background-color:${C.deepNavy}; padding:26px 48px;">
    <p style="margin:0; font-family:${SANS}; font-size:11px; line-height:18px; color:#9a9ab0;">${esc(brand.team)} &nbsp;&bull;&nbsp; ${esc(brand.brokerage)} &nbsp;&bull;&nbsp; ${esc(brand.city)}</p>
    <p style="margin:6px 0 0 0; font-family:${SANS}; font-size:11px; line-height:18px; color:#9a9ab0;">${esc(brand.phoneDisplay)} &nbsp;&bull;&nbsp; ${esc(brand.email)}</p>
    <p style="margin:10px 0 0 0; font-family:${SANS}; font-size:11px; line-height:18px; color:#9a9ab0;">{{location.name}} &nbsp;&bull;&nbsp; {{location.full_address}}</p>
    <p style="margin:8px 0 0 0; font-family:${SANS}; font-size:11px; line-height:18px;"><a href="{{unsubscribe_link}}" style="color:#9a9ab0; text-decoration:underline;">Unsubscribe</a></p>
  </td>
  </tr>`;
}

export { SERIF, SANS, C, LOGO, HEADSHOT };
