import { makeFetchPage, makeFetchAll } from '~/api-store';

export const UPDATE_DISTROS = '@@distributions/UPDATE_DISTROS';

export const distroConfig = {
  singular: 'distribution',
  plural: 'distributions',
  actions: { updateItems: UPDATE_DISTROS },
};

export const fetchDistros = makeFetchPage(distroConfig);
export const fetchAllDistros = makeFetchAll(distroConfig, fetchDistros);
