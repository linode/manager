import _ from 'lodash';

import {
  TOGGLE_SELECTED,
} from '~/actions/select';

/**
 * Reduces toggleSelect actions for any checked state stored in Redux.
 * Associates checked state with an objectType, e.g. linodes
 *
 * Redux State Structure:
 *
 * {
 *    select: {
 *      selected: {
 *        [objectType]: {
 *          [id]: true
 *          ...
 *        }
 *        ...
 *      }
 *    }
 * }
 *
 * Access in mapStateToProps:
 *
 * state.select.selected[OBJECT_TYPE]
 *
 * @param {Object} _state
 * @param {Object} action
 * @returns {Object} state
 */
export default function select(_state = null, action) {
  const state = _state === null ? {
    selected: {},
  } : _state;

  switch (action.type) {
    case TOGGLE_SELECTED: {
      const { selectedIds = [], objectType } = action;
      const selectedMap = { ...state.selected[objectType] };
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
          [objectType]: selectedMap,
        },
      };
    }
    default:
      return state;
  }
}
