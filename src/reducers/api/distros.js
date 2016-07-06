import { UPDATE_DISTROS } from '~/actions/api/distros';
import makeApiList from '~/api-store';

export default makeApiList({
  singular: 'distribution',
  plural: 'distributions',
  actions: { update_many: UPDATE_DISTROS },
});
