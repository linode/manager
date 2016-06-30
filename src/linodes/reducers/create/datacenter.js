import { SELECT_DATACENTER } from '../../actions/create/datacenter';

const defaultState = {
  datacenter: null,
};

export default function datacenter(state = defaultState, action) {
  switch (action.type) {
    case SELECT_DATACENTER:
      return { ...state, datacenter: action.datacenter };
    default:
      return state;
  }
}
