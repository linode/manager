import { types } from './types';

const extendTypes = () => {
  return types.map(type => {
    return {
      ...type,
      heading: 'test',
      subHeadings: ['test', 'test'] as [string, string]
    };
  });
};

export const extendedTypes = extendTypes();
