import { types } from './types';

const extendTypes = () => {
  return types.map((type) => {
    return {
      ...type,
      heading: 'test',
      subHeadings: ['test', 'test', 'test'] as [string, string, string],
      isDeprecated: false,
    };
  });
};

export const extendedTypes = extendTypes();
