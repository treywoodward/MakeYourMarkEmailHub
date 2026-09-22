// Render a Market Pulse email from validated copy.
import type { MarketPulseCopy } from "@/lib/email/schemas";
import {
  emailDocument,
  headerBrief,
  goldBar,
  ctaPanel,
  signature,
  footer,
  esc,
  SERIF,
  SANS,
  C,
  HEADSHOT,
} from "./primitives";
import { brand } from "@/lib/brand";

export function renderMarketPulse(copy: MarketPulseCopy): string {
  const rows: string[] = [headerBrief(copy.periodLabel), goldBar()];

  // Fixed masthead.
  rows.push(`  <tr>
  <td align="center" bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:46px 48px 0 48px;">
    <p style="margin:0; font-family:${SANS}; font-size:12px; font-weight:bold; text-transform:uppercase; color:#9a9ab0;">The Lubbock</p>
    <h1 style="margin:6px 0 0 0; font-family:${SERIF}; font-size:52px; line-height:56px; color:${C.navy}; font-weight:normal; font-style:italic;">Market Pulse</h1>
  </td>
  </tr>
  <tr>
  <td align="center" bgcolor="#ffffff" style="background-color:#ffffff; padding:18px 48px 0 48px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr><td width="48" height="2" bgcolor="${C.gold}" style="background-color:${C.gold}; width:48px; font-size:1px; line-height:1px;">&nbsp;</td></tr>
    </table>
  </td>
  </tr>
  <tr>
  <td align="center" bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:16px 48px 40px 48px;">
    <p style="margin:0; font-family:${SANS}; font-size:11px; text-transform:uppercase; color:#999999;">Your Monthly Real Estate Brief &nbsp;&bull;&nbsp; ${esc(brand.city)}</p>
  </td>
  </tr>`);

  // Opening note on a panel, with a mini signature.
  rows.push(`  <tr>
  <td bgcolor="${C.panel}" class="pad" style="background-color:${C.panel}; padding:36px 48px;">
    <p style="margin:0; font-family:${SERIF}; font-size:44px; line-height:32px; color:${C.gold};">&ldquo;</p>
    <p style="margin:8px 0 0 0; font-family:${SERIF}; font-size:16px; line-height:28px; color:#333333; font-style:italic;">${esc(copy.openingNote)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
    <tr>
    <td width="56" valign="top" style="padding-right:14px;">
      <img src="${HEADSHOT}" alt="${esc(brand.agent)}" width="56" style="display:block; width:56px; height:auto; border:0; border-radius:6px;">
    </td>
    <td valign="middle">
      <p style="margin:0; font-family:${SERIF}; font-size:16px; color:${C.navy};">${esc(brand.agent)}</p>
      <p style="margin:2px 0 0 0; font-family:${SANS}; font-size:12px; line-height:18px; color:#777777;">${esc(brand.team)} &nbsp;&bull;&nbsp; ${esc(brand.city)}</p>
    </td>
    </tr>
    </table>
  </td>
  </tr>`);

  // Stat blocks (value, label, sublabel).
  const statCells = copy.stats
    .map((s, i) => {
      const last = i === copy.stats.length - 1;
      const border = last ? "" : `border-right:1px solid ${C.hairline}; `;
      return `    <td align="center" width="33%" valign="top" class="statcell" style="${border}padding:0 6px;">
      <p style="margin:0; font-family:${SERIF}; font-size:32px; line-height:36px; color:${C.navy};">${esc(s.value)}</p>
      <p style="margin:6px 0 0 0; font-family:${SANS}; font-size:10px; font-weight:bold; text-transform:uppercase; color:#999999;">${esc(s.label)}</p>
      <p style="margin:4px 0 0 0; font-family:${SANS}; font-size:11px; line-height:16px; color:#aaaaaa;">${esc(s.sublabel)}</p>
    </td>`;
    })
    .join("\n");
  rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:36px 48px 12px 48px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
${statCells}
    </tr>
    </table>
  </td>
  </tr>`);

  // Hairline.
  rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:24px 48px 0 48px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td height="1" bgcolor="${C.hairline}" style="background-color:${C.hairline}; font-size:1px; line-height:1px;">&nbsp;</td></tr>
    </table>
  </td>
  </tr>`);

  // What's Moving.
  const wmPs = copy.whatsMoving.paragraphs
    .map(
      (p, i) =>
        `    <p style="margin:${i === 0 ? "14px 0 0 0" : "14px 0 0 0"}; font-family:${SANS}; font-size:15px; line-height:25px; color:#555555;">${esc(p)}</p>`,
    )
    .join("\n");
  rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:34px 48px 0 48px;">
    <p style="margin:0; font-family:${SANS}; font-size:10px; font-weight:bold; text-transform:uppercase; color:${C.gold};">What's Moving</p>
    <h2 style="margin:10px 0 0 0; font-family:${SERIF}; font-size:24px; line-height:32px; color:${C.navy}; font-weight:normal;">${esc(copy.whatsMoving.headline)}</h2>
${wmPs}
  </td>
  </tr>`);

  // Tier table (optional).
  if (copy.tierTable) {
    const t = copy.tierTable;
    const headCells = ["Median Price", "Sq Ft", "DOM", "New", "Absorbed"]
      .map((h, i) => {
        const align = i === 0 ? "left" : "right";
        return `      <td align="${align}" style="padding:10px 6px; font-family:${SANS}; font-size:10px; font-weight:bold; text-transform:uppercase; color:#ffffff;">${esc(h)}</td>`;
      })
      .join("\n");
    const bodyRows = t.rows
      .map((r, i) => {
        const bg = i % 2 === 0 ? "#ffffff" : "#fafafb";
        // Gold-bold "absorbed" when it beats new listings (the real story).
        const goldAbsorbed = Number(r.absorbed) > Number(r.newCount);
        const absorbedColor = goldAbsorbed ? `${C.gold}; font-weight:bold` : "#555555";
        const cell = (
          val: string,
          align: string,
          color = "#555555",
          bold = false,
        ) =>
          `      <td align="${align}" style="padding:12px 6px; border-bottom:1px solid ${C.hairline}; font-family:${SANS}; font-size:13px; color:${color};${bold ? " font-weight:bold;" : ""}">${esc(val)}</td>`;
        return `    <tr bgcolor="${bg}" style="background-color:${bg};">
${cell(r.medianPrice, "left", C.navy, true)}
${cell(r.sqft, "right")}
${cell(r.dom, "right")}
${cell(r.newCount, "right")}
${cell(r.absorbed, "right", absorbedColor)}
    </tr>`;
      })
      .join("\n");
    const intro = t.intro
      ? `    <p style="margin:0 0 16px 0; font-family:${SANS}; font-size:14px; line-height:23px; color:#555555;">${esc(t.intro)}</p>`
      : "";
    const foot = t.footnote
      ? `    <p style="margin:12px 0 0 0; font-family:${SANS}; font-size:11px; line-height:17px; color:#aaaaaa;">${esc(t.footnote)}</p>`
      : "";
    rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:34px 48px 0 48px;">
    <p style="margin:0 0 6px 0; font-family:${SANS}; font-size:10px; font-weight:bold; text-transform:uppercase; color:${C.gold};">By Price Tier</p>
${intro}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="tbl">
    <tr bgcolor="${C.navy}" style="background-color:${C.navy};">
${headCells}
    </tr>
${bodyRows}
    </table>
${foot}
  </td>
  </tr>`);
  }

  // Dusty's Take (gold left rule).
  const dtQuote = copy.dustysTake.quote
    ? `      <p style="margin:10px 0 0 0; font-family:${SERIF}; font-size:20px; line-height:29px; color:${C.navy}; font-style:italic;">&ldquo;${esc(copy.dustysTake.quote)}&rdquo;</p>`
    : "";
  const dtPs = copy.dustysTake.paragraphs
    .map(
      (p) =>
        `      <p style="margin:14px 0 0 0; font-family:${SANS}; font-size:15px; line-height:25px; color:#555555;">${esc(p)}</p>`,
    )
    .join("\n");
  rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:34px 48px 0 48px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
    <td width="3" bgcolor="${C.gold}" style="background-color:${C.gold}; font-size:1px; line-height:1px;">&nbsp;</td>
    <td style="padding-left:22px;">
      <p style="margin:0; font-family:${SANS}; font-size:10px; font-weight:bold; text-transform:uppercase; color:${C.gold};">Dusty's Take</p>
${dtQuote}
${dtPs}
    </td>
    </tr>
    </table>
  </td>
  </tr>`);

  // Where these numbers come from.
  rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:34px 48px 36px 48px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="background-color:${C.panel};">
    <tr>
    <td style="padding:22px 26px;">
      <p style="margin:0; font-family:${SANS}; font-size:10px; font-weight:bold; text-transform:uppercase; color:${C.gold};">Where These Numbers Come From</p>
      <p style="margin:10px 0 0 0; font-family:${SANS}; font-size:13px; line-height:21px; color:#666666;">${esc(copy.sourceNote)}</p>
    </td>
    </tr>
    </table>
  </td>
  </tr>`);

  rows.push(
    ctaPanel(
      copy.cta ?? {
        eyebrow: "Wondering which tier your home is in?",
        headline: "I will run a free market analysis",
        body: "No obligation and no pressure. Just an honest number based on what is actually selling in your neighborhood and your price range right now, not two months ago.",
      },
    ),
  );
  rows.push(signature());
  rows.push(footer());
  return emailDocument(copy.subject, rows.join("\n"));
}
