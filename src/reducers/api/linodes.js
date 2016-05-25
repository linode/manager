import {
    UPDATE_LINODES, UPDATE_LINODE,
    DELETE_LINODE,
} from '~/actions/api/linodes';
import makeApiList from '~/api-store';

export default makeApiList('linodes', 'linode', {
  update_singular: UPDATE_LINODE,
  update_many: UPDATE_LINODES,
  delete_one: DELETE_LINODE,
});
