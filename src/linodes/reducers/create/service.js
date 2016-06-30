import { SELECT_SERVICE } from '../../actions/create/service';

const defaultState = {
  service: null,
};

export default function service(state = defaultState, action) {
  switch (action.type) {
    case SELECT_SERVICE:
      return { ...state, service: action.service };
    default:
      return state;
  }
}
