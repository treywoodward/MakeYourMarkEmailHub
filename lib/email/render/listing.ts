// Render a listing email (1 to 4 listings) from validated copy + photos.
// Photos come from the database (not the LLM): photosByListing[i] is the ordered
// list of CDN URLs for listing i, with the hero first.

import type { ListingCopy, ListingItem } from "@/lib/email/schemas";
import {
  emailDocument,
  headerLogo,
  goldBar,
  goldRuleRow,
  greetingIntro,
  calloutBox,
  hairlineRow,
  statCells,
  gallery,
  ctaPanel,
  signature,
  footer,
  esc,
  escAttr,
  nl2br,
  SERIF,
  SANS,
  C,
} from "./primitives";

function heroRow(url: string, alt: string): string {
  return `  <tr>
  <td bgcolor="#ffffff" style="background-color:#ffffff;">
    <img src="${escAttr(url)}" alt="${escAttr(alt)}" width="600" style="display:block; width:100%; max-width:600px; height:auto; border:0;">
  </td>
  </tr>`;
}

// Head for a single-listing email: big address, grey city line, larger price.
function singleHead(l: ListingItem): string {
  const city = l.cityLine
    ? `\n    <p style="margin:4px 0 0 0; font-family:${SANS}; font-size:13px; color:#999999;">${esc(l.cityLine)}</p>`
    : "";
  return `  <tr>
  <td align="center" bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:36px 48px 8px 48px;">
    <p style="margin:0; font-family:${SERIF}; font-style:italic; font-size:14px; color:${C.gold};">${esc(l.eyebrow)}</p>
    <h1 style="margin:10px 0 0 0; font-family:${SERIF}; font-size:28px; line-height:36px; color:${C.navy}; font-weight:normal;">${esc(l.address)}</h1>${city}
    <p style="margin:12px 0 0 0; font-family:${SERIF}; font-size:24px; color:${C.gold};">${esc(l.price)}</p>
  </td>
  </tr>`;
}

// Head for a listing block inside a multi-listing email.
function multiHead(l: ListingItem): string {
  return `  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:30px 48px 8px 48px;">
    <p style="margin:0; font-family:${SERIF}; font-style:italic; font-size:13px; color:${C.gold};">${esc(l.eyebrow)}</p>
    <h2 style="margin:6px 0 0 0; font-family:${SERIF}; font-size:24px; line-height:32px; color:${C.navy}; font-weight:normal;">${esc(l.address)}</h2>
    <p style="margin:6px 0 0 0; font-family:${SERIF}; font-size:20px; color:${C.gold};">${esc(l.price)}</p>
  </td>
  </tr>`;
}

// Body paragraphs. Single listings read at 15px/#444; multi blurbs at 14px/#555.
function paragraphs(items: string[], size: number, color: string, pad: string): string {
  const ps = items
    .map(
      (p, i) =>
        `    <p style="margin:${i === 0 ? "0" : "14px 0 0 0"}; font-family:${SANS}; font-size:${size}px; line-height:${size === 15 ? 25 : 23}px; color:${color};">${esc(p)}</p>`,
    )
    .join("\n");
  return `  <tr>
  <td bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:${pad};">
${ps}
  </td>
  </tr>`;
}

function mlsRow(mlsLine: string, pad: string): string {
  return `  <tr>
  <td align="center" bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:${pad};">
    <p style="margin:0; font-family:${SANS}; font-size:11px; text-transform:uppercase; color:#aaaaaa;">${esc(mlsLine)}</p>
  </td>
  </tr>`;
}

// Navy "View Full Listing" button (used when a listing has a public URL).
function viewListingButton(url: string): string {
  return `  <tr>
  <td align="center" bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:0 48px 44px 48px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
    <td align="center" bgcolor="${C.navy}" class="btn" style="background-color:${C.navy};">
      <a href="${escAttr(url)}" style="display:inline-block; padding:13px 34px; font-family:${SANS}; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none; white-space:nowrap;">View Full Listing</a>
    </td>
    </tr>
    </table>
  </td>
  </tr>`;
}

export function renderListing(copy: ListingCopy, photosByListing: string[][]): string {
  const rows: string[] = [headerLogo(), goldBar()];
  const single = copy.listings.length === 1;

  if (single) {
    const l = copy.listings[0];
    const photos = photosByListing[0] ?? [];
    if (photos[0]) rows.push(heroRow(photos[0], l.address));
    rows.push(singleHead(l));
    rows.push(statCells(l.stats, 22, "26px 48px 26px 48px"));
    rows.push(greetingIntro(l.paragraphs, "0 48px 26px 48px"));
    rows.push(calloutBox(l.callout, "0 48px 30px 48px"));
    rows.push(gallery(photos.slice(1), l.address));
    rows.push(mlsRow(l.mlsLine, "20px 48px 0 48px"));
  } else {
    // Masthead: email-level eyebrow + headline + gold rule, then the intro.
    rows.push(`  <tr>
  <td align="center" bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:44px 48px 10px 48px;">
    <p style="margin:0; font-family:${SERIF}; font-style:italic; font-size:14px; color:${C.gold};">${esc(copy.eyebrow)}</p>
  </td>
  </tr>`);
    rows.push(`  <tr>
  <td align="center" bgcolor="#ffffff" class="pad" style="background-color:#ffffff; padding:8px 48px 18px 48px;">
    <h1 style="margin:0; font-family:${SERIF}; font-size:29px; line-height:38px; color:${C.navy}; font-weight:normal;">${nl2br(copy.headline)}</h1>
  </td>
  </tr>`);
    rows.push(goldRuleRow(0, 26));
    rows.push(greetingIntro([copy.intro], "0 48px 34px 48px"));

    copy.listings.forEach((l, i) => {
      const photos = photosByListing[i] ?? [];
      const last = i === copy.listings.length - 1;
      if (photos[0]) rows.push(heroRow(photos[0], l.address));
      rows.push(multiHead(l));
      rows.push(statCells(l.stats, 20, "16px 48px 20px 48px"));
      rows.push(paragraphs(l.paragraphs, 14, "#555555", "0 48px 22px 48px"));
      rows.push(calloutBox(l.callout, "0 48px 24px 48px"));
      rows.push(gallery(photos.slice(1), l.address));
      rows.push(mlsRow(l.mlsLine, last ? "0 48px 40px 48px" : "0 48px 44px 48px"));
      if (l.listingUrl) rows.push(viewListingButton(l.listingUrl));
      if (!last) rows.push(hairlineRow("0 48px 44px 48px"));
    });
  }

  // Shared CTA panel (copy may override the default text).
  rows.push(
    ctaPanel(
      copy.cta ?? {
        eyebrow: single ? "Want to see it in person?" : "Want to see either one?",
        headline: "Let me get you through the door",
        body: "Call or text and we will find a time that works for you, including evenings and weekends.",
      },
    ),
  );
  rows.push(signature());
  rows.push(footer());

  return emailDocument(copy.subject, rows.join("\n"));
}
