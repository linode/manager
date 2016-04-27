import {
  CHANGE_SOURCE_TAB,
  SELECT_SOURCE,
  SELECT_DATACENTER
} from '~/actions/ui/linode-creation';

const default_state = {
    sourceTab: 0,
    source: null,
    datacenter: null,
    service: null
};

export default function linodeCreation(state=default_state, action) {
    switch (action.type) {
    case CHANGE_SOURCE_TAB:
        return {
            ...state,
            sourceTab: action.tab
        };
    case SELECT_SOURCE:
        return {
            ...state,
            source: action.source
        };
        break;
    case SELECT_DATACENTER:
        return {
            ...state,
            datacenter: action.datacenter
        };
        break;
    default:
        return state;
    }
}
