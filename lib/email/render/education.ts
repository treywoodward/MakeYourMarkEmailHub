// Render an education email from validated copy. Supports numbered items
// (like "Five mistakes...") and argued sections (kicker + headline + prose),
// plus an optional Dusty's Take and an "If you are buying" style side note.
//
// NOTE (follow-up): the argued template can also interleave small data tables
// and stat rows between sections. Those are not modeled yet; add per-section
// `table`/`stats` to the schema when needed.
import type { EducationCopy } from "@/lib/email/schemas";
import {
  emailDocument,
  headerLogo,
  goldBar,
  goldRuleRow,
  greetingIntro,
  hairlineRow,
  ctaPanel,
  signature,
  footer,
  esc,
  nl2br,
  SERIF,
  SANS,
  C,
} from "./primitives";

export function renderEducation(copy: EducationCopy): string {
  const rows: string[] = [headerLogo(), goldBar()];

  // Eyebrow + headline + gold rule.
  rows.push(`  <tr>
  <td align="center" bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:44px 48px 10px 48px;">
    <p style="margin:0; font-family:${SERIF}; font-style:italic; font-size:14px; color:${C.gold};">${esc(copy.eyebrow)}</p>
  </td>
  </tr>
  <tr>
  <td align="center" bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:8px 48px 18px 48px;">
    <h1 style="margin:0; font-family:${SERIF}; font-size:30px; line-height:38px; color:${C.navy}; font-weight:normal;">${nl2br(copy.headline)}</h1>
  </td>
  </tr>`);
  rows.push(goldRuleRow(0, 28));
  rows.push(greetingIntro([copy.intro], "0 48px 36px 48px"));

  // Numbered items.
  if (copy.items && copy.items.length > 0) {
    copy.items.forEach((item, i) => {
      const num = String(i + 1).padStart(2, "0");
      const last = i === copy.items!.length - 1;
      rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:0 48px${last ? " 40px 48px" : ""};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
    <td width="64" valign="top" style="padding-right:8px;">
      <p style="margin:0; font-family:${SERIF}; font-size:46px; line-height:46px; color:${C.faintNumeral};">${num}</p>
    </td>
    <td valign="top" style="padding-top:6px;">
      <p style="margin:0; font-family:${SERIF}; font-size:19px; line-height:26px; color:${C.navy};">${esc(item.title)}</p>
      <p style="margin:8px 0 0 0; font-family:${SANS}; font-size:14px; line-height:23px; color:#555555;">${esc(item.body)}</p>
    </td>
    </tr>
    </table>
  </td>
  </tr>`);
      if (!last) rows.push(hairlineRow("26px 48px"));
    });
  }

  // Argued sections.
  if (copy.sections && copy.sections.length > 0) {
    copy.sections.forEach((s, i) => {
      const ps = s.paragraphs
        .map(
          (p) =>
            `    <p style="margin:14px 0 0 0; font-family:${SANS}; font-size:15px; line-height:25px; color:#555555;">${esc(p)}</p>`,
        )
        .join("\n");
      rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:0 48px;">
    <p style="margin:0; font-family:${SANS}; font-size:10px; font-weight:bold; text-transform:uppercase; color:${C.gold};">${esc(s.kicker)}</p>
    <h2 style="margin:10px 0 0 0; font-family:${SERIF}; font-size:23px; line-height:31px; color:${C.navy}; font-weight:normal;">${esc(s.headline)}</h2>
${ps}
  </td>
  </tr>`);
      if (i !== copy.sections!.length - 1) rows.push(hairlineRow("34px 48px"));
    });
  }

  // Dusty's Take (optional).
  if (copy.dustysTake) {
    const quote = copy.dustysTake.quote
      ? `      <p style="margin:10px 0 0 0; font-family:${SERIF}; font-size:20px; line-height:29px; color:${C.navy}; font-style:italic;">&ldquo;${esc(copy.dustysTake.quote)}&rdquo;</p>`
      : "";
    const ps = copy.dustysTake.paragraphs
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
${quote}
${ps}
    </td>
    </tr>
    </table>
  </td>
  </tr>`);
  }

  // Side note box (optional).
  if (copy.sideNote) {
    rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:34px 48px 0 48px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="background-color:${C.panel};">
    <tr>
    <td style="padding:24px 26px;">
      <p style="margin:0; font-family:${SANS}; font-size:10px; font-weight:bold; text-transform:uppercase; color:${C.gold};">${esc(copy.sideNote.kicker)}</p>
      <p style="margin:10px 0 0 0; font-family:${SANS}; font-size:14px; line-height:23px; color:#555555;">${esc(copy.sideNote.body)}</p>
    </td>
    </tr>
    </table>
  </td>
  </tr>`);
  }

  rows.push(
    ctaPanel(
      copy.cta ?? {
        eyebrow: "Thinking about selling this year?",
        headline: "Let me walk your home with you",
        body: "I will point out exactly what is worth doing and what is not, and give you an honest read on what it should list for. No pressure, no obligation.",
      },
    ),
  );
  rows.push(signature());
  rows.push(footer());
  return emailDocument(copy.subject, rows.join("\n"));
}
