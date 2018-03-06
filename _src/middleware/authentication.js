/**
 * @description Anytime SET_TOKEN or LOGOUT are dispatched, an
 * angel gets it's wings, and we update the token in of the request
 * instance.
 *
 */
import { SET_TOKEN, LOGOUT } from '~/actions/authentication';
import request from '~/request';
import debug from 'debug';
const log = debug('manager:authentication');

// eslint-disable-next-line no-unused-vars
export default (store) => (next) => (action) => {
  if (action.type === SET_TOKEN) {
    log('Updating authentication token.', action.token);
    request.key = action.token;
  }

  if (action.type === LOGOUT) {
    log('Removing authentication token.');
    request.key = null;
  }

  return next(action);
};
