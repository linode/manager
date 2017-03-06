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

function calculateTotalResults(data) {
  return Object.keys(data).length;
}

function calculateTotalPages(totalResults) {
  return totalResults > 0 ? Math.floor(totalResults / 25) + 1 : 1;
}

export function fakeAPIStore(data, singular, plural, totalResults = 0, totalPages = 0) {
  const calculatedTotalResults = totalResults || calculateTotalResults(data);
  const calculatedTotalPages = totalPages || calculateTotalPages(totalResults);
  const ids = Object.values(data).map((obj) => obj.id);

  return {
    totalPages: calculatedTotalPages,
    totalResults: calculatedTotalResults,
    pagesFetched: _.range(1, totalPages),
    singular,
    plural,
    ids,
  };
}

export function fakeAPI(apiObjects) {
  const _api = {};
  apiObjects.forEach(([object, singular, plural, totalPages]) => {
    _api[plural] = {
      ...fakeAPIStore(object, singular, plural, totalPages),
      [plural]: object,
    };
  });
  return _api;
}

export const authentication = { token: 'token' };

export const api = fakeAPI([
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
