import { UPDATE_LINODES, UPDATE_LINODE, LINODE_PENDING } from '../actions/linodes';

const default_state = {
    localPage: -1,
    remotePage: 0,
    loading: false,
    linodes: []
};

function transformLinode(linode, oldLinode={}) {
    return {
        _pending: false,
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
            localPage: response.page,
            remotePage: response.page,
            linodes: response.linodes.map(transformLinode)
        };
    case UPDATE_LINODE:
        const linode = action.response;
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
    case LINODE_PENDING:
    {
        const { linode, pending } = action;
        return {
            ...state,
            linodes: state.linodes.map(l => {
                if (l.id !== linode.id) {
                    return l;
                }
                return { ...l, _pending: pending };
            })
        };
    }
    default:
        return state;
    }
}
