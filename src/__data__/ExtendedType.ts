import { types } from './types';

export const ExtendedType = () => {
  return types.map((type) => {
    return {
      ...type,
      heading: 'test',
      subHeadings: ['test', 'test'] as [string, string],
    };
  });
};
