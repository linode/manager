import { types } from './types';

const extendTypes = () => {
  return types.map(type => ({
    ...type,
    heading: 'test',
    subHeadings: ['test', 'test'] as [string, string]
  }));
};

export const extendedTypes = extendTypes();
