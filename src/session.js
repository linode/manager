import store from '~/store';
import { APP_ROOT, LOGIN_ROOT } from './constants';
import { clientId } from './secrets';

export default function checkLogin(next) {
  const state = store.getState();
  if (next.location.pathname !== '/oauth/callback'
      && state.authentication.token === null) {
    const query = Object.keys(next.location.query)
            .reduce((a, k) => [
              ...a,
              `${k}=${encodeURIComponent(next.location.query[k])}`,
            ], []).join('%26');
    /* eslint-disable prefer-template */
    window.location = `${LOGIN_ROOT}/oauth/authorize?` +
      `client_id=${clientId}` +
      '&scopes=*' +
      `&redirect_uri=${encodeURIComponent(APP_ROOT)}/oauth/callback?return=` +
            encodeURIComponent(next.location.pathname + (query ? '%3F' + query : ''));
    /* eslint-enable prefer-template */
  }
}
