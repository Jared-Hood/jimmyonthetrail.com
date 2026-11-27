/**
 * Moderation for the frozen guestbook (src/data/wishes.json stays an untouched export).
 *
 * The old site showed every submission. Ids listed below are hidden; delete an id to show it again.
 */

/** Prank submissions with innuendo names. The owner chose to show these, so the list is empty. */
export const hiddenPranks = new Set<string>([]);

/** Accidental partial submissions that were re-sent in full right after. */
export const hiddenFragments = new Set([
  'iQxtGgEgHLrY6aweM3rq', // Rick Sheffe: "Jimmy, when you getn" (full message follows)
  'lCgpAaGfJH3Z1GkNcQgp', // Victoria Baselice: first half of a message split in two
]);

/** Display fixes, keyed by id. */
export const messageOverrides: Record<string, string> = {
  // Victoria's message arrived as "THE TIME C" + "AS COME - no luck needed. You got this".
  '9lisesUQTFy1GfHxqAAp': 'THE TIME HAS COME - no luck needed. You got this',
};
