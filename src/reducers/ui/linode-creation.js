import { CHANGE_SOURCE_TAB } from '../../actions/ui/linode-creation';

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
    default:
        return state;
    }
}
