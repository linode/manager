import { compose, filter, join, map } from 'ramda';

// Set this at 28, so we can leave room for a dash and zero-padding (width: 3) if needed
const MAX_LABEL_LENGTH = 28;

// Only alpha-numeric chars, dashes, and underscores allowed by the API
const labelRegex = /[^a-zA-Z0-9-_]/g;

export type LabelArgTypes = string | null | undefined;

export const deriveDefaultLabel = (...args: LabelArgTypes[]): string => {
  const filtered = filter(Boolean)(args);
  const cleaned = map((s: string) => s.replace(labelRegex, '').toLowerCase())(
    filtered
  );

  const withDash = join('-');

  if (withDash(cleaned).length <= MAX_LABEL_LENGTH) {
    return compose(
      ensureSingleDashesAndUnderscores,
      withDash
    )(cleaned);
  }

  // If the length will be more than MAX_LABEL_LENGTH, we'll need to do some calculation and clamp each section
  const numDashes = filtered.length - 1;
  const maxSectionLength = Math.floor(
    (MAX_LABEL_LENGTH - numDashes) / filtered.length
  );

  return compose(
    ensureSingleDashesAndUnderscores,
    withDash,
    map((s: string) => s.slice(0, maxSectionLength))
  )(cleaned);
};

export default deriveDefaultLabel;

// The API doesn't allow double dashes or underscores. Just in case joining the param
// sections of the derived label name results in this, we need to do one final 'replace';
export const ensureSingleDashesAndUnderscores = (s: string) => {
  return s.replace(/--/g, '-').replace(/__/g, '_');
};
