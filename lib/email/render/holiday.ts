// Render a holiday email from validated copy.
import type { HolidayCopy } from "@/lib/email/schemas";
import {
  emailDocument,
  headerLogo,
  goldBar,
  signature,
  footer,
  esc,
  SERIF,
  SANS,
  C,
} from "./primitives";

export function renderHoliday(copy: HolidayCopy): string {
  const rows: string[] = [headerLogo(), goldBar()];

  // Masthead: kicker, big italic title, gold rule.
  rows.push(`  <tr>
  <td align="center" bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:52px 48px 0 48px;">
    <p style="margin:0; font-family:${SANS}; font-size:11px; font-weight:bold; text-transform:uppercase; color:#9a9ab0;">${esc(copy.eyebrow)}</p>
    <h1 style="margin:12px 0 0 0; font-family:${SERIF}; font-size:46px; line-height:52px; color:${C.navy}; font-weight:normal; font-style:italic;">${esc(copy.headline)}</h1>
  </td>
  </tr>
  <tr>
  <td align="center" bgcolor="#ffffff" style="background-color:#ffffff; padding:22px 48px 0 48px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr><td width="48" height="2" bgcolor="${C.gold}" style="background-color:${C.gold}; width:48px; font-size:1px; line-height:1px;">&nbsp;</td></tr>
    </table>
  </td>
  </tr>`);

  // Note: greeting + note paragraphs.
  const notePs = copy.note
    .map(
      (p, i) =>
        `    <p style="margin:${i === 0 ? "18px 0 0 0" : "16px 0 0 0"}; font-family:${SANS}; font-size:15px; line-height:26px; color:#444444;">${esc(p)}</p>`,
    )
    .join("\n");
  rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:34px 48px 34px 48px;">
    <p style="margin:0; font-family:${SANS}; font-size:15px; line-height:26px; color:#444444;">Hi {{contact.first_name}},</p>
${notePs}
  </td>
  </tr>`);

  // List panel with big faint numerals.
  const items = copy.list.items
    .map((item, i) => {
      const last = i === copy.list.items.length - 1;
      const pad = last ? "0" : "0 0 20px 0";
      const num = String(i + 1).padStart(2, "0");
      return `    <tr>
    <td width="52" valign="top" style="padding:${pad};">
      <p style="margin:0; font-family:${SERIF}; font-size:34px; line-height:34px; color:${C.faintNumeral};">${num}</p>
    </td>
    <td valign="top" style="padding:${pad};">
      <p style="margin:0; font-family:${SERIF}; font-size:17px; line-height:24px; color:${C.navy};">${esc(item.title)}</p>
      <p style="margin:5px 0 0 0; font-family:${SANS}; font-size:14px; line-height:22px; color:#555555;">${esc(item.body)}</p>
    </td>
    </tr>`;
    })
    .join("\n");
  rows.push(`  <tr>
  <td bgcolor="${C.panel}" class="pad" style="background-color:${C.panel}; padding:36px 48px;">
    <p style="margin:0 0 6px 0; font-family:${SANS}; font-size:10px; font-weight:bold; text-transform:uppercase; color:${C.gold};">${esc(copy.list.kicker)}</p>
    <p style="margin:0 0 24px 0; font-family:${SERIF}; font-size:20px; line-height:29px; color:${C.navy};">${esc(copy.list.title)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${items}
    </table>
  </td>
  </tr>`);

  // Sign off.
  const closingPs = copy.closing
    .map(
      (p, i) =>
        `    <p style="margin:${i === 0 ? "0" : "16px 0 0 0"}; font-family:${SANS}; font-size:15px; line-height:26px; color:#444444;">${esc(p)}</p>`,
    )
    .join("\n");
  rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:36px 48px 0 48px;">
${closingPs}
  </td>
  </tr>`);

  // Pull quote (gold left rule on white).
  rows.push(`  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:32px 48px 40px 48px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
    <td width="3" bgcolor="${C.gold}" style="background-color:${C.gold}; font-size:1px; line-height:1px;">&nbsp;</td>
    <td style="padding-left:22px;">
      <p style="margin:0; font-family:${SERIF}; font-size:19px; line-height:29px; color:${C.navy}; font-style:italic;">${esc(copy.pullQuote)}</p>
    </td>
    </tr>
    </table>
  </td>
  </tr>`);

  rows.push(signature());
  rows.push(footer());
  return emailDocument(copy.subject, rows.join("\n"));
}
