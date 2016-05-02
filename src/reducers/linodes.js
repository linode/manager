import {
    UPDATE_LINODES, UPDATE_LINODE,
    DELETE_LINODE
} from '../actions/linodes';
import make_api_list from '~/api-store';

function transform(linode) {
    return {
        _polling: false,
        ...linode
    };
}

export default make_api_list("linodes", "linode", {
    update_single: UPDATE_LINODE,
    update_many: UPDATE_LINODES,
    delete_one: DELETE_LINODE
}, transform);
