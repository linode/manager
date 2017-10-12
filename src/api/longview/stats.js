import { LONGVIEW_ROOT } from '~/constants';
import { rawFetch } from '~/fetch';
import { gatherOptions } from '~/api/fetch';
import { actions } from '~/api/generic/lvclients';


function fetch(method, url, body, headers) {
  return async function (dispatch, getState) {
    const options = gatherOptions(undefined, method, body, headers);
    const path = LONGVIEW_ROOT + url;

    return new Promise((accept, reject) => {
      rawFetch(path, options).then(async (response) => {
        const { status } = response;
        if (status >= 400) {
          reject(response);
        } else {
          const json = await response.json();
          accept(json);
        }
      }, reject);
    });
  };
}

export function get(id, body, headers = {}) {
  // TODO: replace url with real Longview API url
  const stats = await dispatch(fetch('GET', `/clients/${id}/stats`, headers));
  dispatch(actions.on({ _stats: stats }, id));
}
