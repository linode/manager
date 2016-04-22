import {
    UPDATE_LINODES, UPDATE_LINODE,
    LINODE_RECOVER
} from '../actions/linodes';

const default_state = {
    pagesFetched: [],
    totalPages: -1,
    linodes: []
};

const client_extensions = {
    _recovering: false
};

function transformLinode(linode, oldLinode={}) {
    return {
        ...client_extensions,
        ...oldLinode,
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
            linodes: response.linodes.map(transformLinode)
        };
    case UPDATE_LINODE:
        const { linode } = action;
        if (state.linodes.find(l => l.id == linode.id)) {
            return {
                ...state,
                linodes: state.linodes.map(l => {
                    if (l.id !== linode.id) {
                        return l;
                    }
                    return transformLinode(linode, l);
                })
            };
        } else {
            return {
                ...state,
                linodes: [
                    ...state.linodes,
                    linode
                ]
            };
        }
    case LINODE_RECOVER:
    {
        const { linode, recovering } = action;
        return {
            ...state,
            linodes: state.linodes.map(l => {
                if (l.id !== linode.id) {
                    return l;
                }
                return { ...l, _recovering: recovering };
            })
        };
    }
    default:
        return state;
    }
}
