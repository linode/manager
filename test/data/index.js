import _ from 'lodash';
import reducer from '~/reducers';
import deepFreeze from 'deep-freeze';

import { linodes } from './linodes';
import { distributions } from './distributions';
import { regions } from './regions';
import { types } from './types';
import { kernels } from './kernels';
import { domains } from './domains';
import { nodebalancers } from './nodebalancers';
import { events } from './events';
import { clients } from './clients';
import { tokens } from './tokens';
import { users } from './users';
import { tickets } from './tickets';

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
  [regions, 'region', 'regions'],
  [types, 'type', 'types'],
  [kernels, 'kernel', 'kernels'],
  [domains, 'domain', 'domains'],
  [nodebalancers, 'nodebalancer', 'nodebalancers'],
  [events, 'event', 'events'],
  [clients, 'client', 'clients'],
  [tokens, 'token', 'tokens'],
  [users, 'user', 'users'],
  [tickets, 'ticket', 'tickets'],
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
