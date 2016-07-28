import { makeFetchPage } from '~/api-store';

export const UPDATE_DISTROS = '@@distributions/UPDATE_DISTROS';

export const fetchDistros = makeFetchPage(
    UPDATE_DISTROS, 'distributions');
