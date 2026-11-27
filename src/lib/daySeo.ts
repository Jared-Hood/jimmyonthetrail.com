/** Titles and descriptions for day pages (search results), built only from the day's data. */
import { TRAIL_TOTAL_MILES, formatMiles, type DayInfo } from './days';

const STATE_ABBR: Record<string, string> = {
  Georgia: 'GA',
  'North Carolina': 'NC',
  Tennessee: 'TN',
  Virginia: 'VA',
  'West Virginia': 'WV',
  Maryland: 'MD',
  Pennsylvania: 'PA',
  'New Jersey': 'NJ',
  'New York': 'NY',
  Connecticut: 'CT',
  Massachusetts: 'MA',
  Vermont: 'VT',
  'New Hampshire': 'NH',
  Maine: 'ME',
};

/** Short headline, e.g. "Day 12: Nantahala Outdoor Center, NC". */
export function dayHeadline({ entry, state }: DayInfo): string {
  return `Day ${entry.data.day}: ${entry.data.name}, ${STATE_ABBR[state] ?? state}`;
}

/** <title>, kept under ~60 characters by dropping the suffix when needed. */
export function dayTitle(info: DayInfo): string {
  const headline = dayHeadline(info);
  for (const suffix of [' | Appalachian Trail Thru-Hike', ' | AT Thru-Hike']) {
    if (headline.length + suffix.length <= 60) return headline + suffix;
  }
  return headline;
}

/** Meta description with the day's miles, place and state, ~150–160 characters. */
export function dayDescription({ entry, state, milesSoFar }: DayInfo): string {
  const { day, name, mileage } = entry.data;
  if (day === 0) {
    return `Day 0 of Jimmy's 2022 Appalachian Trail thru-hike: the approach trail at ${name}, ${state}, before the first step from Springer Mountain toward Maine.`;
  }
  const miles = mileage > 0 ? `${formatMiles(mileage)} miles to ${name}` : `a zero day at ${name}`;
  const lead = `Day ${day} of Jimmy's Appalachian Trail thru-hike: ${miles}, ${state}.`;
  const progress = `${formatMiles(milesSoFar)} of ${formatMiles(TRAIL_TOTAL_MILES)} miles`;
  // Longest version that stays within ~160 characters.
  const options = [
    `${lead} ${progress} from Georgia to Maine. Journal and photos.`,
    `${lead} ${progress} from Georgia to Maine.`,
    `${lead} ${progress} done.`,
  ];
  return options.find((text) => text.length <= 160) ?? lead;
}
