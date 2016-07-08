import { UPDATE_SERVICES } from '~/actions/api/services';
import makeApiList from '~/api-store';

export default makeApiList({
  singular: 'service',
  plural: 'services',
  actions: { update_many: UPDATE_SERVICES },
});
