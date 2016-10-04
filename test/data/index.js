import _ from 'lodash';
import reducer from '~/reducers';
import deepFreeze from 'deep-freeze';

import { linodes } from './linodes';
import { distros } from './distros';
import { datacenters } from './datacenters';
import { types } from './types';
import { kernels } from './kernels';

function fakeAPIStore(data, singular, plural) {
  const totalResults = Object.keys(data).length;
  const totalPages = Math.floor(totalResults / 25) + 1;
  return {
    totalPages,
    totalResults,
    pagesFetched: _.range(1, totalPages),
    singular,
    plural,
  };
}

export const authentication = { token: 'token' };
export const api = {
  linodes: {
    ...fakeAPIStore(linodes, 'linode', 'linodes'),
    linodes,
  },
  distributions: {
    ...fakeAPIStore(distros, 'distribution', 'distributions'),
    distributions: distros,
  },
  datacenters: {
    ...fakeAPIStore(datacenters, 'datacenter', 'datacenters'),
    datacenters,
  },
  types: {
    ...fakeAPIStore(types, 'type', 'types'),
    types,
  },
  kernels: {
    ...fakeAPIStore(kernels, 'kernel', 'kernels'),
    kernels,
  },
};

export const state = deepFreeze({
  authentication,
  api,
  linodes: {
    index: {
      view: 'grid',
      selected: [],
    },
    detail: {
      index: {
        editing: false,
        label: 'test',
        group: 'test',
        loading: false,
      },
    },
  },
});

export const freshState = reducer(undefined, { });
