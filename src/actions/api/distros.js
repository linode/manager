import { makeFetchPage, makeFetchAll } from '~/api-store';

export const UPDATE_DISTROS = '@@distributions/UPDATE_DISTROS';

export const fetchDistros = makeFetchPage(
    UPDATE_DISTROS, 'distributions');

export const fetchAllDistros = makeFetchAll(
    fetchDistros, 'distributions');
