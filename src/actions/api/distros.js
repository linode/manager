import { makeFetchPage } from '~/api-store';

export const UPDATE_DISTROS = '@@distros/UPDATE_DISTROS';

export const fetchDistros = makeFetchPage(
    UPDATE_DISTROS, 'distributions');
