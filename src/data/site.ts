export const site = {
  name: 'Jimmy on the Trail',
  url: 'https://jimmyonthetrail.com',
  keywords: ['Appalachian Trail', 'AT', 'thru-hike', 'thru-hiking', 'hiking trails', 'adventure', 'Georgia to Maine'],
  ogType: 'website',
} as const;

export interface PageMeta {
  /** Short page name (breadcrumbs, schema). */
  name: string;
  /**
   * Keyword-rich page part of the <title>; SEO.astro appends " | Jimmy on the Trail" (all pages
   * except home). Defaults to `name`. Keep the full title within ~60 characters.
   */
  title?: string;
  /** Full <title> used as-is (home only: the brand comes first there). */
  fullTitle?: string;
  /** Share card in public/og/ (default: the home card). */
  ogImage?: { path: string; alt: string };
  /** Meta description, ideally 150–160 characters. */
  description: string;
  slug: string;
}

export const pages = {
  home: {
    name: 'Home',
    fullTitle: 'Jimmy on the Trail | Appalachian Trail Thru-Hike 2022',
    // Built from facts already on the site: the About text, the trail data and the final stats.
    description:
      "Jimmy's 2022 Appalachian Trail thru-hike adventure, Georgia to Maine: 2,194.3 miles in 157 days, with a daily trail journal, photos, a map and his gear list.",
    slug: '',
  },
  gear: {
    name: 'Gear List',
    title: 'Appalachian Trail Gear List',
    ogImage: { path: '/og/gear.jpg', alt: 'Gear List: Jimmy on the Trail. Close-up of Jimmy’s backpack with a carabiner clipped to it.' },
    description:
      "Jimmy's Appalachian Trail thru-hike gear list: pack, shelter, sleep system, cook kit, water filter, clothing and electronics, with a 17 lb 11 oz base weight.",
    slug: 'gear',
  },
  blog: {
    name: 'Blog',
    title: 'Appalachian Trail Thru-Hike Journal',
    ogImage: { path: '/og/blog.jpg', alt: 'Trail Journal: Jimmy on the Trail. A forested mountain valley under scattered clouds.' },
    description:
      "Jimmy's day-by-day Appalachian Trail (AT) thru-hike journal from 2022: 157 days of miles, towns, weather and people on the trail from Georgia to Maine.",
    slug: 'blog',
  },
  map: {
    name: 'Interactive Map',
    title: 'Interactive Appalachian Trail Map',
    ogImage: { path: '/og/map.jpg', alt: 'Interactive Map: Jimmy on the Trail. The Appalachian Trail approach sign at Amicalola Falls listing Springer Mtn. and Mt. Katahdin.' },
    description:
      "Interactive map of Jimmy's 2022 Appalachian Trail thru-hike: every stop from Springer Mountain, Georgia to Mt Katahdin, Maine, mapped by Adventure Mapper.",
    slug: 'map',
  },
  wishes: {
    name: 'Well Wishes',
    ogImage: { path: '/og/wishes.jpg', alt: 'Well Wishes: Jimmy on the Trail. Jimmy with three people and two dogs on a wooden overlook.' },
    description:
      "Messages of encouragement that friends and family sent Jimmy during his 2022 Appalachian Trail thru-hike adventure, from Georgia all the way to Maine.",
    slug: 'wishes',
  },
  gallery: {
    name: 'Photo Gallery',
    title: 'Appalachian Trail Photos',
    ogImage: { path: '/og/gallery.jpg', alt: 'Photo Gallery: Jimmy on the Trail. Sun setting over mountain ridges seen from a rocky overlook.' },
    description:
      "87 photos from Jimmy's 2022 Appalachian Trail thru-hike: mountain views, shelters, trail towns and fellow hikers on the AT, from Georgia to Maine.",
    slug: 'gallery',
  },
} satisfies Record<string, PageMeta>;

/** Default social share card (public/og/default.png, built by scripts/build-og-image.mjs). */
export const defaultOgCard = {
  path: '/og/default.png',
  width: 1200,
  height: 630,
  alt: 'Jimmy on the Trail: Jimmy with arms raised on the Katahdin summit sign. Appalachian Trail thru-hike, Georgia to Maine, 2022.',
} as const;

/** AdventureMapper embed shown on /map. */
export const trailMap = {
  embedUrl: 'https://adventuremapper.com/embed/F4bMyTEJHf',
  title: "Rocket Man's Appalachian Trail",
  creditUrl: 'https://adventuremapper.com/',
  /**
   * Public trip page, used by three links: under the map on /map, in the footer, and on day pages.
   * The trip has no public (non-embed) page yet, so this points at the Adventure Mapper home page.
   */
  // TODO: replace with the trip's public URL (https://adventuremapper.com/@username/slug) once it
  // is published on Adventure Mapper; all three links update from this one value.
  tripUrl: 'https://adventuremapper.com/',
} as const;

/** The hiker, for structured data. */
export const hiker = {
  name: 'Jimmy Hood',
  trailName: 'RocketMan',
} as const;

export const nav = [
  { label: 'Map', href: '/map' },
  { label: 'Gear', href: '/gear' },
  { label: 'Blog', href: '/blog' },
  { label: 'Well Wishes', href: '/wishes' },
  { label: 'Gallery', href: '/gallery' },
] as const;
