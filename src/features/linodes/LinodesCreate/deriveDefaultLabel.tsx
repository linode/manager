import { compose, filter, join, map } from 'ramda';

// Set this at 29, so we can leave room for zero-padding if needed
const MAX_LABEL_LENGTH = 29;

export type LabelArgTypes = string | null | undefined;

export const deriveDefaultLabel = (...args: LabelArgTypes[]): string => {

  // Some params might be null or undefined, so filter those out
  const filtered = filter(Boolean)(args);

  // Max string length of each param. If we have to cut down the string because it's over
  // the API limit, we chop each param, rather than chopping the string as a whole
  const maxLength = Math.floor(MAX_LABEL_LENGTH / filtered.length);

  return compose(
    ensureSingleDashesAndUnderscores,
    join('-'),
    map((s: string) => {
      return s.replace(/[^a-zA-Z0-9-_]/g, '') // Only alpha-numeric chars, dashes, and underscores allowed by the API
        .slice(0, maxLength)
        .toLowerCase()
    }),
  )(filtered);
}

export default deriveDefaultLabel;

// The API doesn't allow double dashes or underscores. Just in case joining the param
// sections of the derived label name results in this, we need to do one final 'replace';
export const ensureSingleDashesAndUnderscores = (s: string) => {
  return s.replace(/--/g, '-').replace(/__/g, '_');
}