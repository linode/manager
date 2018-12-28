import { compose, filter, join, map } from 'ramda';

export interface LabelOptions {
  image?: string | null;
  region?: string | null;
  type?: string | null;
  backup?: string | null;
  stackScript?: string | null;
}

export const deriveDefaultLabel = (options: LabelOptions): string => {
  const { image, backup, region, type, stackScript } = options;

  // TODO: map to custom ID abbreviations

  const values = [image, backup, region, type, stackScript];

  return compose(
    join('-'),
    map<string, string>(s => s.toLowerCase()),
    // @todo: clamp to prevent going over char limit
    filter(Boolean) // Some params might be null or undefined, so filter those out
  )(values);
}

export default deriveDefaultLabel;
