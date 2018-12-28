import { compose, filter, join, map } from 'ramda';

const API_MAX_LABEL_LENGTH = 32;

export type LabelArgTypes = string | null | undefined;

export const deriveDefaultLabel = (...args: LabelArgTypes[]): string => {

  // Some params might be null or undefined, so filter those out
  const filtered = filter(Boolean)(args);

  // Max string length of each param. If we have to cut down the string because it's over
  // the API limit, we cut each param down, rather
  const maxLength = Math.floor(API_MAX_LABEL_LENGTH / filtered.length);

  return compose(
    ensureSingleDashesAndUnderscores,
    join('-'),
    map((s: string) => {
      return s.replace(/[^a-zA-Z0-9-_]/g, '')
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