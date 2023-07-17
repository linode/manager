import { LinodeType } from '@linode/api-v4';

import { extendType } from 'src/utilities/extendType';
import types from 'src/utilities/types.json';

const _types = types.data as LinodeType[];

export const extendedTypes = _types.map(extendType);
