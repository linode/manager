import {
  PRELOAD_RESET,
  PRELOAD_START,
  PRELOAD_STOP
} from '../actions/preload_indicator.js';

const defaultState = {
  mode: 'reset',
};

export default function preload_indicator(state = defaultState, action) {
  switch (action.type) {
    case PRELOAD_RESET:
      return { ...state, mode: 'reset' };
    case PRELOAD_START:
      return { ...state, mode: 'running' };
    case PRELOAD_STOP:
      return { ...state, mode: 'done' };
    default:
      return { ...state };
  }
}
