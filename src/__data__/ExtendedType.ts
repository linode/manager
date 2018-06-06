import { types } from './types';

const extendType = () => {
  return types.map((type) => {
    return {
      ...type,
      heading: 'test',
      subHeadings: ['test', 'test'] as [string, string],
    };
  });
};

export const ExtendedType = extendType();
