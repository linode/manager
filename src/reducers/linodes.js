import { UPDATE_LINODES } from '../actions/linodes';

const default_state = {
    localPage: -1,
    remotePage: 0,
    loading: false,
    linodes: []
};

export default function linodes(state=default_state, action) {
    switch (action.type) {
    case UPDATE_LINODES:
        const { response } = action;
        return {
            ...state,
            localPage: response.page,
            remotePage: response.page,
            linodes: response.linodes
        };
    default:
        return state;
    }
}
