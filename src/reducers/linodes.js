import {
    UPDATE_LINODES, UPDATE_LINODE,
    LINODE_RECOVER
} from '../actions/linodes';

const default_state = {
    pagesFetched: [],
    totalPages: -1,
    linodes: { }
};

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
                ...response.linodes.reduce((s, l) => ({ ...s, [l.id]: l }), { })
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
    default:
        return state;
    }
}
