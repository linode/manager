import _ from 'lodash';
import reducer from '~/reducers';

import { linodes } from './linodes';
import { distros } from './distros';
import { datacenters } from './datacenters';
import { services } from './services';

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
  services: {
    ...fakeAPIStore(services, 'service', 'services'),
    services,
  },
};

export const state = {
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
};

export const freshState = reducer(undefined, { });
