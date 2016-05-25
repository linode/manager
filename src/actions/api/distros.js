import { make_fetch_page } from '~/api-store';

export const UPDATE_DISTROS = '@@distros/UPDATE_DISTROS';

export const fetchDistros = make_fetch_page(
    UPDATE_DISTROS, 'distributions');
