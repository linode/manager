import { combineReducers } from 'redux';
import create from './create';
import _ from 'underscore';

import {
  CHANGE_VIEW,
  TOGGLE_SELECTED
} from '../actions/index';

const default_state = {
  view: "grid",
  selected: { } // set
};

const array_to_set = arr => arr.reduce((s, v) => { s[v] = true; return s }, { });

export function index(state=default_state, action) {
  switch (action.type) {
  case CHANGE_VIEW:
    const { view } = action;
    return { ...state, view };
  case TOGGLE_SELECTED:
    const { selected } = action;
    const new_selections = _.omit.apply(this, [
      array_to_set(selected), ...Object.keys(state.selected)
    ]);
    const persistent_selections = _.omit.apply(this, [
      state.selected, ...selected
    ]);
    return {
      ...state,
      selected: {
        ...persistent_selections,
        ...new_selections
      }
    };
  default:
    return state;
  }
}

const rootReducer = combineReducers({
  index,
  create
});

export default rootReducer;
