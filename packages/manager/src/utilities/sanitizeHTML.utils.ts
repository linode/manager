import { OFFSITE_URL_REGEX, ONSITE_URL_REGEX } from 'src/constants';
import { allowedHTMLTagsFlexible, allowedHTMLTagsStrict } from 'src/constants';

/**
 * Returns the list of allowed HTML tags for a given tier.
 * Those tiers are usually tied to where an element is rendered.
 * For instance, a title should be rendered with a "strict" or "none" tier,
 * while a description could be rendered with a "flexible" tier, depending on the use case.
 *
 * This is used for sanitizing both API responses and user input, therefore even the "flexible" tier
 * is restrictive as in not allowing certain tags that could be used for XSS attacks.
 *
 * @param tier The tier to use is intentionally required to force the developer to think about the use case.
 * @param allowMoreTags A list of tags to add to the allowed tags list for one offs.
 * @default 'strict'
 */

export type AllowedHTMLTagsTier = 'flexible' | 'none' | 'strict';

export const getAllowedHTMLTags = (
  tier: AllowedHTMLTagsTier,
  allowMoreTags?: string[]
): string[] => {
  switch (tier) {
    case 'flexible':
      return [...allowedHTMLTagsFlexible, ...(allowMoreTags ?? [])];
    case 'none':
      return allowMoreTags ?? [];
    case 'strict':
      return [...allowedHTMLTagsStrict, ...(allowMoreTags ?? [])];
  }
};

/**
 * Returns true if the URL is valid.
 *
 * @param url The URL to validate.
 */
export const isURLValid = (url: string): boolean =>
  OFFSITE_URL_REGEX.test(url) || ONSITE_URL_REGEX.test(url);
