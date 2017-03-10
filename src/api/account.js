import { fetch } from '~/fetch';

function profileAction(action, body, handleRsp) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const rsp = await fetch(token, `/account/profile/${action}`, { method: 'POST', body });
    if (handleRsp) {
      dispatch(handleRsp(await rsp.json()));
    }
  };
}

export function profilePassword(config = null) {
  return profileAction('password', JSON.stringify(config));
}
/*
export const accountSettings = {
  get: function() {
    return async (dispatch, getState) => {
      const state = getState();
      const { token } = state.authentication;
      const rsp = await fetch(token, '/account/settings');
      return rsp;
    };
  },
  put: function(body) {
    return async (dispatch, getState) => {
      const state = getState();
      const { token } = state.authentication;
      await fetch(token, '/account/settings', { method: 'PUT', body });
    };
  },
};*/
