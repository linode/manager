import { resetEventsPoll } from '~/actions/events';
import { API_ROOT } from '~/constants';
import LinodeAPI from '~/LinodeAPI';
import { expire } from '~/session';
import { store } from '~/store';

const request = new LinodeAPI(API_ROOT);

/*
Interceptor that restarts Event polling on data-modifying requests
*/
request.interceptors.request.use((config) => {
  if (['put', 'post', 'delete'].indexOf(config.method.toLowerCase()) !== -1) {
    store.dispatch(resetEventsPoll());
  }
  return config;
});

/*
Interceptor that initiates re-authentication if:
  * The response is HTTP 401 "Unauthorized"
  * The API is in Maintainence mode

Also rejects non-error responses if the API is in Maintainence mode
*/
request.interceptors.response.use(
  (response) => {
    if (!!response.headers['x-maintenance-mode']) {
      store.dispatch(expire);
      Promise.reject(response);
    }

    return response;
  },
  (error) => {
    if (!!error.config.headers['x-maintenance-mode']
        || error.response.status === 401) {
      store.dispatch(expire);
    }
    return Promise.reject(error);
  }
);

export default new LinodeAPI(API_ROOT);

