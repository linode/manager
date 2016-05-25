import { UPDATE_SERVICES } from '~/actions/api/services';
import makeApiList from '~/api-store';

export default makeApiList('services', 'service', {
  update_many: UPDATE_SERVICES,
});
