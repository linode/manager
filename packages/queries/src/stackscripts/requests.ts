import { getStackScripts } from '@linode/api-v4';

import type { Params } from '@linode/api-v4';

const oneClickFilter = [
  {
    '+and': [
      { '+or': [{ username: 'linode-stackscripts' }, { username: 'linode' }] },
      {
        label: {
          '+contains': 'One-Click',
        },
      },
    ],
    '+order_by': 'ordinal',
  },
];

export const getOneClickApps = (params?: Params) =>
  getStackScripts(params, oneClickFilter);
