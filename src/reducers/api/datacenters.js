import { UPDATE_DATACENTER, UPDATE_DATACENTERS } from '~/actions/api/datacenters';
import makeApiList from '~/api-store';

export default makeApiList('datacenters', 'datacenter', {
  update_single: UPDATE_DATACENTER,
  update_many: UPDATE_DATACENTERS,
});
