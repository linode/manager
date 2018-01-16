import LinodeAPI from './LinodeAPI';
import { API_ROOT } from '~/constants';
import { getStorage } from '~/storage';
import { AUTH_TOKEN } from '~/session';

/*
To think about:
* Can we rely on this token already being in local storage?
    - See store.dispatch(session.initialize); in '~/index.js'
    - See '~/session.js'
* Should we decouple session.js from Redux entirely?
*/
const token = getStorage(AUTH_TOKEN);

/*
* Do we re-initialize the apiWrapper on session expiry?
* Do we initialize the API wrapper with session expiry time so that it can
attempt to re-authenticate?
*/
const apiWrapper = new LinodeAPI(API_ROOT, token);

export default apiWrapper;
