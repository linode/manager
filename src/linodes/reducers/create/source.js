import {
  CHANGE_SOURCE_TAB,
  SELECT_SOURCE,
} from '../../actions/create/source';

const defaultState = {
  sourceTab: 0,
  source: null,
};

export default function source(state = defaultState, action) {
  switch (action.type) {
    case CHANGE_SOURCE_TAB:
      return { ...state, sourceTab: action.tab };
    case SELECT_SOURCE:
      return { ...state, source: action.source };
    default:
      return state;
  }
}
