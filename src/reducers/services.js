import { UPDATE_SERVICES } from '../actions/services';
import make_api_list from '~/api-store';

export default make_api_list("services", "service", {
    update_many: UPDATE_SERVICES
});
