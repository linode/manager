import { UPDATE_DISTROS } from '~/actions/api/distros';
import makeApiList from '~/api-store';

export default makeApiList('distributions', 'distribution', {
  update_many: UPDATE_DISTROS,
});
