/** Shared JSON-LD pieces so every page points at the same entities by @id. */
import { defaultOgCard, hiker, site } from '../data/site';

export const ids = {
  website: `${site.url}/#website`,
  person: `${site.url}/#jimmy`,
  blog: `${site.url}/blog#blog`,
  adventureMapper: 'https://adventuremapper.com/#organization',
  trail: `${site.url}/#appalachian-trail`,
} as const;

export const absolute = (path: string) => new URL(path, site.url).href;

/** Reference to Jimmy (full node lives on the home page). */
export const personRef = { '@type': 'Person', '@id': ids.person, name: hiker.name, alternateName: hiker.trailName };

export const person = {
  ...personRef,
  url: absolute('/'),
  description: 'Appalachian Trail thru-hiker, Georgia to Maine, 2022.',
};

export const website = {
  '@type': 'WebSite',
  '@id': ids.website,
  name: site.name,
  url: absolute('/'),
  inLanguage: 'en',
  author: { '@id': ids.person },
  publisher: { '@id': ids.person },
  image: {
    '@type': 'ImageObject',
    url: absolute(defaultOgCard.path),
    width: defaultOgCard.width,
    height: defaultOgCard.height,
    caption: defaultOgCard.alt,
  },
};

export const adventureMapper = {
  '@type': 'Organization',
  '@id': ids.adventureMapper,
  name: 'Adventure Mapper',
  url: 'https://adventuremapper.com/',
};

export const appalachianTrail = {
  '@type': 'Place',
  '@id': ids.trail,
  name: 'Appalachian Trail',
  alternateName: 'AT',
  description: 'A 2,193-mile hiking trail from Springer Mountain, Georgia to Mount Katahdin, Maine.',
};

export interface Crumb {
  name: string;
  path: string;
}

export const breadcrumbList = (crumbs: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: crumb.name,
    item: absolute(crumb.path),
  })),
});
