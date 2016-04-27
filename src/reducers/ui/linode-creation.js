import { CHANGE_SOURCE_TAB, SELECT_DISTRO } from '~/actions/ui/linode-creation';

const default_state = {
    source: {
        tab: 0,
        distro: null
    }
};

export default function linodeCreation(state=default_state, action) {
    switch (action.type) {
    case CHANGE_SOURCE_TAB:
        return {
            ...state,
            source: {
                ...state.source,
                tab: action.tab
            }
        };
    case SELECT_DISTRO:
        return {
            ...state,
            source: {
                ...state.source,
                distro: action.distro
            }
        };
        break;
    default:
        return state;
    }
}
