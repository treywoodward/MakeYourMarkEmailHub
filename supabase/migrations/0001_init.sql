-- Dusty Email Hub: initial schema
-- Mirrors section 11 of docs/SPEC.md.
-- Run this in the Supabase SQL editor (or via the Supabase CLI) once the project exists.

-- ---------------------------------------------------------------------------
-- Enums (the fixed sets of allowed values from the spec)
-- ---------------------------------------------------------------------------
create type user_role       as enum ('admin', 'client');
create type listing_source  as enum ('spark', 'submission');
create type listing_state   as enum ('processing', 'ready', 'needs_attention');
create type email_slot      as enum ('week1', 'week2', 'week3', 'week4', 'week5', 'holiday');
create type email_type      as enum ('listing', 'marketPulse', 'education', 'holiday');
create type email_status    as enum ('planned', 'drafting', 'in_review', 'changes_requested', 'approved', 'pushed', 'sent');

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated user, tied to Supabase's auth.users.
-- role drives permissions (admin = Trey, client = Dusty).
-- ---------------------------------------------------------------------------
create table profiles (
  id    uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name  text,
  role  user_role not null default 'client'
);

-- ---------------------------------------------------------------------------
-- listings: every ingested property.
-- description_raw is what we captured; description_edited is the voiced version.
-- flags is free-form json (truncated, portrait_photo, price_change, contingency...).
-- ---------------------------------------------------------------------------
create table listings (
  id                 uuid primary key default gen_random_uuid(),
  mls_number         text,
  address            text,
  city               text,
  zip                text,
  price              integer,
  prev_price         integer,
  beds               numeric,
  baths              numeric,
  sqft               integer,
  acres              numeric,
  status_text        text,
  neighborhood       text,
  listing_url        text,
  description_raw    text,
  description_edited text,
  callout            text,
  source             listing_source not null,
  flags              jsonb not null default '{}'::jsonb,
  state              listing_state  not null default 'processing',
  submitted_by       uuid references profiles (id),
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- listing_photos: processed photos for a listing.
-- ghl_url / ghl_media_id fill in after upload to GHL media storage.
-- excluded_reason set for portrait photos kept out of grids.
-- ---------------------------------------------------------------------------
create table listing_photos (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references listings (id) on delete cascade,
  source_url      text,
  ghl_url         text,
  ghl_media_id    text,
  width           integer,
  height          integer,
  was_cropped     boolean not null default false,
  excluded_reason text,
  is_hero         boolean not null default false,
  sort_order      integer not null default 0
);

-- ---------------------------------------------------------------------------
-- emails: one row per planned/sent email. copy is the structured JSON from the
-- LLM; html is the rendered output. month is 'YYYY-MM' for grouping.
-- ---------------------------------------------------------------------------
create table emails (
  id              uuid primary key default gen_random_uuid(),
  month           text not null,                 -- 'YYYY-MM'
  slot            email_slot not null,
  type            email_type not null,
  send_date       date,
  status          email_status not null default 'planned',
  subject         text,
  preview_text    text,
  copy            jsonb,
  html            text,
  ghl_template_id text,
  ghl_campaign_id text,
  swap_note       text,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- email_listings: which listings appear in a listing email, and in what order.
-- ---------------------------------------------------------------------------
create table email_listings (
  email_id   uuid not null references emails (id) on delete cascade,
  listing_id uuid not null references listings (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (email_id, listing_id)
);

-- ---------------------------------------------------------------------------
-- comments: the approval / change-request thread on an email.
-- ---------------------------------------------------------------------------
create table comments (
  id         uuid primary key default gen_random_uuid(),
  email_id   uuid not null references emails (id) on delete cascade,
  author_id  uuid not null references profiles (id),
  body       text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- market_snapshots: every market number with its source/geography/period, so
-- the Market Pulse generator can only use cited numbers (data honesty rules).
-- ---------------------------------------------------------------------------
create table market_snapshots (
  id           uuid primary key default gen_random_uuid(),
  source       text not null,        -- 'Freddie Mac', 'Altos', 'Texas A&M', 'NAR'...
  geography    text not null,        -- 'southwest Lubbock (79424)', 'Lubbock metro'...
  period_start date,
  period_end   date,
  metrics      jsonb not null,       -- { median_price: 315000, months_inventory: 3.1, ... }
  method_notes text,
  file_path    text,                 -- storage path of the uploaded PDF, if any
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- email_stats: campaign metrics, pulled from GHL (or aggregated from webhooks).
-- ---------------------------------------------------------------------------
create table email_stats (
  email_id     uuid primary key references emails (id) on delete cascade,
  delivered    integer,
  opens        integer,
  clicks       integer,
  unsubscribes integer,
  bounces      integer,
  pulled_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- push_subscriptions: Web Push endpoints per profile (Phase 4).
-- ---------------------------------------------------------------------------
create table push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  endpoint   text not null,
  keys       jsonb not null,
  created_at timestamptz not null default now()
);

-- Helpful indexes for the common queries.
create index listings_state_idx        on listings (state);
create index listing_photos_listing_idx on listing_photos (listing_id, sort_order);
create index emails_month_idx           on emails (month);
create index comments_email_idx         on comments (email_id, created_at);
create index market_snapshots_geo_idx   on market_snapshots (geography, period_end);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user is created.
-- Standard Supabase pattern. New users default to the 'client' role; promote
-- Trey to 'admin' manually after first sign-in.
-- ---------------------------------------------------------------------------
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- is_admin(): reusable check for policies (security definer avoids recursion
-- when a policy on profiles needs to read profiles).
-- ---------------------------------------------------------------------------
create function is_admin()
returns boolean
language sql
stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security. Both users can read almost everything; only admins write.
-- Anyone signed in can read. Admins write. A few tables allow the client to
-- write their own rows (comments, listing submissions, push subscriptions).
-- ---------------------------------------------------------------------------
alter table profiles           enable row level security;
alter table listings           enable row level security;
alter table listing_photos     enable row level security;
alter table emails             enable row level security;
alter table email_listings     enable row level security;
alter table comments           enable row level security;
alter table market_snapshots   enable row level security;
alter table email_stats        enable row level security;
alter table push_subscriptions enable row level security;

-- profiles: you can read all profiles; you can update your own; admins manage all.
create policy profiles_read   on profiles for select using (auth.role() = 'authenticated');
create policy profiles_update on profiles for update using (id = auth.uid());
create policy profiles_admin  on profiles for all    using (is_admin()) with check (is_admin());

-- Read-for-all-signed-in, admin-writes tables.
create policy listings_read        on listings         for select using (auth.role() = 'authenticated');
create policy listings_admin       on listings         for all    using (is_admin()) with check (is_admin());
-- The client may submit a listing (insert) tagged as their own submission.
create policy listings_client_insert on listings       for insert with check (
  auth.role() = 'authenticated' and source = 'submission' and submitted_by = auth.uid()
);

create policy photos_read   on listing_photos for select using (auth.role() = 'authenticated');
create policy photos_admin  on listing_photos for all    using (is_admin()) with check (is_admin());

create policy emails_read   on emails for select using (auth.role() = 'authenticated');
create policy emails_admin  on emails for all    using (is_admin()) with check (is_admin());

create policy email_listings_read  on email_listings for select using (auth.role() = 'authenticated');
create policy email_listings_admin on email_listings for all    using (is_admin()) with check (is_admin());

-- comments: anyone signed in can read; you can write your own; admins manage all.
create policy comments_read         on comments for select using (auth.role() = 'authenticated');
create policy comments_self_insert  on comments for insert with check (author_id = auth.uid());
create policy comments_admin        on comments for all    using (is_admin()) with check (is_admin());

create policy snapshots_read  on market_snapshots for select using (auth.role() = 'authenticated');
create policy snapshots_admin on market_snapshots for all    using (is_admin()) with check (is_admin());

create policy stats_read   on email_stats for select using (auth.role() = 'authenticated');
create policy stats_admin  on email_stats for all    using (is_admin()) with check (is_admin());

-- push_subscriptions: you manage your own.
create policy push_self on push_subscriptions for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
