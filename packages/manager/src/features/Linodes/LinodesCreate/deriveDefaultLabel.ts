import { compose, filter, join, map } from 'ramda';

// Set this at 28, so we can leave room for a dash and zero-padding (width: 3) if needed
const MAX_LABEL_LENGTH = 28;

// Only alpha-numeric chars, dashes, and underscores allowed by the API
const labelRegex = /[^a-zA-Z0-9-_]/g;

export type LabelArgTypes = null | string | undefined;

export const deriveDefaultLabel = (
  parts: LabelArgTypes[],
  existingLabels: string[]
): string => {
  return dedupeLabel(generateBaseLabel(parts), existingLabels);
};

const generateBaseLabel = (parts: LabelArgTypes[]) => {
  const filtered = filter(Boolean)(parts);
  const cleaned = map((s: string) => s.replace(labelRegex, '').toLowerCase())(
    filtered as string[]
  );

  const withDash = join('-');

  if (withDash(cleaned).length <= MAX_LABEL_LENGTH) {
    return compose(ensureSingleDashesAndUnderscores, withDash)(cleaned);
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

// The API doesn't allow double dashes or underscores. Just in case joining the param
// sections of the derived label name results in this, we need to do one final 'replace';
const ensureSingleDashesAndUnderscores = (s: string) => {
  return s.replace(/--/g, '-').replace(/__/g, '_');
};

// Searches 'existingLabels' and appends a zero-padded increment-er to the original label
const dedupeLabel = (label: string, existingLabels: string[]): string => {
  const ZERO_PAD_WIDTH = 3;

  let dedupedLabel = label;
  let i = 1;

  const matchingLabels = existingLabels.filter((l) => l.startsWith(label));
  const findMatchingLabel = (l: string) => {
    return l === dedupedLabel;
  };

  while (matchingLabels.find(findMatchingLabel)) {
    dedupedLabel = label + '-' + i.toString().padStart(ZERO_PAD_WIDTH, '0');
    i++;

    // EDGE CASE: if a user has 999 iterations of the same name (arch-us-east-001, arch-us-east-002, ...)
    // just return the original label. They'll get an API error.
    if (i === 999) {
      return label;
    }
  }
  return dedupedLabel;
};
