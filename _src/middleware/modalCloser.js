import { store } from '~/store';
import { hideModal } from '~/actions/modal';

// eslint-disable-next-line no-unused-vars
export default (state) => (next) => (action) => {
  next(action);
  if (action.type === '@@router/LOCATION_CHANGE') {
    store.dispatch(hideModal());
  }
};
