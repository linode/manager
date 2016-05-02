import {
    UPDATE_LINODES, UPDATE_LINODE,
    DELETE_LINODE
} from '../actions/linodes';
import make_api_list from '~/api-store';

export default make_api_list("linodes", "linode", {
    update_single: UPDATE_LINODE,
    update_many: UPDATE_LINODES,
    delete_one: DELETE_LINODE
});
