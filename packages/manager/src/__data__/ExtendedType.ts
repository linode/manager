import types from 'src/utilities/types.json';
import { LinodeType } from '@linode/api-v4';

const _types = types.data as LinodeType[];

const extendTypes = () => {
  return _types.map((type) => {
    return {
      ...type,
      heading: 'test',
      subHeadings: ['test', 'test', 'test', 'test'] as string[],
      isDeprecated: false,
    };
  });
};

export const extendedTypes = extendTypes();
