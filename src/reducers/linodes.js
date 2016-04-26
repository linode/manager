import {
    UPDATE_LINODES, UPDATE_LINODE,
    DELETE_LINODE
} from '../actions/linodes';
import _ from 'underscore';

const default_state = {
    pagesFetched: [],
    totalPages: -1,
    linodes: { }
};

function transform(linode) {
    return {
        _polling: false,
        ...linode
    };
}

export default function linodes(state=default_state, action) {
    switch (action.type) {
    case UPDATE_LINODES:
        const { response } = action;
        return {
            ...state,
            pagesFetched: [...state.pagesFetched.filter(p => p !== response.page), response.page],
            totalPages: response.total_pages,
            linodes: {
                ...state.linodes,
                ...response.linodes.reduce((s, l) =>
                  ({ ...s, [l.id]: transform(l) }), { })
            }
        };
    case UPDATE_LINODE:
        const { linode } = action;
        return {
            ...state,
            linodes: {
                ...state.linodes,
                [linode.id]: { ...state.linodes[linode.id], ...linode }
            }
        };
    case DELETE_LINODE:
        const { id } = action;
        return {
            ...state,
            linodes: _.omit(state.linodes, id)
        };
    default:
        return state;
    }
}
