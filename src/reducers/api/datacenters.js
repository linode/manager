import { UPDATE_DATACENTER, UPDATE_DATACENTERS } from '~/actions/api/datacenters';
import make_api_list from '~/api-store';

export default make_api_list("datacenters", "datacenter", {
    update_single: UPDATE_DATACENTER,
    update_many: UPDATE_DATACENTERS
});
