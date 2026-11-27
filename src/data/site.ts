export const site = {
  name: 'Jimmy on the Trail',
  url: 'https://jimmyonthetrail.com',
  keywords: ['Appalachian Trail', 'hiking', 'blog', 'adventure'],
  ogType: 'website',
} as const;

export interface PageMeta {
  name: string;
  description: string;
  slug: string;
}

export const pages = {
  home: {
    name: 'Appalachian Trail Thru-Hiker',
    // Built from facts already on the site: the About text, the trail data and the final stats.
    description:
      "Jimmy's 2022 Appalachian Trail thru-hike from Springer Mountain, Georgia to Mt Katahdin, Maine: 2194.3 miles in 157 days, with daily journal entries, photos and his gear list.",
    slug: '',
  },
  gear: {
    name: 'Gear List',
    description:
      "Jimmy's gear list for hiking the Appalachian Trail including backpack, sleep system, cooking gear, and clothing!",
    slug: 'gear',
  },
  blog: {
    name: 'Blog',
    description:
      "Daily trail journal from Jimmy's 2022 Appalachian Trail thru-hike: miles, towns, weather, and the people met along the way from Georgia to Maine.",
    slug: 'blog',
  },
  map: {
    name: 'Interactive Map',
    description: "Follow Jimmy's progress along the Appalachian Trail with this interactive map.",
    slug: 'map',
  },
  wishes: {
    name: 'Well Wishes',
    description:
      'Messages of encouragement that friends and family sent Jimmy during his 2022 Appalachian Trail thru-hike.',
    slug: 'wishes',
  },
  gallery: {
    name: 'Photo Gallery',
    description: "See pictures of Jimmy along the trail: photos from his 2022 Appalachian Trail thru-hike, Georgia to Maine.",
    slug: 'gallery',
  },
} satisfies Record<string, PageMeta>;

/** AdventureMapper embed shown on /map. */
export const trailMap = {
  embedUrl: 'https://adventuremapper.com/embed/F4bMyTEJHf',
  title: "Rocket Man's Appalachian Trail",
  creditUrl: 'https://adventuremapper.com/',
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
