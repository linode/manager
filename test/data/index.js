import _ from 'lodash';
import reducer from '~/reducers';
import deepFreeze from 'deep-freeze';

import { linodes } from './linodes';
import { distributions } from './distributions';
import { datacenters } from './datacenters';
import { types } from './types';
import { kernels } from './kernels';
import { dnszones } from './dnszones';
import { events } from './events';
import { clients } from './clients';
import { tokens } from './tokens';

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

export const api = (apiObjects => {
  const _api = {};
  apiObjects.forEach(([object, singular, plural]) => {
    _api[plural] = {
      ...fakeAPIStore(object, singular, plural),
      [plural]: object,
    };
  });
  return _api;
})([
  [linodes, 'linode', 'linodes'],
  [distributions, 'distribution', 'distributions'],
  [datacenters, 'datacenter', 'datacenters'],
  [types, 'type', 'types'],
  [kernels, 'kernel', 'kernels'],
  [dnszones, 'dnszone', 'dnszones'],
  [events, 'event', 'events'],
  [clients, 'client', 'clients'],
  [tokens, 'token', 'tokens'],
]);

export const state = deepFreeze({
  authentication,
  api,
  source: { source: 'foobar.html' },
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
