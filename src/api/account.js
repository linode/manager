import { fetch } from '~/fetch';

function profileAction(action, body, handleRsp) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const rsp = await fetch(token, `/account/profile/${action}`, { method: 'POST', body });
    await new Promise(resolve => setTimeout(resolve, 0));
    if (handleRsp) {
      dispatch(handleRsp(await rsp.json()));
    }
  };
}

export function profilePassword(config = null) {
  return profileAction('password', JSON.stringify(config));
}
