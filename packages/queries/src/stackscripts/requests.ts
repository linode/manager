import { getStackScripts } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { Params, StackScript } from '@linode/api-v4';

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

export const getAllOCAsRequest = (passedParams: Params = {}) =>
  getAll<StackScript>((params) =>
    getOneClickApps({ ...params, ...passedParams })
  )().then((data) => data.data);

export const getAllAccountStackScripts = () =>
  getAll<StackScript>((params) =>
    getStackScripts(params, { mine: true })
  )().then((data) => data.data);
