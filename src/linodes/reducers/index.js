import { combineReducers } from 'redux';
import _ from 'lodash';
import { getStorage, setStorage } from '~/storage';

import {
  CHANGE_VIEW,
  TOGGLE_SELECTED,
} from '../actions/index';

const arrayToSet = arr => arr.reduce((s, v) => ({ ...s, [v]: true }), { });

export function index(_state = null, action) {
  const state = _state === null ? {
    view: getStorage('linodes/view') || 'grid',
    selected: { },
  } : _state;

  switch (action.type) {
    case CHANGE_VIEW: {
      const { view } = action;
      setStorage('linodes/view', view);
      return { ...state, view };
    }
    case TOGGLE_SELECTED: {
      const { selected } = action;
      const newSelections = _.omit.apply(this, [
        arrayToSet(selected), ...Object.keys(state.selected),
      ]);
      const persistentSelections = _.omit.apply(this, [
        state.selected, ...selected,
      ]);
      return {
        ...state,
        selected: {
          ...persistentSelections,
          ...newSelections,
        },
      };
    }
    default:
      return state;
  }
}

export default combineReducers({ index });
