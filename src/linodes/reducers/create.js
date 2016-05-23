import {
  CHANGE_SOURCE_TAB,
  TOGGLE_ALL_PLANS,
  SELECT_SOURCE,
  SELECT_DATACENTER,
  SELECT_SERVICE,
  SET_LABEL,
  GENERATE_PASSWORD,
  TOGGLE_SHOW_PASSWORD,
  TOGGLE_CREATING,
  CLEAR_FORM
} from '../actions/create';

const default_state = {
  sourceTab: 0,
  showAllPlans: false,
  password: null,
  showPassword: false,
  creating: false,
  label: null,
  source: null,
  datacenter: null,
  service: null
};

export default function linodeCreation(state=default_state, action) {
  switch (action.type) {
    case CHANGE_SOURCE_TAB:
      return { ...state, sourceTab: action.tab };
    case TOGGLE_ALL_PLANS:
      return { ...state, showAllPlans: !state.showAllPlans };
    case SELECT_SOURCE:
      return { ...state, source: action.source };
    case SELECT_DATACENTER:
      return { ...state, datacenter: action.datacenter };
    case SELECT_SERVICE:
      return { ...state, service: action.service };
    case SET_LABEL:
      return { ...state, label: action.label };
    case GENERATE_PASSWORD:
      return {
        ...state,
        password: (() => {
          const chars = "0123456789abcdefghijklmnopqrstuvwxyz" +
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          const len = 20;
          let pw = "";
          for (let i = 0; i < len; i++) {
            pw += chars.charAt(Math.floor(
              Math.random() * chars.length));
          }
          return pw;
        })()
      };
    case TOGGLE_SHOW_PASSWORD:
      return {
        ...state,
        showPassword: !state.showPassword
      };
    case TOGGLE_CREATING:
      return {
        ...state,
        creating: !state.creating
      };
    case CLEAR_FORM:
      return default_state;
    default:
      return state;
  }
}
