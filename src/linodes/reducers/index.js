import { combineReducers } from 'redux';
import _ from 'underscore';
import { getStorage, setStorage } from '~/storage';
import create from './create';

import {
  CHANGE_VIEW,
  TOGGLE_SELECTED
} from '../actions/index';

const view = getStorage("linodes/view") || "grid";

const default_state = {
  view,
  selected: { } // set
};

const array_to_set = arr => arr.reduce((s, v) => ({ ...s, [v]: true }), { });

export function index(state=default_state, action) {
  switch (action.type) {
  case CHANGE_VIEW:
    const { view } = action;
    setStorage("linodes/view", view);
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
