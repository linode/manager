import {
  PRELOAD_RESET,
  PRELOAD_START,
  PRELOAD_STOP,
} from '../actions/preloadIndicator.js';

const defaultState = {
  mode: 'reset',
};

export default function preloadIndicator(state = defaultState, action) {
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
