import { UPDATE_DISTROS } from '~/actions/api/distros';
import make_api_list from '~/api-store';

export default make_api_list('distributions', 'distribution', {
  update_many: UPDATE_DISTROS,
});
