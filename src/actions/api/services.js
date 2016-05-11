import { make_fetch_page } from '~/api-store';

export const UPDATE_SERVICES = '@@services/UPDATE_SERVICES';

export const fetchServices = make_fetch_page(
    UPDATE_SERVICES, "services");
