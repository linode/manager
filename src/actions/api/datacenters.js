import { make_fetch_page } from '~/api-store';

export const UPDATE_DATACENTERS = '@@datacenters/UPDATE_DATACENTERS';

export const fetchDatacenters = make_fetch_page(
    UPDATE_DATACENTERS, "datacenters");
