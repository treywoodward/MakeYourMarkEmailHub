// Seed data for the skeleton so the UI renders before Supabase is connected.
// Once the database is live, the home page reads from `emails` instead of this file.
// Keyed to the real Mondays of September 2026 (Sept 7, 14, 21, 28) with a Labor
// Day holiday overlay, and a spread of statuses so every status pill shows.
//
// Emails carry real `copy` (validated by lib/email/schemas) and, for listings,
// `photos`, so the detail page renders a true email preview. Copy is transcribed
// from the reference templates; photo URLs are the actual GHL CDN images.

import type { EmailSlot, EmailStatus, EmailType } from "./types";
import type { EmailCopy } from "./email/schemas";

export interface SeedEmail {
  id: string;
  month: string; // 'YYYY-MM'
  slot: EmailSlot;
  type: EmailType;
  send_date: string; // 'YYYY-MM-DD'
  status: EmailStatus;
  subject: string;
  preview_text: string;
  hero_thumb_url?: string;
  copy?: EmailCopy;
  photos?: string[][]; // photos[i] = ordered CDN URLs for listing i (hero first)
}

const CDN = "https://assets.cdn.filesafe.space/fHjFPixdwzhw2AqUfXJm/media/";

// --- 3712 141st Street (single listing) ------------------------------------
const listing3712Copy: EmailCopy = {
  type: "listing",
  subject: "Just Listed in Eastwick at Kelsey Park",
  previewText: "Like new and impeccably maintained, right on the park.",
  eyebrow: "Just Listed",
  headline: "3712 141st Street",
  intro:
    "Like new and impeccably maintained, this home in Eastwick at Kelsey Park brings together style, function and location.",
  listings: [
    {
      eyebrow: "Just Listed  •  Eastwick at Kelsey Park",
      address: "3712 141st Street",
      cityLine: "Lubbock, TX 79423",
      price: "$550,000",
      stats: [
        { value: "4", label: "Beds" },
        { value: "3", label: "Baths" },
        { value: "2,705", label: "Sq Ft" },
      ],
      paragraphs: [
        "Like new and impeccably maintained, this four bedroom, three bath home in Eastwick at Kelsey Park brings together style, function and location. The floor plan is filled with natural light and includes a versatile flex space that works well as a home office or a playroom. Outside, beat-the-heat shades keep the covered patio comfortable through a West Texas afternoon. Exceptionally clean and move-in ready.",
      ],
      callout:
        "Kelsey Park is right through your back gate. Not down the street, not a drive away. Through the gate.",
      mlsLine: "MLS #202611456  •  Active",
    },
  ],
};

const listing3712Photos: string[][] = [
  [
    `${CDN}6a8c5d8dad59e6cfed386b61.jpg`, // hero
    `${CDN}6a8c5d8dbbd5ecc97f838d30.jpg`,
    `${CDN}6a8c5d8d67ecc8731d5ace4f.jpg`,
    `${CDN}6a8c5d8dbbd5ecc97f838d35.jpg`,
    `${CDN}6a8c5d8dcdd4b797a340fd39.jpg`,
    `${CDN}6a8c5d8d4570702876806be8.jpg`,
    `${CDN}6a8c5d8d67f8d8c86b7dabc3.jpg`,
    `${CDN}6a8c5d8d67bb7ac35134b337.jpg`,
    `${CDN}6a8c5d8d4570702876806c04.jpg`,
  ],
];

// --- Market Pulse, September 2026 ------------------------------------------
const marketPulseCopy: EmailCopy = {
  type: "marketPulse",
  subject: "The Lubbock Market Pulse | September 2026",
  previewText: "Our market cooled. Here is what the live numbers actually show.",
  eyebrow: "Market Pulse",
  headline: "Market Pulse",
  intro: "The Lubbock Market Pulse.",
  periodLabel: "September 2026",
  openingNote:
    "Most of the market reports you see are two months behind by the time they reach you. The June numbers came out in August. That is fine for the big picture, but it is not much help if you are deciding what to do this month. So this time I pulled the live numbers too, and I want to be straight with you about what they show. Our market has cooled. Not crashed, not anything close to it, but cooled. Inventory is building and price cuts are up from where they were this spring. The good news is we are still in far better shape than the rest of Texas, and the entry-level end of our market is genuinely moving.",
  stats: [
    { value: "34%", label: "Listings With a Price Cut", sublabel: "Against 42% nationally" },
    { value: "49", label: "Median Days on Market", sublabel: "Half sell faster than this" },
    { value: "$153", label: "Price Per Sq Ft", sublabel: "Southwest Lubbock, this week" },
  ],
  whatsMoving: {
    headline: "Rates went the wrong way, and the market noticed.",
    paragraphs: [
      "The thirty year fixed averaged 6.71 percent in early September, up from 6.50 percent a year ago and up nearly three quarters of a point from where it sat in February. That climb is the single biggest reason the market feels different than it did in the spring, and it is showing up everywhere.",
      "Nationally, roughly 42 percent of active listings have taken a price cut. In Austin and San Antonio it is above 54 percent. Here in southwest Lubbock it is 34 percent. We are cooler than we were, but we are not in the conversation with those markets, and it is worth knowing the difference when you read a Texas housing headline.",
      "One detail I find encouraging: the median price on brand new listings here is coming in below the median on what is already sitting. Sellers are reading the market correctly and pricing to it. That is exactly how a market stays healthy instead of stalling out.",
    ],
  },
  tierTable: {
    intro:
      "Each tier below is about a quarter of the market. Watch the last two columns, because that is where the real story is. Absorbed means homes that went under contract.",
    rows: [
      { medianPrice: "$220,000", sqft: "1,562", dom: "63", newCount: "3", absorbed: "8" },
      { medianPrice: "$282,000", sqft: "1,991", dom: "42", newCount: "10", absorbed: "4" },
      { medianPrice: "$420,000", sqft: "2,582", dom: "56", newCount: "5", absorbed: "6" },
      { medianPrice: "$754,999", sqft: "3,612", dom: "84", newCount: "7", absorbed: "4" },
    ],
    footnote:
      "Entry level is clearing faster than it is being replaced. The top tier is doing the opposite.",
  },
  dustysTake: {
    quote:
      "Forty nine days and ninety nine days are the same market. The difference is how it was priced.",
    paragraphs: [
      "Here is the number I keep coming back to. The median home in our area goes under contract in 49 days. The average is 99. When the average is double the median, it means a group of listings has been sitting long enough to drag everything else up with it. Those are not bad houses. They are houses that started at the wrong number and have been chasing the market down ever since.",
      "If you are selling in the $200,000 to $300,000 range, you are in the strongest part of this market. Homes in that tier are going under contract faster than new ones are coming on. Be confident, but do not confuse that with pricing high, because a third of the listings out there have already had to cut.",
      "If you are above $500,000, understand what you are walking into. Inventory in that tier is building faster than it is clearing and the typical home takes 84 days. Your house has to be the best presented option at its price, and the price has to be honest on day one. I would rather tell you that now than three months from now.",
      "And if you are buying at the upper end, this is the most room to negotiate you have had in a long time. Use it.",
    ],
  },
  sourceNote:
    "Local figures reflect current week single family activity in the 79424 zip code in southwest Lubbock, from Altos Research. Mortgage rates are the Freddie Mac weekly survey. National and Texas price cut shares are from Altos Research and Parcl Labs. For the wider metro, the most recent published report from the Texas Real Estate Research Center at Texas A&M covers June and showed 627 closed sales, a median close price of $250,000, and homes closing at 96.6 percent of original list.",
  cta: {
    eyebrow: "Wondering which tier your home is in?",
    headline: "I will run a free market analysis",
    body: "No obligation and no pressure. Just an honest number based on what is actually selling in your neighborhood and your price range right now, not two months ago.",
  },
};

// --- Holiday: Labor Day ----------------------------------------------------
const holidayCopy: EmailCopy = {
  type: "holiday",
  subject: "Happy Labor Day from the Make Your Mark Legacy Team",
  previewText: "However you read a holiday named after work, I hope you get the day.",
  eyebrow: "From all of us in Lubbock",
  headline: "Happy Labor Day",
  intro: "However you read it, I hope you get the day.",
  note: [
    "Labor Day is one of the few holidays where the whole point is to stop working, which is a little funny for a holiday named after work. However you read it, I hope you get the day.",
    "This one always feels like the real end of summer around here. The Tech students are back, the mornings finally have a little bite to them, and everybody is standing over a grill trying to decide whether it is still too hot to be doing this. It is not. Fire it up anyway.",
  ],
  list: {
    kicker: "Four Ways to Spend the Day Off",
    title: "None of them involve a spreadsheet",
    items: [
      {
        title: "Get to a park early",
        body: "Mackenzie, Higginbotham, Clapp. Before eleven, it is genuinely pleasant out. After two, you will regret every decision that led you there.",
      },
      {
        title: "Take the long way to the winery",
        body: "We are in the middle of Texas wine country and half of Lubbock forgets it. A slow drive out and back fills an afternoon nicely.",
      },
      {
        title: "Cook too much food",
        body: "Brisket if you planned ahead. Burgers if you did not. Nobody has ever complained about leftovers on a Tuesday.",
      },
      {
        title: "Do absolutely nothing",
        body: "Underrated. Highly recommended. This is the one I am going with.",
      },
    ],
  },
  closing: [
    "A quick thank you while I have you. To everybody on this list who spent this year working on a jobsite, in a classroom, on a farm, in a hospital, or behind a counter, Lubbock runs because you show up. That is worth a Monday off.",
    "Enjoy the day. Be safe out there, and drink more water than you think you need.",
  ],
  pullQuote:
    "And if your day off gets hijacked by a conversation about buying or selling a house, that is what I am here for. Text me Tuesday.",
};

// --- Dual listing: 3712 141st + 5706 Grinnell duplex -----------------------
const dualListingCopy: EmailCopy = {
  type: "listing",
  subject: "Two New Listings in Lubbock",
  previewText: "A family home on the park and a duplex already earning rent.",
  eyebrow: "New This Week",
  headline: "Two New Listings,\nTwo Different Buyers",
  intro:
    "Two properties hit the market this week and they are aimed at completely different people. The first is a move-in ready family home in south Lubbock that backs right up to a park. The second is a northwest Lubbock duplex that is already generating rent. If either one is your kind of deal, let me know.",
  listings: [
    {
      eyebrow: "Eastwick at Kelsey Park  •  Lubbock, TX 79423",
      address: "3712 141st Street",
      price: "$550,000",
      stats: [
        { value: "4", label: "Beds" },
        { value: "3", label: "Baths" },
        { value: "2,705", label: "Sq Ft" },
      ],
      paragraphs: [
        "Like new and impeccably maintained, this four bedroom, three bath home brings together style, function and location. The floor plan is filled with natural light and includes a versatile flex space that works well as a home office or a playroom. Outside, beat-the-heat shades keep the covered patio comfortable through a West Texas afternoon. Exceptionally clean and move-in ready.",
      ],
      callout:
        "Kelsey Park is right through your back gate. Not down the street, not a drive away. Through the gate.",
      mlsLine: "MLS #202611456  •  Active",
    },
    {
      eyebrow: "Duplex  •  Northwest Lubbock, TX 79416",
      address: "5706 Grinnell Street",
      price: "$250,000",
      stats: [
        { value: "4", label: "Beds" },
        { value: "4", label: "Baths" },
        { value: "4", label: "Garage" },
        { value: "2,378", label: "Sq Ft" },
      ],
      paragraphs: [
        "A well maintained duplex on a quiet cul-de-sac in northwest Lubbock, built in 2005 and set up for either an investor or an owner-occupant. Side A is vacant and ready to show. Side B is occupied by a long term tenant paying $1,200 a month. Both sides have spacious backyards with patios and automatic sprinklers, and appliances convey with the property.",
        "It was also built with sound in mind, with blown-in cellulose insulation in the exterior walls and in the center dividing wall, so the two units stay genuinely private from one another. Recent work includes HVAC systems replaced in 2022, a new cedar picket fence in 2023, and a roof replaced in 2019.",
      ],
      callout:
        "Live on one side and let the other side help cover your note. Or hold both and add a solid rental to the portfolio.",
      mlsLine: "MLS #202611777  •  New Listing",
    },
  ],
};

const dualListingPhotos: string[][] = [
  listing3712Photos[0],
  [
    `${CDN}6a8c707dbbd5ecc97fa13db7.jpg`, // hero
    `${CDN}6a8c707cad59e6cfed500674.jpg`,
    `${CDN}6a8c707c67ecc8731d7c8636.jpg`,
    `${CDN}6a8c707ccdd4b797a3599612.jpg`,
    `${CDN}6a8c707c4ee4e7911d82a4ea.jpg`,
    `${CDN}6a8c707dad59e6cfed5006c7.jpg`,
    `${CDN}6a8c707c4ee4e7911d82a4e5.jpg`,
    `${CDN}6a8c707c45707028769b184b.jpg`,
    `${CDN}6a8c707d67f8d8c86b983170.jpg`,
  ],
];

export const seedMonth = "2026-09";

export const seedEmails: SeedEmail[] = [
  {
    id: "seed-holiday-laborday",
    month: "2026-09",
    slot: "holiday",
    type: "holiday",
    send_date: "2026-09-05",
    status: "sent",
    subject: "Happy Labor Day from the Make Your Mark Legacy Team",
    preview_text: "However you read a holiday named after work, I hope you get the day.",
    copy: holidayCopy,
  },
  {
    id: "seed-week1-listing",
    month: "2026-09",
    slot: "week1",
    type: "listing",
    send_date: "2026-09-07",
    status: "sent",
    subject: "Two New Listings in Lubbock",
    preview_text: "A family home on the park and a duplex already earning rent.",
    copy: dualListingCopy,
    photos: dualListingPhotos,
  },
  {
    id: "seed-week2-marketpulse",
    month: "2026-09",
    slot: "week2",
    type: "marketPulse",
    send_date: "2026-09-14",
    status: "sent",
    subject: "The Lubbock Market Pulse | September 2026",
    preview_text: "Our market cooled. Here is what the live numbers actually show.",
    copy: marketPulseCopy,
  },
  {
    id: "seed-week3-listing",
    month: "2026-09",
    slot: "week3",
    type: "listing",
    send_date: "2026-09-21",
    status: "sent",
    subject: "Just Listed in Eastwick at Kelsey Park",
    preview_text: "Like new and impeccably maintained, right on the park.",
    copy: listing3712Copy,
    photos: listing3712Photos,
  },
];
