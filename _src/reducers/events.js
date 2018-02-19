import { RESET_EVENTS_POLL } from '~/actions/events';


const defaultState = { eventTriggeringRequests: 0 };

export default function events(state = defaultState, action) {
  switch (action.type) {
    case RESET_EVENTS_POLL:
      return { eventTriggeringRequests: state.eventTriggeringRequests + 1 };
    default:
      return { ...state };
  }
}
