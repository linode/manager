import _ from 'lodash';

import {
  TOGGLE_SELECTED,
} from '~/actions/select';


export default function select(_state = null, action) {
  const state = _state === null ? {
    selected: {},
  } : _state;

  switch (action.type) {
    case TOGGLE_SELECTED: {
      const { selectedIds = [], objType } = action;
      const selectedMap = { ...state.selected[objType] };
      const toggledMap = _.zipObject(selectedIds, _.fill(Array(selectedIds.length), true));

      // merge toggled state
      Object.keys(toggledMap).map(function (id) {
        if (selectedMap[id]) {
          // toggle off by removing from selected map
          delete selectedMap[id];
        } else {
          // toggle on by including in the selected map
          selectedMap[id] = true;
        }
      });

      return {
        ...state,
        selected: {
          ...state.selected,
          [objType]: selectedMap,
        },
      };
    }
    default:
      return state;
  }
}

