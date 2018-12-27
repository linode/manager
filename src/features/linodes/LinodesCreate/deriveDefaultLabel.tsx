import { compose, filter, join } from 'ramda';

export interface LabelOptions {
  image?: string | null;
  region?: string | null;
  type?: string | null;
  stackScript?: string | null;
}

export const deriveDefaultLabel = (options: LabelOptions): string => {
  const { image, region, type, stackScript } = options;

  // TODO: map to custom ID abbreviations

  const values = [image, region, type, stackScript];

  return compose(
    join('-'),
    filter(Boolean) // Some params might be null or undefined, so filter those out
  )(values);
}

export default deriveDefaultLabel;
