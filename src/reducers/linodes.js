import { UPDATE_LINODES } from '../actions/linodes';

const default_state = {
    page: -1,
    linodes: []
};

export default function linodes(state=default_state, action) {
    switch (action.type) {
    case UPDATE_LINODES:
        const { response } = action;
        return {
            ...state,
            page: response.page,
            linodes: response.linodes
        };
    default:
        return state;
    }
}
